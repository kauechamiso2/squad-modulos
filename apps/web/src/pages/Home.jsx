import { ModuleCard } from '@squad/ui'
import { MODULES } from '../modules.js'

// Medidas do Figma "Product 2.0", node 313:1261 (frame Home, 1440x928):
// container de 816px, padding-top 136px, gap de 49px entre titulo e grid,
// grid com gap 24px nos dois eixos, titulo de 48px.
// Os 816px sao exatos: 3 cards de 256px + 2 gaps de 24px. Nao adicione
// padding horizontal neste container ou a terceira coluna quebra de linha.
function Home() {
  return (
    <main className="flex justify-center pt-[136px] pb-20">
      <div className="flex w-[816px] max-w-full flex-col items-center gap-[49px]">
        <h1 className="w-full text-center text-[48px] leading-[1.2] tracking-[-0.26px] text-black font-[var(--font-weight-semibold)]">
          Squad módulos 2.0
        </h1>
        <div className="flex w-full flex-wrap content-center items-center gap-6">
          {MODULES.map((module) => (
            <ModuleCard
              key={module.slug}
              name={module.name}
              emoji={module.emoji}
              tile={module.tile}
              to={`/${module.slug}`}
            />
          ))}
        </div>
      </div>
    </main>
  )
}

export default Home
