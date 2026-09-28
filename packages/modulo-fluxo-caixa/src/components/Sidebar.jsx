import s from './Sidebar.module.css'

const QUANTIDADE_ESPACOS = 5

/*
 * Sidebar - por enquanto so o espaco reservado, como nos outros dois modulos.
 *
 * Esta e a terceira copia do mesmo placeholder. A etapa 0 decidiu adiar a
 * unificacao: a resolucao nao e uma prop `fixed`, e a navegacao real do
 * produto, que ainda nao existe. Ver docs/divida-tecnica.md.
 */
function Sidebar() {
  return (
    <aside className={s.sidebar}>
      {Array.from({ length: QUANTIDADE_ESPACOS }).map((_, indice) => (
        <div className={s.espaco} key={indice} />
      ))}
    </aside>
  )
}

export default Sidebar
