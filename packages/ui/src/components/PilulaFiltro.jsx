import s from './PilulaFiltro.module.css'

/*
 * Pilula de filtro: cinza em repouso, preta quando selecionada, com um X para
 * limpar quando selecionada.
 *
 * Estava duplicada em tres lugares - o painel de Filtros do Gestao de Pessoas
 * (`filtros-panel__pill`), o do Pesquisa de Clima (`.pilula`) e agora o do
 * Fluxo de Caixa. Os defaults sao os valores do GP, para os dois modulos
 * antigos continuarem identicos.
 *
 * `--pilula-peso`   400 no GP e no clima · 500 no Fluxo de Caixa
 * `--pilula-fundo`  fundo em repouso
 */
export default function PilulaFiltro({
  selecionada = false,
  iconeLimpar,
  /* Icone fixo a direita (o CaretDown dos chips de categoria e repeticao). */
  iconeDireita,
  onClick,
  onLimpar,
  children,
}) {
  return (
    <button
      type="button"
      className={`${s.pilula} ${selecionada ? s.selecionada : ''}`}
      aria-pressed={selecionada}
      onClick={onClick}
    >
      {children}
      {iconeDireita}
      {selecionada && iconeLimpar ? (
        /* O X vive dentro do botao: um <button> aninhado seria HTML invalido.
           Quem passa `onLimpar` recebe o clique so quando ele parte do X. */
        <span
          className={s.limpar}
          role="button"
          tabIndex={-1}
          aria-label="Limpar filtro"
          onClick={(e) => {
            if (!onLimpar) return
            e.stopPropagation()
            onLimpar()
          }}
        >
          {iconeLimpar}
        </span>
      ) : null}
    </button>
  )
}
