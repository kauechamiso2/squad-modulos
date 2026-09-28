import { semente } from './semente.js'
import {
  respostasDe,
  totalDeParticipantes,
  vagasRestantes,
} from './participacao.js'
import { avisarValorDesconhecido } from './desconhecido.js'

/*
 * Respostas simuladas.
 *
 * Não há backend coletando nada, então as respostas são inventadas — mas
 * ficam guardadas junto da pesquisa, em `respostas`, e são elas a verdade:
 * a taxa de resposta é o tamanho desta lista sobre o público, calculado na
 * hora de mostrar.
 *
 * Era ao contrário. A taxa era um número guardado que o motor subia sozinho,
 * e um passo de acerto refazia a lista para bater com ela. Isso desfazia
 * exclusões — o que fosse apagado voltava no acerto seguinte, porque a
 * porcentagem não tinha ficado sabendo — e, em público acima de 100 pessoas,
 * apagar uma resposta apagava duas, porque converter para porcentagem e
 * voltar não devolve o mesmo número.
 *
 * Agora quem cresce é a lista: o motor acrescenta gente, apagar tira gente, e
 * ninguém reconcilia nada com uma porcentagem depois.
 */

/* ---- textos por template ---- */

const CURTAS = {
  clima: [
    'Prazos apertados demais',
    'Falta de clareza nas prioridades',
    'Reuniões em excesso',
    'Nada em especial',
    'Time pequeno pro escopo',
    'Mudança de escopo em cima da hora',
    'Ferramentas lentas',
  ],
  feedback: [
    'O tempo para perguntas foi curto',
    'Gostei do formato',
    'A sala estava cheia demais',
    'Nada a apontar',
    'Faltou material para acompanhar',
    'O áudio falhou no começo',
  ],
  solicitacao: [
    'Não sei por onde abrir cada pedido',
    'A documentação está desatualizada',
    'Demora no retorno',
    'Está funcionando bem',
    'Faltou aviso quando o prazo mudou',
  ],
  desligamento: [
    'Falta de perspectiva de crescimento',
    'Desalinhamento com a liderança',
    'Proposta melhor fora',
    'Mudança de área de interesse',
    'Carga de trabalho acima do combinado',
  ],
}

const LONGAS = {
  clima: [
    'O que mais tem ajudado é a autonomia pra decidir como tocar as entregas. Quando as prioridades chegam claras, o time resolve rápido e sem atrito.',
    'Reduziria o número de reuniões recorrentes. Boa parte delas poderia ser uma mensagem, e o tempo picado atrapalha mais do que o volume de trabalho em si.',
    'A colaboração entre as áreas melhorou bastante nos últimos meses. Ainda falta previsibilidade nas mudanças de escopo, que costumam chegar em cima da hora.',
    'Sinto falta de um retorno mais frequente da liderança direta. Não precisa ser formal, só saber se o que estou priorizando é o que se espera.',
    'O clima do time é bom e as pessoas se ajudam. O que pesa é a quantidade de frentes abertas ao mesmo tempo, que faz tudo andar mais devagar do que poderia.',
  ],
  feedback: [
    'A parte de dinâmicas em grupo foi a mais útil. Saí com coisas que dá pra aplicar já na semana que vem, o que nem sempre acontece nesses encontros.',
    'O conteúdo foi bom, mas a duração passou do ponto. Depois da terceira hora fica difícil manter a atenção, e as últimas apresentações se perderam.',
    'Faltou espaço pra perguntas. As apresentações ocuparam quase todo o tempo e as dúvidas ficaram pro corredor.',
    'Organização impecável e material bem preparado. Repetiria e indicaria pra quem não pôde ir dessa vez.',
  ],
  solicitacao: [
    'Os processos funcionam quando a gente já sabe o caminho. O problema é quem chega agora e não tem como descobrir por onde começar sem perguntar pra alguém.',
    'O prazo combinado costuma ser cumprido. O que falha é o aviso quando ele muda — a gente só descobre cobrando.',
    'A documentação interna resolve a maior parte das dúvidas, mas várias páginas estão desatualizadas e levam pro processo antigo.',
    'Sinto apoio das áreas de suporte quando consigo falar com a pessoa certa. Achar a pessoa certa é a parte difícil.',
  ],
  desligamento: [
    'Aprendi bastante no tempo em que estive aqui e saio em bons termos. O que faltou foi uma conversa clara sobre para onde a carreira poderia ir daqui.',
    'A liderança direta foi presente e acessível. A decisão veio mais por uma oportunidade fora do que por algo que tenha acontecido aqui.',
    'As atividades foram mudando bastante em relação ao que a gente tinha combinado na entrada, e isso pesou na decisão.',
    'O processo de entrada foi confuso e demorei pra entender o que se esperava de mim. Depois melhorou, mas a primeira impressão ficou.',
  ],
}

