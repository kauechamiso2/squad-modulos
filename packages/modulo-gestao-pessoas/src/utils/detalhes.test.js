import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSeedColaboradores } from './seedColaboradores.js'
import { buildSeedRecursos } from './seedRecursos.js'
import { custoBaseDoColaborador } from './custos.js'
import { custoDoColaborador, faixaDeValores, metricasDoRecurso, metricasDoTime } from './detalhes.js'

const hoje = '2026-10-01'
const colaboradores = buildSeedColaboradores(hoje)
const recursos = buildSeedRecursos(colaboradores, hoje)
const pessoa = (nome) => colaboradores.find((item) => item.name === nome)

test('custo do colaborador soma a base e cada recurso uma vez', () => {
  const bruno = pessoa('Bruno Vasconcelos')
  const custo = custoDoColaborador(bruno, recursos, colaboradores, hoje)
  assert.ok(custo > custoBaseDoColaborador(bruno))
})

test('time conta Pendente, Em atividade e Em desligamento, e soma o custo deles', () => {
  const time = { name: 'Design' }
  const metricas = metricasDoTime(time, colaboradores, recursos, hoje)
  const nomes = metricas.membros.map((item) => item.name)
  assert.ok(!nomes.includes('Pedro Martins'))
  const soma = metricas.membros.reduce((total, item) => total + custoDoColaborador(item, recursos, colaboradores, hoje), 0)
  assert.equal(metricas.custo, soma)
  assert.equal(metricas.contratacao.CLT + metricas.contratacao.PJ, 100)
})

test('recurso: total, custo e porcentagens por time', () => {
  const recurso = recursos[0]
  const metricas = metricasDoRecurso(recurso, colaboradores, [], hoje)
  assert.equal(metricas.porValor.reduce((soma, item) => soma + item.valor, 0), metricas.total)
  const somaPorcentagens = metricas.porTime.reduce((soma, item) => soma + item.porcentagem, 0)
  assert.ok(Math.abs(somaPorcentagens - 100) <= 2)
})

test('faixa de valores', () => {
  assert.equal(faixaDeValores([450, 550, 450]), 'R$450,00-550,00')
  assert.equal(faixaDeValores([50]), 'R$50,00')
})
