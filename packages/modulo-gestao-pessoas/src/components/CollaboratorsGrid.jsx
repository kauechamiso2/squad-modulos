import squareIcon from '../assets/icons/Square.svg'
import checkSquareIcon from '../assets/icons/CheckSquare.svg'
import StatusPill from './status/StatusPill.jsx'
import AusenciaBadge from './status/AusenciaBadge.jsx'
import AlertaCadastro from './status/AlertaCadastro.jsx'
import CollaboratorRowMenu from './colaborador/CollaboratorRowMenu.jsx'
import { getAusenciaAtiva, getStatus, isEncerrado } from '../utils/colaboradorStatus.js'
import { todayIso } from '../utils/formatters.js'
import './CollaboratorsGrid.css'

// Valor vazio da plataforma (contexto, Topico 1).
const VAZIO = '—'

function joinOrEmpty(values) {
  return values.length > 0 ? values.join(', ') : VAZIO
}

/*
 * Card do grid - Figma 10331:4571 (cards 10331:4602 e 10331:4693). Sem foto.
 * Topo: checkbox; a direita, o badge de ausencia (se houver) e o menu. Meio:
 * nome, cargo e time. Base: o Tipo em texto simples e o pill de status.
 */
function CollaboratorsGrid({
  collaborators,
  selectedIds,
  onToggleSelect,
  onCardClick,
  onDataChanged,
  alertas,
}) {
  const hoje = todayIso()

  return (
    <div className="collaborators-grid">
      {collaborators.map((collaborator) => {
        const isSelected = selectedIds.has(collaborator.id)
        const status = getStatus(collaborator)
        const ausencia = getAusenciaAtiva(collaborator, hoje)
        const classes = ['collaborator-card']
        if (isSelected) classes.push('collaborator-card--selected')
        if (isEncerrado(status)) classes.push('collaborator-card--esmaecido')
        return (
          <div
            className={classes.join(' ')}
            key={collaborator.id}
            onClick={() => onCardClick?.(collaborator.id)}
          >
            <div className="collaborator-card__top-row">
              <button
                type="button"
                className="collaborator-card__checkbox"
                onClick={(event) => {
                  event.stopPropagation()
                  onToggleSelect(collaborator.id)
                }}
              >
                <img
                  src={isSelected ? checkSquareIcon : squareIcon}
                  width={24}
                  height={24}
                  alt=""
                />
              </button>
              <div className="collaborator-card__acoes">
                {ausencia && <AusenciaBadge ausencia={ausencia} />}
                {alertas.has(collaborator.id) && (
                  <AlertaCadastro onAbrir={() => onCardClick(collaborator.id)} />
                )}
                <CollaboratorRowMenu
                  collaborator={collaborator}
                  onView={onCardClick}
                  onDataChanged={onDataChanged}
                />
              </div>
            </div>

            <div className="collaborator-card__info">
              <span className="collaborator-card__name">
                {collaborator.name}
              </span>
              <span className="collaborator-card__meta">
                {joinOrEmpty(collaborator.cargos)}
              </span>
              <span className="collaborator-card__meta">
                {joinOrEmpty(collaborator.times)}
              </span>
            </div>

            <div className="collaborator-card__base">
              <span className="collaborator-card__meta">{collaborator.tipo}</span>
              <StatusPill status={status} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CollaboratorsGrid
