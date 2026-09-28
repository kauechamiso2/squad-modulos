import { WizardShell } from '@squad/ui'
import '@squad/ui/styles/buttons.css'
import '@squad/ui/styles/Step1BasicInfo.css'
import './Step2Beneficio.css'

function OutroChooserStep({ onChoose, onBack, onExit }) {
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
    >
      <div className="step1">
        <p className="step2-beneficio__label">Fixo ou verba?</p>
        <div className="step2-beneficio__outro-options">
          {['Fixo', 'Verba'].map((option) => (
            <button
              type="button"
              key={option}
              className="step2-beneficio__outro-option"
              onClick={() => onChoose(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </WizardShell>
  )
}

export default OutroChooserStep
