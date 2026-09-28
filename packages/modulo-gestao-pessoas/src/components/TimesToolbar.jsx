import slidersHorizontalIcon from '../assets/icons/SlidersHorizontal.svg'
import closeIcon from '../assets/icons/Close.svg'
import './TimesToolbar.css'

function TimesToolbar({ total, onFiltrosClick, filtersSummary, onClearAllFilters }) {
  return (
    <div className="times-toolbar">
      <span className="times-toolbar__total">Total: {total} times</span>

      <div className="times-toolbar__actions">
        {filtersSummary && (
          <div className="times-toolbar__filters-summary">
            <span className="times-toolbar__filters-summary-text">
              {filtersSummary}
            </span>
            <button
              type="button"
              className="times-toolbar__filters-summary-clear"
              onClick={onClearAllFilters}
            >
              <img src={closeIcon} width={20} height={20} alt="Limpar filtros" />
            </button>
          </div>
        )}

        <button
          type="button"
          className="times-toolbar__filtros"
          onClick={onFiltrosClick}
        >
          Filtros
          <img src={slidersHorizontalIcon} width={24} height={24} alt="" />
        </button>
      </div>
    </div>
  )
}

export default TimesToolbar
