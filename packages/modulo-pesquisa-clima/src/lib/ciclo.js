import { semente } from './semente.js'
import { historicoDe, taxaDoCiclo } from './historico.js'

/*
 * O que a tela de um ciclo mostra.
 *
 * Tudo vem do que está guardado em `historico`: as perguntas como estavam
 * naquele ciclo e as respostas dele. Nada é gerado aqui — quem cria é
 * lib/historico.js, uma vez só, quando o ciclo fecha.
 *
 * É o mesmo registro que a tabela da aba Ciclos lê, então as duas telas não
 * podem discordar sobre o mesmo ciclo.
 */

export function cicloDe(pesquisa, numero) {
  const ciclo = historicoDe(pesquisa).find(
    (c) => String(c.numero) === String(numero),
  )
  if (!ciclo) return null
  return { ...ciclo, responderam: ciclo.respostas?.length ?? 0 }
}

/* Apaga as respostas de um ciclo sem tirar o ciclo do histórico. A taxa cai
   junto porque é derivada delas — ver taxaDoCiclo. */
export function limparRespostasDoCiclo(pesquisa, numero) {
  return {
    ...pesquisa,
    historico: (pesquisa.historico || []).map((c) =>
      String(c.numero) === String(numero) ? { ...c, respostas: [] } : c,
    ),
  }
}

export { taxaDoCiclo }

/* ---- distribuição para o gráfico ---- */

/* Os rótulos de cada barra, por tipo. Nota vai de 0 ao teto; estrelas de 1 a
   5; as de escolha usam o texto da própria opção. */
function faixasDe(pergunta) {
  switch (pergunta.tipo) {
    case 'nota':
      return Array.from({ length: (pergunta.maximo ?? 5) + 1 }, (_, i) => ({
        chave: i,
        rotulo: String(i),
      }))
    case 'estrelas':
      return [1, 2, 3, 4, 5].map((i) => ({ chave: i, rotulo: String(i) }))
    case 'escolhaUnica':
    case 'escolhaMultipla':
      return (pergunta.opcoes || []).map((opcao, i) => ({
        chave: i,
        rotulo: opcao,
      }))
    default:
      return []
  }
}

/*
 * Quantas pessoas em cada faixa. A múltipla escolha conta uma pessoa em cada
 * opção que ela marcou, então a soma das porcentagens passa de 100 — é o que
 * o Figma mostra (12+24+36+28+32 = 132).
 */
export function distribuicaoDe(pergunta, respostas) {
  const faixas = faixasDe(pergunta)
  if (!faixas.length) return null

  const total = respostas.length || 1
  return faixas.map(({ chave, rotulo }) => {
    const quantidade = respostas.filter((r) => {
      const valor = r.valores?.[pergunta.id]
      return Array.isArray(valor) ? valor.includes(chave) : valor === chave
    }).length
    return {
      rotulo,
      quantidade,
      porcentagem: Math.round((quantidade / total) * 100),
    }
  })
}

export const ehDeEscolha = (pergunta) =>
  ['nota', 'estrelas', 'escolhaUnica', 'escolhaMultipla'].includes(pergunta.tipo)

/* ---- perguntas abertas ---- */

export const LIMITE_TRECHOS = 3

/*
 * Os textos escritos naquela pergunta. Os distintos vêm primeiro: o banco de
 * textos simulados é pequeno, e sem isso os três trechos em destaque podiam
 * sair repetidos — o que num mock lê como erro, não como coincidência.
 */
export function trechosDe(pergunta, respostas) {
  const todos = respostas
    .map((r) => r.valores?.[pergunta.id])
    .filter((t) => typeof t === 'string' && t.trim())

  const vistos = new Set()
  const distintos = []
  const repetidos = []
  for (const texto of todos) {
    if (vistos.has(texto)) repetidos.push(texto)
    else {
      vistos.add(texto)
      distintos.push(texto)
    }
  }
  return [...distintos, ...repetidos]
}

/*
 * Resumo do Pipo por pergunta aberta. Não há análise: são moldes com uma
 * leitura qualitativa escolhida pelo hash, no tom do resumo da aba Geral.
 */
const LEITURAS = [
  'o time destaca a colaboração e o reconhecimento da liderança como pontos positivos do período. Em contrapartida, surgem menções recorrentes sobre sobrecarga em momentos de fechamento de sprint e falta de clareza quando prioridades mudam de última hora. Questões de infraestrutura também aparecem como um ponto de atrito que impacta o andamento do trabalho.',
  'a autonomia no dia a dia aparece como o ponto mais bem avaliado, e várias respostas citam a melhora na comunicação entre as áreas. O incômodo mais repetido é a previsibilidade: mudanças de escopo que chegam em cima da hora e reuniões que se acumulam sem pauta clara.',
  'as respostas convergem em elogiar o clima entre as pessoas e a disposição para ajudar. O que puxa a leitura para baixo é o volume de frentes abertas ao mesmo tempo, citado em boa parte dos comentários, e a demora para destravar questões de ferramenta.',
]

export function resumoDaPergunta(pesquisa, ciclo, pergunta) {
  const leitura = LEITURAS[semente(`${pesquisa.id}:c${ciclo.numero}:${pergunta.id}`) % LEITURAS.length]
  return `De forma geral, ${leitura}`
}
