import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSeedColaboradores } from './seedColaboradores.js'
import { buildSeedRecursos } from './seedRecursos.js'
import { fornecedorDoRecurso, pessoasDoRecurso, tituloDoRecurso, valorDoRecurso } from './recursos.js'

const hoje = '2026-10-01'
const colaboradores = buildSeedColaboradores(hoje)
const recursos = buildSeedRecursos(colaboradores, hoje)
const porTitulo = Object.fromEntries(recursos.map((recurso) => [tituloDoRecurso(recurso), recurso]))
const contar = (titulo) => pessoasDoRecurso(porTitulo[titulo], colaboradores, hoje).length

test('titulos por tipo', () => {
  assert.deepEqual(Object.keys(porTitulo), [
    'Plano de saúde',
    'Auxílio Home Office',
    'Slack',
    'Vale alimentação',
    'Vale transporte',
  ])
  assert.equal(fornecedorDoRecurso(porTitulo['Plano de saúde']), 'Alice')
})

test('empresa toda conta todo mundo menos quem ja saiu', () => {
  // 13 colaboradores, menos Pedro Martins e André Moura.
  assert.equal(contar('Plano de saúde'), 11)
})

test('quem chega por dois vinculos conta uma vez', () => {
  // Times Vendas (Beatriz, Lucas) e Marketing (Victoria, Renata), mais
  // Victoria (de novo) e Marina individualmente.
  assert.equal(contar('Vale alimentação'), 5)
})

test('quem saiu fica no vinculo mas nao conta', () => {
  assert.equal(contar('Vale transporte'), 3)
})

test('valor unico e faixa', () => {
  assert.equal(valorDoRecurso(porTitulo.Slack), 'R$50,00')
  assert.equal(valorDoRecurso(porTitulo['Plano de saúde']), 'R$400,00-500,00')
  assert.equal(valorDoRecurso(porTitulo['Vale alimentação']), 'R$800,00-1.200,00')
})
