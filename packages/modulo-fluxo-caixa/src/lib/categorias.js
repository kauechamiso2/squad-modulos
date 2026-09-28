import { CHAVES, ler, gravar, gerarId } from './armazenamento.js'

/*
 * Categorias sao separadas por tipo: as de entrada nunca aparecem num fluxo de
 * saida e vice-versa (Figma: as duas secoes tem listas diferentes).
 *
 * As padrao nao sao gravadas no storage - elas existem no codigo e so as
 * criadas pela pessoa vao para o localStorage. Assim uma categoria padrao nova
 * numa versao futura aparece para quem ja usava o modulo.
 */
export const PADRAO_ENTRADA = [
  { id: 'e-vendas-b2c', nome: 'Vendas B2C', emoji: '🛍️' },
  { id: 'e-vendas-b2b', nome: 'Vendas B2B', emoji: '🤝' },
  { id: 'e-servicos', nome: 'Serviços', emoji: '💼' },
  { id: 'e-assinaturas', nome: 'Assinaturas e mensalidades', emoji: '📅' },
  { id: 'e-rendimentos', nome: 'Rendimentos de investimentos', emoji: '📈' },
  { id: 'e-emprestimos', nome: 'Empréstimos e financiamentos', emoji: '🏦' },
  { id: 'e-aporte', nome: 'Aporte de sócios', emoji: '💵' },
  { id: 'e-reembolsos', nome: 'Reembolsos', emoji: '🧾' },
  { id: 'e-clientes', nome: 'Clientes', emoji: '👤' },
  { id: 'e-outros', nome: 'Outros', emoji: '🗂️' },
]

export const PADRAO_SAIDA = [
  { id: 's-operacao', nome: 'Operação', emoji: '⚙️' },
  { id: 's-fornecedores', nome: 'Fornecedores', emoji: '📦' },
  { id: 's-impostos', nome: 'Impostos e taxas', emoji: '🏛️' },
  { id: 's-software', nome: 'Software e assinaturas', emoji: '💻' },
  { id: 's-alimentacao', nome: 'Alimentação', emoji: '🍔' },
  { id: 's-despesas', nome: 'Despesas', emoji: '🏠' },
  { id: 's-outros', nome: 'Outros', emoji: '🗂️' },
]

const padraoDe = (tipo) =>
  (tipo === 'entrada' ? PADRAO_ENTRADA : PADRAO_SAIDA).map((c) => ({
    ...c, tipo, padrao: true,
  }))

export function listar(tipo) {
  const criadas = ler(CHAVES.CATEGORIAS, [])
  return [...padraoDe(tipo), ...criadas.filter((c) => c.tipo === tipo)]
}

export function todas() {
  return [...padraoDe('entrada'), ...padraoDe('saida'), ...ler(CHAVES.CATEGORIAS, [])]
}

export function porId(id) {
  return todas().find((c) => c.id === id) ?? null
}

export function criar({ nome, emoji, tipo }) {
  const criadas = ler(CHAVES.CATEGORIAS, [])
  const nova = { id: gerarId('cat'), nome: nome.trim(), emoji, tipo, padrao: false }
  gravar(CHAVES.CATEGORIAS, [...criadas, nova])
  return nova
}

/*
 * As 3 mais usadas do tipo, para os cards do passo 1 (Figma 2279:94275).
 * "Mais usada" = mais transacoes ja lancadas naquela categoria. Sem historico,
 * cai nas 3 primeiras padrao, que e o que o Figma mostra num modulo novo.
 */
export function maisUsadas(tipo, transacoes, quantas = 3) {
  const contagem = new Map()
  transacoes.filter((t) => t.tipo === tipo).forEach((t) => {
    contagem.set(t.categoriaId, (contagem.get(t.categoriaId) ?? 0) + 1)
  })
  const lista = listar(tipo)
  const ordenadas = [...lista].sort(
    (a, b) => (contagem.get(b.id) ?? 0) - (contagem.get(a.id) ?? 0),
  )
  return ordenadas.slice(0, quantas)
}
