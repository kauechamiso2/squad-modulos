import { ArrowUpRight, Stethoscope, Van, ForkKnife, Barbell, Tooth, Shield } from '@phosphor-icons/react'
import CltShell from '../../addCollaborator/clt/CltShell.jsx'
import '../../addCollaborator/clt/CltShell.css'
import '../../addCollaborator/TipoContratacaoStep.css'
import './NovoBeneficioSteps.css'

const CATEGORIES = [
  { name: 'Plano de Saúde', Icon: Stethoscope },
  { name: 'Vale Transporte', Icon: Van },
  { name: 'Vale Alimentação', Icon: ForkKnife },
  { name: 'Bem-Estar', Icon: Barbell },
  { name: 'Plano Odontológico', Icon: Tooth },
  { name: 'Seguro de Vida', Icon: Shield },
]

function BeneficioTipoStep({ onChooseCategoria, onChooseOutro, onClose }) {
  return (
    <CltShell title="Novo Benefício" onClose={onClose}>
      <div className="tipo-contratacao__center">
        <div className="clt-shell__content tipo-contratacao__content">
          <h1 className="clt-shell__title">
            Qual o tipo de benefício
            <br />
            irá criar agora?
          </h1>

          <div>
            <div className="beneficio-tipo__grid">
              {CATEGORIES.map(({ name, Icon }) => (
                <button
                  type="button"
                  key={name}
                  className="tipo-contratacao__card"
                  onClick={() => onChooseCategoria(name)}
                >
                  <div className="tipo-contratacao__card-top">
                    <span className="tipo-contratacao__card-badge">
                      <Icon size={24} color="#5d4309" />
                    </span>
                    <ArrowUpRight size={24} color="#798282" />
                  </div>
                  <span className="tipo-contratacao__card-label">{name}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              className="beneficio-tipo__outro-row"
              style={{ marginTop: 12 }}
              onClick={onChooseOutro}
            >
              <span>Outro</span>
              <ArrowUpRight size={24} color="#798282" />
            </button>
          </div>
        </div>
      </div>
    </CltShell>
  )
}

export default BeneficioTipoStep
