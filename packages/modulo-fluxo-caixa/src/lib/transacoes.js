import { CHAVES, ler, gravar, gerarId } from './armazenamento.js'
import { hojeIso, somarDias, somarMeses, paraData, diaUtilMaisProximo, iso, MESES_CURTOS } from './datas.js'
import * as Series from './series.js'

/*
 * transacao {
 *   id, tipo: 'entrada'|'saida', nome, valorCentavos, categoriaId,
 *   contatoId|null, status, data: 'YYYY-MM-DD',
 *   repete: 'nao'|'diario'|'semanal'|'mensal', serieId|null, observacao, criadoEm
 * }
 */

export function listar() {
  return ler(CHAVES.TRANSACOES, [])
}

export function substituir(lista) {
  return gravar(CHAVES.TRANSACOES, lista)
}

/*
 * Janelas de repeticao. Uma repeticao sem fim geraria linhas infinitas; o
 * modulo materializa uma janela e para. Os numeros vem do enunciado.
 */
const JANELA = { diario: 30, semanal: 12, mensal: 12 }

/*
 * A i-esima ocorrencia de uma serie.
 *
 * Semanal cai sempre no mesmo dia da semana da data escolhida, porque somar
 * multiplos de 7 preserva o dia (anotacao 2279:97359: "como selecionei dia 16
 * de marco que e uma segunda-feira ... se repetiria toda segunda").
 *
 * Mensal segue a regra guardada na serie (anotacao 2279:97360 e o painel de
 * configuracoes avancadas em 2279:96831):
 *   'dia_fixo'  - sempre o mesmo dia do mes
 *   'dia_util'  - o mesmo dia, ou o dia util mais proximo quando ele cai em
 *                 fim de semana ou feriado nacional
 * Nos dois casos, um mes sem o dia escolhido (31 em abril) usa o ultimo dia do
 * mes, que ja e o que somarMeses faz.
 */
function proximaData(data, repete, i, regraMensal = 'dia_fixo') {
  if (repete === 'diario') return somarDias(data, i)
  if (repete === 'semanal') return somarDias(data, i * 7)
  if (repete === 'mensal') {
    const bruta = somarMeses(data, i)
    return regraMensal === 'dia_util' ? diaUtilMaisProximo(bruta) : bruta
  }
  return data
}

/*
 * Gera a transacao e, se repete, as proximas ocorrencias da janela. Todas com
 * o mesmo serieId, que e o que permite "remover todas as proximas" depois.
 */
export function criar(dados) {
  const lista = listar()
  const criadoEm = new Date().toISOString()
  const base = { ...dados, id: gerarId(), criadoEm, serieId: null }

  if (!dados.repete || dados.repete === 'nao') {
    const nova = [...lista, base]
    return { ok: substituir(nova), lista: nova, criada: base }
  }

  const serieId = gerarId('serie')
  const ocorrencias = []
  const total = JANELA[dados.repete] ?? 1
  for (let i = 0; i < total; i++) {
    ocorrencias.push({
      ...dados,
      id: i === 0 ? base.id : gerarId(),
      criadoEm,
      serieId,
      data: proximaData(dados.data, dados.repete, i, dados.regraMensal),
    })
  }
  const nova = [...lista, ...ocorrencias]
  return { ok: substituir(nova), lista: nova, criada: ocorrencias[0] }
}

export function atualizar(id, mudancas) {
  const nova = listar().map((t) => (t.id === id ? { ...t, ...mudancas } : t))
  return { ok: substituir(nova), lista: nova }
}

export function remover(id) {
  const nova = listar().filter((t) => t.id !== id)
  return { ok: substituir(nova), lista: nova }
}

export function removerVarias(ids) {
  const conjunto = new Set(ids)
  const nova = listar().filter((t) => !conjunto.has(t.id))
  return { ok: substituir(nova), lista: nova }
}

