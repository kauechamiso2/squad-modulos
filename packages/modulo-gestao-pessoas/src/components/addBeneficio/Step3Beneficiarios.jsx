import { useState } from 'react'
import caretRightIcon from '../../assets/icons/CaretRight.svg'
import { WizardShell } from '@squad/ui'
import BeneficiariosModal from './BeneficiariosModal.jsx'
import '@squad/ui/styles/buttons.css'
import '@squad/ui/styles/Step1BasicInfo.css'
import '@squad/ui/styles/Step2AdditionalInfo.css'

function Step3Beneficiarios({
  colaboradorIds,
  teamNames,
  todaEmpresa,
  onApplySelection,
  collaborators,
  times,
  onBack,
  onExit,
  onContinue,
}) {
  const [modalOpen, setModalOpen] = useState(false)

  const totalSelected = colaboradorIds.size + teamNames.size + (todaEmpresa ? 1 : 0)

  return (
    <WizardShell
      title="Novo Benefício"
      onClose={onExit}
      progress={75}
      footerLeft={
        <button type="button" className="text-button" onClick={onBack}>
          Voltar
        </button>
      }
      footerRight={
        <button type="button" className="pill-button" onClick={onContinue}>
          Continuar
        </button>
      }
    >
      <div className="step1">
        <p className="step2__section-label">Beneficiários</p>
        <div className="step2__list">
          <button type="button" className="step2__row" onClick={() => setModalOpen(true)}>
            <span
              className={
                totalSelected > 0
                  ? 'step2__row-label step2__row-label--filled'
                  : 'step2__row-label'
              }
            >
              Adicionar colaboradores
            </span>
            <span className="step2__row-action">
              {totalSelected > 0 ? `${totalSelected} selecionados` : 'Adicionar'}
            </span>
            <span className="step2__row-icon">
              <img src={caretRightIcon} alt="" width={24} height={24} />
            </span>
          </button>
        </div>
      </div>

      {modalOpen && (
        <BeneficiariosModal
          colaboradorIds={colaboradorIds}
          teamNames={teamNames}
          todaEmpresa={todaEmpresa}
          collaborators={collaborators}
          times={times}
          onClose={() => setModalOpen(false)}
          onSave={(selection) => {
            onApplySelection(selection)
            setModalOpen(false)
          }}
        />
      )}
    </WizardShell>
  )
}

export default Step3Beneficiarios
