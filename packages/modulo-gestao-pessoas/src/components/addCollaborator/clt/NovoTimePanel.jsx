import { useEffect, useState } from 'react'
import closeIcon from '../../../assets/icons/Close.svg'
import ColorPickerModal from '../../addTeam/ColorPickerModal.jsx'
import IconPickerModal from '../../addTeam/IconPickerModal.jsx'
import { COLLECTIONS, getCollection, addItem } from '../../../utils/storage.js'
import {
  getTeamColorTones,
  getTeamIconComponent,
  guessTeamIconName,
  pickDefaultColorId,
} from '../../../utils/teamOptions.js'
import '@squad/ui/styles/buttons.css'
import '../../addTeam/Step1TeamInfo.css'
import './SidePanel.css'
import { IconButton } from '@squad/ui'

function NovoTimePanel({ name, onClose, onCreated }) {
  const [times] = useState(() => getCollection(COLLECTIONS.TIMES))
  const usedColors = times.filter((team) => team.color).map((team) => team.color)
  const [colorId, setColorId] = useState(() => pickDefaultColorId(usedColors))
  const [iconName, setIconName] = useState(() => guessTeamIconName(name))
  const [descricao, setDescricao] = useState('')
  const [colorModalOpen, setColorModalOpen] = useState(false)
  const [iconModalOpen, setIconModalOpen] = useState(false)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const { light, dark } = getTeamColorTones(colorId)
  const IconComponent = getTeamIconComponent(iconName)

  const handleSave = () => {
    const newTeam = addItem(COLLECTIONS.TIMES, {
      name,
      color: colorId,
      icon: iconName,
      descricao,
      pending: true,
    })
    onCreated(newTeam.name)
  }

  return (
    <>
      <div className="clt-side-panel-overlay" onClick={onClose} />
      <div className={entered ? 'clt-side-panel clt-side-panel--entered' : 'clt-side-panel'}>
        <div className="clt-side-panel__header">
          <span className="clt-side-panel__title">Novo time</span>
          <IconButton icon={closeIcon} alt="Fechar" onClick={onClose} />
        </div>

        <div className="clt-side-panel__body">
          <div className="clt-side-panel__profile">
            <span className="clt-side-panel__profile-badge" style={{ background: light }}>
              <IconComponent size={24} color={dark} />
            </span>
            <span className="clt-side-panel__profile-name">{name}</span>
          </div>

          <div className="team-field-row">
            <span className="team-field-row__label">Cor</span>
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
            <span className="team-field-row__label">Ícone</span>
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

          <div className="clt-side-panel__descricao-box">
            <span className="clt-side-panel__descricao-label">Descrição</span>
            <textarea
              className="clt-side-panel__descricao-input"
              placeholder="Descreva o time..."
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
            />
          </div>
        </div>

        <div className="clt-side-panel__footer">
          <button type="button" className="text-button" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="pill-button" onClick={handleSave}>
            Salvar
          </button>
        </div>
      </div>

      {colorModalOpen && (
        <ColorPickerModal
          usedColorIds={usedColors}
          onSelect={(newColorId) => {
            setColorId(newColorId)
            setColorModalOpen(false)
          }}
          onClose={() => setColorModalOpen(false)}
        />
      )}

      {iconModalOpen && (
        <IconPickerModal
          value={iconName}
          onSelect={(newIconName) => {
            setIconName(newIconName)
            setIconModalOpen(false)
          }}
          onClose={() => setIconModalOpen(false)}
        />
      )}
    </>
  )
}

export default NovoTimePanel
