import { FileText, ArrowUpRight } from '@phosphor-icons/react'
import CltShell from './clt/CltShell.jsx'
import './clt/CltShell.css'
import './TipoContratacaoStep.css'

const CARDS = [
  { id: 'CLT', label: 'CLT' },
  { id: 'PJ', label: 'PJ' },
  { id: 'Freelancer', label: 'Freelancer' },
  { id: 'Consultor', label: 'Consultor' },
]

function TipoContratacaoStep({ onChoose, onExit }) {
  return (
    <CltShell onClose={onExit}>
      <div className="tipo-contratacao__center">
        <div className="clt-shell__content tipo-contratacao__content">
          <h1 className="clt-shell__title">
            Qual o tipo
            <br />
            de contratação?
          </h1>

          <div className="tipo-contratacao__grid">
            {CARDS.map((card) => (
              <button
                type="button"
                key={card.id}
                className="tipo-contratacao__card"
                onClick={() => onChoose(card.id)}
              >
                <div className="tipo-contratacao__card-top">
                  <span className="tipo-contratacao__card-badge">
                    <FileText size={24} color="#5d4309" />
                  </span>
                  <ArrowUpRight size={24} color="var(--color-text-secondary)" />
                </div>
                <span className="tipo-contratacao__card-label">{card.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </CltShell>
  )
}

export default TipoContratacaoStep
