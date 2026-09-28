import caretRightIcon from '../../assets/icons/CaretRight.svg'
import { WizardShell } from '@squad/ui'
import '@squad/ui/styles/buttons.css'
import '@squad/ui/styles/Step1BasicInfo.css'
import '@squad/ui/styles/Step2AdditionalInfo.css'

function Step1CargoInfo({
  name,
  onNameChange,
  memberCount,
  onOpenColaboradores,
  onExit,
  onContinue,
}) {
  const canContinue = name.trim().length > 0

  return (
    <WizardShell
      title="Novo Cargo"
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
          placeholder="Nome do cargo"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
        />

        <div className="step2__list">
          <button
            type="button"
            className="step2__row"
            onClick={onOpenColaboradores}
          >
            <span
              className={
                memberCount > 0
                  ? 'step2__row-label step2__row-label--filled'
                  : 'step2__row-label'
              }
            >
              Colaboradores
            </span>
            <span className="step2__row-action">
              {memberCount > 0 ? `${memberCount} pessoas` : 'Adicionar'}
            </span>
            <span className="step2__row-icon">
              <img src={caretRightIcon} alt="" width={24} height={24} />
            </span>
          </button>
        </div>
      </div>
    </WizardShell>
  )
}

export default Step1CargoInfo
