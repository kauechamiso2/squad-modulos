import closeIcon from '../assets/icons/Close.svg'
import IconButton from './IconButton.jsx'
import './WizardShell.css'

function WizardShell({
  title = 'Novo Colaborador',
  onClose,
  progress,
  footerLeft,
  footerRight,
  children,
}) {
  return (
    <div className="wizard-shell">
      <header className="wizard-shell__header">
        <h1 className="wizard-shell__title">{title}</h1>
        <IconButton icon={closeIcon} alt="Fechar" onClick={onClose} />
      </header>
      <div className="wizard-shell__body">{children}</div>
      <footer className="wizard-shell__footer">
        <div className="wizard-shell__progress-track">
          <div
            className="wizard-shell__progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="wizard-shell__footer-row">
          {footerLeft}
          {footerRight}
        </div>
      </footer>
    </div>
  )
}

export default WizardShell
