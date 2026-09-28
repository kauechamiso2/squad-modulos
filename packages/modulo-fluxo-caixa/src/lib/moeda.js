/*
 * Dinheiro em centavos inteiros, sempre. Nada de float: 0.1 + 0.2 nao da 0.3,
 * e um erro de um centavo numa soma de fluxo de caixa e um bug que ninguem
 * consegue explicar depois.
 */

/*
 * Formata centavos como "R$6.340,12".
 *
 * Os cards da home escrevem sem espaco depois do R$ (Figma 2279:100370) e as
 * linhas da tabela e o modal de confirmacao escrevem com (2279:97217 e
 * 2279:97351), entao o espaco e opcional.
 */
export function formatar(centavos, { espaco = false } = {}) {
  const n = Math.abs(centavos) / 100
  const sep = espaco ? ' ' : ''
  return `R$${sep}${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/*
 * Separa a parte inteira dos centavos para o card de resumo, onde os centavos
 * saem em cinza claro (Figma 2279:100370).
 *
 * O sinal entra quando o valor e negativo: o Figma so desenha lucro positivo,
 * mas lucro negativo e caso real e mostrar "R$7.320,13" para -7320,13 seria
 * mentira na tela.
 */
export function partes(centavos) {
  const texto = (centavos < 0 ? '-' : '') + formatar(centavos)
  const i = texto.lastIndexOf(',')
  return { inteiro: texto.slice(0, i + 1), centavos: texto.slice(i + 1) }
}

/* Valor da tabela: "+ R$ 1.290,90" ou "- R$ 3.872,90" (Figma 2279:100442). */
export function formatarComSinal(centavos, tipo) {
  const sinal = tipo === 'entrada' ? '+' : '-'
  const n = Math.abs(centavos) / 100
  return `${sinal} R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/*
 * Mascara de digitacao: a pessoa digita so digitos e eles entram pela direita,
 * como em caixa eletronico. "1" -> 0,01; "123" -> 1,23.
 */
export function digitosParaCentavos(digitos) {
  const limpo = String(digitos).replace(/\D/g, '')
  return limpo ? parseInt(limpo, 10) : 0
}

export function centavosParaDigitos(centavos) {
  return centavos ? String(centavos) : ''
}

/* "6.340,12" sem o R$, para o input gigante do passo de valor. */
export function formatarSemSimbolo(centavos) {
  /* Campo vazio: o Figma (2279:94840, 2279:94891) escreve so "0". Os centavos
     aparecem quando a pessoa comeca a digitar. */
  if (!centavos) return '0'
  return (centavos / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
