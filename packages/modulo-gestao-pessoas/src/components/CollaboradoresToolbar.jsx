import { BotaoFiltros, ChipFiltro, TotalItens } from '@squad/ui'
import slidersHorizontalIcon from '../assets/icons/SlidersHorizontal.svg'
import squaresFourIcon from '../assets/icons/SquaresFour.svg'
import squaresFourEmptIcon from '../assets/icons/SquaresFourEmpt.svg'
import rowsIcon from '../assets/icons/Rows.svg'
import rowsEmptIcon from '../assets/icons/RowsEmpt.svg'
import closeIcon from '../assets/icons/Close.svg'
import './CollaboradoresToolbar.css'

function CollaboradoresToolbar({
  total,
  view,
  onViewChange,
  onFiltrosClick,
  filtersSummary,
  onClearAllFilters,
}) {
  return (
    <div className="colaboradores-toolbar">
      <TotalItens>Total: {total} colaboradores</TotalItens>

      <div className="colaboradores-toolbar__actions">
        {filtersSummary && (
          <ChipFiltro
            texto={filtersSummary}
            iconeLimpar={<img src={closeIcon} width={20} height={20} alt="Limpar filtros" />}
            onLimpar={onClearAllFilters}
          />
        )}

        <BotaoFiltros
          icone={<img src={slidersHorizontalIcon} width={24} height={24} alt="" />}
          onClick={onFiltrosClick}
        />

        <div className="colaboradores-toolbar__view-toggle">
          <button
            type="button"
            className={
              view === 'grid'
                ? 'colaboradores-toolbar__view-button colaboradores-toolbar__view-button--active'
                : 'colaboradores-toolbar__view-button'
            }
            onClick={() => onViewChange('grid')}
          >
            <img
              src={view === 'grid' ? squaresFourIcon : squaresFourEmptIcon}
              width={20}
              height={20}
              alt="Visualização em grade"
            />
          </button>
          <button
            type="button"
            className={
              view === 'table'
                ? 'colaboradores-toolbar__view-button colaboradores-toolbar__view-button--active'
                : 'colaboradores-toolbar__view-button'
            }
            onClick={() => onViewChange('table')}
          >
            <img
              src={view === 'table' ? rowsIcon : rowsEmptIcon}
              width={20}
              height={20}
              alt="Visualização em tabela"
            />
          </button>
        </div>
      </div>
    </div>
  )
}

export default CollaboradoresToolbar
