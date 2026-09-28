import { Link } from 'react-router-dom'

// Tela generica dos modulos que ainda nao existem. Um modulo sai daqui
// mudando status para 'ativo' em modules.js e ganhando rota em router.jsx.
function ModulePlaceholder({ module }) {
  return (
    <main className="mx-auto flex w-[816px] max-w-full flex-col items-center gap-6 px-4 pt-[136px] text-center">
      <span
        className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-[var(--radius-tile)] text-2xl leading-[1.2]"
        style={{ background: `var(--tile-${module.tile}, var(--color-overlay))` }}
        aria-hidden="true"
      >
        {module.emoji}
      </span>
      <h1 className="text-[32px] leading-[1.2] tracking-[-0.26px] text-black font-[var(--font-weight-semibold)]">
        {module.name}
      </h1>
      <p className="text-base text-[var(--color-text-secondary)] font-[var(--font-weight-regular)]">
        Este módulo ainda não foi construído.
      </p>
      <Link
        to="/"
        className="mt-2 inline-flex h-10 items-center rounded-[var(--radius-pill)] bg-black px-5 text-sm text-white no-underline font-[var(--font-weight-medium)]"
      >
        Voltar para a home
      </Link>
    </main>
  )
}

export default ModulePlaceholder
