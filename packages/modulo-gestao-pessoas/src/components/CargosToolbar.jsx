import slidersHorizontalIcon from '../assets/icons/SlidersHorizontal.svg'
import closeIcon from '../assets/icons/Close.svg'
import './CargosToolbar.css'

function CargosToolbar({ total, onFiltrosClick, filtersSummary, onClearAllFilters }) {
  return (
    <div className="cargos-toolbar">
      <span className="cargos-toolbar__total">Total: {total} cargos</span>

      <div className="cargos-toolbar__actions">
        {filtersSummary && (
          <div className="cargos-toolbar__filters-summary">
            <span className="cargos-toolbar__filters-summary-text">
              {filtersSummary}
            </span>
            <button
              type="button"
              className="cargos-toolbar__filters-summary-clear"
              onClick={onClearAllFilters}
            >
              <img src={closeIcon} width={20} height={20} alt="Limpar filtros" />
            </button>
          </div>
        )}

        <button
          type="button"
          className="cargos-toolbar__filtros"
          onClick={onFiltrosClick}
        >
          Filtros
          <img src={slidersHorizontalIcon} width={24} height={24} alt="" />
        </button>
      </div>
    </div>
  )
}

export default CargosToolbar
