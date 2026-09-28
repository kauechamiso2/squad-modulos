import { useEffect, useRef, useState } from 'react'
import caretDownIcon from '../../assets/icons/CaretDown.svg'
import { useDropdownPosition } from '../../utils/useDropdownPosition.js'
import { getTeamColorTones } from '../../utils/teamOptions.js'
import '@squad/ui/styles/SelectListModal.css'
import './ColaboradorDetail.css'

function TimeField({ value, times, disabled, onSave }) {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef(null)
  const rect = useDropdownPosition(open, anchorRef)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(event) {
      if (anchorRef.current && !anchorRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const currentName = value[0] ?? null
  const currentTeam = times.find((team) => team.name === currentName) ?? null
  const dotColor = currentTeam ? getTeamColorTones(currentTeam.color).dark : null

  const select = (name) => {
    onSave([name])
    setOpen(false)
  }

  return (
    <div className="colaborador-field" ref={anchorRef}>
      <button
        type="button"
        className="colaborador-field__pill"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
      >
        {currentName ? (
          <>
            <span className="colaborador-field__pill-dot" style={{ background: dotColor }} />
            <span className="colaborador-field__pill-label">{currentName}</span>
          </>
        ) : (
          <span className="colaborador-field__pill-label">Adicionar</span>
        )}
        <img src={caretDownIcon} alt="" width={16} height={16} />
      </button>

      {open && rect && (
        <div
          className="colaborador-field__dropdown"
          style={{ top: rect.top, left: rect.left }}
        >
          <div className="select-list__list">
            {times.map((team) => {
              const { dark } = getTeamColorTones(team.color)
              return (
                <button
                  type="button"
                  key={team.id}
                  className="select-list__item"
                  onClick={() => select(team.name)}
                >
                  <span className="colaborador-field__pill-dot" style={{ background: dark }} />
                  <span className="select-list__item-label">{team.name}</span>
                </button>
              )
            })}
            {times.length === 0 && <p className="select-list__empty">Nenhum time ainda.</p>}
          </div>
        </div>
      )}
    </div>
  )
}

export default TimeField
