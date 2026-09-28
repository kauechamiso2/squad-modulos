import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaretLeft, CaretDown, GraduationCap, Plus, SlidersHorizontal, X, MagnifyingGlass } from '@phosphor-icons/react'
import { BottomSearchBar, Toolbar, TotalItens, AcoesToolbar, ChipFiltro, BotaoFiltros } from '@squad/ui'
import Sidebar from '../components/Sidebar.jsx'
import CardResumo from '../components/CardResumo.jsx'
import TabelaTransacoes from '../components/TabelaTransacoes.jsx'
import ModalConfirmacao from '../components/ModalConfirmacao.jsx'
import Toast from '../components/Toast.jsx'
import EstadoVazio from '../components/EstadoVazio.jsx'
import ModalNovo from '../components/ModalNovo.jsx'
import PainelFiltros from '../components/PainelFiltros.jsx'
import PainelTransacao from '../components/PainelTransacao.jsx'
import useUltimo from '../components/useUltimo.js'
import ModalEscopo from '../components/ModalEscopo.jsx'
import { DropdownCategoria, DropdownContato, DropdownTipo } from '../components/DropdownFiltroColuna.jsx'
import * as Transacoes from '../lib/transacoes.js'
import * as Categorias from '../lib/categorias.js'
import * as Filtros from '../lib/filtros.js'
import { carregarExemplo } from '../lib/exemplo.js'
import { PERIODOS, nomeDoMes, hojeIso, paraData, formatarCurta } from '../lib/datas.js'
import { rotuloDaTransacao } from '../lib/contatos.js'
import { MODULE_BASE } from '../routes.js'
import s from './Home.module.css'

/*
 * Home do modulo (Figma 2279:100344 padrao, 2279:101042 vazio).
 *
 * As transacoes sao lidas do localStorage no estado e reescritas por quem
 * altera - mesmo padrao dos outros modulos, sem store global.
 */
/* "Entrada removida" / "Saida atualizada" (Figma 2279:101379). */
const rotuloToast = (tipo, o) => `${tipo === 'entrada' ? 'Entrada' : 'Saída'} ${o}`

