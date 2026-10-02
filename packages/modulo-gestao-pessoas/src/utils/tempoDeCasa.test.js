import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatarTempoDeCasa, mediaDeMeses, mesesDeCasa } from './tempoDeCasa.js'

test('meses de casa contam meses cheios', () => {
  assert.equal(mesesDeCasa('2026-02-01', '2026-10-01'), 8)
  assert.equal(mesesDeCasa('2026-02-15', '2026-10-01'), 7)
  assert.equal(mesesDeCasa('2026-10-08', '2026-10-01'), null)
  assert.equal(mesesDeCasa(null, '2026-10-01'), null)
})

test('formato do tempo de casa', () => {
  assert.equal(formatarTempoDeCasa(8), '8 meses')
  assert.equal(formatarTempoDeCasa(1), '1 mês')
  assert.equal(formatarTempoDeCasa(0), '0 meses')
  assert.equal(formatarTempoDeCasa(15), '1a 3m')
  assert.equal(formatarTempoDeCasa(null), '—')
})

test('media ignora quem nao foi admitido', () => {
  assert.equal(mediaDeMeses([12, 18, null]), 15)
  assert.equal(mediaDeMeses([null]), null)
})
