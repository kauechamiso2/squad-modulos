import { useState } from 'react'
import caretRightIcon from '../../assets/icons/CaretRight.svg'
import { WizardShell } from '@squad/ui'
import LiderModal from './LiderModal.jsx'
import MembrosModal from './MembrosModal.jsx'
import DescricaoModal from './DescricaoModal.jsx'
import '@squad/ui/styles/buttons.css'
import '@squad/ui/styles/Step2AdditionalInfo.css'

const DESCRICAO_PREVIEW_LIMIT = 40

function Step2TeamInfo({
  leaderId,
  onLeaderChange,
  membroIds,
  onMembrosChange,
  descricao,
  onDescricaoChange,
  collaborators,
  onBack,
  onExit,
  onContinue,
}) {
  const [openModal, setOpenModal] = useState(null)
  const closeModal = () => setOpenModal(null)

  const members = collaborators.filter((collaborator) => membroIds.has(collaborator.id))
  const leader = leaderId
    ? collaborators.find((collaborator) => collaborator.id === leaderId) ?? null
    : null

  const trimmedDescricao = descricao.trim()
  const descricaoPreview = trimmedDescricao.length > DESCRICAO_PREVIEW_LIMIT
    ? `${trimmedDescricao.slice(0, DESCRICAO_PREVIEW_LIMIT)}…`
    : trimmedDescricao

  return (
    <WizardShell
      title="Novo Time"
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
          <button
            type="button"
            className="step2__row"
            onClick={() => setOpenModal('lider')}
          >
            <span
              className={
                leader
                  ? 'step2__row-label step2__row-label--filled'
                  : 'step2__row-label'
              }
            >
              Líder do time
            </span>
            <span className="step2__row-action">
              {leader ? leader.name : 'Adicionar'}
            </span>
            <span className="step2__row-icon">
              <img src={caretRightIcon} alt="" width={24} height={24} />
            </span>
          </button>

          <button
            type="button"
            className="step2__row"
            onClick={() => setOpenModal('membros')}
          >
            <span
              className={
                members.length > 0
                  ? 'step2__row-label step2__row-label--filled'
                  : 'step2__row-label'
              }
            >
              Adicionar membros
            </span>
            <span className="step2__row-action">
              {members.length > 0 ? `${members.length} pessoas` : 'Adicionar'}
            </span>
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

      {openModal === 'lider' && (
        <LiderModal
          value={leaderId}
          collaborators={collaborators}
          onClose={closeModal}
          onSave={(newLeaderId) => {
            onLeaderChange(newLeaderId)
            if (newLeaderId && !membroIds.has(newLeaderId)) {
              const nextSet = new Set(membroIds)
              nextSet.add(newLeaderId)
              onMembrosChange(nextSet)
            }
            closeModal()
          }}
        />
      )}

      {openModal === 'membros' && (
        <MembrosModal
          collaborators={collaborators}
          value={Array.from(membroIds)}
          onClose={closeModal}
          onSave={(ids) => {
            onMembrosChange(new Set(ids))
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

export default Step2TeamInfo
