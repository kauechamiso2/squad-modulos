import { useState } from 'react'
import Step1BasicInfo from './Step1BasicInfo.jsx'
import Step2AdditionalInfo from './Step2AdditionalInfo.jsx'
import ContratoModal from './ContratoModal.jsx'
import { DiscardConfirmModal } from '@squad/ui'

function AddCollaboratorFlow({ onExit }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [contractType, setContractType] = useState('Fixo')
  const [contratoModalOpen, setContratoModalOpen] = useState(false)
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false)

  return (
    <>
      {step === 1 && (
        <Step1BasicInfo
          name={name}
          onNameChange={setName}
          contractType={contractType}
          onOpenContrato={() => setContratoModalOpen(true)}
          onExit={() => setDiscardConfirmOpen(true)}
          onContinue={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <Step2AdditionalInfo
          name={name}
          contractType={contractType}
          onBack={() => setStep(1)}
          onExit={() => setDiscardConfirmOpen(true)}
          onContinue={onExit}
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
