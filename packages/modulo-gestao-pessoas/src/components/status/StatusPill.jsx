import { useState } from 'react'
import ChecklistPopover from './ChecklistPopover.jsx'
import './StatusPill.css'

/*
 * Pill de status da home (Figma 10331:3109). Pendente e Em desligamento
 * (os dois como "Pendente X/Y", Figma 10355:3884) trazem `status.checklist`:
 * no hover o pill ganha borda na propria cor e abre o popover so leitura
 * logo abaixo (10331:3724, 10331:4355, 10331:3940).
 * Os outros status nao abrem nada.
 */
function StatusPill({ status }) {
  const [aberto, setAberto] = useState(false)
  const itens = status.checklist

  const pill = (
    <span className={`status-pill status-pill--${status.id}`}>{status.texto}</span>
  )

  if (!itens) return pill

  return (
    <span
      className={`status-pill__ancora${aberto ? ' status-pill__ancora--aberto' : ''}`}
      tabIndex={0}
      onMouseEnter={() => setAberto(true)}
      onMouseLeave={() => setAberto(false)}
      onFocus={() => setAberto(true)}
      onBlur={() => setAberto(false)}
    >
      {pill}
      {aberto && <ChecklistPopover itens={itens} />}
    </span>
  )
}

export default StatusPill
