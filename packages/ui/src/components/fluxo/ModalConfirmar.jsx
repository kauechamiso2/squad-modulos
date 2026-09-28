import s from './ModalConfirmar.module.css'
import Botao from './Botao.jsx'
import IconeBotao from './IconeBotao.jsx'
import useModal from './useModal.js'

import close from '../../assets/icons/Close.svg'

/*
 * Confirmação genérica: título, um parágrafo e o par cancelar / confirmar.
 * Mesmo desenho dos outros modais do projeto.
 */
export default function ModalConfirmar({
  titulo,
  texto,
  rotuloConfirmar = 'Confirmar',
  rotuloCancelar = 'Cancelar',
  /* Os defaults sao os valores que o Pesquisa de Clima ja usava, para quem
     nao passar nada continuar identico. */
  largura,
  espacamento,
  iconeFechar = close,
  /* O Figma do Fluxo de Caixa alinha os dois botoes a direita com gap 12; o
     Pesquisa de Clima usa space-between. Default mantem o clima. */
  rodapeADireita = false,
  /* Sem escolha a fazer — o modal só explica por que a ação não acontece.
     Aí o par "Cancelar / Confirmar" viraria dois botões com o mesmo efeito, e
     fica só o de fechar. */
  soAviso = false,
  onConfirmar,
  onCancelar,
}) {
  const caixa = useModal(onCancelar)

  return (
    <div className={s.scrim}>
      <div
        className={`${s.modal} ${largura ? '' : s.modalCompacto}`}
        ref={caixa}
        role="dialog"
        aria-label={titulo}
        style={{ width: largura, gap: espacamento }}
      >
        <div className={s.cabecalho}>
          <p className={s.titulo}>{titulo}</p>
          <IconeBotao src={iconeFechar} rotulo="Fechar" onClick={onCancelar} />
        </div>

        <div className={s.texto}>{texto}</div>

        <div className={`${s.rodape} ${rodapeADireita ? s.rodapeDireita : ''}`}>
          {soAviso ? <span /> : <Botao onClick={onCancelar}>{rotuloCancelar}</Botao>}
          <Botao variante="marca" onClick={onConfirmar}>
            {rotuloConfirmar}
          </Botao>
        </div>
      </div>
    </div>
  )
}