/*
 * O banco de texto de um template.
 *
 * Quatro deles têm banco próprio. A pesquisa em branco não parte de tema
 * nenhum e não tem — as respostas simuladas dela saem do banco de clima, o
 * mais genérico dos quatro. Isso é escolha declarada, e não substituição
 * escondida: só template fora desta lista é anomalia, e essa é anunciada.
 */
const SEM_BANCO_PROPRIO = new Set(['blank', null, undefined, ''])

const paraTema = (mapa, template) => {
  if (Object.prototype.hasOwnProperty.call(mapa, template)) return mapa[template]
  if (!SEM_BANCO_PROPRIO.has(template)) {
    avisarValorDesconhecido('template da pesquisa', template)
  }
  return mapa.clima
}

/*
 * Escolha com peso, guiada pelo hash. As distribuições não são uniformes de
 * propósito: participação real se concentra no meio-alto da escala, e uma
 * escala uniforme deixaria os gráficos com cara de dado sintético.
 */
function sortear(chave, pesos) {
  const soma = pesos.reduce((a, b) => a + b, 0)
  let n = semente(chave) % soma
  for (let i = 0; i < pesos.length; i += 1) {
    if (n < pesos[i]) return i
    n -= pesos[i]
  }
  return pesos.length - 1
}

/* Curva com o pico deslocado para cima: poucas notas baixas, massa no 3-4. */
function pesosDeEscala(quantidade) {
  return Array.from({ length: quantidade }, (_, i) => {
    const posicao = i / Math.max(1, quantidade - 1)
    return Math.round(1 + 20 * Math.exp(-((posicao - 0.72) ** 2) / 0.06))
  })
}

/* As primeiras opções pesam mais: é a ordem em que foram escritas. */
const pesosDeOpcoes = (quantidade) =>
  Array.from({ length: quantidade }, (_, i) => Math.max(1, quantidade - i + 2))

/* Um valor de resposta a partir de uma chave. Exportado porque a tela do
   ciclo gera os dela com a mesma regra, só trocando a chave. */
export function gerarValor(chave, pergunta, template) {
  switch (pergunta.tipo) {
    case 'nota': {
      const passos = (pergunta.maximo ?? 5) + 1
      return sortear(chave, pesosDeEscala(passos))
    }
    case 'estrelas':
      return 1 + sortear(chave, pesosDeEscala(5))
    case 'escolhaUnica':
      return sortear(chave, pesosDeOpcoes(pergunta.opcoes?.length ?? 1))
    case 'escolhaMultipla': {
      const total = pergunta.opcoes?.length ?? 0
      // Uma sempre marcada; as outras entram com um terço de chance cada.
      const marcadas = new Set([sortear(chave, pesosDeOpcoes(total))])
      for (let i = 0; i < total; i += 1) {
        if (semente(`${chave}:${i}`) % 3 === 0) marcadas.add(i)
      }
      return [...marcadas].sort((a, b) => a - b)
    }
    case 'respostaCurta': {
      const pool = paraTema(CURTAS, template)
      return pool[semente(chave) % pool.length]
    }
    case 'respostaLonga': {
      const pool = paraTema(LONGAS, template)
      return pool[semente(chave) % pool.length]
    }
    default:
      return null
  }
}

/* Uma pessoa e tudo o que ela respondeu. O id é estável para a exclusão poder
   apontar para alguém em vez de para uma posição na lista. */
function criarResposta(p, ordem, agora = new Date()) {
  const chaveBase = `${p.id}:r${ordem}`
  return {
    id: `${p.id}_r${ordem}`,
    em: agora.toISOString(),
    valores: Object.fromEntries(
      (p.perguntas || []).map((q) => [
        q.id,
        gerarValor(`${chaveBase}:${q.id}`, q, p.template),
      ]),
    ),
  }
}

