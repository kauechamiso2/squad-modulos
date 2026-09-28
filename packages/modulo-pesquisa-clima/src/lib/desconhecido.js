/*
 * O que fazer quando um valor guardado não é nenhum dos que o código conhece.
 *
 * Todas as tabelas fixas do projeto — status, tom do selo, tipo de pergunta,
 * período de prazo, frequência — são consultadas por um campo que veio do
 * localStorage. Nada garante que o que está guardado seja um dos valores
 * previstos: armazenamento corrompido, dado editado à mão, uma migração
 * futura que renomeie um status. Antes disto, `STATUS[p.status]` devolvia
 * `undefined` para um valor desses e o `Selo` estourava em `status.tom` —
 * derrubando a lista inteira por causa de uma linha só.
 *
 * A regra aqui é a mesma do resto do projeto: não desenhar coisa inventada e
 * não fingir que está tudo bem. Quem consulta recebe `undefined` e decide o
 * que mostrar no lugar, e o valor estranho é anunciado no console para quem
 * for investigar. O aviso sai uma vez por valor: isto é chamado a cada
 * render, e repetir a mesma linha centenas de vezes esconderia as outras.
 */
const jaAvisados = new Set()

export function avisarValorDesconhecido(onde, valor) {
  const marca = `${onde} ${String(valor)}`
  if (jaAvisados.has(marca)) return
  jaAvisados.add(marca)
  // eslint-disable-next-line no-console
  console.warn(
    `[Pesquisa de Clima] ${onde}: o valor guardado ${JSON.stringify(valor)} não é um dos conhecidos. O que dependia dele aparece marcado na tela.`,
  )
}

/*
 * Consulta uma tabela fixa por um valor guardado.
 *
 * `hasOwnProperty` e não `tabela[chave]` porque a chave vem de fora: uma
 * pesquisa com status "constructor" ou "toString" acharia algo no protótipo
 * do objeto e devolveria uma função no lugar de um status.
 */
export function daTabela(tabela, chave, onde) {
  if (
    (typeof chave === 'string' || typeof chave === 'number') &&
    Object.prototype.hasOwnProperty.call(tabela, chave)
  ) {
    return tabela[chave]
  }
  avisarValorDesconhecido(onde, chave)
  return undefined
}
