import { useState } from 'react'
import caretRightIcon from '../../assets/icons/CaretRight.svg'
import { WizardShell } from '@squad/ui'
import EmailModal from './EmailModal.jsx'
import MultiSelectFieldModal from './MultiSelectFieldModal.jsx'
import ReportaParaModal from './ReportaParaModal.jsx'
import DateFieldModal from './DateFieldModal.jsx'
import EndDateFieldModal from './EndDateFieldModal.jsx'
import PagamentoModal from './PagamentoModal.jsx'
import SalarioModal from './SalarioModal.jsx'
import { COLLECTIONS, addItem, getCollection } from '../../utils/storage.js'
import { formatDatePt, formatCurrencyBRL, formatPaymentValue } from '../../utils/formatters.js'
import '@squad/ui/styles/buttons.css'
import '@squad/ui/styles/Step2AdditionalInfo.css'

const FIELDS_FIXO = [
  {
    id: 'email',
    label: 'Email',
    getDisplay: (v) => v.email || null,
  },
  {
    id: 'cargo',
    label: 'Cargo',
    getDisplay: (v) => (v.cargos.length ? v.cargos.join(', ') : null),
  },
  {
    id: 'time',
    label: 'Time',
    getDisplay: (v) => (v.times.length ? v.times.join(', ') : null),
  },
  {
    id: 'reporta-para',
    label: 'Reporta para',
    getDisplay: (v) => v.reportaPara || null,
  },
  {
    id: 'data-admissao',
    label: 'Data de admissão',
    getDisplay: (v) => (v.dataAdmissao ? formatDatePt(v.dataAdmissao) : null),
  },
  {
    id: 'salario',
    label: 'Salário',
    getDisplay: (v) => (v.salario != null ? formatCurrencyBRL(v.salario) : null),
  },
]

const FIELDS_CONTRATO = [
  {
    id: 'email',
    label: 'Email',
    getDisplay: (v) => v.email || null,
  },
  {
    id: 'cargo',
    label: 'Cargo',
    getDisplay: (v) => (v.cargos.length ? v.cargos.join(', ') : null),
  },
  {
    id: 'time',
    label: 'Time',
    getDisplay: (v) => (v.times.length ? v.times.join(', ') : null),
  },
  {
    id: 'reporta-para',
    label: 'Reporta para',
    getDisplay: (v) => v.reportaPara || null,
  },
  {
    id: 'data-inicio-contrato',
    label: 'Data de início do contrato',
    getDisplay: (v) =>
      v.dataInicioContrato ? formatDatePt(v.dataInicioContrato) : null,
  },
  {
    id: 'data-fim-contrato',
    label: 'Data de fim do contrato',
    getDisplay: (v) => {
      if (v.dataFimContrato === null) return 'Sem data de fim'
      if (v.dataFimContrato) return formatDatePt(v.dataFimContrato)
      return null
    },
  },
  {
    id: 'pagamento',
    label: 'Pagamento',
    getDisplay: (v) => v.tipoPagamento,
  },
  {
    id: 'valor-pagamento',
    label: 'Valor do pagamento',
    getDisplay: (v) =>
      v.valorPagamento != null
        ? formatPaymentValue(v.valorPagamento, v.tipoPagamento)
        : null,
  },
]