/*
 * Acrescenta `quantas` respostas simuladas ao fim da lista. É por aqui que a
 * simulação do motor cresce: gente entrando, e não uma porcentagem subindo.
 *
 * A ordem de cada uma é a posição na lista, e é dela que sai a chave do
 * hash — então quem já está lá nunca muda de conteúdo quando chega mais
 * alguém.
 */
export function crescer(p, quantas, agora = new Date()) {
  const cabem = Math.min(quantas, vagasRestantes(p))
  if (cabem < 1) return p
  const atuais = respostasDe(p)
  const novas = Array.from({ length: cabem }, (_, i) =>
    criarResposta(p, atuais.length + i, agora),
  )
  return { ...p, respostas: [...atuais, ...novas] }
}

/*
 * Converte uma pesquisa guardada no formato antigo, uma vez só.
 *
 * Antes, a participação era uma `taxa` guardada e um `taxaEm` marcando quando
 * ela subiu pela última vez; a lista de respostas só era materializada quando
 * alguém abria o detalhe, e muitas pesquisas não tinham nenhuma. A conversão
 * transforma a taxa velha na lista do tamanho que ela dizia — a pesquisa
 * continua mostrando a mesma porcentagem de antes — e tira os dois campos do
 * registro, deixando o relógio da simulação com o nome que ele tem agora.
 *
 * Lista ausente e lista vazia não são a mesma coisa: `[]` é ninguém ter
 * respondido, ou alguém ter apagado tudo, e nesse caso não há o que
 * materializar.
 */
export function materializar(p, agora = new Date()) {
  if (!p) return p
  const convertida =
    Array.isArray(p.respostas) && p.taxa === undefined && p.taxaEm === undefined
  if (convertida) return p

  const antiga = { ...p, taxa: undefined, taxaEm: undefined }
  if (p.taxaEm && !p.simuladoEm) antiga.simuladoEm = p.taxaEm
  if (Array.isArray(p.respostas)) return antiga

  /* Rascunho e agendada não têm respostas: o link só aceita com o ciclo
     correndo, e o motor só faz a simulação crescer aí. Taxa velha guardada
     numa delas era incoerência da versão anterior, e materializá-la criava
     respostas que a poda apagava logo em seguida — dado inventado e jogado
     fora no mesmo passo. */
  if (p.status === 'rascunho' || p.status === 'agendada') {
    return { ...antiga, respostas: [] }
  }

  const quantas = Math.round(
    ((p.taxa ?? 0) / 100) * totalDeParticipantes(p.participantes),
  )
  return crescer({ ...antiga, respostas: [] }, quantas, agora)
}

/*
 * As duas coisas que a lista não pode contrariar.
 *
 * A primeira é o status: uma pesquisa que ainda não saiu — rascunho ou
 * agendada — não tem respostas, e é o que os cartões do Geral dizem.
 *
 * A segunda é o público: mais respostas do que convidados não existe, então
 * um público que encolhe encolhe a lista junto. É a mesma regra que o
 * histórico já aplica a cada ciclo fechado.
 *
 * É a única poda que sobrou, e ela olha o status e o público — nunca uma
 * porcentagem. Nada aqui repõe o que foi apagado.
 */
export function aparar(p) {
  if (!p) return p
  const atuais = respostasDe(p)
  /* Havia aqui uma segunda poda, que esvaziava a lista de rascunho e de
     agendada. Ela existia para o tempo em que o link aceitava resposta de uma
     agendada: a resposta entrava e sumia na poda seguinte, com a tela de
     agradecimento já dada. Hoje `aceitandoRespostas` exige o ciclo correndo,
     a simulação só cresce aí, e `materializar` não converte taxa velha dessas
     duas — não há caminho que ponha resposta numa delas, e a poda só poderia
     apagar em silêncio algo que não deveria existir. */
  const total = totalDeParticipantes(p.participantes)
  if (atuais.length <= total) return p
  return { ...p, respostas: atuais.slice(0, total) }
}

/*
 * Uma resposta de verdade, enviada pela vista de quem responde. Entra na
 * mesma lista das simuladas, no fim, e a taxa sobe sozinha porque é contada
 * dela.
 *
 * `extras` são as perguntas condicionais que dispararam nesta sessão — a
 * "pergunta extra quando a resposta for negativa" (lib/perguntaExtra.js).
 * Elas não existem em `p.perguntas`: são sintéticas, nascidas da resposta que
 * as disparou, e só esta resposta sabe qual foi o enunciado gerado. Sem
 * guardar isso aqui, a aba Respostas não teria como mostrar o que foi
 * perguntado — só o texto que a pessoa escreveu, sem a pergunta que ele
 * respondia.
 */
