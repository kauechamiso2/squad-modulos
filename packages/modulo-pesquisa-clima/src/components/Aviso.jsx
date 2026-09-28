import { useEffect } from 'react'
import s from './Aviso.module.css'

/*
 * Aviso passageiro no rodapé — "Link copiado" e afins.
 *
 * Some sozinho depois de 2,5s. O sumiço mora aqui, e não em quem chama, para
 * não haver duas contagens diferentes pela tela: quem usa só decide o texto.
 */
const DURACAO_MS = 2500

export default function Aviso({ texto, onSumir }) {
  useEffect(() => {
    if (!texto) return undefined
    const id = setTimeout(onSumir, DURACAO_MS)
    return () => clearTimeout(id)
  }, [texto, onSumir])

  if (!texto) return null
  return (
    <div className={s.aviso} role="status">
      {texto}
    </div>
  )
}
