import { BarraSelecao } from '@squad/ui'
import folderSimplePlusIcon from '../assets/icons/FolderSimplePlus.svg'
import trashIcon from '../assets/icons/Trash.svg'
import closeIcon from '../assets/icons/Close.svg'
import './BulkActionBar.css'

/*
 * Barra de ação em massa - Figma 10331:3515. A casca vem do @squad/ui desde a
 * etapa 0; aqui ficam a ação deste módulo ("Add em time", com o
 * FolderSimplePlus) e os ícones locais. Não existe Duplicar.
 *
 * `pesoContagem` existe para este módulo: o compartilhado usa por padrão o
 * --peso-medio do Pesquisa de Clima (500), e aqui o peso continua sendo o
 * --font-weight-medium (510), para não mudar um pixel. Some quando os dois
 * "medium" forem unificados — ver docs/divida-tecnica.md.
 */
function BulkActionBar({ count, onAddEmTime, onDelete, onClose }) {
  return (
    <BarraSelecao
      quantidade={count}
      pesoContagem="var(--font-weight-medium)"
      acao={
        <button type="button" className="bulk-action-bar__button" onClick={onAddEmTime}>
          Add em time
          <img src={folderSimplePlusIcon} width={24} height={24} alt="" />
        </button>
      }
      iconeDeletar={<img src={trashIcon} width={24} height={24} alt="" />}
      iconeFechar={<img src={closeIcon} width={24} height={24} alt="" />}
      onDeletar={onDelete}
      onFechar={onClose}
    />
  )
}

export default BulkActionBar
