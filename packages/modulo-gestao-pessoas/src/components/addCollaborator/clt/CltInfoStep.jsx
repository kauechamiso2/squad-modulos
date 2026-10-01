import { useEffect, useRef, useState } from 'react'
import { CalendarPlus, CameraPlus, Check, Square } from '@phosphor-icons/react'
import closeIcon from '../../../assets/icons/Close.svg'
import checkSquareIcon from '../../../assets/icons/CheckSquare.svg'
import CltShell from './CltShell.jsx'
import InlineEditField from '../../colaborador/InlineEditField.jsx'
import Calendar from '../../colaborador/Calendar.jsx'
import { useDropdownPosition } from '../../../utils/useDropdownPosition.js'
import { COLLECTIONS, getCollection, addItem } from '../../../utils/storage.js'
import {
  todayIso,
  formatDatePt,
  formatCurrencyBRL,
  formatAmountFromDigits,
  formatPaymentValue,
  centsToAmount,
  buildEmailPrefix,
} from '../../../utils/formatters.js'
import '@squad/ui/styles/buttons.css'
import '../../colaborador/ColaboradorDetail.css'
import './CltShell.css'
import './CltInfoStep.css'
import { tipoDoContractType } from '../../../utils/colaboradorStatus.js'

function nextMondayIso() {
  const now = new Date()
  const day = now.getDay()
  const add = (8 - day) % 7 || 7
  const next = new Date(now)
  next.setDate(now.getDate() + add)
  const yyyy = next.getFullYear()
  const mm = String(next.getMonth() + 1).padStart(2, '0')
  const dd = String(next.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// Ensures editing a currency field always starts pre-filled with "0,00"
// instead of empty - amountToDigits() returns '' for a falsy 0, which
// would otherwise blank the input the moment it opens.
function toDigits(value) {
  return Math.round((value ?? 0) * 100)
    .toString()
    .padStart(3, '0')
}

function AdmissaoField({ value, onChange }) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const anchorRef = useRef(null)
  const rect = useDropdownPosition(pickerOpen, anchorRef)

  useEffect(() => {
    if (!pickerOpen) return
    function handleClickOutside(event) {
      if (anchorRef.current && !anchorRef.current.contains(event.target)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [pickerOpen])

  const today = todayIso()
  const nextMonday = nextMondayIso()
  const isCustomDate = Boolean(value) && value !== today && value !== nextMonday

  return (
    <div className="clt-info__admissao" ref={anchorRef}>
      {isCustomDate ? (
        <span className="clt-info__confirmed">
          <Check size={16} weight="bold" className="clt-info__confirmed-icon" />
          {formatDatePt(value)}
        </span>
      ) : (
        <>
          <button
            type="button"
            className={
              value === today
                ? 'clt-info__pill clt-info__pill--selected'
                : 'clt-info__pill'
            }
            onClick={() => onChange(today)}
          >
            Hoje
          </button>
          <button
            type="button"
            className={
              value === nextMonday
                ? 'clt-info__pill clt-info__pill--selected'
                : 'clt-info__pill'
            }
            onClick={() => onChange(nextMonday)}
          >
            Próxima segunda
          </button>
        </>
      )}
      <button
        type="button"
        className="icon-button clt-info__icon-button"
        onClick={() => setPickerOpen((prev) => !prev)}
        aria-label="Escolher data personalizada"
      >
        <CalendarPlus size={20} />
      </button>

      {pickerOpen && rect && (
        <div className="colaborador-field__dropdown" style={{ top: rect.top, left: rect.left }}>
          <Calendar
            value={value}
            onSelect={(date) => {
              onChange(date)
              setPickerOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

// Mirrors AdmissaoField exactly, but with a single "Não especificar" pill
// instead of two preset pills. That pill starts unselected - it isn't the
// same thing as a picked date, so it only switches to the filled/selected
// treatment once the user explicitly clicks it. Once a real date is picked
// (via the calendar-plus button), the pill is replaced entirely by
// confirmed text + a check icon, same pattern as AdmissaoField's custom
// date and CltNomeStep's filled input. The anchored dropdown - Calendar
// plus the "Não especificar data de fim" checkbox - is the one already
// built for DateField.jsx; re-checking that checkbox from a picked date
// reverts the display back to the (unselected) pill.
function DataFimField({ value, onChange }) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selected, setSelected] = useState(false)
  // Tracks the checkbox's own toggled state within an open dropdown,
  // independent of the saved value - unchecking it (without picking a date
  // yet) must reveal the calendar without saving anything, mirroring
  // DateField.jsx's own noEndDate/allowNoEnd interaction exactly.
  const [noEnd, setNoEnd] = useState(value === null)
  const anchorRef = useRef(null)
  const rect = useDropdownPosition(pickerOpen, anchorRef)

  useEffect(() => {
    if (!pickerOpen) return
    function handleClickOutside(event) {
      if (anchorRef.current && !anchorRef.current.contains(event.target)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [pickerOpen])

  const openPicker = () => {
    setNoEnd(value === null)
    setPickerOpen((prev) => !prev)
  }

  const selectNaoEspecificar = () => {
    setSelected(true)
    onChange(null)
  }

  const toggleNoEnd = () => {
    const next = !noEnd
    setNoEnd(next)
    if (next) {
      setSelected(false)
      onChange(null)
      setPickerOpen(false)
    }
  }

  return (
    <div className="clt-info__admissao" ref={anchorRef}>
      {value ? (
        <button type="button" className="clt-info__confirmed clt-info__confirmed-button" onClick={openPicker}>
          <Check size={24} weight="bold" className="clt-info__confirmed-icon" />
          {formatDatePt(value)}
        </button>
      ) : (
        <button
          type="button"
          className={selected ? 'clt-info__pill clt-info__pill--selected' : 'clt-info__pill'}
          onClick={selectNaoEspecificar}
        >
          Não especificar
        </button>
      )}
      <button
        type="button"
        className="icon-button clt-info__icon-button"
        onClick={openPicker}
        aria-label="Escolher data de fim"
      >
        <CalendarPlus size={20} />
      </button>

      {pickerOpen && rect && (
        <div
          className="colaborador-field__dropdown colaborador-date-field__dropdown"
          style={{ top: rect.top, left: rect.left }}
        >
          {!noEnd && (
            <Calendar
              value={value}
              onSelect={(date) => {
                setSelected(false)
                onChange(date)
                setPickerOpen(false)
              }}
            />
          )}
          <button
            type="button"
            className="colaborador-date-field__no-end-toggle"
            onClick={toggleNoEnd}
          >
            {noEnd ? (
              <img src={checkSquareIcon} alt="" width={24} height={24} />
            ) : (
              <Square size={24} color="#000000" />
            )}
            <span className="colaborador-date-field__no-end-label">
              Não especificar data de fim
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

const PAGAMENTO_OPTIONS = ['Mensal', 'Anual', 'Valor fixo']

function PagamentoPills({ value, onChange }) {
  return (
    <div className="clt-info__pagamento-pills">
      {PAGAMENTO_OPTIONS.map((option) => (
        <button
          type="button"
          key={option}
          className={
            value === option
              ? 'clt-info__pill clt-info__pill--selected'
              : 'clt-info__pill'
          }
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

function EmailField({ name, value, onSave, noPrefill = false }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)
  const savingRef = useRef(false)

  const prefix = noPrefill ? '' : buildEmailPrefix(name)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const startEdit = () => {
    setDraft(value ?? prefix)
    setEditing(true)
  }

  const cancel = () => setEditing(false)

  const save = () => {
    savingRef.current = true
    onSave(draft)
    setEditing(false)
  }

  const handleBlur = () => {
    if (savingRef.current) {
      savingRef.current = false
      return
    }
    cancel()
  }

  if (editing) {
    return (
      <div className="inline-edit-field">
        <input
          ref={inputRef}
          type="text"
          className="inline-edit-field__input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') save()
            if (event.key === 'Escape') cancel()
          }}
          onBlur={handleBlur}
        />
        <button
          type="button"
          className="inline-edit-field__cancel"
          onMouseDown={(event) => event.preventDefault()}
          onClick={cancel}
        >
          <img src={closeIcon} alt="Cancelar" width={16} height={16} />
        </button>
      </div>
    )
  }

  if (value != null) {
    return (
      <button type="button" className="colaborador-detail__value-button" onClick={startEdit}>
        {value || (noPrefill ? 'Adicionar' : prefix)}
      </button>
    )
  }

  if (noPrefill) {
    return (
      <button type="button" className="colaborador-detail__value-button" onClick={startEdit}>
        Adicionar
      </button>
    )
  }

  return (
    <button type="button" className="colaborador-detail__value-button" onClick={startEdit}>
      <span>{prefix}</span>
      <span className="clt-info__email-hint">email</span>
    </button>
  )
}

function ReportarParaField({ value, displaySuffix, collaborators, onSave }) {
  const [editing, setEditing] = useState(false)
  const [query, setQuery] = useState('')
  const anchorRef = useRef(null)
  const rect = useDropdownPosition(editing, anchorRef)

  useEffect(() => {
    if (!editing) return
    function handleClickOutside(event) {
      if (anchorRef.current && !anchorRef.current.contains(event.target)) {
        setEditing(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [editing])

  const trimmedQuery = query.trim().toLowerCase()
  const filtered = trimmedQuery
    ? collaborators.filter((collaborator) => collaborator.name.toLowerCase().includes(trimmedQuery))
    : collaborators

  const select = (collaborator) => {
    onSave(collaborator.name, collaborator.cargos?.[0] ?? null)
    setEditing(false)
    setQuery('')
  }

  const startEdit = () => {
    setQuery('')
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setQuery('')
  }

  const displayText = value ? (displaySuffix ? `${value} | ${displaySuffix}` : value) : 'Adicionar'

  if (!editing) {
    return (
      <button type="button" className="colaborador-detail__value-button" onClick={startEdit}>
        {displayText}
      </button>
    )
  }

  return (
    <div className="colaborador-field colaborador-field--fill" ref={anchorRef}>
      <div className="inline-edit-field">
        <input
          type="text"
          autoFocus
          className="inline-edit-field__input"
          placeholder="Buscar colaborador..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') cancelEdit()
          }}
        />
        <button
          type="button"
          className="inline-edit-field__cancel"
          onMouseDown={(event) => event.preventDefault()}
          onClick={cancelEdit}
        >
          <img src={closeIcon} alt="Cancelar" width={16} height={16} />
        </button>
      </div>

      {rect && (
        <div className="colaborador-field__dropdown" style={{ top: rect.top, left: rect.left }}>
          <div className="select-list__list">
            {filtered.map((collaborator) => (
              <button
                type="button"
                key={collaborator.id}
                className="select-list__item"
                onClick={() => select(collaborator)}
              >
                <span className="select-list__item-label">{collaborator.name}</span>
              </button>
            ))}
            {filtered.length === 0 && <p className="select-list__empty">Ninguém encontrado.</p>}
          </div>
        </div>
      )}
    </div>
  )
}

function CurrencyField({ value, onSave, formatDisplay }) {
  return (
    <InlineEditField
      value={toDigits(value)}
      displayValue={formatDisplay ? formatDisplay(value ?? 0) : formatCurrencyBRL(value ?? 0)}
      formatForInput={(digits) => (digits ? formatAmountFromDigits(digits) : '')}
      parseInput={(text) => text.replace(/\D/g, '')}
      onSave={(digits) => onSave(centsToAmount(digits))}
    />
  )
}

// Best-effort pre-fill: the selected cargo's already-established "reporta
// para", derived from its current holders' own reportaPara. Takes the
// first name found and looks up that person's own current cargo for the
// "Nome | Cargo" display.
function computeReportaParaPrefill(cargoName, collaborators) {
  if (!cargoName) return { name: null, cargo: null }
  const holders = collaborators.filter(
    (collaborator) => Array.isArray(collaborator.cargos) && collaborator.cargos.includes(cargoName),
  )
  const derived = holders.map((holder) => holder.reportaPara).filter(Boolean)
  const liderNome = Array.from(new Set(derived))[0] ?? null
  if (!liderNome) return { name: null, cargo: null }

  const liderCollaborator = collaborators.find((collaborator) => collaborator.name === liderNome)
  return { name: liderNome, cargo: liderCollaborator?.cargos?.[0] ?? null }
}

// CLT and PJ share this exact screen; PJ just has a plain "Salário" label,
// no Custo para empresa row, and no custoParaEmpresa field on the saved
// record (ColaboradorDetail's Custo total already falls back to
// salário/valor de pagamento whenever custoParaEmpresa isn't set).
// Freelancer and Consultor are contractually equivalent here and share
// one branch (isFreelancer) to an entirely different row set (contract
// dates, pagamento type, valor do contrato), skipping the email/reporta-
// para pre-fills that only make sense for an established Cargo hire.
function CltInfoStep({ name, cargoName, teamName, contractType, onBack, onClose, onCreate }) {
  const isPJ = contractType === 'PJ'
  const isFreelancer = contractType === 'Freelancer' || contractType === 'Consultor'
  const [collaborators] = useState(() => getCollection(COLLECTIONS.COLABORADORES))
  const [dataAdmissao, setDataAdmissao] = useState(null)
  const [dataFimContrato, setDataFimContrato] = useState(null)
  const [email, setEmail] = useState(null)
  const [reportaParaNome, setReportaParaNome] = useState(
    () => (isFreelancer ? null : computeReportaParaPrefill(cargoName, collaborators).name),
  )
  const [reportaParaCargo, setReportaParaCargo] = useState(
    () => (isFreelancer ? null : computeReportaParaPrefill(cargoName, collaborators).cargo),
  )
  const [salario, setSalario] = useState(0)
  const [custoParaEmpresa, setCustoParaEmpresa] = useState(0)
  const [tipoPagamento, setTipoPagamento] = useState('Mensal')
  const [valorContrato, setValorContrato] = useState(0)

  const handleCreate = () => {
    const record = {
      name,
      contractType,
      // Ponte ate o Topico 5: grava o tipo novo e o checklist de admissao
      // todo aberto, para o colaborador entrar como Pendente.
      tipo: tipoDoContractType(contractType),
      admissao: { feitos: [] },
      rescisao: null,
      ausencia: null,
      cargos: cargoName ? [cargoName] : [],
      times: teamName ? [teamName] : [],
      reportaPara: reportaParaNome,
      notas: [],
    }
    if (isFreelancer) {
      record.dataInicioContrato = dataAdmissao
      record.dataFimContrato = dataFimContrato ?? null
      record.email = email ?? ''
      record.tipoPagamento = tipoPagamento
      record.valorContrato = valorContrato
    } else {
      record.dataAdmissao = dataAdmissao
      record.email = email ?? buildEmailPrefix(name)
      record.salario = salario
      if (!isPJ) record.custoParaEmpresa = custoParaEmpresa
    }
    addItem(COLLECTIONS.COLABORADORES, record)
    onCreate()
  }

  return (
    <CltShell
      onClose={onClose}
      progress={100}
      footerLeft={
        <button type="button" className="text-button" onClick={onBack}>
          Voltar
        </button>
      }
      footerRight={
        <button type="button" className="pill-button" onClick={handleCreate}>
          Criar colaborador
        </button>
      }
    >
      <div className="clt-shell__content">
        <h1 className="clt-shell__title">
          Finalize com algumas
          <br />
          informações adicionais.
        </h1>

        <div className="clt-info__list">
          {isFreelancer ? (
            <>
              <div className="clt-info__row">
                <span className="clt-info__row-label">Data de início do contrato</span>
                <AdmissaoField value={dataAdmissao} onChange={setDataAdmissao} />
              </div>

              <div className="clt-info__row">
                <span className="clt-info__row-label">Data de fim do contrato</span>
                <DataFimField value={dataFimContrato} onChange={setDataFimContrato} />
              </div>

              <div className="clt-info__row">
                <span className="clt-info__row-label">Email</span>
                <EmailField name={name} value={email} onSave={setEmail} noPrefill />
              </div>

              <div className="clt-info__row">
                <span className="clt-info__row-label">Reportar para</span>
                <ReportarParaField
                  value={reportaParaNome}
                  displaySuffix={reportaParaCargo}
                  collaborators={collaborators.filter((collaborator) => collaborator.name !== name)}
                  onSave={(nome, cargo) => {
                    setReportaParaNome(nome)
                    setReportaParaCargo(cargo)
                  }}
                />
              </div>

              <div className="clt-info__row">
                <span className="clt-info__row-label">Pagamento</span>
                <PagamentoPills value={tipoPagamento} onChange={setTipoPagamento} />
              </div>

              <div className="clt-info__row">
                <span className="clt-info__row-label">Valor do contrato</span>
                <CurrencyField
                  value={valorContrato}
                  onSave={setValorContrato}
                  formatDisplay={(v) => formatPaymentValue(v, tipoPagamento)}
                />
              </div>

              <div className="clt-info__row">
                <span className="clt-info__row-label">Foto</span>
                <button type="button" className="icon-button clt-info__icon-button" aria-label="Adicionar foto">
                  <CameraPlus size={20} />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="clt-info__row">
                <span className="clt-info__row-label">Data de admissão</span>
                <AdmissaoField value={dataAdmissao} onChange={setDataAdmissao} />
              </div>

              <div className="clt-info__row">
                <span className="clt-info__row-label">Email</span>
                <EmailField name={name} value={email} onSave={setEmail} />
              </div>

              <div className="clt-info__row">
                <span className="clt-info__row-label">Reportar para</span>
                <ReportarParaField
                  value={reportaParaNome}
                  displaySuffix={reportaParaCargo}
                  collaborators={collaborators.filter((collaborator) => collaborator.name !== name)}
                  onSave={(nome, cargo) => {
                    setReportaParaNome(nome)
                    setReportaParaCargo(cargo)
                  }}
                />
              </div>

              <div className="clt-info__row">
                <span className="clt-info__row-label">{isPJ ? 'Salário' : 'Salário bruto'}</span>
                <CurrencyField value={salario} onSave={setSalario} />
              </div>

              {!isPJ && (
                <div className="clt-info__row">
                  <span className="clt-info__row-label">Custo para empresa</span>
                  <CurrencyField value={custoParaEmpresa} onSave={setCustoParaEmpresa} />
                </div>
              )}

              <div className="clt-info__row">
                <span className="clt-info__row-label">Foto</span>
                <button type="button" className="icon-button clt-info__icon-button" aria-label="Adicionar foto">
                  <CameraPlus size={20} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </CltShell>
  )
}

export default CltInfoStep
