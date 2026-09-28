import { WizardShell } from '@squad/ui'
import { BENEFICIO_TYPES, getBeneficioTypeIcon } from '../../utils/beneficioOptions.js'
import '@squad/ui/styles/buttons.css'
import './Step1TipoBeneficio.css'

function Step1TipoBeneficio({ onChoose, onExit }) {
  return (
    <WizardShell
      title="Novo Benefício"
      onClose={onExit}
      progress={25}
      footerLeft={
        <button type="button" className="text-button" onClick={onExit}>
          Voltar
        </button>
      }
    >
      <div className="beneficio-tipo">
        <p className="beneficio-tipo__label">Qual o tipo de benefício?</p>
        <div className="beneficio-tipo__grid">
          {BENEFICIO_TYPES.map((tipo) => {
            const IconComponent = getBeneficioTypeIcon(tipo)
            return (
              <button
                type="button"
                key={tipo}
                className="beneficio-tipo__card"
                onClick={() => onChoose(tipo)}
              >
                <span className="beneficio-tipo__card-icon">
                  <IconComponent size={48} />
                </span>
                <span className="beneficio-tipo__card-label">{tipo}</span>
              </button>
            )
          })}
        </div>
      </div>
    </WizardShell>
  )
}

export default Step1TipoBeneficio
