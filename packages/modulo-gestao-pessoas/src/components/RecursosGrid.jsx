import { Barbell, Coin, ForkKnife, Gift, Key, Shield, Stethoscope, Tooth } from '@phosphor-icons/react'
import arrowUpRightIcon from '../assets/icons/ArrowUpRight.svg'
import userIcon from '../assets/icons/User.svg'
import desktopIcon from '../assets/icons/Desktop.svg'
import vanIcon from '../assets/icons/Van.svg'
import { OUTRO, tituloDoRecurso, valorDoRecurso } from '../utils/recursos.js'
import { LOGOS } from '../utils/logos.js'
import './RecursosGrid.css'

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

function IconeSvg({ src, tamanho }) {
  return <img src={src} width={tamanho} height={tamanho} alt="" />
}

function iconeDoRecurso(recurso, tamanho) {
  if (recurso.tipoRecurso === 'licenca') return <Key size={tamanho} color="var(--gp-ausencia-icone)" />
  if (recurso.tipoRecurso === 'verba') {
    if (recurso.icone === 'Desktop') return <IconeSvg src={desktopIcon} tamanho={tamanho} />
    const Icone = ICONES_VERBA[recurso.icone]
    if (!Icone) throw new Error(`Ícone de verba desconhecido "${recurso.icone}"`)
    return <Icone size={tamanho} color="var(--gp-ausencia-icone)" />
  }
  if (recurso.categoria === 'Vale transporte') return <IconeSvg src={vanIcon} tamanho={tamanho} />
  const Icone = ICONES_CATEGORIA[recurso.categoria]
  if (!Icone) throw new Error(`Categoria desconhecida "${recurso.categoria}"`)
  return <Icone size={tamanho} color="var(--gp-ausencia-icone)" />
}

// Logo ou icone do recurso: 56px nos cards (icone de 24) e 32px na pagina do
// colaborador (icone de 20, Figma 10355:3706). A folga do logo escala junto.
export function MarcaDoRecurso({ recurso, tamanho = 56 }) {
  const nomeDaMarca = recurso.tipoRecurso === 'licenca' ? recurso.servico : recurso.fornecedor
  const logo = LOGOS[nomeDaMarca]
  const classeTamanho = tamanho === 56 ? '' : ' recurso-card__marca--pequena'
  if (logo) {
    const folga = (logo.inset * tamanho) / 56
    return (
      <span className={`recurso-card__marca recurso-card__marca--logo${classeTamanho}`}>
        <img
          className="recurso-card__logo"
          style={{ top: folga, left: folga, width: tamanho - 2 * folga, height: tamanho - 2 * folga }}
          src={logo.src}
          alt=""
        />
      </span>
    )
  }
  return (
    <span className={`recurso-card__marca recurso-card__marca--icone${classeTamanho}`}>
      {iconeDoRecurso(recurso, tamanho === 56 ? 24 : 20)}
    </span>
  )
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
