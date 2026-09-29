import closeIcon from '../../../assets/icons/Close.svg'
import './CltShell.css'
import { IconButton } from '@squad/ui'

// Shared shell, reused across flows (Novo Colaborador, Novo Time, ...): the
// soft gradient background, fixed header, and (when footerLeft/footerRight
// are given) a fixed footer with a progress bar. Tela 1 (tipo de
// contratação) renders no footer at all, since it navigates immediately on
// card click.
function CltShell({ title = 'Novo Colaborador', onClose, progress, footerLeft, footerRight, children }) {
  const hasFooter = Boolean(footerLeft || footerRight)

  return (
    <div className="clt-shell">
      <header className="clt-shell__header">
        <span className="clt-shell__header-title">{title}</span>
        <IconButton icon={closeIcon} alt="Fechar" onClick={onClose} />
      </header>

      <div className="clt-shell__body">{children}</div>

      {hasFooter && (
        <footer className="clt-shell__footer">
          <div className="clt-shell__progress-track">
            <div className="clt-shell__progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="clt-shell__footer-row">
            {footerLeft}
            {footerRight}
          </div>
        </footer>
      )}
    </div>
  )
}

export default CltShell
