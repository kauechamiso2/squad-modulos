import { useEffect, useMemo, useRef, useState } from 'react'
import CltShell from '../../addCollaborator/clt/CltShell.jsx'
import magnifyingGlassIcon from '../../../assets/icons/MagnifyingGlass.svg'
import { useDropdownPosition } from '../../../utils/useDropdownPosition.js'
import { getTeamColorTones, getTeamIconComponent } from '../../../utils/teamOptions.js'
import '@squad/ui/styles/buttons.css'
import '../../addCollaborator/clt/CltShell.css'
import './NovoTimeSteps.css'
import { Checkbox } from '@squad/ui'
import checkSquareIcon from '../../../assets/icons/CheckSquare.svg'

const VISIBLE_SLOTS = 6

function TimeMembrosStep({
  name,
  colorId,
  iconName,
  collaborators,
  memberOrder,
  onMemberOrderChange,
  onBack,
  onClose,
  onContinue,
}) {
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef(null)
  const rect = useDropdownPosition(searchOpen, searchRef)

  useEffect(() => {
    if (!searchOpen) return
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [searchOpen])

  const { light, dark } = getTeamColorTones(colorId)
  const TeamIcon = getTeamIconComponent(iconName)

  const byId = useMemo(
    () => Object.fromEntries(collaborators.map((collaborator) => [collaborator.id, collaborator])),
    [collaborators],
  )

  // Suggestion pool: everyone without a current team first, then everyone
  // else, each group alphabetical - a stable, consistent base ordering that
  // selection never mutates (only which people are pulled to the front, via
  // memberOrder, changes what's visible).
  const pool = useMemo(() => {
    return [...collaborators].sort((a, b) => {
      const aHasTeam = a.times.length > 0
      const bHasTeam = b.times.length > 0
      if (aHasTeam !== bHasTeam) return aHasTeam ? 1 : -1
      return a.name.localeCompare(b.name)
    })
  }, [collaborators])

  const selectedSet = useMemo(() => new Set(memberOrder), [memberOrder])

  // While fewer than 6 people are selected, the grid always shows exactly 6
  // cards: selected people first (most-recently-selected first), padded out
  // with the next unselected suggestions - so selecting someone new (from a
  // card or via search) evicts whoever was sitting in the last slot. Once 6
  // or more are selected, the grid is exactly the selected people, growing
  // downward with no eviction.
  const displayList = useMemo(() => {
    const selectedPeople = memberOrder.map((id) => byId[id]).filter(Boolean)
    if (selectedPeople.length >= VISIBLE_SLOTS) return selectedPeople
    const unselectedFromPool = pool.filter((collaborator) => !selectedSet.has(collaborator.id))
    return [...selectedPeople, ...unselectedFromPool].slice(0, VISIBLE_SLOTS)
  }, [memberOrder, byId, pool, selectedSet])

  const toggle = (id) => {
    if (selectedSet.has(id)) {
      onMemberOrderChange(memberOrder.filter((memberId) => memberId !== id))
    } else {
      onMemberOrderChange([id, ...memberOrder])
    }
  }

  const selectFromSearch = (id) => {
    onMemberOrderChange([id, ...memberOrder.filter((memberId) => memberId !== id)])
    setQuery('')
    setSearchOpen(false)
  }

  const trimmedQuery = query.trim().toLowerCase()
  const filtered = trimmedQuery
    ? collaborators.filter((collaborator) => collaborator.name.toLowerCase().includes(trimmedQuery))
    : collaborators

  return (
    <CltShell
      title="Novo Time"
      onClose={onClose}
      progress={75}
      footerLeft={
        <button type="button" className="text-button" onClick={onBack}>
          Voltar
        </button>
      }
      footerRight={
        <button type="button" className="pill-button" onClick={onContinue}>
          Continuar
        </button>
      }
    >
      <div className="clt-shell__content">
        <h1 className="clt-shell__title">
          Quem faz parte
          <br />
          do time{' '}
          <span className="time-step__title-badge" style={{ background: light }}>
            <TeamIcon size={20} color={dark} />
          </span>{' '}
          <span style={{ color: dark }}>{name}</span>?
        </h1>

        <div>
          <div className="time-step__search" ref={searchRef}>
            <input
              type="text"
              className="time-step__search-input"
              placeholder="Buscar nome..."
              value={query}
              onFocus={() => setSearchOpen(true)}
              onChange={(event) => {
                setQuery(event.target.value)
                setSearchOpen(true)
              }}
            />
            <img src={magnifyingGlassIcon} alt="" width={24} height={24} />

            {searchOpen && rect && (
              <div className="time-step__search-dropdown" style={{ top: rect.top, left: rect.left, width: rect.width }}>
                {filtered.length === 0 && (
                  <p className="time-step__search-dropdown-empty">Nenhum resultado.</p>
                )}
                {filtered.map((collaborator) => (
                  <button
                    type="button"
                    key={collaborator.id}
                    className="time-step__search-dropdown-item"
                    onClick={() => selectFromSearch(collaborator.id)}
                  >
                    {collaborator.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="time-step__grid" style={{ marginTop: 12 }}>
            {displayList.map((collaborator) => {
              const checked = selectedSet.has(collaborator.id)
              return (
                <button
                  type="button"
                  key={collaborator.id}
                  className={
                    checked ? 'time-step__card time-step__card--selected' : 'time-step__card'
                  }
                  onClick={() => toggle(collaborator.id)}
                >
                  <Checkbox checked={checked} iconeMarcado={checkSquareIcon} />
                  <div className="time-step__card-info">
                    <span className="time-step__card-name">{collaborator.name}</span>
                    <span className="time-step__card-cargo">{collaborator.cargos.join(', ')}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </CltShell>
  )
}

export default TimeMembrosStep
