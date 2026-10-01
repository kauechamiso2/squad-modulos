import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  contatoValido,
  cpfValido,
  dataDigitadaParaIso,
  formatarDataBr,
  mascaraCnpj,
  mascaraCpf,
  mascaraData,
  mascaraTelefone,
} from './mascaras.js'

test('cpf', () => {
  assert.equal(mascaraCpf('12434556780'), '124.345.567-80')
  assert.equal(mascaraCpf('1243'), '124.3')
  assert.equal(cpfValido('124.345.567-80'), true)
  assert.equal(cpfValido('1243455678'), false)
})

test('cnpj', () => {
  assert.equal(mascaraCnpj('12345678000190'), '12.345.678/0001-90')
})

test('telefone no formato do Figma', () => {
  assert.equal(mascaraTelefone('11989165456'), '11 98916 5456')
  assert.equal(mascaraTelefone('1134567890'), '11 3456 7890')
})

test('contato', () => {
  assert.equal(contatoValido({ tipo: 'telefone', valor: '11989165456' }), true)
  assert.equal(contatoValido({ tipo: 'telefone', valor: '1198' }), false)
  assert.equal(contatoValido({ tipo: 'email', valor: 'bruno@gmail.com' }), true)
  assert.equal(contatoValido({ tipo: 'email', valor: 'bruno@' }), false)
})

test('datas', () => {
  assert.equal(mascaraData('03121993'), '03/12/1993')
  assert.equal(dataDigitadaParaIso('03121993'), '1993-12-03')
  assert.equal(dataDigitadaParaIso('31021993'), null)
  assert.equal(formatarDataBr('2026-09-29'), '29/09/2026')
})

test('tipo da chave PIX', async () => {
  const { tipoChavePix } = await import('./mascaras.js')
  assert.equal(tipoChavePix('52718364902'), 'CPF')
  assert.equal(tipoChavePix('527.183.649-02'), 'CPF')
  assert.equal(tipoChavePix('12.345.678/0001-90'), 'CNPJ')
  assert.equal(tipoChavePix('gustavo.lima@email.com'), 'Email')
  assert.equal(tipoChavePix('+5511989165456'), 'Telefone')
  assert.equal(tipoChavePix('123e4567-e89b-12d3-a456-426614174000'), 'Aleatória')
  assert.equal(tipoChavePix('abc'), null)
})
