import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildCenarioVertice } from './seedVerticeConsultoria.js'
import { STATUS, getAusenciaAtiva, getStatus } from './colaboradorStatus.js'
import { mostraAlertaDeCadastro, documentosDoColaborador } from './cadastro.js'
import { custoDoColaborador, membrosDoTime, metricasDoRecurso } from './detalhes.js'
import { tituloDoRecurso } from './recursos.js'
import { tipoChavePix } from './mascaras.js'

const hoje = '2026-09-30'
const { colaboradores, times, recursos } = buildCenarioVertice(hoje)
const pessoa = (nome) => colaboradores.find((item) => item.name === nome)

test('19 colaboradores: 1 Pendente, 2 Em desligamento, 16 Em atividade', () => {
  assert.equal(colaboradores.length, 19)
  const contagem = {}
  colaboradores.forEach((item) => { const id = getStatus(item).id; contagem[id] = (contagem[id] ?? 0) + 1 })
  assert.deepEqual(contagem, { [STATUS.PENDENTE]: 1, [STATUS.EM_DESLIGAMENTO]: 2, [STATUS.EM_ATIVIDADE]: 16 })
  assert.equal(getStatus(pessoa('Isabela Moura')).texto, 'Pendente 3/3')
  assert.equal(getStatus(pessoa('Ricardo Teixeira')).texto, 'Pendente 3/5')
  assert.equal(getStatus(pessoa('Marcelo Fontes')).texto, 'Pendente 2/3')
})

test('icones da tabela: alerta, desligamento e ausencias', () => {
  const alertas = colaboradores.filter((item) => mostraAlertaDeCadastro(item, recursos, colaboradores, hoje)).map((item) => item.name)
  // O cenario espera o alerta so em Eduardo, mas os 5 lideres ficam sem
  // "reporta para" (respondem a diretoria) e o "Completar cadastro" exige o
  // campo: eles tambem mostram o alerta. Divergencia relatada, dado nao forcado.
  assert.deepEqual(alertas, ['Eduardo Prado', 'Rodrigo Menezes', 'Carla Bittencourt', 'Leonardo Pires', 'Sandra Figueiredo', 'Renata Campos'])
  const ausencias = colaboradores.filter((item) => getAusenciaAtiva(item, hoje)).map((item) => `${item.name}:${item.ausencia.tipo}`)
  assert.deepEqual(ausencias.sort(), ['Beatriz Nogueira:licenca_medica', 'Mariana Duarte:licenca_maternidade', 'Patrícia Lacerda:ferias'])
  assert.deepEqual(documentosDoColaborador(pessoa('Eduardo Prado')).map((doc) => doc.nome), ['Contrato_PJ'])
})

test('times com as contagens do cenario', () => {
  const contagens = Object.fromEntries(times.map((time) => [time.name, membrosDoTime(time, colaboradores).length]))
  assert.deepEqual(contagens, { Comercial: 4, Operações: 3, Tecnologia: 5, Financeiro: 3, RH: 2 })
  assert.ok(times.every((time) => !time.pending && time.leaderId && time.descricao))
})

test('recursos: pessoas e custo total do cenario', () => {
  const esperado = {
    'Plano de saúde': [14, 8580],
    'Vale alimentação': [14, 12600],
    'Bem-estar': [7, 1050],
    'Verba de Treinamento': [3, 3600],
    'Microsoft 365': [19, 1425],
    'HubSpot CRM': [4, 880],
    'Power BI Pro': [5, 300],
  }
  for (const recurso of recursos) {
    const metricas = metricasDoRecurso(recurso, colaboradores, times, hoje)
    assert.deepEqual([metricas.total, metricas.custo], esperado[tituloDoRecurso(recurso)], tituloDoRecurso(recurso))
  }
})

test('custo total de Ricardo = 7.140 + 520 + 900 + 60 + 75', () => {
  assert.equal(custoDoColaborador(pessoa('Ricardo Teixeira'), recursos, colaboradores, hoje), 7140 + 520 + 900 + 60 + 75)
})

test('chaves PIX com o tipo do cenario', () => {
  assert.equal(tipoChavePix(pessoa('Felipe Andrade').dadosBancarios.chavePix), 'CPF')
  assert.equal(tipoChavePix(pessoa('Mariana Duarte').dadosBancarios.chavePix), 'Telefone')
  assert.equal(tipoChavePix(pessoa('Gustavo Ramos').dadosBancarios.chavePix), 'CNPJ')
})
