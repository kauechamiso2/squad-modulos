import { useState } from 'react'
import s from './GraficoBarras.module.css'

/*
 * Distribuição das respostas de uma pergunta de escolha (Figma 8115:9846).
 *
 * As barras dividem a largura igualmente e a mais alta encosta no topo dos
 * 121px — a altura de cada uma é proporcional à maior, não ao total, senão
 * uma distribuição achatada viraria cinco tocos.
 *
 * A barra sob o ponteiro ganha o contorno preto e o balão com a contagem
 * bruta, que é o que o arquivo desenha. Nada aqui calcula: as fatias chegam
 * prontas.
 */
export default function GraficoBarras({ fatias }) {
  const [emFoco, setEmFoco] = useState(null)
  const maior = Math.max(1, ...fatias.map((f) => f.quantidade))

  return (
    <div className={s.grafico}>
      <div className={s.barras}>
        {fatias.map((fatia, i) => (
          <div
            key={fatia.rotulo}
            className={`${s.coluna} ${i === emFoco ? s.emFoco : ''}`}
            onMouseEnter={() => setEmFoco(i)}
            onMouseLeave={() => setEmFoco(null)}
            onFocus={() => setEmFoco(i)}
            onBlur={() => setEmFoco(null)}
            tabIndex={0}
            role="img"
            aria-label={`${fatia.rotulo}: ${fatia.quantidade} ${fatia.quantidade === 1 ? 'pessoa' : 'pessoas'}`}
          >
            <span className={s.balao} role="tooltip">
              {fatia.quantidade} {fatia.quantidade === 1 ? 'pessoa' : 'pessoas'}
            </span>
            <span
              className={s.barra}
              style={{ height: `${Math.round((fatia.quantidade / maior) * 100)}%` }}
            />
          </div>
        ))}
      </div>

      <div className={s.rotulos}>
        {fatias.map((fatia) => (
          <span key={fatia.rotulo} className={s.rotulo}>
            {fatia.rotulo} ({fatia.porcentagem}%)
          </span>
        ))}
      </div>
    </div>
  )
}
