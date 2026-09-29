import CltShell from '../../addCollaborator/clt/CltShell.jsx'
import InlineEditField from '../../colaborador/InlineEditField.jsx'
import { isValidEmail } from '../../../utils/formatters.js'
import '@squad/ui/styles/buttons.css'
import '../../addCollaborator/clt/CltShell.css'
import '../../colaborador/ColaboradorDetail.css'
import '../../addTeam/novoTime/NovoTimeSteps.css'

function BeneficioInfoStep({ infoAdicional, onInfoAdicionalChange, onBack, onClose, onCreate }) {
  return (
    <CltShell
      title="Novo Benefício"
      onClose={onClose}
      progress={100}
      footerLeft={
        <button type="button" className="text-button" onClick={onBack}>
          Voltar
        </button>
      }
      footerRight={
        <button type="button" className="pill-button" onClick={onCreate}>
          Criar benefício
        </button>
      }
    >
      <div className="clt-shell__content">
        <h1 className="clt-shell__title">
          Finalize com algumas
          <br />
          informações adicionais.
        </h1>

        <div>
          <div className="time-step__row time-step__row--bordered">
            <span className="time-step__row-label" style={{ flex: 1 }}>
              Link do benefício
            </span>
            <InlineEditField
              value={infoAdicional.link}
              displayValue={infoAdicional.link || 'Adicionar'}
              onSave={(draft) => onInfoAdicionalChange('link', draft)}
            />
          </div>

          <div className="time-step__row time-step__row--bordered">
            <span className="time-step__row-label" style={{ flex: 1 }}>
              Contato do fornecedor
            </span>
            <InlineEditField
              value={infoAdicional.contato}
              displayValue={infoAdicional.contato || 'Adicionar'}
              onSave={(draft) => onInfoAdicionalChange('contato', draft)}
            />
          </div>

          <div className="time-step__row time-step__row--bordered">
            <span className="time-step__row-label" style={{ flex: 1 }}>
              Email do fornecedor
            </span>
            <InlineEditField
              value={infoAdicional.email}
              displayValue={infoAdicional.email || 'Adicionar'}
              validate={(draft) => isValidEmail(draft)}
              onSave={(draft) => onInfoAdicionalChange('email', draft)}
            />
          </div>
        </div>
      </div>
    </CltShell>
  )
}

export default BeneficioInfoStep
