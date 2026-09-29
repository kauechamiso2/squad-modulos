const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export function todayIso() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function formatDatePt(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return `${day} ${MONTHS_PT[month - 1]} ${year}`
}

const MONTHS_PT_SHORT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

export function formatShortDatePt(isoDate) {
  const [year, month] = isoDate.split('-').map(Number)
  return `${MONTHS_PT_SHORT[month - 1]} ${String(year).slice(-2)}`
}

export function formatDateDMonthYear(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return `${day} ${MONTHS_PT_SHORT[month - 1]} ${year}`
}

export function centsToAmount(digits) {
  if (!digits) return 0
  return parseInt(digits, 10) / 100
}

export function amountToDigits(value) {
  if (!value) return ''
  return Math.round(value * 100).toString()
}

export function formatAmountFromDigits(digits) {
  return centsToAmount(digits).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatCurrencyBRL(value) {
  return `R$${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function formatFaixaSalarial(min, max) {
  if (min == null || max == null) return '—'
  if (min === max) return formatCurrencyBRL(min)
  return `${formatCurrencyBRL(min)} - ${formatCurrencyBRL(max)}`
}

export function formatPaymentValue(value, tipoPagamento) {
  const base = formatCurrencyBRL(value)
  if (tipoPagamento === 'Mensal') return `${base} / mês`
  if (tipoPagamento === 'Anual') return `${base} / ano`
  return base
}

function slugifyNamePart(word) {
  return word
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

// "José da Silva Santos" -> "jose.santos@" - first and last word, lowercase,
// accents and spaces stripped. Used to pre-fill the Email field in the Novo
// Colaborador CLT flow.
export function buildEmailPrefix(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  const first = slugifyNamePart(parts[0])
  if (parts.length === 1) return `${first}@`
  const last = slugifyNamePart(parts[parts.length - 1])
  return `${first}.${last}@`
}
