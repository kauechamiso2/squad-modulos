import { CabecalhoTabela, CelulaCabecalho, DropdownColuna, LinhaTabela, Tabela, classesCelula } from '@squad/ui'
import { useEffect, useRef, useState } from 'react'
import arrowsDownUpIcon from '../assets/icons/ArrowsDownUp.svg'
import caretDownIcon from '../assets/icons/CaretDown.svg'
import closeIcon from '../assets/icons/CloseGray.svg'
import squareIcon from '../assets/icons/Square.svg'
import checkSquareIcon from '../assets/icons/CheckSquare.svg'
import StatusPill from './status/StatusPill.jsx'
import AusenciaBadge from './status/AusenciaBadge.jsx'
import AlertaCadastro from './status/AlertaCadastro.jsx'
import CollaboratorRowMenu from './colaborador/CollaboratorRowMenu.jsx'
import { getAusenciaAtiva, getStatus, isEncerrado } from '../utils/colaboradorStatus.js'
import { todayIso } from '../utils/formatters.js'
import './CollaboratorsTable.css'

// Valor vazio da plataforma (contexto, Topico 1).
const VAZIO = '—'

function joinOrEmpty(values) {
  return values.length > 0 ? values.join(', ') : VAZIO
}

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
  tipoOptions,
  statusOptions,
  onRowClick,
  onDataChanged,
  alertas,
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
  }

  const hoje = todayIso()

  // Colunas do Figma 10331:3109: checkbox, Nome 198, Time 160, Cargo 240,
  // Tipo 140, Status ocupa o resto, slot de icones e menu. O slot e `auto`
  // e cada linha e um grid proprio: sem icone ele fecha e o Status, alinhado
  // a esquerda, so ganha folga a direita.
  return (
    <Tabela colunas={'24px 198px 160px 240px 140px minmax(0, 1fr) auto 40px'}>
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
        <FilterHeaderCell
          label="Tipo"
          options={tipoOptions}
          selected={columnFilters.tipo}
          isOpen={openColumn === 'tipo'}
          onHeaderClick={() => handleHeaderClick('tipo')}
          onToggleOption={(option) => onToggleFilterOption('tipo', option)}
          containerRef={(el) => {
            containerRefs.current.tipo = el
          }}
        />
        <FilterHeaderCell
          label="Status"
          options={statusOptions}
          selected={columnFilters.status}
          isOpen={openColumn === 'status'}
          onHeaderClick={() => handleHeaderClick('status')}
          onToggleOption={(option) => onToggleFilterOption('status', option)}
          containerRef={(el) => {
            containerRefs.current.status = el
          }}
        />
        <div />
        <div />
      </CabecalhoTabela>

      {sortedCollaborators.map((collaborator) => {
          const isSelected = selectedIds.has(collaborator.id)
          const status = getStatus(collaborator)
          const ausencia = getAusenciaAtiva(collaborator, hoje)
          return (
            <LinhaTabela
              selecionada={isSelected}
              className={
                isEncerrado(status) ? 'collaborators-table__row--esmaecida' : ''
              }
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
              <div className={`${classesCelula.principal} collaborators-table__texto`}>
                {collaborator.name}
              </div>
              <div className={`${classesCelula.secundaria} collaborators-table__texto`}>
                {joinOrEmpty(collaborator.times)}
              </div>
              <div className={`${classesCelula.secundaria} collaborators-table__texto`}>
                {joinOrEmpty(collaborator.cargos)}
              </div>
              <div className={`${classesCelula.secundaria} collaborators-table__texto`}>
                {collaborator.tipo}
              </div>
              {/* Sem overflow: hidden, para o popover do pill poder sair da celula. */}
              <div className="collaborators-table__status">
                <StatusPill status={status} />
              </div>
              <div className="collaborators-table__icones">
                {ausencia && <AusenciaBadge ausencia={ausencia} />}
                {alertas.has(collaborator.id) && (
                  <AlertaCadastro onAbrir={() => onRowClick(collaborator.id)} />
                )}
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
