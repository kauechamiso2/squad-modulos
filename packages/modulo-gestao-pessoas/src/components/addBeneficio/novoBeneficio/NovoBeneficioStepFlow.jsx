import { useMemo, useState } from 'react'
import BeneficioTipoStep from './BeneficioTipoStep.jsx'
import BeneficioFornecedorStep from './BeneficioFornecedorStep.jsx'
import BeneficioBeneficiariosStep from './BeneficioBeneficiariosStep.jsx'
import BeneficioValorStep from './BeneficioValorStep.jsx'
import BeneficioInfoStep from './BeneficioInfoStep.jsx'
import OutroChooserStep from '../OutroChooserStep.jsx'
import OutroNomeStep from '../OutroNomeStep.jsx'
import Step3Beneficiarios from '../Step3Beneficiarios.jsx'
import Step4Valores from '../Step4Valores.jsx'
import DiscardConfirmModal from '../../addCollaborator/DiscardConfirmModal.jsx'
import { COLLECTIONS, getCollection, addItem, generateId } from '../../../utils/storage.js'
import { resolveBeneficiaryIds } from '../../../utils/beneficiarios.js'
import { centsToAmount } from '../../../utils/formatters.js'
import { useToast } from '../../toast/ToastContext.jsx'

function createEmptyVariant() {
  return { id: generateId(), digits: '', colaboradorIds: new Set() }
}

// The step-by-step full-screen flow for the 6 named benefit categories
// (Plano de Saúde, Vale Transporte, Vale Alimentação, Bem-Estar, Plano
// Odontológico, Seguro de Vida). "Outro" on Tela 1 hands off to the older
// Fixo/Verba wizard (OutroChooserStep/OutroNomeStep/Step3Beneficiarios/
// Step4Valores, all unmodified) - only the 6-category path was redesigned
// here; both paths share the same beneficiarios/variants/infoAdicional
// state shape and converge on the same handleSave.
function NovoBeneficioStepFlow({ onExit }) {
  const { showToast } = useToast()
  const [collaborators] = useState(() => getCollection(COLLECTIONS.COLABORADORES))
  const [times] = useState(() => getCollection(COLLECTIONS.TIMES))

  const [step, setStep] = useState('tipo')
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

  const openDiscardConfirm = () => setDiscardConfirmOpen(true)

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

  const onAssign = (id, ids) =>
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === id ? { ...variant, colaboradorIds: new Set(ids) } : variant,
      ),
    )

  const onInfoAdicionalChange = (field, value) =>
    setInfoAdicional((prev) => ({ ...prev, [field]: value }))

  const handleChooseCategoria = (categoria) => {
    setTipo(categoria)
    setProviderName(null)
    setStep('fornecedor')
  }

  const handleChooseOutro = () => {
    setTipo('Outro')
    setStep('outro-chooser')
  }

  const handleChooseOutroSubtipo = (value) => {
    setOutroSubtipo(value)
    setOutroName('')
    setStep('outro-nome')
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
    showToast('success', 'Benefício criado com sucesso')
    onExit()
  }

  return (
    <>
      {step === 'tipo' && (
        <BeneficioTipoStep
          onChooseCategoria={handleChooseCategoria}
          onChooseOutro={handleChooseOutro}
          onClose={onExit}
        />
      )}

      {step === 'fornecedor' && (
        <BeneficioFornecedorStep
          tipo={tipo}
          providerName={providerName}
          onProviderNameChange={setProviderName}
          onBack={() => {
            setProviderName(null)
            setStep('tipo')
          }}
          onClose={openDiscardConfirm}
          onContinue={() => setStep('beneficiarios')}
        />
      )}

      {step === 'beneficiarios' && (
        <BeneficioBeneficiariosStep
          colaboradorIds={beneficiarios.colaboradorIds}
          teamNames={beneficiarios.teamNames}
          todaEmpresa={beneficiarios.todaEmpresa}
          onChange={setBeneficiarios}
          collaborators={collaborators}
          times={times}
          onBack={() => setStep('fornecedor')}
          onClose={openDiscardConfirm}
          onContinue={() => setStep('valor')}
        />
      )}

      {step === 'valor' && (
        <BeneficioValorStep
          variants={variants}
          onAddVariant={onAddVariant}
          onRemoveVariant={onRemoveVariant}
          onDigitsChange={onDigitsChange}
          onAssign={onAssign}
          resolvedBeneficiaryIds={resolvedBeneficiaryIds}
          collaborators={collaborators}
          onBack={() => setStep('beneficiarios')}
          onClose={openDiscardConfirm}
          onContinue={() => setStep('info')}
        />
      )}

      {step === 'info' && (
        <BeneficioInfoStep
          infoAdicional={infoAdicional}
          onInfoAdicionalChange={onInfoAdicionalChange}
          onBack={() => setStep('valor')}
          onClose={openDiscardConfirm}
          onCreate={handleSave}
        />
      )}

      {step === 'outro-chooser' && (
        <OutroChooserStep
          onChoose={handleChooseOutroSubtipo}
          onBack={() => setStep('tipo')}
          onExit={openDiscardConfirm}
        />
      )}

      {step === 'outro-nome' && (
        <OutroNomeStep
          outroSubtipo={outroSubtipo}
          outroName={outroName}
          onOutroNameChange={setOutroName}
          onBack={() => setStep('outro-chooser')}
          onExit={openDiscardConfirm}
          onContinue={() => setStep('outro-beneficiarios')}
        />
      )}

      {step === 'outro-beneficiarios' && (
        <Step3Beneficiarios
          colaboradorIds={beneficiarios.colaboradorIds}
          teamNames={beneficiarios.teamNames}
          todaEmpresa={beneficiarios.todaEmpresa}
          onApplySelection={setBeneficiarios}
          collaborators={collaborators}
          times={times}
          onBack={() => setStep('outro-nome')}
          onExit={openDiscardConfirm}
          onContinue={() => setStep('outro-valor')}
        />
      )}

      {step === 'outro-valor' && (
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
          onBack={() => setStep('outro-beneficiarios')}
          onExit={openDiscardConfirm}
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

export default NovoBeneficioStepFlow