function Step2AdditionalInfo({ name, contractType, onBack, onExit, onContinue }) {
  // Cargo nao tem colecao propria: as sugestoes sao os valores ja em uso.
  const cargoOptions = Array.from(
    new Set(getCollection(COLLECTIONS.COLABORADORES).flatMap((c) => c.cargos ?? [])),
  )

  const isFixo = contractType === 'Fixo'
  const fields = isFixo ? FIELDS_FIXO : FIELDS_CONTRATO

  const [values, setValues] = useState({
    email: '',
    cargos: [],
    times: [],
    reportaPara: null,
    dataAdmissao: null,
    salario: null,
    dataInicioContrato: null,
    dataFimContrato: undefined,
    tipoPagamento: 'Mensal',
    valorPagamento: null,
  })
  const [openModal, setOpenModal] = useState(null)

  const closeModal = () => setOpenModal(null)

  const handleContinue = () => {
    const record = {
      name,
      contractType,
      email: values.email,
      cargos: values.cargos,
      times: values.times,
      reportaPara: values.reportaPara,
    }

    if (isFixo) {
      record.dataAdmissao = values.dataAdmissao
      record.salario = values.salario
    } else {
      record.dataInicioContrato = values.dataInicioContrato
      record.dataFimContrato = values.dataFimContrato ?? null
      record.tipoPagamento = values.tipoPagamento
      record.valorPagamento = values.valorPagamento
    }

    addItem(COLLECTIONS.COLABORADORES, record)
    onContinue()
  }

  return (
    <WizardShell
      onClose={onExit}
      progress={100}
      footerLeft={
        <button type="button" className="text-button" onClick={onBack}>
          Voltar
        </button>
      }
      footerRight={
        <button type="button" className="pill-button" onClick={handleContinue}>
          Continuar
        </button>
      }
    >
      <div className="step2">
        <p className="step2__section-label">Informações</p>
        <div className="step2__list">
          {fields.map((field) => {
            const displayValue = field.getDisplay(values)
            const filled = displayValue !== null
            return (
              <button
                type="button"
                className="step2__row"
                key={field.id}
                onClick={() => setOpenModal(field.id)}
              >
                <span
                  className={
                    filled
                      ? 'step2__row-label step2__row-label--filled'
                      : 'step2__row-label'
                  }
                >
                  {field.label}
                </span>
                <span className="step2__row-action">
                  {filled ? displayValue : 'Adicionar'}
                </span>
                <span className="step2__row-icon">
                  <img src={caretRightIcon} alt="" width={24} height={24} />
                </span>
              </button>
            )
          })}
          <div className="step2__row">
            <span className="step2__row-label">Foto</span>
            <span className="step2__row-action">Adicionar</span>
            <span className="step2__row-icon">
              <img src={caretRightIcon} alt="" width={24} height={24} />
            </span>
          </div>
        </div>
      </div>

      {openModal === 'email' && (
        <EmailModal
          value={values.email}
          onClose={closeModal}
          onSave={(email) => {
            setValues((prev) => ({ ...prev, email }))
            closeModal()
          }}
        />
      )}

      {openModal === 'cargo' && (
        <MultiSelectFieldModal
          title="Cargo"
          /* Cargo deixou de ter colecao propria: as opcoes sao os valores ja
             em uso entre os colaboradores. */
          options={cargoOptions}
          createLabelPrefix="Criar cargo"
          value={values.cargos}
          onClose={closeModal}
          onSave={(cargos) => {
            setValues((prev) => ({ ...prev, cargos }))
            closeModal()
          }}
        />
      )}

      {openModal === 'time' && (
        <MultiSelectFieldModal
          title="Time"
          collectionName={COLLECTIONS.TIMES}
          createLabelPrefix="Criar time"
          value={values.times}
          onClose={closeModal}
          onSave={(times) => {
            setValues((prev) => ({ ...prev, times }))
            closeModal()
          }}
        />
      )}

      {openModal === 'reporta-para' && (
        <ReportaParaModal
          value={values.reportaPara}
          teamFilter={values.times}
          onClose={closeModal}
          onSave={(reportaPara) => {
            setValues((prev) => ({ ...prev, reportaPara }))
            closeModal()
          }}
        />
      )}

      {openModal === 'data-admissao' && (
        <DateFieldModal
          title="Data de admissão"
          value={values.dataAdmissao}
          onClose={closeModal}
          onSave={(dataAdmissao) => {
            setValues((prev) => ({ ...prev, dataAdmissao }))
            closeModal()
          }}
        />
      )}

      {openModal === 'salario' && (
        <SalarioModal
          value={values.salario}
          onClose={closeModal}
          onSave={(salario) => {
            setValues((prev) => ({ ...prev, salario }))
            closeModal()
          }}
        />
      )}

      {openModal === 'data-inicio-contrato' && (
        <DateFieldModal
          title="Data de início do contrato"
          value={values.dataInicioContrato}
          onClose={closeModal}
          onSave={(dataInicioContrato) => {
            setValues((prev) => ({ ...prev, dataInicioContrato }))
            closeModal()
          }}
        />
      )}

      {openModal === 'data-fim-contrato' && (
        <EndDateFieldModal
          value={values.dataFimContrato}
          onClose={closeModal}
          onSave={(dataFimContrato) => {
            setValues((prev) => ({ ...prev, dataFimContrato }))
            closeModal()
          }}
        />
      )}

      {openModal === 'pagamento' && (
        <PagamentoModal
          value={values.tipoPagamento}
          onClose={closeModal}
          onSave={(tipoPagamento) => {
            setValues((prev) => ({ ...prev, tipoPagamento }))
            closeModal()
          }}
        />
      )}

      {openModal === 'valor-pagamento' && (
        <SalarioModal
          title="Valor do pagamento"
          value={values.valorPagamento}
          onClose={closeModal}
          onSave={(valorPagamento) => {
            setValues((prev) => ({ ...prev, valorPagamento }))
            closeModal()
          }}
        />
      )}
    </WizardShell>
  )
}

export default Step2AdditionalInfo
