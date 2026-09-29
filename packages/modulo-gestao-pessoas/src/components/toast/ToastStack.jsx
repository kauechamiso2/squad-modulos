import { Check, Trash } from '@phosphor-icons/react'
import closeIcon from '../../assets/icons/Close.svg'
import closeWhiteIcon from '../../assets/icons/CloseWhite.svg'
import './Toast.css'
import { IconButton } from '@squad/ui'

function ToastItem({ toast, onDismiss }) {
  const isSuccess = toast.variant === 'success'

  return (
    <div
      className={
        toast.exiting
          ? `toast toast--${toast.variant} toast--exiting`
          : `toast toast--${toast.variant}`
      }
    >
      <span className="toast__badge">
        {isSuccess ? (
          <Check size={20} color="#60c60c" weight="bold" />
        ) : (
          <Trash size={20} color="var(--color-text)" />
        )}
      </span>
      <p className="toast__message">{toast.message}</p>
      <IconButton
        icon={isSuccess ? closeWhiteIcon : closeIcon}
        alt="Fechar"
        size={40}
        iconSize={20}
        onClick={onDismiss}
        className="toast__close-button"
      />
    </div>
  )
}

function ToastStack({ toasts, onDismiss }) {
  if (toasts.length === 0) return null

  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  )
}

export default ToastStack
