import { FolderSimplePlus } from '@phosphor-icons/react'
import { BarraSelecao } from '@squad/ui'
import copySimpleIcon from '../assets/icons/CopySimple.svg'
import trashIcon from '../assets/icons/Trash.svg'
import closeIcon from '../assets/icons/Close.svg'
import './BulkActionBar.css'

/*
 * Barra de ação em massa. A casca vem do @squad/ui desde a etapa 0; aqui ficam
 * as ações deste módulo ("Add em time" e "Duplicar") e os ícones locais.
 * O slot `acao` recebe as duas num fragmento, na mesma ordem do original.
 *
 * `pesoContagem` existe para este módulo: o compartilhado usa por padrão o
 * --peso-medio do Pesquisa de Clima (500), e aqui o peso continua sendo o
 * --font-weight-medium (510), para não mudar um pixel. Some quando os dois
 * "medium" forem unificados — ver docs/divida-tecnica.md.
 */
function BulkActionBar({ count, onAddEmTime, onDuplicate, onDelete, onClose }) {
  return (
    <BarraSelecao
      quantidade={count}
      pesoContagem="var(--font-weight-medium)"
      acao={
        <>
          <button
            type="button"
            className="bulk-action-bar__button"
            onClick={onAddEmTime}
          >
            Add em time
            <FolderSimplePlus size={24} />
          </button>

          <button
            type="button"
            className="bulk-action-bar__button"
            onClick={onDuplicate}
          >
            Duplicar
            <img src={copySimpleIcon} width={24} height={24} alt="" />
          </button>
        </>
      }
      iconeDeletar={<img src={trashIcon} width={24} height={24} alt="" />}
      iconeFechar={<img src={closeIcon} width={24} height={24} alt="" />}
      onDeletar={onDelete}
      onFechar={onClose}
    />
  )
}

export default BulkActionBar
