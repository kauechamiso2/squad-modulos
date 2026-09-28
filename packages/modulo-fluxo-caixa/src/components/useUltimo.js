import { useRef } from 'react'

/*
 * Guarda o ultimo valor nao nulo.
 *
 * Os paineis ficam montados para poder animar a saida, entao continuam
 * renderizando por ~280ms depois de o dado sumir. Sem isto o conteudo piscaria
 * vazio no meio da animacao de fechamento.
 */
export default function useUltimo(valor) {
  const guardado = useRef(valor)
  if (valor != null && valor !== false) guardado.current = valor
  return valor ?? guardado.current
}
