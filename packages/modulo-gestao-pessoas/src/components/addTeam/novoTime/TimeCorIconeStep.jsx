import { useState } from 'react'
import { Eyedropper, Smiley, CaretDown } from '@phosphor-icons/react'
import CltShell from '../../addCollaborator/clt/CltShell.jsx'
import ColorPickerModal from '../ColorPickerModal.jsx'
import IconPickerModal from '../IconPickerModal.jsx'
import { getTeamColorTones, getTeamIconComponent } from '../../../utils/teamOptions.js'
import '@squad/ui/styles/buttons.css'
import '../../addCollaborator/clt/CltShell.css'
import './NovoTimeSteps.css'

function TimeCorIconeStep({
  name,
  colorId,
  onColorChange,
  iconName,
  onIconChange,
  usedColors,
  onBack,
  onClose,
  onContinue,
}) {
  const [colorModalOpen, setColorModalOpen] = useState(false)
  const [iconModalOpen, setIconModalOpen] = useState(false)

  const { light, dark } = getTeamColorTones(colorId)
  const IconComponent = getTeamIconComponent(iconName)

  return (
    <>
      <CltShell
        title="Novo Time"
        onClose={onClose}
        progress={50}
        footerLeft={
          <button type="button" className="text-button" onClick={onBack}>
            Voltar
          </button>
        }
        footerRight={
          <button type="button" className="pill-button" onClick={onContinue}>
            Continuar
          </button>
        }
      >
        <div className="clt-shell__content">
          <h1 className="clt-shell__title">
            Muito bem,
            <br />
            hora de definir a cor ícone{' '}
            <br />
            de <span style={{ color: '#e9a716' }}>{name}</span>.
          </h1>

          <div>
            <div className="time-step__row time-step__row--bordered">
              <div className="time-step__row-label-group">
                <Eyedropper size={20} className="time-step__row-icon" />
                <span className="time-step__row-label">Cor</span>
              </div>
              <div className="time-step__color-dots">
                <button
                  type="button"
                  className="time-step__color-dot"
                  style={{ background: light }}
                  onClick={() => setColorModalOpen(true)}
                  aria-label="Escolher cor do time"
                />
                <button
                  type="button"
                  className="time-step__color-dot"
                  style={{ background: dark }}
                  onClick={() => setColorModalOpen(true)}
                  aria-label="Escolher cor do time"
                />
              </div>
            </div>

            <div className="time-step__row">
              <div className="time-step__row-label-group">
                <Smiley size={20} className="time-step__row-icon" />
                <span className="time-step__row-label">Ícone</span>
              </div>
              <button
                type="button"
                className="time-step__icon-pill"
                onClick={() => setIconModalOpen(true)}
                aria-label="Escolher icone do time"
              >
                <IconComponent size={24} />
                <CaretDown size={16} />
              </button>
            </div>
          </div>
        </div>
      </CltShell>

      {colorModalOpen && (
        <ColorPickerModal
          usedColorIds={usedColors}
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

export default TimeCorIconeStep
