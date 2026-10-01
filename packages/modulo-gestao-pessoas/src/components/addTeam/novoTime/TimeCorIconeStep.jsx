import { useState } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import eyedropperIcon from '../../../assets/icons/Eyedropper.svg'
import smileyIcon from '../../../assets/icons/Smiley.svg'
import CltShell from '../../addCollaborator/clt/CltShell.jsx'
import ColorPickerModal from '../ColorPickerModal.jsx'
import IconPickerModal from '../IconPickerModal.jsx'
import { getTeamColorTones, getTeamIconComponent } from '../../../utils/teamOptions.js'
import '../../campos/Botoes.css'
import '../../addCollaborator/clt/CltShell.css'
import './NovoTimeSteps.css'

/*
 * Passo 2 - Figma 10342:12846 (linhas 10342:12852). Cor e icone ja vem
 * preenchidos, entao Continuar fica sempre ativo. Os seletores de cor e
 * icone continuam os de antes.
 */
function TimeCorIconeStep({
  name,
  colorId,
  onColorChange,
  iconName,
  onIconChange,
  usedColors,
  progress,
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
        title="Novo time"
        onClose={onClose}
        progress={progress}
        footerLeft={
          <button type="button" className="gp-botao-texto" onClick={onBack}>
            Voltar
          </button>
        }
        footerRight={
          <button type="button" className="gp-botao" onClick={onContinue}>
            Continuar
          </button>
        }
      >
        <div className="clt-shell__content">
          <h1 className="clt-shell__title">
            Muito bem,
            <br />
            hora de definir a cor e o ícone
            <br />
            de <span className="clt-shell__destaque">{name}.</span>
          </h1>

          <div>
            <div className="time-step__row time-step__row--bordered">
              <img src={eyedropperIcon} width={20} height={20} alt="" />
              <span className="time-step__row-label">Cor</span>
              <button
                type="button"
                className="time-step__color-dots"
                onClick={() => setColorModalOpen(true)}
                aria-label="Escolher cor do time"
              >
                <span className="time-step__color-dot" style={{ background: light }} />
                <span className="time-step__color-dot" style={{ background: dark }} />
              </button>
            </div>

            <div className="time-step__row">
              <img src={smileyIcon} width={20} height={20} alt="" />
              <span className="time-step__row-label">Ícone</span>
              <button
                type="button"
                className="time-step__icon-pill"
                onClick={() => setIconModalOpen(true)}
                aria-label="Escolher ícone do time"
              >
                <IconComponent size={24} color={dark} />
                <CaretDown size={16} color="var(--color-text)" />
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
