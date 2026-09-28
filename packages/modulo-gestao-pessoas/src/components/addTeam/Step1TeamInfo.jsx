import { useState } from 'react'
import { WizardShell } from '@squad/ui'
import ColorPickerModal from './ColorPickerModal.jsx'
import IconPickerModal from './IconPickerModal.jsx'
import { getTeamColorTones, getTeamIconComponent } from '../../utils/teamOptions.js'
import '@squad/ui/styles/buttons.css'
import '@squad/ui/styles/Step1BasicInfo.css'
import './Step1TeamInfo.css'

function Step1TeamInfo({
  name,
  onNameChange,
  colorId,
  onColorChange,
  iconName,
  onIconChange,
  onExit,
  onContinue,
}) {
  const [colorModalOpen, setColorModalOpen] = useState(false)
  const [iconModalOpen, setIconModalOpen] = useState(false)

  const canContinue = name.trim().length > 0
  const { light, dark } = getTeamColorTones(colorId)
  const IconComponent = getTeamIconComponent(iconName)

  return (
    <>
      <WizardShell
        title="Novo Time"
        onClose={onExit}
        progress={50}
        footerLeft={
          <button type="button" className="text-button" onClick={onExit}>
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
        <div className="step1">
          <input
            type="text"
            className="step1__name-input"
            placeholder="Nome do time"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
          />

          <div className="team-field-row">
            <span className="team-field-row__label">Cor do time</span>
            <div className="team-field-row__control">
              <span className="team-color-dot" style={{ background: light }} />
              <span className="team-color-dot" style={{ background: dark }} />
              <button
                type="button"
                className="team-color-swatch-button"
                style={{ background: dark }}
                onClick={() => setColorModalOpen(true)}
                aria-label="Escolher cor do time"
              />
            </div>
          </div>

          <div className="team-field-row">
            <span className="team-field-row__label">Icone do time</span>
            <button
              type="button"
              className="team-icon-swatch-button"
              style={{ background: light }}
              onClick={() => setIconModalOpen(true)}
              aria-label="Escolher icone do time"
            >
              <IconComponent size={20} color={dark} />
            </button>
          </div>
        </div>
      </WizardShell>

      {colorModalOpen && (
        <ColorPickerModal
          onSelect={(newColorId) => {
            onColorChange(newColorId)
            setColorModalOpen(false)
          }}
          onClose={() => setColorModalOpen(false)}
        />
      )}

      {iconModalOpen && (
        <IconPickerModal
          value={iconName}
          onSelect={(newIconName) => {
            onIconChange(newIconName)
            setIconModalOpen(false)
          }}
          onClose={() => setIconModalOpen(false)}
        />
      )}
    </>
  )
}

export default Step1TeamInfo
