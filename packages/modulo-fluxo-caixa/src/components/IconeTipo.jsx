import { ArrowDown, ArrowUp, Clock } from '@phosphor-icons/react'
import { ehFutura } from '../lib/transacoes.js'
import s from './IconeTipo.module.css'

/*
 * Tile 40x40 do tipo da transacao. Estava dentro da TabelaTransacoes; saiu para
 * ca quando o painel de resumo passou a usar o mesmo.
 */
function IconeTipo({ transacao }) {
  if (ehFutura(transacao)) {
    return (
      <span className={`${s.tile} ${s.futuro}`}>
        <Clock size={24} color="var(--cor-texto-secundario)" />
      </span>
    )
  }
  if (transacao.tipo === 'entrada') {
    return (
      <span className={`${s.tile} ${s.entrada}`}>
        <ArrowDown size={24} color="var(--fc-cor-entrada)" />
      </span>
    )
  }
  return (
    <span className={`${s.tile} ${s.saida}`}>
      <ArrowUp size={24} color="var(--fc-cor-saida)" />
    </span>
  )
}

export default IconeTipo
