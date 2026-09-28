import s from './Editor.module.css'
import { Botao, IconeBotao, useModal } from '@squad/ui'

import close from '../../assets/icons/Close.svg'

/*
 * Confirmação ao fechar o fluxo antes de salvar.
 *
 * Mesma casca dos outros modais de confirmação do projeto, com um par de
 * ações em vez de "Cancelar / Confirmar": o X aqui não é uma pergunta de sim
 * ou não, é uma escolha entre jogar fora e guardar para depois. Fechar o
 * modal pelo X dele volta para o fluxo sem decidir nada.
 */
export default function ModalSairDoFluxo({ onDescartar, onSalvar, onCancelar, erro }) {
  const caixa = useModal(onCancelar)

  return (
    <div className={s.scrim}>
      <div
        className={`${s.modal} ${s.modalCompacto}`}
        ref={caixa}
        role="dialog"
        aria-label="Sair da criação?"
      >
        <div className={s.cabecalho}>
          <p className={s.titulo}>Sair da criação?</p>
          <IconeBotao src={close} rotulo="Fechar" onClick={onCancelar} />
        </div>

        <p className={s.texto}>
          A pesquisa ainda não foi salva. Você pode guardar o que já preencheu
          como rascunho e continuar depois, ou descartar tudo.
        </p>

        {/* Gravação que não passou: o modal fica aberto dizendo por quê, em
            vez de fechar como se tivesse salvado. */}
        {erro ? (
          <p className={s.erroSalvar} role="alert">
            {erro}
          </p>
        ) : null}

        <div className={s.rodape}>
          <Botao onClick={onDescartar}>Descartar</Botao>
          <Botao variante="marca" onClick={onSalvar}>
            Salvar como Rascunho
          </Botao>
        </div>
      </div>
    </div>
  )
}
