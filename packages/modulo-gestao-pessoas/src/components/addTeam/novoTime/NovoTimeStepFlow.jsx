import { useMemo, useState } from 'react'
import TimeNomeStep from './TimeNomeStep.jsx'
import TimeCorIconeStep from './TimeCorIconeStep.jsx'
import TimeMembrosStep from './TimeMembrosStep.jsx'
import TimeInfoStep from './TimeInfoStep.jsx'
import DiscardConfirmModal from '../../addCollaborator/DiscardConfirmModal.jsx'
import { COLLECTIONS, getCollection, setCollection, generateId } from '../../../utils/storage.js'
import { pickDefaultColorId, guessTeamIconName } from '../../../utils/teamOptions.js'
import { useToast } from '../../toast/ToastContext.jsx'

// The step-by-step full-screen flow for creating a team, triggered from the
// "Time" card in the Criar Novo modal (brand-new team, starts at Tela 1 -
// Nome), and also from a pending team card's "Criar time" (teamId given -
// the name already exists from the quick-create panel, so Tela 1 is
// skipped and the flow opens straight at Cor e Ícone, pre-filled with the
// team's already-selected members).
function NovoTimeStepFlow({ teamId, onExit }) {
  const { showToast } = useToast()
  const [times] = useState(() => getCollection(COLLECTIONS.TIMES))
  const [collaborators] = useState(() => getCollection(COLLECTIONS.COLABORADORES))

  const existingTeam = useMemo(
    () => (teamId ? times.find((team) => team.id === teamId) ?? null : null),
    [teamId, times],
  )

  const initialMemberIds = useMemo(() => {
    if (!existingTeam) return []
    return collaborators
      .filter((collaborator) => collaborator.times.includes(existingTeam.name))
      .map((collaborator) => collaborator.id)
  }, [existingTeam, collaborators])

  const usedColors = useMemo(
    () => times.filter((team) => team.id !== teamId && team.color).map((team) => team.color),
    [times, teamId],
  )

  const [step, setStep] = useState(existingTeam ? 'cor-icone' : 'nome')
  const [name, setName] = useState(existingTeam?.name ?? '')
  const [colorId, setColorId] = useState(
    () => existingTeam?.color ?? pickDefaultColorId(usedColors),
  )
  const [iconTouched, setIconTouched] = useState(Boolean(existingTeam?.icon))
  const [iconName, setIconName] = useState(
    () => existingTeam?.icon ?? guessTeamIconName(existingTeam?.name ?? ''),
  )
  const [memberOrder, setMemberOrder] = useState(initialMemberIds)
  const [leaderId, setLeaderId] = useState(existingTeam?.leaderId ?? null)
  const [descricao, setDescricao] = useState(existingTeam?.descricao ?? '')
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false)

  const openDiscardConfirm = () => setDiscardConfirmOpen(true)

  const handleNameChange = (value) => {
    setName(value)
    if (!iconTouched) {
      setIconName(guessTeamIconName(value))
    }
  }

  const handleIconChange = (value) => {
    setIconTouched(true)
    setIconName(value)
  }

  const handleSave = () => {
    const finalMemberIds = memberOrder
    const previousName = existingTeam?.name ?? null

    const updatedTimes = existingTeam
      ? times.map((team) =>
          team.id === existingTeam.id
            ? {
                ...team,
                name,
                color: colorId,
                icon: iconName,
                leaderId,
                membros: finalMemberIds,
                descricao,
                pending: false,
              }
            : team,
        )
      : [
          ...times,
          {
            id: generateId(),
            name,
            color: colorId,
            icon: iconName,
            leaderId,
            membros: finalMemberIds,
            descricao,
            pending: false,
          },
        ]
    setCollection(COLLECTIONS.TIMES, updatedTimes)

    const finalMemberIdSet = new Set(finalMemberIds)
    const removedIdSet = new Set(
      existingTeam ? initialMemberIds.filter((id) => !finalMemberIdSet.has(id)) : [],
    )

    const updatedCollaborators = collaborators.map((collaborator) => {
      let teamNames = collaborator.times

      if (removedIdSet.has(collaborator.id) && previousName) {
        teamNames = teamNames.filter((teamName) => teamName !== previousName)
      }

      if (finalMemberIdSet.has(collaborator.id)) {
        const withoutOldName =
          previousName && previousName !== name
            ? teamNames.filter((teamName) => teamName !== previousName)
            : teamNames
        teamNames = withoutOldName.includes(name) ? withoutOldName : [...withoutOldName, name]
      }

      if (teamNames === collaborator.times) return collaborator
      return { ...collaborator, times: teamNames }
    })
    setCollection(COLLECTIONS.COLABORADORES, updatedCollaborators)

    showToast('success', 'Time criado com sucesso')
    onExit()
  }

  return (
    <>
      {step === 'nome' && (
        <TimeNomeStep
          name={name}
          onNameChange={handleNameChange}
          onBack={onExit}
          onClose={openDiscardConfirm}
          onContinue={() => setStep('cor-icone')}
        />
      )}

      {step === 'cor-icone' && (
        <TimeCorIconeStep
          name={name}
          colorId={colorId}
          onColorChange={setColorId}
          iconName={iconName}
          onIconChange={handleIconChange}
          usedColors={usedColors}
          onBack={existingTeam ? onExit : () => setStep('nome')}
          onClose={openDiscardConfirm}
          onContinue={() => setStep('membros')}
        />
      )}

      {step === 'membros' && (
        <TimeMembrosStep
          name={name}
          colorId={colorId}
          iconName={iconName}
          collaborators={collaborators}
          memberOrder={memberOrder}
          onMemberOrderChange={setMemberOrder}
          onBack={() => setStep('cor-icone')}
          onClose={openDiscardConfirm}
          onContinue={() => setStep('info')}
        />
      )}

      {step === 'info' && (
        <TimeInfoStep
          leaderId={leaderId}
          onLeaderChange={setLeaderId}
          memberOrder={memberOrder}
          collaborators={collaborators}
          descricao={descricao}
          onDescricaoChange={setDescricao}
          onBack={() => setStep('membros')}
          onClose={openDiscardConfirm}
          onCreate={handleSave}
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

export default NovoTimeStepFlow
