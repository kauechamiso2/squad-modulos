import { useEffect, useRef } from 'react'
import Calendario from './Calendario.jsx'
import s from './CalendarioPopover.module.css'

/*
 * O mesmo Calendario, na escala do popover dos Filtros (Figma 2279:108290):
 * 292x292, raio 12, padding 15.37, setas de 18.44 e dias de 11px. Todas as
 * medidas entram por custom property - nao ha um segundo componente.
 *
 * Abre logo abaixo do campo de data clicado, dentro do painel.
 */
function CalendarioPopover({ valor, aDireita = false, onEscolher, onFechar }) {
  const caixa = useRef(null)

  useEffect(() => {
    const aoClicar = (e) => {
      if (caixa.current && !caixa.current.contains(e.target)) onFechar()
    }
    const aoTeclar = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onFechar() }
    }
    /*
     * O ouvinte de clique entra num setTimeout: o proprio clique que abriu o
     * popover ainda esta subindo, e registrar na hora faria ele fechar no
     * mesmo clique que o abriu.
     */
    const t = setTimeout(() => document.addEventListener('click', aoClicar), 0)
    document.addEventListener('keydown', aoTeclar, true)
    return () => {
      clearTimeout(t)
      document.removeEventListener('click', aoClicar)
      document.removeEventListener('keydown', aoTeclar, true)
    }
  }, [onFechar])

  return (
    <div className={`${s.popover} ${aDireita ? s.aDireita : ''}`} ref={caixa}>
      <Calendario semCasca tamanhoSeta={18.44} valor={valor} onEscolher={onEscolher} />
    </div>
  )
}

export default CalendarioPopover
