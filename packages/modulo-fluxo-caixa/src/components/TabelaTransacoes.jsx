import { useState } from 'react'
import { CaretDown, CaretUpDown, DotsThreeVertical, Info } from '@phosphor-icons/react'
import {
  Tabela, CabecalhoTabela, CelulaCabecalho, LinhaTabela, classesCelula, Checkbox, IconButton,
  DropdownColuna,
} from '@squad/ui'
import { formatarComSinal } from '../lib/moeda.js'
import { foraDoSaldo, aguardandoConfirmacao } from '../lib/transacoes.js'
import IconeTipo from './IconeTipo.jsx'
import { rotuloDaTransacao } from '../lib/contatos.js'
import s from './TabelaTransacoes.module.css'

/*
 * Tabela de transacoes (Figma 2279:100397 em diante).
 *
 * A casca (cabecalho, linha, hover com sombra, celulas) vem do @squad/ui -
 * e a mesma do Gestao de Pessoas. Aqui ficam so as colunas deste modulo e o
 * icone de tipo, que e proprio.
 *
 * Colunas do Figma (2279:97205): checkbox 24 · tipo+nome 1fr · categoria 240 ·
 * contato 240 · valor 200 · menu 40
 */
const COLUNAS = '24px minmax(0, 1fr) 240px 240px 200px 40px'

function TabelaTransacoes({
  transacoes, categoriaPorId, selecionados,
  onAlternarSelecao, onAlternarTodos, onAbrir, onAbrirMenu,
  onAbrirFiltroColuna, onOrdenarValor, onConfirmar, dropdowns, onAcaoMenu,
}) {
  /*
   * O menu da linha nao esta desenhado no Figma. Usa a mesma lista suspensa da
   * repeticao e da categoria, com "Ver detalhes" e "Remover".
   */
  const [menuAberto, setMenuAberto] = useState(null)
  const todosMarcados = transacoes.length > 0 && transacoes.every((t) => selecionados.has(t.id))

  return (
    <Tabela colunas={COLUNAS}>
      <CabecalhoTabela>
        <button
          type="button"
          className={s.marcador}
          aria-label={todosMarcados ? 'Desmarcar todos' : 'Selecionar todos'}
          onClick={() => onAlternarTodos(!todosMarcados)}
        >
          <Checkbox checked={todosMarcados} />
        </button>

        <span className={s.grupoCabecalho}>
          <span className={s.colunaFiltravel}>
            <CelulaCabecalho onClick={() => onAbrirFiltroColuna('tipo')}>
              Tipo <CaretDown size={16} />
            </CelulaCabecalho>
            {dropdowns?.tipo}
          </span>
          <CelulaCabecalho>Transações</CelulaCabecalho>
        </span>

        <span className={s.colunaFiltravel}>
          <CelulaCabecalho onClick={() => onAbrirFiltroColuna('categoria')}>
            Categoria <CaretDown size={16} />
          </CelulaCabecalho>
          {dropdowns?.categoria}
        </span>

        <span className={s.colunaFiltravel}>
          <CelulaCabecalho onClick={() => onAbrirFiltroColuna('contato')}>
            Contato <CaretDown size={16} />
          </CelulaCabecalho>
          {dropdowns?.contato}
        </span>

        <CelulaCabecalho onClick={onOrdenarValor}>
          {/* O Figma nomeia o node "ArrowsDownUp" mas desenha dois triangulos
              solidos empilhados (2279:96397) - no Phosphor e o CaretUpDown
              com weight fill. */}
          Valor <CaretUpDown size={16} weight="fill" />
        </CelulaCabecalho>

        <span />
      </CabecalhoTabela>

      {transacoes.map((t) => {
        const categoria = categoriaPorId(t.categoriaId)
        const marcado = selecionados.has(t.id)
        return (
          <LinhaTabela
            key={t.id}
            selecionada={marcado}
            role="button"
            tabIndex={0}
            onClick={() => onAbrir(t.id)}
            onKeyDown={(e) => { if (e.key === 'Enter') onAbrir(t.id) }}
          >
            <button
              type="button"
              className={s.marcador}
              aria-label={marcado ? 'Desmarcar' : 'Selecionar'}
              onClick={(e) => { e.stopPropagation(); onAlternarSelecao(t.id) }}
            >
              <Checkbox checked={marcado} />
            </button>

            <span className={s.grupoNome}>
              <IconeTipo transacao={t} />
              <span className={classesCelula.principal}>{t.nome}</span>
            </span>

            <span className={classesCelula.secundaria}>
              <span className={s.emoji}>{categoria?.emoji}</span>
              {categoria?.nome}
            </span>

            <span className={classesCelula.secundaria}>{rotuloDaTransacao(t)}</span>

            <span
              className={`${classesCelula.celula} ${s.celulaValor} ${
                foraDoSaldo(t) ? s.valorFuturo : (t.tipo === 'entrada' ? s.valorPositivo : '')
              }`}
            >
              {formatarComSinal(t.valorCentavos, t.tipo)}
              {aguardandoConfirmacao(t) ? (
                <button
                  type="button"
                  className={s.aviso}
                  aria-label={`Confirmar ${t.tipo === 'entrada' ? 'recebimento' : 'pagamento'}`}
                  onClick={(e) => { e.stopPropagation(); onConfirmar?.(t) }}
                >
                  <Info size={16} />
                </button>
              ) : null}
            </span>

            <span className={s.menuLinha} onClick={(e) => e.stopPropagation()}>
              <IconButton
                icon={<DotsThreeVertical size={24} />}
                alt="Mais ações"
                className="fc-menu-linha"
                onClick={() => setMenuAberto((a) => (a === t.id ? null : t.id))}
              />
              {menuAberto === t.id ? (
                <DropdownColuna
                  modoAcao
                  ancora="direita"
                  itens={[
                    { id: 'detalhes', rotulo: 'Ver detalhes' },
                    { id: 'remover', rotulo: 'Remover' },
                  ]}
                  marcados={new Set()}
                  onAlternar={(acao) => onAcaoMenu?.(t.id, acao)}
                  onFechar={() => setMenuAberto(null)}
                />
              ) : null}
            </span>
          </LinhaTabela>
        )
      })}
    </Tabela>
  )
}

export default TabelaTransacoes
