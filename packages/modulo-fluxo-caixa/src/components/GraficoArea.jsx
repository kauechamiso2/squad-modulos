import { useState } from 'react'
import s from './GraficoArea.module.css'

/*
 * Grafico do card expandido (Figma 2241:46998 e 2279:100506).
 *
 * SVG proprio, sem lib: sao uma linha, uma area, um tracejado e um eixo -
 * qualquer biblioteca de grafico traria o bundle inteiro por causa disto.
 *
 * Medidas do Figma, para a area de 472x88:
 *   faixa do grafico 64 · 14 de respiro · eixo de dias 10
 *
 * O eixo sai no mesmo SVG dos dados para os rotulos e os pontos ficarem
 * alinhados por construcao. O halo e o balao sao DOM por cima, porque o halo
 * usa backdrop-filter, que nao existe em SVG.
 */
export const LARGURA = 472
export const ALTURA = 88
const FAIXA = 64
const EIXO_TOPO = 78
/* Largura nominal de um rotulo de dois digitos em 8px; serve para o primeiro e
   o ultimo ponto nao encostarem na borda. */
const ROTULO = 11

/* A linha ocupa a parte de cima da faixa: no Figma ela varia 35 de 64. */
const ALTURA_LINHA = 35

export default function GraficoArea({
  pontos,
  variante = 'lucro',
  formatarValor,
  rotuloDoBalao,
}) {
  const [sobre, setSobre] = useState(null)
  if (!pontos.length) return null

  const n = pontos.length
  const px = (i) => (n === 1 ? LARGURA / 2 : ROTULO / 2 + (i / (n - 1)) * (LARGURA - ROTULO))

  /* So os dias ja vividos entram na linha; os futuros ficam so no eixo. */
  const desenhados = pontos.filter((p) => !p.futuro)
  const ultimo = Math.max(desenhados.length - 1, 0)

  const valores = desenhados.map((p) => p.valor)
  const max = valores.length ? Math.max(...valores) : 0
  const min = valores.length ? Math.min(...valores) : 0
  const faixa = max - min
  /* Serie constante: linha reta no meio da banda que a linha ocupa. */
  const py = (v) =>
    faixa === 0 ? ALTURA_LINHA / 2 : ALTURA_LINHA - ((v - min) / faixa) * ALTURA_LINHA

  const d = desenhados.map((p, i) => `${i === 0 ? 'M' : 'L'} ${px(i)} ${py(p.valor)}`).join(' ')
  const area = desenhados.length
    ? `${d} L ${px(ultimo)} ${FAIXA} L ${px(0)} ${FAIXA} Z`
    : ''

  const iAtivo = sobre != null ? sobre : ultimo
  const ativo = desenhados[iAtivo]
  const x = ativo ? px(iAtivo) : 0
  const y = ativo ? py(ativo.valor) : 0

  /*
   * O balao fica 14 acima do topo do halo (Figma: pe do balao em 72, halo em
   * 86). Perto das bordas ele encosta em vez de centralizar, porque o card tem
   * overflow hidden por causa das manchas e ele seria cortado.
   */
  const meioBalao = 37
  const esquerda = Math.min(Math.max(x, meioBalao), LARGURA - meioBalao)

  /*
   * O balao vai acima do ponto. Quando o ponto esta no alto da faixa ele nao
   * cabe - e o card tem overflow hidden por causa das manchas - entao vira
   * para baixo do ponto em vez de ser cortado. O Figma nao desenha esse caso.
   */
  const topoAcima = y - 7 - 14 - 24
  const cabeAcima = topoAcima >= -8
  const topoBalao = cabeAcima ? topoAcima : y + 7 + 14

  return (
    <div className={`${s.envolucro} ${s[variante]}`}>
      <svg
        className={s.svg}
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        role="img"
        aria-label="Evolução acumulada no período"
      >
        <defs>
          <linearGradient id={`fc-area-${variante}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className={s.paradaTopo} />
            <stop offset="100%" className={s.paradaBase} />
          </linearGradient>
        </defs>

        {area ? <path d={area} fill={`url(#fc-area-${variante})`} /> : null}
        {d ? <path className={s.linha} d={d} /> : null}

        {ativo ? (
          <line className={s.tracejado} x1={x} y1={y + 7} x2={x} y2={EIXO_TOPO} />
        ) : null}

        <g className={s.eixo}>
          {pontos.map((p, i) => (
            <text
              key={p.data}
              x={px(i)}
              y={ALTURA - 1}
              textAnchor="middle"
              className={p.futuro ? s.diaFuturo : undefined}
            >
              {p.rotulo}
            </text>
          ))}
        </g>

        {/* Faixa invisivel que captura o hover, sobre toda a area do grafico. */}
        <rect
          x="0" y="0" width={LARGURA} height={FAIXA}
          fill="transparent"
          onMouseMove={(e) => {
            const caixa = e.currentTarget.getBoundingClientRect()
            const rel = ((e.clientX - caixa.left) / caixa.width) * LARGURA
            let perto = 0
            desenhados.forEach((_, i) => {
              if (Math.abs(px(i) - rel) < Math.abs(px(perto) - rel)) perto = i
            })
            setSobre(perto)
          }}
          onMouseLeave={() => setSobre(null)}
        />
      </svg>

      {ativo ? (
        <>
          <span className={s.halo} style={{ left: `${(x / LARGURA) * 100}%`, top: `${(y / ALTURA) * 100}%` }}>
            <span className={s.ponto} />
          </span>
          <span
            className={s.balao}
            style={{ left: `${(esquerda / LARGURA) * 100}%`, top: `${(topoBalao / ALTURA) * 100}%` }}
          >
            {rotuloDoBalao ? rotuloDoBalao(ativo.valor) : formatarValor?.(ativo.valor)}
          </span>
        </>
      ) : null}
    </div>
  )
}
