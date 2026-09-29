import { Trash } from '@phosphor-icons/react'
import ConfirmModal from '../ConfirmModal.jsx'

function DeleteColaboradorModal({ name, onCancel, onConfirm }) {
  return (
    <ConfirmModal
      icon={Trash}
      title={`Excluir ${name}?`}
      message={`Tem certeza que quer excluir o colaborador ${name}? Essa ação não pode ser desfeita. Se preferir, você pode desligá-lo e mantê-lo na sua lista de colaboradores.`}
      confirmLabel="Excluir"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}

export default DeleteColaboradorModal
