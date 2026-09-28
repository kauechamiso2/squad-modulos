import { useState } from 'react'
import caretRightIcon from '../../assets/icons/CaretRight.svg'
import { WizardShell } from '@squad/ui'
import DescricaoModal from '../addTeam/DescricaoModal.jsx'
import ReportaAModal from './ReportaAModal.jsx'
import { formatFaixaSalarial } from '../../utils/formatters.js'
import '@squad/ui/styles/buttons.css'
import '@squad/ui/styles/Step2AdditionalInfo.css'

const DESCRICAO_PREVIEW_LIMIT = 40

function Step2CargoInfo({
  members,
  collaborators,
  reportaAExtra,
  onReportaAExtraChange,
  descricao,
  onDescricaoChange,
  onBack,
  onExit,
  onContinue,
}) {
  const [openModal, setOpenModal] = useState(null)
  const closeModal = () => setOpenModal(null)

  const fixoSalaries = members
    .filter(
      (member) => (member.contractType || 'Fixo') === 'Fixo' && member.salario != null,
    )
    .map((member) => member.salario)
  const salaryMin = fixoSalaries.length ? Math.min(...fixoSalaries) : null
  const salaryMax = fixoSalaries.length ? Math.max(...fixoSalaries) : null
  const faixaSalarialText = formatFaixaSalarial(salaryMin, salaryMax)

  const teamNameSet = new Set()
  members.forEach((member) => member.times.forEach((teamName) => teamNameSet.add(teamName)))
  const timesAssociadosText = teamNameSet.size ? Array.from(teamNameSet).join(', ') : '—'

  const reportaDerived = Array.from(
    new Set(members.map((member) => member.reportaPara).filter(Boolean)),
  )
  const reportaAll = Array.from(new Set([...reportaDerived, ...reportaAExtra]))
  const reportaText = reportaAll.length ? reportaAll.join(', ') : '—'

  const trimmedDescricao = descricao.trim()
  const descricaoPreview =
    trimmedDescricao.length > DESCRICAO_PREVIEW_LIMIT
      ? `${trimmedDescricao.slice(0, DESCRICAO_PREVIEW_LIMIT)}…`
      : trimmedDescricao

  return (
    <WizardShell
      title="Novo Cargo"
      onClose={onExit}
      progress={100}
      footerLeft={
        <button type="button" className="text-button" onClick={onBack}>
          Voltar
        </button>
      }
      footerRight={
        <button type="button" className="pill-button" onClick={onContinue}>
          Continuar
        </button>
      }
    >
      <div className="step2">
        <p className="step2__section-label">Informações</p>
        <div className="step2__list">
          <div className="step2__row">
            <span
              className={
                salaryMin != null
                  ? 'step2__row-label step2__row-label--filled'
                  : 'step2__row-label'
              }
            >
              Faixa salarial
            </span>
            <span className="step2__row-action">{faixaSalarialText}</span>
          </div>

          <div className="step2__row">
            <span
              className={
                teamNameSet.size > 0
                  ? 'step2__row-label step2__row-label--filled'
                  : 'step2__row-label'
              }
            >
              Times associados
            </span>
            <span className="step2__row-action">{timesAssociadosText}</span>
          </div>

          <button
            type="button"
            className="step2__row"
            onClick={() => setOpenModal('reporta-a')}
          >
            <span
              className={
                reportaAll.length > 0
                  ? 'step2__row-label step2__row-label--filled'
                  : 'step2__row-label'
              }
            >
              Reporta a
            </span>
            <span className="step2__row-action">{reportaText}</span>
            <span className="step2__row-icon">
              <img src={caretRightIcon} alt="" width={24} height={24} />
            </span>
          </button>

          <button
            type="button"
            className="step2__row"
            onClick={() => setOpenModal('descricao')}
          >
            <span
              className={
                trimmedDescricao
                  ? 'step2__row-label step2__row-label--filled'
                  : 'step2__row-label'
              }
            >
              Descrição
            </span>
            <span className="step2__row-action">
              {trimmedDescricao ? descricaoPreview : 'Adicionar'}
            </span>
            <span className="step2__row-icon">
              <img src={caretRightIcon} alt="" width={24} height={24} />
            </span>
          </button>
        </div>
      </div>

      {openModal === 'reporta-a' && (
        <ReportaAModal
          collaborators={collaborators}
          excludedNames={reportaDerived}
          value={reportaAExtra}
          onClose={closeModal}
          onSave={(names) => {
            onReportaAExtraChange(names)
            closeModal()
          }}
        />
      )}

      {openModal === 'descricao' && (
        <DescricaoModal
          value={descricao}
          onClose={closeModal}
          onSave={(value) => {
            onDescricaoChange(value)
            closeModal()
          }}
        />
      )}
    </WizardShell>
  )
}

export default Step2CargoInfo
