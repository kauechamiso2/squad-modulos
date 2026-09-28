import { useMemo, useState } from 'react'
import Step1CargoInfo from './Step1CargoInfo.jsx'
import Step2CargoInfo from './Step2CargoInfo.jsx'
import MembrosModal from '../addTeam/MembrosModal.jsx'
import { DiscardConfirmModal } from '@squad/ui'
import {
  COLLECTIONS,
  getCollection,
  setCollection,
  generateId,
} from '../../utils/storage.js'

function NovoCargoFlow({ cargoId, onExit }) {
  const [cargos] = useState(() => getCollection(COLLECTIONS.CARGOS))
  const [collaborators] = useState(() => getCollection(COLLECTIONS.COLABORADORES))

  const existingCargo = useMemo(
    () => (cargoId ? cargos.find((cargo) => cargo.id === cargoId) ?? null : null),
    [cargoId, cargos],
  )

  const initialMemberIds = useMemo(() => {
    if (!existingCargo) return []
    return collaborators
      .filter((collaborator) => collaborator.cargos.includes(existingCargo.name))
      .map((collaborator) => collaborator.id)
  }, [existingCargo, collaborators])

  const [step, setStep] = useState(1)
  const [name, setName] = useState(existingCargo?.name ?? '')
  const [memberIds, setMemberIds] = useState(() => new Set(initialMemberIds))
  const [reportaAExtra, setReportaAExtra] = useState(existingCargo?.reportaAExtra ?? [])
  const [descricao, setDescricao] = useState(existingCargo?.descricao ?? '')
  const [membrosModalOpen, setMembrosModalOpen] = useState(false)
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false)

  const members = collaborators.filter((collaborator) => memberIds.has(collaborator.id))

  const handleSave = () => {
    const finalMemberIds = Array.from(memberIds)
    const previousName = existingCargo?.name ?? null

    const updatedCargos = existingCargo
      ? cargos.map((cargo) =>
          cargo.id === existingCargo.id
            ? {
                ...cargo,
                name,
                colaboradorIds: finalMemberIds,
                reportaAExtra,
                descricao,
                pending: false,
              }
            : cargo,
        )
      : [
          ...cargos,
          {
            id: generateId(),
            name,
            colaboradorIds: finalMemberIds,
            reportaAExtra,
            descricao,
            pending: false,
          },
        ]
    setCollection(COLLECTIONS.CARGOS, updatedCargos)

    const finalMemberIdSet = new Set(finalMemberIds)
    const removedIdSet = new Set(
      existingCargo ? initialMemberIds.filter((id) => !finalMemberIdSet.has(id)) : [],
    )

    const updatedCollaborators = collaborators.map((collaborator) => {
      let cargoNames = collaborator.cargos

      if (removedIdSet.has(collaborator.id) && previousName) {
        cargoNames = cargoNames.filter((cargoName) => cargoName !== previousName)
      }

      if (finalMemberIdSet.has(collaborator.id)) {
        const withoutOldName =
          previousName && previousName !== name
            ? cargoNames.filter((cargoName) => cargoName !== previousName)
            : cargoNames
        cargoNames = withoutOldName.includes(name)
          ? withoutOldName
          : [...withoutOldName, name]
      }

      if (cargoNames === collaborator.cargos) return collaborator
      return { ...collaborator, cargos: cargoNames }
    })
    setCollection(COLLECTIONS.COLABORADORES, updatedCollaborators)

    onExit()
  }

  return (
    <>
      {step === 1 && (
        <Step1CargoInfo
          name={name}
          onNameChange={setName}
          memberCount={memberIds.size}
          onOpenColaboradores={() => setMembrosModalOpen(true)}
          onExit={() => setDiscardConfirmOpen(true)}
          onContinue={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <Step2CargoInfo
          members={members}
          collaborators={collaborators}
          reportaAExtra={reportaAExtra}
          onReportaAExtraChange={setReportaAExtra}
          descricao={descricao}
          onDescricaoChange={setDescricao}
          onBack={() => setStep(1)}
          onExit={() => setDiscardConfirmOpen(true)}
          onContinue={handleSave}
        />
      )}

      {membrosModalOpen && (
        <MembrosModal
          title="Colaboradores"
          collaborators={collaborators}
          value={Array.from(memberIds)}
          onClose={() => setMembrosModalOpen(false)}
          onSave={(ids) => {
            setMemberIds(new Set(ids))
            setMembrosModalOpen(false)
          }}
        />
      )}

      {discardConfirmOpen && (
        <DiscardConfirmModal
          onCancel={() => setDiscardConfirmOpen(false)}
          onConfirm={onExit}
        />
      )}
    </>
  )
}

export default NovoCargoFlow
