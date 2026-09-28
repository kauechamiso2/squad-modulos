import { useMemo, useState } from 'react'
import Step1TeamInfo from './Step1TeamInfo.jsx'
import Step2TeamInfo from './Step2TeamInfo.jsx'
import { DiscardConfirmModal } from '@squad/ui'
import {
  COLLECTIONS,
  getCollection,
  setCollection,
  generateId,
} from '../../utils/storage.js'
import { pickDefaultColorId, guessTeamIconName } from '../../utils/teamOptions.js'

function NovoTimeFlow({ teamId, onExit }) {
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
    () =>
      times
        .filter((team) => team.id !== teamId && team.color)
        .map((team) => team.color),
    [times, teamId],
  )

  const [step, setStep] = useState(1)
  const [name, setName] = useState(existingTeam?.name ?? '')
  const [colorId, setColorId] = useState(
    existingTeam?.color ?? pickDefaultColorId(usedColors),
  )
  const [iconTouched, setIconTouched] = useState(Boolean(existingTeam?.icon))
  const [iconName, setIconName] = useState(
    existingTeam?.icon ?? guessTeamIconName(existingTeam?.name ?? ''),
  )
  const [leaderId, setLeaderId] = useState(existingTeam?.leaderId ?? null)
  const [membroIds, setMembroIds] = useState(() => new Set(initialMemberIds))
  const [descricao, setDescricao] = useState(existingTeam?.descricao ?? '')
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false)

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
    const finalMemberIds = Array.from(membroIds)
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
        teamNames = withoutOldName.includes(name)
          ? withoutOldName
          : [...withoutOldName, name]
      }

      if (teamNames === collaborator.times) return collaborator
      return { ...collaborator, times: teamNames }
    })
    setCollection(COLLECTIONS.COLABORADORES, updatedCollaborators)

    onExit()
  }

  return (
    <>
      {step === 1 && (
        <Step1TeamInfo
          name={name}
          onNameChange={handleNameChange}
          colorId={colorId}
          onColorChange={setColorId}
          iconName={iconName}
          onIconChange={handleIconChange}
          onExit={() => setDiscardConfirmOpen(true)}
          onContinue={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <Step2TeamInfo
          leaderId={leaderId}
          onLeaderChange={setLeaderId}
          membroIds={membroIds}
          onMembrosChange={setMembroIds}
          descricao={descricao}
          onDescricaoChange={setDescricao}
          collaborators={collaborators}
          onBack={() => setStep(1)}
          onExit={() => setDiscardConfirmOpen(true)}
          onContinue={handleSave}
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

export default NovoTimeFlow
