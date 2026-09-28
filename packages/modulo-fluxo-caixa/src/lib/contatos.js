import { CHAVES, ler, gravar, gerarId } from './armazenamento.js'
import { apenasDigitos, detectarTipo, formatarDocumento } from './documentos.js'

/*
 * Lista unica, compartilhada por Entrada e Saida: a mesma pessoa pode ser
 * pagadora numa transacao e recebedora em outra, e cadastra-la duas vezes
 * deixaria o historico partido.
 */
export function listar() {
  return ler(CHAVES.CONTATOS, [])
}

export function porId(id) {
  return listar().find((c) => c.id === id) ?? null
}

export function criar({ nome, documento }) {
  const tipoDocumento = documento ? detectarTipo(documento) : null
  const novo = {
    id: gerarId('ct'),
    nome: String(nome).trim(),
    documento: documento ? apenasDigitos(documento) : null,
    tipoDocumento,
  }
  gravar(CHAVES.CONTATOS, [...listar(), novo])
  return novo
}

/* Busca por nome, CPF, CNPJ ou telefone (Figma 2279:94977). */
export function buscar(termo) {
  const t = String(termo ?? '').trim().toLowerCase()
  if (!t) return []
  const digitos = apenasDigitos(t)
  return listar().filter((c) => {
    if (c.nome.toLowerCase().includes(t)) return true
    if (digitos && c.documento && c.documento.includes(digitos)) return true
    return false
  })
}

export const documentoVisivel = (c) =>
  c?.documento ? formatarDocumento(c.documento, c.tipoDocumento) : null

/*
 * Texto da coluna Contato e do campo Pagador/Recebedor.
 *
 * A regra vem da linha y=9936 da secao Entrada (2279:95641, 95754, 95867,
 * 95980, 96093, 96206): uma linha so, com o nome quando o contato foi salvo e
 * com o que foi vinculado - CPF, CNPJ, telefone ou o nome digitado - quando
 * nao foi. Um contato salvo sem nome cai no documento.
 *
 * O formato de duas linhas que aparece em 2279:96320 e 2279:97011 e variacao
 * do mock, nao regra.
 */
export function rotuloDaTransacao(transacao) {
  if (transacao?.contatoId) {
    const c = porId(transacao.contatoId)
    if (c) return c.nome?.trim() || documentoVisivel(c) || ''
  }
  if (transacao?.contatoAvulso) {
    const t = detectarTipo(transacao.contatoAvulso)
    return t ? formatarDocumento(transacao.contatoAvulso, t) : transacao.contatoAvulso
  }
  return ''
}
