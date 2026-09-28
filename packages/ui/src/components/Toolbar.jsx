import s from './Toolbar.module.css'

/*
 * Barra de total + filtros. Os dois modulos que a usam tem a mesma geometria;
 * o que muda e o texto e o peso (ver o .module.css).
 */
export function Toolbar({ children, style }) {
  return <div className={s.barra} style={style}>{children}</div>
}

export function TotalItens({ children }) {
  return <span className={s.total}>{children}</span>
}

export function AcoesToolbar({ children }) {
  return <div className={s.acoes}>{children}</div>
}

/*
 * `onClick` torna o corpo do chip clicavel, separado do X. O Fluxo de Caixa
 * usa isso: clicar no texto abre o painel de Filtros e o X faz outra coisa
 * (Figma 2279:105668). Sem ele o chip fica como sempre foi no GP.
 */
export function ChipFiltro({ texto, iconeLimpar, onLimpar, onClick, comoBotao = false }) {
  if (comoBotao) {
    return (
      <button type="button" className={s.chip} onClick={onLimpar}>
        <span className={s.chipTexto}>{texto}</span>
        {iconeLimpar}
      </button>
    )
  }
  return (
    <div className={s.chip}>
      {onClick ? (
        <button type="button" className={s.chipCorpo} onClick={onClick}>
          <span className={s.chipTexto}>{texto}</span>
        </button>
      ) : (
        <span className={s.chipTexto}>{texto}</span>
      )}
      <button type="button" className={s.chipLimpar} aria-label="Limpar filtro" onClick={onLimpar}>
        {iconeLimpar}
      </button>
    </div>
  )
}

export function BotaoFiltros({ icone, onClick, children = 'Filtros' }) {
  return (
    <button type="button" className={s.botaoFiltros} onClick={onClick}>
      {children}
      {icone}
    </button>
  )
}
