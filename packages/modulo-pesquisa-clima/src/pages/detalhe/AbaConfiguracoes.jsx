import { useCallback, useState } from 'react'
import s from './AbaConfiguracoes.module.css'
import Aviso from '../../components/Aviso.jsx'
import { Botao, IconeBotao, Interruptor, LinhaResumo, ModalConfirmar } from '@squad/ui'
import ModalCapa from '../../components/ModalCapa.jsx'
import ModalParticipantes from '../nova-pesquisa/ModalParticipantes.jsx'
import {
  ModalCiclos,
  ModalDataEnvio,
  ModalFrequencia,
  ModalMensagemFinal,
  ModalPrazo,
  textoDeCiclos,
} from '../nova-pesquisa/ModaisConfiguracao.jsx'
import { rotuloParticipantes } from '../nova-pesquisa/estado.jsx'
import { estiloDaCapa } from '../../lib/capa.js'
import { diasDoPrazo, formatarComDia, textoDeDataHora } from '../../lib/datas.js'
import { proximoEnvioDe } from '../../lib/geral.js'
import { daTabela } from '../../lib/desconhecido.js'
import {
  aceitandoRespostas,
  avaliar,
  avisoDeInicio,
  ehRecorrente,
  ehFinal,
  encerrarCiclo,
  estaPublicada,
  forcarInicio,
  despublicar,
  linkDaPesquisa,
  publicar,
} from '../../lib/pesquisas.js'
import { acertarPasso } from '../../lib/acertar.js'

import caretRight from '../../assets/icons/CaretRight.svg'
import link from '../../assets/icons/Link.svg'

/*
 * Aba "Configurações" do detalhe (Figma 8072:6532), ligada à pesquisa
 * guardada.
 *
 * Os dois primeiros interruptores não guardam booleanos: eles leem e escrevem
 * o `status`. Publicado é ter ciclo — agendada, rodando ou aguardando —, e
 * aceitar respostas é estar rodando. Guardar isso à parte criaria uma segunda
 * verdade que poderia discordar do selo da home.
 *
 * Por isso os dois pedem confirmação: cada um vira o status da pesquisa. O
 * texto do "Aceitando respostas" ligando é o mesmo do Play da home, porque a
 * ação é a mesma — força o início de um ciclo agora.
 *
 * O resto são campos da configuração, editados pelos mesmos modais do fluxo
 * de criação e gravados no mesmo lugar que ele grava.
 *
 * O Figma escreve "Apresentaçao" sem o til — aqui vai "Apresentação".
 */

/* A linha "Repetir" mostra a frequência com a frase do Figma, mas o valor
   guardado continua sendo o vocabulário do modal de Frequência: são as duas
   pontas da mesma escolha, e traduzir só na exibição evita duas listas. */
const REPETICAO = {
  Semanal: 'Toda semana',
  Mensal: 'Todo mês',
  'A cada três meses': 'A cada três meses',
  'A cada seis meses': 'A cada seis meses',
  Anual: 'Todo ano',
}

function textoDePrazo(prazo) {
  if (!prazo) return '—'
  if (prazo.tipo === 'data') return textoDeDataHora(prazo.data, prazo.hora)
  if (prazo.tipo === 'dias') {
    /* O número que o ciclo vai durar de verdade, e não o que está guardado:
       são o mesmo desde que o campo passou a validar, mas o que foi salvo
       antes disso pode estar fora da faixa. Mostrar um e usar outro era o
       defeito. */
    const dias = diasDoPrazo(prazo)
    if (dias === null) return '—'
    return `${dias} ${dias === 1 ? 'dia' : 'dias'}`
  }
  return prazo.periodo
}

/* Um cartão da coluna: título, as linhas e o que vier de rodapé (a pílula
   do primeiro cartão). O `items-center` do Figma é o que centra a pílula, e
   é por isso que o título precisa esticar sozinho. */
function Cartao({ titulo, rodape, children }) {
  return (
    <section className={s.cartao}>
      <p className={s.secao}>{titulo}</p>
      <div className={s.linhas}>{children}</div>
      {rodape}
    </section>
  )
}

