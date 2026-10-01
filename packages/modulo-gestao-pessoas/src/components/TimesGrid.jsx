import { UsersFour } from '@phosphor-icons/react'
import arrowUpRightIcon from '../assets/icons/ArrowUpRight.svg'
import userIcon from '../assets/icons/User.svg'
import {
  getTeamColorTones,
  getTeamIconComponent,
  guessTeamIconName,
} from '../utils/teamOptions.js'
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

// Contagem de pessoas do card: icone User de 16px e o numero (10334:5476).
function ContagemPessoas({ total }) {
  return (
    <span className="time-card__count">
      <img src={userIcon} width={16} height={16} alt="" />
      {total}
    </span>
  )
}

/*
 * Cards da aba Times (Figma 10334:5436). O completo nao tem menu: o card
 * inteiro abre a pagina do time, e o Excluir fica no cabecalho dela. O
 * pendente tem o botao "Criar time" com contorno no lugar da seta e nao
 * abre pagina.
 */
function TimesGrid({ teams, onCriarTime, onCardClick }) {
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
              <div className="time-card__info">
                <span className="time-card__name">{team.name}</span>
                <ContagemPessoas total={team.memberCount} />
              </div>
            </div>
          )
        }

        const { light, dark } = getTeamColorTones(team.color)
        const FrontIcon = getTeamIconComponent(team.icon)
        const tone = { background: light, border: dark, iconColor: dark }

        return (
          <div
            className="time-card"
            key={team.id}
            onClick={() => onCardClick?.(team.id)}
          >
            <div className="time-card__top-row">
              <IconCluster FrontIcon={FrontIcon} tone={tone} />
              <img src={arrowUpRightIcon} width={24} height={24} alt="" />
            </div>
            <div className="time-card__info">
              <span className="time-card__name">{team.name}</span>
              <ContagemPessoas total={team.memberCount} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TimesGrid
