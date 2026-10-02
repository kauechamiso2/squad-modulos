import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { generateId } from '../../utils/storage.js'
import ToastStack from './ToastStack.jsx'

const ToastContext = createContext(null)

const AUTO_DISMISS_MS = 5000
// Matches the fly-out keyframes' own duration (see Toast.css) - the exit
// animation must finish playing before the toast is actually unmounted.
const EXIT_ANIMATION_MS = 350

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef(new Map())

  const dismissToast = useCallback(
    (id) => {
      setToasts((prev) =>
        prev.map((toast) => (toast.id === id ? { ...toast, exiting: true } : toast)),
      )
      const timers = timersRef.current.get(id) ?? {}
      clearTimeout(timers.autoDismiss)
      timers.remove = setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
        timersRef.current.delete(id)
      }, EXIT_ANIMATION_MS)
      timersRef.current.set(id, timers)
    },
    [],
  )

  const showToast = useCallback(
    (variant, message) => {
      const id = generateId()
      setToasts((prev) => [...prev, { id, variant, message, exiting: false }])
      const autoDismiss = setTimeout(() => dismissToast(id), AUTO_DISMISS_MS)
      timersRef.current.set(id, { autoDismiss })
    },
    [dismissToast],
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
