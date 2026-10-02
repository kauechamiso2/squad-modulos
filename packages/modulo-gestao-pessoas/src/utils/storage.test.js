import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

// localStorage em memoria para os testes de node.
const memoria = new Map()
globalThis.localStorage = {
  get length() { return memoria.size },
  key: (indice) => [...memoria.keys()][indice] ?? null,
  getItem: (chave) => (memoria.has(chave) ? memoria.get(chave) : null),
  setItem: (chave, valor) => memoria.set(chave, String(valor)),
  removeItem: (chave) => memoria.delete(chave),
}

const { DATA_VERSION, gravarDadosDeExemplo, getCollection, limparDadosDoModulo, resetDataIfOutdated } = await import('./storage.js')

beforeEach(() => memoria.clear())

test('primeira visita: nada e gravado alem da versao', () => {
  resetDataIfOutdated()
  assert.deepEqual([...memoria.keys()], ['squad:gestao-pessoas:versao-dados'])
  assert.equal(getCollection('colaboradores').length, 0)
})

test('versao antiga com seed: dados do modulo apagados, outros modulos intactos', () => {
  memoria.set('squad:gestao-pessoas:versao-dados', '7')
  memoria.set('squad:gestao-pessoas:colaboradores', '[{"id":"a"}]')
  memoria.set('squad:gestao-pessoas:times', '[{"id":"t"}]')
  memoria.set('squad:fluxo-caixa:transacoes', '[1]')
  resetDataIfOutdated()
  assert.equal(memoria.get('squad:gestao-pessoas:versao-dados'), String(DATA_VERSION))
  assert.equal(memoria.has('squad:gestao-pessoas:colaboradores'), false)
  assert.equal(memoria.has('squad:gestao-pessoas:times'), false)
  assert.equal(memoria.get('squad:fluxo-caixa:transacoes'), '[1]')
})

test('versao mais nova que o codigo nao e tocada', () => {
  memoria.set('squad:gestao-pessoas:versao-dados', String(DATA_VERSION + 1))
  memoria.set('squad:gestao-pessoas:colaboradores', '[{"id":"a"}]')
  resetDataIfOutdated()
  assert.equal(getCollection('colaboradores').length, 1)
})

test('dados de exemplo e limpeza', () => {
  gravarDadosDeExemplo('2026-10-01')
  assert.equal(getCollection('colaboradores').length, 13)
  assert.equal(getCollection('beneficios').length, 5)
  assert.ok(getCollection('times').length >= 3)
  limparDadosDoModulo()
  assert.equal(getCollection('colaboradores').length, 0)
})
