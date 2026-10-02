import { Trash } from '@phosphor-icons/react'
import ConfirmModal from '../ConfirmModal.jsx'

// "Excluir recurso" - contexto, secao 11.
function DeleteRecursoModal({ name, onCancel, onConfirm }) {
  return (
    <ConfirmModal
      icon={Trash}
      title={`Excluir ${name}?`}
      message={`Tem certeza que quer excluir o recurso ${name}? Essa ação não pode ser desfeita.`}
      confirmLabel="Excluir"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}

export default DeleteRecursoModal
