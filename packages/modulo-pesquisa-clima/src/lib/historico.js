import { entre, semente } from './semente.js'
import { totalDeParticipantes } from './participacao.js'
import {
  fimDoCiclo,
  formatarMedio,
  formatarPeriodo,
  proximoCiclo,
  somarDias,
} from './datas.js'
import { ehRecorrente } from './pesquisas.js'
import { gerarValor } from './respostas.js'
import { alteracoesDoCiclo } from './alteracoes.js'

/*
 * Ciclos já encerrados de uma pesquisa.
 *
 * Cada ciclo entra em `historico` no instante em que fecha, com o que ele de
 * fato colheu — quem escreve é `fecharCiclo`, em lib/pesquisas.js. O registro
 * é um retrato: as perguntas como estavam, as respostas daquele ciclo, o
 * público que ele tinha e as datas de verdade. Depois de escrito, ninguém o
 * recalcula. Sem isso, editar uma pergunta hoje reescreveria o que foi
 * perguntado há três meses, e as datas andavam a cada passada do motor.
 *
 * Este arquivo só preenche buraco: ciclo que fechou antes de o motor passar a
 * guardar o retrato não deixou medida nenhuma, e a linha dele é reconstruída
 * por hash, como a aba Ciclos inteira era antes. O que nasce daqui para a
 * frente nunca passa por essa reconstrução.
 *
 * Quantos ciclos existem e a numeração deles saem de `ciclos`, o mesmo número
 * que o cartão do Geral mostra. O ciclo em curso nunca entra — a lista é do
 * que já fechou.
 */

/* Quantos ciclos já fecharam. É o próprio `ciclos`: ele anda quando um ciclo
   fecha, não quando começa, então o que está rodando agora ainda não entrou
   na conta. */
export const ciclosFechados = (p) => p.ciclos ?? 0

/* O número do ciclo que o cartão de cima do Geral está mostrando: o em curso
   quando ela roda, o último fechado quando ela está entre ciclos. */
const cicloEmCartaz = (p) =>
  (p.ciclos ?? 0) + (p.status === 'rodando' ? 1 : 0)

/*
 * Anda para trás a partir do início do ciclo atual, um passo de frequência
 * por ciclo. Única não recorre, então cai no passo de um mês só para as datas
 * não empilharem no mesmo dia.
 */
function iniciosAnteriores(p, quantos) {
  const base = p.cicloInicio ? new Date(p.cicloInicio) : new Date()
  const frequencia = ehRecorrente(p) ? p.configuracao?.frequencia : 'Mensal'
  const datas = []
  let atual = base
  for (let i = 0; i < quantos; i += 1) {
    /* proximoCiclo anda para a frente; para trás é o mesmo salto invertido.
       Frequência estranha cai no passo de um mês, o mesmo que a Única usa
       logo acima: estas datas já são reconstrução declarada, e sem passo
       nenhum os ciclos ficariam sem data. O valor estranho já foi anunciado
       no console por quem consultou a tabela. */
    const seguinte =
      proximoCiclo(atual, frequencia) ?? proximoCiclo(atual, 'Mensal')
    const salto = seguinte - atual
    atual = new Date(atual.getTime() - salto)
    datas.push(atual)
  }
  return datas
}

/*
 * Reconstrói um ciclo do qual não sobrou medida: os que fecharam antes de o
 * motor passar a guardar o retrato. Tudo aqui é inventado a partir do hash da
 * pesquisa — e por isso este caminho não serve para ciclo novo nenhum.
 */
