import { somarDias, somarMeses, diaUtilMaisProximo, paraData } from './datas.js'

/*
 * Edicao de transacoes que repetem.
 *
 * Funcoes puras sobre a lista inteira: recebem o array e devolvem outro. A
 * camada de storage fica em transacoes.js. Assim da para testar as regras de
 * regeneracao sem navegador nem localStorage.
 *
 * Escopo de toda edicao numa serie:
 *   'esta'     - so a ocorrencia clicada
 *   'proximas' - ela e as seguintes; as anteriores ficam como estao
 */

export const ESCOPOS = { ESTA: 'esta', PROXIMAS: 'proximas' }

const JANELA = { diario: 30, semanal: 12, mensal: 12 }

/* A i-esima data a partir de uma base. Mesma regra da criacao. */
export function datasDaSerie(base, repete, regraMensal = 'dia_fixo', quantas = JANELA[repete] ?? 1) {
  return Array.from({ length: quantas }, (_, i) => {
    if (repete === 'diario') return somarDias(base, i)
    if (repete === 'semanal') return somarDias(base, i * 7)
    if (repete === 'mensal') {
      const bruta = somarMeses(base, i)
      return regraMensal === 'dia_util' ? diaUtilMaisProximo(bruta) : bruta
    }
    return base
  })
}

const daSerie = (lista, alvo) =>
  lista.filter((t) => t.serieId && t.serieId === alvo.serieId)

/*
 * Muda a data de uma ocorrencia.
 *
 * 'esta'     - so ela muda; sai da serie? Nao: continua na serie, so com outra
 *              data. E o que o Figma descreve ("Essa entrada").
 * 'proximas' - ela e as seguintes sao regeradas a partir da data nova,
 *              mantendo a regra de repeticao. As anteriores nao sao tocadas.
 */
export function mudarData(lista, id, novaData, escopo = ESCOPOS.ESTA) {
  const alvo = lista.find((t) => t.id === id)
  if (!alvo) return lista
  if (!alvo.serieId || escopo === ESCOPOS.ESTA) {
    return lista.map((t) => (t.id === id ? { ...t, data: novaData } : t))
  }

  const irmas = daSerie(lista, alvo)
  const daqui = irmas.filter((t) => t.data >= alvo.data).sort((a, b) => a.data.localeCompare(b.data))
  const novas = datasDaSerie(novaData, alvo.repete, alvo.regraMensal, daqui.length)
  const porId = new Map(daqui.map((t, i) => [t.id, novas[i]]))
  return lista.map((t) => (porId.has(t.id) ? { ...t, data: porId.get(t.id) } : t))
}

/*
 * Muda a regra de repeticao.
 *
 * 'proximas' - a serie e refeita daqui para frente com a regra nova; as
 *              anteriores ficam. 'nao' encerra a serie nesta ocorrencia: as
 *              futuras somem e esta vira avulsa.
 * 'esta'     - so esta ocorrencia sai da serie original. Com 'nao' vira
 *              avulsa; com outra regra, vira o inicio de uma serie nova.
 */
export function mudarRepeticao(lista, id, repete, escopo = ESCOPOS.ESTA, novoId = () => Math.random().toString(36).slice(2)) {
  const alvo = lista.find((t) => t.id === id)
  if (!alvo) return lista

  if (escopo === ESCOPOS.ESTA) {
    const semEsta = lista.map((t) => (t.id === id ? { ...t, serieId: null, repete: 'nao' } : t))
    if (repete === 'nao') return semEsta
    const serieId = novoId()
    const datas = datasDaSerie(alvo.data, repete, alvo.regraMensal)
    const base = { ...alvo, repete, serieId }
    return [
      ...semEsta.filter((t) => t.id !== id),
      ...datas.map((data, i) => ({ ...base, id: i === 0 ? alvo.id : novoId(), data })),
    ]
  }

  const irmas = daSerie(lista, alvo)
  const daqui = new Set(irmas.filter((t) => t.data >= alvo.data).map((t) => t.id))
  const semAsDaqui = lista.filter((t) => !daqui.has(t.id) || t.id === id)

  if (repete === 'nao') {
    return semAsDaqui.map((t) => (t.id === id ? { ...t, repete: 'nao', serieId: null } : t))
  }

  const serieId = alvo.serieId
  const datas = datasDaSerie(alvo.data, repete, alvo.regraMensal)
  const base = { ...alvo, repete, serieId }
  return [
    ...semAsDaqui.filter((t) => t.id !== id),
    ...datas.map((data, i) => ({ ...base, id: i === 0 ? alvo.id : novoId(), data })),
  ]
}

/* Remove uma ocorrencia ou ela e as seguintes da serie. */
export function remover(lista, id, escopo = ESCOPOS.ESTA) {
  const alvo = lista.find((t) => t.id === id)
  if (!alvo) return lista
  if (!alvo.serieId || escopo === ESCOPOS.ESTA) return lista.filter((t) => t.id !== id)
  const daqui = new Set(daSerie(lista, alvo).filter((t) => t.data >= alvo.data).map((t) => t.id))
  return lista.filter((t) => !daqui.has(t.id))
}

/* Campos que valem so para a ocorrencia: nome, categoria, notas, observacao. */
export function atualizar(lista, id, campos) {
  return lista.map((t) => (t.id === id ? { ...t, ...campos } : t))
}

export const ordenarPorData = (lista) =>
  [...lista].sort((a, b) => a.data.localeCompare(b.data))

export const diaDaSemana = (isoStr) => paraData(isoStr).getDay()
