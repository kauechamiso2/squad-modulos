import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaretLeft, GraduationCap, Plus, SlidersHorizontal, Square, CheckSquare } from '@phosphor-icons/react'
import arrowsDownUpIcon from '../assets/icons/ArrowsDownUp.svg'
import caretDownIcon from '../assets/icons/CaretDown.svg'
import closeIcon from '../assets/icons/Close.svg'
import Sidebar from '../components/Sidebar.jsx'
import BottomSearchBar from '../components/BottomSearchBar.jsx'
import BarraSelecao from '../components/lista/BarraSelecao.jsx'
import CartaoPesquisa from '../components/lista/CartaoPesquisa.jsx'
import PainelFiltros, { formatarDataCurta } from '../components/lista/PainelFiltros.jsx'
import { Botao, ModalConfirmar } from '@squad/ui'
import Aviso from '../components/Aviso.jsx'
import { rotuloParticipantes, PASSOS } from './nova-pesquisa/estado.jsx'
import { taxaDe } from '../lib/participacao.js'
import {
  ler,
  gravar,
  erroDeLeitura,
  TEXTO_DE_LEITURA,
  ERRO_AO_GRAVAR,
  atualizarGuardadas,
  trocarGuardada,
  acrescentarGuardada,
  removerGuardada,
  avaliarLista,
  avisoDeInicio,
  duplicar,
  forcarInicio,
  encerrarCiclo,
  paraLinha,
  botaoDe,
  dataDoEvento,
  ehRecorrente,
  STATUS,
  INTERVALO_MS,
} from '../lib/pesquisas.js'
import s from './Home.module.css'
import { MODULE_BASE } from '../routes.js'


/*
 * Home do módulo (Figma 8137:11498).
 *
 * As pesquisas vêm do localStorage. Como não há backend nem processo em
 * segundo plano, o motor de status só roda com a página aberta: uma vez na
 * carga e depois a cada 30s. Uma pesquisa que deveria ter virado ontem vira
 * na próxima carga, de uma vez só.
 *
 * A busca filtra pelo nome, sem acento e sem caixa: quem procura "clima" tem
 * de achar "Clima Geral" e "CLIMA", e quem digita "organizacao" tem de achar
 * "Organização". Mora na barra flutuante de baixo agora, porte do mesmo
 * componente do Gestão de Pessoas — o campo que ficava presa no topo saiu.
 *
 * Cabeçalho e sidebar também são o mesmo porte: "Voltar" e "Tutorial" ainda
 * não fazem nada, e a sidebar são só os cinco espaços reservados — os dois
 * marcam o lugar de uma navegação de produto compartilhada que ainda não
 * existe, para os dois módulos já nascerem parecidos.
 *
 * A tabela é outro porte do mesmo padrão (CollaboratorsTable de lá): a
 * caixa de seleção, a ordenação por Nome/% Resposta/Ciclos e os filtros de
 * Público/Tipo/Status funcionam de verdade agora, com a barra de seleção em
 * massa entrando no lugar da busca flutuante enquanto há linhas marcadas.
 * Evento perdeu o filtro — a data que ele mostra entra pelo painel
 * "Filtros" (seção Período) — e virou cabeçalho só de rótulo, sem ícone.
 * Coluna de cabeçalho e painel lateral escrevem no mesmo objeto de filtros,
 * exatamente como Time/Cargo (cabeçalho) e Atividade/Período (painel) fazem
 * lá.
 */
/* Mesma ordem das células de `CartaoPesquisa`, para as larguras baterem com
   as da linha. `tipo` diz que tipo de cabeçalho entra: 'ordenar' liga a
   ordenação, 'filtrar' abre um dropdown de opções, 'nenhum' é só rótulo. */
const COLUNAS = [
  { chave: 'nome', rotulo: 'Nome da Pesquisa', classe: 'nomeCabecalho', tipo: 'ordenar' },
  { chave: 'publico', rotulo: 'Público', classe: 'publicoCabecalho', tipo: 'filtrar' },
  { chave: 'tipo', rotulo: 'Tipo', classe: 'tipoCabecalho', tipo: 'filtrar' },
  { chave: 'status', rotulo: 'Status', classe: 'statusCabecalho', tipo: 'filtrar' },
  { chave: 'evento', rotulo: 'Evento', classe: 'eventoCabecalho', tipo: 'nenhum' },
  { chave: 'taxa', rotulo: '% Resposta', classe: 'taxaCabecalho', tipo: 'ordenar' },
  { chave: 'ciclos', rotulo: 'Ciclos', classe: 'ciclosCabecalho', tipo: 'ordenar' },
]

