import { WizardShell } from '@squad/ui'
import '@squad/ui/styles/buttons.css'
import '@squad/ui/styles/Step1BasicInfo.css'
import '@squad/ui/styles/LargeFieldInput.css'
import './Step2Beneficio.css'

const OUTRO_NAME_COPY = {
  Fixo: { label: 'Nome do benefício', placeholder: 'Ex: Netflix corporativo' },
  Verba: { label: 'Título da verba', placeholder: 'Ex: Verba de home office' },
}

function OutroNomeStep({ outroSubtipo, outroName, onOutroNameChange, onBack, onExit, onContinue }) {
  const copy = OUTRO_NAME_COPY[outroSubtipo] ?? OUTRO_NAME_COPY.Fixo
  const canContinue = outroName.trim().length > 0

  return (
    <WizardShell
      title="Novo Benefício"
      onClose={onExit}
      progress={50}
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
      <div className="step1">
        <div className="step2-beneficio__outro-name">
          <p className="step2-beneficio__label">{copy.label}</p>
          <input
            type="text"
            autoFocus
            className="large-field-input"
            placeholder={copy.placeholder}
            value={outroName}
            onChange={(event) => onOutroNameChange(event.target.value)}
          />
        </div>
      </div>
    </WizardShell>
  )
}

export default OutroNomeStep
