import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cpfValido, cnpjValido, detectarTipo, formatarDocumento, mascararEnquantoDigita, caixaDeNomeEmpresarial, iniciais } from './documentos.js'

test('CNPJ valido passa e invalido nao', () => {
  assert.equal(cnpjValido('11.222.333/0001-81'), true)
  assert.equal(cnpjValido('11222333000182'), false)  // digito trocado
  assert.equal(cnpjValido('11.111.111/1111-11'), false)
  assert.equal(cnpjValido('1122233300018'), false)   // 13 digitos
})

test('CPF valido passa e invalido nao', () => {
  assert.equal(cpfValido('123.456.789-09'), true)
  assert.equal(cpfValido('123.456.789-00'), false)
  assert.equal(cpfValido('111.111.111-11'), false)
})

test('telefone com 9 na terceira casa nao vira CPF', () => {
  assert.equal(detectarTipo('11999990001'), 'telefone')
  assert.equal(formatarDocumento('11999990001'), '(11) 99999-0001')
  assert.equal(detectarTipo('12345678909'), 'cpf')
})

test('mascara enquanto digita', () => {
  assert.equal(mascararEnquantoDigita('11222333000181'), '11.222.333/0001-81')
  assert.equal(mascararEnquantoDigita('12345678909'), '123.456.789-09')
  assert.equal(mascararEnquantoDigita('11999990001'), '(11) 99999-0001')
  assert.equal(mascararEnquantoDigita('097101'), '097.101')
  assert.equal(mascararEnquantoDigita('Diterranio'), 'Diterranio')
  assert.equal(mascararEnquantoDigita(''), '')
})

test('caixa de nome empresarial', () => {
  assert.equal(caixaDeNomeEmpresarial('DITERRANIO CASAMENTO LTDA'), 'Diterranio Casamento LTDA')
  assert.equal(caixaDeNomeEmpresarial('PETROBRAS - EDISE'), 'Petrobras - Edise')
  assert.equal(caixaDeNomeEmpresarial('PADARIA DO ZE ME'), 'Padaria Do Ze ME')
  // caixa mista ja veio decidida por quem escreveu
  assert.equal(caixaDeNomeEmpresarial('Diterranio casamento LTDA'), 'Diterranio casamento LTDA')
})

test('iniciais do avatar seguem o Figma (primeira + segunda palavra)', () => {
  assert.equal(iniciais('Juliano Abravanel Teixeira'), 'JA')
  assert.equal(iniciais('Diterranio casamento LTDA'), 'DC')
  assert.equal(iniciais('Juliano'), 'JU')
  assert.equal(iniciais(''), '?')
})
