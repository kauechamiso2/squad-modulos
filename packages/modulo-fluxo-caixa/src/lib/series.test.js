import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mudarData, mudarRepeticao, remover, ESCOPOS, diaDaSemana } from './series.js'

/* Serie mensal de 6 ocorrencias no dia 16, de marco a agosto de 2026. */
const serie = ['2026-03-16','2026-04-16','2026-05-16','2026-06-16','2026-07-16','2026-08-16']
  .map((data, i) => ({ id: 's'+i, serieId: 'S', repete: 'mensal', regraMensal: 'dia_fixo', data, nome: 'Assinatura' }))

const avulsa = { id: 'a1', serieId: null, repete: 'nao', data: '2026-03-10', nome: 'Venda' }
const lista = [...serie, avulsa]
const datas = (l) => l.filter(t => t.serieId === 'S').map(t => t.data).sort()
const ids = () => { let n = 0; return () => 'novo' + (n++) }

test('cenario 8 - data, "Todas as proximas": a partir da 3a, dia 16 -> 20', () => {
  const r = mudarData(lista, 's2', '2026-05-20', ESCOPOS.PROXIMAS)
  assert.deepEqual(datas(r), ['2026-03-16','2026-04-16','2026-05-20','2026-06-20','2026-07-20','2026-08-20'])
  assert.equal(r.find(t => t.id === 'a1').data, '2026-03-10', 'a avulsa nao e tocada')
})

test('cenario 9 - data, "Essa entrada": so a clicada muda', () => {
  const r = mudarData(lista, 's2', '2026-05-20', ESCOPOS.ESTA)
  assert.deepEqual(datas(r), ['2026-03-16','2026-04-16','2026-05-20','2026-06-16','2026-07-16','2026-08-16'])
})

test('data numa transacao sem repeticao muda so ela', () => {
  const r = mudarData(lista, 'a1', '2026-03-25', ESCOPOS.PROXIMAS)
  assert.equal(r.find(t => t.id === 'a1').data, '2026-03-25')
  assert.deepEqual(datas(r), serie.map(t => t.data))
})

test('cenario 10 - repeticao Mensal -> Semanal, "Todas as proximas"', () => {
  const r = mudarRepeticao(lista, 's2', 'semanal', ESCOPOS.PROXIMAS, ids())
  const naSerie = r.filter(t => t.serieId === 'S').map(t => t.data).sort()
  // as duas anteriores ficam; da 3a em diante vira semanal (12 ocorrencias)
  assert.deepEqual(naSerie.slice(0, 2), ['2026-03-16','2026-04-16'])
  assert.equal(naSerie.length, 2 + 12)
  assert.equal(naSerie[2], '2026-05-16')
  assert.equal(naSerie[3], '2026-05-23', 'semanal anda de 7 em 7')
  const semanas = new Set(naSerie.slice(2).map(diaDaSemana))
  assert.equal(semanas.size, 1, 'todas caem no mesmo dia da semana')
})

test('cenario 11 - repeticao -> Nao, "Essa entrada": vira avulsa e a serie segue', () => {
  const r = mudarRepeticao(lista, 's2', 'nao', ESCOPOS.ESTA, ids())
  const solta = r.find(t => t.id === 's2')
  assert.equal(solta.serieId, null)
  assert.equal(solta.repete, 'nao')
  assert.equal(solta.data, '2026-05-16', 'a data nao muda')
  assert.deepEqual(datas(r), ['2026-03-16','2026-04-16','2026-06-16','2026-07-16','2026-08-16'])
})

test('repeticao -> Nao, "Todas as proximas": encerra a serie nesta ocorrencia', () => {
  const r = mudarRepeticao(lista, 's2', 'nao', ESCOPOS.PROXIMAS, ids())
  assert.deepEqual(datas(r), ['2026-03-16','2026-04-16'])
  const ficou = r.find(t => t.id === 's2')
  assert.equal(ficou.serieId, null)
  assert.equal(ficou.repete, 'nao')
})

test('repeticao "Essa entrada" com outra regra abre uma serie nova', () => {
  const r = mudarRepeticao(lista, 's2', 'semanal', ESCOPOS.ESTA, ids())
  const original = r.filter(t => t.serieId === 'S').map(t => t.data).sort()
  assert.deepEqual(original, ['2026-03-16','2026-04-16','2026-06-16','2026-07-16','2026-08-16'])
  const nova = r.filter(t => t.serieId && t.serieId !== 'S')
  assert.equal(nova.length, 12)
  assert.equal(nova[0].data, '2026-05-16')
})

test('cenario 13 - remover "Todas as proximas"', () => {
  const r = remover(lista, 's2', ESCOPOS.PROXIMAS)
  assert.deepEqual(datas(r), ['2026-03-16','2026-04-16'])
  assert.ok(r.find(t => t.id === 'a1'), 'a avulsa fica')
})

test('cenario 12 - remover "Essa entrada" tira so uma', () => {
  const r = remover(lista, 's2', ESCOPOS.ESTA)
  assert.deepEqual(datas(r), ['2026-03-16','2026-04-16','2026-06-16','2026-07-16','2026-08-16'])
})

test('remover transacao sem repeticao', () => {
  assert.equal(remover(lista, 'a1', ESCOPOS.ESTA).length, lista.length - 1)
})

test('mensal com dia_util desvia fim de semana ao mover as proximas', () => {
  const uteis = serie.map(t => ({ ...t, regraMensal: 'dia_util' }))
  const r = mudarData(uteis, 's0', '2026-03-31', ESCOPOS.PROXIMAS)
  const d = r.map(t => t.data).filter(Boolean).sort()
  assert.ok(d.includes('2026-06-01'), '31/05/2026 e domingo -> 01/06')
  assert.ok(!d.includes('2026-05-31'))
})
