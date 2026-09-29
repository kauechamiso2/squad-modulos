import { useMemo, useState } from 'react'
import Step1TipoBeneficio from './Step1TipoBeneficio.jsx'
import Step2Beneficio from './Step2Beneficio.jsx'
import OutroChooserStep from './OutroChooserStep.jsx'
import OutroNomeStep from './OutroNomeStep.jsx'
import Step3Beneficiarios from './Step3Beneficiarios.jsx'
import Step4Valores from './Step4Valores.jsx'
import { DiscardConfirmModal } from '@squad/ui'
import { COLLECTIONS, getCollection, addItem, generateId } from '../../utils/storage.js'
import { resolveBeneficiaryIds } from '../../utils/beneficiarios.js'
import { centsToAmount } from '../../utils/formatters.js'

function createEmptyVariant() {
  return { id: generateId(), digits: '', colaboradorIds: new Set() }
}

function NovoBeneficioFlow({ onExit }) {
  const [collaborators] = useState(() => getCollection(COLLECTIONS.COLABORADORES))
  const [times] = useState(() => getCollection(COLLECTIONS.TIMES))

  const [step, setStep] = useState(1)
  const [tipo, setTipo] = useState(null)
  const [providerName, setProviderName] = useState(null)
  const [outroSubtipo, setOutroSubtipo] = useState(null)
  const [outroName, setOutroName] = useState('')
  const [beneficiarios, setBeneficiarios] = useState({
    colaboradorIds: new Set(),
    teamNames: new Set(),
    todaEmpresa: false,
  })
  const [variants, setVariants] = useState(() => [createEmptyVariant()])
  const [infoAdicional, setInfoAdicional] = useState({ link: '', contato: '', email: '' })
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false)

  const resolvedBeneficiaryIds = useMemo(
    () =>
      resolveBeneficiaryIds(
        {
          colaboradorIds: Array.from(beneficiarios.colaboradorIds),
          teamNames: Array.from(beneficiarios.teamNames),
          todaEmpresa: beneficiarios.todaEmpresa,
        },
        collaborators,
      ),
    [beneficiarios, collaborators],
  )

  const onAddVariant = () => setVariants((prev) => [...prev, createEmptyVariant()])

  const onRemoveVariant = (id) =>
    setVariants((prev) => (prev.length > 1 ? prev.filter((variant) => variant.id !== id) : prev))

  const onDigitsChange = (id, digits) =>
    setVariants((prev) =>
      prev.map((variant) => (variant.id === id ? { ...variant, digits } : variant)),
    )

  // Assignment exclusivity is enforced up front by the Atribuir modal (it
  // never offers someone already assigned to a different variant), so this
  // just writes the target variant's set - no "move" logic needed here.
  const onAssign = (id, ids) =>
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === id ? { ...variant, colaboradorIds: new Set(ids) } : variant,
      ),
    )

  const onInfoAdicionalChange = (field, value) =>
    setInfoAdicional((prev) => ({ ...prev, [field]: value }))

  const handleChooseTipo = (value) => {
    setTipo(value)
    setStep(2)
  }

  const handleChooseOutroSubtipo = (value) => {
    setOutroSubtipo(value)
    setOutroName('')
    setStep('2n')
  }

  const handleSave = () => {
    const isSingleVariant = variants.length === 1
    const record = {
      tipo,
      name: tipo === 'Outro' ? outroName.trim() : providerName,
      outroSubtipo: tipo === 'Outro' ? outroSubtipo : null,
      beneficiarios: {
        colaboradorIds: Array.from(beneficiarios.colaboradorIds),
        teamNames: Array.from(beneficiarios.teamNames),
          todaEmpresa: beneficiarios.todaEmpresa,
      },
      valores: variants.map((variant) => ({
        id: variant.id,
        valor: centsToAmount(variant.digits),
        aplicaATodos: isSingleVariant,
        colaboradorIds: isSingleVariant ? [] : Array.from(variant.colaboradorIds),
      })),
      linkBeneficio: infoAdicional.link.trim() || null,
      contatoFornecedor: infoAdicional.contato.trim() || null,
      emailFornecedor: infoAdicional.email.trim() || null,
    }
    addItem(COLLECTIONS.BENEFICIOS, record)
    onExit()
  }

  return (
    <>
      {step === 1 && (
        <Step1TipoBeneficio
          onChoose={handleChooseTipo}
          onExit={() => setDiscardConfirmOpen(true)}
        />
      )}

      {step === 2 && tipo !== 'Outro' && (
        <Step2Beneficio
          tipo={tipo}
          providerName={providerName}
          onProviderNameChange={setProviderName}
          onBack={() => {
            setProviderName(null)
            setStep(1)
          }}
          onExit={() => setDiscardConfirmOpen(true)}
          onContinue={() => setStep(3)}
        />
      )}

      {step === 2 && tipo === 'Outro' && (
        <OutroChooserStep
          onChoose={handleChooseOutroSubtipo}
          onBack={() => setStep(1)}
          onExit={() => setDiscardConfirmOpen(true)}
        />
      )}

      {step === '2n' && (
        <OutroNomeStep
          outroSubtipo={outroSubtipo}
          outroName={outroName}
          onOutroNameChange={setOutroName}
          onBack={() => setStep(2)}
          onExit={() => setDiscardConfirmOpen(true)}
          onContinue={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <Step3Beneficiarios
          colaboradorIds={beneficiarios.colaboradorIds}
          teamNames={beneficiarios.teamNames}
          cargoNames={beneficiarios.cargoNames}
          todaEmpresa={beneficiarios.todaEmpresa}
          onApplySelection={setBeneficiarios}
          collaborators={collaborators}
          times={times}
          cargos={cargos}
          onBack={() => setStep(tipo === 'Outro' ? '2n' : 2)}
          onExit={() => setDiscardConfirmOpen(true)}
          onContinue={() => setStep(4)}
        />
      )}

      {step === 4 && (
        <Step4Valores
          variants={variants}
          onAddVariant={onAddVariant}
          onRemoveVariant={onRemoveVariant}
          onDigitsChange={onDigitsChange}
          onAssign={onAssign}
          resolvedBeneficiaryIds={resolvedBeneficiaryIds}
          collaborators={collaborators}
          infoAdicional={infoAdicional}
          onInfoAdicionalChange={onInfoAdicionalChange}
          onBack={() => setStep(3)}
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

export default NovoBeneficioFlow
