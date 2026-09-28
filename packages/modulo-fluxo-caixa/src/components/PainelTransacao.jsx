import { useMemo, useState } from 'react'
import {
  CalendarBlank, CaretDown, Check, NotePencil, Trash, X,
} from '@phosphor-icons/react'
import { CampoInline, DropdownColuna, LinhaInfo, PainelLateral, PilulaFiltro } from '@squad/ui'
import CalendarioPopover from './CalendarioPopover.jsx'
import IconeTipo from './IconeTipo.jsx'
import { formatar } from '../lib/moeda.js'
import { hojeIso, formatarCurta, formatarPorExtenso, nomeDoMes, paraData } from '../lib/datas.js'
import { rotuloDaTransacao } from '../lib/contatos.js'
import * as Categorias from '../lib/categorias.js'
import { REPETICOES } from '../lib/transacoes.js'
import { ROTULO_TIPO } from '../lib/documentos.js'
import s from './PainelTransacao.module.css'

const MIN_NOME = 5
const MAX_NOME = 60

const COPY = {
  entrada: { titulo: 'Entrada', papel: 'Pagador', data: 'Data de recebimento' },
  saida: { titulo: 'Saída', papel: 'Recebedor', data: 'Data de pagamento' },
}

/*
 * Resumo da transacao (Figma 2279:101815).
 *
 * A casca e o PainelLateral do @squad/ui com outra largura (540) e o cabecalho
 * de acoes nas pontas - o mesmo do detalhe do colaborador do Gestao de Pessoas.
 *
 * Nome, categoria, data e repeticao sao editaveis. Categoria e nome valem so
 * para esta ocorrencia; data e repeticao, quando a transacao repete, perguntam
 * o escopo num modal antes de aplicar.
 */
