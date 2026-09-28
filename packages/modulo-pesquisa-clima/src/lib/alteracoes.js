import { fimDoCiclo } from './datas.js'
import { ehFinal } from './pesquisas.js'

/*
 * Registro de alterações nas perguntas.
 *
 * A coluna "Atividade" da aba Ciclos dizia "Sofreu N alterações" a partir de um
 * hash. Agora vem daqui: cada edição, exclusão ou inclusão de pergunta — e
 * cada mudança na abertura — entra num registro, guardado junto da pesquisa e
 * separado por ciclo.
 *
 * A que ciclo uma alteração pertence:
 *
 *  - Rodando, o ciclo aberto é o que vem depois do último fechado, e a
 *    alteração é dele.
 *  - Pausada, a aba Perguntas exige pausar antes de editar, então quem edita
 *    interrompeu o ciclo em curso — e esse já fechou ao pausar, então é o
 *    último contado. É a mesma linha que a aba Ciclos marca com o aviso de
 *    "encerrado antes do prazo".
 *  - Entre ciclos por conta do prazo, encerrada, fora do ar, agendada ou
 *    rascunho, não há ciclo interrompido: o que se edita agora vale para o
 *    próximo a abrir.
 *
 * Pausar e o prazo vencer deixam a pesquisa no mesmo status — "Ativa |
 * Aguardando" —, então o que separa os dois é a data: pausar fecha o ciclo
 * antes do prazo que ele teria, e é isso que `cicloInterrompido` compara.
 *
 * O registro fica no formato { "3": [...], "4": [...] } para uma alteração
 * nunca migrar de ciclo depois de anotada.
 */

function cicloInterrompido(p) {
  if (p.status !== 'aguardando' || !p.cicloInicio || !p.cicloFim) return false
  const prazo = fimDoCiclo(new Date(p.cicloInicio), p.configuracao?.prazo)
  return Boolean(prazo) && new Date(p.cicloFim) < prazo
}

export function cicloEmAberto(p) {
  const fechados = p.ciclos ?? 0
  /* Encerrada não tem ciclo aberto nem próximo: `fechados + 1` apontava para
     um ciclo que nunca vai existir, e a alteração anotada nele não aparecia
     em lugar nenhum da aba Ciclos. A aba de Perguntas não deixa editar uma
     pesquisa encerrada, então na prática ninguém chega aqui assim; isto é o
     que garante que nada seja anotado num ciclo fantasma se algum caminho
     novo chegar. */
  if (ehFinal(p)) return null
  /* Pausada no meio do ciclo, a alteração é do ciclo que acabou de fechar —
     ele é o último contado. Fora disso, do próximo a abrir: o que está
     rodando agora ainda não entrou na conta, então é `fechados + 1` tanto
     para ele quanto para o que ainda vai começar. */
  if (fechados >= 1 && cicloInterrompido(p)) return fechados
  return fechados + 1
}

/* Anota uma alteração e devolve a pesquisa. `alvo` é o enunciado da pergunta,
   ou o rótulo do que mudou quando não há uma. */
export function registrar(p, tipo, alvo) {
  const aberto = cicloEmAberto(p)
  /* Sem ciclo a que pertencer, a anotação não tem onde morar: guardá-la num
     número inventado é o que fazia a alteração sumir da aba Ciclos. */
  if (aberto === null) return p
  const numero = String(aberto)
  const registro = p.alteracoes || {}
  const doCiclo = registro[numero] || []
  return {
    ...p,
    alteracoes: {
      ...registro,
      [numero]: [...doCiclo, { em: new Date().toISOString(), tipo, alvo }],
    },
  }
}

export const alteracoesDoCiclo = (p, numero) =>
  (p.alteracoes || {})[String(numero)] || []

/* Frase da coluna Atividade. Vazia quando o ciclo passou sem mexerem nele —
   o Figma deixa a célula em branco nesse caso. */
export function fraseDeAtividade(quantas) {
  if (!quantas) return ''
  return `Sofreu ${quantas} ${quantas === 1 ? 'alteração' : 'alterações'}`
}
