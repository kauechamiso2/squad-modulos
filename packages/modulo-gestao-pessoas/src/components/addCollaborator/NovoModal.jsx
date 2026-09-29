import closeIcon from '../../assets/icons/Close.svg'
import colaboradorStickerIcon from '../../assets/illustrations/Colaborador.svg'
import accentStickerIcon from '../../assets/illustrations/Adicionar.svg'
import accentSmallStickerIcon from '../../assets/illustrations/Adiciona-2.svg'
import avatarStickerIcon from '../../assets/illustrations/User.svg'
import giftStickerIcon from '../../assets/illustrations/Presente.svg'
import cardStickerIcon from '../../assets/illustrations/Cartao.svg'
import moneyStickerIcon from '../../assets/illustrations/Dinheiro.svg'
import { IconButton } from '@squad/ui'
import './NovoModal.css'

const WIGGLE_OFFSETS = [-10, 10, -9, 11]
const WIGGLE_DELAYS = [0, 0.06, 0.12, 0.18]
const BENEFICIO_STICKER_SIZE = 43

function stickerStyle(sticker, index) {
  return {
    width: sticker.size,
    height: sticker.size,
    left: sticker.left,
    top: sticker.top,
    '--sticker-rotate': `${sticker.rotate}deg`,
    '--wiggle-offset': `${WIGGLE_OFFSETS[index % WIGGLE_OFFSETS.length]}deg`,
    '--wiggle-delay': `${WIGGLE_DELAYS[index % WIGGLE_DELAYS.length]}s`,
  }
}

const OPTIONS = [
  {
    id: 'colaborador',
    label: 'Colaborador',
    functional: true,
    stickers: [
      { src: colaboradorStickerIcon, size: 70.992, left: 33, top: 35.5, rotate: -7.01 },
      { src: accentStickerIcon, size: 46.49, left: 80.37, top: 78.01, rotate: 16.61 },
    ],
  },
  {
    id: 'time',
    label: 'Time',
    functional: true,
    stickers: [],
  },
  {
    id: 'beneficio',
    label: 'Benefício',
    functional: true,
    stickers: [
      { src: giftStickerIcon, size: BENEFICIO_STICKER_SIZE, left: 64.67, top: 37.5, rotate: -17.07 },
      { src: cardStickerIcon, size: BENEFICIO_STICKER_SIZE, left: 80.89, top: 85.32, rotate: -1.11 },
      { src: moneyStickerIcon, size: BENEFICIO_STICKER_SIZE, left: 40, top: 63.01, rotate: 8.53 },
    ],
  },
]

const TIME_AVATAR_SIZE = 34.722
const TIME_AVATAR_OVERLAP = 3.5
const TIME_AVATAR_STEP = TIME_AVATAR_SIZE - TIME_AVATAR_OVERLAP
const TIME_GROUP = { left: 22, top: 37.5, width: 116.342, height: 86.15, rotate: 7.23 }

// The 4 circles form a tight, overlapping 2x2 cluster centered within the
// group's own bounding box, rather than spanning its corners.
const TIME_CLUSTER_SIZE = TIME_AVATAR_SIZE + TIME_AVATAR_STEP
const TIME_CLUSTER_OFFSET_X = (TIME_GROUP.width - TIME_CLUSTER_SIZE) / 2
const TIME_CLUSTER_OFFSET_Y = (TIME_GROUP.height - TIME_CLUSTER_SIZE) / 2
const TIME_AVATAR_POSITIONS = [
  { left: TIME_CLUSTER_OFFSET_X, top: TIME_CLUSTER_OFFSET_Y },
  { left: TIME_CLUSTER_OFFSET_X + TIME_AVATAR_STEP, top: TIME_CLUSTER_OFFSET_Y },
  { left: TIME_CLUSTER_OFFSET_X, top: TIME_CLUSTER_OFFSET_Y + TIME_AVATAR_STEP },
  { left: TIME_CLUSTER_OFFSET_X + TIME_AVATAR_STEP, top: TIME_CLUSTER_OFFSET_Y + TIME_AVATAR_STEP },
]
const TIME_ACCENT = { size: 30.181, left: 65.71, top: 64.48, rotate: 7.23 }

function TimeIllustration() {
  return (
    <>
      <div
        className="novo-modal__sticker-group"
        style={{
          left: TIME_GROUP.left,
          top: TIME_GROUP.top,
          width: TIME_GROUP.width,
          height: TIME_GROUP.height,
          '--sticker-rotate': `${TIME_GROUP.rotate}deg`,
          '--wiggle-offset': `${WIGGLE_OFFSETS[0]}deg`,
          '--wiggle-delay': `${WIGGLE_DELAYS[0]}s`,
        }}
      >
        {TIME_AVATAR_POSITIONS.map((position, index) => (
          <img
            className="novo-modal__nested-sticker"
            key={index}
            src={avatarStickerIcon}
            alt=""
            style={{
              width: TIME_AVATAR_SIZE,
              height: TIME_AVATAR_SIZE,
              left: position.left,
              top: position.top,
            }}
          />
        ))}
      </div>
      <img
        className="novo-modal__sticker"
        src={accentSmallStickerIcon}
        alt=""
        style={{
          width: TIME_ACCENT.size,
          height: TIME_ACCENT.size,
          left: TIME_ACCENT.left,
          top: TIME_ACCENT.top,
          '--sticker-rotate': `${TIME_ACCENT.rotate}deg`,
          '--wiggle-offset': `${WIGGLE_OFFSETS[1]}deg`,
          '--wiggle-delay': `${WIGGLE_DELAYS[1]}s`,
        }}
      />
    </>
  )
}

function OptionCard({ option, onClick }) {
  return (
    <button type="button" className="novo-modal__card" onClick={onClick}>
      <div className="novo-modal__illustration">
        {option.id === 'time' ? (
          <TimeIllustration />
        ) : (
          option.stickers.map((sticker, index) => (
            <img
              className="novo-modal__sticker"
              key={index}
              src={sticker.src}
              alt=""
              style={stickerStyle(sticker, index)}
            />
          ))
        )}
      </div>
      <span className="novo-modal__card-label">{option.label}</span>
    </button>
  )
}

function NovoModal({ onClose, onSelectColaborador, onSelectTime, onSelectBeneficio }) {
  const handlersById = {
    colaborador: onSelectColaborador,
    time: onSelectTime,
    beneficio: onSelectBeneficio,
  }

  return (
    <div className="novo-modal-overlay" onClick={onClose}>
      <div className="novo-modal-stack">
        <IconButton
          icon={closeIcon}
          alt="Fechar"
          onClick={onClose}
          className="novo-modal__close-button"
        />
        <div className="novo-modal" onClick={(event) => event.stopPropagation()}>
          <h2 className="novo-modal__title">
            O que vamos{' '}
            <span className="novo-modal__title-gradient">criar hoje?</span>
          </h2>
          <div className="novo-modal__grid">
            {OPTIONS.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                onClick={option.functional ? handlersById[option.id] : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NovoModal
