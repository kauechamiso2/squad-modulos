import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import {
  aceitaResposta,
  avaliarLista,
  erroDeLeitura,
  ler,
  trocarGuardada,
} from '../../lib/pesquisas.js'
import { adicionarResposta, materializar } from '../../lib/respostas.js'
import { sincronizarHistorico } from '../../lib/historico.js'
import { ehObrigatoria } from '../../lib/obrigatorias.js'
import { respostaENegativa, gerarPerguntaExtra } from '../../lib/perguntaExtra.js'
import TelaNaoEncontrada from './TelaNaoEncontrada.jsx'
import TelaForaDoAr from './TelaForaDoAr.jsx'
import { MODULE_BASE } from '../../routes.js'

/*
 * O estado de uma sessão de resposta.
 *
 * Vive na rota-mãe de /responder/:id, como o provider do fluxo de criação:
 * nasce ao abrir o link e morre ao sair. É o que faz "Voltar" não perder o
 * que já foi respondido.
 *
 * A pesquisa é lida uma vez, no começo: quem está respondendo não deve ver o
 * questionário mudar debaixo do dedo se alguém editar do outro lado. Na hora
 * de enviar, aí sim, o que está guardado é lido de novo — é nele que a
 * resposta entra.
 */
const Contexto = createContext(null)

/* Vazio é vazio: 0 e uma lista com um item marcado contam como resposta; ''
   e uma lista vazia, não. */
export function temResposta(valor) {
  if (valor === undefined || valor === null) return false
  if (Array.isArray(valor)) return valor.length > 0
  if (typeof valor === 'string') return valor.trim().length > 0
  return true
}

