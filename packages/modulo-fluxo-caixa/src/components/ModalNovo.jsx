import { CurrencyDollarSimple, ArrowUp, ArrowDown, X } from '@phosphor-icons/react'
import { useModal } from '@squad/ui'
import s from './ModalNovo.module.css'

/*
 * Modal do botao "Novo" (Figma 2279:100823).
 *
 * O X fica acima do card, nao dentro - e o que o Figma desenha.
 */
function ModalNovo({ onFechar, onNovaEntrada, onNovaSaida }) {
  const caixa = useModal(onFechar)

  return (
    <div className={s.scrim}>
      <div className={s.coluna} ref={caixa} role="dialog" aria-label="O que você gostaria de adicionar agora?">
        <button type="button" className={s.fechar} aria-label="Fechar" onClick={onFechar}>
          <X size={24} />
        </button>

        <div className={s.modal}>
          <h2 className={s.titulo}>
            O que você gostaria
            <br />
            de <span className={s.destaque}>adicionar agora?</span>
          </h2>

          <div className={s.opcoes}>
            <button type="button" className={s.opcao} onClick={onNovaEntrada}>
              <span className={s.tile}>
                <span className={`${s.moeda} ${s.moedaEntrada}`}>
                  <CurrencyDollarSimple size={36} weight="regular" />
                </span>
                <span className={`${s.selo} ${s.seloEntrada}`}>+$$$</span>
                <span className={`${s.seta} ${s.setaEntrada}`}>
                  <ArrowUp size={16} weight="bold" />
                </span>
              </span>
              <span className={s.rotulo}>Nova Entrada</span>
            </button>

            <button type="button" className={s.opcao} onClick={onNovaSaida}>
              <span className={s.tile}>
                <span className={`${s.moeda} ${s.moedaSaida}`}>
                  <CurrencyDollarSimple size={36} weight="regular" />
                </span>
                <span className={`${s.selo} ${s.seloSaida}`}>-$$$</span>
                <span className={`${s.seta} ${s.setaSaida}`}>
                  <ArrowDown size={16} weight="bold" />
                </span>
              </span>
              <span className={s.rotulo}>Nova Despesa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalNovo
