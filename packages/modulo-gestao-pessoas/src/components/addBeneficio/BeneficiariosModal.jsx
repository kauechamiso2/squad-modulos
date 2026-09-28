import { useMemo, useState } from 'react'
import closeIcon from '../../assets/icons/Close.svg'
import magnifyingGlassIcon from '../../assets/icons/MagnifyingGlass.svg'
import { FieldModalShell } from '@squad/ui'
import '@squad/ui/styles/SelectListModal.css'
import './Step3Beneficiarios.css'

function BeneficiariosModal({
  colaboradorIds,
  teamNames,
  cargoNames,
  todaEmpresa,
  collaborators,
  times,
  cargos,
  onSave,
  onClose,
}) {
  const [localColaboradorIds, setLocalColaboradorIds] = useState(() => new Set(colaboradorIds))
  const [localTeamNames, setLocalTeamNames] = useState(() => new Set(teamNames))
  const [localCargoNames, setLocalCargoNames] = useState(() => new Set(cargoNames))
  const [localTodaEmpresa, setLocalTodaEmpresa] = useState(todaEmpresa)
  const [query, setQuery] = useState('')

  const entities = useMemo(() => {
    const list = [{ type: 'company', key: '__company__', label: 'Toda a empresa' }]
    collaborators.forEach((collaborator) =>
      list.push({ type: 'colaborador', key: collaborator.id, label: collaborator.name }),
    )
    times.forEach((team) => list.push({ type: 'time', key: team.name, label: `${team.name} (time)` }))
    cargos.forEach((cargo) => list.push({ type: 'cargo', key: cargo.name, label: `${cargo.name} (cargo)` }))
    return list
  }, [collaborators, times, cargos])

  const isSelected = (entity) => {
    if (entity.type === 'company') return localTodaEmpresa
    if (entity.type === 'colaborador') return localColaboradorIds.has(entity.key)
    if (entity.type === 'time') return localTeamNames.has(entity.key)
    return localCargoNames.has(entity.key)
  }

  const toggle = (entity) => {
    if (entity.type === 'company') {
      setLocalTodaEmpresa((prev) => !prev)
      return
    }
    const [setter, current] =
      entity.type === 'colaborador'
        ? [setLocalColaboradorIds, localColaboradorIds]
        : entity.type === 'time'
          ? [setLocalTeamNames, localTeamNames]
          : [setLocalCargoNames, localCargoNames]
    const next = new Set(current)
    if (next.has(entity.key)) {
      next.delete(entity.key)
    } else {
      next.add(entity.key)
    }
    setter(next)
  }

  const trimmedQuery = query.trim().toLowerCase()
  const available = entities.filter((entity) => !isSelected(entity))
  const filtered = trimmedQuery
    ? available.filter((entity) => entity.label.toLowerCase().includes(trimmedQuery))
    : available

  const chips = entities.filter(isSelected)

  return (
    <FieldModalShell
      title="Colaboradores, times, cargos"
      onClose={onClose}
      onSave={() =>
        onSave({
          colaboradorIds: localColaboradorIds,
          teamNames: localTeamNames,
          cargoNames: localCargoNames,
          todaEmpresa: localTodaEmpresa,
        })
      }
    >
      {chips.length > 0 && (
        <div className="step3-beneficiarios__chips">
          {chips.map((chip) => (
            <span className="step3-beneficiarios__chip" key={`${chip.type}-${chip.key}`}>
              {chip.label}
              <button
                type="button"
                className="step3-beneficiarios__chip-remove"
                onClick={() => toggle(chip)}
                aria-label={`Remover ${chip.label}`}
              >
                <img src={closeIcon} alt="" width={14} height={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="step3-beneficiarios__search-group">
        <div className="select-list__search">
          <input
            type="text"
            autoFocus
            className="select-list__search-input"
            placeholder="Buscar colaborador..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <img src={magnifyingGlassIcon} alt="" width={24} height={24} />
        </div>
        <p className="step3-beneficiarios__helper">
          Busque por nome, time, cargo ou selecione toda a empresa
        </p>
      </div>

      <div className="select-list__list">
        {filtered.map((entity) => (
          <button
            type="button"
            key={`${entity.type}-${entity.key}`}
            className="select-list__item"
            onClick={() => {
              toggle(entity)
              setQuery('')
            }}
          >
            <span
              className={
                entity.type === 'company'
                  ? 'select-list__item-label step3-beneficiarios__company-label'
                  : 'select-list__item-label'
              }
            >
              {entity.label}
            </span>
          </button>
        ))}
      </div>
    </FieldModalShell>
  )
}

export default BeneficiariosModal
