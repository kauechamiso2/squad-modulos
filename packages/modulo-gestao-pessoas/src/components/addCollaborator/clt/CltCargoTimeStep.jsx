import { useEffect, useMemo, useRef, useState } from 'react'
import CheckVerde from '../../campos/CheckVerde.jsx'
import { Briefcase, Plus } from '@phosphor-icons/react'
import CltShell from './CltShell.jsx'
import NovoTimePanel from './NovoTimePanel.jsx'
import { COLLECTIONS, getCollection } from '../../../utils/storage.js'
import { getTeamColorTones, getTeamIconComponent } from '../../../utils/teamOptions.js'
import { useDropdownPosition } from '../../../utils/useDropdownPosition.js'
import '@squad/ui/styles/buttons.css'
import './CltShell.css'
import './CltCargoTimeStep.css'
import { Checkbox } from '@squad/ui'
import checkSquareIcon from '../../../assets/icons/CheckSquare.svg'

// onOpenCreate is optional - when omitted (the Cargo field), there's no
// "Add ..." row at all, since a cargo is plain free text with no separate
// record to create; typing and picking a suggestion both just set the
// value directly.
function EntityField({ value, onChange, items, placeholder, onOpenCreate, renderItemIcon }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const rect = useDropdownPosition(open, containerRef)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const trimmed = value.trim()
  const filtered = trimmed
    ? items.filter((item) => item.name.toLowerCase().includes(trimmed.toLowerCase()))
    : items
  const exactMatch = items.some((item) => item.name.toLowerCase() === trimmed.toLowerCase())
  const showCreate = Boolean(onOpenCreate) && trimmed.length > 0 && !exactMatch

  const select = (name) => {
    onChange(name)
    setOpen(false)
  }

  return (
    <div className="clt-cargo-time__field" ref={containerRef}>
      <div
        className={
          value
            ? 'clt-large-input-wrap clt-large-input-wrap--filled'
            : 'clt-large-input-wrap'
        }
      >
        <input
          type="text"
          className="clt-large-input"
          placeholder={placeholder}
          value={value}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            onChange(event.target.value)
            setOpen(true)
          }}
        />
        {value && <CheckVerde />}
      </div>

      {open && rect && (
        <div
          className="clt-cargo-time__dropdown"
          style={{ top: rect.top, left: rect.left, width: rect.width }}
        >
          {filtered.map((item) => (
            <button
              type="button"
              key={item.id}
              className="clt-cargo-time__dropdown-item"
              onClick={() => select(item.name)}
            >
              {renderItemIcon ? renderItemIcon(item) : <Briefcase size={24} />}
              <span className="clt-cargo-time__dropdown-item-label">{item.name}</span>
            </button>
          ))}

          {filtered.length === 0 && !showCreate && (
            <p className="clt-cargo-time__dropdown-empty">Nenhum resultado.</p>
          )}

          {showCreate && (
            <button
              type="button"
              className="clt-cargo-time__dropdown-create"
              onClick={() => {
                onOpenCreate(trimmed)
                setOpen(false)
              }}
            >
              <span>Add &quot;{trimmed}&quot;</span>
              <Plus size={24} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function CltCargoTimeStep({ name, initialCargo, initialTeam, onBack, onClose, onSkip, onContinue }) {
  const [times, setTimes] = useState(() => getCollection(COLLECTIONS.TIMES))
  const [collaborators] = useState(() => getCollection(COLLECTIONS.COLABORADORES))

  const [cargoName, setCargoName] = useState(initialCargo ?? '')
  const [teamName, setTeamName] = useState(initialTeam ?? '')

  const [novoTimeName, setNovoTimeName] = useState(null)

  // No dedicated cargo collection - suggestions are the distinct Cargo
  // values already in use among colaboradores, shaped like the {id, name}
  // items EntityField already expects (item.name doubles as a stable key).
  const cargoOptions = useMemo(() => {
    const names = new Set(collaborators.flatMap((collaborator) => collaborator.cargos))
    return Array.from(names).map((cargoName) => ({ id: cargoName, name: cargoName }))
  }, [collaborators])

  const teamsWithCounts = useMemo(() => {
    return times.map((team) => ({
      ...team,
      memberCount: collaborators.filter(
        (collaborator) => Array.isArray(collaborator.times) && collaborator.times.includes(team.name),
      ).length,
    }))
  }, [times, collaborators])

  const suggestedTeams = useMemo(
    () => [...teamsWithCounts].sort((a, b) => b.memberCount - a.memberCount).slice(0, 4),
    [teamsWithCounts],
  )

  const selectTeamChip = (team) => {
    setTeamName(team.name)
  }

  return (
    <>
      <CltShell
        onClose={onClose}
        progress={67}
        footerLeft={
          <button type="button" className="text-button" onClick={onBack}>
            Voltar
          </button>
        }
        footerRight={
          <div className="clt-shell__footer-row-right">
            <button type="button" className="text-button" onClick={onSkip}>
              Não tenho ainda, pular
            </button>
            <button
              type="button"
              className="pill-button"
              onClick={() => onContinue(cargoName.trim(), teamName.trim())}
            >
              Continuar
            </button>
          </div>
        }
      >
        <div className="clt-shell__content">
          <h1 className="clt-shell__title">
            Muito bem,
            <br />
            hora de definir o cargo e time
            <br />
            de <span className="clt-cargo-time__name-highlight">{name}</span>.
          </h1>

          <EntityField
            value={cargoName}
            onChange={setCargoName}
            items={cargoOptions}
            placeholder="Cargo"
          />

          <div className="clt-cargo-time__time-group">
            <p className="clt-cargo-time__time-label">Time:</p>
            <EntityField
              value={teamName}
              onChange={setTeamName}
              items={times}
              placeholder="Time"
              onOpenCreate={setNovoTimeName}
              renderItemIcon={(team) => {
                const { dark } = getTeamColorTones(team.color)
                return <span className="clt-cargo-time__dropdown-dot" style={{ background: dark }} />
              }}
            />
          </div>

          {suggestedTeams.length > 0 && (
            <div className="clt-cargo-time__chips">
              {suggestedTeams.map((team) => {
                const { light, dark } = getTeamColorTones(team.color)
                const TeamIcon = getTeamIconComponent(team.icon)
                const checked = teamName.trim().toLowerCase() === team.name.toLowerCase()
                return (
                  <button
                    type="button"
                    key={team.id}
                    className="clt-cargo-time__chip"
                    onClick={() => selectTeamChip(team)}
                  >
                    <Checkbox checked={checked} iconeMarcado={checkSquareIcon} />
                    <span className="clt-cargo-time__chip-badge" style={{ background: light }}>
                      <TeamIcon size={16} color={dark} />
                    </span>
                    <span className="clt-cargo-time__chip-label">{team.name}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </CltShell>

      {novoTimeName !== null && (
        <NovoTimePanel
          name={novoTimeName}
          onClose={() => setNovoTimeName(null)}
          onCreated={(newName) => {
            setTimes(getCollection(COLLECTIONS.TIMES))
            setTeamName(newName)
            setNovoTimeName(null)
          }}
        />
      )}
    </>
  )
}

export default CltCargoTimeStep
