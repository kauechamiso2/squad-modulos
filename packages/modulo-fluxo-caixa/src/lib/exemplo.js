import { CHAVES, gravar, gerarId } from './armazenamento.js'
import { hojeIso, somarDias, iso, paraData } from './datas.js'

/*
 * Dados de exemplo da home do Figma (node 2279:100344).
 *
 * ATENCAO - os numeros do Figma nao fecham entre si. Conferido:
 *
 *   Entradas 6.340,12 - Saidas 1.924,56 = 4.415,56
 *   mas o card de Lucro desenha 4.020,44          (395,12 de diferenca)
 *
 *   As tres saidas passadas da tabela somam 8.611,03
 *   mas o card de Saidas desenha 1.924,56
 *
 * Sao numeros ilustrativos do mock, nao um conjunto consistente. Como o modulo
 * calcula os totais de verdade a partir das transacoes, escolhi ser fiel as
 * LINHAS (que e o que a tela mostra) e deixar os cards somarem o que somam.
 * A alternativa - forjar os totais - exigiria linhas diferentes das do Figma.
 * Registrado em docs/modulo-fluxo-caixa.md.
 */

/* As datas sao relativas a hoje para o exemplo cair sempre dentro do filtro
   padrao ("Este mes"), independente de quando alguem carregar. */
export function transacoesDeExemplo(hoje = hojeIso()) {
  const d = paraData(hoje)
  const dia = (n) => iso(new Date(d.getFullYear(), d.getMonth(), Math.min(n, 28)))

  return [
    {
      nome: 'Pagamento Boleto de Aluguel', tipo: 'saida', valorCentavos: 387290,
      categoriaId: 's-despesas', contatoId: null, contatoAvulso: '(11) 99999-0001',
      status: 'pago', data: dia(3), repete: 'nao', observacao: '',
    },
    {
      nome: 'Vendas Maio', tipo: 'entrada', valorCentavos: 129090,
      categoriaId: 'e-clientes', contatoId: null, contatoAvulso: '123.456.789-09',
      status: 'recebido', data: dia(5), repete: 'nao', observacao: '',
    },
    {
      nome: 'Mercado Mensal', tipo: 'saida', valorCentavos: 387290,
      categoriaId: 's-alimentacao', contatoId: null, contatoAvulso: null,
      status: 'pago', data: dia(8), repete: 'nao', observacao: '',
    },
    /* A quarta linha do Figma tem o icone de relogio: e uma ocorrencia futura
       de uma repeticao. Por isso data a frente de hoje e serieId preenchido. */
    {
      nome: 'Mercado Mensal', tipo: 'saida', valorCentavos: 47320,
      categoriaId: 's-despesas', contatoId: null, contatoAvulso: '11.222.333/0001-81',
      status: 'a_pagar', data: somarDias(hoje, 7), repete: 'mensal', observacao: '',
      __serie: true,
    },
    {
      nome: 'Conta de Luz', tipo: 'saida', valorCentavos: 86523,
      categoriaId: 's-despesas', contatoId: null, contatoAvulso: 'Diterranio casamento LTDA',
      status: 'pago', data: dia(12), repete: 'nao', observacao: '',
    },
  ]
}

export function carregarExemplo(hoje = hojeIso()) {
  const criadoEm = new Date().toISOString()
  const serieId = gerarId('serie')
  const transacoes = transacoesDeExemplo(hoje).map((t) => {
    const { __serie, ...resto } = t
    return { ...resto, id: gerarId(), criadoEm, serieId: __serie ? serieId : null }
  })
  gravar(CHAVES.TRANSACOES, transacoes)
  return transacoes
}
