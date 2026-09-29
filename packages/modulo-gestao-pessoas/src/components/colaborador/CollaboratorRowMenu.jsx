import { useEffect, useRef, useState } from 'react'
import { Eye, Power } from '@phosphor-icons/react'
import dotsThreeIcon from '../../assets/icons/DotsThree.svg'
import trashIcon from '../../assets/icons/Trash.svg'
import { IconButton } from '@squad/ui'
import DeleteColaboradorModal from './DeleteColaboradorModal.jsx'
import DesligarColaboradorModal from './DesligarColaboradorModal.jsx'
import { COLLECTIONS, getCollection, setCollection } from '../../utils/storage.js'
import { useToast } from '../toast/ToastContext.jsx'
import './CollaboratorRowMenu.css'

function CollaboratorRowMenu({ collaborator, onView, onDataChanged }) {
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [desligarModalOpen, setDesligarModalOpen] = useState(false)
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

  const desligado = Boolean(collaborator.desligado)

  const updateCollaborator = (updater) => {
    const updated = getCollection(COLLECTIONS.COLABORADORES).map((item) =>
      item.id === collaborator.id ? updater(item) : item,
    )
    setCollection(COLLECTIONS.COLABORADORES, updated)
    onDataChanged?.(updated)
  }

  const handleView = () => {
    setOpen(false)
    onView?.(collaborator.id)
  }

  const handleDeleteConfirm = () => {
    const updated = getCollection(COLLECTIONS.COLABORADORES).filter(
      (item) => item.id !== collaborator.id,
    )
    setCollection(COLLECTIONS.COLABORADORES, updated)
    onDataChanged?.(updated)
    showToast('danger', 'Colaborador excluído com sucesso')
    setDeleteModalOpen(false)
  }

  const handlePowerClick = () => {
    setOpen(false)
    if (desligado) {
      updateCollaborator((item) => ({ ...item, desligado: false }))
      return
    }
    setDesligarModalOpen(true)
  }

  const handleDesligarConfirm = () => {
    updateCollaborator((item) => ({ ...item, desligado: true }))
    setDesligarModalOpen(false)
  }

  return (
    <div
      className="collaborator-row-menu"
      ref={containerRef}
      onClick={(event) => event.stopPropagation()}
    >
      <IconButton
        icon={dotsThreeIcon}
        alt="Mais opções"
        iconSize={24}
        onClick={() => setOpen((prev) => !prev)}
      />

      {open && (
        <div className="collaborator-row-menu__dropdown">
          <button type="button" className="collaborator-row-menu__item" onClick={handleView}>
            <Eye size={20} color="var(--color-text-secondary)" />
            Ver colaborador
          </button>
          <button
            type="button"
            className="collaborator-row-menu__item"
            onClick={() => {
              setOpen(false)
              setDeleteModalOpen(true)
            }}
          >
            <img src={trashIcon} width={20} height={20} alt="" />
            Excluir
          </button>
          <button type="button" className="collaborator-row-menu__item" onClick={handlePowerClick}>
            <Power size={20} color="var(--color-text-secondary)" />
            {desligado ? 'Reativar' : 'Desligar'}
          </button>
        </div>
      )}

      {deleteModalOpen && (
        <DeleteColaboradorModal
          name={collaborator.name}
          onCancel={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {desligarModalOpen && (
        <DesligarColaboradorModal
          name={collaborator.name}
          onCancel={() => setDesligarModalOpen(false)}
          onConfirm={handleDesligarConfirm}
        />
      )}
    </div>
  )
}

export default CollaboratorRowMenu
