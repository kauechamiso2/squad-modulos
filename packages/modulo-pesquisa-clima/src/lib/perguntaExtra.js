import { avisarValorDesconhecido } from './desconhecido.js'

/*
 * "Gerar pergunta extra quando a resposta for negativa".
 *
 * Vive só nos quatro tipos que têm um conjunto fechado de respostas
 * possíveis — nota, estrelas, seleção única e múltipla seleção — porque é
 * disso que a lista "Marque as opções negativas" precisa: um valor ou uma
 * opção para marcar. Texto curto e texto longo não têm o que marcar.
 *
 * A configuração mora na própria pergunta, como `obrigatoria`:
 * `{ ativa, negativas }`. `negativas` guarda números — o valor da escala em
 * nota e estrelas, o índice da opção em única e múltipla —, e não texto: o
 * texto de uma opção muda quando alguém a edita, o índice não.
 *
 * Sem a chave, a pergunta está desligada — é o mesmo padrão de
 * `ehObrigatoria`: ausência quer dizer "nunca configurada", não "negativa
 * nenhuma marcada por engano".
 */
export const TIPOS_COM_EXTRA = ['nota', 'estrelas', 'escolhaUnica', 'escolhaMultipla']

export const suportaExtra = (tipo) => TIPOS_COM_EXTRA.includes(tipo)

const PADRAO = { ativa: false, negativas: [] }

export function perguntaExtraDe(pergunta) {
  return pergunta?.perguntaExtra ?? PADRAO
}

/*
 * As linhas de "Marque as opções negativas": um par valor/texto por resposta
 * possível, na ordem em que o Figma desenha — nota e estrelas do topo da
 * escala para baixo, única e múltipla na ordem das opções.
 *
 * O `valor` é o que vai para `negativas` e o que chega em `respostaENegativa`
 * — o índice da opção, ou o número da escala.
 */
export function opcoesNegativasDe(pergunta) {
  if (pergunta.tipo === 'nota') {
    const maximo = pergunta.maximo ?? 5
    return Array.from({ length: maximo + 1 }, (_, i) => maximo - i).map((valor) => ({
      valor,
      texto: String(valor),
    }))
  }
  if (pergunta.tipo === 'estrelas') {
    return [5, 4, 3, 2, 1].map((valor) => ({ valor, texto: String(valor) }))
  }
  if (pergunta.tipo === 'escolhaUnica' || pergunta.tipo === 'escolhaMultipla') {
    return (pergunta.opcoes || []).map((texto, valor) => ({ valor, texto }))
  }
  return []
}

/* Se o que a pessoa respondeu bate com alguma das opções marcadas como
   negativas. Em múltipla escolha, uma marcação só já conta. */
export function respostaENegativa(pergunta, valor) {
  const { ativa, negativas } = perguntaExtraDe(pergunta)
  if (!ativa || !negativas?.length || valor === undefined || valor === null) {
    return false
  }
  if (pergunta.tipo === 'escolhaMultipla') {
    return Array.isArray(valor) && valor.some((i) => negativas.includes(i))
  }
  return negativas.includes(valor)
}

/*
 * Prende `negativas` dentro da escala atual — chamada quando o teto de uma
 * nota muda. Uma opção marcada como negativa que deixou de existir (o teto
 * baixou) não pode continuar marcada calada.
 */
export function perguntaExtraNaEscala(perguntaExtra, maximo) {
  if (!perguntaExtra) return perguntaExtra
  const negativas = perguntaExtra.negativas.filter((v) => v >= 0 && v <= maximo)
  if (negativas.length === perguntaExtra.negativas.length) return perguntaExtra
  return { ...perguntaExtra, negativas }
}

/*
 * Acerta `negativas` quando uma opção é removida da lista — a mesma ideia de
 * `acertarRespostasDaPergunta`, mas para os índices que esta pergunta marcou
 * como negativos nela mesma. A opção removida sai; as que vinham depois dela
 * andam um índice para trás, porque é isso que remover do meio de uma lista
 * sem id próprio faz com quem ficou.
 */
export function perguntaExtraSemOpcao(perguntaExtra, indiceRemovido) {
  if (!perguntaExtra) return perguntaExtra
  const negativas = perguntaExtra.negativas
    .filter((v) => v !== indiceRemovido)
    .map((v) => (v > indiceRemovido ? v - 1 : v))
  return { ...perguntaExtra, negativas }
}

/* "Bruno" a partir de "ana.ribeiro@exemplo.com" não serve aqui; isto é só
   para deixar o enunciado original legível dentro da pergunta gerada. */
const comAspas = (t) => `"${t}"`

/*
 * O texto da pergunta extra — mockado: o projeto não chama nenhum modelo, e
 * isto é o que o prompt original chamou de "similar em espírito" ao exemplo
 * dele, montado a partir do enunciado da pergunta original e da resposta que
 * disparou.
 *
 * Uma frase por tipo, porque "seja 2" não é português — nota e estrelas
 * perguntam pela nota, única e múltipla pela opção marcada. Com mais de uma
 * opção negativa marcada em múltipla, as duas entram na mesma frase; qual
 * frase usar para cada combinação é refinamento para depois.
 */
export function textoDaPerguntaExtra(pergunta, valor) {
  const enunciado = comAspas(pergunta.enunciado)
  if (pergunta.tipo === 'nota') {
    return `O que fez você dar a nota ${valor} para ${enunciado}?`
  }
  if (pergunta.tipo === 'estrelas') {
    const unidade = valor === 1 ? 'estrela' : 'estrelas'
    return `O que fez você dar ${valor} ${unidade} para ${enunciado}?`
  }
  if (pergunta.tipo === 'escolhaUnica') {
    const texto = pergunta.opcoes?.[valor] ?? 'essa opção'
    return `Por que "${texto}" descreve melhor sua resposta para ${enunciado}?`
  }
  if (pergunta.tipo === 'escolhaMultipla') {
    const { negativas } = perguntaExtraDe(pergunta)
    const textos = (valor || [])
      .filter((i) => negativas.includes(i))
      .map((i) => pergunta.opcoes?.[i])
      .filter(Boolean)
    const lista =
      textos.length > 1
        ? `${textos.slice(0, -1).join(', ')} e ${textos[textos.length - 1]}`
        : (textos[0] ?? 'essa opção')
    return `Por que você marcou "${lista}" em ${enunciado}?`
  }
  avisarValorDesconhecido('tipo de pergunta com extra condicional', pergunta.tipo)
  return `Por que você respondeu isso em ${enunciado}?`
}

/*
 * A pergunta extra em si — sintética, existe só na sessão de quem está
 * respondendo e no registro da resposta que a disparou. Nunca entra em
 * `pesquisa.perguntas`: não é uma pergunta da pesquisa, é uma pergunta desta
 * resposta.
 *
 * Sai como texto longo por padrão — é o tipo que combina com "por quê?" em
 * aberto —, mas o tipo não é fixo por regra nenhuma, só pela falta de um
 * motivo melhor agora. Não obrigatória: é um bônus, e travar o envio por
 * causa de uma pergunta que ninguém escreveu seria pior do que deixá-la
 * passar em branco.
 */
export function gerarPerguntaExtra(pergunta, valor) {
  return {
    id: `${pergunta.id}__extra`,
    tipo: 'respostaLonga',
    enunciado: textoDaPerguntaExtra(pergunta, valor),
    obrigatoria: false,
    extra: true,
    origemId: pergunta.id,
  }
}
