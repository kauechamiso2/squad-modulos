import s from './CabecalhoFluxo.module.css'
import IconeBotao from './IconeBotao.jsx'

import close from '../../assets/icons/Close.svg'

/* Cabeçalho de 96px com título à esquerda e X à direita. Compartilhado pelas
   telas do fluxo e pela revisão das perguntas. */
export default function CabecalhoFluxo({ titulo, onFechar }) {
  return (
    <header className={s.cabecalho}>
      <p className={s.titulo}>{titulo}</p>
      <div className={s.acoes}>
        <IconeBotao src={close} rotulo="Fechar" onClick={onFechar} />
      </div>
    </header>
  )
}
