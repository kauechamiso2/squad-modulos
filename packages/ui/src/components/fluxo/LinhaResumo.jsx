import s from './LinhaResumo.module.css'
import IconeBotao from './IconeBotao.jsx'

import caretRight from '../../assets/icons/CaretRight.svg'

/*
 * Uma linha da lista de configuração. Três formas:
 * - com `valor`: mostra o valor e a seta que abre um modal;
 * - com `controle`: põe o que vier no lugar da seta (o interruptor);
 * - com `travado`: mostra o valor e mais nada, porque não há o que editar.
 *
 * `cortar` é para a mensagem final, que é longa e precisa de reticências.
 */
export default function LinhaResumo({
  rotulo,
  valor,
  controle,
  cortar = false,
  travado = false,
  onAbrir,
}) {
  const conteudo = (
    <>
      <span className={`${s.rotulo} ${cortar ? s.rotuloFixo : ''}`}>{rotulo}</span>
      {valor !== undefined ? (
        <span className={`${s.valor} ${cortar ? s.valorCortado : ''}`}>{valor}</span>
      ) : null}
    </>
  )

  return (
    <div className={s.linha}>
      {controle || travado ? (
        <div className={`${s.conteudo} ${cortar ? s.conteudoLargo : ''}`}>
          {conteudo}
        </div>
      ) : (
        <button
          type="button"
          className={`${s.botao} ${s.conteudo} ${cortar ? s.conteudoLargo : ''}`}
          onClick={onAbrir}
        >
          {conteudo}
        </button>
      )}
      {/* Travada não ganha seta: sem nada para abrir, ela só prometeria. */}
      {controle ?? (travado ? null : (
        <IconeBotao src={caretRight} rotulo={`Abrir ${rotulo}`} onClick={onAbrir} />
      ))}
    </div>
  )
}
