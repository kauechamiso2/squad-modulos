import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Aviso from '../../components/Aviso.jsx'
import { IconeBotao, ModalConfirmar } from '@squad/ui'
import TelaDadosIlegiveis from '../../components/TelaDadosIlegiveis.jsx'
import {
  ler,
  gravar,
  avaliarLista,
  ehRecorrente,
  INTERVALO_MS,
  ERRO_AO_GRAVAR,
  erroDeLeitura,
  trocarGuardada,
} from '../../lib/pesquisas.js'
import { aparar } from '../../lib/respostas.js'
import { sincronizarHistorico } from '../../lib/historico.js'
import AbaGeral from './AbaGeral.jsx'
import AbaPerguntas from './AbaPerguntas.jsx'
import AbaRespostas from './AbaRespostas.jsx'
import AbaCiclos from './AbaCiclos.jsx'
import AbaConfiguracoes from './AbaConfiguracoes.jsx'
import s from './TelaDetalhe.module.css'

import close from '../../assets/icons/Close.svg'
import { MODULE_BASE } from '../../routes.js'

/*
 * Detalhe de uma pesquisa (Figma 8151:11666).
 *
 * Cabeçalho, abas e o conteúdo da aba ativa.
 *
 * Roda o motor de status igual à home — na carga e a cada 30s — porque as
 * datas e a taxa que a Geral mostra são as mesmas que ele faz andar. Sem
 * isso, um ciclo que vencesse com a página aberta continuaria mostrando o
 * status velho até alguém voltar para a lista.
 *
 * A aba fica em estado local, e não na URL, porque trocar de aba não é um
 * passo de navegação: voltar no browser deve sair do detalhe, não desfazer o
 * clique na aba. Mesma decisão dos modais do fluxo.
 *
 * Chegar numa aba específica é outra coisa — é navegação —, e vem pelo state
 * da rota: é assim que a tela do ciclo devolve a pessoa aos Ciclos. Num F5
 * o state se perde e a tela abre no Geral, como qualquer visita direta.
 *
 * "Ciclos" é a lista de ciclos anteriores, e uma pesquisa Única só tem um: a
 * aba só existe para as recorrentes.
 */
const ABAS = ['Geral', 'Respostas', 'Ciclos', 'Perguntas', 'Configurações']

const abasDe = (pesquisa) =>
  ehRecorrente(pesquisa) ? ABAS : ABAS.filter((aba) => aba !== 'Ciclos')