function LinhaInterruptor({ rotulo, ligado, desabilitado = false, onAlternar }) {
  return (
    <LinhaResumo
      rotulo={rotulo}
      controle={
        <Interruptor
          ligado={ligado}
          desabilitado={desabilitado}
          rotulo={rotulo}
          onAlternar={onAlternar}
        />
      }
    />
  )
}

export default function AbaConfiguracoes({ pesquisa, onAlterar }) {
  const [modal, setModal] = useState(null)
  const [confirmacao, setConfirmacao] = useState(null)
  const [aviso, setAviso] = useState('')
  const limparAviso = useCallback(() => setAviso(''), [])
  const c = pesquisa.configuracao || {}
  /*
   * Única ou Recorrente é escolha da criação, e não muda mais depois.
   *
   * A linha "Repetir" chamava o modal de frequência, e escolher qualquer
   * intervalo ali marcava a pesquisa como recorrente — inclusive uma Única já
   * encerrada, que assim reabria os interruptores travados e ganhava a aba
   * Ciclos de volta. Era a porta dos fundos das travas todas.
   *
   * Uma pesquisa que já saiu do rascunho tem ciclos, histórico e respostas
   * contados segundo o tipo dela; virar o tipo no meio faria tudo isso passar
   * a significar outra coisa. Quem quer a mesma pesquisa repetindo duplica —
   * a cópia nasce rascunho, e no rascunho a escolha está aberta.
   */
  const recorrente = ehRecorrente(pesquisa)
  const publicada = estaPublicada(pesquisa)
  const aceitando = aceitandoRespostas(pesquisa)
  /* Uma Única que já encerrou acabou de vez: ela não tem próximo ciclo para
     onde voltar, então republicar ou reabrir respostas só produziria um
     estado sem sentido. Os dois interruptores travam e a nota manda duplicar,
     que é o caminho de mandar a mesma pesquisa outra vez. */
  const encerradaDeVez = ehFinal(pesquisa)

  const fechar = () => setModal(null)

  /* Grava um campo da configuração e fecha o modal — o mesmo par que a tela
     de Configuração do fluxo usa. */
  const salvarConfig = (campos) => {
    onAlterar((p) => ({ ...p, configuracao: { ...p.configuracao, ...campos } }))
    fechar()
  }

  const aoPublicar = () => {
    if (publicada) {
      setConfirmacao({
        titulo: 'Tirar do ar?',
        texto: `"${pesquisa.nome}" sai do ar e passa a "Não ativa". O link de resposta deixa de funcionar — quem abrir vê uma página de erro — e ela também para de aceitar respostas.`,
        rotulo: 'Tirar do ar',
        aoConfirmar: () => onAlterar((p) => acertarPasso(despublicar(p))),
      })
      return
    }
    setConfirmacao({
      titulo: 'Publicar de novo?',
      texto: `"${pesquisa.nome}" volta ao ar como "Ativa | Aguardando": o link funciona outra vez, mas ela ainda não recebe respostas. Para voltar a receber, ligue também "Aceitando respostas".`,
      rotulo: 'Publicar',
      aoConfirmar: () => onAlterar((p) => acertarPasso(publicar(p))),
    })
  }

  const aoAceitar = () => {
    if (aceitando) {
      setConfirmacao({
        titulo: 'Encerrar o ciclo?',
        texto: `O ciclo em curso de "${pesquisa.nome}" fecha agora e ela passa a "Ativa | Aguardando". A pesquisa continua no ar, mas para de receber respostas até o próximo ciclo.`,
        rotulo: 'Encerrar ciclo',
        aoConfirmar: () => onAlterar((p) => acertarPasso(encerrarCiclo(p))),
      })
      return
    }
    // Mesmo texto do Play da home: a ação é a mesma.
    setConfirmacao({
      ...avisoDeInicio(pesquisa),
      aoConfirmar: () => onAlterar((p) => acertarPasso(forcarInicio(p))),
    })
  }

  /*
   * Copia o link e abre a vista de quem responde numa aba nova: o botão
   * entrega o link para mandar para alguém e, de quebra, mostra como ela
   * ficou sem perder a tela de configuração. `noopener` porque a aba nova não
   * tem nada que fazer com esta.
   *
   * Abrir vem primeiro, e de propósito: depois de um `await` o clique deixa
   * de contar como gesto do usuário e o navegador barra a aba nova.
   */
  const aoCopiarEAbrir = async () => {
    const endereco = linkDaPesquisa(pesquisa)
    window.open(endereco, '_blank', 'noopener')
    try {
      await navigator.clipboard.writeText(endereco)
      setAviso('Link copiado')
    } catch {
      // Sem permissão de área de transferência (contexto inseguro, por ex.).
      setAviso('Não foi possível copiar o link')
    }
  }

  /* "Imediatamente" só faz sentido enquanto não há ciclo: com um em curso, o
     que importa é quando sai o próximo. */
  const textoDoEnvio = (() => {
    if (!publicada && c.envio?.imediato) return 'Imediatamente'
    const proximo = proximoEnvioDe(pesquisa)
    if (proximo) return formatarComDia(proximo)
    /* Sem data calculável. Um traço quando não há data marcada; quando há uma
       guardada e ela é que não se lê, é isso que a linha diz — senão a tela
       mostraria "sem data" para um campo preenchido. */
    return c.envio?.data ? textoDeDataHora(c.envio.data, c.envio.hora) : '—'
  })()

  return (
    <div className={s.coluna}>
      <Cartao
        titulo="Opções publicadas"
        rodape={
          <>
            {encerradaDeVez ? (
              <p className={s.nota}>
                {recorrente
                  ? 'Esta pesquisa chegou à data de encerramento — ela não volta a receber respostas. Para rodá-la de novo, duplique a pesquisa.'
                  : 'Esta pesquisa não se repete e já foi encerrada — ela não volta a receber respostas. Para enviá-la de novo, duplique a pesquisa.'}
              </p>
            ) : null}
            <Botao variante="contorno" onClick={aoCopiarEAbrir}>
              Copiar link da pesquisa
              <img
                className={s.iconeDoLink}
                src={link}
                alt=""
                width={24}
                height={24}
              />
            </Botao>
          </>
        }
      >
        <LinhaInterruptor
          rotulo="Publicar formulário"
          ligado={publicada}
          desabilitado={encerradaDeVez}
          onAlternar={aoPublicar}
        />
        {/* Fora do ar, aceitar respostas não quer dizer nada: o interruptor
            fica desligado e apagado até o formulário voltar. */}
        <LinhaInterruptor
          rotulo="Aceitando respostas"
          ligado={aceitando}
          desabilitado={!publicada || encerradaDeVez}
          onAlternar={aoAceitar}
        />
        <LinhaInterruptor
          rotulo="Respostas anônimas"
          ligado={Boolean(c.respostasAnonimas)}
          onAlternar={() =>
            onAlterar((p) => ({
              ...p,
              configuracao: {
                ...p.configuracao,
                respostasAnonimas: !p.configuracao?.respostasAnonimas,
              },
            }))
          }
        />
        <LinhaResumo
          rotulo="Participantes"
          valor={rotuloParticipantes(pesquisa.participantes || {})}
          onAbrir={() => setModal('participantes')}
        />
      </Cartao>

      <Cartao titulo="Datas">
        <LinhaResumo
          rotulo="Próximo envio"
          valor={textoDoEnvio}
          onAbrir={() => setModal('envio')}
        />
        {/* Recorrente escolhe de quanto em quanto tempo repete; Única não
            tem o que escolher aqui. A linha fica, para a pesquisa dizer o que
            ela é, mas travada — ver a explicação em `recorrente`. */}
        <LinhaResumo
          rotulo="Repetir"
          valor={
            recorrente
              ? (daTabela(REPETICAO, c.frequencia, 'frequência da recorrência') ??
                `Frequência desconhecida (${String(c.frequencia)})`)
              : 'Não repete'
          }
          travado={!recorrente}
          onAbrir={() => setModal('frequencia')}
        />
        {/* Quantas voltas ela ainda dá. Só recorrente tem essa pergunta: a
            Única acaba quando o prazo do seu único ciclo vence. */}
        {recorrente ? (
          <LinhaResumo
            rotulo="Número de ciclos"
            valor={textoDeCiclos(c.ciclos)}
            onAbrir={() => setModal('ciclos')}
          />
        ) : null}
        <LinhaResumo
          rotulo="Aceitar resposta"
          valor={textoDePrazo(c.prazo)}
          onAbrir={() => setModal('prazo')}
        />
      </Cartao>

      <Cartao titulo="Apresentação">
        {/* A capa não cabe em `valor`: no lugar do texto vai a amostra, e a
            seta continua sendo a do LinhaResumo. */}
        <LinhaResumo
          rotulo="Capa"
          controle={
            <div className={s.controleDaCapa}>
              {/* A amostra abre o mesmo modal que a seta: é o alvo mais
                  óbvio da linha, e clicar nela sem efeito frustrava. */}
              <button
                type="button"
                className={s.amostra}
                style={estiloDaCapa(pesquisa.capa)}
                aria-label="Editar capa"
                onClick={() => setModal('capa')}
              />
              <IconeBotao
                src={caretRight}
                rotulo="Abrir Capa"
                onClick={() => setModal('capa')}
              />
            </div>
          }
        />
        {/* Mesma linha da tela de Configuração do fluxo: o texto é longo, então
            vai cortado com reticências e abre o mesmo editor. */}
        <LinhaResumo
          rotulo="Mensagem final"
          valor={c.mensagemFinal}
          cortar
          onAbrir={() => setModal('mensagem')}
        />
      </Cartao>

      {modal === 'participantes' ? (
        <ModalParticipantes
          selecao={pesquisa.participantes}
          /* Trocar o público troca o denominador de tudo: a taxa do ciclo em
             curso e a de cada ciclo do histórico contam sobre ele. Por isso
             acerta o passo na mesma gravação, como as viradas de status —
             senão a aba Ciclos ficaria até 30s contando sobre o público
             velho. */
          onSalvar={(participantes) => {
            onAlterar((p) => acertarPasso({ ...p, participantes }))
            fechar()
          }}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'envio' ? (
        <ModalDataEnvio
          valor={c.envio}
          onSalvar={(envio) => salvarConfig({ envio })}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'frequencia' ? (
        /* Só chega aqui uma recorrente, e o modal muda o intervalo dela — o
           tipo não entra na gravação. */
        <ModalFrequencia
          valor={c.frequencia}
          onSalvar={(frequencia) => salvarConfig({ frequencia })}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'ciclos' ? (
        <ModalCiclos
          valor={c.ciclos}
          envio={c.envio}
          frequencia={c.frequencia}
          /* Acerta o passo junto: baixar o número para o que já foi cumprido
             encerra a pesquisa agora, e esperar o próximo giro do motor
             deixaria o selo mentindo por até 30s. */
          onSalvar={(ciclos) => {
            onAlterar((p) =>
              acertarPasso(
                avaliar({ ...p, configuracao: { ...p.configuracao, ciclos } }),
              ),
            )
            fechar()
          }}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'prazo' ? (
        <ModalPrazo
          valor={c.prazo}
          onSalvar={(prazo) => salvarConfig({ prazo })}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'mensagem' ? (
        <ModalMensagemFinal
          valor={c.mensagemFinal}
          onSalvar={(mensagemFinal) => salvarConfig({ mensagemFinal })}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'capa' ? (
        <ModalCapa
          valor={pesquisa.capa}
          onSalvar={(capa) => {
            onAlterar((p) => ({ ...p, capa }))
            fechar()
          }}
          onFechar={fechar}
        />
      ) : null}

      <Aviso texto={aviso} onSumir={limparAviso} />

      {confirmacao ? (
        <ModalConfirmar
          titulo={confirmacao.titulo}
          texto={confirmacao.texto}
          rotuloConfirmar={confirmacao.rotulo}
          onConfirmar={() => {
            confirmacao.aoConfirmar()
            setConfirmacao(null)
          }}
          onCancelar={() => setConfirmacao(null)}
        />
      ) : null}
    </div>
  )
}