export function adicionarResposta(p, valores, extras = [], agora = new Date()) {
  return {
    ...p,
    respostas: [
      ...respostasDe(p),
      {
        id: `${p.id}_r${agora.getTime().toString(36)}`,
        em: agora.toISOString(),
        valores,
        ...(extras.length ? { extras } : {}),
      },
    ],
  }
}

/* Apagar é só tirar da lista. Nada recalcula, nada repõe: a taxa cai porque
   ela é a contagem desta lista. */
export function removerResposta(p, idResposta) {
  return { ...p, respostas: respostasDe(p).filter((r) => r.id !== idResposta) }
}

export function limparRespostas(p) {
  return { ...p, respostas: [] }
}

/* ---- o valor guardado e o tipo da pergunta ---- */

/*
 * Um valor combina com a pergunta?
 *
 * Cada tipo guarda um formato: nota e estrelas guardam um número dentro da
 * escala, seleção única um índice da lista de opções, múltipla uma lista de
 * índices, e os dois textos uma string. Trocar o tipo de uma pergunta não
 * mexia no que já tinha sido respondido, e as telas desenhavam o valor velho
 * como se fosse do tipo novo: `marcadas.includes(...)` sobre um número
 * derrubava a aba Respostas inteira, e as trocas que não quebravam mostravam
 * coisa errada em silêncio — a nota 3 virava a terceira opção marcada.
 *
 * Este é o portão: o que não combina não é desenhado nem exportado, e conta
 * como não respondido. Vale para as pesquisas que já estão guardadas com
 * valores trocados, sem precisar mexer nelas.
 */
export function valorCombina(valor, pergunta) {
  if (valor === undefined || valor === null || !pergunta) return false
  switch (pergunta.tipo) {
    case 'nota':
      return Number.isInteger(valor) && valor >= 0 && valor <= (pergunta.maximo ?? 5)
    case 'estrelas':
      return Number.isInteger(valor) && valor >= 1 && valor <= 5
    case 'escolhaUnica':
      return (
        Number.isInteger(valor) && valor >= 0 && valor < (pergunta.opcoes?.length ?? 0)
      )
    case 'escolhaMultipla':
      return (
        Array.isArray(valor) &&
        valor.every(
          (i) => Number.isInteger(i) && i >= 0 && i < (pergunta.opcoes?.length ?? 0),
        )
      )
    case 'respostaCurta':
    case 'respostaLonga':
      return typeof valor === 'string'
    default:
      return false
  }
}

const TEXTOS = ['respostaCurta', 'respostaLonga']

/*
 * O que sobrevive a uma troca de tipo.
 *
 * Só migra o que quer dizer a mesma coisa dos dois lados:
 *
 *  - escolha única vira múltipla com aquela escolha marcada, e a múltipla com
 *    uma marca só vira essa escolha única;
 *  - texto curto e texto longo guardam a mesma coisa, então o que foi escrito
 *    atravessa inteiro — cortar no limite do campo novo apagaria parte do que
 *    a pessoa disse, e o limite vale para quem escreve, não para o que já
 *    está escrito.
 *
 * O resto não tem tradução, e o perigo não é só quebrar: a nota 4 caberia
 * como índice numa lista de cinco opções e passaria a marcar a quarta, que é
 * uma resposta que ninguém deu. Sem tradução, vira não respondido — que é o
 * que de fato aconteceu com a pergunta que está lá agora.
 */
function migrarValor(valor, de, para) {
  if (de === 'escolhaUnica' && para === 'escolhaMultipla') {
    return Number.isInteger(valor) ? [valor] : undefined
  }
  if (de === 'escolhaMultipla' && para === 'escolhaUnica') {
    return Array.isArray(valor) && valor.length === 1 ? valor[0] : undefined
  }
  if (TEXTOS.includes(de) && TEXTOS.includes(para)) return valor
  return undefined
}

