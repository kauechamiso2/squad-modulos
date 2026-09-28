import slidersHorizontalIcon from '../assets/icons/SlidersHorizontal.svg'
import closeIcon from '../assets/icons/Close.svg'
import './BeneficiosToolbar.css'

function BeneficiosToolbar({ total, onFiltrosClick, filtersSummary, onClearAllFilters }) {
  return (
    <div className="beneficios-toolbar">
      <span className="beneficios-toolbar__total">Total: {total} beneficios</span>

      <div className="beneficios-toolbar__actions">
        {filtersSummary && (
          <div className="beneficios-toolbar__filters-summary">
            <span className="beneficios-toolbar__filters-summary-text">
              {filtersSummary}
            </span>
            <button
              type="button"
              className="beneficios-toolbar__filters-summary-clear"
              onClick={onClearAllFilters}
            >
              <img src={closeIcon} width={20} height={20} alt="Limpar filtros" />
            </button>
          </div>
        )}

        <button
          type="button"
          className="beneficios-toolbar__filtros"
          onClick={onFiltrosClick}
        >
          Filtros
          <img src={slidersHorizontalIcon} width={24} height={24} alt="" />
        </button>
      </div>
    </div>
  )
}

export default BeneficiosToolbar
