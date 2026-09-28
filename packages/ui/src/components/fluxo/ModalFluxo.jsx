import s from './ModalFluxo.module.css'
import Botao from './Botao.jsx'
import IconeBotao from './IconeBotao.jsx'
import useModal from './useModal.js'

import close from '../../assets/icons/Close.svg'

/*
 * Casca dos modais do fluxo: scrim, card, título com X e rodapé
 * Voltar / Salvar. O miolo vem por children.
 *
 * `salvarDesabilitado` trava o Salvar enquanto o que está preenchido não
 * serve, e `erro` diz por quê, ao lado do botão. Um modal que aceita um valor
 * inválido e depois usa outro por baixo é pior do que um que não deixa salvar.
 */
export default function ModalFluxo({
  titulo,
  espacamento = 40,
  salvarDesabilitado = false,
  erro,
  onVoltar,
  onSalvar,
  onFechar,
  children,
}) {
  const caixa = useModal(onFechar)

  return (
    <div className={s.scrim}>
      <div
        className={s.modal}
        ref={caixa}
        role="dialog"
        aria-label={titulo}
        style={{ gap: `${espacamento}px` }}
      >
        <div className={s.cabecalho}>
          <p className={s.titulo}>{titulo}</p>
          <IconeBotao src={close} rotulo="Fechar" onClick={onFechar} />
        </div>

        <div className={s.corpo}>{children}</div>

        <div className={s.rodape}>
          <Botao onClick={onVoltar}>Voltar</Botao>
          {erro ? (
            <p className={s.erro} role="alert">
              {erro}
            </p>
          ) : null}
          <Botao
            variante="marca"
            desabilitado={salvarDesabilitado}
            onClick={onSalvar}
          >
            Salvar
          </Botao>
        </div>
      </div>
    </div>
  )
}
