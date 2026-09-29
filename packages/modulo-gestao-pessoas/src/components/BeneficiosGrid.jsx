import arrowUpRightIcon from '../assets/icons/ArrowUpRight.svg'
import desktopIcon from '../assets/icons/Desktop.svg'
import vanIcon from '../assets/icons/Van.svg'
import aliceImage from '../assets/images/Frame 2147223814.png'
import cajuImage from '../assets/images/Frame 2147223814-1.png'
import gympassImage from '../assets/images/Frame 2147223814-2.png'
import { getBeneficioTypeIcon } from '../utils/beneficioOptions.js'
import { getBenefitMemberCount } from '../utils/beneficiarios.js'
import BeneficioCardMenu from './beneficio/BeneficioCardMenu.jsx'
import './BeneficiosGrid.css'

const IMAGE_BY_KEY = {
  alice: aliceImage,
  caju: cajuImage,
  gympass: gympassImage,
}

const ICON_BY_KEY = {
  desktop: desktopIcon,
  van: vanIcon,
}

function BeneficiosGrid({ benefits, collaborators, onCardClick, onDataChanged }) {
  return (
    <div className="beneficios-grid">
      {benefits.map((benefit) => {
        const isCreatedBenefit = Boolean(benefit.tipo)
        const memberCount = getBenefitMemberCount(benefit, collaborators)
        const CategoryIcon = isCreatedBenefit ? getBeneficioTypeIcon(benefit.tipo) : null

        return (
          <div
            className="beneficio-card"
            key={benefit.id}
            onClick={() => onCardClick?.(benefit.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="beneficio-card__top-row">
              {isCreatedBenefit ? (
                <div className="beneficio-card__icon-container beneficio-card__icon-container--badge">
                  <CategoryIcon size={24} />
                </div>
              ) : benefit.iconType === 'image' ? (
                <div className="beneficio-card__icon-container">
                  <img
                    className="beneficio-card__image"
                    src={IMAGE_BY_KEY[benefit.image]}
                    alt=""
                  />
                </div>
              ) : (
                <div className="beneficio-card__icon-container beneficio-card__icon-container--badge">
                  <img src={ICON_BY_KEY[benefit.icon]} width={24} height={24} alt="" />
                </div>
              )}
              <img
                className="beneficio-card__arrow"
                src={arrowUpRightIcon}
                width={24}
                height={24}
                alt=""
              />
            </div>
            <div className="beneficio-card__bottom-row">
              <div className="beneficio-card__info">
                <span className="beneficio-card__name">{benefit.name}</span>
                <span className="beneficio-card__count">{memberCount} pessoas</span>
              </div>
              <BeneficioCardMenu
                benefit={benefit}
                onView={onCardClick}
                onDataChanged={onDataChanged}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default BeneficiosGrid
