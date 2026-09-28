import { useMemo, useRef, useState } from 'react'
import { useMatch, useNavigate, useSearchParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Tabs from '../components/Tabs.jsx'
import CollaboradoresToolbar from '../components/CollaboradoresToolbar.jsx'
import CollaboratorsTable from '../components/CollaboratorsTable.jsx'
import CollaboratorsGrid from '../components/CollaboratorsGrid.jsx'
import TimesToolbar from '../components/TimesToolbar.jsx'
import TimesGrid from '../components/TimesGrid.jsx'
import CargosToolbar from '../components/CargosToolbar.jsx'
import CargosTable from '../components/CargosTable.jsx'
import BeneficiosToolbar from '../components/BeneficiosToolbar.jsx'
import BeneficiosGrid from '../components/BeneficiosGrid.jsx'
import BulkActionBar from '../components/BulkActionBar.jsx'
import AddEmTimeModal from '../components/AddEmTimeModal.jsx'
import BottomSearchBar from '../components/BottomSearchBar.jsx'
import FiltrosPanel from '../components/FiltrosPanel.jsx'
import TimesFiltrosPanel from '../components/TimesFiltrosPanel.jsx'
import BeneficiosFiltrosPanel from '../components/BeneficiosFiltrosPanel.jsx'
import NovoModal from '../components/addCollaborator/NovoModal.jsx'
import AddCollaboratorFlow from '../components/addCollaborator/AddCollaboratorFlow.jsx'
import NovoTimeFlow from '../components/addTeam/NovoTimeFlow.jsx'
import NovoCargoFlow from '../components/addCargo/NovoCargoFlow.jsx'
import NovoBeneficioFlow from '../components/addBeneficio/NovoBeneficioFlow.jsx'
import ColaboradorDetail from '../components/colaborador/ColaboradorDetail.jsx'
import {
  getCollection,
  setCollection,
  getCollaboratorActiveSince,
  removeItems,
  COLLECTIONS,
} from '../utils/storage.js'
import { formatDateDMonthYear } from '../utils/formatters.js'
import { getBenefitMemberCount } from '../utils/beneficiarios.js'
import { getBenefitFilterTipo } from '../utils/beneficioOptions.js'
import { MODULE_BASE } from '../routes.js'
import './Home.css'

const TABS = [
  { id: 'colaboradores', label: 'Colaboradores' },
  { id: 'times', label: 'Times' },
  { id: 'cargos', label: 'Cargos' },
  { id: 'beneficios', label: 'Benefícios' },
]

const ATIVIDADE_OPTIONS = ['Fixo', 'Consultor', 'Freelancer']

// Read once when this module first evaluates - i.e. exactly once per real
// page load (a hard navigation/refresh reloads the whole bundle, so this
// is re-evaluated fresh then too). Reading the raw hash directly, before
// any React Router state has resolved, avoids any dependency on whether
// useMatch() has already caught up to the real initial URL by the time
// Home's first render runs.
const initialHashPath = window.location.hash.replace(/^#/, '')
const loadedDirectlyOnColaboradorRoute = new RegExp(`^${MODULE_BASE}/colaborador/[^/]+`).test(
  initialHashPath,
)

function createEmptyColumnFilters() {
  return {
    time: new Set(),
    cargo: new Set(),
    atividade: new Set(),
    periodo: { start: null, end: null },
  }
}

function createEmptyTimesFilters() {
  return { status: new Set(), pessoas: { min: null, max: null } }
}

function createEmptyBeneficiosFilters() {
  return { tipo: new Set(), pessoas: { min: null, max: null } }
}

function Home({ backTo }) {
  const navigate = useNavigate()
  const colaboradorMatch = useMatch(`${MODULE_BASE}/colaborador/:id`)
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

  const [activeTab, setActiveTab] = useState('colaboradores')
  const [novoModalOpen, setNovoModalOpen] = useState(false)
  const [addCollaboratorFlowOpen, setAddCollaboratorFlowOpen] = useState(false)
  const [novoTimeFlowOpen, setNovoTimeFlowOpen] = useState(false)
  const [novoTimeTeamId, setNovoTimeTeamId] = useState(null)
  const [novoCargoFlowOpen, setNovoCargoFlowOpen] = useState(false)
  const [novoCargoId, setNovoCargoId] = useState(null)
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
  // already mounted.
  const times = getCollection(COLLECTIONS.TIMES)
  const cargos = getCollection(COLLECTIONS.CARGOS)
  const beneficios = getCollection(COLLECTIONS.BENEFICIOS)
  const [cargoSelectedIds, setCargoSelectedIds] = useState(() => new Set())

  const filteredBeneficios = useMemo(() => {
    return beneficios.filter((benefit) => {
      if (beneficiosFilters.tipo.size > 0) {
        const filterTipo = getBenefitFilterTipo(benefit)
        if (!filterTipo || !beneficiosFilters.tipo.has(filterTipo)) return false
      }
      const count = getBenefitMemberCount(benefit, collaborators)
      const { min, max } = beneficiosFilters.pessoas
      if (min != null && count < min) return false
      if (max != null && count > max) return false
      return true
    })
  }, [beneficios, beneficiosFilters, collaborators])

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
    return collaborators.filter((collaborator) => {
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
      if (
        columnFilters.atividade.size > 0 &&
        !columnFilters.atividade.has(collaborator.contractType)
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
  }, [collaborators, searchQuery, columnFilters])

  const filtersSummary = useMemo(() => {
    const parts = [
      ...columnFilters.time,
      ...columnFilters.cargo,
      ...columnFilters.atividade,
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

  const teamsWithCounts = useMemo(() => {
    return times.map((team) => ({
      ...team,
      memberCount: collaborators.filter((collaborator) =>
        collaborator.times.includes(team.name),
      ).length,
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

  // Every Cargos row is derived from real collaborators - group them by
  // (cargo name, contract type). A cargo still marked pending (the only kind
  // the quick-create flow produces today) collapses all its contract types
  // into a single aggregated row; once a cargo has pending: false, each
  // contract type in use for that cargo becomes its own row.
  const cargoRows = useMemo(() => {
    const cargoRecordByName = new Map(cargos.map((cargo) => [cargo.name, cargo]))
    const membersByCargoName = new Map()
    collaborators.forEach((collaborator) => {
      collaborator.cargos.forEach((cargoName) => {
        if (!membersByCargoName.has(cargoName)) {
          membersByCargoName.set(cargoName, [])
        }
        membersByCargoName.get(cargoName).push(collaborator)
      })
    })

    const rows = []
    membersByCargoName.forEach((members, cargoName) => {
      const cargoRecord = cargoRecordByName.get(cargoName)
      const isPending = cargoRecord ? cargoRecord.pending !== false : true

      if (isPending) {
        rows.push({
          id: `${cargoName}::pending`,
          cargoName,
          isPendingCargo: true,
          contractType: null,
          count: members.length,
          teamNames: [],
          salaryMin: null,
          salaryMax: null,
          cargoRecordId: cargoRecord?.id ?? null,
        })
        return
      }

      const membersByContractType = new Map()
      members.forEach((member) => {
        const contractType = member.contractType || 'Fixo'
        if (!membersByContractType.has(contractType)) {
          membersByContractType.set(contractType, [])
        }
        membersByContractType.get(contractType).push(member)
      })

      membersByContractType.forEach((groupMembers, contractType) => {
        const teamNameSet = new Set()
        groupMembers.forEach((member) =>
          member.times.forEach((name) => teamNameSet.add(name)),
        )
        const fixoSalaries =
          contractType === 'Fixo'
            ? groupMembers.filter((member) => member.salario != null).map((member) => member.salario)
            : []
        rows.push({
          id: `${cargoName}::${contractType}`,
          cargoName,
          isPendingCargo: false,
          contractType,
          count: groupMembers.length,
          teamNames: Array.from(teamNameSet),
          salaryMin: fixoSalaries.length ? Math.min(...fixoSalaries) : null,
          salaryMax: fixoSalaries.length ? Math.max(...fixoSalaries) : null,
          cargoRecordId: cargoRecord?.id ?? null,
        })
      })
    })

    return rows
  }, [collaborators, cargos])

  const filteredCargoRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return cargoRows.filter((row) => {
      if (query && !row.cargoName.toLowerCase().includes(query)) {
        return false
      }
      if (
        columnFilters.atividade.size > 0 &&
        !columnFilters.atividade.has(row.contractType)
      ) {
        return false
      }
      if (
        columnFilters.time.size > 0 &&
        !row.teamNames.some((name) => columnFilters.time.has(name))
      ) {
        return false
      }
      return true
    })
  }, [cargoRows, searchQuery, columnFilters])

  const toggleCargoSelect = (id) => {
    setCargoSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const clearCargoSelection = () => setCargoSelectedIds(new Set())

  const selectAllCargos = (ids) => setCargoSelectedIds(new Set(ids))

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

  if (novoTimeFlowOpen) {
    return (
      <NovoTimeFlow
        teamId={novoTimeTeamId}
        onExit={() => {
          setCollaborators(getCollection(COLLECTIONS.COLABORADORES))
          setNovoTimeFlowOpen(false)
          setNovoTimeTeamId(null)
        }}
      />
    )
  }

  if (novoCargoFlowOpen) {
    return (
      <NovoCargoFlow
        cargoId={novoCargoId}
        onExit={() => {
          setCollaborators(getCollection(COLLECTIONS.COLABORADORES))
          setNovoCargoFlowOpen(false)
          setNovoCargoId(null)
        }}
      />
    )
  }

  if (novoBeneficioFlowOpen) {
    return (
      <NovoBeneficioFlow
        onExit={() => setNovoBeneficioFlowOpen(false)}
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
                  atividadeOptions={ATIVIDADE_OPTIONS}
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
                total={times.length}
                onFiltrosClick={() => setTimesFiltrosOpen(true)}
                filtersSummary={timesFiltersSummary}
                onClearAllFilters={clearTimesFilters}
              />
              <TimesGrid
                teams={filteredTeams}
                onCriarTime={(teamId) => {
                  setNovoTimeTeamId(teamId)
                  setNovoTimeFlowOpen(true)
                }}
              />
            </div>
          ) : activeTab === 'cargos' ? (
            <div className="home__panel">
              <CargosToolbar
                total={cargoRows.length}
                onFiltrosClick={() => setFiltrosPanelOpen(true)}
                filtersSummary={filtersSummary}
                onClearAllFilters={clearAllFilters}
              />
              <CargosTable
                rows={filteredCargoRows}
                selectedIds={cargoSelectedIds}
                onToggleSelect={toggleCargoSelect}
                onSelectAll={selectAllCargos}
                onDeselectAll={clearCargoSelection}
                columnFilters={columnFilters}
                onToggleFilterOption={toggleFilterOption}
                onClearFilter={clearFilter}
                timeOptions={timeOptions}
                atividadeOptions={ATIVIDADE_OPTIONS}
                onCriarCargo={(recordId) => {
                  setNovoCargoId(recordId)
                  setNovoCargoFlowOpen(true)
                }}
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
              <BeneficiosGrid benefits={filteredBeneficios} collaborators={collaborators} />
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
            setNovoTimeTeamId(null)
            setNovoTimeFlowOpen(true)
          }}
          onSelectCargo={() => {
            setNovoModalOpen(false)
            setNovoCargoId(null)
            setNovoCargoFlowOpen(true)
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
        atividadeOptions={ATIVIDADE_OPTIONS}
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

      {colaboradorOverlayOpen && (
        <>
          {/* O veu vem do PainelLateral dentro do ColaboradorDetail. */}
          <ColaboradorDetail
            id={colaboradorId}
            mode={colaboradorFullScreen ? 'full' : 'panel'}
            onClose={closeColaborador}
            onExpand={expandColaborador}
            onCollapse={collapseColaborador}
            onDataChanged={setCollaborators}
          />
        </>
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
