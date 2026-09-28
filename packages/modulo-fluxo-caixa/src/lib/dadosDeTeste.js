import { CHAVES, gravar, gerarId } from './armazenamento.js'
import { hojeIso, somarDias, somarMeses, iso, paraData } from './datas.js'
import * as Categorias from './categorias.js'

/*
 * Conjunto de teste para percorrer os filtros (secao 8 do enunciado).
 *
 * Cobre o que os cenarios precisam: transacoes em quatro meses diferentes,
 * hoje, ontem e no futuro; sete categorias entre entrada e saida; contatos
 * salvos (com avatar de iniciais) e nao salvos (CNPJ, CPF e telefone).
 *
 * Como recarregar, no console do navegador:
 *   window.__fluxoCaixaDadosDeTeste()
 * e dar F5. A funcao e registrada em FluxoCaixaRoutes.
 */

const CONTATOS = [
  { id: 'ct-diterranio', nome: 'Diterranio casamento LTDA', documento: '11222333000181', tipoDocumento: 'cnpj' },
  { id: 'ct-juliano', nome: 'Juliano Abravanel Teixeira', documento: '12345678909', tipoDocumento: 'cpf' },
  { id: 'ct-sabrina', nome: 'Sabrina Martins Rocha', documento: '11999990001', tipoDocumento: 'telefone' },
  { id: 'ct-marcos', nome: 'Marcos Vinicius Alves', documento: null, tipoDocumento: null },
]

export function carregarDadosDeTeste(hoje = hojeIso()) {
  const d = paraData(hoje)
  const noMes = (deslocamento, dia) => {
    const base = new Date(d.getFullYear(), d.getMonth() + deslocamento, 1)
    return iso(new Date(base.getFullYear(), base.getMonth(), dia))
  }
  const criadoEm = new Date().toISOString()
  const serie = gerarId('serie')

  const linhas = [
    // --- este mes: hoje, ontem e dias anteriores
    ['Venda kit casamento', 'entrada', 32300, 'e-vendas-b2b', 'ct-diterranio', null, 'recebido', hoje],
    ['Consultoria mensal', 'entrada', 450000, 'e-servicos', 'ct-juliano', null, 'recebido', somarDias(hoje, -1)],
    ['Assinatura anual', 'entrada', 129000, 'e-assinaturas', null, '11.222.333/0001-81', 'recebido', noMes(0, 3)],
    ['Aluguel do escritorio', 'saida', 387290, 's-despesas', null, '(11) 99999-0001', 'pago', noMes(0, 5)],
    ['Mercado do mes', 'saida', 86523, 's-alimentacao', 'ct-sabrina', null, 'pago', noMes(0, 8)],
    ['Licencas de software', 'saida', 47320, 's-software', null, '123.456.789-09', 'pago', noMes(0, 12)],
    // --- futuro: relogio e laranja, e o tipo "Agendada"
    ['Parcela do fornecedor', 'saida', 118000, 's-fornecedores', 'ct-marcos', null, 'a_pagar', somarDias(hoje, 7)],
    ['Recebivel de dezembro', 'entrada', 260000, 'e-vendas-b2c', 'ct-diterranio', null, 'a_receber', somarDias(hoje, 21)],
    // --- pendente com data passada: abre o modal de confirmacao pelo (i)
    ['Venda atrasada', 'entrada', 98000, 'e-vendas-b2b', 'ct-juliano', null, 'a_receber', somarDias(hoje, -3)],
    // --- mes passado
    ['Servico pontual', 'entrada', 180000, 'e-servicos', 'ct-sabrina', null, 'recebido', noMes(-1, 9)],
    ['Impostos do trimestre', 'saida', 223400, 's-impostos', null, '11.222.333/0001-81', 'pago', noMes(-1, 20)],
    // --- dois meses atras
    ['Aporte de socio', 'entrada', 1500000, 'e-aporte', 'ct-marcos', null, 'recebido', noMes(-2, 14)],
    ['Operacao e manutencao', 'saida', 64200, 's-operacao', null, 'Oficina do Ze', 'pago', noMes(-2, 25)],
    // --- proximo mes
    ['Renovacao de contrato', 'entrada', 320000, 'e-assinaturas', 'ct-diterranio', null, 'a_receber', noMes(1, 10)],
  ]

  const transacoes = linhas.map(([nome, tipo, valorCentavos, categoriaId, contatoId, contatoAvulso, status, data], i) => ({
    id: gerarId(), criadoEm, nome, tipo, valorCentavos, categoriaId, contatoId, contatoAvulso,
    status, data, repete: 'nao', regraMensal: 'dia_fixo', observacao: '',
    serieId: i === 6 ? serie : null,
  }))

  gravar(CHAVES.CONTATOS, CONTATOS)
  gravar(CHAVES.TRANSACOES, transacoes)
  gravar(CHAVES.FILTROS, null)
  return { transacoes, contatos: CONTATOS, categorias: Categorias.todas().length }
}