/* Opções fixas dos filtros de coluna que não dependem dos dados. Público é
   a exceção — vem das pesquisas de verdade, calculado dentro do componente. */
const TIPO_OPCOES = [
  { valor: 'Recorrente', texto: 'Recorrente' },
  { valor: 'Única', texto: 'Única' },
]

const STATUS_OPCOES = Object.entries(STATUS).map(([chave, { texto }]) => ({
  valor: chave,
  texto,
}))

/* As três pílulas de Atividade do painel são um agrupamento simplificado
   dos seis status reais — Pausada cobre tudo que não está nem rodando nem
   encerrado. */
const GRUPO_DE_STATUS = {
  rodando: 'Rodando',
  aguardando: 'Pausada',
  naoAtiva: 'Pausada',
  agendada: 'Pausada',
  rascunho: 'Pausada',
  encerrada: 'Encerrada',
}

function criarFiltrosVazios() {
  return {
    publico: new Set(),
    tipo: new Set(),
    status: new Set(),
    atividade: new Set(),
    periodo: { start: null, end: null },
    taxa: { min: null, max: null },
    ciclos: { min: null, max: null },
  }
}

/*
 * Se a pesquisa passa por todos os filtros ativos — cada categoria com as
 * outras em E, e dentro de uma mesma categoria os valores marcados em OU
 * (marcar dois times mostra pesquisas de qualquer um dos dois).
 *
 * Público, Tipo, Taxa e Ciclos tratam um rascunho (e Taxa também uma
 * agendada) como sem valor: a coluna mostra "—" para essas linhas, e um
 * filtro ativo não pode dar como resultado uma linha que na tela não mostra
 * o valor que supostamente bateu.
 */
function pesquisaPassaNoFiltro(p, filtros) {
  if (filtros.publico.size > 0) {
    if (p.status === 'rascunho') return false
    const bate = [...filtros.publico].some((valor) => {
      if (valor === 'Toda a empresa') return Boolean(p.participantes?.todaEmpresa)
      if (valor === 'Pessoas avulsas') return (p.participantes?.pessoas?.length ?? 0) > 0
      return (p.participantes?.grupos || []).includes(valor)
    })
    if (!bate) return false
  }

  if (filtros.tipo.size > 0) {
    if (p.status === 'rascunho') return false
    if (!filtros.tipo.has(ehRecorrente(p) ? 'Recorrente' : 'Única')) return false
  }

  if (filtros.status.size > 0 && !filtros.status.has(p.status)) return false

  if (filtros.atividade.size > 0) {
    const grupo = GRUPO_DE_STATUS[p.status]
    if (!grupo || !filtros.atividade.has(grupo)) return false
  }

  const { start, end } = filtros.periodo
  if (start || end) {
    const data = dataDoEvento(p)
    if (!data) return false
    if (start && data < new Date(`${start}T00:00:00`)) return false
    if (end && data > new Date(`${end}T23:59:59`)) return false
  }

  const { min: taxaMin, max: taxaMax } = filtros.taxa
  if (taxaMin != null || taxaMax != null) {
    if (p.status === 'rascunho' || p.status === 'agendada') return false
    const taxa = taxaDe(p)
    if (taxaMin != null && taxa < taxaMin) return false
    if (taxaMax != null && taxa > taxaMax) return false
  }

  const { min: ciclosMin, max: ciclosMax } = filtros.ciclos
  if (ciclosMin != null || ciclosMax != null) {
    if (p.status === 'rascunho') return false
    const ciclos = p.ciclos ?? 0
    if (ciclosMin != null && ciclos < ciclosMin) return false
    if (ciclosMax != null && ciclos > ciclosMax) return false
  }

  return true
}

const maisRecentePrimeiro = (a, b) =>
  new Date(b.atualizadoEm) - new Date(a.atualizadoEm)

