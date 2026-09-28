import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  domingoDePascoa, feriadosNacionais, ehFeriado, ehDiaUtil,
  diaUtilMaisProximo, iso, somarMeses,
} from './datas.js'

test('domingo de Pascoa bate com as datas conhecidas', () => {
  assert.equal(iso(domingoDePascoa(2024)), '2024-03-31')
  assert.equal(iso(domingoDePascoa(2025)), '2025-04-20')
  assert.equal(iso(domingoDePascoa(2026)), '2026-04-05')
})

test('feriados moveis de 2026 saem da Pascoa', () => {
  const f = feriadosNacionais(2026)
  assert.ok(f.has('2026-02-16'), 'Carnaval segunda')
  assert.ok(f.has('2026-02-17'), 'Carnaval terca')
  assert.ok(f.has('2026-04-03'), 'Sexta-feira Santa')
  assert.ok(f.has('2026-06-04'), 'Corpus Christi')
})

test('feriados fixos entram no conjunto', () => {
  for (const d of ['2026-01-01','2026-04-21','2026-05-01','2026-09-07',
                   '2026-10-12','2026-11-02','2026-11-15','2026-11-20','2026-12-25']) {
    assert.ok(ehFeriado(d), d)
  }
})

test('dia util exclui fim de semana e feriado', () => {
  assert.equal(ehDiaUtil('2026-03-16'), true)   // segunda comum
  assert.equal(ehDiaUtil('2026-03-14'), false)  // sabado
  assert.equal(ehDiaUtil('2026-03-15'), false)  // domingo
  assert.equal(ehDiaUtil('2026-05-01'), false)  // Dia do Trabalho, uma sexta
})

test('sabado vai para a sexta anterior e domingo para a segunda seguinte', () => {
  assert.equal(diaUtilMaisProximo('2026-03-14'), '2026-03-13') // sab -> sex
  assert.equal(diaUtilMaisProximo('2026-03-15'), '2026-03-16') // dom -> seg
  assert.equal(diaUtilMaisProximo('2026-03-16'), '2026-03-16') // ja e util
})

test('feriado no meio da semana prefere o dia util anterior no empate', () => {
  // 2026-05-01 e sexta: o anterior (30/04, quinta) e o seguinte (04/05, segunda)
  // nao empatam, mas o anterior esta mais perto.
  assert.equal(diaUtilMaisProximo('2026-05-01'), '2026-04-30')
  // 2026-09-07 e segunda: anterior util e sexta 04/09 (3 dias), seguinte e
  // terca 08/09 (1 dia) - ganha o seguinte.
  assert.equal(diaUtilMaisProximo('2026-09-07'), '2026-09-08')
  // 2026-11-20 e sexta (Consciencia Negra): anterior quinta 19/11.
  assert.equal(diaUtilMaisProximo('2026-11-20'), '2026-11-19')
})

test('mes sem o dia escolhido prende no ultimo dia do mes', () => {
  assert.equal(somarMeses('2026-01-31', 1), '2026-02-28') // fevereiro
  assert.equal(somarMeses('2026-03-31', 1), '2026-04-30') // abril tem 30
  assert.equal(somarMeses('2026-03-31', 2), '2026-05-31')
})
