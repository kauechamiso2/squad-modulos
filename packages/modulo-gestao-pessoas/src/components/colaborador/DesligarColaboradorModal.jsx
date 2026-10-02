import { createPortal } from 'react-dom'
import { IconButton, useModal } from '@squad/ui'
import closeIcon from '../../assets/icons/Close.svg'
import powerRedIcon from '../../assets/icons/PowerRed.svg'
import '../campos/Botoes.css'
import './DesligarColaboradorModal.css'

/*
 * "Desligar {Nome}?" - Figma 10355:4783. Layout proprio, nao o modal de
 * confirmacao compartilhado: 393px, badge vermelho com o Power, titulo em
 * duas linhas e os botoes nas pontas. Confirmar abre o fluxo de
 * desligamento.
 *
 * Vai para a .gp-modulo por portal: aberto da pagina do colaborador, ficaria
 * preso ao painel (que tem transform) e por baixo do veu dele.
 */
function DesligarColaboradorModal({ name, onCancel, onConfirm }) {
  const caixaRef = useModal(onCancel)
  const destino = document.querySelector('.gp-modulo')
  if (!destino) throw new Error('DesligarColaboradorModal precisa estar dentro de .gp-modulo')

  return createPortal(
    <div className="desligar-modal__veu" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <div className="desligar-modal__pilha" ref={caixaRef} role="dialog" aria-modal="true" aria-labelledby="desligar-modal-titulo">
        <IconButton icon={closeIcon} alt="Fechar" onClick={onCancel} className="desligar-modal__fechar" />
        <div className="desligar-modal">
          <span className="desligar-modal__badge">
            <img src={powerRedIcon} width={24} height={24} alt="" />
          </span>
          <div className="desligar-modal__textos">
            <h2 className="desligar-modal__titulo" id="desligar-modal-titulo">
              Desligar
              <br />
              {name}?
            </h2>
            <p className="desligar-modal__texto">
              Tem certeza que quer desligar o colaborador {name}? Os campos ficarão bloqueados para edição, mas você
              continuará vendo o perfil. Essa ação não pode ser desfeita.
            </p>
          </div>
          <div className="desligar-modal__botoes">
            <button type="button" className="gp-botao-texto" onClick={onCancel}>
              Cancelar
            </button>
            <button type="button" className="gp-botao" onClick={onConfirm}>
              Desligar
            </button>
          </div>
        </div>
      </div>
    </div>,
    destino,
  )
}

export default DesligarColaboradorModal
