import { useEffect, useMemo, useRef, useState } from 'react'
import Checkbox from './Checkbox.jsx'
import s from './DropdownColuna.module.css'

/*
 * Dropdown que abre no cabecalho de uma coluna da tabela para filtrar por ela.
 *
 * Nasceu no Gestao de Pessoas (`.collaborators-table__filter-dropdown`: lista
 * simples de opcoes com checkbox) e o Fluxo de Caixa precisa do mesmo papel com
 * busca, contagem e itens marcados no topo (Figma 2279:107226). Em vez de duas
 * versoes, tudo o que o GP nao tem entra por prop e fica desligado por padrao.
 *
 * `itens`: [{ id, rotulo, visual? }] - `visual` e o no a esquerda do texto
 * (tile de emoji, avatar, icone). O GP nao passa nenhum.
 *
 * Variaveis (defaults = valores do Gestao de Pessoas):
 *   --dropdown-largura       min-width da caixa
 *   --dropdown-borda         cor da borda (transparent no FC, que nao tem)
 *   --dropdown-sombra
 *   --dropdown-raio
 *   --dropdown-padding       padding da caixa
 *   --dropdown-item-altura
 *   --dropdown-item-padding
 *   --dropdown-item-gap
 *   --dropdown-texto         font-size do rotulo
 */
export default function DropdownColuna({
  itens,
  marcados,
  onAlternar,
  onFechar,
  comBusca = false,
  placeholderBusca = 'Pesquisar...',
  iconeBusca,
  comContagem = false,
  marcadosNoTopo = false,
  tamanhoCheckbox = 24,
  /* O Gestao de Pessoas desenha o marcado com um SVG proprio (CheckSquare);
     o padrao e o Checkbox do ui, que o Fluxo de Caixa usa. */
  renderCheckbox,
  mensagemVazio,
  ancora = 'esquerda',
  /*
   * Modo acao: sem checkbox, clicar escolhe e fecha, e o item atual aparece
   * destacado com uma marca. E o padrao de lista do resumo de transacao do
   * Fluxo de Caixa (repeticao, categoria e o menu da linha).
   */
  modoAcao = false,
  atual,
  marcaAtual,
}) {
  const [termo, setTermo] = useState('')
  const caixa = useRef(null)
  const campo = useRef(null)

  useEffect(() => {
    if (comBusca) campo.current?.focus()
  }, [comBusca])

  useEffect(() => {
    const aoClicar = (e) => {
      if (caixa.current && !caixa.current.contains(e.target)) onFechar?.()
    }
    const aoTeclar = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onFechar?.() }
    }
    /* No setTimeout: o clique que abriu o dropdown ainda esta subindo, e
       registrar na hora faria ele fechar no mesmo clique. */
    const t = setTimeout(() => document.addEventListener('mousedown', aoClicar), 0)
    document.addEventListener('keydown', aoTeclar)
    return () => {
      clearTimeout(t)
      document.removeEventListener('mousedown', aoClicar)
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [onFechar])

  const filtrados = useMemo(() => {
    const t = termo.trim().toLowerCase()
    const lista = t
      ? itens.filter((i) => i.rotulo.toLowerCase().includes(t))
      : itens
    if (!marcadosNoTopo || t) return lista
    /* Marcados sobem, mantendo a ordem original dentro de cada grupo. */
    return [...lista].sort((a, b) => Number(marcados.has(b.id)) - Number(marcados.has(a.id)))
  }, [itens, termo, marcados, marcadosNoTopo])

  const contagem = termo.trim()
    ? `Total: ${filtrados.length}`
    : (marcados.size ? `Selecionados: ${marcados.size}` : null)

  return (
    <div
      className={`${s.caixa} ${ancora === 'direita' ? s.ancoraDireita : ''}`}
      ref={caixa}
      role="listbox"
      aria-multiselectable={modoAcao ? undefined : 'true'}
    >
      {comBusca ? (
        <div className={s.busca}>
          {iconeBusca}
          <input
            ref={campo}
            className={s.campoBusca}
            value={termo}
            placeholder={placeholderBusca}
            aria-label={placeholderBusca}
            onChange={(e) => setTermo(e.target.value)}
          />
        </div>
      ) : null}

      {comContagem && contagem ? <p className={s.contagem}>{contagem}</p> : null}

      <div className={s.lista}>
        {filtrados.length === 0 && mensagemVazio ? (
          <p className={s.vazio}>{mensagemVazio(termo.trim())}</p>
        ) : (
          filtrados.map((item) => (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={modoAcao ? item.id === atual : marcados.has(item.id)}
              className={`${s.item} ${modoAcao && item.id === atual ? s.itemAtual : ''}`}
              onClick={() => {
                onAlternar(item.id)
                if (modoAcao) onFechar?.()
              }}
            >
              {modoAcao ? null : (renderCheckbox
                ? renderCheckbox(marcados.has(item.id))
                : <Checkbox checked={marcados.has(item.id)} tamanho={tamanhoCheckbox} />)}
              <span className={s.conteudo}>
                {item.visual}
                <span className={s.rotulo}>{item.rotulo}</span>
              </span>
              {modoAcao && item.id === atual ? <span className={s.marca}>{marcaAtual}</span> : null}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