export default function RespostaProvider() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [sessao] = useState(() => {
    /* Materializa na leitura: quem abre o link direto pode nunca ter passado
       por uma tela que grave, e sem isso uma pesquisa guardada antes de a
       lista de respostas existir pareceria vazia para o portão do "fora do
       ar". */
    const guardada = materializar(ler().find((p) => p.id === id))
    /* Sem pesquisa com esse id, a tela diz isso. Antes ela desenhava o
       exemplo do Figma como se fosse uma pesquisa de verdade: a pessoa
       respondia tudo, via o agradecimento e as respostas não iam a lugar
       nenhum, porque não havia onde gravar.
       Não conseguir ler é outra coisa, e tem outra tela: a pesquisa pode
       existir e o link estar certo. */
    return { pesquisa: guardada ?? null, falha: erroDeLeitura() }
  })
  /* A ordem desta sessão: a mesma em que as perguntas foram montadas.
     Havia um embaralhamento opcional aqui, do modal de avançadas; ele saiu
     junto com o modal, e a ordem passou a ser uma só. Continua fixada no
     começo da sessão para que uma edição do outro lado não reordene o
     questionário debaixo de quem está respondendo. */
  const [ordem] = useState(() => (sessao.pesquisa?.perguntas || []).map((q) => q.id))
  const [valores, setValores] = useState({})
  /* Envio que não conseguiu gravar. A tela de agradecimento não pode aparecer
     em cima de uma resposta que se perdeu. */
  const [falhouAoEnviar, setFalhouAoEnviar] = useState(false)
  /* Se esta sessão chegou a enviar alguma coisa. A tela de agradecimento
     depende disto: ela afirma que a resposta foi enviada, e afirmar isso
     porque a URL diz `/fim` não é saber que foi. */
  const [enviou, setEnviou] = useState(false)

  const pesquisa = sessao.pesquisa

  /*
   * As perguntas na ordem desta sessão, com as extras condicionais já
   * intercaladas — "Gerar pergunta extra quando a resposta for negativa"
   * (lib/perguntaExtra.js). Uma pergunta apagada da pesquisa depois do
   * começo dela simplesmente não aparece.
   *
   * Recalculada a cada resposta, e não só uma vez no começo: é o que faz uma
   * extra aparecer assim que a resposta que a dispara é dada, e sumir de
   * volta se a pessoa voltar e trocar a resposta por uma que não dispara
   * mais nenhuma. O total de passos — e a barra de progresso, que é
   * `perguntas.length` — anda junto.
   */
  const perguntas = useMemo(() => {
    const base = ordem
      .map((idPergunta) => (pesquisa?.perguntas || []).find((q) => q.id === idPergunta))
      .filter(Boolean)
    const sequencia = []
    for (const pergunta of base) {
      sequencia.push(pergunta)
      const valor = valores[pergunta.id]
      if (respostaENegativa(pergunta, valor)) {
        sequencia.push(gerarPerguntaExtra(pergunta, valor))
      }
    }
    return sequencia
  }, [ordem, pesquisa, valores])

  const responder = useCallback(
    (idPergunta, valor) => setValores((v) => ({ ...v, [idPergunta]: valor })),
    [],
  )

  /*
   * Envia. Lê o que está guardado agora — e não o retrato do começo da
   * sessão — porque entre abrir o link e clicar em Finalizar o motor pode ter
   * andado. Passa pelo motor e pela sincronização antes de acrescentar, que é
   * o que faz esta resposta somar à simulação em vez de concorrer com ela.
   */
  const enviar = useCallback(() => {
    const { lista } = avaliarLista(ler())
    /* Sumiu entre abrir o link e enviar, ou o armazenamento ficou ilegível:
       a resposta não tem onde entrar, e dizer obrigado seria dizer que ela
       foi guardada. */
    if (erroDeLeitura() || !lista.some((p) => p.id === id)) {
      setFalhouAoEnviar(true)
      return
    }
    /* Só o que ainda está na sequência de agora: uma extra que apareceu e
       depois sumiu — a pessoa voltou e trocou a resposta que a disparava —
       deixa a chave para trás em `valores`, e ela não deveria ir para o
       registro como se tivesse sido perguntada. */
    const idsAtuais = new Set(perguntas.map((q) => q.id))
    const valoresAtuais = Object.fromEntries(
      Object.entries(valores).filter(([idPergunta]) => idsAtuais.has(idPergunta)),
    )
    const extras = perguntas
      .filter((q) => q.extra)
      .map(({ id: idExtra, tipo, enunciado, origemId }) => ({
        id: idExtra,
        tipo,
        enunciado,
        origemId,
      }))
    /* A resposta entra na lista de agora: o motor pode ter andado, e outra
       aba pode ter mexido no resto — só esta pesquisa é reescrita. */
    const r = trocarGuardada(id, (p) => ({
      ...sincronizarHistorico(adicionarResposta(p, valoresAtuais, extras)),
      atualizadoEm: new Date().toISOString(),
    }))
    if (!r.ok) {
      setFalhouAoEnviar(true)
      return
    }
    setEnviou(true)
    navigate(`${MODULE_BASE}/responder/${id}/fim`)
  }, [id, navigate, valores, perguntas])

  const valor = useMemo(
    () => ({
      pesquisa,
      perguntas,
      valores,
      responder,
      enviar,
      enviou,
      obrigatoria: ehObrigatoria,
    }),
    [pesquisa, perguntas, valores, responder, enviar, enviou],
  )

  /* Sem poder responder — fora do ar, encerrada ou já com todo mundo
     respondido —, nenhuma das três telas abre: o link inteiro para. Vale o
     retrato do começo da sessão, como o resto, então quem já estava
     respondendo termina. */
  const foraDoAr = pesquisa && !aceitaResposta(pesquisa)

  if (sessao.falha) return <TelaNaoEncontrada motivo="dados" />
  if (!pesquisa) return <TelaNaoEncontrada />
  if (falhouAoEnviar) return <TelaNaoEncontrada motivo="envio" />

  return (
    <Contexto.Provider value={valor}>
      {foraDoAr ? <TelaForaDoAr pesquisa={pesquisa} /> : <Outlet />}
    </Contexto.Provider>
  )
}

export function useResposta() {
  return useContext(Contexto)
}
