import './ModalOverlay.css'

function ModalOverlay({ children, width, className = '' }) {
  return (
    <div className="modal-overlay">
      <div
        className={`modal-panel ${className}`.trim()}
        style={{ width }}
      >
        {children}
      </div>
    </div>
  )
}

export default ModalOverlay
