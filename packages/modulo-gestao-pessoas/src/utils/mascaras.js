// Mascaras dos campos do cadastro. O valor gravado e so digitos (CPF, CNPJ,
// telefone) ou data ISO; a mascara e so de exibicao e de digitacao.

export function soDigitos(texto, limite) {
  const digitos = String(texto ?? '').replace(/\D/g, '')
  return limite ? digitos.slice(0, limite) : digitos
}

function aplicar(digitos, molde) {
  let saida = ''
  let i = 0
  for (const char of molde) {
    if (i >= digitos.length) break
    if (char === '0') {
      saida += digitos[i]
      i += 1
    } else {
      saida += char
    }
  }
  return saida
}

// 000.000.000-00 - so a quantidade de digitos (11) e conferida.
export function mascaraCpf(digitos) {
  return aplicar(soDigitos(digitos, 11), '000.000.000-00')
}

export function cpfValido(digitos) {
  return soDigitos(digitos).length === 11
}

// 00.000.000/0000-00 - so a quantidade de digitos (14) e conferida.
export function mascaraCnpj(digitos) {
  return aplicar(soDigitos(digitos, 14), '00.000.000/0000-00')
}

export function cnpjValido(digitos) {
  return soDigitos(digitos).length === 14
}

// Telefone no formato do Figma (10338:10760): "11 98916 5456". Fixo, com 10
// digitos, fica "11 3456 7890".
export function mascaraTelefone(digitos) {
  const d = soDigitos(digitos, 11)
  return aplicar(d, d.length > 10 ? '00 00000 0000' : '00 0000 0000')
}

export function telefoneValido(digitos) {
  const tamanho = soDigitos(digitos).length
  return tamanho === 10 || tamanho === 11
}

export function emailValido(texto) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(texto ?? '').trim())
}

// Contato e Enviar para: { tipo: 'telefone' | 'email', valor }.
export const OPCOES_CONTATO = [
  { id: 'telefone', rotulo: 'Telefone' },
  { id: 'email', rotulo: 'Email' },
]

export function contatoValido(contato) {
  if (!contato?.valor) return false
  return contato.tipo === 'email' ? emailValido(contato.valor) : telefoneValido(contato.valor)
}

export function formatarContato(contato) {
  if (!contato?.valor) return null
  return contato.tipo === 'email' ? contato.valor : mascaraTelefone(contato.valor)
}

// DD/MM/AAAA <-> ISO
export function mascaraData(digitos) {
  return aplicar(soDigitos(digitos, 8), '00/00/0000')
}

export function dataDigitadaParaIso(digitos) {
  const d = soDigitos(digitos)
  if (d.length !== 8) return null
  const dia = Number(d.slice(0, 2))
  const mes = Number(d.slice(2, 4))
  const ano = Number(d.slice(4, 8))
  const data = new Date(ano, mes - 1, dia)
  if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) return null
  return `${d.slice(4, 8)}-${d.slice(2, 4)}-${d.slice(0, 2)}`
}

export function isoParaDigitos(iso) {
  if (!iso) return ''
  const [ano, mes, dia] = iso.split('-')
  return `${dia}${mes}${ano}`
}

export function formatarDataBr(iso) {
  return iso ? mascaraData(isoParaDigitos(iso)) : null
}

// Tipo da chave PIX, mostrado em cinza depois dela (Figma 10355:3778):
// e-mail, telefone com +, CNPJ (14 digitos), CPF (11 digitos) ou aleatoria.
// Uma chave sem formato conhecido nao ganha tipo.
export function tipoChavePix(chave) {
  const texto = String(chave ?? '').trim()
  if (!texto) return null
  if (texto.includes('@')) return 'Email'
  if (texto.startsWith('+')) return 'Telefone'
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(texto)) return 'Aleatória'
  const digitos = texto.replace(/\D/g, '')
  if (/^[\d.\-/ ]+$/.test(texto) && digitos.length === 14) return 'CNPJ'
  if (/^[\d.\- ]+$/.test(texto) && digitos.length === 11) return 'CPF'
  return null
}