/* "Todas as próximas": remove as da mesma serie com data >= a da removida. */
export function removerSerieAPartirDe(id) {
  const lista = listar()
  const alvo = lista.find((t) => t.id === id)
  if (!alvo || !alvo.serieId) return remover(id)
  const nova = lista.filter(
    (t) => !(t.serieId === alvo.serieId && t.data >= alvo.data),
  )
  return { ok: substituir(nova), lista: nova }
}

/*
 * Ocorrencia futura: tem data depois de hoje. Aparece com o icone de relogio e
 * fica fora dos totais ate a data chegar (Figma 2279:100465).
 */
export const ehFutura = (t, hoje = hojeIso()) => t.data > hoje

const PENDENTES = new Set(['a_receber', 'a_pagar'])

/* Ainda nao confirmada: o status continua no "a receber"/"a pagar". */
export const ehPendente = (t) => PENDENTES.has(t.status)

/*
 * A data chegou mas ninguem confirmou o recebimento. A anotacao 2279:96454 diz
 * que nesse caso "fica com (i) de atencao e o preco continua em laranja", e a
 * 2279:96453 explica por que nao entra no verde: o dinheiro ainda nao entrou.
 */
export const aguardandoConfirmacao = (t, hoje = hojeIso()) =>
  !ehFutura(t, hoje) && ehPendente(t)

/* Laranja: futura ou esperando confirmacao. Nos dois casos fica fora do saldo. */
export const foraDoSaldo = (t, hoje = hojeIso()) => ehFutura(t, hoje) || ehPendente(t)

/* Confirma o recebimento/pagamento: o valor passa a contar no saldo do mes. */
export function confirmar(id) {
  const lista = listar()
  const nova = lista.map((t) =>
    t.id === id
      ? { ...t, status: t.tipo === 'entrada' ? 'recebido' : 'pago' }
      : t,
  )
  return { ok: substituir(nova), lista: nova }
}

/* Totais do periodo: so o que ja aconteceu e foi confirmado conta. */
export function totais(transacoes, hoje = hojeIso()) {
  let entradas = 0
  let saidas = 0
  transacoes.forEach((t) => {
    if (foraDoSaldo(t, hoje)) return
    if (t.tipo === 'entrada') entradas += t.valorCentavos
    else saidas += t.valorCentavos
  })
  return { entradas, saidas, lucro: entradas - saidas }
}

/*
 * Serie diaria para o grafico de area do card expandido. Um ponto por dia do
 * intervalo, com a soma do dia (nao acumulada) - e o que o Figma desenha.
 */
/*
 * Serie ACUMULADA para o grafico do card expandido (Figma 2241:46998).
 *
 * Cada ponto e o total do periodo ate aquele dia - nao o movimento do dia. E o
 * que o Figma desenha: uma curva que sobe ao longo do mes, nao um serrilhado.
 *
 * Todos os dias do periodo entram, inclusive os futuros: o eixo mostra o mes
 * inteiro. Quem e futuro vem marcado, e a linha para no ultimo dia ja vivido.
 *
 * Acima de 31 dias o ponto passa a ser mensal, senao o eixo vira uma parede de
 * rotulos ilegiveis.
 */
export function serieAcumulada(transacoes, tipo, inicio, fim, hoje = hojeIso()) {
  const valorDe = (t) => {
    if (tipo === 'lucro') return t.tipo === 'entrada' ? t.valorCentavos : -t.valorCentavos
    return t.tipo === tipo ? t.valorCentavos : 0
  }
  const soma = new Map()
  transacoes.forEach((t) => {
    if (foraDoSaldo(t, hoje)) return
    soma.set(t.data, (soma.get(t.data) ?? 0) + valorDe(t))
  })

  const dias = []
  const d = paraData(inicio)
  const ate = paraData(fim)
  while (d <= ate) {
    dias.push(iso(d))
    d.setDate(d.getDate() + 1)
    if (dias.length > 800) break
  }
  if (!dias.length) return []

  const porMes = dias.length > 31
  const grupos = porMes
    ? [...new Set(dias.map((x) => x.slice(0, 7)))]
    : dias

  let acumulado = 0
  return grupos.map((grupo) => {
    const doGrupo = porMes ? dias.filter((x) => x.startsWith(grupo)) : [grupo]
    doGrupo.forEach((x) => { acumulado += soma.get(x) ?? 0 })
    const ultimo = doGrupo[doGrupo.length - 1]
    return {
      data: ultimo,
      rotulo: porMes
        ? MESES_CURTOS[paraData(ultimo).getMonth()]
        : String(paraData(ultimo).getDate()).padStart(2, '0'),
      valor: acumulado,
      /* Futuro = comeca depois de hoje. O grupo do mes corrente nao e futuro. */
      futuro: doGrupo[0] > hoje,
    }
  })
}


