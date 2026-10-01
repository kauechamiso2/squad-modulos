import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getAusenciaAtiva, getStatus, textoAusencia } from './colaboradorStatus.js'
import { buildSeedColaboradores } from './seedColaboradores.js'

const base = { id: 'x', rescisao: null, ausencia: null }

test('Pendente conta os itens que faltam', () => {
  assert.equal(getStatus({ ...base, tipo: 'CLT', admissao: { feitos: [] } }).texto, 'Pendente 3/3')
  assert.equal(
    getStatus({ ...base, tipo: 'CLT', admissao: { feitos: ['contrato_assinado'] } }).texto,
    'Pendente 2/3',
  )
  assert.equal(getStatus({ ...base, tipo: 'PJ', admissao: { feitos: [] } }).texto, 'Pendente 1/1')
})

test('checklist zerado vira Em atividade, sem popover', () => {
  const status = getStatus({ ...base, tipo: 'PJ', admissao: { feitos: ['contrato_assinado'] } })
  assert.equal(status.texto, 'Em atividade')
  assert.equal(status.checklist, null)
})

test('rescisao CLT usa so os itens do tipo de rescisao', () => {
  const rescisao = (tipo) => ({ tipo, feitos: [] })
  const total = (tipo) =>
    getStatus({ ...base, tipo: 'CLT', admissao: { feitos: [] }, rescisao: rescisao(tipo) }).checklist.length
  assert.equal(total('sem_justa_causa'), 6)
  assert.equal(total('fim_contrato_experiencia'), 6)
  assert.equal(total('acordo'), 5)
  assert.equal(total('pedido_demissao'), 4)
  assert.equal(total('com_justa_causa'), 4)
})

test('rescisao concluida vira Desligado (CLT) ou Fim de contrato (PJ)', () => {
  const pj = {
    ...base,
    tipo: 'PJ',
    rescisao: { tipo: null, feitos: ['termo_enviado', 'termo_devolvido', 'ultima_nota_fiscal'] },
  }
  assert.equal(getStatus(pj).texto, 'Fim de contrato')
  const clt = {
    ...base,
    tipo: 'CLT',
    rescisao: { tipo: 'pedido_demissao', feitos: ['trct', 'extrato_fgts', 'exame_demissional', 'rescisao_assinada'] },
  }
  assert.equal(getStatus(clt).texto, 'Desligado')
})

test('ausencia so vale entre inicio e fim, inclusive', () => {
  const colaborador = { ausencia: { tipo: 'ferias', inicio: '2026-10-01', fim: '2026-10-12' } }
  assert.equal(getAusenciaAtiva(colaborador, '2026-09-30'), null)
  assert.ok(getAusenciaAtiva(colaborador, '2026-10-01'))
  assert.ok(getAusenciaAtiva(colaborador, '2026-10-12'))
  assert.equal(getAusenciaAtiva(colaborador, '2026-10-13'), null)
  assert.equal(textoAusencia(colaborador.ausencia), 'Férias até 12/10')
})

test('seed cobre todos os estados da home', () => {
  const hoje = '2026-10-01'
  const seed = buildSeedColaboradores(hoje)
  const textos = seed.map((colaborador) => `${colaborador.tipo} ${getStatus(colaborador).texto}`)
  for (const esperado of [
    'CLT Pendente 3/3',
    'CLT Pendente 2/3',
    'PJ Pendente 1/1',
    'CLT Em atividade',
    'PJ Em atividade',
    'CLT Rescisão pendente 3/4',
    'PJ Rescisão pendente 2/3',
    'CLT Desligado',
    'PJ Fim de contrato',
  ]) {
    assert.ok(textos.includes(esperado), esperado)
  }
  const ausencias = seed
    .filter((colaborador) => getAusenciaAtiva(colaborador, hoje))
    .map((colaborador) => colaborador.ausencia.tipo)
    .sort()
  assert.deepEqual(ausencias, ['ferias', 'licenca_medica', 'licenca_paternidade'])
})