/*
 * Comparações das três colunas ordenáveis, cada uma com sua própria noção de
 * "sem valor" — rascunho não tem taxa nem ciclos ainda, e agendada não tem
 * taxa. Essas linhas vão sempre para o fim, ordem crescente ou não, em vez
 * de competir como zero contra pesquisas que de fato respondem por zero.
 */
const ordenarPorNome = (a, b) => a.nome.localeCompare(b.nome, 'pt-BR')

/* Taxa e Ciclos ordenam do maior para o menor no primeiro clique — é o que
   costuma interessar primeiro nessas duas (quem mais responde, quem já deu
   mais voltas) —, por isso `invertido` nasce `true` nelas; Nome continua
   crescente, A a Z. */
const semValorPara = (final, invertido = false) => (a, b) => {
  const va = final(a)
  const vb = final(b)
  if (va === null && vb === null) return 0
  if (va === null) return 1
  if (vb === null) return -1
  return invertido ? vb - va : va - vb
}

const ordenarPorTaxa = semValorPara(
  (p) => (p.status === 'rascunho' || p.status === 'agendada' ? null : taxaDe(p)),
  true,
)

const ordenarPorCiclos = semValorPara(
  (p) => (p.status === 'rascunho' ? null : p.ciclos ?? 0),
  true,
)

const ORDENACOES = { nome: ordenarPorNome, taxa: ordenarPorTaxa, ciclos: ordenarPorCiclos }

/* Comparação frouxa de propósito: acento e caixa não deveriam esconder uma
   pesquisa de quem está procurando por ela. */
