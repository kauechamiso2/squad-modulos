/*
 * Leitura e escrita no localStorage, com os tres modos de falha tratados, no
 * mesmo padrao do lib/pesquisas.js do Pesquisa de Clima:
 *
 *  - bloqueado: modo privado, cookies desativados, storage desligado
 *  - formato:   o que esta guardado nao e a lista que esperavamos
 *  - ilegivel:  JSON corrompido
 *
 * Engolir a falha faria cada edicao parecer salva e sumir no F5 seguinte.
 */

const PREFIXO = 'squad:fluxo-caixa:'

export const CHAVES = {
  TRANSACOES: 'transacoes',
  CATEGORIAS: 'categorias',
  CONTATOS: 'contatos',
  FILTROS: 'filtros',
}

const chave = (nome) => `${PREFIXO}${nome}`

export const MENSAGENS = {
  bloqueado: 'Não foi possível acessar seus dados — o navegador está bloqueando o armazenamento local desta página.',
  formato: 'Não foi possível carregar seus dados — o que está guardado não tem o formato esperado.',
  ilegivel: 'Não foi possível carregar seus dados — eles podem estar corrompidos.',
}

export const ERRO_AO_GRAVAR =
  'Não foi possível salvar. O espaço de armazenamento pode estar cheio.'

let ultimoErro = null
export const erroDeLeitura = () => ultimoErro

export function ler(nome, padrao) {
  ultimoErro = null
  let cru
  try {
    cru = localStorage.getItem(chave(nome))
  } catch {
    ultimoErro = 'bloqueado'
    return padrao
  }
  if (cru === null) return padrao
  try {
    const valor = JSON.parse(cru)
    if (Array.isArray(padrao) && !Array.isArray(valor)) {
      ultimoErro = 'formato'
      return padrao
    }
    return valor
  } catch {
    ultimoErro = 'ilegivel'
    return padrao
  }
}

export function gravar(nome, valor) {
  try {
    localStorage.setItem(chave(nome), JSON.stringify(valor))
    return true
  } catch {
    return false
  }
}

export function limparTudo() {
  Object.values(CHAVES).forEach((n) => {
    try { localStorage.removeItem(chave(n)) } catch { /* storage bloqueado */ }
  })
}

export function gerarId(prefixo = 't') {
  return `${prefixo}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}