/*
 * "Entradas comuns em {categoria}": as 3 combinacoes valor+contato mais
 * frequentes daquela categoria (Figma 2279:94789).
 */
export function combinacoesFrequentes(transacoes, tipo, categoriaId, quantas = 3) {
  const contagem = new Map()
  transacoes
    .filter((t) => t.tipo === tipo && t.categoriaId === categoriaId)
    .forEach((t) => {
      const chave = `${t.valorCentavos}|${t.contatoId ?? ''}`
      const atual = contagem.get(chave) ?? { valorCentavos: t.valorCentavos, contatoId: t.contatoId, n: 0 }
      atual.n += 1
      contagem.set(chave, atual)
    })
  return [...contagem.values()].sort((a, b) => b.n - a.n).slice(0, quantas)
}

export const STATUS_ENTRADA = [
  { id: 'recebido', rotulo: 'Recebido' },
  { id: 'a_receber', rotulo: 'A receber' },
]
export const STATUS_SAIDA = [
  { id: 'pago', rotulo: 'Pago' },
  { id: 'a_pagar', rotulo: 'A pagar' },
]
export const REPETICOES = [
  { id: 'nao', rotulo: 'Não' },
  { id: 'diario', rotulo: 'Diário' },
  { id: 'semanal', rotulo: 'Semanal' },
  { id: 'mensal', rotulo: 'Mensal' },
]

/*
 * Migracao: transacoes gravadas antes de o nome padrao ser salvo ficaram com
 * "Sem nome". O nome que a tela mostrava era "Nova entrada em {Categoria}" -
 * quem nao editou estava aceitando esse nome, nao deixando a transacao sem um.
 *
 * Idempotente: so toca no que esta exatamente como "Sem nome", e so quando da
 * para reconstruir a categoria. Roda uma vez por carga do modulo.
 */
export function migrarNomesPadrao(nomeDaCategoria) {
  const lista = listar()
  let mexeu = false
  const nova = lista.map((t) => {
    if (t.nome !== 'Sem nome') return t
    const categoria = nomeDaCategoria(t.categoriaId)
    if (!categoria) return t
    mexeu = true
    return { ...t, nome: `Nova ${t.tipo === 'entrada' ? 'entrada' : 'saída'} em ${categoria}` }
  })
  if (!mexeu) return { migradas: 0, lista }
  substituir(nova)
  return { migradas: nova.filter((t, i) => t.nome !== lista[i].nome).length, lista: nova }
}

/* --- Edicao a partir do painel de resumo. Regras em lib/series.js. --- */

function aplicar(fn) {
  const nova = fn(listar())
  return { ok: substituir(nova), lista: nova }
}

export const mudarData = (id, data, escopo) =>
  aplicar((l) => Series.mudarData(l, id, data, escopo))

export const mudarRepeticao = (id, repete, escopo) =>
  aplicar((l) => Series.mudarRepeticao(l, id, repete, escopo, () => gerarId()))

export const removerComEscopo = (id, escopo) =>
  aplicar((l) => Series.remover(l, id, escopo))

export const atualizarCampos = (id, campos) =>
  aplicar((l) => Series.atualizar(l, id, campos))

export function adicionarNota(id, texto, hoje = hojeIso()) {
  return aplicar((l) =>
    l.map((t) =>
      t.id === id
        ? { ...t, notas: [...(t.notas ?? []), { id: gerarId('nota'), data: hoje, texto }] }
        : t,
    ),
  )
}
