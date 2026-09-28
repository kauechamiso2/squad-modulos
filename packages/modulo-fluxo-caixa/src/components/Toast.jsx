import { useEffect, useRef, useState } from 'react'
import { Check, X } from '@phosphor-icons/react'
import s from './Toast.module.css'

/*
 * Toast verde do canto inferior direito (Figma 2279:96423).
 *
 * Duas linhas: o titulo em negrito e a continuacao embaixo. O check fica num
 * circulo verde-claro de 40px, e nao e o glifo CheckCircle - no Figma sao duas
 * camadas, o circulo #c8ff9b e o Check de 20px por cima.
 */
/*
 * Entra subindo com fade e sai descendo, mais rapido. Nao havia referencia no
 * monorepo - o Aviso do Pesquisa de Clima tambem aparece seco - entao os tempos
 * vem dos tokens --movimento-entrada / --movimento-saida do @squad/ui.
 *
 * O componente se desmonta sozinho: `onFechar` so e chamado depois da saida,
 * para o pai nao arrancar o toast da tela no meio da animacao.
 */
function Toast({ titulo, descricao, onFechar, duracao = 4000 }) {
  const [entrou, setEntrou] = useState(false)
  const [saindo, setSaindo] = useState(false)
  const caixa = useRef(null)

  useEffect(() => {
    let segundo
    const primeiro = requestAnimationFrame(() => {
      segundo = requestAnimationFrame(() => setEntrou(true))
    })
    const relogio = setTimeout(() => setSaindo(true), duracao)
    return () => {
      cancelAnimationFrame(primeiro)
      if (segundo) cancelAnimationFrame(segundo)
      clearTimeout(relogio)
    }
  }, [duracao])

  useEffect(() => {
    if (!saindo) return undefined
    const el = caixa.current
    const espera = el
      ? (parseFloat(getComputedStyle(el).transitionDuration) || 0) * 1000
      : 0
    const t = setTimeout(onFechar, espera + 50)
    return () => clearTimeout(t)
  }, [saindo, onFechar])

  return (
    <div
      className={`${s.toast} ${entrou && !saindo ? s.dentro : ''} ${saindo ? s.saindo : ''}`}
      ref={caixa}
      role="status"
    >
      <span className={s.circulo}>
        <Check size={20} />
      </span>
      <span className={s.textos}>
        <span className={s.titulo}>{titulo}</span>
        {descricao ? <span className={s.descricao}>{descricao}</span> : null}
      </span>
      <button type="button" className={s.fechar} aria-label="Fechar aviso" onClick={() => setSaindo(true)}>
        <X size={20} />
      </button>
    </div>
  )
}

export default Toast
