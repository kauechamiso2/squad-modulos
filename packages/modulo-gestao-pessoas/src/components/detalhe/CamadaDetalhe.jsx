import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './Detalhe.css'

/*
 * Paineis e modais abertos de dentro de uma pagina de detalhe. Vao para a
 * .gp-modulo por portal: dentro do painel ficariam presos a ele (o painel tem
 * transform), herdariam as --painel-* dele e, na tela cheia (z-index 200),
 * ficariam por baixo. A camada fica acima dos dois modos.
 *
 * O destino e procurado depois de montar: aberta por link, a pagina renderiza
 * junto com a propria .gp-modulo, que ainda nao esta no DOM no primeiro
 * render.
 */
function CamadaDetalhe({ children }) {
  const marcaRef = useRef(null)
  const [destino, setDestino] = useState(null)

  useLayoutEffect(() => {
    const encontrado = marcaRef.current?.closest('.gp-modulo') ?? document.querySelector('.gp-modulo')
    if (!encontrado) throw new Error('CamadaDetalhe precisa estar dentro de .gp-modulo')
    setDestino(encontrado)
  }, [])

  return (
    <>
      <span ref={marcaRef} hidden />
      {destino && createPortal(<div className="detalhe-camada">{children}</div>, destino)}
    </>
  )
}

export default CamadaDetalhe
