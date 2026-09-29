import { useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import trashIcon from '../../../assets/icons/Trash.svg'
import CltShell from '../../addCollaborator/clt/CltShell.jsx'
import BeneficioAtribuirPanel from './BeneficioAtribuirPanel.jsx'
import { formatAmountFromDigits } from '../../../utils/formatters.js'
import '@squad/ui/styles/buttons.css'
import '../../addCollaborator/clt/CltShell.css'
import './NovoBeneficioSteps.css'
import { IconButton } from '@squad/ui'

function BeneficioValorStep({
  variants,
  onAddVariant,
  onRemoveVariant,
  onDigitsChange,
  onAssign,
  resolvedBeneficiaryIds,
  collaborators,
  onBack,
  onClose,
  onContinue,
}) {
  const [atribuirVariantId, setAtribuirVariantId] = useState(null)

  const hasMultipleVariants = variants.length > 1

  const people = collaborators
    .filter((collaborator) => resolvedBeneficiaryIds.has(collaborator.id))
    .map((collaborator) => ({ id: collaborator.id, name: collaborator.name }))

  const assignedIds = new Set()
  variants.forEach((variant) => variant.colaboradorIds.forEach((id) => assignedIds.add(id)))
  const assignedCount = people.filter((person) => assignedIds.has(person.id)).length
  const canContinue = hasMultipleVariants ? assignedCount === people.length : true
  // Once every beneficiary is already accounted for across the variants,
  // there's no one left to newly assign - only reassignment makes sense.
  const allAssigned = hasMultipleVariants && people.length > 0 && assignedCount === people.length

  const atribuirVariant = variants.find((variant) => variant.id === atribuirVariantId) ?? null

  const buildAssignedElsewhere = (variantId) => {
    const map = new Map()
    variants.forEach((variant) => {
      if (variant.id === variantId) return
      variant.colaboradorIds.forEach((personId) => map.set(personId, true))
    })
    return new Set(map.keys())
  }

  return (
    <CltShell
      title="Novo Benefício"
      onClose={onClose}
      progress={80}
      footerLeft={
        <button type="button" className="text-button" onClick={onBack}>
          Voltar
        </button>
      }
      footerRight={
        <button
          type="button"
          className="pill-button"
          disabled={!canContinue}
          onClick={onContinue}
        >
          Continuar
        </button>
      }
    >
      <div className="clt-shell__content">
        <h1 className="clt-shell__title">
          Qual o valor
          <br />
          do benefício (por pessoa)?
        </h1>

        <div className="beneficio-step__variants">
          <div className="beneficio-step__variants-rows">
            {variants.map((variant) => (
              <div className="beneficio-step__variant-row" key={variant.id}>
                <div className="beneficio-step__variant-input-wrap">
                  <span className="beneficio-step__variant-currency-prefix">R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="beneficio-step__variant-input"
                    placeholder="0,00"
                    value={variant.digits ? formatAmountFromDigits(variant.digits) : ''}
                    onChange={(event) =>
                      onDigitsChange(variant.id, event.target.value.replace(/\D/g, ''))
                    }
                  />
                </div>

                {hasMultipleVariants && (
                  <div className="beneficio-step__variant-actions">
                    <button
                      type="button"
                      className="beneficio-step__variant-atribuir"
                      onClick={() => setAtribuirVariantId(variant.id)}
                    >
                      {variant.colaboradorIds.size > 0 && (
                        <span className="beneficio-step__variant-atribuir-count">
                          {variant.colaboradorIds.size}
                        </span>
                      )}
                      <span className="beneficio-step__variant-atribuir-label">
                        {allAssigned ? 'Alterar' : 'Atribuir'}
                        <Plus size={24} />
                      </span>
                    </button>

                    <IconButton
                      icon={trashIcon}
                      alt="Remover variante"
                      onClick={() => onRemoveVariant(variant.id)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {hasMultipleVariants && (
            <p className="beneficio-step__assign-counter">
              {assignedCount}/{people.length} atribuidos
            </p>
          )}

          <button type="button" className="beneficio-step__add-variant" onClick={onAddVariant}>
            <span>Adicionar variante de valor</span>
            <Plus size={24} />
          </button>
        </div>
      </div>

      {atribuirVariant && (
        <BeneficioAtribuirPanel
          people={people}
          value={Array.from(atribuirVariant.colaboradorIds)}
          assignedElsewhere={buildAssignedElsewhere(atribuirVariant.id)}
          onClose={() => setAtribuirVariantId(null)}
          onSave={(ids) => {
            onAssign(atribuirVariant.id, ids)
            setAtribuirVariantId(null)
          }}
        />
      )}
    </CltShell>
  )
}

export default BeneficioValorStep
