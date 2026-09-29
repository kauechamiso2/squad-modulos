import { BottomSearchBar as BottomSearchBarUI } from '@squad/ui'
import magnifyingGlassIcon from '../assets/icons/MagnifyingGlassGray.svg'
import closeIcon from '../assets/icons/Close.svg'
import microphoneIcon from '../assets/icons/Microphone.svg'
import paperPlaneRightIcon from '../assets/icons/PaperPlaneRight.svg'
import pipoAvatarImage from '../assets/illustrations/Pipo.png'

const PLACEHOLDERS = {
  colaboradores: 'Buscar uma pessoa...',
  times: 'Buscar um time...',
  beneficios: 'Buscar um benefício...',
}

/*
 * Barra de busca flutuante. A casca vem do @squad/ui desde a etapa 0; aqui
 * ficam os SVGs locais deste módulo e o placeholder, que muda por aba.
 *
 * `corPlaceholder` existe para este módulo: o compartilhado usa por padrão o
 * --cor-texto-secundario do Pesquisa de Clima (#6a7272, escurecido para WCAG
 * AA), e aqui o valor continua sendo o --color-text-secondary (#798282), para
 * não mudar um pixel. Some quando a paleta for propagada — ver
 * docs/divida-tecnica.md.
 */
function BottomSearchBar({ activeTab, onSearchChange }) {
  return (
    <BottomSearchBarUI
      placeholder={PLACEHOLDERS[activeTab]}
      avatarAssistente={pipoAvatarImage}
      corPlaceholder="var(--color-text-secondary)"
      icones={{
        lupa: <img src={magnifyingGlassIcon} width={20} height={20} alt="" />,
        fecharBusca: <img src={closeIcon} width={20} height={20} alt="Fechar busca" />,
        microfone: <img src={microphoneIcon} width={20} height={20} alt="" />,
        enviar: <img src={paperPlaneRightIcon} width={20} height={20} alt="" />,
        fecharAssistente: <img src={closeIcon} width={20} height={20} alt="Fechar Pipo" />,
      }}
      onBuscar={onSearchChange}
    />
  )
}

export default BottomSearchBar