const normalizar = (t) =>
  (t || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

/*
 * Cabeçalho de coluna filtrável (porte do FilterHeaderCell do
 * CollaboratorsTable de lá): clicar abre um dropdown de opções com
 * checkbox; clicar de novo fecha; e clicar com algo já marcado limpa a
 * coluna sem precisar abrir o dropdown primeiro.
 */
function FiltroCabecalho({ classe, rotulo, opcoes, selecionados, aberto, onClicar, onAlternar, containerRef }) {
  const filtroAtivo = selecionados.size > 0
  return (
    <div className={`${s.envoltorioFiltroCabecalho} ${s[classe]}`} ref={containerRef}>
      <button type="button" className={s.celulaCabecalho} onClick={onClicar}>
        <span>{rotulo}</span>
        {aberto || filtroAtivo ? (
          <img src={closeIcon} width={16} height={16} alt="" />
        ) : (
          <img src={caretDownIcon} width={16} height={16} alt="" />
        )}
      </button>
      {aberto ? (
        <div className={s.dropdownFiltro} role="menu">
          {opcoes.map(({ valor, texto }) => {
            const marcado = selecionados.has(valor)
            return (
              <button
                type="button"
                key={valor}
                className={s.opcaoFiltro}
                role="menuitemcheckbox"
                aria-checked={marcado}
                onClick={() => onAlternar(valor)}
              >
                {marcado ? (
                  <CheckSquare size={20} color="var(--cor-texto)" weight="fill" />
                ) : (
                  <Square size={20} color="#c2c8c8" />
                )}
                <span>{texto}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default function Home({ backTo }) {
  const navigate = useNavigate()
  const [pesquisas, setPesquisas] = useState([])
  const [confirmacao, setConfirmacao] = useState(null)
  const [aviso, setAviso] = useState('')
  const [busca, setBusca] = useState('')
  const [sortColuna, setSortColuna] = useState(null)
  const [selecionados, setSelecionados] = useState(() => new Set())
  const [filtros, setFiltros] = useState(criarFiltrosVazios)
  const [colunaAberta, setColunaAberta] = useState(null)
  const [painelFiltrosAberto, setPainelFiltrosAberto] = useState(false)
  const containerRefs = useRef({})
  /* Leitura que falhou fica na tela até ser resolvida, e não some sozinha
     como um aviso passageiro: a lista vazia embaixo dela é justamente o que
     precisa de explicação. */
  const [falhaDeLeitura, setFalhaDeLeitura] = useState(null)
  const limparAviso = useCallback(() => setAviso(''), [])

  /* Clicar fora do dropdown aberto fecha ele — mesmo padrão do menu de três
     pontos de cada linha, um nível acima (cabeçalho, e não linha). */
  useEffect(() => {
    if (colunaAberta === null) return undefined
    const aoClicarFora = (evento) => {
      const ref = containerRefs.current[colunaAberta]
      if (ref && !ref.contains(evento.target)) setColunaAberta(null)
    }
    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [colunaAberta])

  /*
   * Toda ação da lista passa por aqui: a escrita relê antes de mudar, e o
   * que volta dela — a lista guardada de verdade — é o que a tela passa a
   * mostrar. Antes a tela mostrava a lista de memória e gravava por cima, o
   * que apagava o que outra aba tivesse acrescentado no meio-tempo.
   *
   * Escrita recusada não muda a tela: mostrar a alteração e avisar que ela
   * não foi salva deixa a tela dizendo uma coisa e o armazenamento outra.
   */
  const aplicar = useCallback((resultado) => {
    if (resultado.ok) setPesquisas(resultado.lista)
    else setAviso(resultado.erro)
  }, [])

  useEffect(() => {
    const rodar = () => {
      const { lista, mudou } = avaliarLista(ler())
      const falha = erroDeLeitura()
      setFalhaDeLeitura(falha)
      setPesquisas(lista)
      /* Sem ter conseguido ler, o que o motor calculou saiu de uma lista
         vazia: gravar isso trocaria tudo o que existe por nada. */
      if (mudou && !falha && !gravar(lista)) setAviso(ERRO_AO_GRAVAR)
    }
    rodar()
    const id = setInterval(rodar, INTERVALO_MS)
    return () => clearInterval(id)
  }, [])

  const trocar = (id, transformar) => aplicar(trocarGuardada(id, transformar))

  const aoTransportar = (p) => {
    /* Pausar fecha o ciclo em curso e deixa a pesquisa em "Ativa |
       Aguardando": ela continua no ar, entre ciclos. Sair do ar é outra
       ação, e mora no interruptor "Publicar formulário". */
    if (botaoDe(p) === 'pausar') {
      trocar(p.id, (atual) => encerrarCiclo(atual))
      return
    }
    // Iniciar sobrescreve a data agendada, então pede confirmação.
    setConfirmacao({
      ...avisoDeInicio(p),
      aoConfirmar: () => trocar(p.id, (atual) => forcarInicio(atual)),
    })
  }

  /*
   * Abrir uma pesquisa é ver o detalhe dela; abrir um rascunho é voltar para
   * o fluxo, na tela em que ele foi salvo.
   *
   * Um rascunho de antes de o passo ser guardado não tem onde cair, e aí vale
   * a regra antiga: com perguntas já geradas vai para a revisão, porque
   * escolher o template de novo refaz a geração e apagaria o que estava lá.
   * Sem perguntas, cai no nome — que é onde o fluxo começa a ter o que
   * guardar, e onde estes rascunhos foram salvos quando essa era a primeira
   * tela.
   *
   * A mesma regra vale para um `passo` que não é mais um dos passos do fluxo
   * — "template", de antes de a escolha do template virar a rota índice.
   * Sem isto o rascunho caía numa rota que não existe mais e o catch-all
   * mandava de volta para a home sem dizer por quê, como se o clique não
   * tivesse feito nada.
   */
  const passoDoRascunho = (p) => {
    if (p.passo && PASSOS.includes(p.passo)) return `/${p.passo}`
    return (p.perguntas?.length ?? 0) > 0 ? '/revisao' : '/nome'
  }

  const aoAbrir = (p) => {
    if (p.status !== 'rascunho') {
      navigate(`${MODULE_BASE}/pesquisas/${p.id}`)
      return
    }
    navigate(`${MODULE_BASE}/rascunhos/${p.id}${passoDoRascunho(p)}`)
  }

  /* Sem confirmação, igual à deleção em massa: as duas são o mesmo tanto de
     irreversível, e pedir "tem certeza?" só de uma delas seria inconsistente
     sem deixá-la mais segura de verdade. */
  const aoDeletar = (p) => aplicar(removerGuardada(p.id))

  /*
   * Seleção e ordenação vivem só na tela: nada disso é gravado, e recarregar
   * a página zera as duas. Marcar uma linha muda o que aparece pintado e o
   * conteúdo da barra flutuante de baixo, nunca o que está no armazenamento.
   */
  const aoOrdenar = (coluna) =>
    setSortColuna((atual) => (atual === coluna ? null : coluna))

  const aoSelecionar = (id) =>
    setSelecionados((atual) => {
      const proximo = new Set(atual)
      if (proximo.has(id)) proximo.delete(id)
      else proximo.add(id)
      return proximo
    })

  const aoDuplicarSelecionados = () => {
    aplicar(
      atualizarGuardadas((lista) => [
        ...lista,
        ...lista.filter((p) => selecionados.has(p.id)).map((p) => duplicar(p)),
      ]),
    )
    setSelecionados(new Set())
  }

  const aoDeletarSelecionados = () => {
    aplicar(atualizarGuardadas((lista) => lista.filter((p) => !selecionados.has(p.id))))
    setSelecionados(new Set())
  }

  /* Só o clique no cabeçalho de coluna passa por aqui — Atividade/Período/
     Taxa/Ciclos são o painel, que mexe direto no `filtros` pelo `onSalvar`. */
  const aoAlternarFiltro = (categoria, valor) =>
    setFiltros((atual) => {
      const proximo = new Set(atual[categoria])
      if (proximo.has(valor)) proximo.delete(valor)
      else proximo.add(valor)
      return { ...atual, [categoria]: proximo }
    })

  const aoClicarCabecalhoFiltro = (categoria) => {
    if (colunaAberta === categoria) {
      setColunaAberta(null)
    } else if (filtros[categoria].size > 0) {
      setFiltros((atual) => ({ ...atual, [categoria]: new Set() }))
    } else {
      setColunaAberta(categoria)
    }
  }

  const limparTodosOsFiltros = () => setFiltros(criarFiltrosVazios())

  /* "Toda a empresa" só entra se alguma pesquisa de verdade tiver esse
     alvo, cada time só entra se tiver ao menos uma pesquisa nele, e
     "Pessoas avulsas" só entra se alguma pesquisa tiver gente escolhida
     avulsa — um rascunho não conta, porque a coluna Público dele mostra
     "—": filtrar por um valor que a própria linha não exibe seria
     confuso. */
  const naoRascunho = pesquisas.filter((p) => p.status !== 'rascunho')
  const publicoOpcoes = []
  if (naoRascunho.some((p) => p.participantes?.todaEmpresa)) {
    publicoOpcoes.push({ valor: 'Toda a empresa', texto: 'Toda a empresa' })
  }
  const timesComPesquisa = new Set()
  naoRascunho.forEach((p) => (p.participantes?.grupos || []).forEach((g) => timesComPesquisa.add(g)))
  Array.from(timesComPesquisa)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    .forEach((nome) => publicoOpcoes.push({ valor: nome, texto: nome }))
  if (naoRascunho.some((p) => (p.participantes?.pessoas?.length ?? 0) > 0)) {
    publicoOpcoes.push({ valor: 'Pessoas avulsas', texto: 'Pessoas avulsas' })
  }

  const resumoPartes = [
    ...filtros.publico,
    ...filtros.tipo,
    ...[...filtros.status].map((chave) => STATUS[chave]?.texto ?? chave),
    ...filtros.atividade,
  ]
  if (filtros.periodo.start) resumoPartes.push(formatarDataCurta(filtros.periodo.start))
  if (filtros.periodo.end) resumoPartes.push(formatarDataCurta(filtros.periodo.end))
  if (filtros.taxa.min != null) resumoPartes.push(`Mín. ${filtros.taxa.min}%`)
  if (filtros.taxa.max != null) resumoPartes.push(`Máx. ${filtros.taxa.max}%`)
  if (filtros.ciclos.min != null) resumoPartes.push(`Mín. ${filtros.ciclos.min} ciclos`)
  if (filtros.ciclos.max != null) resumoPartes.push(`Máx. ${filtros.ciclos.max} ciclos`)
  const resumoFiltros = resumoPartes.join(', ')
  const filtrosAtivos = resumoPartes.length > 0

  const procurado = normalizar(busca)
  let encontradas = [...pesquisas]
    .filter((p) => !procurado || normalizar(p.nome).includes(procurado))
    .filter((p) => pesquisaPassaNoFiltro(p, filtros))
    .sort(maisRecentePrimeiro)
  if (sortColuna) encontradas = [...encontradas].sort(ORDENACOES[sortColuna])

  const idsVisiveis = encontradas.map((p) => p.id)
  const todosSelecionados =
    idsVisiveis.length > 0 && idsVisiveis.every((id) => selecionados.has(id))
  const aoSelecionarTodos = () =>
    setSelecionados(todosSelecionados ? new Set() : new Set(idsVisiveis))

  return (
    <div className={s.layout}>
      <Sidebar />
      {/* Marco principal da página: sem ele, quem navega por marcos não tem
          como pular a sidebar e cair no conteúdo. */}
      <main className={s.coluna}>
        <div className={s.cabecalho}>
          <div className={s.tituloLinha}>
            <div className={s.tituloGrupo}>
              {/* Recua para a home do monorepo. O destino vem por prop: o
                  módulo não conhece a aplicação que o hospeda. Sem `backTo`
                  o botão fica inerte, como era no projeto standalone. */}
              <button
                type="button"
                className={s.iconeCirculo}
                aria-label="Voltar"
                onClick={backTo ? () => navigate(backTo) : undefined}
              >
                <CaretLeft size={24} />
              </button>
              <h1 className={s.titulo}>Pesquisa de Clima</h1>
            </div>
            <div className={s.acoesGrupo}>
              {/* Também só visual por enquanto — sem tutorial escrito ainda.
                  Cinza, e não preto como o "Voltar": o Figma diferencia os
                  dois. */}
              <button type="button" className={s.iconeCirculo} aria-label="Tutorial">
                <GraduationCap size={24} color="var(--cor-texto-secundario)" />
              </button>
              {/* Pílula "Novo" (Figma 8222:2410); o clique continua o mesmo
                  de sempre, só o ícone virou Phosphor. */}
              <Botao variante="marca" onClick={() => navigate(`${MODULE_BASE}/pesquisas/nova`)}>
                Novo
                <Plus size={24} />
              </Botao>
            </div>
          </div>
        </div>

        {/* Leitura que falhou: sem isto a tabela vazia logo abaixo diria que
            nunca houve pesquisa nenhuma. */}
        {falhaDeLeitura ? (
          <div className={s.falha} role="alert">
            <p className={s.falhaTitulo}>
              {TEXTO_DE_LEITURA[falhaDeLeitura] ?? TEXTO_DE_LEITURA.ilegivel}
            </p>
            <p className={s.falhaApoio}>
              A lista abaixo está vazia porque nada pôde ser lido, e não porque
              não existam pesquisas. Nada foi apagado: criar ou editar algo
              agora é que sobrescreve o que está guardado.
            </p>
          </div>
        ) : null}

        <div className={s.ferramentas}>
          <span className={s.total}>Total: {pesquisas.length} pesquisas</span>
          <div className={s.acoesFerramentas}>
            {resumoFiltros ? (
              <div className={s.resumoFiltros}>
                <span className={s.resumoFiltrosTexto}>{resumoFiltros}</span>
                <button
                  type="button"
                  className={s.resumoFiltrosLimpar}
                  aria-label="Limpar filtros"
                  onClick={limparTodosOsFiltros}
                >
                  <img src={closeIcon} width={20} height={20} alt="" />
                </button>
              </div>
            ) : null}
            <Botao variante="contorno" onClick={() => setPainelFiltrosAberto(true)}>
              Filtros
              <SlidersHorizontal size={24} color="#798282" />
            </Botao>
          </div>
        </div>

        {/* Nome, % Resposta e Ciclos ordenam; Público, Tipo e Status abrem
            um dropdown de filtro; Evento é só rótulo. O nome de cada coluna
            também vai junto do rótulo de cada linha (ver `rotuloDaLinha` em
            CartaoPesquisa) — quem usa leitor de tela ouve a coluna duas
            vezes só nas que têm função de verdade, e isso é o preço delas
            fazerem algo. */}
        <div className={s.tabela}>
          <button
            type="button"
            className={s.checkboxCabecalho}
            aria-label={todosSelecionados ? 'Desmarcar todas' : 'Selecionar todas'}
            aria-pressed={todosSelecionados}
            onClick={aoSelecionarTodos}
          >
            {todosSelecionados ? (
              <CheckSquare size={24} color="var(--cor-texto)" weight="fill" />
            ) : (
              <Square size={24} color="#c2c8c8" />
            )}
          </button>
          {COLUNAS.map(({ chave, rotulo, classe, tipo }) => {
            if (tipo === 'filtrar') {
              const opcoes =
                chave === 'publico' ? publicoOpcoes : chave === 'tipo' ? TIPO_OPCOES : STATUS_OPCOES
              return (
                <FiltroCabecalho
                  key={chave}
                  classe={classe}
                  rotulo={rotulo}
                  opcoes={opcoes}
                  selecionados={filtros[chave]}
                  aberto={colunaAberta === chave}
                  onClicar={() => aoClicarCabecalhoFiltro(chave)}
                  onAlternar={(valor) => aoAlternarFiltro(chave, valor)}
                  containerRef={(el) => {
                    containerRefs.current[chave] = el
                  }}
                />
              )
            }

            if (tipo === 'nenhum') {
              return (
                <span key={chave} className={`${s.rotuloCabecalho} ${s[classe]}`}>
                  {rotulo}
                </span>
              )
            }

            const ativo = sortColuna === chave
            return (
              <button
                type="button"
                key={chave}
                className={`${s.celulaCabecalho} ${s[classe]}`}
                aria-pressed={ativo}
                onClick={() => aoOrdenar(chave)}
              >
                <span>{rotulo}</span>
                {/* Ativa, a coluna troca as setas pelo X: é o mesmo clique
                    que ordena que também limpa, e o ícone muda para dizer
                    isso — igual às colunas Nome e Ativo desde de lá. */}
                {ativo ? (
                  <img src={closeIcon} width={16} height={16} alt="" />
                ) : (
                  <img src={arrowsDownUpIcon} width={16} height={16} alt="" />
                )}
              </button>
            )
          })}
          <span className={s.acoesCabecalho} />
        </div>

        {/* `group` e não `list`: as linhas são botões, e uma lista cujos
            itens não são `listitem` é ARIA inválida — o leitor de tela
            ignoraria a lista ou anunciaria errado. O grupo dá o nome sem
            mentir sobre a estrutura. */}
        <div className={s.linhas} role="group" aria-label="Pesquisas">
          {encontradas.map((p) => (
            <CartaoPesquisa
              key={p.id}
              pesquisa={paraLinha(p, rotuloParticipantes)}
              selecionado={selecionados.has(p.id)}
              onSelecionar={() => aoSelecionar(p.id)}
              onAbrir={() => aoAbrir(p)}
              onTransporte={() => aoTransportar(p)}
              onDuplicar={() => aplicar(acrescentarGuardada(duplicar(p)))}
              onDeletar={() => aoDeletar(p)}
            />
          ))}

          {/* A lista some quando nada bate; dizer isso é melhor do que deixar
              a tabela vazia parecendo que a busca (ou o filtro) travou. */}
          {(procurado || filtrosAtivos) && encontradas.length === 0 ? (
            <p className={s.vazio}>
              {procurado
                ? `Nenhuma pesquisa com "${busca.trim()}" no nome.`
                : 'Nenhuma pesquisa com os filtros escolhidos.'}
            </p>
          ) : null}
        </div>
      </main>

      {/* Mesmo lugar na tela, uma coisa de cada vez: selecionar alguma linha
          troca a busca flutuante pela barra de ações em massa, e fechá-la
          devolve a busca — nunca as duas ao mesmo tempo. */}
      {selecionados.size > 0 ? (
        <BarraSelecao
          quantidade={selecionados.size}
          onDuplicar={aoDuplicarSelecionados}
          onDeletar={aoDeletarSelecionados}
          onFechar={() => setSelecionados(new Set())}
        />
      ) : (
        <BottomSearchBar onBuscar={setBusca} />
      )}

      <PainelFiltros
        aberto={painelFiltrosAberto}
        onFechar={() => setPainelFiltrosAberto(false)}
        filtros={filtros}
        onSalvar={(parcial) => setFiltros((atual) => ({ ...atual, ...parcial }))}
      />

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
