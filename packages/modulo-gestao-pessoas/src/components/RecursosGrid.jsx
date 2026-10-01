import { Barbell, Coin, ForkKnife, Gift, Key, Shield, Stethoscope, Tooth } from '@phosphor-icons/react'
import arrowUpRightIcon from '../assets/icons/ArrowUpRight.svg'
import userIcon from '../assets/icons/User.svg'
import desktopIcon from '../assets/icons/Desktop.svg'
import vanIcon from '../assets/icons/Van.svg'
import aliceLogo from '../assets/images/alice.png'
import cajuLogo from '../assets/images/caju.png'
import slackLogo from '../assets/images/slack.png'
import { OUTRO, tituloDoRecurso, valorDoRecurso } from '../utils/recursos.js'
import './RecursosGrid.css'

// Logos que o Figma tem, pelo nome do fornecedor ou servico. `inteiro`: o
// logo ocupa o badge todo (Alice, Caju); senao fica com 38px no centro do
// badge cinza (Slack) - Figma 10334:5577, 10334:5605 e 10334:5618.
const LOGOS = {
  Alice: { src: aliceLogo, inteiro: true },
  Caju: { src: cajuLogo, inteiro: true },
  Slack: { src: slackLogo, inteiro: false },
}

// Sem logo: badge azul claro com o icone. Van e Desktop sao os SVGs do Figma
// (10334:5632 e 10334:5591); os outros icones de categoria nao aparecem em
// azul no Figma e vem do Phosphor, na mesma cor.
const ICONES_CATEGORIA = {
  'Plano de saúde': Stethoscope,
  'Vale alimentação': ForkKnife,
  'Bem-estar': Barbell,
  'Plano odontológico': Tooth,
  'Seguro de vida': Shield,
  [OUTRO]: Gift,
}

const ICONES_VERBA = { Coin }

function IconeSvg({ src }) {
  return <img src={src} width={24} height={24} alt="" />
}

function iconeDoRecurso(recurso) {
  if (recurso.tipoRecurso === 'licenca') return <Key size={24} color="var(--gp-ausencia-icone)" />
  if (recurso.tipoRecurso === 'verba') {
    if (recurso.icone === 'Desktop') return <IconeSvg src={desktopIcon} />
    const Icone = ICONES_VERBA[recurso.icone]
    if (!Icone) throw new Error(`Ícone de verba desconhecido "${recurso.icone}"`)
    return <Icone size={24} color="var(--gp-ausencia-icone)" />
  }
  if (recurso.categoria === 'Vale transporte') return <IconeSvg src={vanIcon} />
  const Icone = ICONES_CATEGORIA[recurso.categoria]
  if (!Icone) throw new Error(`Categoria desconhecida "${recurso.categoria}"`)
  return <Icone size={24} color="var(--gp-ausencia-icone)" />
}

function MarcaDoRecurso({ recurso }) {
  const nomeDaMarca = recurso.tipoRecurso === 'licenca' ? recurso.servico : recurso.fornecedor
  const logo = LOGOS[nomeDaMarca]
  if (logo) {
    return (
      <span className="recurso-card__marca recurso-card__marca--logo">
        <img
          className={logo.inteiro ? 'recurso-card__logo' : 'recurso-card__logo recurso-card__logo--centro'}
          src={logo.src}
          alt=""
        />
      </span>
    )
  }
  return <span className="recurso-card__marca recurso-card__marca--icone">{iconeDoRecurso(recurso)}</span>
}

/*
 * Cards da aba Recursos (Figma 10334:5539). Sem menu: o card inteiro abre a
 * pagina do recurso, e o Excluir fica no cabecalho dela.
 */
function RecursosGrid({ recursos, onCardClick }) {
  return (
    <div className="recursos-grid">
      {recursos.map(({ recurso, pessoas }) => (
        <div className="recurso-card" key={recurso.id} onClick={() => onCardClick?.(recurso.id)}>
          <div className="recurso-card__topo">
            <MarcaDoRecurso recurso={recurso} />
            <img src={arrowUpRightIcon} width={24} height={24} alt="" />
          </div>
          <div className="recurso-card__info">
            <span className="recurso-card__titulo">{tituloDoRecurso(recurso)}</span>
            <div className="recurso-card__base">
              <span className="recurso-card__valor">{valorDoRecurso(recurso)}</span>
              <span className="recurso-card__contagem">
                <img src={userIcon} width={16} height={16} alt="" />
                {pessoas}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default RecursosGrid
