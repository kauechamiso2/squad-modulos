import s from './Sidebar.module.css'

const QUANTIDADE_ESPACOS = 5

/*
 * Sidebar — por enquanto só o espaço reservado.
 *
 * Mesmo padrão do Gestão de Pessoas: cinco quadrados cinza sem ícone, sem
 * clique, sem navegação. Marca o lugar de uma navegação de produto
 * compartilhada entre os módulos que ainda não existe — quando existir,
 * entra aqui no lugar dos placeholders, sem mexer no resto da página.
 */
export default function Sidebar() {
  return (
    <aside className={s.sidebar}>
      {Array.from({ length: QUANTIDADE_ESPACOS }).map((_, indice) => (
        // eslint-disable-next-line react/no-array-index-key
        <div className={s.espaco} key={indice} />
      ))}
    </aside>
  )
}
