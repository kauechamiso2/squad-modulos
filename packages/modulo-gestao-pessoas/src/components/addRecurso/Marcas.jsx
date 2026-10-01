import { LOGOS } from '../../utils/logos.js'
import './NovoRecurso.css'

export function BadgeAmarelo({ Icone, tamanho = 56 }) {
  return (
    <span className="recurso-badge recurso-badge--amarelo" style={{ width: tamanho, height: tamanho }}>
      <Icone size={tamanho === 56 ? 24 : 20} color="var(--gp-icone-amarelo)" />
    </span>
  )
}

// Logo no badge de 56px (cards) ou de 32px (fornecedores).
export function BadgeLogo({ nome, tamanho = 56 }) {
  const logo = LOGOS[nome]
  if (!logo) throw new Error(`Sem logo para "${nome}"`)
  const escala = tamanho / 56
  const folga = logo.inset * escala
  return (
    <span className="recurso-badge recurso-badge--logo" style={{ width: tamanho, height: tamanho }}>
      <img
        src={logo.src}
        alt=""
        style={{ top: folga, left: folga, width: tamanho - 2 * folga, height: tamanho - 2 * folga }}
      />
    </span>
  )
}
