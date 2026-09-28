import s from './Interruptor.module.css'

/*
 * `pequeno` é a variante do interruptor de "Tornar obrigatória" (Figma
 * 8197:3650): mesma proporção, 50x22 em vez de 64x28. Ele fica no cabeçalho
 * do cartão da pergunta, ao lado dos ícones de 24px, e no tamanho cheio
 * puxava o olho para si — o controle é secundário ali, e as linhas de
 * configuração continuam com o interruptor grande.
 */
export default function Interruptor({
  ligado = false,
  desabilitado = false,
  pequeno = false,
  rotulo,
  onAlternar,
}) {
  return (
    <button
      type="button"
      className={`${s.interruptor} ${ligado ? s.ligado : s.desligado} ${
        pequeno ? s.pequeno : ''
      } ${desabilitado ? s.desabilitado : ''}`}
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      disabled={desabilitado}
      onClick={onAlternar}
    >
      <span className={s.botao} />
    </button>
  )
}
