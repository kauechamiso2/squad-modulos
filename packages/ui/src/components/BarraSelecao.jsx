import s from './BarraSelecao.module.css'

/*
 * Pilula flutuante de selecao em massa.
 *
 * `acao` e um slot: cada modulo passa o proprio botao de acao principal, com
 * o proprio texto e o proprio icone - "Add em time" no Gestao de Pessoas,
 * "Duplicar" no Pesquisa de Clima. Sem isso a extracao mudaria a
 * funcionalidade de um dos dois.
 *
 * Os icones de deletar e fechar tambem vem por prop: os SVGs nao sao os
 * mesmos arquivos nos dois modulos (Close.svg tem conteudo diferente).
 *
 * `pesoContagem` so e usado pelo Gestao de Pessoas, para manter o peso de
 * texto que ele ja tinha. Ver o comentario no .module.css.
 */
function BarraSelecao({
  quantidade,
  rotulo,
  acao,
  iconeDeletar,
  iconeFechar,
  onDeletar,
  onFechar,
  pesoContagem,
}) {
  if (quantidade === 0) return null

  return (
    <div
      className={s.barra}
      style={pesoContagem ? { '--barra-selecao-peso': pesoContagem } : undefined}
    >
      <span className={s.contagem}>
        {rotulo ?? `${quantidade} selecionados`}
      </span>

      <div className={s.acoes}>
        {acao}

        <button
          type="button"
          className={s.botaoIcone}
          aria-label="Deletar selecionados"
          onClick={onDeletar}
        >
          {iconeDeletar}
        </button>

        <button
          type="button"
          className={s.botaoIcone}
          aria-label="Fechar seleção"
          onClick={onFechar}
        >
          {iconeFechar}
        </button>
      </div>
    </div>
  )
}

export default BarraSelecao
