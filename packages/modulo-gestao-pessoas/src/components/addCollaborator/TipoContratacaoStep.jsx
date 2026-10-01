import fileTextIcon from '../../assets/icons/FileText.svg'
import arrowUpRightIcon from '../../assets/icons/ArrowUpRight.svg'
import CltShell from './clt/CltShell.jsx'
import './clt/CltShell.css'
import './TipoContratacaoStep.css'

const CARDS = [
  { id: 'CLT', label: 'CLT' },
  { id: 'PJ', label: 'PJ' },
]

/*
 * Passo 1 - Figma 10338:10471. Sem rodape: o clique no card avanca.
 */
function TipoContratacaoStep({ onChoose, onExit }) {
  return (
    <CltShell onClose={onExit}>
      <div className="clt-shell__content">
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
                  <img src={fileTextIcon} width={24} height={24} alt="" />
                </span>
                <img src={arrowUpRightIcon} width={24} height={24} alt="" />
              </div>
              <span className="tipo-contratacao__card-label">{card.label}</span>
            </button>
          ))}
        </div>
      </div>
    </CltShell>
  )
}

export default TipoContratacaoStep
