import { Stethoscope, Bus, ForkKnife, Barbell, Tooth, Shield, Gift } from '@phosphor-icons/react'

export const BENEFICIO_TYPES = [
  'Plano de Saúde',
  'Vale Transporte',
  'Vale Alimentação',
  'Bem-Estar',
  'Plano Odontológico',
  'Seguro de Vida',
  'Outro',
]

const TYPE_ICON_BY_NAME = {
  'Plano de Saúde': Stethoscope,
  'Vale Transporte': Bus,
  'Vale Alimentação': ForkKnife,
  'Bem-Estar': Barbell,
  'Plano Odontológico': Tooth,
  'Seguro de Vida': Shield,
  Outro: Gift,
}

export function getBeneficioTypeIcon(tipo) {
  return TYPE_ICON_BY_NAME[tipo] ?? Gift
}

// The value a benefit is matched against when filtering by "Tipo de
// benefício": one of the 6 named types, or - for "Outro" - its Fixo/Verba
// subtype instead of the generic "Outro" label. Legacy seed benefits carry
// no tipo at all and simply never match a tipo filter.
export function getBenefitFilterTipo(benefit) {
  if (!benefit.tipo) return null
  if (benefit.tipo === 'Outro') return benefit.outroSubtipo ?? null
  return benefit.tipo
}

export const BENEFICIO_PROVIDER_SUGGESTIONS = {
  'Plano de Saúde': [
    'Alice',
    'Amil',
    'SulAmérica',
    'Bradesco Saúde',
    'Hapvida NotreDame Intermédica',
    'Unimed',
    'Porto Seguro Saúde',
  ],
  'Vale Transporte': ['Bilhete Único', 'Uber', '99', 'VEM'],
  'Vale Alimentação': ['Caju', 'VR', 'Ticket', 'Alelo', 'Swile', 'Pluxee'],
  'Bem-Estar': ['Wellhub', 'TotalPass', 'SmartFit'],
  'Plano Odontológico': [
    'Odontoprev',
    'Amil Dental',
    'SulAmérica Odonto',
    'Bradesco Dental',
    'Uniodonto',
  ],
  'Seguro de Vida': [
    'Porto Seguro Vida',
    'Bradesco Vida e Previdência',
    'MetLife',
    'Prudential',
    'SulAmérica Vida',
  ],
}