function criarCiclo(p, numero, inicio) {
  const chave = `${p.id}:ciclo${numero}`

  /* Uma faixa por ciclo, espalhadas pela escala de cor em vez de todas na
     mesma. O resto sai do hash. */
  const faixas = [
    [82, 100],
    [70, 79],
    [22, 45],
    [88, 100],
    [60, 78],
  ]
  const [min, max] = faixas[numero % faixas.length]
  const taxa = entre(`${chave}:taxa`, min, max)

  /* Encerrado antes do prazo: a pesquisa foi pausada no meio do ciclo.
     Acontece em um a cada quatro, e aí o ciclo dura 2 dias em vez do prazo
     inteiro. */
  const cedo = semente(`${chave}:cedo`) % 4 === 0
  const fim = somarDias(inicio, cedo ? 2 : 7)

  /* O retrato das perguntas: cópia, não referência. Editar a pesquisa depois
     não pode mudar o que foi perguntado neste ciclo. */
  const perguntas = (p.perguntas || []).map((q) => ({ ...q }))

  /* Convidados são o público da pesquisa, o mesmo número que o cartão do
     Geral usa. Um fixo aqui fazia as duas telas contarem sobre bases
     diferentes: "29 de 32" de um lado, "17 de 56" do outro. */
  const convidados = totalDeParticipantes(p.participantes)
  const responderam = Math.round((taxa / 100) * convidados)
  const respostas = Array.from({ length: responderam }, (_, i) => ({
    id: `${p.id}_c${numero}_r${i}`,
    valores: Object.fromEntries(
      perguntas.map((q) => [
        q.id,
        gerarValor(`${chave}:r${i}:${q.id}`, q, p.template),
      ]),
    ),
  }))

  return {
    id: `${p.id}_c${numero}`,
    numero,
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
    taxa,
    cedo,
    convidados,
    perguntas,
    respostas,
  }
}

/*
 * Acerta o histórico guardado com quantos ciclos já fecharam. Devolve a
 * própria pesquisa quando não há nada a fazer, para quem chama saber que não
 * precisa gravar.
 *
 * Acerta também o público de cada ciclo. Ele é da pesquisa, não do ciclo:
 * mudou o público — ou o ciclo veio de quando o histórico usava um número
 * fixo —, a taxa dele passa a contar sobre o público de verdade.
 *
 * Só o denominador muda, e a lista de respostas nunca cresce aqui: apagar as
 * de um ciclo continua durando. Ela só encolhe quando passou a ter mais
 * respostas do que convidados, que é uma conta que não existe.
 */
export function sincronizarHistorico(p) {
  if (!p) return p
  const quantos = ciclosFechados(p)
  const atuais = p.historico || []
  const guardado = (numero) => atuais.find((c) => c.numero === numero)

  /* Já tem um retrato para cada ciclo fechado: nada a fazer. Devolver a
     própria pesquisa é o que diz a quem chamou que não precisa gravar. */
  const faltando = []
  for (let numero = 1; numero <= quantos; numero += 1) {
    if (!guardado(numero)) faltando.push(numero)
  }
  const sobrando = atuais.some((c) => c.numero > quantos)
  if (!faltando.length && !sobrando) return p

  /*
   * Preenche o que falta — só ciclo fechado antes de o motor passar a guardar
   * o retrato; os de agora nascem prontos em `fecharCiclo` e nunca passam por
   * aqui.
   *
   * Do último deles ainda dá para saber a verdade: enquanto a pesquisa não
   * abre o ciclo seguinte, ela continua carregando as respostas e as datas
   * daquele que fechou. É o que `recuperarUltimo` aproveita, e é o que fazia o
   * Geral e a aba Ciclos discordarem sobre o mesmo ciclo. Dos anteriores não
   * sobrou medida nenhuma, e a linha é reconstruída por hash, como sempre foi.
   */
  const real = recuperarUltimo(p, quantos)
  const inicios = iniciosAnteriores(p, quantos)
  /* `inicios` anda para trás a partir de `cicloInicio`. Com o último ciclo
     recuperado, `cicloInicio` é o começo dele, e o passo 0 é o ciclo de
     antes; sem recuperação, `cicloInicio` é o do ciclo em curso, e o passo 0
     é o próprio `quantos`. */
  const desloca = real ? 1 : 0
  const novos = []
  for (let numero = 1; numero <= quantos; numero += 1) {
    const pronto =
      guardado(numero) ?? (numero === quantos ? real : null)
    novos.push(pronto ?? criarCiclo(p, numero, inicios[quantos - numero - desloca]))
  }
  return { ...p, historico: novos }
}

