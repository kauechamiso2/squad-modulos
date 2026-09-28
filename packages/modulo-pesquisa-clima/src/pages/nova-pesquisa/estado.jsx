import { createContext, useContext, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { gerarPerguntas } from './bancoDePerguntas.js'
import { ABERTURA_TEMPLATE, ABERTURA_BRANCO } from './perguntasExemplo.js'
import { formatarLongo, somarDias, REGRA_PADRAO } from '../../lib/datas.js'
import {
  criarRascunho,
  gravar,
  guardar,
  ler,
  erroDeLeitura,
  atualizarGuardadas,
} from '../../lib/pesquisas.js'
import iguais from '../../lib/iguais.js'
import ModalSairDoFluxo from './ModalSairDoFluxo.jsx'
import TelaRascunhoSumido from './TelaRascunhoSumido.jsx'
import TelaDadosIlegiveis from '../../components/TelaDadosIlegiveis.jsx'
import { CAPA_PADRAO } from '../../lib/capa.js'
import { MODULE_BASE } from '../../routes.js'

/*
 * Estado do fluxo "Nova Pesquisa".
 *
 * Vive num layout de rota que envolve as telas, e não em cada uma: assim ele
 * sobrevive à navegação entre os passos e some quando o fluxo é abandonado.
 *
 * "Toda empresa" e os grupos são seleções independentes — dá para marcar os
 * dois. Quando isso acontece, o rótulo mostra "Toda a empresa", que é o
 * conjunto maior.
 */

/* Uma semana de antecedência: prazo para revisar e avisar o time antes de a
   pesquisa sair. */
const DIAS_ATE_O_ENVIO = 7

export const MENSAGEM_FINAL_PADRAO =
  'Obrigado por dedicar esses minutos pra compartilhar sua visão. Cada resposta ajuda o time de design a crescer e trabalhar melhor, juntos. Até a próxima pesquisa.'

/*
 * Configuração do último passo. Os padrões são o que o Figma desenha na tela
 * estática.
 *
 * `envio` e `prazo` guardam data e hora como texto solto porque os campos são
 * de texto livre — não há date picker ainda.
 *
 * É função, e não constante, por causa das datas: a do Figma era fixa e já
 * tinha vencido, o que fazia toda pesquisa nova nascer com o envio no
 * passado. Calculadas na hora em que o fluxo começa, e não na carga do
 * módulo, para que uma aba deixada aberta a noite toda não ofereça ontem.
 */
export function configuracaoInicial(hoje = new Date()) {
  const envio = somarDias(hoje, DIAS_ATE_O_ENVIO)
  return {
    respostasAnonimas: true,
    envio: { data: formatarLongo(envio), hora: '10:30', imediato: false },
    recorrencia: 'Recorrente',
    frequencia: 'Mensal',
    // tipo: 'periodo' usa `periodo`; 'data' usa `data` e `hora`.
    prazo: {
      tipo: 'periodo',
      periodo: '1 semana',
      // Só aparece se o usuário trocar para data específica. Uma semana
      // depois do envio, que é o mesmo que o período padrão ao lado.
      data: formatarLongo(somarDias(envio, 7)),
      hora: '10:30',
    },
    /* Sem data de encerramento: a recorrente repete indefinidamente até
       alguém estipular um fim. É a única forma de ela chegar a "Encerrada".

       O campo continua aqui sem tela que o edite: a linha "Data de
       Encerramento" saiu do desenho, mas o motor de status ainda lê este
       valor, e tirá-lo faria as pesquisas já guardadas mudarem de
       comportamento sem que ninguém tivesse mexido nelas. */
    encerramento: { data: '', hora: '18:00', semData: true },
    /* Quantas voltas a recorrente dá, e por que regra a data de cada uma é
       calculada. Não confundir com `pesquisa.ciclos`, que é a contagem das
       voltas já cumpridas: este é o combinado, aquele é o placar. */
    ciclos: { tipo: 'indefinido', quantidade: 5, regra: REGRA_PADRAO },
    mensagemFinal: MENSAGEM_FINAL_PADRAO,
  }
}

const estadoInicial = () => ({
  nome: '',
  // Começa em "Toda a empresa" porque é o que a tela 1 do Figma mostra. Se o
  // usuário desmarcar tudo no modal, o Continuar volta a travar.
  participantes: { todaEmpresa: true, grupos: [], pessoas: [] },
  template: null,
  // Quantidade escolhida na tela 5; a lista gerada mora em `perguntas`.
  quantidade: 10,
  prompt: '',
  perguntas: [],
  // Parágrafo do card de Abertura. Fica no estado, e não como constante da
  // tela, porque agora é editável.
  abertura: ABERTURA_TEMPLATE,
  // A faixa da Revisão nasce com o gradiente do Figma e é editável ali
  // mesmo, pelo botão "Editar Capa".
  capa: CAPA_PADRAO,
  configuracao: configuracaoInicial(),
})

/*
 * O caminho de volta: um rascunho guardado vira o estado do fluxo outra vez.
 *
 * Só os campos do fluxo entram — status, ciclos e taxa são da pesquisa
 * guardada, não do que se está montando. O que faltar cai no inicial, que é o
 * caso de um rascunho gravado antes de o campo existir.
 */
export function doRascunho(guardada) {
  const inicial = estadoInicial()
  return {
    nome: guardada.nome ?? inicial.nome,
    participantes: guardada.participantes ?? inicial.participantes,
    template: guardada.template ?? inicial.template,
    quantidade: guardada.quantidade ?? inicial.quantidade,
    prompt: guardada.prompt ?? inicial.prompt,
    perguntas: guardada.perguntas ?? inicial.perguntas,
    abertura: guardada.abertura ?? inicial.abertura,
    capa: guardada.capa ?? inicial.capa,
    configuracao: guardada.configuracao ?? inicial.configuracao,
  }
}

/*
 * Os passos que o fluxo tem, na ordem. Serve para ler de volta em qual deles
 * a pessoa estava: o índice é o último pedaço do caminho, e não tem nome.
 */
export const PASSOS = [
  'nome',
  'perguntas',
  'prompt',
  'carregando',
  'revisao',
  'configuracao',
]

/* O passo de um caminho do fluxo. Vazio na escolha de template, que é a rota
   índice — e que, por não guardar rascunho, nunca chega a ser gravada. */
export function passoDaRota(caminho) {
  const ultimo = caminho.split('/').filter(Boolean).pop()
  return PASSOS.includes(ultimo) ? ultimo : ''
}

export const GRUPOS = ['Atendimento', 'Vendas', 'Design']

/* Diretório de pessoas — fixo, do tamanho de um exemplo. A busca do modal de
   participantes procura tanto pelo nome quanto pelo e-mail inteiro. */
export const PESSOAS = [
  'ana.ribeiro@exemplo.com',
  'carlos.mendes@exemplo.com',
  'marina.duarte@exemplo.com',
]

/* "ana.ribeiro@exemplo.com" -> "Ana Ribeiro". */
export function nomeDaPessoa(email) {
  return (email.split('@')[0] || '')
    .split('.')
    .filter(Boolean)
    .map((parte) => parte[0].toUpperCase() + parte.slice(1))
    .join(' ')
}

/* Reexportadas de onde a geração acontece — as telas continuam importando
   daqui, e a faixa tem um dono só. */
export { PERGUNTAS_MIN, PERGUNTAS_MAX } from './bancoDePerguntas.js'

/* 45 segundos por pergunta, arredondando para o minuto mais próximo. O .5
   sobe: 10 perguntas dão 7,5 minutos e viram 8. Nunca chega a zero, porque
   já a primeira pergunta arredonda 0,75 para 1. */
const SEGUNDOS_POR_PERGUNTA = 45

export function minutosEstimados(perguntas) {
  return Math.round((perguntas * SEGUNDOS_POR_PERGUNTA) / 60)
}

/* Os textos de exemplo da tela 6, um por template. */
const PROMPTS = {
  clima: (p) =>
    `Medir satisfação, carga de trabalho e clima de ${p}, incluindo percepção sobre prazos, colaboração e reconhecimento.`,
  feedback: (p) =>
    `Coletar feedback de ${p} sobre um evento, entrega ou período recente.`,
  solicitacao: (p) =>
    `Levantar solicitações e necessidades de ${p} em relação a processos ou recursos internos.`,
  desligamento: (p) =>
    `Entender os motivos de saída e a experiência de ${p} durante sua passagem pela empresa.`,
}

export function temParticipantes({ todaEmpresa, grupos, pessoas = [] }) {
  return todaEmpresa || grupos.length > 0 || pessoas.length > 0
}

/*
 * Como a seleção é escrita numa linha só. Grupos e pessoas podem estar
 * marcados juntos, então quando há dos dois o rótulo conta os dois.
 */
function descrever({ todaEmpresa, grupos = [], pessoas = [] }, empresa) {
  if (todaEmpresa) return empresa
  const partes = []
  if (grupos.length === 1) partes.push(grupos[0])
  else if (grupos.length > 1) partes.push(`${grupos.length} grupos`)
  if (pessoas.length === 1) partes.push(nomeDaPessoa(pessoas[0]))
  else if (pessoas.length > 1) partes.push(`${pessoas.length} pessoas`)
  return partes.join(' e ')
}

/* Rótulo da linha da tela 1: começa com maiúscula. */
export function rotuloParticipantes(selecao) {
  return descrever(selecao || {}, 'Toda a empresa')
}

/* Mesma seleção, mas no meio de uma frase — daí o minúsculo. */
export function fraseParticipantes(selecao) {
  return descrever(selecao || {}, 'toda a empresa')
}

export function montarPrompt(template, participantes) {
  const construir = PROMPTS[template]
  return construir ? construir(fraseParticipantes(participantes)) : ''
}

/*
 * A mensagem final sugerida, um texto por template.
 *
 * Mesma ideia do prompt: o projeto não chama modelo nenhum, e o que a tela
 * chama de sugestão é este texto montado com o que já se sabe da pesquisa —
 * o template escolhido e quem vai responder. Fica editável no modal, e daí em
 * diante o que vale é o que a pessoa escreveu.
 *
 * O caminho em branco não tem template, e por isso cai na genérica: ela serve
 * a qualquer pesquisa, ao contrário do prompt, que sem template não tem o que
 * dizer e fica vazio.
 */
const generica = (p) =>
  `Obrigado por dedicar esses minutos pra compartilhar sua visão. Cada resposta ajuda ${p} a crescer e trabalhar melhor, juntos. Até a próxima pesquisa.`

const MENSAGENS = {
  clima: generica,
  feedback: (p) =>
    `Obrigado pelo seu feedback. O que você contou aqui ajuda ${p} a ajustar o que não está funcionando e a repetir o que está. Até a próxima.`,
  solicitacao: (p) =>
    `Obrigado por registrar sua solicitação. Ela entra na fila junto com as de ${p}, e você fica sabendo assim que houver uma resposta.`,
  desligamento: (p) =>
    `Obrigado por dedicar esses minutos numa hora de despedida. O que você contou fica com ${p} e ajuda quem continua. Desejamos tudo de bom no que vem agora.`,
}

export function montarMensagemFinal(template, participantes) {
  const construir = MENSAGENS[template] ?? generica
  return construir(fraseParticipantes(participantes))
}

/*
 * A mensagem final segue o template e o público, como o prompt — e pela mesma
 * regra: só é refeita enquanto for a que o projeto sugeriu. Editada no modal,
 * ela fica; reescrever por cima apagaria o que a pessoa escreveu.
 *
 * A comparação é contra a sugestão do par anterior, e não contra a nova: é
 * assim que dá para saber se o texto que está lá saiu daqui ou de alguém.
 */
function comMensagemSugerida(pesquisa, template, participantes) {
  const configuracao = pesquisa.configuracao
  const anterior = montarMensagemFinal(pesquisa.template, pesquisa.participantes)
  const intacta =
    !configuracao?.mensagemFinal ||
    configuracao.mensagemFinal === anterior ||
    configuracao.mensagemFinal === MENSAGEM_FINAL_PADRAO
  if (!intacta) return configuracao
  return {
    ...configuracao,
    mensagemFinal: montarMensagemFinal(template, participantes),
  }
}

const Contexto = createContext(null)

export function usePesquisa() {
  const valor = useContext(Contexto)
  if (!valor) {
    throw new Error('usePesquisa precisa estar dentro de PesquisaProvider')
  }
  return valor
}

export default function PesquisaProvider() {
  const navigate = useNavigate()
  /* Com id na rota o fluxo está retomando um rascunho; sem id, começando do
     zero. É a única diferença entre os dois — daí a mesma moldura servir
     para /pesquisas/nova e /rascunhos/:id. */
  const { id: idDoRascunho } = useParams()
  const { pathname } = useLocation()
  /* Rascunho que não existe mais: apagado, link velho, id digitado errado.
     Abrir o fluxo em branco fazia o passo seguinte criar uma pesquisa nova
     sem ninguém pedir — quem clicou queria continuar uma que já existia. */
  /* Não conseguir ler não é o rascunho não existir: são duas telas
     diferentes, porque dizer "não encontrado" com o armazenamento ilegível
     sugere que ele foi apagado, e nada foi. */
  const [leitura] = useState(() => {
    if (!idDoRascunho) return { falha: null, sumiu: false }
    const achou = ler().some((p) => p.id === idDoRascunho)
    const falha = erroDeLeitura()
    return { falha, sumiu: !falha && !achou }
  })

  const [pesquisa, setPesquisa] = useState(() => {
    if (!idDoRascunho) return estadoInicial()
    const guardada = ler().find((p) => p.id === idDoRascunho)
    return guardada ? doRascunho(guardada) : estadoInicial()
  })
  /* Como o fluxo estava ao abrir. É contra isto que se decide se há algo a
     perder: o estado inicial em branco de uma pesquisa nova, ou o rascunho
     como foi retomado. Guardado uma vez, no primeiro render — refazer o
     estado inicial na hora de comparar daria outras datas de envio. */
  const [original] = useState(pesquisa)
  /* O X de qualquer tela do fluxo pergunta antes de sair. A pergunta mora
     aqui, e não em cada tela, porque a resposta é a mesma nas seis e o que
     ela guarda é este estado. */
  const [saindo, setSaindo] = useState(false)
  const [erroAoSalvar, setErroAoSalvar] = useState('')

  const valor = useMemo(() => {
    const definir = (campos) => setPesquisa((atual) => ({ ...atual, ...campos }))

    return {
      pesquisa,
      definir,
      /* Quem está sendo retomado, para o salvar gravar por cima em vez de
         criar uma segunda linha. Vazio quando a pesquisa é nova. */
      idDoRascunho,
      /*
       * O que o X e o Voltar das telas chamam. Salvar acontece na
       * confirmação.
       *
       * Só pergunta se houver algo a perder. Num formulário recém-aberto,
       * onde nada foi digitado, a pergunta não tinha resposta boa: descartar
       * o nada, ou salvar um rascunho "Pesquisa sem nome" com zero
       * perguntas, que só sujava a lista. Sem alteração nenhuma, sair é sair.
       */
      sair: () => {
        if (iguais(pesquisa, original)) navigate(MODULE_BASE)
        else setSaindo(true)
      },
      /* O prompt é montado aqui, na escolha do template, e não na tela 6:
         assim o texto é gerado uma vez e as edições do usuário sobrevivem a
         ir e voltar entre os passos. */
      escolherTemplate: (template) =>
        definir({
          template,
          prompt: montarPrompt(template, pesquisa.participantes),
          perguntas: [],
          abertura:
            template === 'blank' ? ABERTURA_BRANCO : ABERTURA_TEMPLATE,
          configuracao: comMensagemSugerida(
            pesquisa,
            template,
            pesquisa.participantes,
          ),
        }),

      /*
       * Trocar o público refaz o prompt, porque ele nomeia esse público —
       * "clima de toda a empresa", "clima do time de Design".
       *
       * Com o template escolhido antes do nome, o prompt montado ali nasce
       * falando de "toda a empresa", que é o padrão da tela seguinte. Sem
       * isto ele continuaria dizendo isso mesmo depois de a pessoa escolher
       * um grupo, e a geração das perguntas seguiria o texto errado.
       *
       * Só refaz o que ninguém escreveu: se o texto não é mais o que o
       * projeto montou — porque foi editado na tela de prompt —, ele fica
       * como está. Reescrever por cima apagaria o que a pessoa digitou.
       */
      definirParticipantes: (participantes) => {
        const automatico = montarPrompt(pesquisa.template, pesquisa.participantes)
        const intacto = pesquisa.prompt === '' || pesquisa.prompt === automatico
        definir({
          participantes,
          prompt: intacto
            ? montarPrompt(pesquisa.template, participantes)
            : pesquisa.prompt,
          configuracao: comMensagemSugerida(
            pesquisa,
            pesquisa.template,
            participantes,
          ),
        })
      },

      /*
       * Chamada pela tela de carregamento, no fim dos 3 segundos. Devolve
       * quantas perguntas saíram: template sem banco devolvia lista vazia e o
       * fluxo seguia para a revisão de uma pesquisa sem pergunta nenhuma,
       * como se fosse esse o resultado. Quem chama decide o que dizer.
       */
      gerar: () => {
        const geradas = gerarPerguntas(
          pesquisa.template,
          fraseParticipantes(pesquisa.participantes),
          pesquisa.quantidade,
        )
        definir({ perguntas: geradas })
        return geradas.length
      },

      /* Mescla um pedaço da configuração sem apagar o resto. */
      definirConfiguracao: (campos) =>
        definir({ configuracao: { ...pesquisa.configuracao, ...campos } }),

      removerPergunta: (id) =>
        definir({ perguntas: pesquisa.perguntas.filter((q) => q.id !== id) }),

      /* Serve para editar e para acrescentar: se o id já está na lista ele é
         substituído no lugar, senão entra no fim. */
      salvarPergunta: (pergunta) => {
        const existe = pesquisa.perguntas.some((q) => q.id === pergunta.id)
        definir({
          perguntas: existe
            ? pesquisa.perguntas.map((q) => (q.id === pergunta.id ? pergunta : q))
            : [...pesquisa.perguntas, pergunta],
        })
      },
    }
  }, [pesquisa, original, idDoRascunho, navigate])

  /* O rascunho não existe mais: a tela diz isso e oferece a volta, em vez de
     abrir o formulário em branco com cara de pesquisa nova — de onde o passo
     seguinte criaria uma pesquisa que ninguém pediu. */
  if (leitura.falha) return <TelaDadosIlegiveis motivo={leitura.falha} />
  if (leitura.sumiu) return <TelaRascunhoSumido />

  return (
    <Contexto.Provider value={valor}>
      <Outlet />

      {saindo ? (
        <ModalSairDoFluxo
          onCancelar={() => {
            setErroAoSalvar('')
            setSaindo(false)
          }}
          onDescartar={() => navigate(MODULE_BASE)}
          erro={erroAoSalvar}
          onSalvar={() => {
            /* Gravação que não passou não pode sair do fluxo como se tivesse
               passado: o rascunho não estaria na lista, e o que foi
               preenchido teria ido embora sem aviso. */
            const r = atualizarGuardadas((lista) =>
              guardar(
                lista,
                criarRascunho(pesquisa, new Date(), passoDaRota(pathname)),
                idDoRascunho,
              ),
            )
            if (r.ok) navigate(MODULE_BASE)
            else setErroAoSalvar(r.erro)
          }}
        />
      ) : null}
    </Contexto.Provider>
  )
}
