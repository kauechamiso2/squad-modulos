/*
 * Quem foi convidado, quantos responderam e a taxa que sai dos dois.
 *
 * A taxa de resposta é uma conta, não um campo: ela é o tamanho da lista de
 * respostas sobre o tamanho do público, calculada na hora de mostrar. Já foi
 * um número guardado que o motor subia sozinho, com a lista de respostas
 * sendo refeita para bater com ele — e era isso que desfazia uma exclusão
 * (a lista voltava ao tamanho que a porcentagem mandava) e que fazia apagar
 * uma resposta apagar duas em público grande (arredondar para porcentagem e
 * voltar não devolve o mesmo número acima de 100 pessoas).
 *
 * Agora a lista é a verdade e a porcentagem é derivada. Uma resposta a menos
 * é uma resposta a menos, em qualquer tamanho de público.
 */

/* Quantas pessoas o modal de participantes diz que cada grupo tem. É o mesmo
   56 que a tela de criação mostra; sai daqui para os dois lados falarem o
   mesmo número. */
export const MEMBROS_POR_GRUPO = 56

/* Pessoas escolhidas uma a uma contam uma cada: escolher duas pessoas é um
   público de duas, e não de um grupo inteiro. Sem nada escolhido cai no
   tamanho de um grupo, que é o que a lista mostrava antes de existir escolha
   avulsa. */
export function totalDeParticipantes({
  todaEmpresa,
  grupos = [],
  pessoas = [],
} = {}) {
  if (todaEmpresa) return MEMBROS_POR_GRUPO
  return grupos.length * MEMBROS_POR_GRUPO + pessoas.length || MEMBROS_POR_GRUPO
}

/*
 * As respostas do ciclo em curso.
 *
 * `undefined` e `[]` não são a mesma coisa: `[]` é uma lista vazia de
 * verdade — ninguém respondeu, ou alguém apagou tudo —, e `undefined` é uma
 * pesquisa guardada antes de a lista existir, que ainda vai ser materializada
 * a partir da taxa velha. Quem só quer contar não precisa saber disso.
 */
export const respostasDe = (p) => p?.respostas || []

export const quantasResponderam = (p) => respostasDe(p).length

/* Quantas ainda faltam para o público inteiro ter respondido. Nunca negativo:
   público menor que a lista é uma incoerência que `aparar` resolve. */
export const vagasRestantes = (p) =>
  Math.max(0, totalDeParticipantes(p?.participantes) - quantasResponderam(p))

export const cicloCheio = (p) => vagasRestantes(p) === 0

/* A taxa de resposta, inteira, como todas as telas mostram. */
export function taxaDe(p) {
  const total = totalDeParticipantes(p?.participantes)
  if (!total) return 0
  return Math.round((quantasResponderam(p) / total) * 100)
}
