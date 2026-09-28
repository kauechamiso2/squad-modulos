import { useEffect, useRef, useState } from 'react'
import arrowsDownUpIcon from '../assets/icons/ArrowsDownUp.svg'
import caretDownIcon from '../assets/icons/CaretDown.svg'
import closeIcon from '../assets/icons/CloseGray.svg'
import squareIcon from '../assets/icons/Square.svg'
import checkSquareIcon from '../assets/icons/CheckSquare.svg'
import dotsThreeIcon from '../assets/icons/DotsThree.svg'
import plusBlackIcon from '../assets/icons/PlusBlack.svg'
import { IconButton } from '@squad/ui'
import ActivityTag from './ActivityTag.jsx'
import { formatFaixaSalarial } from '../utils/formatters.js'
import './CargosTable.css'

function SortableHeaderCell({ label, active, onClick }) {
  return (
    <button
      type="button"
      className="cargos-table__header-cell cargos-table__header-cell--button"
      onClick={onClick}
    >
      <span>{label}</span>
      <img
        src={active ? closeIcon : arrowsDownUpIcon}
        width={16}
        height={16}
        alt=""
      />
    </button>
  )
}

function FilterHeaderCell({
  label,
  options,
  selected,
  isOpen,
  onHeaderClick,
  onToggleOption,
  containerRef,
}) {
  const icon = isOpen || selected.size > 0 ? closeIcon : caretDownIcon
  return (
    <div className="cargos-table__header-filter" ref={containerRef}>
      <button
        type="button"
        className="cargos-table__header-cell cargos-table__header-cell--button"
        onClick={onHeaderClick}
      >
        <span>{label}</span>
        <img src={icon} width={16} height={16} alt="" />
      </button>
      {isOpen && (
        <div className="cargos-table__filter-dropdown">
          {options.map((option) => {
            const checked = selected.has(option)
            return (
              <button
                type="button"
                className="cargos-table__filter-option"
                onClick={() => onToggleOption(option)}
                key={option}
              >
                <img
                  src={checked ? checkSquareIcon : squareIcon}
                  width={20}
                  height={20}
                  alt=""
                />
                <span>{option}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CargosTable({
  rows,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  columnFilters,
  onToggleFilterOption,
  onClearFilter,
  timeOptions,
  atividadeOptions,
  onCriarCargo,
}) {
  const [sortColumn, setSortColumn] = useState(null)
  const [openColumn, setOpenColumn] = useState(null)
  const containerRefs = useRef({})

  useEffect(() => {
    if (openColumn === null) return
    function handleClickOutside(event) {
      const ref = containerRefs.current[openColumn]
      if (ref && !ref.contains(event.target)) {
        setOpenColumn(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openColumn])

  const handleHeaderClick = (columnId) => {
    if (openColumn === columnId) {
      setOpenColumn(null)
    } else if (columnFilters[columnId].size > 0) {
      onClearFilter(columnId)
    } else {
      setOpenColumn(columnId)
    }
  }

  const toggleSort = (column) => {
    setSortColumn((prev) => (prev === column ? null : column))
  }

  const allIds = rows.map((row) => row.id)
  const selectedCount = allIds.filter((id) => selectedIds.has(id)).length
  const allSelected = allIds.length > 0 && selectedCount === allIds.length

  const handleHeaderCheckboxClick = () => {
    if (allSelected) {
      onDeselectAll()
    } else {
      onSelectAll(allIds)
    }
  }

  let sortedRows = rows
  if (sortColumn === null) {
    sortedRows = [...rows].sort((a, b) => {
      if (a.isPendingCargo === b.isPendingCargo) return 0
      return a.isPendingCargo ? -1 : 1
    })
  } else if (sortColumn === 'cargo') {
    sortedRows = [...rows].sort((a, b) =>
      a.cargoName.localeCompare(b.cargoName, 'pt-BR'),
    )
  } else if (sortColumn === 'faixa-salarial') {
    sortedRows = [...rows].sort((a, b) => {
      if (a.salaryMin == null && b.salaryMin == null) return 0
      if (a.salaryMin == null) return 1
      if (b.salaryMin == null) return -1
      return a.salaryMin - b.salaryMin
    })
  } else if (sortColumn === 'colaboradores') {
    sortedRows = [...rows].sort((a, b) => a.count - b.count)
  }

  return (
    <div className="cargos-table">
      <div className="cargos-table__header">
        <button
          type="button"
          className="cargos-table__checkbox-cell"
          onClick={handleHeaderCheckboxClick}
        >
          <img
            src={allSelected ? checkSquareIcon : squareIcon}
            width={24}
            height={24}
            alt=""
          />
        </button>
        <SortableHeaderCell
          label="Cargo"
          active={sortColumn === 'cargo'}
          onClick={() => toggleSort('cargo')}
        />
        <FilterHeaderCell
          label="Atividade"
          options={atividadeOptions}
          selected={columnFilters.atividade}
          isOpen={openColumn === 'atividade'}
          onHeaderClick={() => handleHeaderClick('atividade')}
          onToggleOption={(option) => onToggleFilterOption('atividade', option)}
          containerRef={(el) => {
            containerRefs.current.atividade = el
          }}
        />
        <SortableHeaderCell
          label="Faixa salarial"
          active={sortColumn === 'faixa-salarial'}
          onClick={() => toggleSort('faixa-salarial')}
        />
        <SortableHeaderCell
          label="Colaboradores"
          active={sortColumn === 'colaboradores'}
          onClick={() => toggleSort('colaboradores')}
        />
        <FilterHeaderCell
          label="Time"
          options={timeOptions}
          selected={columnFilters.time}
          isOpen={openColumn === 'time'}
          onHeaderClick={() => handleHeaderClick('time')}
          onToggleOption={(option) => onToggleFilterOption('time', option)}
          containerRef={(el) => {
            containerRefs.current.time = el
          }}
        />
        <div className="cargos-table__header-spacer" />
      </div>

      <div className="cargos-table__body">
        {sortedRows.map((row) => {
          const isSelected = selectedIds.has(row.id)
          return (
            <div
              className={
                isSelected
                  ? 'cargos-table__row cargos-table__row--selected'
                  : 'cargos-table__row'
              }
              key={row.id}
            >
              <button
                type="button"
                className="cargos-table__checkbox-cell"
                onClick={() => onToggleSelect(row.id)}
              >
                <img
                  src={isSelected ? checkSquareIcon : squareIcon}
                  width={24}
                  height={24}
                  alt=""
                />
              </button>
              <div className="cargos-table__cell cargos-table__cell--cargo">
                {row.cargoName}
              </div>
              <div className="cargos-table__cell">
                {row.isPendingCargo ? (
                  '—'
                ) : (
                  <ActivityTag contractType={row.contractType} />
                )}
              </div>
              <div className="cargos-table__cell cargos-table__cell--secondary">
                {formatFaixaSalarial(row.salaryMin, row.salaryMax)}
              </div>
              <div className="cargos-table__cell cargos-table__cell--secondary">
                {row.count}
              </div>
              <div className="cargos-table__cell cargos-table__cell--secondary">
                {row.isPendingCargo || row.teamNames.length === 0
                  ? '—'
                  : row.teamNames.join(', ')}
              </div>
              {row.isPendingCargo ? (
                <button
                  type="button"
                  className="cargos-table__criar-cargo-button"
                  onClick={() => onCriarCargo(row.cargoRecordId)}
                >
                  Criar cargo
                  <img src={plusBlackIcon} width={24} height={24} alt="" />
                </button>
              ) : (
                <IconButton icon={dotsThreeIcon} alt="Mais opções" iconSize={24} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CargosTable
