/*
 * Igualdade profunda entre dois valores guardáveis.
 *
 * Serve para uma pergunta só: mudou alguma coisa desde que isto foi aberto?
 * Comparar por referência não responde — todo `definir` monta um objeto novo
 * mesmo quando o conteúdo é o mesmo, e digitar uma letra e apagá-la de volta
 * continuaria contando como alteração.
 *
 * Só precisa dar conta do que o projeto guarda: texto, número, booleano,
 * nulo, lista e objeto simples — o mesmo conjunto que vai para o
 * localStorage. Comparar por JSON também funcionaria, mas dependeria da
 * ordem das chaves; aqui a ordem não conta.
 */
export default function iguais(a, b) {
  if (a === b) return true
  if (
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    a === null ||
    b === null
  ) {
    return false
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false

  const chaves = Object.keys(a)
  if (chaves.length !== Object.keys(b).length) return false
  return chaves.every(
    (k) => Object.prototype.hasOwnProperty.call(b, k) && iguais(a[k], b[k]),
  )
}
