import { test } from 'node:test'
import assert from 'node:assert/strict'
import { timeComNome } from './teamOptions.js'

const times = [
  { id: 'a', name: 'Design', pending: false },
  { id: 'b', name: 'Vendas', pending: true },
]

test('nome de time repetido ignora maiusculas e espacos nas pontas', () => {
  assert.equal(timeComNome(times, '  design ')?.id, 'a')
  assert.equal(timeComNome(times, 'VENDAS')?.id, 'b')
  assert.equal(timeComNome(times, 'Marketing'), null)
  assert.equal(timeComNome(times, '   '), null)
})

test('o proprio time nao conta como repetido', () => {
  assert.equal(timeComNome(times, 'Vendas', 'b'), null)
})
