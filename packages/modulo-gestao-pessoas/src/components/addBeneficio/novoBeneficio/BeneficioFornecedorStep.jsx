import { useState } from 'react'
import CltShell from '../../addCollaborator/clt/CltShell.jsx'
import magnifyingGlassIcon from '../../../assets/icons/MagnifyingGlass.svg'
import {
  BENEFICIO_PROVIDER_SUGGESTIONS,
  getBeneficioTypeIcon,
  getBeneficioSearchNoun,
} from '../../../utils/beneficioOptions.js'
import '@squad/ui/styles/buttons.css'
import '../../addCollaborator/clt/CltShell.css'
import '../../addTeam/novoTime/NovoTimeSteps.css'
import './NovoBeneficioSteps.css'
import { Checkbox } from '@squad/ui'
import checkSquareIcon from '../../../assets/icons/CheckSquare.svg'

const MAX_VISIBLE = 4

function BeneficioFornecedorStep({
  tipo,
  providerName,
  onProviderNameChange,
  onBack,
  onClose,
  onContinue,
}) {
  const [query, setQuery] = useState(providerName ?? '')

  const IconComponent = getBeneficioTypeIcon(tipo)
  const allSuggestions = BENEFICIO_PROVIDER_SUGGESTIONS[tipo] ?? []
  const trimmed = query.trim()
  const filtered = trimmed
    ? allSuggestions.filter((name) => name.toLowerCase().includes(trimmed.toLowerCase()))
    : allSuggestions
  const visible = filtered.slice(0, MAX_VISIBLE)

  const isExactSelection =
    Boolean(providerName) && trimmed.length > 0 && trimmed.toLowerCase() === providerName.toLowerCase()
  const showAddCustom = trimmed.length > 0 && filtered.length === 0 && !isExactSelection
  const showCustomConfirmed = isExactSelection && filtered.length === 0

  const selectProvider = (name) => {
    onProviderNameChange(name)
    setQuery(name)
  }

  return (
    <CltShell
      title="Novo Benefício"
      onClose={onClose}
      progress={40}
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
      <div className="clt-shell__content">
        <h1 className="clt-shell__title">
          Qual o fornecedor
          <br />
          do <span style={{ color: '#e9a716' }}>{tipo}</span>?
        </h1>

        <div>
          <div className="time-step__search">
            <input
              type="text"
              className="time-step__search-input"
              placeholder={`Buscar ${getBeneficioSearchNoun(tipo)}...`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <img src={magnifyingGlassIcon} alt="" width={24} height={24} />
          </div>

          <div className="beneficio-step__provider-grid" style={{ marginTop: 12 }}>
            {showCustomConfirmed ? (
              <button
                type="button"
                className="beneficio-step__provider-card beneficio-step__provider-card--selected"
              >
                <Checkbox checked />
                <span className="beneficio-step__provider-badge">
                  <IconComponent size={16} />
                </span>
                <span className="beneficio-step__provider-name">{providerName}</span>
              </button>
            ) : (
              visible.map((name) => {
                const checked = providerName?.toLowerCase() === name.toLowerCase()
                return (
                  <button
                    type="button"
                    key={name}
                    className={
                      checked
                        ? 'beneficio-step__provider-card beneficio-step__provider-card--selected'
                        : 'beneficio-step__provider-card'
                    }
                    onClick={() => selectProvider(name)}
                  >
                    <Checkbox checked={checked} iconeMarcado={checkSquareIcon} />
                    <span className="beneficio-step__provider-badge">
                      <IconComponent size={16} />
                    </span>
                    <span className="beneficio-step__provider-name">{name}</span>
                  </button>
                )
              })
            )}

            {showAddCustom && (
              <button
                type="button"
                className="beneficio-step__provider-card"
                onClick={() => selectProvider(trimmed)}
              >
                <Checkbox checked={false} iconeMarcado={checkSquareIcon} />
                <span className="beneficio-step__provider-badge">
                  <IconComponent size={16} />
                </span>
                <span className="beneficio-step__provider-name">Adicionar &quot;{trimmed}&quot;</span>
              </button>
            )}

            {visible.length === 0 && !showAddCustom && !showCustomConfirmed && (
              <p className="time-step__search-dropdown-empty">Nenhum resultado.</p>
            )}
          </div>
        </div>
      </div>
    </CltShell>
  )
}

export default BeneficioFornecedorStep
