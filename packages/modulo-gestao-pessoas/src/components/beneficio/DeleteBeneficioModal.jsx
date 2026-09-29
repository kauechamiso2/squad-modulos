import { Trash } from '@phosphor-icons/react'
import ConfirmModal from '../ConfirmModal.jsx'

function DeleteBeneficioModal({ name, onCancel, onConfirm }) {
  return (
    <ConfirmModal
      icon={Trash}
      title={`Excluir ${name}?`}
      message={`Tem certeza que quer excluir o benefício ${name}? Essa ação não pode ser desfeita.`}
      confirmLabel="Excluir"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}

export default DeleteBeneficioModal
