import { useState } from 'react'
import CltShell from '../../addCollaborator/clt/CltShell.jsx'
import LiderModal from '../LiderModal.jsx'
import DescricaoModal from '../DescricaoModal.jsx'
import '@squad/ui/styles/buttons.css'
import '../../addCollaborator/clt/CltShell.css'
import '../../colaborador/ColaboradorDetail.css'
import './NovoTimeSteps.css'

const DESCRICAO_PREVIEW_LIMIT = 40

function TimeInfoStep({
  leaderId,
  onLeaderChange,
  memberOrder,
  collaborators,
  descricao,
  onDescricaoChange,
  onBack,
  onClose,
  onCreate,
}) {
  const [openModal, setOpenModal] = useState(null)
  const closeModal = () => setOpenModal(null)

  const members = collaborators.filter((collaborator) => memberOrder.includes(collaborator.id))
  const leader = leaderId
    ? collaborators.find((collaborator) => collaborator.id === leaderId) ?? null
    : null

  const trimmedDescricao = descricao.trim()
  const descricaoPreview =
    trimmedDescricao.length > DESCRICAO_PREVIEW_LIMIT
      ? `${trimmedDescricao.slice(0, DESCRICAO_PREVIEW_LIMIT)}…`
      : trimmedDescricao

  return (
    <>
      <CltShell
        title="Novo Time"
        onClose={onClose}
        progress={100}
        footerLeft={
          <button type="button" className="text-button" onClick={onBack}>
            Voltar
          </button>
        }
        footerRight={
          <button type="button" className="pill-button" onClick={onCreate}>
            Criar time
          </button>
        }
      >
        <div className="clt-shell__content">
          <h1 className="clt-shell__title">
            Finalize com algumas
            <br />
            informações adicionais.
          </h1>

          <div>
            <div className="time-step__row time-step__row--bordered">
              <span className="time-step__row-label" style={{ flex: 1 }}>
                Líder do time
              </span>
              <button
                type="button"
                className="colaborador-detail__value-button"
                onClick={() => setOpenModal('lider')}
              >
                {leader ? leader.name : 'Adicionar'}
              </button>
            </div>

            <div className="time-step__row time-step__row--bordered">
              <span className="time-step__row-label" style={{ flex: 1 }}>
                Descrição
              </span>
              <button
                type="button"
                className="colaborador-detail__value-button"
                onClick={() => setOpenModal('descricao')}
              >
                {trimmedDescricao ? descricaoPreview : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      </CltShell>

      {openModal === 'lider' && (
        <LiderModal
          value={leaderId}
          collaborators={members}
          onClose={closeModal}
          onSave={(newLeaderId) => {
            onLeaderChange(newLeaderId)
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
    </>
  )
}

export default TimeInfoStep
