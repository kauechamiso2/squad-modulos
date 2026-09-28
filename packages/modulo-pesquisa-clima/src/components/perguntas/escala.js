/*
 * O vão entre os degraus da escala.
 *
 * Onze degraus (0 a 10) com os 40px do Figma passavam de 750px só de régua, e
 * com dois rótulos de ponta longos ao lado a linha estourava o cartão e a
 * página inteira ganhava barra horizontal. O vão passa a sair da quantidade:
 * escala curta fica como o Figma desenhou, escala longa aperta o suficiente
 * para caber.
 *
 * `MEIO` é o que sobra para a régua no cartão de 808px depois do padding, dos
 * dois rótulos de ponta no limite deles e do respiro entre as três partes —
 * medido na tela, não estimado. A régua tem de caber numa linha só: quebrada
 * em duas ela deixa de ser uma régua e vira dois grupos de números.
 */
const MEIO = 355
const ICONE = 24
const MIN = 6
const MAX = 40

export function vaoDosDegraus(quantos) {
  if (quantos < 2) return MAX
  const sobra = (MEIO - ICONE * quantos) / (quantos - 1)
  return Math.max(MIN, Math.min(MAX, Math.round(sobra)))
}

/* Passa o vão para o CSS, que é quem sabe onde ele entra. */
export const estiloDaEscala = (quantos) => ({
  '--vao-degraus': `${vaoDosDegraus(quantos)}px`,
})
