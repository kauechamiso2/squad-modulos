import { todayIso } from './formatters.js'

// Nota nova com o dia e a hora locais de agora. Mesmo formato nas tres
// paginas: { text, timestamp }. O dia vem de todayIso(), e nao do ISO em
// UTC, para a nota da noite nao sair com a data de amanha.
export function novaNota(texto, agora = new Date()) {
  const doisDigitos = (numero) => String(numero).padStart(2, '0')
  const hora = `${doisDigitos(agora.getHours())}:${doisDigitos(agora.getMinutes())}:${doisDigitos(agora.getSeconds())}`
  return { text: texto, timestamp: `${todayIso()}T${hora}` }
}
