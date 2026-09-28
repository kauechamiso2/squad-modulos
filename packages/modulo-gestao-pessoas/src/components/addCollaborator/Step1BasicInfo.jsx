import caretRightIcon from '../../assets/icons/CaretRight.svg'
import { WizardShell } from '@squad/ui'
import '@squad/ui/styles/buttons.css'
import '@squad/ui/styles/Step1BasicInfo.css'

function Step1BasicInfo({
  name,
  onNameChange,
  contractType,
  onOpenContrato,
  onExit,
  onContinue,
}) {
  const canContinue = name.trim().length > 0

  return (
    <WizardShell
      onClose={onExit}
      progress={50}
      footerLeft={
        <button type="button" className="text-button" onClick={onExit}>
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
        <input
          type="text"
          className="step1__name-input"
          placeholder="Nome do Colaborador"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
        />

        <div className="step1__contract">
          <p className="step1__contract-label">Qual o tipo de contratação?</p>
          <button
            type="button"
            className="step1__contract-row"
            onClick={onOpenContrato}
          >
            <span className="step1__contract-row-key">Contrato</span>
            <span className="step1__contract-row-value">{contractType}</span>
            <span className="step1__contract-row-icon">
              <img src={caretRightIcon} alt="" width={24} height={24} />
            </span>
          </button>
        </div>
      </div>
    </WizardShell>
  )
}

export default Step1BasicInfo
