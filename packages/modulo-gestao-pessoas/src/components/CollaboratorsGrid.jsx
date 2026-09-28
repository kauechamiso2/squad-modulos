import userIcon from '../assets/icons/User.svg'
import squareIcon from '../assets/icons/Square.svg'
import checkSquareIcon from '../assets/icons/CheckSquare.svg'
import ActivityTag from './ActivityTag.jsx'
import CollaboratorRowMenu from './colaborador/CollaboratorRowMenu.jsx'
import './CollaboratorsGrid.css'

function CollaboratorsGrid({
  collaborators,
  selectedIds,
  onToggleSelect,
  onCardClick,
  onDataChanged,
}) {
  return (
    <div className="collaborators-grid">
      {collaborators.map((collaborator) => {
        const isSelected = selectedIds.has(collaborator.id)
        return (
          <div
            className={
              isSelected
                ? 'collaborator-card collaborator-card--selected'
                : 'collaborator-card'
            }
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
              <div className="collaborator-card__avatar">
                <img src={userIcon} width={20} height={20} alt="" />
              </div>
              <CollaboratorRowMenu
                collaborator={collaborator}
                onView={onCardClick}
                onDataChanged={onDataChanged}
              />
            </div>

            <div className="collaborator-card__info">
              <span className="collaborator-card__name">
                {collaborator.name}
              </span>
              <span className="collaborator-card__meta">
                {collaborator.cargos.join(', ')}
              </span>
              <span className="collaborator-card__meta">
                {collaborator.times.join(', ')}
              </span>
            </div>

            <ActivityTag
              contractType={collaborator.contractType}
              desligado={Boolean(collaborator.desligado)}
            />
          </div>
        )
      })}
    </div>
  )
}

export default CollaboratorsGrid
