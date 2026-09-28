import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { IconeBotao, ModalConfirmar, useModal } from '@squad/ui'
import Aviso from '../../components/Aviso.jsx'
import TelaDadosIlegiveis from '../../components/TelaDadosIlegiveis.jsx'
import Rosca from '../../components/detalhe/Rosca.jsx'
import GraficoBarras from '../../components/detalhe/GraficoBarras.jsx'
import {
  PorPergunta,
  Individual,
} from '../../components/respostas/LeituraDeRespostas.jsx'
import ListaDePerguntas from '../../components/perguntas/ListaDePerguntas.jsx'
import {
  ler,
  erroDeLeitura,
  trocarGuardada,
  ERRO_AO_GRAVAR,
} from '../../lib/pesquisas.js'
import { sincronizarHistorico } from '../../lib/historico.js'
import { paraCsv, nomeDeArquivo, gerarEBaixar } from '../../lib/respostas.js'
import {
  cicloDe,
  limparRespostasDoCiclo,
  distribuicaoDe,
  ehDeEscolha,
  trechosDe,
  resumoDaPergunta,
  LIMITE_TRECHOS,
} from '../../lib/ciclo.js'
import s from './TelaCiclo.module.css'

import close from '../../assets/icons/Close.svg'
import caretRight from '../../assets/icons/CaretRight.svg'
import more from '../../assets/icons/More.svg'
import downloadSimple from '../../assets/icons/DownloadSimple.svg'
import trash from '../../assets/icons/Trash.svg'
import eye from '../../assets/icons/Eye.svg'
import { MODULE_BASE } from '../../routes.js'

/*
 * Detalhe de um ciclo encerrado (Figma 8115:9814, 8115:9995 e 8115:10143).
 *
 * Tudo vem do ciclo guardado em `historico`: as perguntas como estavam
 * naquele momento e as respostas dele. Editar a pesquisa hoje não mexe no que
 * foi perguntado há três meses, e apagar as respostas de um ciclo dura.
 *
 * A seta de voltar é o CaretRight girado meia volta — o mesmo desenho que o
 * arquivo usa como CaretLeft, que o projeto não tem separado.
 */
const SUBABAS = ['Geral', 'Por pergunta', 'Individual']

/* Uma pergunta na leitura Geral: gráfico quando é de escolha, resumo do Pipo
   mais os trechos quando é aberta. */
function CartaoDaPergunta({ pesquisa, ciclo, pergunta, respostas }) {
  const [expandido, setExpandido] = useState(false)
  const deEscolha = ehDeEscolha(pergunta)
  const trechos = deEscolha ? [] : trechosDe(pergunta, respostas)
  const visiveis = expandido ? trechos : trechos.slice(0, LIMITE_TRECHOS)

  return (
    <section className={s.cartao}>
      <div className={s.topoCartao}>
        <p className={s.enunciado}>{pergunta.enunciado}</p>
      </div>

      {deEscolha ? (
        <GraficoBarras fatias={distribuicaoDe(pergunta, respostas)} />
      ) : (
        <>
          <div className={s.pipo}>
            <p>Resumo do Pipo</p>
            <p className={s.resumo}>
              {resumoDaPergunta(pesquisa, ciclo, pergunta)}
            </p>
          </div>

          <div className={s.trechos}>
            {visiveis.map((texto, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <p key={i} className={s.trecho}>
                {texto}
              </p>
            ))}
            {trechos.length > LIMITE_TRECHOS ? (
              <button
                type="button"
                className={s.verMais}
                aria-expanded={expandido}
                onClick={() => setExpandido((aberto) => !aberto)}
              >
                {expandido
                  ? 'Ver menos'
                  : `Ver mais (${trechos.length - LIMITE_TRECHOS})`}
              </button>
            ) : null}
          </div>
        </>
      )}
    </section>
  )
}

/*
 * As perguntas como foram feitas naquele ciclo. Sem editar nem excluir: é
 * histórico.
 *
 * Está aqui como componente, e não solto no meio do render, porque o gancho
 * de foco dos modais precisa de um componente que monte e desmonte junto com
 * o modal.
 */
function FolhaDePerguntas({ numero, nome, abertura, perguntas, onFechar }) {
  const caixa = useModal(onFechar)

  return (
    <div className={s.scrim}>
      <div
        className={s.folha}
        ref={caixa}
        role="dialog"
        aria-label={`Perguntas do ciclo ${numero}`}
      >
        <header className={s.cabecalhoFolha}>
          <p className={s.tituloFolha}>Perguntas do ciclo {numero}</p>
          <IconeBotao src={close} rotulo="Fechar" onClick={onFechar} />
        </header>
        <div className={s.corpoFolha}>
          <ListaDePerguntas
            nome={nome}
            abertura={abertura}
            perguntas={perguntas}
            somenteLeitura
          />
        </div>
      </div>
    </div>
  )
}

export default function TelaCiclo() {
  const { id, cicloId } = useParams()
  const navigate = useNavigate()
  const [pesquisas, setPesquisas] = useState(null)
  const [subaba, setSubaba] = useState(SUBABAS[0])
  const [menuAberto, setMenuAberto] = useState(false)
  const [aviso, setAviso] = useState('')
  const limparAviso = useCallback(() => setAviso(''), [])
  const [vendoPerguntas, setVendoPerguntas] = useState(false)
  const [confirmacao, setConfirmacao] = useState(null)
  const [falhaDeLeitura, setFalhaDeLeitura] = useState(null)
  const [sumiu, setSumiu] = useState(null)
  const envoltorioMenu = useRef(null)

  /* Sincroniza o histórico ao entrar, como o detalhe faz: quem chega direto
     por link precisa do ciclo guardado tanto quanto quem veio da tabela. */
  useEffect(() => {
    const lista = ler()
    setFalhaDeLeitura(erroDeLeitura())
    const antes = lista.find((x) => x.id === id)
    const depois = antes && sincronizarHistorico(antes)
    if (depois && depois !== antes) {
      const r = trocarGuardada(id, () => depois)
      if (r.ok) setPesquisas(r.lista)
      else setAviso(r.erro)
      return
    }
    setPesquisas(lista)
  }, [id])

  /* Relê antes de mudar, como a home e o detalhe: só esta pesquisa é
     reescrita, e o que outra aba mexeu no resto da lista continua lá. */
  const alterar = (transformar) => {
    const r = trocarGuardada(id, (x) => ({
      ...transformar(x),
      atualizadoEm: new Date().toISOString(),
    }))
    if (r.ok) setPesquisas(r.lista)
    else if (r.sumiu) setSumiu(r.erro)
    else setAviso(r.erro)
  }

  useEffect(() => {
    if (!menuAberto) return undefined
    const aoClicar = (e) => {
      if (!envoltorioMenu.current?.contains(e.target)) setMenuAberto(false)
    }
    document.addEventListener('mousedown', aoClicar)
    return () => document.removeEventListener('mousedown', aoClicar)
  }, [menuAberto])

  const pesquisa = pesquisas?.find((p) => p.id === id)
  const ciclo = pesquisa && cicloDe(pesquisa, cicloId)

  /* Pesquisa apagada, ou um ciclo que não existe: volta para os Ciclos em
     vez de mostrar uma tela sem conteúdo. */
  useEffect(() => {
    if (!pesquisas) return
    if (falhaDeLeitura || sumiu) return
    if (!pesquisa) navigate(MODULE_BASE, { replace: true })
    else if (!ciclo) navigate(`${MODULE_BASE}/pesquisas/${id}`, { replace: true })
  }, [pesquisas, pesquisa, ciclo, id, falhaDeLeitura, sumiu, navigate])

  if (falhaDeLeitura) return <TelaDadosIlegiveis motivo={falhaDeLeitura} />
  if (!pesquisa || !ciclo) return null

  /* As perguntas são as do ciclo, não as de hoje. */
  const perguntas = ciclo.perguntas || []
  const respostas = ciclo.respostas || []
  /* Voltar cai na aba de onde a pessoa veio. A aba não está na URL de
     propósito, então vai pelo state da navegação — num F5 o detalhe volta a
     abrir no Geral, como sempre. */
  const voltar = () =>
    navigate(`${MODULE_BASE}/pesquisas/${id}`, { state: { aba: 'Ciclos' } })

  const baixarRespostas = () => {
    setMenuAberto(false)
    /* Falhar calado não serve: sem o aviso, o menu fechava e nada baixava. */
    const deu = gerarEBaixar(nomeDeArquivo(pesquisa, `ciclo-${ciclo.numero}`), () =>
      paraCsv({ ...pesquisa, perguntas }, respostas),
    )
    if (!deu) setAviso('Não foi possível gerar o arquivo')
  }

  const pedirExclusao = () => {
    setMenuAberto(false)
    setConfirmacao({
      titulo: 'Deletar as respostas deste ciclo?',
      texto: `As ${respostas.length} respostas do ciclo ${ciclo.numero} são apagadas e a taxa dele volta a zero. O ciclo continua no histórico. Não dá para desfazer.`,
      rotulo: 'Deletar',
      aoConfirmar: () => alterar((x) => limparRespostasDoCiclo(x, ciclo.numero)),
    })
  }

  return (
    <div className={s.tela}>
      <header className={s.cabecalho}>
        <button type="button" className={s.voltar} aria-label="Voltar" onClick={voltar}>
          <img className={s.paraTras} src={caretRight} alt="" width={24} height={24} />
        </button>
        <p className={s.titulo}>{pesquisa.nome}</p>
        <div className={s.acoes}>
          <IconeBotao src={close} rotulo="Fechar" onClick={voltar} />
        </div>
      </header>

      <div className={s.coluna}>
        <section className={`${s.cartao} ${s.cartaoTopo}`}>
          <div className={s.topoCartao}>
            <p className={s.nomeCiclo}>Ciclo {ciclo.numero}</p>
            <div className={s.envoltorioMenu} ref={envoltorioMenu}>
              <button
                type="button"
                className={s.maisOpcoes}
                aria-label="Mais opções"
                aria-expanded={menuAberto}
                onClick={() => setMenuAberto((aberto) => !aberto)}
              >
                <img src={more} alt="" width={24} height={24} />
              </button>
              {menuAberto ? (
                <div className={s.suspenso} role="menu">
                  <button
                    type="button"
                    className={s.itemSuspenso}
                    role="menuitem"
                    disabled={!ciclo.respostas?.length}
                    onClick={baixarRespostas}
                  >
                    <img src={downloadSimple} alt="" width={24} height={24} />
                    Baixar Respostas
                  </button>
                  <button
                    type="button"
                    className={s.itemSuspenso}
                    role="menuitem"
                    onClick={() => {
                      setMenuAberto(false)
                      setVendoPerguntas(true)
                    }}
                  >
                    <img src={eye} alt="" width={24} height={24} />
                    Ver perguntas completas
                  </button>
                  <button
                    type="button"
                    className={`${s.itemSuspenso} ${s.destrutivo}`}
                    role="menuitem"
                    disabled={!ciclo.respostas?.length}
                    onClick={pedirExclusao}
                  >
                    <img src={trash} alt="" width={24} height={24} />
                    Deletar Respostas
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className={s.linhaTaxa}>
            <span className={s.taxa}>
              <Rosca taxa={ciclo.taxa} tamanho={28} traco={6} rotulo={false} />
              <span className={s.textoTaxa}>{ciclo.taxa}% responderam</span>
            </span>
            <p className={s.totalRespostas}>
              Total: {ciclo.responderam}|{ciclo.convidados} Respostas
            </p>
          </div>

          <div className={s.linhaCampos}>
            <span className={s.campo}>
              <span className={s.rotulo}>Data de Envio</span>
              <span className={s.valor}>{ciclo.envio}</span>
            </span>
            <span className={s.campo}>
              <span className={s.rotulo}>Encerrada em</span>
              <span className={s.valor}>{ciclo.encerrado}</span>
            </span>
          </div>

          <div className={s.subabas} role="tablist" aria-label="Modo de leitura">
            {SUBABAS.map((nome) => (
              <button
                type="button"
                key={nome}
                className={`${s.subaba} ${nome === subaba ? s.ativa : ''}`}
                role="tab"
                aria-selected={nome === subaba}
                onClick={() => setSubaba(nome)}
              >
                {nome}
              </button>
            ))}
          </div>
        </section>

        {!respostas.length ? (
          <section className={s.cartao}>
            <p className={s.vazio}>
              Este ciclo não tem respostas guardadas.
            </p>
          </section>
        ) : subaba === 'Geral' ? (
          perguntas.map((pergunta) => (
            <CartaoDaPergunta
              key={pergunta.id}
              pesquisa={pesquisa}
              ciclo={ciclo}
              pergunta={pergunta}
              respostas={respostas}
            />
          ))
        ) : subaba === 'Por pergunta' ? (
          <PorPergunta perguntas={perguntas} respostas={respostas} />
        ) : (
          <Individual perguntas={perguntas} respostas={respostas} />
        )}
      </div>

      {/* As perguntas como foram feitas naquele ciclo. Sem editar nem excluir:
          é histórico. */}
      {vendoPerguntas ? (
        <FolhaDePerguntas
          numero={ciclo.numero}
          nome={pesquisa.nome}
          abertura={pesquisa.abertura}
          perguntas={perguntas}
          onFechar={() => setVendoPerguntas(false)}
        />
      ) : null}

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

      {/* A pesquisa sumiu enquanto esta tela estava aberta. O modal fica por
          cima do que já está desenhado: trocar a tela inteira por ele
          esconderia o contexto de onde a pessoa estava. */}
      {sumiu ? (
        <ModalConfirmar
          titulo="Pesquisa não encontrada"
          texto={sumiu}
          rotuloConfirmar="Ir para as pesquisas"
          soAviso
          onConfirmar={() => navigate(MODULE_BASE, { replace: true })}
          onCancelar={() => navigate(MODULE_BASE, { replace: true })}
        />
      ) : null}

      <Aviso texto={aviso} onSumir={limparAviso} />
    </div>
  )
}