function Home({ backTo }) {
  const [modalNovo, setModalNovo] = useState(false)
  const navigate = useNavigate()
  const [transacoes, setTransacoes] = useState(() => Transacoes.listar())
  const [confirmando, setConfirmando] = useState(null)
  const [painelFiltros, setPainelFiltros] = useState(false)
  const [colunaAberta, setColunaAberta] = useState(null)
  /* Painel de resumo: guarda o id, nao a transacao, para o painel sempre ler a
     versao atual depois de cada edicao. */
  const [detalheId, setDetalheId] = useState(null)
  /* Modal de escopo pendente: { acao: 'data'|'repeticao'|'remover', valor } */
  const [escopoPendente, setEscopoPendente] = useState(null)
  const [avisoLocal, setAvisoLocal] = useState(null)
  const [filtros, setFiltros] = useState(() => Filtros.carregar())
  const [selecionados, setSelecionados] = useState(() => new Set())
  const [expandido, setExpandido] = useState(null)
  const [ordemValor, setOrdemValor] = useState(null)

  const hoje = hojeIso()
  const intervalo = useMemo(() => Filtros.intervalo(filtros, hoje), [filtros, hoje])

  const visiveis = useMemo(() => {
    const lista = Filtros.aplicar(transacoes, filtros, hoje)
    if (ordemValor) {
      return [...lista].sort((a, b) =>
        ordemValor === 'asc' ? a.valorCentavos - b.valorCentavos : b.valorCentavos - a.valorCentavos,
      )
    }
    /* Padrao: data decrescente. No empate, a criada por ultimo vem primeiro,
       para a transacao que a pessoa acabou de gravar aparecer no topo. */
    return [...lista].sort((a, b) =>
      b.data.localeCompare(a.data) || String(b.criadoEm).localeCompare(String(a.criadoEm)),
    )
  }, [transacoes, filtros, hoje, ordemValor])

  /* Os tres cards somam so o periodo: categoria, contato, tipo e busca
     filtram a tabela, nao o saldo do mes. */
  const doPeriodo = useMemo(
    () => Filtros.aplicar(transacoes, { ...Filtros.PADRAO, periodo: filtros.periodo, inicio: filtros.inicio, fim: filtros.fim }, hoje),
    [transacoes, filtros.periodo, filtros.inicio, filtros.fim, hoje],
  )
  const totais = useMemo(() => Transacoes.totais(doPeriodo, hoje), [doPeriodo, hoje])

  const categoriaPorId = useMemo(() => {
    const mapa = new Map(Categorias.todas().map((c) => [c.id, c]))
    return (id) => mapa.get(id) ?? null
  }, [transacoes])

  /*
   * Chip e card de lucro. Um intervalo escolhido a mao vira "1 Set 2026 a
   * 19 Set 2026" (Figma 2279:107378) e o card cai em "no periodo".
   */
  const intervaloManual = Boolean(filtros.inicio && filtros.fim)
  /*
   * As listas dos dropdowns saem das transacoes do periodo, nao do catalogo
   * inteiro: filtrar por uma categoria que nao aparece na tabela nao ajuda.
   */
  const categoriasDisponiveis = useMemo(() => {
    const ids = new Set(doPeriodo.map((t) => t.categoriaId))
    return Categorias.todas().filter((c) => ids.has(c.id))
  }, [doPeriodo])

  const contatosDisponiveis = useMemo(() => {
    const mapa = new Map()
    doPeriodo.forEach((t) => {
      const chave = t.contatoId ?? t.contatoAvulso
      if (!chave || mapa.has(chave)) return
      mapa.set(chave, { id: chave, rotulo: rotuloDaTransacao(t), salvo: Boolean(t.contatoId) })
    })
    return [...mapa.values()].filter((c) => c.rotulo)
  }, [doPeriodo])

  const dropdowns = {
    tipo: colunaAberta !== 'tipo' ? null : (
      <DropdownTipo
        marcados={new Set(filtros.tipos)}
        onAlternar={(id) => alternarMarcado('tipos', id)}
        onFechar={() => setColunaAberta(null)}
      />
    ),
    categoria: colunaAberta !== 'categoria' ? null : (
      <DropdownCategoria
        categorias={categoriasDisponiveis}
        marcados={new Set(filtros.categorias)}
        onAlternar={(id) => alternarMarcado('categorias', id)}
        onFechar={() => setColunaAberta(null)}
      />
    ),
    contato: colunaAberta !== 'contato' ? null : (
      <DropdownContato
        contatos={contatosDisponiveis}
        marcados={new Set(filtros.contatos)}
        onAlternar={(id) => alternarMarcado('contatos', id)}
        onFechar={() => setColunaAberta(null)}
      />
    ),
  }

  const detalhe = detalheId ? transacoes.find((t) => t.id === detalheId) ?? null : null
  /* O painel segue montado durante a animacao de saida; sem guardar a ultima
     transacao o conteudo piscaria vazio no meio do fechamento. */
  const detalheVisivel = useUltimo(detalhe)
  const alvoDoEscopo = escopoPendente
    ? transacoes.find((t) => t.id === (escopoPendente.id ?? detalheId)) ?? null
    : null

  const diasComTransacao = useMemo(
    () => new Set(transacoes.map((t) => t.data)),
    [transacoes],
  )

  const aplicarEdicao = ({ lista }) => setTransacoes(lista)

  /*
   * Data e repeticao numa transacao que repete perguntam o escopo antes de
   * aplicar; numa avulsa aplicam direto.
   */
  const pedirEscopo = (acao, valor) => {
    const repete = detalhe?.repete && detalhe.repete !== 'nao'
    if (!repete) {
      aplicarEdicao(
        acao === 'data'
          ? Transacoes.mudarData(detalhe.id, valor, 'esta')
          : Transacoes.mudarRepeticao(detalhe.id, valor, 'esta'),
      )
      setAvisoLocal({ titulo: rotuloToast(detalhe.tipo, 'atualizada') })
      return
    }
    setEscopoPendente({ acao, valor })
  }

  const confirmarEscopo = (escopo) => {
    const { acao, valor } = escopoPendente
    const alvo = alvoDoEscopo
    if (acao === 'data') aplicarEdicao(Transacoes.mudarData(alvo.id, valor, escopo))
    else if (acao === 'repeticao') aplicarEdicao(Transacoes.mudarRepeticao(alvo.id, valor, escopo))
    else {
      aplicarEdicao(Transacoes.removerComEscopo(alvo.id, escopo))
      setDetalheId(null)
    }
    setEscopoPendente(null)
    setAvisoLocal({ titulo: rotuloToast(alvo.tipo, acao === 'remover' ? 'removida' : 'atualizada') })
  }

  const rotuloPeriodo = intervaloManual
    ? `${formatarCurta(filtros.inicio)} a ${formatarCurta(filtros.fim)}`
    : Filtros.rotuloDoPeriodo(filtros, PERIODOS)

  const sufixoLucro = intervaloManual
    ? 'no período'
    : filtros.periodo === 'hoje' ? 'de hoje'
    : filtros.periodo === 'ontem' ? 'de ontem'
    : ['este-mes', 'proximo-mes', 'mes-passado'].includes(filtros.periodo)
      ? `de ${nomeDoMes(intervalo.fim).toLowerCase()}`
      : 'no período'

  const serie = (tipo) =>
    Transacoes.serieAcumulada(doPeriodo, tipo, intervalo.inicio, intervalo.fim, hoje)

  const cards = [
    {
      id: 'entradas', tipo: 'entrada',
      rotulo: 'Até agora, você teve\nde Entradas:',
      rotuloExpandido: 'Até agora, você teve\nde Entradas:',
      rotuloCurto: 'Entradas', valor: totais.entradas,
    },
    {
      id: 'saidas', tipo: 'saida',
      rotulo: 'Até agora, você teve\nde Saídas:',
      rotuloExpandido: 'Até agora, você teve\nde Saídas:',
      rotuloCurto: 'Saídas', valor: totais.saidas,
    },
    {
      id: 'lucro', tipo: 'lucro',
      rotulo: `Seu lucro\n${sufixoLucro} foi:`,
      /* Expandido o Figma troca a frase: o card mostra a evolucao ate hoje,
         nao o fechamento do periodo (2241:47057). */
      rotuloExpandido: 'Seu lucro\naté agora está em:',
      rotuloCurto: 'Lucro', valor: totais.lucro,
    },
  ]

  const alternarSelecao = (id) => {
    setSelecionados((atual) => {
      const proximo = new Set(atual)
      if (proximo.has(id)) proximo.delete(id)
      else proximo.add(id)
      return proximo
    })
  }

  /*
   * Limpar o chip volta ao periodo padrao, nao a "sem periodo": a home do
   * Figma (2279:100344) sempre mostra um periodo no dropdown e no chip, e sem
   * periodo a tabela listaria todos os meses, inclusive as ocorrencias futuras
   * de cada repeticao.
   */
  /*
   * "Este mes" e fixo: sempre existe um periodo ativo. Por isso o X do chip
   * "Este mes" abre o painel em vez de remover algo, e o X de qualquer outro
   * periodo volta para "Este mes".
   */
  const noPadrao = filtros.periodo === Filtros.PADRAO.periodo && !intervaloManual

  const limparPeriodo = () => {
    if (noPadrao) { setPainelFiltros(true); return }
    setFiltros((atual) => ({ ...atual, periodo: Filtros.PADRAO.periodo, inicio: null, fim: null }))
  }

  const alternarMarcado = (campo, id) => {
    setFiltros((atual) => {
      const lista = atual[campo]
      return {
        ...atual,
        [campo]: lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id],
      }
    })
  }

  const vazio = transacoes.length === 0

  return (
    <div className={s.pagina}>
      <Sidebar />
      <main className={s.conteudo}>
        <div className={s.cabecalho}>
          <button
            type="button"
            className={s.voltar}
            aria-label="Voltar"
            onClick={backTo ? () => navigate(backTo) : undefined}
          >
            <CaretLeft size={24} />
          </button>
          <h1 className={s.titulo}>Fluxo de caixa</h1>
          <div className={s.acoes}>
            <button type="button" className={s.botaoRedondo} aria-label="Tutorial">
              <GraduationCap size={24} />
            </button>
            <button
              type="button"
              className={s.botaoNovo}
              onClick={() => setModalNovo(true)}
            >
              Novo
              <Plus size={24} />
            </button>
          </div>
        </div>

        <div className={s.cards}>
          {cards.map((c) => (
            <CardResumo
              key={c.id}
              id={c.id}
              rotulo={c.rotulo}
              rotuloExpandido={c.rotuloExpandido}
              rotuloCurto={c.rotuloCurto}
              valorCentavos={c.valor}
              pontos={expandido === c.id ? serie(c.tipo) : []}
              estado={expandido === null ? 'padrao' : expandido === c.id ? 'expandido' : 'estreito'}
              onExpandir={() => setExpandido(c.id)}
              onFechar={() => setExpandido(null)}
            />
          ))}
        </div>

        {vazio ? (
          <EstadoVazio
            onNovo={() => setModalNovo(true)}
            onCarregarExemplo={() => setTransacoes(carregarExemplo())}
          />
        ) : (
          <>
            <div className={s.barraTotal}>
              <Toolbar>
                <TotalItens>
                  Total: {visiveis.length} {visiveis.length === 1 ? 'transação' : 'transações'}
                </TotalItens>
                <AcoesToolbar>
                  {rotuloPeriodo ? (
                    <ChipFiltro
                      texto={rotuloPeriodo}
                      iconeLimpar={<X size={20} />}
                      onClick={() => setPainelFiltros(true)}
                      onLimpar={limparPeriodo}
                    />
                  ) : null}
                  <BotaoFiltros icone={<SlidersHorizontal size={24} />} onClick={() => setPainelFiltros(true)} />
                </AcoesToolbar>
              </Toolbar>
            </div>

            <div className={s.tabelaEnvolucro}>
              <TabelaTransacoes
                transacoes={visiveis}
                categoriaPorId={categoriaPorId}
                selecionados={selecionados}
                onAlternarSelecao={alternarSelecao}
                onAlternarTodos={(marcar) =>
                  setSelecionados(marcar ? new Set(visiveis.map((t) => t.id)) : new Set())
                }
                onAbrir={setDetalheId}
                onAcaoMenu={(id, acao) => {
                  if (acao === 'detalhes') setDetalheId(id)
                  else setEscopoPendente({ acao: 'remover', id })
                }}
                colunaAberta={colunaAberta}
                onAbrirFiltroColuna={(coluna) => setColunaAberta((a) => (a === coluna ? null : coluna))}
                dropdowns={dropdowns}
                onConfirmar={setConfirmando}
                onOrdenarValor={() =>
                  setOrdemValor((o) => (o === 'desc' ? 'asc' : o === 'asc' ? null : 'desc'))
                }
              />
            </div>
          </>
        )}
      </main>

      <PainelTransacao
        aberto={Boolean(detalhe)}
        transacao={detalheVisivel}
        categorias={detalheVisivel ? Categorias.listar(detalheVisivel.tipo) : []}
        diasComTransacao={diasComTransacao}
        onRenomear={(nome) => aplicarEdicao(Transacoes.atualizarCampos(detalhe.id, { nome }))}
        onTrocarCategoria={(categoriaId) =>
          aplicarEdicao(Transacoes.atualizarCampos(detalhe.id, { categoriaId }))}
        onAdicionarNota={(texto) => aplicarEdicao(Transacoes.adicionarNota(detalhe.id, texto))}
        onMudarData={(data) => pedirEscopo('data', data)}
        onMudarRepeticao={(repete) => pedirEscopo('repeticao', repete)}
        onRemover={() => setEscopoPendente({ acao: 'remover', id: detalhe.id })}
        onFechar={() => setDetalheId(null)}
      />

      {alvoDoEscopo ? (
        <ModalEscopo
          transacao={alvoDoEscopo}
          acao={escopoPendente.acao}
          onCancelar={() => setEscopoPendente(null)}
          onConfirmar={(escopo) => confirmarEscopo(escopo)}
        />
      ) : null}

      <PainelFiltros
          aberto={painelFiltros}
          filtros={filtros}
          onSalvar={(periodo) => { setFiltros((atual) => ({ ...atual, ...periodo })); setPainelFiltros(false) }}
          onFechar={() => setPainelFiltros(false)}
        />

      {confirmando ? (
        <ModalConfirmacao
          transacao={confirmando}
          onConfirmar={() => {
            const { lista } = Transacoes.confirmar(confirmando.id)
            setTransacoes(lista)
            setAvisoLocal({
              titulo: confirmando.tipo === 'entrada' ? 'Entrada confirmada' : 'Saída confirmada',
              descricao: 'agora conta no saldo do mês',
            })
            setConfirmando(null)
          }}
          onFechar={() => setConfirmando(null)}
        />
      ) : null}

      {avisoLocal ? (
        <Toast
          key={`${avisoLocal.titulo}|${avisoLocal.descricao ?? ''}`}
          titulo={avisoLocal.titulo}
          descricao={avisoLocal.descricao}
          onFechar={() => setAvisoLocal(null)}
        />
      ) : null}

      {modalNovo ? (
        <ModalNovo
          onFechar={() => setModalNovo(false)}
          onNovaEntrada={() => navigate(`${MODULE_BASE}/nova-entrada`)}
          onNovaSaida={() => navigate(`${MODULE_BASE}/nova-saida`)}
        />
      ) : null}

      <BottomSearchBar
        placeholder="Buscar uma transação..."
        rotuloPilula="Pergunte ao Fin"
        placeholderAssistente="Pergunte ao Fin..."
        corPilulaFundo="var(--fc-fin-fundo)"
        corPilulaTexto="var(--fc-fin-texto)"
        icones={{
          lupa: <MagnifyingGlass size={24} color="#798282" />,
          fecharBusca: <X size={20} />,
          microfone: null,
          enviar: null,
          fecharAssistente: <X size={20} />,
        }}
        onBuscar={(termo) => setFiltros((f) => ({ ...f, busca: termo }))}
      />
    </div>
  )
}

export default Home
