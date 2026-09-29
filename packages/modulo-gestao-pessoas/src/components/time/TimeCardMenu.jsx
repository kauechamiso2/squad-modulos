import { useEffect, useRef, useState } from 'react'
import { Eye } from '@phosphor-icons/react'
import dotsThreeIcon from '../../assets/icons/DotsThree.svg'
import trashIcon from '../../assets/icons/Trash.svg'
import DeleteTimeModal from './DeleteTimeModal.jsx'
import { COLLECTIONS, getCollection, setCollection } from '../../utils/storage.js'
import { useToast } from '../toast/ToastContext.jsx'
import './TimeCardMenu.css'
import { IconButton } from '@squad/ui'

function TimeCardMenu({ team, onView, onDataChanged }) {
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const containerRef = useRef(null)

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

  const handleView = () => {
    setOpen(false)
    onView?.(team.id)
  }

  const handleDeleteConfirm = () => {
    const updatedTimes = getCollection(COLLECTIONS.TIMES).filter((item) => item.id !== team.id)
    setCollection(COLLECTIONS.TIMES, updatedTimes)

    const updatedCollaborators = getCollection(COLLECTIONS.COLABORADORES).map((collaborator) =>
      Array.isArray(collaborator.times) && collaborator.times.includes(team.name)
        ? { ...collaborator, times: [] }
        : collaborator,
    )
    setCollection(COLLECTIONS.COLABORADORES, updatedCollaborators)
    onDataChanged?.(updatedCollaborators)
    showToast('danger', 'Time excluído com sucesso')
    setDeleteModalOpen(false)
  }

  return (
    <div
      className="time-card-menu"
      ref={containerRef}
      onClick={(event) => event.stopPropagation()}
    >
      <IconButton
        icon={dotsThreeIcon}
        alt="Mais opções"
        iconSize={24}
        className="time-card__menu-button"
        onClick={() => setOpen((prev) => !prev)}
      />

      {open && (
        <div className="time-card-menu__dropdown">
          <button type="button" className="time-card-menu__item" onClick={handleView}>
            <Eye size={20} color="var(--color-text-secondary)" />
            Ver time
          </button>
          <button
            type="button"
            className="time-card-menu__item"
            onClick={() => {
              setOpen(false)
              setDeleteModalOpen(true)
            }}
          >
            <img src={trashIcon} width={20} height={20} alt="" />
            Excluir
          </button>
        </div>
      )}

      {deleteModalOpen && (
        <DeleteTimeModal
          name={team.name}
          onCancel={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  )
}

export default TimeCardMenu
