import { Barbell, Coin, ForkKnife, Gift, Key, Shield, Stethoscope, Tooth, Van } from '@phosphor-icons/react'

// Icones de categoria e de tipo no badge amarelo - Figma 10343:14473 e
// vizinhos, na cor #5D4309. Os SVGs do Figma com esses nomes (Stethoscope,
// Van) ja existem azuis no modulo, entao estes vem do Phosphor.
export const ICONES_CATEGORIA = {
  'Plano de saúde': Stethoscope,
  'Vale transporte': Van,
  'Vale alimentação': ForkKnife,
  'Bem-estar': Barbell,
  'Plano odontológico': Tooth,
  'Seguro de vida': Shield,
}

export const ICONES_TIPO = { beneficio: Gift, verba: Coin, licenca: Key }
