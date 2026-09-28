import { CabecalhoTabela, CelulaCabecalho, DropdownColuna, LinhaTabela, Tabela, classesCelula } from '@squad/ui'
import { useEffect, useRef, useState } from 'react'
import arrowsDownUpIcon from '../assets/icons/ArrowsDownUp.svg'
import caretDownIcon from '../assets/icons/CaretDown.svg'
import closeIcon from '../assets/icons/CloseGray.svg'
import squareIcon from '../assets/icons/Square.svg'
import checkSquareIcon from '../assets/icons/CheckSquare.svg'
import ActivityTag from './ActivityTag.jsx'
import CollaboratorRowMenu from './colaborador/CollaboratorRowMenu.jsx'
import { formatShortDatePt } from '../utils/formatters.js'
import { getCollaboratorActiveSince } from '../utils/storage.js'
import './CollaboratorsTable.css'

function SortableHeaderCell({ label, active, onClick }) {
  return (
    <CelulaCabecalho onClick={onClick}>
      <span>{label}</span>
      <img
        src={active ? closeIcon : arrowsDownUpIcon}
        width={16}
        height={16}
        alt=""
      />
    </CelulaCabecalho>
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
    <div className="collaborators-table__header-filter" ref={containerRef}>
      <CelulaCabecalho onClick={onHeaderClick}>
        <span>{label}</span>
        <img src={icon} width={16} height={16} alt="" />
      </CelulaCabecalho>
      {isOpen && (
        /* A casca do dropdown virou @squad/ui/DropdownColuna quando o Fluxo de
           Caixa passou a usar a mesma. Busca, contagem e "marcados no topo"
           sao do Fluxo de Caixa e ficam desligados aqui. */
        <DropdownColuna
          itens={options.map((option) => ({ id: option, rotulo: option }))}
          marcados={selected}
          onAlternar={onToggleOption}
          renderCheckbox={(marcado) => (
            <img src={marcado ? checkSquareIcon : squareIcon} width={20} height={20} alt="" />
          )}
        />
      )}
    </div>
  )
}

function CollaboratorsTable({
  collaborators,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  columnFilters,
  onToggleFilterOption,
  onClearFilter,
  timeOptions,
  cargoOptions,
  atividadeOptions,
  onRowClick,
  onDataChanged,
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

  const allIds = collaborators.map((collaborator) => collaborator.id)
  const selectedCount = allIds.filter((id) => selectedIds.has(id)).length
  const allSelected = allIds.length > 0 && selectedCount === allIds.length

  const handleHeaderCheckboxClick = () => {
    if (allSelected) {
      onDeselectAll()
    } else {
      onSelectAll(allIds)
    }
  }

  let sortedCollaborators = collaborators
  if (sortColumn === 'nome') {
    sortedCollaborators = [...collaborators].sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR'),
    )
  } else if (sortColumn === 'ativo-desde') {
    sortedCollaborators = [...collaborators].sort((a, b) => {
      const dateA = getCollaboratorActiveSince(a)
      const dateB = getCollaboratorActiveSince(b)
      if (dateA === null && dateB === null) return 0
      if (dateA === null) return 1
      if (dateB === null) return -1
      return dateA.localeCompare(dateB)
    })
  }

  return (
    <Tabela colunas={'24px minmax(0, 1fr) 160px 240px 160px 120px 40px'}>
      <CabecalhoTabela>
        <button
          type="button"
          className="collaborators-table__checkbox-cell"
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
          label="Nome"
          active={sortColumn === 'nome'}
          onClick={() => toggleSort('nome')}
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
        <FilterHeaderCell
          label="Cargo"
          options={cargoOptions}
          selected={columnFilters.cargo}
          isOpen={openColumn === 'cargo'}
          onHeaderClick={() => handleHeaderClick('cargo')}
          onToggleOption={(option) => onToggleFilterOption('cargo', option)}
          containerRef={(el) => {
            containerRefs.current.cargo = el
          }}
        />
        <SortableHeaderCell
          label="Ativo desde"
          active={sortColumn === 'ativo-desde'}
          onClick={() => toggleSort('ativo-desde')}
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
        <div className="collaborators-table__header-spacer" />
      </CabecalhoTabela>

      {sortedCollaborators.map((collaborator) => {
          const activeSince = getCollaboratorActiveSince(collaborator)
          const isSelected = selectedIds.has(collaborator.id)
          return (
            <LinhaTabela
              selecionada={isSelected}
              key={collaborator.id}
              onClick={() => onRowClick?.(collaborator.id)}
            >
              <button
                type="button"
                className="collaborators-table__checkbox-cell"
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
              <div className={classesCelula.principal}>
                {collaborator.name}
              </div>
              <div className={classesCelula.secundaria}>
                {collaborator.times.join(', ')}
              </div>
              <div className={classesCelula.secundaria}>
                {collaborator.cargos.join(', ')}
              </div>
              <div className={classesCelula.secundaria}>
                {activeSince ? formatShortDatePt(activeSince) : ''}
              </div>
              <div className={classesCelula.celula}>
                <ActivityTag
                  contractType={collaborator.contractType}
                  desligado={Boolean(collaborator.desligado)}
                />
              </div>
              <CollaboratorRowMenu
                collaborator={collaborator}
                onView={onRowClick}
                onDataChanged={onDataChanged}
              />
            </LinhaTabela>
          )
        })}
    </Tabela>
  )
}

export default CollaboratorsTable
