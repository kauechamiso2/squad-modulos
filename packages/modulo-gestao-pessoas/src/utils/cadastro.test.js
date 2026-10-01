import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSeedColaboradores } from './seedColaboradores.js'
import { buildSeedRecursos } from './seedRecursos.js'
import {
  dadosBancariosCompletos,
  documentosDoColaborador,
  mostraAlertaDeCadastro,
  pendenciasDoCadastro,
  perfilTravado,
} from './cadastro.js'

const hoje = '2026-10-01'
const colaboradores = buildSeedColaboradores(hoje)
const recursos = buildSeedRecursos(colaboradores)
const pessoa = (nome) => colaboradores.find((item) => item.name === nome)
const alerta = (nome) => mostraAlertaDeCadastro(pessoa(nome), recursos, colaboradores, hoje)

test('dados bancarios: conta inteira ou chave PIX', () => {
  assert.equal(dadosBancariosCompletos(null), false)
  assert.equal(dadosBancariosCompletos({ chavePix: 'x@y.com' }), true)
  assert.equal(dadosBancariosCompletos({ banco: 'Nubank', agencia: '1', numeroConta: '2' }), false)
  assert.equal(
    dadosBancariosCompletos({ banco: 'Nubank', agencia: '1', numeroConta: '2', titular: 'Ana' }),
    true,
  )
})

test('alerta so para Em atividade com cadastro incompleto', () => {
  assert.equal(alerta('Bruno Vasconcelos'), false)
  assert.equal(alerta('Gustavo Lima'), false)
  assert.equal(alerta('Beatriz Souza'), false)
  assert.equal(alerta('Victoria Cardoso'), true)
  assert.equal(alerta('Bruna Teixeira'), true)
  // Pendente nao mostra alerta, mesmo sem nada preenchido.
  assert.equal(alerta('Marina Ferraz'), false)
})

test('PJ nao precisa de recursos', () => {
  const pj = { ...pessoa('Gabriel Luz'), reportaPara: 'Bruno', dadosBancarios: { chavePix: 'x' } }
  assert.deepEqual(pendenciasDoCadastro(pj, [], colaboradores, hoje), [])
})

test('documentos dos itens concluidos', () => {
  assert.deepEqual(documentosDoColaborador(pessoa('Marina Ferraz')), [])
  assert.deepEqual(
    documentosDoColaborador(pessoa('Rafael Nunes')).map((doc) => doc.nome),
    ['Contrato_CLT'],
  )
  assert.deepEqual(
    documentosDoColaborador(pessoa('Bruno Vasconcelos')).map((doc) => doc.nome),
    ['Contrato_CLT', 'CNH.png', 'Exames_Medico'],
  )
})

test('perfil trava em rescisao e desligado', () => {
  assert.equal(perfilTravado(pessoa('Bruno Vasconcelos')), false)
  assert.equal(perfilTravado(pessoa('Lucas Andrade')), true)
  assert.equal(perfilTravado(pessoa('Pedro Martins')), true)
})

test('PJ do seed: cadastro completo do Gabriel e contrato PJ', () => {
  assert.equal(alerta('Gabriel Luz'), false)
  assert.deepEqual(documentosDoColaborador(pessoa('Gabriel Luz')).map((doc) => doc.nome), ['Contrato_PJ'])
})
