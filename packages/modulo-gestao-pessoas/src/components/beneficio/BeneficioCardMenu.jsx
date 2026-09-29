import { useEffect, useRef, useState } from 'react'
import { Eye } from '@phosphor-icons/react'
import dotsThreeIcon from '../../assets/icons/DotsThree.svg'
import trashIcon from '../../assets/icons/Trash.svg'
import DeleteBeneficioModal from './DeleteBeneficioModal.jsx'
import { COLLECTIONS, getCollection, setCollection } from '../../utils/storage.js'
import { useToast } from '../toast/ToastContext.jsx'
import './BeneficioCardMenu.css'
import { IconButton } from '@squad/ui'

function BeneficioCardMenu({ benefit, onView, onDataChanged }) {
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
    onView?.(benefit.id)
  }

  const handleDeleteConfirm = () => {
    const updated = getCollection(COLLECTIONS.BENEFICIOS).filter((item) => item.id !== benefit.id)
    setCollection(COLLECTIONS.BENEFICIOS, updated)
    onDataChanged?.(updated)
    showToast('danger', 'Benefício excluído com sucesso')
    setDeleteModalOpen(false)
  }

  return (
    <div
      className="beneficio-card-menu"
      ref={containerRef}
      onClick={(event) => event.stopPropagation()}
    >
      <IconButton
        icon={dotsThreeIcon}
        alt="Mais opções"
        iconSize={24}
        className="beneficio-card__menu-button"
        onClick={() => setOpen((prev) => !prev)}
      />

      {open && (
        <div className="beneficio-card-menu__dropdown">
          <button type="button" className="beneficio-card-menu__item" onClick={handleView}>
            <Eye size={20} color="var(--color-text-secondary)" />
            Ver benefício
          </button>
          <button
            type="button"
            className="beneficio-card-menu__item"
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
        <DeleteBeneficioModal
          name={benefit.name}
          onCancel={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  )
}

export default BeneficioCardMenu
