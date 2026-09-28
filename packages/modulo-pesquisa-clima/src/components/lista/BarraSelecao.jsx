import { CopySimple } from '@phosphor-icons/react'
import { BarraSelecao as BarraSelecaoUI, Botao } from '@squad/ui'

import trashIcon from '../../assets/icons/Trash.svg'
import closeIcon from '../../assets/icons/Close.svg'

/*
 * Barra de acoes em massa da lista. A casca vem do @squad/ui desde a etapa 0;
 * aqui ficam so os textos e os icones deste modulo.
 */
export default function BarraSelecao({ quantidade, onDuplicar, onDeletar, onFechar }) {
  return (
    <BarraSelecaoUI
      quantidade={quantidade}
      acao={
        <Botao variante="contorno" onClick={onDuplicar}>
          Duplicar
          <CopySimple size={24} />
        </Botao>
      }
      iconeDeletar={<img src={trashIcon} width={24} height={24} alt="" />}
      iconeFechar={<img src={closeIcon} width={24} height={24} alt="" />}
      onDeletar={onDeletar}
      onFechar={onFechar}
    />
  )
}
