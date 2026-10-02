// Custo base do colaborador, sem os recursos (contexto, "Data model > Costs").
//   CLT: o custo para empresa.
//   PJ: o valor do contrato. Mensal conta o valor, Anual um doze avos e
//   Valor fixo o valor inteiro (provisorio).

export const PAGAMENTOS = ['Mensal', 'Anual', 'Valor fixo']

export const SUFIXO_PAGAMENTO = { Mensal: '/mês', Anual: '/ano', 'Valor fixo': null }

export function valorMensalDoPj(colaborador) {
  const valor = colaborador.valorContrato ?? 0
  if (colaborador.pagamento === 'Anual') return valor / 12
  if (colaborador.pagamento === 'Mensal' || colaborador.pagamento === 'Valor fixo') return valor
  if (!colaborador.valorContrato) return 0
  throw new Error(`Pagamento desconhecido "${colaborador.pagamento}" no colaborador ${colaborador.id}`)
}

export function custoBaseDoColaborador(colaborador) {
  if (colaborador.tipo === 'PJ') return valorMensalDoPj(colaborador)
  return colaborador.custoParaEmpresa ?? 0
}
