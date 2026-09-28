/*
 * Reconhece e formata CPF, CNPJ e telefone pelo formato dos digitos.
 * O passo 3 do fluxo aceita os tres no mesmo campo, entao a deteccao e por
 * quantidade de digitos - nao ha seletor de tipo na tela.
 */

export function apenasDigitos(v) {
  return String(v ?? '').replace(/\D/g, '')
}

/* 11 digitos: pode ser CPF ou celular. Celular brasileiro tem o 9 na terceira
   casa depois do DDD; CPF nao tem essa regra, mas na pratica o que distingue e
   o usuario ter digitado com mascara de telefone. Sem essa pista, 11 digitos
   comecando com DDD valido (11-99) e o 9 na sequencia vira telefone. */
export function detectarTipo(valor) {
  const d = apenasDigitos(valor)
  if (d.length === 14) return 'cnpj'
  if (d.length === 11) {
    const ddd = parseInt(d.slice(0, 2), 10)
    if (ddd >= 11 && ddd <= 99 && d[2] === '9') return 'telefone'
    return 'cpf'
  }
  if (d.length === 10) {
    const ddd = parseInt(d.slice(0, 2), 10)
    if (ddd >= 11 && ddd <= 99) return 'telefone'
  }
  return null
}

export function formatarDocumento(valor, tipo = detectarTipo(valor)) {
  const d = apenasDigitos(valor)
  if (tipo === 'cpf' && d.length === 11) {
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
  }
  if (tipo === 'cnpj' && d.length === 14) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
  }
  if (tipo === 'telefone') {
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  }
  return String(valor ?? '')
}

export const ROTULO_TIPO = { cpf: 'CPF', cnpj: 'CNPJ', telefone: 'Telefone' }

/*
 * Iniciais do avatar. O Figma (2279:95017) mostra "Juliano Abravanel Teixeira"
 * como "JA" - primeira e SEGUNDA palavra, nao primeira e ultima. Um nome de
 * uma palavra so usa as duas primeiras letras dele.
 */
export function iniciais(nome) {
  const partes = String(nome ?? '').trim().split(/\s+/).filter(Boolean)
  if (!partes.length) return '?'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[1][0]).toUpperCase()
}

/*
 * Digitos verificadores.
 *
 * A validacao existe por dois motivos: o passo 3 so deve chamar a API da
 * Receita com um CNPJ que pode existir (anotacao 2279:96450), e para o CPF e a
 * unica checagem possivel - nao ha base publica de nomes (anotacao 2279:96452:
 * "o nome ligado a um CPF e dado pessoal, protegido pela LGPD").
 */

function digitoVerificador(base, pesos) {
  const soma = pesos.reduce((acc, peso, i) => acc + Number(base[i]) * peso, 0)
  const resto = soma % 11
  return resto < 2 ? 0 : 11 - resto
}

export function cpfValido(valor) {
  const d = apenasDigitos(valor)
  if (d.length !== 11) return false
  if (/^(\d)\1{10}$/.test(d)) return false
  const d1 = digitoVerificador(d, [10, 9, 8, 7, 6, 5, 4, 3, 2])
  const d2 = digitoVerificador(d, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2])
  return d1 === Number(d[9]) && d2 === Number(d[10])
}

export function cnpjValido(valor) {
  const d = apenasDigitos(valor)
  if (d.length !== 14) return false
  if (/^(\d)\1{13}$/.test(d)) return false
  const d1 = digitoVerificador(d, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const d2 = digitoVerificador(d, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  return d1 === Number(d[12]) && d2 === Number(d[13])
}

export function documentoValido(valor, tipo = detectarTipo(valor)) {
  if (tipo === 'cpf') return cpfValido(valor)
  if (tipo === 'cnpj') return cnpjValido(valor)
  if (tipo === 'telefone') return apenasDigitos(valor).length >= 10
  return false
}

/*
 * Mascara enquanto digita, no campo de busca do passo 3 (Figma 2279:94977
 * mostra "11.222.333/0001-81" formatado dentro do input).
 *
 * So age quando o que foi digitado e apenas numero e pontuacao - um nome com
 * letras passa intacto, porque o mesmo campo aceita os dois.
 */
export function mascararEnquantoDigita(valor) {
  const bruto = String(valor ?? '')
  if (!bruto || /[^\d.\-/() ]/.test(bruto)) return bruto
  const d = apenasDigitos(bruto)
  if (!d) return bruto
  if (d.length > 14) return bruto

  // Telefone: comeca por "(" ou ja tem DDD valido com 9 na sequencia.
  const pareceTelefone =
    bruto.trim().startsWith('(') ||
    (d.length >= 3 && d[2] === '9' && Number(d.slice(0, 2)) >= 11)

  if (pareceTelefone && d.length <= 11) {
    if (d.length <= 2) return `(${d}`
    const meio = d.length <= 6 ? 4 : d.length <= 10 ? 4 : 5
    const a = d.slice(2, 2 + meio)
    const b = d.slice(2 + meio)
    return `(${d.slice(0, 2)}) ${a}${b ? `-${b}` : ''}`
  }

  if (d.length <= 11) {
    // CPF: 000.000.000-00
    return d
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
  }
  // CNPJ: 00.000.000/0000-00
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5')
}

/*
 * A BrasilAPI devolve o nome em caixa alta ("PETROBRAS - EDISE"). O Figma
 * escreve em caixa normal ("Diterranio casamento LTDA"), entao normalizamos -
 * mas as siglas societarias continuam maiusculas, que e como se escreve.
 */
const SIGLAS = new Set(['LTDA', 'ME', 'EPP', 'EIRELI', 'MEI', 'SA', 'S/A', 'S.A.', 'CIA'])

export function caixaDeNomeEmpresarial(nome) {
  const texto = String(nome ?? '').trim()
  if (!texto) return ''
  // Se ja veio em caixa mista, quem escreveu decidiu - nao mexemos.
  if (texto !== texto.toUpperCase()) return texto

  return texto
    .toLowerCase()
    .split(/(\s+)/)
    .map((pedaco) => {
      if (/^\s+$/.test(pedaco)) return pedaco
      const seco = pedaco.replace(/[.,]/g, '').toUpperCase()
      if (SIGLAS.has(seco)) return pedaco.toUpperCase()
      return pedaco.charAt(0).toUpperCase() + pedaco.slice(1)
    })
    .join('')
}
