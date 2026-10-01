import { test } from 'node:test'
import assert from 'node:assert/strict'
import { custoBaseDoColaborador } from './custos.js'

test('custo base: CLT pelo custo para empresa, PJ pelo pagamento', () => {
  assert.equal(custoBaseDoColaborador({ tipo: 'CLT', custoParaEmpresa: 12000 }), 12000)
  assert.equal(custoBaseDoColaborador({ tipo: 'PJ', pagamento: 'Mensal', valorContrato: 5000 }), 5000)
  assert.equal(custoBaseDoColaborador({ tipo: 'PJ', pagamento: 'Anual', valorContrato: 96000 }), 8000)
  assert.equal(custoBaseDoColaborador({ tipo: 'PJ', pagamento: 'Valor fixo', valorContrato: 30000 }), 30000)
})
