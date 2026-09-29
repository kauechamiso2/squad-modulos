import { useEffect, useState } from 'react'
import closeIcon from '../assets/icons/Close.svg'
import closeIconWhite from '../assets/icons/CloseWhite.svg'
import { IconButton, PainelLateral } from '@squad/ui'
import './FiltrosPanel.css'

const TIPO_OPTIONS = [
  'Plano de Saúde',
  'Vale Transporte',
  'Vale Alimentação',
  'Bem-Estar',
  'Plano Odontológico',
  'Seguro de Vida',
  'Fixo',
  'Verba',
]

function FilterPill({ selected, onClick, children }) {
  return (
    <button
      type="button"
      className={
        selected
          ? 'filtros-panel__pill filtros-panel__pill--selected'
          : 'filtros-panel__pill'
      }
      onClick={onClick}
    >
      {children}
      {selected && <img src={closeIconWhite} width={20} height={20} alt="" />}
    </button>
  )
}

function NumberPillInput({ value, onChange, placeholder }) {
  return (
    <input
      type="number"
      inputMode="numeric"
      className="filtros-panel__number-pill"
      placeholder={placeholder}
      value={value ?? ''}
      onChange={(event) => {
        const raw = event.target.value
        onChange(raw === '' ? null : Number(raw))
      }}
    />
  )
}

function createEmptyDraft() {
  return { tipo: new Set(), pessoas: { min: null, max: null } }
}

function cloneFilters(filters) {
  return { tipo: new Set(filters.tipo), pessoas: { ...filters.pessoas } }
}

function BeneficiosFiltrosPanel({ isOpen, onClose, filters, onSave }) {
  const [draft, setDraft] = useState(createEmptyDraft)

  useEffect(() => {
    if (isOpen) {
      setDraft(cloneFilters(filters))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const toggleTipo = (value) => {
    setDraft((prev) => {
      const next = new Set(prev.tipo)
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }
      return { ...prev, tipo: next }
    })
  }

  const setPessoas = (which, value) => {
    setDraft((prev) => ({ ...prev, pessoas: { ...prev.pessoas, [which]: value } }))
  }

  const handleCancel = () => {
    onClose()
  }

  const handleSave = () => {
    onSave(draft)
    onClose()
  }

  return (
    <>
      <PainelLateral
        className="gp-painel gp-painel--rolagem-afastada"
        classNameVeu="gp-painel"
        aberto={isOpen}
        titulo="Filtros"
        iconeFechar={closeIcon}
        onFechar={handleCancel}
        rotuloCancelar="Cancelar"
        rotuloConfirmar="Salvar Filtros"
        onConfirmar={handleSave}
      >
        <>
          <section className="filtros-panel__section">
            <span className="filtros-panel__label">Tipo de benefício:</span>
            <div className="filtros-panel__pills">
              {TIPO_OPTIONS.map((option) => (
                <FilterPill
                  key={option}
                  selected={draft.tipo.has(option)}
                  onClick={() => toggleTipo(option)}
                >
                  {option}
                </FilterPill>
              ))}
            </div>
          </section>

          <section className="filtros-panel__section filtros-panel__section--last">
            <span className="filtros-panel__label">Número de pessoas:</span>
            <div className="filtros-panel__range-row">
              <NumberPillInput
                value={draft.pessoas.min}
                onChange={(value) => setPessoas('min', value)}
                placeholder="Mínimo"
              />
              <span className="filtros-panel__range-connector">a</span>
              <NumberPillInput
                value={draft.pessoas.max}
                onChange={(value) => setPessoas('max', value)}
                placeholder="Máximo"
              />
            </div>
          </section>
        </>
      </PainelLateral>
    </>
  )
}

export default BeneficiosFiltrosPanel