export default function TelaDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  /* Gravação que não passou precisa ser dita: a tela já mostra a alteração,
     e sem o aviso o F5 seguinte a desfaria sem explicação. */
  const [aviso, setAviso] = useState('')
  /* Leitura que falhou: a tela não pode dizer que a pesquisa não existe
     quando o que houve foi não conseguir ler. */
  const [falhaDeLeitura, setFalhaDeLeitura] = useState(null)
  /* A pesquisa sumiu enquanto esta tela estava aberta. Um modal, e não um
     aviso passageiro: a tela vai embora em seguida, e um aviso de 2,5s
     desapareceria junto com ela sem ninguém ler. */
  const [sumiu, setSumiu] = useState(null)
  const limparAviso = useCallback(() => setAviso(''), [])
  const { state } = useLocation()
  const [ativa, setAtiva] = useState(
    ABAS.includes(state?.aba) ? state.aba : ABAS[0],
  )
  const [pesquisas, setPesquisas] = useState(null)

  /* O motor roda aqui como na home; ele já faz a simulação desta pesquisa
     crescer. O que sobra é o histórico dos ciclos fechados e a poda de quem
     não cabe mais no público — as duas abas contam a mesma coisa, então não
     podem acertar o passo em momentos diferentes. */
  useEffect(() => {
    const rodar = () => {
      const { lista, mudou } = avaliarLista(ler())
      let proxima = lista
      let precisaGravar = mudou
      const antes = lista.find((p) => p.id === id)
      /* Respostas do ciclo em curso e histórico dos que fecharam: os dois
         acertam o passo com o motor que acabou de rodar. */
      const depois = antes && sincronizarHistorico(aparar(antes))
      if (depois && depois !== antes) {
        proxima = lista.map((p) => (p.id === id ? depois : p))
        precisaGravar = true
      }
      const falha = erroDeLeitura()
      setFalhaDeLeitura(falha)
      setPesquisas(proxima)
      /* Sem ter conseguido ler, o que está em `proxima` saiu de uma lista
         vazia: gravar trocaria tudo o que existe por nada. */
      if (precisaGravar && !falha && !gravar(proxima)) setAviso(ERRO_AO_GRAVAR)
    }
    rodar()
    const t = setInterval(rodar, INTERVALO_MS)
    return () => clearInterval(t)
  }, [id])

  const pesquisa = pesquisas?.find((p) => p.id === id)
  const abas = pesquisa ? abasDe(pesquisa) : ABAS

  /* Grava junto com o setState, como a home: a lista em memória e a guardada
     não podem divergir, senão um F5 desfaz a última edição. */
  const alterar = useCallback(
    (transformar) => {
      /* Relê antes de mudar: só esta pesquisa é reescrita, e o que outra aba
         tiver acrescentado à lista no meio-tempo continua lá. */
      const r = trocarGuardada(id, (p) => ({
        ...transformar(p),
        atualizadoEm: new Date().toISOString(),
      }))
      if (r.ok) setPesquisas(r.lista)
      else if (r.sumiu) setSumiu(r.erro)
      else setAviso(r.erro)
    },
    [id],
  )

  /* Link velho ou pesquisa deletada: volta para a lista em vez de mostrar um
     cabeçalho sem nome. `pesquisas` nulo é a primeira renderização, antes de
     ler o storage — aí ainda não dá para dizer que não existe. */
  useEffect(() => {
    if (pesquisas && !pesquisa && !falhaDeLeitura && !sumiu) navigate(MODULE_BASE, { replace: true })
  }, [pesquisas, pesquisa, falhaDeLeitura, sumiu, navigate])

  /* Não conseguir ler não é a pesquisa não existir: mandar para a lista aqui
     faria parecer que ela foi apagada. */
  if (falhaDeLeitura) return <TelaDadosIlegiveis motivo={falhaDeLeitura} />
  if (!pesquisa) return null

  /* Trocar a frequência para "Não repete" com a aba Ciclos aberta some
     com ela; a Geral é o destino, como em qualquer visita direta. */
  const visivel = abas.includes(ativa) ? ativa : ABAS[0]

  return (
    <div className={s.tela}>
      <header className={s.cabecalho}>
        <p className={s.titulo}>{pesquisa.nome}</p>

        <div className={s.abas} role="tablist" aria-label="Seções da pesquisa">
          {abas.map((aba) => (
            <button
              type="button"
              key={aba}
              id={`aba-${aba}`}
              className={`${s.aba} ${aba === visivel ? s.ativa : ''}`}
              role="tab"
              aria-selected={aba === visivel}
              aria-controls={`painel-${aba}`}
              onClick={() => setAtiva(aba)}
            >
              {aba}
            </button>
          ))}
        </div>

        <div className={s.acoes}>
          <IconeBotao src={close} rotulo="Fechar" onClick={() => navigate(MODULE_BASE)} />
        </div>
      </header>

      <div
        className={s.miolo}
        id={`painel-${visivel}`}
        role="tabpanel"
        aria-labelledby={`aba-${visivel}`}
      >
        {visivel === 'Geral' ? <AbaGeral pesquisa={pesquisa} /> : null}
        {visivel === 'Perguntas' ? (
          <AbaPerguntas pesquisa={pesquisa} onAlterar={alterar} />
        ) : null}
        {visivel === 'Respostas' ? (
          <AbaRespostas pesquisa={pesquisa} onAlterar={alterar} />
        ) : null}
        {visivel === 'Ciclos' ? <AbaCiclos pesquisa={pesquisa} /> : null}
        {visivel === 'Configurações' ? (
          <AbaConfiguracoes pesquisa={pesquisa} onAlterar={alterar} />
        ) : null}
      </div>

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
