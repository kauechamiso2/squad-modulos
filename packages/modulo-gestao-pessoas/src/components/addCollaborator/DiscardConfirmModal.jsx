import { XCircle } from '@phosphor-icons/react'
import ConfirmModal from '../ConfirmModal.jsx'

function DiscardConfirmModal({ onCancel, onConfirm }) {
  return (
    <ConfirmModal
      icon={XCircle}
      title="Descartar edições."
      message="Tem certeza que deseja descartar? Ao sair, todo o progresso será perdido. Nenhuma informação será salva."
      confirmLabel="Descartar"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}

export default DiscardConfirmModal
