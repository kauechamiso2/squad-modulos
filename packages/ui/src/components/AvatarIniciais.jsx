import s from './AvatarIniciais.module.css'

const CORES = ['#1a73e8', '#188038', '#186880', '#d53943', '#8c54ff']

/* Cor estavel a partir do nome (o mock usa #1a73e8 e #188038). */
export function corDoNome(nome) {
  let h = 0
  for (const ch of String(nome)) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return CORES[h % CORES.length]
}

/*
 * Iniciais do avatar. O Figma (2279:95017) mostra "Juliano Abravanel Teixeira"
 * como "JA" - primeira e SEGUNDA palavra, nao primeira e ultima.
 */
export function iniciais(nome) {
  const partes = String(nome ?? '').trim().split(/\s+/).filter(Boolean)
  if (!partes.length) return '?'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[1][0]).toUpperCase()
}

/* Circulo de 24px com duas iniciais. Usado no fluxo de Nova Entrada e no
   dropdown de Contato do Fluxo de Caixa. */
export default function AvatarIniciais({ nome, tamanho = 24, fonte = 10 }) {
  return (
    <span
      className={s.avatar}
      style={{ background: corDoNome(nome), width: tamanho, height: tamanho, fontSize: fonte }}
      aria-hidden="true"
    >
      {iniciais(nome)}
    </span>
  )
}
