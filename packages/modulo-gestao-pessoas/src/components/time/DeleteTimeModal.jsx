import { Trash } from '@phosphor-icons/react'
import ConfirmModal from '../ConfirmModal.jsx'

function DeleteTimeModal({ name, onCancel, onConfirm }) {
  return (
    <ConfirmModal
      icon={Trash}
      title={`Excluir ${name}?`}
      message={`Tem certeza que quer excluir o time ${name}? Essa ação não pode ser desfeita. Os colaboradores desse time ficarão sem time atribuído.`}
      confirmLabel="Excluir"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}

export default DeleteTimeModal
