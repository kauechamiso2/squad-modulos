/* Datas em 'YYYY-MM-DD'. Sem lib: o modulo precisa de pouca coisa e Date basta. */

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const MESES_CURTO = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export function hojeIso() {
  const d = new Date()
  return iso(d)
}

export function iso(d) {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

/* 'YYYY-MM-DD' -> Date local (nao UTC: new Date('2026-09-16') vira o dia 15
   em fuso negativo, e a tabela mostraria a data errada). */
export function paraData(isoStr) {
  const [a, m, d] = isoStr.split('-').map(Number)
  return new Date(a, m - 1, d)
}

/* "16 Mar 2026" (Figma 2279:96596) */
export function formatarCurta(isoStr) {
  const d = paraData(isoStr)
  return `${d.getDate()} ${MESES_CURTO[d.getMonth()]} ${d.getFullYear()}`
}

/* "Setembro", para "Seu lucro de {mes} foi:" */
export function nomeDoMes(isoStr) {
  return MESES[paraData(isoStr).getMonth()]
}

export function mesmoDia(a, b) {
  return a === b
}

export function somarDias(isoStr, n) {
  const d = paraData(isoStr)
  d.setDate(d.getDate() + n)
  return iso(d)
}

export function somarMeses(isoStr, n) {
  const d = paraData(isoStr)
  const diaOriginal = d.getDate()
  d.setMonth(d.getMonth() + n)
  // 31 de janeiro + 1 mes cairia em 3 de marco; prende no ultimo dia do mes.
  if (d.getDate() < diaOriginal) d.setDate(0)
  return iso(d)
}

export function diasNoMes(ano, mes) {
  return new Date(ano, mes + 1, 0).getDate()
}

/* Intervalo [inicio, fim] de um periodo nomeado, relativo a hoje. */
export function intervaloDoPeriodo(id, base = hojeIso()) {
  const h = paraData(base)
  const ano = h.getFullYear()
  const mes = h.getMonth()
  const fim = (d) => iso(d)
  switch (id) {
    case 'hoje': return { inicio: base, fim: base }
    case 'ontem': { const o = somarDias(base, -1); return { inicio: o, fim: o } }
    case '15dias': return { inicio: somarDias(base, -14), fim: base }
    case '30dias': return { inicio: somarDias(base, -29), fim: base }
    case 'este-mes': return { inicio: iso(new Date(ano, mes, 1)), fim: fim(new Date(ano, mes, diasNoMes(ano, mes))) }
    case 'proximo-mes': return { inicio: iso(new Date(ano, mes + 1, 1)), fim: fim(new Date(ano, mes + 1, diasNoMes(ano, mes + 1))) }
    case 'mes-passado': return { inicio: iso(new Date(ano, mes - 1, 1)), fim: fim(new Date(ano, mes - 1, diasNoMes(ano, mes - 1))) }
    case '3meses': return { inicio: iso(new Date(ano, mes - 2, 1)), fim: fim(new Date(ano, mes, diasNoMes(ano, mes))) }
    case '6meses': return { inicio: iso(new Date(ano, mes - 5, 1)), fim: fim(new Date(ano, mes, diasNoMes(ano, mes))) }
    case 'ultimo-ano': return { inicio: iso(new Date(ano - 1, mes + 1, 1)), fim: fim(new Date(ano, mes, diasNoMes(ano, mes))) }
    default: return null
  }
}

export const PERIODOS = [
  { id: 'hoje', rotulo: 'Hoje' },
  { id: 'ontem', rotulo: 'Ontem' },
  { id: '15dias', rotulo: '15 dias' },
  { id: '30dias', rotulo: '30 dias' },
  { id: 'este-mes', rotulo: 'Este mês' },
  { id: 'proximo-mes', rotulo: 'Próximo mês' },
  { id: 'mes-passado', rotulo: 'Mês passado' },
  { id: '3meses', rotulo: 'Últimos 3 meses' },
  { id: '6meses', rotulo: 'Últimos 6 meses' },
  { id: 'ultimo-ano', rotulo: 'Último ano' },
]

export const MESES_NOMES = MESES
export const MESES_CURTOS = MESES_CURTO

/*
 * Feriados nacionais do Brasil e dia util.
 *
 * O Figma (anotacao 2279:97360) diz que "a data do mensal depende do dia que a
 * pessoa selecionou e se e um dia util ou nao", e o painel oferece a opcao
 * "Sempre no dia {D}, ou dia util mais proximo". Para isso o modulo precisa
 * saber o que e dia util, entao os feriados ficam aqui.
 *
 * So feriados nacionais - os estaduais e municipais dependem de onde a empresa
 * esta, dado que o modulo nao tem.
 */

/* Domingo de Pascoa pelo algoritmo de Meeus/Jones/Butcher (calendario
   gregoriano). Carnaval, Sexta-feira Santa e Corpus Christi sao contados a
   partir dele. */
export function domingoDePascoa(ano) {
  const a = ano % 19
  const b = Math.floor(ano / 100)
  const c = ano % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const mes = Math.floor((h + l - 7 * m + 114) / 31)
  const dia = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(ano, mes - 1, dia)
}

const FIXOS = [
  [0, 1],   // Confraternizacao Universal
  [3, 21],  // Tiradentes
  [4, 1],   // Dia do Trabalho
  [8, 7],   // Independencia
  [9, 12],  // Nossa Senhora Aparecida
  [10, 2],  // Finados
  [10, 15], // Proclamacao da Republica
  [10, 20], // Consciencia Negra (nacional desde 2024, Lei 14.759/2023)
  [11, 25], // Natal
]

const cacheFeriados = new Map()

/* Conjunto de 'YYYY-MM-DD' com os feriados nacionais do ano. */
export function feriadosNacionais(ano) {
  const emCache = cacheFeriados.get(ano)
  if (emCache) return emCache

  const dias = new Set(FIXOS.map(([m, d]) => iso(new Date(ano, m, d))))
  const pascoa = domingoDePascoa(ano)
  const deslocar = (n) => {
    const d = new Date(pascoa)
    d.setDate(d.getDate() + n)
    return iso(d)
  }
  dias.add(deslocar(-48)) // Carnaval (segunda)
  dias.add(deslocar(-47)) // Carnaval (terca)
  dias.add(deslocar(-2))  // Sexta-feira Santa
  dias.add(deslocar(60))  // Corpus Christi

  cacheFeriados.set(ano, dias)
  return dias
}

export function ehFeriado(isoStr) {
  return feriadosNacionais(paraData(isoStr).getFullYear()).has(isoStr)
}

export function ehFimDeSemana(isoStr) {
  const dia = paraData(isoStr).getDay()
  return dia === 0 || dia === 6
}

export function ehDiaUtil(isoStr) {
  return !ehFimDeSemana(isoStr) && !ehFeriado(isoStr)
}

/*
 * Dia util mais proximo da data. Sabado cai na sexta anterior, domingo na
 * segunda seguinte, e um feriado anda para os dois lados ao mesmo tempo,
 * preferindo o anterior quando empatam - a regra que o Figma descreve.
 */
export function diaUtilMaisProximo(isoStr) {
  if (ehDiaUtil(isoStr)) return isoStr
  for (let passo = 1; passo <= 10; passo += 1) {
    const antes = somarDias(isoStr, -passo)
    if (ehDiaUtil(antes)) return antes
    const depois = somarDias(isoStr, passo)
    if (ehDiaUtil(depois)) return depois
  }
  return isoStr
}

export function diaDoMes(isoStr) {
  return paraData(isoStr).getDate()
}

export function ehFuturo(isoStr, base = hojeIso()) {
  return isoStr > base
}

export function ehPassadoOuHoje(isoStr, base = hojeIso()) {
  return isoStr <= base
}

/* "20 de Setembro 2026" - a data do painel de resumo (Figma 2279:101815). */
export function formatarPorExtenso(isoStr) {
  const d = paraData(isoStr)
  return `${d.getDate()} de ${MESES[d.getMonth()]} ${d.getFullYear()}`
}
