import s from './Tabela.module.css'

/*
 * Casca de tabela compartilhada. As colunas vem por `colunas`
 * (grid-template-columns) e as medidas que divergem entre modulos, por
 * custom property - ver o .module.css.
 */
export function Tabela({ colunas, style, children }) {
  return (
    <div className={s.tabela} style={{ '--tabela-colunas': colunas, ...style }}>
      {children}
    </div>
  )
}

export function CabecalhoTabela({ children }) {
  return <div className={s.cabecalho}>{children}</div>
}

export function CelulaCabecalho({ children, onClick, className = '', ...resto }) {
  const classe = `${s.celulaCabecalho} ${onClick ? s.celulaCabecalhoBotao : ''} ${className}`.trim()
  if (!onClick) return <span className={classe} {...resto}>{children}</span>
  return (
    <button type="button" className={classe} onClick={onClick} {...resto}>
      {children}
    </button>
  )
}

export function LinhaTabela({ selecionada = false, className = '', children, ...resto }) {
  return (
    <div
      className={`${s.linha} ${selecionada ? s.linhaSelecionada : ''} ${className}`.trim()}
      {...resto}
    >
      {children}
    </div>
  )
}

export const classesCelula = {
  celula: s.celula,
  principal: `${s.celula} ${s.celulaPrincipal}`,
  secundaria: `${s.celula} ${s.celulaSecundaria}`,
}
