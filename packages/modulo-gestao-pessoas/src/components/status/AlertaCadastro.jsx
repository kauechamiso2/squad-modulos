import { useState } from 'react'
import warningIcon from '../../assets/icons/Warning.svg'
import TooltipPreto from './TooltipPreto.jsx'
import './AlertaCadastro.css'

/*
 * Alerta de cadastro incompleto - Figma 10338:9581 (Warning 10338:9635,
 * tooltip 10338:9667): Warning cinza, sem badge. O clique abre a pagina do
 * colaborador, onde o "Completar cadastro" e feito.
 */
function AlertaCadastro({ onAbrir }) {
  const [aberto, setAberto] = useState(false)
  return (
    <button
      type="button"
      className="alerta-cadastro"
      aria-label="Informações faltando"
      onMouseEnter={() => setAberto(true)}
      onMouseLeave={() => setAberto(false)}
      onFocus={() => setAberto(true)}
      onBlur={() => setAberto(false)}
      onClick={(event) => {
        event.stopPropagation()
        onAbrir()
      }}
    >
      <img src={warningIcon} width={20} height={20} alt="" />
      {aberto && <TooltipPreto texto="Informações faltando" />}
    </button>
  )
}

export default AlertaCadastro
