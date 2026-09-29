import { useState } from 'react'
import TipoContratacaoStep from './TipoContratacaoStep.jsx'
import Step1BasicInfo from './Step1BasicInfo.jsx'
import Step2AdditionalInfo from './Step2AdditionalInfo.jsx'
import ContratoModal from './ContratoModal.jsx'
import DiscardConfirmModal from './DiscardConfirmModal.jsx'
import CltNomeStep from './clt/CltNomeStep.jsx'
import CltCargoTimeStep from './clt/CltCargoTimeStep.jsx'
import CltInfoStep from './clt/CltInfoStep.jsx'
import { useToast } from '../toast/ToastContext.jsx'

function AddCollaboratorFlow({ onExit }) {
  const { showToast } = useToast()

  const handleCreated = () => {
    showToast('success', 'Colaborador criado com sucesso')
    onExit()
  }
  // 'tipo' -> Tela 1 (shared entry).
  // 1 / 2 -> the old flow, now unused (kept only as dead-simple fallback
  // plumbing; every Tela 1 card routes into the rebuilt flow below).
  // 'clt-nome' / 'clt-cargo-time' / 'clt-info' -> the rebuilt CLT/PJ/
  // Freelancer/Consultor flow, shared by all four (cltContractType tracks
  // which: 'Fixo', 'PJ', 'Freelancer', or 'Consultor').
  const [step, setStep] = useState('tipo')
  const [name, setName] = useState('')
  const [contractType, setContractType] = useState('Fixo')
  const [contratoModalOpen, setContratoModalOpen] = useState(false)
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false)

  const [cltContractType, setCltContractType] = useState('Fixo')
  const [cltName, setCltName] = useState('')
  const [cltCargo, setCltCargo] = useState('')
  const [cltTeam, setCltTeam] = useState('')

  const openDiscardConfirm = () => setDiscardConfirmOpen(true)

  // Voltar on Tela 2 has no earlier CLT-path step to return the user's
  // progress to - Tela 1 is a fresh contract-type pick, so going back to it
  // clears whatever was typed/chosen from Tela 2 on, same as if the flow
  // were started over.
  const handleBackToTipo = () => {
    setCltName('')
    setCltCargo('')
    setCltTeam('')
    setStep('tipo')
  }

  const handleChooseTipo = (tipo) => {
    if (tipo === 'CLT' || tipo === 'PJ' || tipo === 'Freelancer' || tipo === 'Consultor') {
      setCltContractType(tipo === 'CLT' ? 'Fixo' : tipo)
      setStep('clt-nome')
      return
    }
    setContractType(tipo)
    setStep(1)
  }

  return (
    <>
      {step === 'tipo' && (
        <TipoContratacaoStep onChoose={handleChooseTipo} onExit={onExit} />
      )}

      {step === 1 && (
        <Step1BasicInfo
          name={name}
          onNameChange={setName}
          contractType={contractType}
          onOpenContrato={() => setContratoModalOpen(true)}
          onExit={openDiscardConfirm}
          onContinue={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <Step2AdditionalInfo
          name={name}
          contractType={contractType}
          onBack={() => setStep(1)}
          onExit={openDiscardConfirm}
          onContinue={handleCreated}
        />
      )}

      {step === 'clt-nome' && (
        <CltNomeStep
          name={cltName}
          onNameChange={setCltName}
          onBack={handleBackToTipo}
          onClose={openDiscardConfirm}
          onContinue={() => setStep('clt-cargo-time')}
        />
      )}

      {step === 'clt-cargo-time' && (
        <CltCargoTimeStep
          name={cltName}
          initialCargo={cltCargo}
          initialTeam={cltTeam}
          onBack={() => setStep('clt-nome')}
          onClose={openDiscardConfirm}
          onSkip={() => {
            setCltCargo('')
            setCltTeam('')
            setStep('clt-info')
          }}
          onContinue={(cargoName, teamName) => {
            setCltCargo(cargoName)
            setCltTeam(teamName)
            setStep('clt-info')
          }}
        />
      )}

      {step === 'clt-info' && (
        <CltInfoStep
          name={cltName}
          cargoName={cltCargo}
          teamName={cltTeam}
          contractType={cltContractType}
          onBack={() => setStep('clt-cargo-time')}
          onClose={openDiscardConfirm}
          onCreate={handleCreated}
        />
      )}

      {contratoModalOpen && (
        <ContratoModal
          value={contractType}
          onSave={(newValue) => {
            setContractType(newValue)
            setContratoModalOpen(false)
          }}
          onClose={() => setContratoModalOpen(false)}
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

export default AddCollaboratorFlow
