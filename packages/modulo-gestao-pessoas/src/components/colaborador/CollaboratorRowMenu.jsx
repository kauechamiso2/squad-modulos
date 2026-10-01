import { useEffect, useRef, useState } from 'react'
import { Eye } from '@phosphor-icons/react'
import dotsThreeIcon from '../../assets/icons/DotsThree.svg'
import trashIcon from '../../assets/icons/Trash.svg'
import { IconButton } from '@squad/ui'
import DeleteColaboradorModal from './DeleteColaboradorModal.jsx'
import { COLLECTIONS, getCollection, setCollection } from '../../utils/storage.js'
import { useToast } from '../toast/ToastContext.jsx'
import './CollaboratorRowMenu.css'

function CollaboratorRowMenu({ collaborator, onView, onDataChanged }) {
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
          {/* Desligar volta com o fluxo de desligamento (Topico 12). Reativar
              nao existe mais: Desligado e Fim de contrato sao finais. */}
        </div>
      )}

      {deleteModalOpen && (
        <DeleteColaboradorModal
          name={collaborator.name}
          onCancel={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  )
}

export default CollaboratorRowMenu
