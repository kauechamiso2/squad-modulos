import { Check } from '@phosphor-icons/react'
import CltShell from '../../addCollaborator/clt/CltShell.jsx'
import '@squad/ui/styles/buttons.css'
import '../../addCollaborator/clt/CltShell.css'

function TimeNomeStep({ name, onNameChange, onBack, onClose, onContinue }) {
  const canContinue = name.trim().length > 0

  return (
    <CltShell
      title="Novo Time"
      onClose={onClose}
      progress={25}
      footerLeft={
        <button type="button" className="text-button" onClick={onBack}>
          Voltar
        </button>
      }
      footerRight={
        <button
          type="button"
          className="pill-button"
          disabled={!canContinue}
          onClick={onContinue}
        >
          Continuar
        </button>
      }
    >
      <div className="clt-shell__content">
        <h1 className="clt-shell__title">
          Qual será
          <br />
          o nome do time?
        </h1>

        <div
          className={
            name
              ? 'clt-large-input-wrap clt-large-input-wrap--filled'
              : 'clt-large-input-wrap'
          }
        >
          <input
            type="text"
            autoFocus
            className="clt-large-input"
            placeholder="Nome do time"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
          />
          {name && <Check size={24} weight="bold" className="clt-large-input-check" />}
        </div>
      </div>
    </CltShell>
  )
}

export default TimeNomeStep