/*
 * Acerta as respostas guardadas de uma pergunta que mudou.
 *
 * Roda na gravação da pergunta, e não na leitura: assim o que fica guardado
 * combina com o que a pesquisa pergunta hoje, em vez de depender de todo
 * leitor lembrar de desconfiar. O portão da leitura continua de pé para o que
 * já estava guardado errado.
 */
export function acertarRespostasDaPergunta(p, pergunta, tipoAnterior) {
  const respostas = respostasDe(p)
  if (!respostas.length) return p
  const mesmoTipo = tipoAnterior === undefined || tipoAnterior === pergunta.tipo

  const acertadas = respostas.map((r) => {
    const antes = r.valores?.[pergunta.id]
    if (antes === undefined) return r
    const migrado = mesmoTipo
      ? antes
      : migrarValor(antes, tipoAnterior, pergunta.tipo)
    if (valorCombina(migrado, pergunta)) {
      return migrado === antes ? r : { ...r, valores: { ...r.valores, [pergunta.id]: migrado } }
    }
    /* Não tem tradução: sai do registro, e a pergunta fica sem resposta desta
       pessoa. Tirar a chave é diferente de guardar vazio — vazio seria dizer
       que ela respondeu nada. */
    const { [pergunta.id]: _fora, ...resto } = r.valores || {}
    return { ...r, valores: resto }
  })

  return acertadas.every((r, i) => r === respostas[i])
    ? p
    : { ...p, respostas: acertadas }
}

/* ---- leitura ---- */

/* O que a pessoa respondeu numa pergunta, no formato que CorpoDaResposta lê.
   Valor que não combina com o tipo de hoje conta como não respondido. */
export function valorDe(resposta, pergunta) {
  if (!resposta || !pergunta) return null
  const valor = resposta.valores?.[pergunta.id]
  if (!valorCombina(valor, pergunta)) return null
  return { tipo: pergunta.tipo, valor }
}

/* ---- arquivos ---- */

/* Como a resposta aparece no arquivo: o texto, não o índice. O que não
   combina com o tipo de hoje sai como célula vazia, pelo mesmo motivo que não
   é desenhado na tela. */
function paraTexto(pergunta, valor) {
  if (!valorCombina(valor, pergunta)) return ''
  switch (pergunta.tipo) {
    case 'escolhaUnica':
      return pergunta.opcoes?.[valor] ?? ''
    case 'escolhaMultipla':
      return (valor || []).map((i) => pergunta.opcoes?.[i] ?? '').join('; ')
    case 'estrelas':
      return `${valor} de 5`
    case 'nota':
      return `${valor} de ${pergunta.maximo ?? 5}`
    default:
      return String(valor)
  }
}

/* Aspas dobradas e campo entre aspas: o suficiente para os textos livres, que
   têm vírgula e podem ter quebra de linha. */
const celula = (t) => `"${String(t).replaceAll('"', '""')}"`

export function paraCsv(p, respostas) {
  const perguntas = p.perguntas || []
  const cabecalho = ['Resposta', ...perguntas.map((q) => q.enunciado)]
  const linhas = respostas.map((r, i) => [
    `Resposta ${i + 1}`,
    ...perguntas.map((q) => paraTexto(q, r.valores?.[q.id])),
  ])
  // BOM na frente: sem ele o Excel abre os acentos errados.
  return `﻿${[cabecalho, ...linhas].map((l) => l.map(celula).join(',')).join('\r\n')}\r\n`
}

/* Nome de arquivo a partir do nome da pesquisa, sem acento nem espaço. */
export function nomeDeArquivo(p, sufixo) {
  const base = (p.nome || 'pesquisa')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
  return `${base}-${sufixo}.csv`
}

/*
 * Monta o arquivo e entrega, dizendo se deu certo.
 *
 * Montar um CSV lê todas as respostas de todas as perguntas, e um dado
 * inesperado ali derrubava a geração em silêncio: o menu fechava, nada
 * baixava e ninguém ficava sabendo. Falhar calado não serve — quem chama
 * mostra o aviso com o `false`.
 */
export function gerarEBaixar(nome, montarConteudo) {
  try {
    baixar(nome, montarConteudo())
    return true
  } catch {
    return false
  }
}

export function baixar(nome, conteudo) {
  const url = URL.createObjectURL(
    new Blob([conteudo], { type: 'text/csv;charset=utf-8' }),
  )
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Solta o blob depois do clique; antes disso o download ainda não começou.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