function PainelTransacao({
  aberto,
  transacao, categorias, diasComTransacao,
  onRenomear, onTrocarCategoria, onMudarData, onMudarRepeticao, onAdicionarNota,
  onRemover, onFechar,
}) {
  const [lista, setLista] = useState(null)   // 'categoria' | 'repeticao'
  const [editandoData, setEditandoData] = useState(false)
  const [nota, setNota] = useState(false)

  const copy = COPY[transacao?.tipo] ?? COPY.entrada
  const categoria = Categorias.porId(transacao?.categoriaId)
  const contato = rotuloDaTransacao(transacao ?? {})
  const ehHoje = transacao?.data === hojeIso()
  const statusVisivel = useMemo(() => {
    const st = (transacao?.tipo === 'entrada'
      ? [['recebido', 'Recebido'], ['a_receber', 'A receber']]
      : [['pago', 'Pago'], ['a_pagar', 'A pagar']])
    return (st.find(([id]) => id === transacao?.status) ?? st[0])[1]
  }, [transacao?.status, transacao?.tipo])

  const repeticao = REPETICOES.find((r) => r.id === transacao?.repete)
  const repete = transacao?.repete && transacao.repete !== 'nao'

  /* Montado sempre, para animar a saida; sem transacao nao ha o que desenhar.
     Depois de todos os hooks, para a ordem deles nao mudar entre renders. */
  if (!transacao) return null

  const documentoDoContato = transacao.contatoId
    ? null
    : (transacao.contatoAvulso ?? null)

  return (
    <PainelLateral
      aberto={aberto}
      titulo={copy.titulo}
      acaoEsquerda={
        /* O foco inicial vem para ca: nunca para a lixeira. */
        <button
          type="button"
          className={s.acao}
          aria-label="Fechar"
          data-foco-inicial
          onClick={onFechar}
        >
          <X size={24} color="var(--cor-texto-secundario)" />
        </button>
      }
      acaoDireita={
        <button type="button" className={s.acao} aria-label="Remover" onClick={onRemover}>
          <Trash size={24} color="var(--fc-cor-saida)" />
        </button>
      }
      comRodape={false}
      className={s.painel}
      onFechar={onFechar}
      prenderFoco
    >
      <div className={s.blocosTopo}>
      <div className={s.topo}>
        <IconeTipo transacao={transacao} />
        <span className={s.nomeTitulo}>{transacao.nome}</span>
      </div>

      {/* Faixa do Fin: so visual, sem clique (Figma 2279:101815). */}
      <p className={s.faixaFin}>
        Peça ao Fin para <b>Resumir transação,</b> <b>alterar informações</b> ou{' '}
        <b>comparar transação</b>
      </p>

      <div className={s.linhas}>
        <LinhaInfo rotulo="Valor" className={s.linha}>
          <span className={s.valor}>{formatar(transacao.valorCentavos)}</span>
        </LinhaInfo>

        <LinhaInfo rotulo="Nome" className={s.linha}>
          <CampoInline
            value={transacao.nome}
            displayValue={transacao.nome}
            salvarAoSair
            iconeLimpar={<X size={16} color="var(--cor-texto-secundario)" />}
            validate={(v) => v.trim().length >= MIN_NOME && v.trim().length <= MAX_NOME}
            onSave={(v) => onRenomear(v.trim())}
          />
        </LinhaInfo>

        <LinhaInfo rotulo={copy.papel} className={s.linha}>
          <span className={s.valor}>
            {contato || '—'}
            {documentoDoContato && ROTULO_TIPO[transacao.tipoContatoAvulso] ? (
              <span className={s.tipoDoc}>{ROTULO_TIPO[transacao.tipoContatoAvulso]}</span>
            ) : null}
          </span>
        </LinhaInfo>

        <LinhaInfo rotulo="Categoria" className={s.linha}>
          <span className={s.ancora}>
            <PilulaFiltro
              iconeDireita={<CaretDown size={16} />}
              onClick={() => setLista(lista === 'categoria' ? null : 'categoria')}
            >
              <span className={s.emojiCategoria}>{categoria?.emoji}</span>
              {categoria?.nome}
            </PilulaFiltro>
            {lista === 'categoria' ? (
              <DropdownColuna
                modoAcao
                atual={transacao.categoriaId}
                marcaAtual={<Check size={16} color="var(--fc-valor-positivo)" />}
                itens={categorias.map((c) => ({
                  id: c.id,
                  rotulo: c.nome,
                  visual: <span className={s.emojiLista}>{c.emoji}</span>,
                }))}
                marcados={new Set()}
                onAlternar={onTrocarCategoria}
                onFechar={() => setLista(null)}
              />
            ) : null}
          </span>
        </LinhaInfo>

        <LinhaInfo rotulo="Status" className={s.linha}>
          <span className={s.valor}>{statusVisivel}</span>
        </LinhaInfo>

        <LinhaInfo rotulo={copy.data} className={s.linha}>
          <span className={s.ancora}>
            {editandoData ? (
              <>
                <span className={s.campoData}>
                  <span className={s.campoDataTexto}>{formatarPorExtenso(transacao.data)}</span>
                  <button
                    type="button"
                    className={s.limparData}
                    aria-label="Fechar"
                    onClick={() => setEditandoData(false)}
                  >
                    <X size={16} color="var(--cor-texto-secundario)" />
                  </button>
                </span>
                <CalendarioPopover
                  valor={transacao.data}
                  diasComTransacao={diasComTransacao}
                  onEscolher={(d) => { setEditandoData(false); onMudarData(d) }}
                  onFechar={() => setEditandoData(false)}
                />
              </>
            ) : (
              <button type="button" className={s.valorBotao} onClick={() => setEditandoData(true)}>
                {ehHoje ? 'Hoje' : formatarPorExtenso(transacao.data)}
              </button>
            )}
          </span>
        </LinhaInfo>

        <LinhaInfo rotulo="Repete" className={s.linha}>
          {repete ? (
            <span className={s.ancora}>
              <PilulaFiltro
                iconeDireita={<CaretDown size={16} />}
                onClick={() => setLista(lista === 'repeticao' ? null : 'repeticao')}
              >
                {repeticao?.rotulo}
              </PilulaFiltro>
              {lista === 'repeticao' ? (
                <DropdownColuna
                  modoAcao
                  atual={transacao.repete}
                  marcaAtual={<Check size={16} color="var(--fc-valor-positivo)" />}
                  itens={[...REPETICOES].reverse().map((r) => ({ id: r.id, rotulo: r.rotulo }))}
                  marcados={new Set()}
                  onAlternar={onMudarRepeticao}
                  onFechar={() => setLista(null)}
                />
              ) : null}
            </span>
          ) : (
            <span className={s.valor}>Não</span>
          )}
        </LinhaInfo>

        <LinhaInfo rotulo="Observação" className={`${s.linha} ${s.linhaObservacao}`}>
          <span className={s.valor}>{transacao.observacao?.trim() || '—'}</span>
        </LinhaInfo>
      </div>

      </div>

      <div className={s.notas}>
        {(transacao.notas ?? []).map((n) => (
          <div className={s.nota} key={n.id}>
            <span className={s.notaData}>{formatarCurta(n.data)}</span>
            <span className={s.notaTexto}>{n.texto}</span>
          </div>
        ))}

        {nota ? (
          <CampoInline
            value=""
            multilinha
            iniciarEditando
            placeholder="Escreva uma nota"
            iconeLimpar={<X size={16} color="var(--cor-texto-secundario)" />}
            onCancelar={() => setNota(false)}
            onSave={(texto) => {
              const limpo = texto.trim()
              setNota(false)
              if (limpo) onAdicionarNota(limpo)
            }}
          />
        ) : (
          <button type="button" className={s.adicionarNota} onClick={() => setNota(true)}>
            <NotePencil size={24} />
            Adicionar nota
          </button>
        )}
      </div>
    </PainelLateral>
  )
}

export default PainelTransacao