/*
 * O retrato do último ciclo fechado, tirado do que a pesquisa ainda carrega.
 *
 * Vale enquanto ela não abriu o ciclo seguinte: aí `respostas`, `cicloInicio`
 * e `cicloFim` ainda são os dele. Rodando, não — a lista é do ciclo aberto, e
 * o que fechou antes já se perdeu.
 */
function recuperarUltimo(p, quantos) {
  if (quantos < 1 || p.status === 'rodando') return null
  if (!p.cicloInicio || !p.cicloFim) return null
  const inicio = new Date(p.cicloInicio)
  const fim = new Date(p.cicloFim)
  const prazo = fimDoCiclo(inicio, p.configuracao?.prazo)
  return {
    id: `${p.id}_c${quantos}`,
    numero: quantos,
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
    cedo: Boolean(prazo && fim < prazo),
    convidados: totalDeParticipantes(p.participantes),
    perguntas: (p.perguntas || []).map((q) => ({ ...q })),
    respostas: (p.respostas || []).map((r) => ({ ...r })),
  }
}

/* A lista para a tabela, do mais novo para o mais velho, já com as datas
   escritas do jeito que a tela mostra. */
export function historicoDe(p) {
  return (p.historico || []).map((c) => ({
    ...c,
    envio: formatarMedio(c.inicio),
    encerrado: formatarMedio(c.fim),
    taxa: taxaDoCiclo(c),
    /* Contado do registro de alterações, não guardado no ciclo: quem edita
       hoje uma pesquisa cujo ciclo ainda não fechou precisa ver o número
       subir quando ele fechar. */
    alteracoes: alteracoesDoCiclo(p, c.numero).length,
  }))
}

/*
 * Os ciclos fechados como o cartão "Taxa de resposta anterior" do Geral
 * precisa deles: do mais novo para o mais velho, cada um já com o rótulo do
 * seletor e as frases do cartão.
 *
 * Não entra o que o cartão de cima já mostra — o ciclo em curso quando ela
 * roda, o último fechado quando está entre ciclos —, porque os dois cartões
 * não podem falar do mesmo.
 *
 * Os números são os do próprio ciclo, que são os mesmos que a tabela da aba
 * Ciclos conta — e o público é o da pesquisa, o mesmo do cartão de cima.
 */
export function taxasAnteriores(p) {
  if (!ehRecorrente(p)) return []
  const publico = totalDeParticipantes(p.participantes)
  return historicoDe(p)
    .filter((c) => c.numero < cicloEmCartaz(p))
    .sort((a, b) => b.numero - a.numero)
    .map((c) => ({
      numero: c.numero,
      titulo: 'Taxa de resposta anterior',
      periodo: formatarPeriodo(c.inicio),
      taxa: c.taxa,
      principal: `${c.respostas?.length ?? 0} de ${c.convidados ?? publico} responderam essa pesquisa.`,
      apoio: `Encerrada em ${formatarMedio(c.fim)}`,
    }))
}

/* A taxa que a tabela mostra vem das respostas guardadas, não do número que
   sorteou o ciclo: apagar as respostas tem de derrubar a taxa junto, senão a
   linha da aba Ciclos diria 71% para um ciclo com zero respostas. */
export function taxaDoCiclo(ciclo) {
  const convidados = ciclo.convidados || 0
  if (!convidados) return 0
  return Math.round(((ciclo.respostas?.length ?? 0) / convidados) * 100)
}

/* ---- ordenação ---- */

export const COLUNAS = [
  { id: 'numero', nome: 'Ciclo', ordenavel: true },
  { id: 'inicio', nome: 'Data de Envio', ordenavel: true },
  { id: 'fim', nome: 'Encerrado em', ordenavel: true },
  { id: 'taxa', nome: 'Taxa de Resposta', ordenavel: true },
  { id: 'atividade', nome: 'Atividade', ordenavel: false },
]

/* Datas comparam como texto ISO, que já ordena certo; número compara como
   número. Sem localeCompare porque nenhuma coluna ordenável é texto livre. */
export function ordenar(ciclos, coluna, crescente) {
  const sinal = crescente ? 1 : -1
  return [...ciclos].sort((a, b) => {
    const x = a[coluna]
    const y = b[coluna]
    if (x === y) return 0
    return (x > y ? 1 : -1) * sinal
  })
}
