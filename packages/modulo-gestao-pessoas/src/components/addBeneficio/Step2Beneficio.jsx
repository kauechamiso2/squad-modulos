import { useEffect, useRef, useState } from 'react'
import plusIcon from '../../assets/icons/Plus.svg'
import magnifyingGlassIcon from '../../assets/icons/MagnifyingGlass.svg'
import { WizardShell } from '@squad/ui'
import { BENEFICIO_PROVIDER_SUGGESTIONS, getBeneficioTypeIcon } from '../../utils/beneficioOptions.js'
import '@squad/ui/styles/buttons.css'
import '@squad/ui/styles/Step1BasicInfo.css'
import '@squad/ui/styles/SelectListModal.css'
import './Step2Beneficio.css'

function Step2Beneficio({ tipo, providerName, onProviderNameChange, onBack, onExit, onContinue }) {
  const [inputValue, setInputValue] = useState(providerName ?? '')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dropdownRect, setDropdownRect] = useState(null)
  const fieldRef = useRef(null)

  const IconComponent = getBeneficioTypeIcon(tipo)
  const suggestions = BENEFICIO_PROVIDER_SUGGESTIONS[tipo] ?? []
  const trimmed = inputValue.trim()
  const filtered = trimmed
    ? suggestions.filter((suggestion) => suggestion.toLowerCase().includes(trimmed.toLowerCase()))
    : suggestions
  const exactMatch = suggestions.some(
    (suggestion) => suggestion.toLowerCase() === trimmed.toLowerCase(),
  )
  const showCreate = trimmed.length > 0 && !exactMatch

  useEffect(() => {
    if (!dropdownOpen) return
    function handleClickOutside(event) {
      if (fieldRef.current && !fieldRef.current.contains(event.target)) {
        setDropdownOpen(false)
        setInputValue(providerName ?? '')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen, providerName])

  // The dropdown is positioned relative to the viewport (not to the field)
  // so it always renders above the wizard's fixed footer and is never
  // clipped by the scrollable wizard body - recomputed whenever it opens,
  // and kept in sync if the page scrolls or resizes while it's open.
  useEffect(() => {
    if (!dropdownOpen) return
    const updateRect = () => {
      if (!fieldRef.current) return
      const rect = fieldRef.current.getBoundingClientRect()
      setDropdownRect({ top: rect.bottom + 8, left: rect.left, width: rect.width })
    }
    updateRect()
    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect, true)
    return () => {
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect, true)
    }
  }, [dropdownOpen])

  const selectProvider = (name) => {
    onProviderNameChange(name)
    setInputValue(name)
    setDropdownOpen(false)
  }

  return (
    <WizardShell
      title="Novo Benefício"
      onClose={onExit}
      progress={50}
      footerLeft={
        <button type="button" className="text-button" onClick={onBack}>
          Voltar
        </button>
      }
      footerRight={
        <button
          type="button"
          className="pill-button"
          disabled={!providerName}
          onClick={onContinue}
        >
          Continuar
        </button>
      }
    >
      <div className="step1">
        <p className="step2-beneficio__label">Qual o fornecedor?</p>

        <div className="step2-beneficio__field" ref={fieldRef}>
          <div className="step2-beneficio__search">
            <input
              type="text"
              className="step2-beneficio__search-input"
              placeholder="Buscar fornecedor..."
              value={inputValue}
              onFocus={() => setDropdownOpen(true)}
              onChange={(event) => {
                setInputValue(event.target.value)
                setDropdownOpen(true)
              }}
            />
            <img src={magnifyingGlassIcon} alt="" width={24} height={24} />
          </div>

          {dropdownOpen && dropdownRect && (
            <div
              className="step2-beneficio__dropdown"
              style={{
                top: dropdownRect.top,
                left: dropdownRect.left,
                width: dropdownRect.width,
              }}
            >
              {filtered.map((suggestion) => (
                <button
                  type="button"
                  key={suggestion}
                  className="select-list__item"
                  onClick={() => selectProvider(suggestion)}
                >
                  <span className="step2-beneficio__provider-item">
                    <span className="step2-beneficio__provider-icon">
                      <IconComponent size={20} />
                    </span>
                    <span className="select-list__item-label">{suggestion}</span>
                  </span>
                </button>
              ))}

              {showCreate && (
                <button
                  type="button"
                  className="select-list__create"
                  onClick={() => selectProvider(trimmed)}
                >
                  <span className="select-list__create-label">
                    Adicionar: &quot;{trimmed}&quot;
                  </span>
                  <img src={plusIcon} alt="" width={24} height={24} />
                </button>
              )}

              {filtered.length === 0 && !showCreate && (
                <p className="select-list__empty">Nenhum resultado</p>
              )}
            </div>
          )}
        </div>
      </div>
    </WizardShell>
  )
}

export default Step2Beneficio
