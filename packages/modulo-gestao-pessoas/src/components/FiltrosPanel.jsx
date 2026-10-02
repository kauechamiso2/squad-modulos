import { useEffect, useRef, useState } from 'react'
import closeIcon from '../assets/icons/Close.svg'
import calendarBlankIcon from '../assets/icons/CalendarBlank.svg'
import { IconButton, PainelLateral } from '@squad/ui'
import { formatDateDMonthYear } from '../utils/formatters.js'
import FilterPill from './FilterPill.jsx'
import './FiltrosPanel.css'

const TEAM_COLOR_PALETTE = [
  '#3dd598',
  '#8c54ff',
  '#ff9f43',
  '#4b7bec',
  '#fc5c65',
  '#26de81',
]

const TEAM_COLOR_OVERRIDES = {
  Design: '#3dd598',
  Vendas: '#8c54ff',
}

function getTeamColor(name) {
  if (TEAM_COLOR_OVERRIDES[name]) return TEAM_COLOR_OVERRIDES[name]
  let hash = 0
  for (const char of name) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  }
  return TEAM_COLOR_PALETTE[hash % TEAM_COLOR_PALETTE.length]
}

function DatePillInput({ value, onChange }) {
  const inputRef = useRef(null)

  const openPicker = () => {
    inputRef.current?.showPicker?.() ?? inputRef.current?.focus()
  }

  return (
    <div className="filtros-panel__date-pill" onClick={openPicker}>
      <img src={calendarBlankIcon} width={20} height={20} alt="" />
      <span
        className={
          value
            ? 'filtros-panel__date-pill-text'
            : 'filtros-panel__date-pill-text filtros-panel__date-pill-text--placeholder'
        }
      >
        {value ? formatDateDMonthYear(value) : 'Selecionar data'}
      </span>
      <input
        ref={inputRef}
        type="date"
        className="filtros-panel__date-native-input"
        value={value ?? ''}
        onChange={(event) => {
          if (event.target.value) onChange(event.target.value)
        }}
      />
    </div>
  )
}

function createEmptyDraft() {
  return {
    time: new Set(),
    cargo: new Set(),
    tipo: new Set(),
    status: new Set(),
    periodo: { start: null, end: null },
  }
}

function cloneFilters(filters) {
  return {
    time: new Set(filters.time),
    cargo: new Set(filters.cargo),
    tipo: new Set(filters.tipo),
    status: new Set(filters.status),
    periodo: { ...filters.periodo },
  }
}

function FiltrosPanel({
  isOpen,
  onClose,
  filters,
  onSave,
  timeOptions,
  cargoOptions,
  tipoOptions,
  statusOptions,
}) {
  const [draft, setDraft] = useState(createEmptyDraft)
  const [visibleCargoCount, setVisibleCargoCount] = useState(5)

  useEffect(() => {
    if (isOpen) {
      setDraft(cloneFilters(filters))
      setVisibleCargoCount(5)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const toggleDraftOption = (category, value) => {
    setDraft((prev) => {
      const next = new Set(prev[category])
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }
      return { ...prev, [category]: next }
    })
  }

  const setDraftPeriodoDate = (which, isoDate) => {
    setDraft((prev) => ({
      ...prev,
      periodo: { ...prev.periodo, [which]: isoDate },
    }))
  }

  const handleCancel = () => {
    onClose()
  }

  const handleSave = () => {
    onSave(draft)
    onClose()
  }

  const cargosToShow = cargoOptions.slice(0, visibleCargoCount)
  const hasMoreCargos = visibleCargoCount < cargoOptions.length

  return (
    <>
      <PainelLateral
        className="gp-painel gp-painel--rolagem-afastada"
        classNameVeu="gp-painel"
        aberto={isOpen}
        titulo="Filtros"
        iconeFechar={closeIcon}
        onFechar={handleCancel}
        rotuloCancelar="Cancelar"
        rotuloConfirmar="Salvar Filtros"
        onConfirmar={handleSave}
      >
        <>
          <section className="filtros-panel__section">
            <span className="filtros-panel__label">Time:</span>
            <div className="filtros-panel__pills">
              {timeOptions.map((name) => (
                <FilterPill
                  key={name}
                  selected={draft.time.has(name)}
                  onClick={() => toggleDraftOption('time', name)}
                >
                  <span
                    className="filtros-panel__dot"
                    style={{ background: getTeamColor(name) }}
                  />
                  {name}
                </FilterPill>
              ))}
            </div>
          </section>

          <section className="filtros-panel__section">
            <span className="filtros-panel__label">Cargo:</span>
            <div className="filtros-panel__pills">
              {cargosToShow.map((name) => (
                <FilterPill
                  key={name}
                  selected={draft.cargo.has(name)}
                  onClick={() => toggleDraftOption('cargo', name)}
                >
                  {name}
                </FilterPill>
              ))}
              {hasMoreCargos && (
                <FilterPill onClick={() => setVisibleCargoCount((count) => count + 5)}>Ver mais...</FilterPill>
              )}
            </div>
          </section>

          <section className="filtros-panel__section">
            <span className="filtros-panel__label">Período:</span>
            <div className="filtros-panel__periodo-row">
              <DatePillInput
                value={draft.periodo.start}
                onChange={(value) => setDraftPeriodoDate('start', value)}
              />
              <span className="filtros-panel__periodo-connector">a</span>
              <DatePillInput
                value={draft.periodo.end}
                onChange={(value) => setDraftPeriodoDate('end', value)}
              />
            </div>
          </section>

          <section className="filtros-panel__section">
            <span className="filtros-panel__label">Tipo:</span>
            <div className="filtros-panel__pills">
              {tipoOptions.map((name) => (
                <FilterPill
                  key={name}
                  selected={draft.tipo.has(name)}
                  onClick={() => toggleDraftOption('tipo', name)}
                >
                  {name}
                </FilterPill>
              ))}
            </div>
          </section>

          <section className="filtros-panel__section filtros-panel__section--last">
            <span className="filtros-panel__label">Status:</span>
            <div className="filtros-panel__pills">
              {statusOptions.map((name) => (
                <FilterPill
                  key={name}
                  selected={draft.status.has(name)}
                  onClick={() => toggleDraftOption('status', name)}
                >
                  {name}
                </FilterPill>
              ))}
            </div>
          </section>
        </>
      </PainelLateral>
    </>
  )
}

export default FiltrosPanel
