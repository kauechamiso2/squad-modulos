import { useEffect, useRef } from 'react'

/*
 * Foco no primeiro campo do painel assim que ele abre.
 *
 * O PainelLateral com `prenderFoco` usa o useModal, que foca o primeiro
 * elemento focavel do painel - o X do cabecalho. O atributo `data-foco-inicial`
 * diz a ele para focar este campo em vez disso; o `focus()` aqui cobre o caso
 * de o painel abrir sem `prenderFoco`.
 */
export default function useFocoInicial() {
  const ref = useRef(null)
  useEffect(() => {
    if (document.activeElement !== ref.current) ref.current?.focus()
  }, [])
  return { ref, 'data-foco-inicial': true }
}
