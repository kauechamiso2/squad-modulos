import { Power } from '@phosphor-icons/react'
import ConfirmModal from '../ConfirmModal.jsx'

function DesligarColaboradorModal({ name, onCancel, onConfirm }) {
  return (
    <ConfirmModal
      icon={Power}
      title={`Desligar ${name}?`}
      message={`Tem certeza que quer desligar o colaborador ${name}? Os campos ficarão bloqueados para edição, mas você continuará vendo o perfil. Essa ação não pode ser desfeita.`}
      confirmLabel="Desligar"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}

export default DesligarColaboradorModal
