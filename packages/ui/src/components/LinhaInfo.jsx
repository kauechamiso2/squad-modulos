import s from './LinhaInfo.module.css'

/*
 * Linha "rótulo / valor" do painel de detalhe. Nasceu no detalhe do colaborador
 * do Gestao de Pessoas (`.colaborador-detail__row`) e o resumo de transacao do
 * Fluxo de Caixa usa a mesma geometria: 62px de altura, padding 16/0, rotulo
 * 14/500 numa coluna fixa.
 *
 * `--linha-rotulo-largura`  140 no GP · 190 no Fluxo de Caixa
 * `--linha-gap`             12 no GP · o FC posiciona pelo rotulo
 */
export default function LinhaInfo({ icone, rotulo, className = '', children }) {
  return (
    <div className={`${s.linha} ${className}`.trim()}>
      {icone ? <span className={s.icone}>{icone}</span> : null}
      <span className={s.rotulo}>{rotulo}</span>
      {children}
    </div>
  )
}
