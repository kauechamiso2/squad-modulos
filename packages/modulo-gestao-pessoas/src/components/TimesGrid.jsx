import { UsersFour } from '@phosphor-icons/react'
import arrowUpRightIcon from '../assets/icons/ArrowUpRight.svg'
import dotsThreeIcon from '../assets/icons/DotsThree.svg'
import {
  getTeamColorTones,
  getTeamIconComponent,
  guessTeamIconName,
} from '../utils/teamOptions.js'
import { IconButton } from '@squad/ui'
import './TimesGrid.css'

const PENDING_TONE = {
  background: '#ffffff',
  border: '#eaeaea',
  iconColor: '#B2B9B9',
}

function IconCluster({ FrontIcon, tone }) {
  return (
    <div className="time-card__icon-cluster">
      <div
        className="time-card__sticker time-card__sticker--back"
        style={{ background: tone.background, borderColor: tone.border }}
      >
        <UsersFour size={24} color={tone.iconColor} />
      </div>
      <div
        className="time-card__sticker time-card__sticker--front"
        style={{ background: tone.background, borderColor: tone.border }}
      >
        <FrontIcon size={24} color={tone.iconColor} />
      </div>
    </div>
  )
}

function TimesGrid({ teams, onCriarTime }) {
  // Pending drafts always lead the default grid, regardless of creation
  // order - once a draft is completed via Criar Time, pending flips false
  // and it falls back into the regular group in normal order.
  const sortedTeams = [...teams].sort((a, b) => {
    if (Boolean(a.pending) === Boolean(b.pending)) return 0
    return a.pending ? -1 : 1
  })

  return (
    <div className="times-grid">
      {sortedTeams.map((team) => {
        if (team.pending) {
          const FrontIcon = getTeamIconComponent(guessTeamIconName(team.name))
          return (
            <div className="time-card time-card--pending" key={team.id}>
              <div className="time-card__top-row">
                <IconCluster FrontIcon={FrontIcon} tone={PENDING_TONE} />
                <button
                  type="button"
                  className="time-card__criar-time-button"
                  onClick={() => onCriarTime(team.id)}
                >
                  Criar time
                </button>
              </div>
              <div className="time-card__bottom-row">
                <div className="time-card__info">
                  <span className="time-card__name">{team.name}</span>
                  <span className="time-card__count">{team.memberCount} pessoas</span>
                </div>
                <IconButton
                  icon={dotsThreeIcon}
                  alt="Mais opções"
                  iconSize={24}
                  className="time-card__menu-button"
                />
              </div>
            </div>
          )
        }

        const { light, dark } = getTeamColorTones(team.color)
        const FrontIcon = getTeamIconComponent(team.icon)
        const tone = { background: light, border: dark, iconColor: dark }

        return (
          <div className="time-card" key={team.id}>
            <div className="time-card__top-row">
              <IconCluster FrontIcon={FrontIcon} tone={tone} />
              <img src={arrowUpRightIcon} width={24} height={24} alt="" />
            </div>
            <div className="time-card__bottom-row">
              <div className="time-card__info">
                <span className="time-card__name">{team.name}</span>
                <span className="time-card__count">{team.memberCount} pessoas</span>
              </div>
              <IconButton
                icon={dotsThreeIcon}
                alt="Mais opções"
                iconSize={24}
                className="time-card__menu-button"
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TimesGrid
