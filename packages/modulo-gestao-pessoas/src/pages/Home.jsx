import { useEffect, useMemo, useRef, useState } from 'react'
import { useMatch, useNavigate, useSearchParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Tabs from '../components/Tabs.jsx'
import CollaboradoresToolbar from '../components/CollaboradoresToolbar.jsx'
import CollaboratorsTable from '../components/CollaboratorsTable.jsx'
import CollaboratorsGrid from '../components/CollaboratorsGrid.jsx'
import TimesToolbar from '../components/TimesToolbar.jsx'
import TimesGrid from '../components/TimesGrid.jsx'
import BeneficiosToolbar from '../components/BeneficiosToolbar.jsx'
import RecursosGrid from '../components/RecursosGrid.jsx'
import BulkActionBar from '../components/BulkActionBar.jsx'
import { useToast } from '../components/toast/ToastContext.jsx'
import AddEmTimeModal from '../components/AddEmTimeModal.jsx'
import BottomSearchBar from '../components/BottomSearchBar.jsx'
import FiltrosPanel from '../components/FiltrosPanel.jsx'
import TimesFiltrosPanel from '../components/TimesFiltrosPanel.jsx'
import BeneficiosFiltrosPanel from '../components/BeneficiosFiltrosPanel.jsx'
import NovoModal from '../components/addCollaborator/NovoModal.jsx'
import AddCollaboratorFlow from '../components/addCollaborator/AddCollaboratorFlow.jsx'
import NovoTimeStepFlow from '../components/addTeam/novoTime/NovoTimeStepFlow.jsx'
import NovoBeneficioStepFlow from '../components/addBeneficio/novoBeneficio/NovoBeneficioStepFlow.jsx'
import ColaboradorDetail from '../components/colaborador/ColaboradorDetail.jsx'
import TimeDetail from '../components/time/TimeDetail.jsx'
import BeneficioDetail from '../components/beneficio/BeneficioDetail.jsx'
import {
  getCollection,
  setCollection,
  getCollaboratorActiveSince,
  removeItems,
  duplicateItems,
  COLLECTIONS,
} from '../utils/storage.js'
import { formatDateDMonthYear, todayIso } from '../utils/formatters.js'
import { STATUS_OPCOES, TIPOS, getStatus, isEncerrado, isPendente } from '../utils/colaboradorStatus.js'
import { fornecedorDoRecurso, pessoasDoRecurso, tituloDoRecurso, TIPOS_RECURSO } from '../utils/recursos.js'
import { MODULE_BASE } from '../routes.js'
import './Home.css'

const TABS = [
  { id: 'colaboradores', label: 'Colaboradores' },
  { id: 'times', label: 'Times' },
  { id: 'beneficios', label: 'Recursos' },
]


// Read once when this module first evaluates - i.e. exactly once per real
// page load (a hard navigation/refresh reloads the whole bundle, so this
// is re-evaluated fresh then too). Reading the raw hash directly, before
// any React Router state has resolved, avoids any dependency on whether
// useMatch() has already caught up to the real initial URL by the time
// Home's first render runs.
const initialHashPath = window.location.hash.replace(/^#/, '')
const emRota = (nome) =>
  new RegExp(`^${MODULE_BASE}/${nome}/[^/]+`).test(initialHashPath)

const loadedDirectlyOnColaboradorRoute = emRota('colaborador')
const loadedDirectlyOnTimeRoute = emRota('time')
const loadedDirectlyOnBeneficioRoute = emRota('beneficio')

function createEmptyColumnFilters() {
  return {
    time: new Set(),
    cargo: new Set(),
    tipo: new Set(),
    status: new Set(),
    periodo: { start: null, end: null },
  }
}

function createEmptyTimesFilters() {
  return { status: new Set(), pessoas: { min: null, max: null } }
}

function createEmptyBeneficiosFilters() {
  return { tipo: new Set(), pessoas: { min: null, max: null } }
}

// Guarda o ultimo valor nao nulo. Serve para os paineis de detalhe, que
// continuam no DOM durante a animacao de saida, depois de a rota ja ter
// mudado.
function useUltimo(valor) {
  const guardado = useRef(valor)
  if (valor) guardado.current = valor
  return valor ?? guardado.current
}

function Home({ backTo }) {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const colaboradorMatch = useMatch(`${MODULE_BASE}/colaborador/:id`)
  const timeMatch = useMatch(`${MODULE_BASE}/time/:id`)
  const beneficioMatch = useMatch(`${MODULE_BASE}/beneficio/:id`)
  const [searchParams] = useSearchParams()
  // Captures whether the very first page load (hard navigation, refresh, or
  // a pasted link) already landed on the colaborador route - that always
  // forces full-screen. A later in-app "collapse to panel" action clears
  // this so refreshing after that no longer forces full-screen again for
  // the SPA's lifetime (a genuine refresh re-evaluates this fresh anyway).
  const forceFullScreenRef = useRef(loadedDirectlyOnColaboradorRoute)
  const colaboradorId = colaboradorMatch?.params?.id ?? null
  const colaboradorFullScreenRequested = searchParams.get('view') === 'full'
  const colaboradorOverlayOpen = Boolean(colaboradorId)
  const colaboradorFullScreen =
    colaboradorOverlayOpen && (colaboradorFullScreenRequested || forceFullScreenRef.current)

  const openColaborador = (id) => navigate(`${MODULE_BASE}/colaborador/${id}`)
  const expandColaborador = () => navigate(`${MODULE_BASE}/colaborador/${colaboradorId}?view=full`)
  const collapseColaborador = () => {
    forceFullScreenRef.current = false
    navigate(`${MODULE_BASE}/colaborador/${colaboradorId}`)
  }
  const closeColaborador = () => navigate(MODULE_BASE)

  // Mesma convencao da rota de colaborador, aplicada a /time/:id.
  const forceFullScreenTimeRef = useRef(loadedDirectlyOnTimeRoute)
  const timeId = timeMatch?.params?.id ?? null
  const timeFullScreenRequested = searchParams.get('view') === 'full'
  const timeOverlayOpen = Boolean(timeId)
  const timeFullScreen =
    timeOverlayOpen && (timeFullScreenRequested || forceFullScreenTimeRef.current)

  const openTime = (id) => navigate(`${MODULE_BASE}/time/${id}`)
  const expandTime = () => navigate(`${MODULE_BASE}/time/${timeId}?view=full`)
  const collapseTime = () => {
    forceFullScreenTimeRef.current = false
    navigate(`${MODULE_BASE}/time/${timeId}`)
  }
  const closeTime = () => navigate(MODULE_BASE)

  // Mesma convencao, aplicada a /beneficio/:id.
  const forceFullScreenBeneficioRef = useRef(loadedDirectlyOnBeneficioRoute)
  const beneficioId = beneficioMatch?.params?.id ?? null
  const beneficioFullScreenRequested = searchParams.get('view') === 'full'
  const beneficioOverlayOpen = Boolean(beneficioId)
  const beneficioFullScreen =
    beneficioOverlayOpen && (beneficioFullScreenRequested || forceFullScreenBeneficioRef.current)

  const openBeneficio = (id) => navigate(`${MODULE_BASE}/beneficio/${id}`)
  const expandBeneficio = () => navigate(`${MODULE_BASE}/beneficio/${beneficioId}?view=full`)
  const collapseBeneficio = () => {
    forceFullScreenBeneficioRef.current = false
    navigate(`${MODULE_BASE}/beneficio/${beneficioId}`)
  }
  const closeBeneficio = () => navigate(MODULE_BASE)

  /*
   * O ultimo id de cada painel. Enquanto a saida anima a rota ja voltou para a
   * lista, entao `colaboradorMatch` e companhia ja sao nulos - sem lembrar o
   * ultimo, o painel esvaziaria no meio da transicao.
   */
  const ultimoColaboradorId = useUltimo(colaboradorId)
  const ultimoTimeId = useUltimo(timeId)
  const ultimoBeneficioId = useUltimo(beneficioId)

  /*
   * O modo tambem precisa ser lembrado, pelo mesmo motivo: sem isso o painel
   * encolheria de tela cheia para painel no meio da saida.
   *
   * E em tela cheia nao ha para onde deslizar - o original fecha na hora, e e
   * o que fazemos, deixando de montar. Nao e uma segunda animacao: e a
   * ausencia dela.
   */
  const modo = (aberto, cheio) => (aberto ? (cheio ? 'full' : 'panel') : null)
  const colaboradorModo = useUltimo(modo(colaboradorOverlayOpen, colaboradorFullScreen))
  const timeModo = useUltimo(modo(timeOverlayOpen, timeFullScreen))
  const beneficioModo = useUltimo(modo(beneficioOverlayOpen, beneficioFullScreen))

  const [activeTab, setActiveTab] = useState('colaboradores')
  const [novoModalOpen, setNovoModalOpen] = useState(false)
  const [addCollaboratorFlowOpen, setAddCollaboratorFlowOpen] = useState(false)
  const [novoTimeStepFlowOpen, setNovoTimeStepFlowOpen] = useState(false)
  const [novoTimeStepFlowTeamId, setNovoTimeStepFlowTeamId] = useState(null)
  const [novoBeneficioFlowOpen, setNovoBeneficioFlowOpen] = useState(false)
  const [view, setView] = useState('table')
  const [collaborators, setCollaborators] = useState(() =>
    getCollection(COLLECTIONS.COLABORADORES),
  )
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [addEmTimeModalOpen, setAddEmTimeModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [columnFilters, setColumnFilters] = useState(createEmptyColumnFilters)
  const [filtrosPanelOpen, setFiltrosPanelOpen] = useState(false)
  const [timesFilters, setTimesFilters] = useState(createEmptyTimesFilters)
  const [timesFiltrosOpen, setTimesFiltrosOpen] = useState(false)
  const [beneficiosFilters, setBeneficiosFilters] = useState(createEmptyBeneficiosFilters)
  const [beneficiosFiltrosOpen, setBeneficiosFiltrosOpen] = useState(false)
  // Read fresh on every render (not cached in state) so the Times tab always
  // reflects the current localStorage contents, including teams created via
  // the quick-create flow in a collaborator's Time modal after this page
  // already mounted. Deleting a time elsewhere on this page always triggers
  // a collaborators state update too (even a no-op cascade still produces a
  // new array reference), which re-renders Home and so re-reads these
  // fresh - so they don't need their own state for that to work.
  const times = getCollection(COLLECTIONS.TIMES)
  // Benefícios nao tem o efeito colateral que Times tem no estado de
  // colaboradores ao deletar, entao precisa de estado proprio para reagir ao
  // menu do card.
  const [beneficios, setBeneficios] = useState(() => getCollection(COLLECTIONS.BENEFICIOS))

  // O painel de detalhe grava direto no storage, sem callback para ca -
  // re-sincroniza no momento em que ele fecha.
  useEffect(() => {
    if (beneficioOverlayOpen) return
    setBeneficios(getCollection(COLLECTIONS.BENEFICIOS))
  }, [beneficioOverlayOpen])

  // A busca casa o titulo do card e o fornecedor: "Alice" acha o Plano de
  // saude. A contagem e de pessoas unicas, sem quem ja saiu.
  const filteredRecursos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const hoje = todayIso()
    return beneficios
      .map((recurso) => ({ recurso, pessoas: pessoasDoRecurso(recurso, collaborators, hoje).length }))
      .filter(({ recurso, pessoas }) => {
        if (query) {
          const textos = [tituloDoRecurso(recurso), fornecedorDoRecurso(recurso)].filter(Boolean)
          if (!textos.some((texto) => texto.toLowerCase().includes(query))) return false
        }
        if (
          beneficiosFilters.tipo.size > 0 &&
          !beneficiosFilters.tipo.has(TIPOS_RECURSO[recurso.tipoRecurso])
        ) {
          return false
        }
        const { min, max } = beneficiosFilters.pessoas
        if (min != null && pessoas < min) return false
        if (max != null && pessoas > max) return false
        return true
      })
  }, [beneficios, beneficiosFilters, collaborators, searchQuery])

  const beneficiosFiltersSummary = useMemo(() => {
    const parts = [...beneficiosFilters.tipo]
    if (beneficiosFilters.pessoas.min != null) parts.push(`Mín. ${beneficiosFilters.pessoas.min}`)
    if (beneficiosFilters.pessoas.max != null) parts.push(`Máx. ${beneficiosFilters.pessoas.max}`)
    return parts.join(', ')
  }, [beneficiosFilters])

  const clearBeneficiosFilters = () => setBeneficiosFilters(createEmptyBeneficiosFilters())

  // Only teams/cargos actually assigned to at least one collaborator are
  // valid filter options - a team or cargo that exists in storage but has
  // nobody in it yet shouldn't appear as something to filter by.
  const timeOptions = useMemo(() => {
    const set = new Set()
    collaborators.forEach((collaborator) =>
      collaborator.times.forEach((name) => set.add(name)),
    )
    return Array.from(set)
  }, [collaborators])

  const cargoOptions = useMemo(() => {
    const set = new Set()
    collaborators.forEach((collaborator) =>
      collaborator.cargos.forEach((name) => set.add(name)),
    )
    return Array.from(set)
  }, [collaborators])

  const toggleFilterOption = (column, value) => {
    setColumnFilters((prev) => {
      const next = new Set(prev[column])
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }
      return { ...prev, [column]: next }
    })
  }

  const clearFilter = (column) => {
    setColumnFilters((prev) => ({ ...prev, [column]: new Set() }))
  }

  const filteredCollaborators = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const filtered = collaborators.filter((collaborator) => {
      if (query && !collaborator.name.toLowerCase().includes(query)) {
        return false
      }
      if (
        columnFilters.time.size > 0 &&
        !collaborator.times.some((time) => columnFilters.time.has(time))
      ) {
        return false
      }
      if (
        columnFilters.cargo.size > 0 &&
        !collaborator.cargos.some((cargo) => columnFilters.cargo.has(cargo))
      ) {
        return false
      }
      if (columnFilters.tipo.size > 0 && !columnFilters.tipo.has(collaborator.tipo)) {
        return false
      }
      // O filtro guarda o rotulo sem contador: "Pendente" casa 3/3, 2/3 e 1/1.
      if (
        columnFilters.status.size > 0 &&
        !columnFilters.status.has(getStatus(collaborator).rotulo)
      ) {
        return false
      }
      const { start, end } = columnFilters.periodo
      if (start || end) {
        const activeSince = getCollaboratorActiveSince(collaborator)
        if (!activeSince) return false
        if (start && activeSince < start) return false
        if (end && activeSince > end) return false
      }
      return true
    })
    // Sem ordenacao ativa, Pendente e Rescisao pendente vem primeiro. O sort
    // e estavel, entao o resto mantem a ordem de cadastro. A ordenacao por
    // Nome da tabela parte desta lista e passa por cima.
    const prioridade = (collaborator) => (isPendente(getStatus(collaborator)) ? 0 : 1)
    return filtered.sort((a, b) => prioridade(a) - prioridade(b))
  }, [collaborators, searchQuery, columnFilters])

  const filtersSummary = useMemo(() => {
    const parts = [
      ...columnFilters.time,
      ...columnFilters.cargo,
      ...columnFilters.tipo,
      ...columnFilters.status,
    ]
    if (columnFilters.periodo.start) {
      parts.push(formatDateDMonthYear(columnFilters.periodo.start))
    }
    if (columnFilters.periodo.end) {
      parts.push(formatDateDMonthYear(columnFilters.periodo.end))
    }
    return parts.join(', ')
  }, [columnFilters])

  const clearAllFilters = () => setColumnFilters(createEmptyColumnFilters())

  // Contam Pendente, Em atividade e Rescisao pendente; quem esta em dois
  // times conta nos dois. Desligado e Fim de contrato nao contam.
  const teamsWithCounts = useMemo(() => {
    const ativos = collaborators.filter((collaborator) => !isEncerrado(getStatus(collaborator)))
    return times.map((team) => ({
      ...team,
      memberCount: ativos.filter((collaborator) => collaborator.times.includes(team.name)).length,
    }))
  }, [times, collaborators])

  const filteredTeams = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return teamsWithCounts.filter((team) => {
      if (query && !team.name.toLowerCase().includes(query)) return false
      if (timesFilters.status.size > 0) {
        const statusLabel = team.pending ? 'Pendente' : 'Completo'
        if (!timesFilters.status.has(statusLabel)) return false
      }
      const { min, max } = timesFilters.pessoas
      if (min != null && team.memberCount < min) return false
      if (max != null && team.memberCount > max) return false
      return true
    })
  }, [teamsWithCounts, searchQuery, timesFilters])

  const timesFiltersSummary = useMemo(() => {
    const parts = [...timesFilters.status]
    if (timesFilters.pessoas.min != null) parts.push(`Mín. ${timesFilters.pessoas.min}`)
    if (timesFilters.pessoas.max != null) parts.push(`Máx. ${timesFilters.pessoas.max}`)
    return parts.join(', ')
  }, [timesFilters])

  const clearTimesFilters = () => setTimesFilters(createEmptyTimesFilters())

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const clearSelection = () => setSelectedIds(new Set())

  const selectAll = (ids) => setSelectedIds(new Set(ids))

  const handleDelete = () => {
    const updated = removeItems(COLLECTIONS.COLABORADORES, [...selectedIds])
    setCollaborators(updated)
    showToast('danger', 'Colaborador excluído com sucesso')
    clearSelection()
  }

  const handleDuplicate = () => {
    const updated = duplicateItems(COLLECTIONS.COLABORADORES, [...selectedIds])
    setCollaborators(updated)
    showToast('success', 'Colaborador duplicado com sucesso')
    clearSelection()
  }

  const handleAddEmTime = (teamNames) => {
    const updated = collaborators.map((collaborator) => {
      if (!selectedIds.has(collaborator.id)) return collaborator
      const mergedTimes = new Set(collaborator.times)
      teamNames.forEach((name) => mergedTimes.add(name))
      return { ...collaborator, times: Array.from(mergedTimes) }
    })
    setCollection(COLLECTIONS.COLABORADORES, updated)
    setCollaborators(updated)
    setAddEmTimeModalOpen(false)
    clearSelection()
  }

  if (addCollaboratorFlowOpen) {
    return (
      <AddCollaboratorFlow
        onExit={() => {
          setCollaborators(getCollection(COLLECTIONS.COLABORADORES))
          setAddCollaboratorFlowOpen(false)
        }}
      />
    )
  }

  if (novoTimeStepFlowOpen) {
    return (
      <NovoTimeStepFlow
        teamId={novoTimeStepFlowTeamId}
        onExit={() => {
          setCollaborators(getCollection(COLLECTIONS.COLABORADORES))
          setNovoTimeStepFlowOpen(false)
          setNovoTimeStepFlowTeamId(null)
        }}
      />
    )
  }

  if (novoBeneficioFlowOpen) {
    return (
      <NovoBeneficioStepFlow
        onExit={() => {
          setBeneficios(getCollection(COLLECTIONS.BENEFICIOS))
          setNovoBeneficioFlowOpen(false)
        }}
      />
    )
  }

  return (
    <div className="home">
      <Sidebar />
      <main className="home__content">
        <div className="home__inner">
          <PageHeader
            title="Gestão de Pessoas"
            onNovoClick={() => setNovoModalOpen(true)}
            onBack={backTo ? () => navigate(backTo) : undefined}
          />
          <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
          {activeTab === 'colaboradores' ? (
            <div className="home__panel">
              <CollaboradoresToolbar
                total={collaborators.length}
                view={view}
                onViewChange={setView}
                onFiltrosClick={() => setFiltrosPanelOpen(true)}
                filtersSummary={filtersSummary}
                onClearAllFilters={clearAllFilters}
              />
              {view === 'table' ? (
                <CollaboratorsTable
                  collaborators={filteredCollaborators}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                  onSelectAll={selectAll}
                  onDeselectAll={clearSelection}
                  columnFilters={columnFilters}
                  onToggleFilterOption={toggleFilterOption}
                  onClearFilter={clearFilter}
                  timeOptions={timeOptions}
                  cargoOptions={cargoOptions}
                  tipoOptions={TIPOS}
                  statusOptions={STATUS_OPCOES}
                  onRowClick={openColaborador}
                  onDataChanged={setCollaborators}
                />
              ) : (
                <CollaboratorsGrid
                  collaborators={filteredCollaborators}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                  onCardClick={openColaborador}
                  onDataChanged={setCollaborators}
                />
              )}
            </div>
          ) : activeTab === 'times' ? (
            <div className="home__panel">
              <TimesToolbar
                total={times.filter((team) => !team.pending).length}
                onFiltrosClick={() => setTimesFiltrosOpen(true)}
                filtersSummary={timesFiltersSummary}
                onClearAllFilters={clearTimesFilters}
              />
              <TimesGrid
                teams={filteredTeams}
                onCriarTime={(teamId) => {
                  setNovoTimeStepFlowTeamId(teamId)
                  setNovoTimeStepFlowOpen(true)
                }}
                onCardClick={openTime}
              />
            </div>
          ) : activeTab === 'beneficios' ? (
            <div className="home__panel">
              <BeneficiosToolbar
                total={beneficios.length}
                onFiltrosClick={() => setBeneficiosFiltrosOpen(true)}
                filtersSummary={beneficiosFiltersSummary}
                onClearAllFilters={clearBeneficiosFilters}
              />
              <RecursosGrid recursos={filteredRecursos} onCardClick={openBeneficio} />
            </div>
          ) : (
            <div className="home__panel" />
          )}
        </div>
      </main>

      {novoModalOpen && (
        <NovoModal
          onClose={() => setNovoModalOpen(false)}
          onSelectColaborador={() => {
            setNovoModalOpen(false)
            setAddCollaboratorFlowOpen(true)
          }}
          onSelectTime={() => {
            setNovoModalOpen(false)
            setNovoTimeStepFlowTeamId(null)
            setNovoTimeStepFlowOpen(true)
          }}
          onSelectBeneficio={() => {
            setNovoModalOpen(false)
            setNovoBeneficioFlowOpen(true)
          }}
        />
      )}

      <FiltrosPanel
        isOpen={filtrosPanelOpen}
        onClose={() => setFiltrosPanelOpen(false)}
        filters={columnFilters}
        onSave={setColumnFilters}
        timeOptions={timeOptions}
        cargoOptions={cargoOptions}
        tipoOptions={TIPOS}
        statusOptions={STATUS_OPCOES}
      />

      <TimesFiltrosPanel
        isOpen={timesFiltrosOpen}
        onClose={() => setTimesFiltrosOpen(false)}
        filters={timesFilters}
        onSave={setTimesFilters}
      />

      <BeneficiosFiltrosPanel
        isOpen={beneficiosFiltrosOpen}
        onClose={() => setBeneficiosFiltrosOpen(false)}
        filters={beneficiosFilters}
        onSave={setBeneficiosFilters}
      />

      {/*
        * Os tres paineis de detalhe ficam montados: o PainelLateral do
        * @squad/ui so os tira do DOM quando a transicao de saida termina, e e
        * ele quem desenha o veu. Desmontar aqui, como o original faz com um
        * setTimeout proprio, seria uma segunda animacao fazendo o mesmo.
        *
        * Enquanto a saida roda a rota ja nao casa mais, entao o id vem do
        * ultimo que esteve aberto.
        */}
      {ultimoColaboradorId && (colaboradorOverlayOpen || colaboradorModo === 'panel') && (
        <ColaboradorDetail
          id={colaboradorId ?? ultimoColaboradorId}
          aberto={colaboradorOverlayOpen}
          mode={colaboradorModo ?? 'panel'}
          onClose={closeColaborador}
          onExpand={expandColaborador}
          onCollapse={collapseColaborador}
          onDataChanged={setCollaborators}
        />
      )}

      {ultimoTimeId && (timeOverlayOpen || timeModo === 'panel') && (
        <TimeDetail
          id={timeId ?? ultimoTimeId}
          aberto={timeOverlayOpen}
          mode={timeModo ?? 'panel'}
          onClose={closeTime}
          onExpand={expandTime}
          onCollapse={collapseTime}
          onDataChanged={setCollaborators}
        />
      )}

      {ultimoBeneficioId && (beneficioOverlayOpen || beneficioModo === 'panel') && (
        <BeneficioDetail
          id={beneficioId ?? ultimoBeneficioId}
          aberto={beneficioOverlayOpen}
          mode={beneficioModo ?? 'panel'}
          onClose={closeBeneficio}
          onExpand={expandBeneficio}
          onCollapse={collapseBeneficio}
        />
      )}

      {addEmTimeModalOpen && (
        <AddEmTimeModal
          teams={times}
          onSave={handleAddEmTime}
          onClose={() => setAddEmTimeModalOpen(false)}
        />
      )}

      {selectedIds.size > 0 ? (
        <BulkActionBar
          count={selectedIds.size}
          onAddEmTime={() => setAddEmTimeModalOpen(true)}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onClose={clearSelection}
        />
      ) : (
        <BottomSearchBar
          key={activeTab}
          activeTab={activeTab}
          onSearchChange={setSearchQuery}
        />
      )}
    </div>
  )
}

export default Home
