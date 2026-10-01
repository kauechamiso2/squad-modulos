import { useState } from 'react'
import islandIcon from '../../assets/icons/Island.svg'
import babyIcon from '../../assets/icons/Baby.svg'
import stethoscopeIcon from '../../assets/icons/Stethoscope.svg'
import polygonIcon from '../../assets/icons/Polygon 1.svg'
import { textoAusencia } from '../../utils/colaboradorStatus.js'
import './AusenciaBadge.css'

// Cada icone no tamanho em que o Figma o desenha dentro do badge de 32px
// (10331:3227, 10331:3243, 10331:3259).
const ICONES = {
  ferias: { src: islandIcon, tamanho: 16 },
  licenca_maternidade: { src: babyIcon, tamanho: 20 },
  licenca_paternidade: { src: babyIcon, tamanho: 20 },
  licenca_medica: { src: stethoscopeIcon, tamanho: 18 },
}

/*
 * Badge azul de ausencia, com o tooltip preto acima no hover (10331:4148,
 * tooltip 10331:4344). So aparece para ausencia ativa - quem decide isso e
 * quem chama, com getAusenciaAtiva().
 */
function AusenciaBadge({ ausencia }) {
  const [aberto, setAberto] = useState(false)
  const icone = ICONES[ausencia.tipo]
  if (!icone) throw new Error(`Sem ícone para o tipo de ausência "${ausencia.tipo}"`)
  const texto = textoAusencia(ausencia)

  return (
    <span
      className="ausencia-badge"
      tabIndex={0}
      aria-label={texto}
      onMouseEnter={() => setAberto(true)}
      onMouseLeave={() => setAberto(false)}
      onFocus={() => setAberto(true)}
      onBlur={() => setAberto(false)}
      onClick={(event) => event.stopPropagation()}
    >
      <img src={icone.src} width={icone.tamanho} height={icone.tamanho} alt="" />
      {aberto && (
        <span className="ausencia-badge__tooltip" role="tooltip">
          <span className="ausencia-badge__tooltip-caixa">{texto}</span>
          <span className="ausencia-badge__tooltip-seta">
            <span className="ausencia-badge__tooltip-seta-giro">
              <img src={polygonIcon} alt="" />
            </span>
          </span>
        </span>
      )}
    </span>
  )
}

export default AusenciaBadge
