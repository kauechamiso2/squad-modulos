/*
 * Semente estável a partir de um texto (FNV-1a).
 *
 * Dá o mesmo número sempre para a mesma chave, que é o que segura os valores
 * simulados no lugar entre um render e outro, e entre uma sessão e outra.
 * Nada aqui sorteia na hora.
 *
 * Mora sozinho, e não em geral.js, porque as respostas simuladas precisam
 * dele e o motor precisa das respostas: com tudo junto, lib/geral.js e
 * lib/pesquisas.js passariam a se importar em círculo.
 */
export function semente(texto) {
  let h = 0x811c9dc5
  for (let i = 0; i < texto.length; i += 1) {
    h ^= texto.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h
}

export const entre = (texto, min, max) => min + (semente(texto) % (max - min + 1))