/*
 * Conjunto da etapa 3 (resumo de transacao): uma entrada avulsa com pagador
 * salvo e observacao, uma entrada mensal de 6 ocorrencias (3 passadas e 3
 * futuras) sem observacao, uma saida mensal e uma entrada futura "A receber".
 *
 * No console:  window.__fluxoCaixaDadosDoResumo()
 */
export function dadosDoResumo(hoje = hojeIso()) {
  const criadoEm = new Date().toISOString()
  const mensalEntrada = gerarId('serie')
  const mensalSaida = gerarId('serie')

  const serie = (serieId, base, nome, tipo, valorCentavos, categoriaId, contatoId, status) =>
    Array.from({ length: 6 }, (_, i) => ({
      id: gerarId(), criadoEm, nome, tipo, valorCentavos, categoriaId, contatoId,
      contatoAvulso: null, status, data: somarMeses(base, i), repete: 'mensal',
      regraMensal: 'dia_fixo', observacao: '', notas: [], serieId,
    }))

  const transacoes = [
    {
      id: gerarId(), criadoEm, nome: 'Venda kit casamento', tipo: 'entrada',
      valorCentavos: 32300, categoriaId: 'e-vendas-b2b', contatoId: 'ct-diterranio',
      contatoAvulso: null, status: 'recebido', data: somarDias(hoje, -2),
      repete: 'nao', regraMensal: 'dia_fixo', serieId: null,
      observacao: 'Pagamento combinado em duas parcelas, esta é a primeira.',
      notas: [{ id: gerarId('nota'), data: somarDias(hoje, -1), texto: 'Cliente pediu nota fiscal.' }],
    },
    ...serie(mensalEntrada, somarMeses(hoje, -3), 'Assinatura mensal', 'entrada', 129000, 'e-assinaturas', 'ct-juliano', 'recebido'),
    ...serie(mensalSaida, somarMeses(hoje, -2), 'Licenças de software', 'saida', 47320, 's-software', 'ct-sabrina', 'pago'),
    {
      id: gerarId(), criadoEm, nome: 'Recebível de dezembro', tipo: 'entrada',
      valorCentavos: 260000, categoriaId: 'e-vendas-b2c', contatoId: 'ct-marcos',
      contatoAvulso: null, status: 'a_receber', data: somarDias(hoje, 21),
      repete: 'nao', regraMensal: 'dia_fixo', observacao: '', notas: [], serieId: null,
    },
  ]

  gravar(CHAVES.CONTATOS, CONTATOS)
  gravar(CHAVES.TRANSACOES, transacoes)
  gravar(CHAVES.FILTROS, null)
  return transacoes
}

/* Extra para o cenario de repeticao: 12 ocorrencias mensais a partir de hoje. */
export function comSerieMensal(hoje = hojeIso()) {
  const { transacoes } = carregarDadosDeTeste(hoje)
  const criadoEm = new Date().toISOString()
  const serieId = gerarId('serie')
  const extras = Array.from({ length: 12 }, (_, i) => ({
    id: gerarId(), criadoEm, nome: 'Assinatura recorrente', tipo: 'saida',
    valorCentavos: 9990, categoriaId: 's-software', contatoId: null,
    contatoAvulso: null, status: 'a_pagar', data: somarMeses(hoje, i),
    repete: 'mensal', regraMensal: 'dia_fixo', observacao: '', serieId,
  }))
  const tudo = [...transacoes, ...extras]
  gravar(CHAVES.TRANSACOES, tudo)
  return tudo
}
