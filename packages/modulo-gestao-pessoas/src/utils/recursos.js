// Modelo de recurso (contexto, "Data model > Recurso"). Fica na colecao
// `beneficios`, a mesma que a pagina de detalhe de beneficio le.
//
// Formato gravado:
//   tipoRecurso:  'beneficio' | 'verba' | 'licenca'
//   categoria:    so Beneficio - uma de CATEGORIAS_BENEFICIO
//   fornecedor:   so Beneficio
//   nome:         Verba, ou o nome digitado em "Outro" (Beneficio e Licenca)
//   icone:        so Verba - 'Desktop' ou 'Coin'
//   servico:      so Licenca - um de SERVICOS_LICENCA
//   beneficiarios: { todaEmpresa, teamNames, colaboradorIds }
//   valores:       [{ id, valor, aplicaATodos, colaboradorIds }]
//   linkBeneficio, contatoFornecedor, emailFornecedor
//
// `tipo` e `name` sao campos legados, so para a pagina de detalhe de
// beneficio continuar abrindo (ver camposLegados abaixo).

import { getStatus, isEncerrado } from './colaboradorStatus.js'
import { resolveBeneficiaryIds } from './beneficiarios.js'
import { formatCurrencyBRL } from './formatters.js'

export const TIPOS_RECURSO = {
  beneficio: 'Benefício',
  verba: 'Verba',
  licenca: 'Licença',
}

export const OUTRO = 'Outro'

export const CATEGORIAS_BENEFICIO = [
  'Plano de saúde',
  'Vale transporte',
  'Vale alimentação',
  'Bem-estar',
  'Plano odontológico',
  'Seguro de vida',
]

// Sugestoes de fornecedor por categoria (contexto, secao 7).
export const FORNECEDORES = {
  'Plano de saúde': ['Alice', 'Amil', 'SulAmérica', 'Bradesco Saúde', 'Hapvida NotreDame Intermédica', 'Unimed', 'Porto Seguro Saúde'],
  'Vale transporte': ['Bilhete Único', 'Uber', '99', 'VEM'],
  'Vale alimentação': ['Caju', 'VR', 'Ticket', 'Alelo', 'Swile', 'Pluxee'],
  'Bem-estar': ['Wellhub', 'TotalPass', 'SmartFit'],
  'Plano odontológico': ['Odontoprev', 'Amil Dental', 'SulAmérica Odonto', 'Bradesco Dental', 'Uniodonto'],
  'Seguro de vida': ['Porto Seguro Vida', 'Bradesco Vida e Previdência', 'MetLife', 'Prudential', 'SulAmérica Vida'],
}

export const SERVICOS_LICENCA = [
  'Google Workspace',
  'Claude',
  'Figma',
  'Slack',
  'Adobe Creative Cloud',
  'ChatGPT',
]

function exigir(condicao, mensagem) {
  if (!condicao) throw new Error(mensagem)
}

// Titulo do card: categoria (ou o nome de Outro), nome da verba ou servico
// (ou o nome de Outro).
export function tituloDoRecurso(recurso) {
  switch (recurso.tipoRecurso) {
    case 'beneficio':
      return recurso.categoria === OUTRO ? recurso.nome : recurso.categoria
    case 'verba':
      return recurso.nome
    case 'licenca':
      return recurso.servico === OUTRO ? recurso.nome : recurso.servico
    default:
      throw new Error(`Tipo de recurso desconhecido "${recurso.tipoRecurso}" no recurso ${recurso.id}`)
  }
}

// O fornecedor que a busca tambem casa. Licenca: o proprio servico.
export function fornecedorDoRecurso(recurso) {
  if (recurso.tipoRecurso === 'beneficio') return recurso.fornecedor ?? null
  if (recurso.tipoRecurso === 'licenca') return recurso.servico === OUTRO ? null : recurso.servico
  return null
}

// Uma pessoa conta enquanto nao estiver encerrada com a data de saida ja
// alcancada. Em desligamento continua contando.
function contaNoRecurso(colaborador, hoje) {
  if (!isEncerrado(getStatus(colaborador))) return true
  const saida = colaborador.rescisao?.data
  exigir(saida, `Colaborador ${colaborador.id} encerrado sem data de saída`)
  return saida > hoje
}

// Pessoas unicas alcancadas pelos vinculos. Quem chega por dois vinculos
// conta uma vez (resolveBeneficiaryIds ja devolve um Set).
export function pessoasDoRecurso(recurso, colaboradores, hoje) {
  const ids = resolveBeneficiaryIds(recurso.beneficiarios, colaboradores)
  return colaboradores.filter((colaborador) => ids.has(colaborador.id) && contaNoRecurso(colaborador, hoje))
}

function formatNumero(valor) {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// "R$50,00", ou com variantes a faixa "R$400,00-500,00" (Figma 10334:5583).
export function valorDoRecurso(recurso) {
  const valores = (recurso.valores ?? []).map((variante) => variante.valor)
  exigir(valores.length > 0, `Recurso ${recurso.id} sem valor`)
  const menor = Math.min(...valores)
  const maior = Math.max(...valores)
  if (menor === maior) return formatCurrencyBRL(menor)
  return `${formatCurrencyBRL(menor)}-${formatNumero(maior)}`
}

// Ponte ate a pagina de recurso existir (contexto, secao 9): a pagina de
// detalhe de beneficio le `tipo` (a categoria com a grafia antiga, para o
// icone e o rotulo) e `name` (titulo e fornecedor). Verba entra como o
// "Outro > Verba" do fluxo antigo; Licenca como "Outro" sem subtipo.
const CATEGORIA_LEGADA = {
  'Plano de saúde': 'Plano de Saúde',
  'Vale transporte': 'Vale Transporte',
  'Vale alimentação': 'Vale Alimentação',
  'Bem-estar': 'Bem-Estar',
  'Plano odontológico': 'Plano Odontológico',
  'Seguro de vida': 'Seguro de Vida',
  [OUTRO]: OUTRO,
}

export function camposLegados(recurso) {
  if (recurso.tipoRecurso === 'beneficio') {
    exigir(CATEGORIA_LEGADA[recurso.categoria], `Categoria desconhecida "${recurso.categoria}"`)
    return {
      tipo: CATEGORIA_LEGADA[recurso.categoria],
      name: recurso.categoria === OUTRO ? recurso.nome : recurso.fornecedor,
      outroSubtipo: recurso.categoria === OUTRO ? 'Fixo' : null,
    }
  }
  if (recurso.tipoRecurso === 'verba') {
    return { tipo: OUTRO, name: recurso.nome, outroSubtipo: 'Verba' }
  }
  return { tipo: OUTRO, name: tituloDoRecurso(recurso), outroSubtipo: null }
}
