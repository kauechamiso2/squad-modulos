import { ArrowUpRight } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import './ModuleCard.css'

/*
 * Card de 256x180 com tile de 56px, seta no canto e nome embaixo.
 *
 * Nasceu na home do monorepo (Figma "Product 2.0", node 313:1265 normal /
 * 313:1441 hover) e o Fluxo de Caixa desenha exatamente o mesmo card nos
 * cartoes de categoria do fluxo (Figma "Fluxo de Caixa 2.0", 2279:94292):
 * mesmas medidas, mesmo radius de tile (10.349px), mesmo hover com sombra.
 * So o que preenche o tile muda.
 *
 * `to` faz dele um link (home do monorepo); `onClick` faz dele um botao
 * (cartoes do fluxo). `corTile` sobrescreve a cor do tile para quem nao usa
 * a paleta --tile-* da home.
 *
 * CSS puro de proposito: packages/ui e consumido por modulos que nao tem
 * Tailwind, entao nada aqui pode depender dele.
 */
function ModuleCard({ name, emoji, tile, corTile, to, onClick }) {
  const fundoTile = corTile ?? `var(--tile-${tile}, var(--color-overlay))`

  const miolo = (
    <>
      <span className="module-card__top">
        <span className="module-card__tile" style={{ background: fundoTile }} aria-hidden="true">
          {emoji}
        </span>
        <ArrowUpRight className="module-card__arrow" size={24} />
      </span>
      <span className="module-card__name">{name}</span>
    </>
  )

  if (onClick) {
    return (
      <button type="button" className="module-card" onClick={onClick} aria-label={name}>
        {miolo}
      </button>
    )
  }

  return (
    <Link className="module-card" to={to} aria-label={name}>
      {miolo}
    </Link>
  )
}

export default ModuleCard
