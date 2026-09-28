import s from './Rosca.module.css'

/*
 * Rosca da taxa de resposta. Grande no cartão do Geral (Figma 8109:9403,
 * moldura de 100 e traço de 16) e pequena na linha da aba Ciclos
 * (Figma 8087:8725, moldura de 28 e traço de 6, sem o número no meio).
 *
 * O Figma exporta cada arco como vetor, um por porcentagem. Aqui é um círculo
 * com stroke-dasharray: mesma geometria, e serve qualquer valor sem precisar
 * de um arquivo novo a cada um.
 *
 * O traço fica centrado no caminho, então transborda metade dele de cada
 * lado da moldura — é por isso que a de 100 renderiza 116 e a de 28
 * renderiza 34, como o arquivo mostra. Por isso a caixa não corta.
 */

/* Escala combinada com o produto: cinza em 0, e depois vermelho, amarelo e
   verde conforme a participação sobe. */
function corDe(taxa) {
  if (taxa <= 0) return 'var(--cor-rosca-trilho)'
  if (taxa < 50) return 'var(--cor-vermelho)'
  if (taxa < 80) return 'var(--cor-rosca-amarelo)'
  return 'var(--cor-verde-ativo)'
}

export default function Rosca({ taxa, tamanho = 100, traco = 16, rotulo = true }) {
  const preenchido = Math.max(0, Math.min(100, taxa))
  const raio = tamanho / 2
  const volta = 2 * Math.PI * raio
  const fora = traco / 2
  const lado = tamanho + traco
  const centro = lado / 2

  return (
    <div className={s.rosca} style={{ width: tamanho, height: tamanho }}>
      <svg
        className={s.desenho}
        viewBox={`0 0 ${lado} ${lado}`}
        style={{ top: -fora, left: -fora, width: lado, height: lado }}
        aria-hidden="true"
      >
        <circle
          className={s.trilho}
          cx={centro}
          cy={centro}
          r={raio}
          strokeWidth={traco}
        />
        {preenchido > 0 ? (
          <circle
            className={s.arco}
            cx={centro}
            cy={centro}
            r={raio}
            strokeWidth={traco}
            stroke={corDe(preenchido)}
            strokeDasharray={`${(preenchido / 100) * volta} ${volta}`}
            /* Em 100% as duas pontas se encontram e a ponta redonda sobra
               por cima da outra, deixando um calo no topo. O círculo fechado
               não tem ponta à mostra, então ali ela não faz falta. */
            strokeLinecap={preenchido >= 100 ? 'butt' : 'round'}
          />
        ) : null}
      </svg>
      {rotulo ? <span className={s.valor}>{preenchido}%</span> : null}
    </div>
  )
}
