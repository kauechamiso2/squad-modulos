import { MagnifyingGlass, X, Microphone, PaperPlaneRight } from '@phosphor-icons/react'
import { BottomSearchBar as BottomSearchBarUI } from '@squad/ui'

import pipoAvatar from '../assets/images/PipoAvatar.png'

/*
 * Barra de busca flutuante. A casca vem do @squad/ui desde a etapa 0; aqui
 * ficam o placeholder deste modulo e os icones do Phosphor.
 */
export default function BottomSearchBar({ onBuscar }) {
  return (
    <BottomSearchBarUI
      placeholder="Buscar uma pesquisa..."
      avatarAssistente={pipoAvatar}
      icones={{
        lupa: <MagnifyingGlass size={20} color="#798282" />,
        fecharBusca: <X size={20} color="#000000" />,
        microfone: <Microphone size={20} color="#5d4309" />,
        enviar: <PaperPlaneRight size={20} color="#5d4309" />,
        fecharAssistente: <X size={20} color="#5d4309" />,
      }}
      onBuscar={onBuscar}
    />
  )
}
