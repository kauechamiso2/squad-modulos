import { useState } from 'react'
import powerRedIcon from '../../assets/icons/PowerRed.svg'
import TooltipPreto from './TooltipPreto.jsx'
import './AusenciaBadge.css'

/*
 * Badge de desligamento - Figma 10355:3884: 32px, redondo, #ffe9ea, Power
 * vermelho de 20px. Tooltip sem Figma (premissa do contexto: "Em
 * desligamento"), igual ao da ausencia.
 */
function DesligamentoBadge() {
  const [aberto, setAberto] = useState(false)
  return (
    <span
      className="ausencia-badge ausencia-badge--desligamento"
      tabIndex={0}
      aria-label="Em desligamento"
      onMouseEnter={() => setAberto(true)}
      onMouseLeave={() => setAberto(false)}
      onFocus={() => setAberto(true)}
      onBlur={() => setAberto(false)}
      onClick={(event) => event.stopPropagation()}
    >
      <img src={powerRedIcon} width={20} height={20} alt="" />
      {aberto && <TooltipPreto texto="Em desligamento" />}
    </span>
  )
}

export default DesligamentoBadge
