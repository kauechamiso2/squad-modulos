import { useState } from 'react'
import trashIcon from '../../assets/icons/Trash.svg'
import caretDownIcon from '../../assets/icons/CaretDown.svg'
import caretRightIcon from '../../assets/icons/CaretRight.svg'
import { IconButton, WizardShell } from '@squad/ui'
import AtribuirModal from './AtribuirModal.jsx'
import LinkModal from './LinkModal.jsx'
import ContatoFornecedorModal from './ContatoFornecedorModal.jsx'
import EmailFornecedorModal from './EmailFornecedorModal.jsx'
import { formatAmountFromDigits, formatCurrencyBRL, centsToAmount } from '../../utils/formatters.js'
import '@squad/ui/styles/buttons.css'
import '@squad/ui/styles/Step1BasicInfo.css'
import '@squad/ui/styles/Step2AdditionalInfo.css'
import './Step4Valores.css'

function Step4Valores({
  variants,
  onAddVariant,
  onRemoveVariant,
  onDigitsChange,
  onAssign,
  resolvedBeneficiaryIds,
  collaborators,
  infoAdicional,
  onInfoAdicionalChange,
  onBack,
  onExit,
  onContinue,
}) {
  const [atribuirVariantId, setAtribuirVariantId] = useState(null)
  const [accordionOpen, setAccordionOpen] = useState(false)
  const [openInfoModal, setOpenInfoModal] = useState(null)
  const closeInfoModal = () => setOpenInfoModal(null)

  const hasMultipleVariants = variants.length > 1

  const people = collaborators
    .filter((collaborator) => resolvedBeneficiaryIds.has(collaborator.id))
    .map((collaborator) => ({ id: collaborator.id, name: collaborator.name }))

  const assignedIds = new Set()
  variants.forEach((variant) => variant.colaboradorIds.forEach((id) => assignedIds.add(id)))
  const unassignedCount = people.filter((person) => !assignedIds.has(person.id)).length
  const canContinue = hasMultipleVariants ? unassignedCount === 0 : true

  const atribuirVariant = variants.find((variant) => variant.id === atribuirVariantId) ?? null

  const buildAssignedElsewhere = (variantId) => {
    const map = new Map()
    variants.forEach((variant) => {
      if (variant.id === variantId) return
      const display = formatCurrencyBRL(centsToAmount(variant.digits))
      variant.colaboradorIds.forEach((personId) => map.set(personId, display))
    })
    return map
  }

  return (
    <WizardShell
      title="Novo Benefício"
      onClose={onExit}
      progress={100}
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
      <div className="step1 step4__page">
        <div className="step4__variants">
          <p className="step4__section-label">Valores</p>

          {variants.map((variant) => (
            <div className="step4__variant-row" key={variant.id}>
              <div className="step4__variant-input-wrap">
                <span className="step4__variant-currency-prefix">R$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="step4__variant-input"
                  placeholder="0,00"
                  value={variant.digits ? formatAmountFromDigits(variant.digits) : ''}
                  onChange={(event) =>
                    onDigitsChange(variant.id, event.target.value.replace(/\D/g, ''))
                  }
                />
              </div>
              {hasMultipleVariants && (
                <button
                  type="button"
                  className="step4__variant-atribuir"
                  onClick={() => setAtribuirVariantId(variant.id)}
                >
                  {variant.colaboradorIds.size > 0
                    ? `Atribuir (${variant.colaboradorIds.size})`
                    : 'Atribuir'}
                </button>
              )}
              {hasMultipleVariants && (
                <IconButton
                  icon={trashIcon}
                  alt="Remover variante"
                  onClick={() => onRemoveVariant(variant.id)}
                />
              )}
            </div>
          ))}

          <button type="button" className="step4__add-variant" onClick={onAddVariant}>
            + Adicionar variante
          </button>

          {hasMultipleVariants && (
            <p className="step4__counter">
              {unassignedCount} de {people.length} colaboradores sem valor atribuído
            </p>
          )}
        </div>

        <div className="step4__accordion">
          <button
            type="button"
            className="step4__accordion-toggle"
            onClick={() => setAccordionOpen((open) => !open)}
          >
            <span className="step4__accordion-toggle-label">Informações adicionais</span>
            <img
              className={
                accordionOpen
                  ? 'step4__accordion-caret step4__accordion-caret--open'
                  : 'step4__accordion-caret'
              }
              src={caretDownIcon}
              alt=""
              width={24}
              height={24}
            />
          </button>

          {accordionOpen && (
            <div className="step4__accordion-body step2__list">
              <button
                type="button"
                className="step2__row"
                onClick={() => setOpenInfoModal('link')}
              >
                <span
                  className={
                    infoAdicional.link
                      ? 'step2__row-label step2__row-label--filled'
                      : 'step2__row-label'
                  }
                >
                  Link do benefício
                </span>
                <span className="step2__row-action">
                  {infoAdicional.link || 'Adicionar'}
                </span>
                <span className="step2__row-icon">
                  <img src={caretRightIcon} alt="" width={24} height={24} />
                </span>
              </button>

              <button
                type="button"
                className="step2__row"
                onClick={() => setOpenInfoModal('contato')}
              >
                <span
                  className={
                    infoAdicional.contato
                      ? 'step2__row-label step2__row-label--filled'
                      : 'step2__row-label'
                  }
                >
                  Contato do fornecedor
                </span>
                <span className="step2__row-action">
                  {infoAdicional.contato || 'Adicionar'}
                </span>
                <span className="step2__row-icon">
                  <img src={caretRightIcon} alt="" width={24} height={24} />
                </span>
              </button>

              <button
                type="button"
                className="step2__row"
                onClick={() => setOpenInfoModal('email')}
              >
                <span
                  className={
                    infoAdicional.email
                      ? 'step2__row-label step2__row-label--filled'
                      : 'step2__row-label'
                  }
                >
                  Email do fornecedor
                </span>
                <span className="step2__row-action">
                  {infoAdicional.email || 'Adicionar'}
                </span>
                <span className="step2__row-icon">
                  <img src={caretRightIcon} alt="" width={24} height={24} />
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {atribuirVariant && (
        <AtribuirModal
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

      {openInfoModal === 'link' && (
        <LinkModal
          value={infoAdicional.link}
          onClose={closeInfoModal}
          onSave={(value) => {
            onInfoAdicionalChange('link', value)
            closeInfoModal()
          }}
        />
      )}

      {openInfoModal === 'contato' && (
        <ContatoFornecedorModal
          value={infoAdicional.contato}
          onClose={closeInfoModal}
          onSave={(value) => {
            onInfoAdicionalChange('contato', value)
            closeInfoModal()
          }}
        />
      )}

      {openInfoModal === 'email' && (
        <EmailFornecedorModal
          value={infoAdicional.email}
          onClose={closeInfoModal}
          onSave={(value) => {
            onInfoAdicionalChange('email', value)
            closeInfoModal()
          }}
        />
      )}
    </WizardShell>
  )
}

export default Step4Valores
