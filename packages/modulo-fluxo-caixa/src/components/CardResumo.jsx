import { ArrowDown, ArrowUp, ArrowUpRight, Coins, X } from '@phosphor-icons/react'
import GraficoArea from './GraficoArea.jsx'
import { formatar, partes } from '../lib/moeda.js'
import s from './CardResumo.module.css'

/*
 * Um dos tres cards de resumo (Figma 2241:46998 expandido, 2279:105668 fechado).
 *
 * Tres estados:
 *  - padrao:    icone + seta de expandir, rotulo e valor 40px
 *  - estreito:  128px, so o icone em cima e o nome no pe
 *  - expandido: texto embaixo a esquerda e grafico embaixo a direita, X fecha
 */
const ICONE = {
  entradas: <ArrowDown size={24} color="var(--fc-cor-entrada)" />,
  saidas: <ArrowUp size={24} color="var(--fc-cor-saida)" />,
  lucro: <Coins size={24} color="var(--cor-texto-secundario)" />,
}

const CLASSE_TILE = {
  entradas: s.tileEntrada,
  saidas: s.tileSaida,
  lucro: s.tileLucro,
}

/*
 * As manchas do card de Lucro. O Figma nao usa degrade CSS: e uma cor de base
 * com elipses desfocadas por cima, cortadas pelo card. Posicao e tamanho em
 * porcentagem da largura, para o gradiente nao pular durante a expansao.
 */
function Manchas({ expandido }) {
  return (
    <>
      <span className={`${s.mancha} ${s.manchaAzul}`} aria-hidden="true" />
      <span className={`${s.mancha} ${s.manchaBranca}`} aria-hidden="true" />
      {expandido ? null : <span className={`${s.mancha} ${s.manchaClara}`} aria-hidden="true" />}
    </>
  )
}

function CardResumo({
  id,
  rotulo,
  rotuloExpandido,
  rotuloCurto,
  valorCentavos,
  estado = 'padrao',
  pontos = [],
  onExpandir,
  onFechar,
}) {
  const { inteiro, centavos } = partes(valorCentavos)
  const ehLucro = id === 'lucro'
  const expandido = estado === 'expandido'

  const classes = [
    s.card,
    ehLucro ? s.cardLucro : '',
    estado === 'estreito' ? s.cardEstreito : '',
    expandido ? s.cardExpandido : '',
  ].filter(Boolean).join(' ')

  const tile = <span className={`${s.tile} ${CLASSE_TILE[id]}`}>{ICONE[id]}</span>

  /* Estreito: icone em cima e o nome no pe, sem valor nem seta. */
  if (estado === 'estreito') {
    return (
      <button
        type="button"
        className={classes}
        aria-label={`Expandir ${rotuloCurto}`}
        onClick={onExpandir}
      >
        {ehLucro ? <Manchas /> : null}
        {tile}
        <span className={s.nomePe}>{rotuloCurto}</span>
      </button>
    )
  }

  const bloco = (
    <div className={s.texto}>
      <p className={s.rotulo}>{expandido ? rotuloExpandido : rotulo}</p>
      <p className={s.valor}>
        {inteiro}
        <span className={s.centavos}>{centavos}</span>
      </p>
    </div>
  )

  if (expandido) {
    return (
      <div className={classes}>
        {ehLucro ? <Manchas expandido /> : null}
        <div className={s.topo}>
          {tile}
          <button type="button" className={s.expandir} aria-label="Fechar" onClick={onFechar}>
            <X size={24} color={ehLucro ? '#ffffff' : 'var(--cor-texto-secundario)'} />
          </button>
        </div>
        <div className={s.corpoExpandido}>
          {bloco}
          <div className={s.grafico}>
            <GraficoArea
              pontos={pontos}
              variante={id}
              /* Mesmo formato da tabela: "R$ 2.423,24" e "- R$ 334,40". */
              rotuloDoBalao={(v) => `${v < 0 ? '- ' : ''}${formatar(v, { espaco: true })}`}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={classes}>
      {ehLucro ? <Manchas /> : null}
      <div className={s.topo}>
        {tile}
        <button
          type="button"
          className={s.expandir}
          aria-label={`Expandir ${rotuloCurto}`}
          onClick={onExpandir}
        >
          <ArrowUpRight size={24} color={ehLucro ? '#ffffff' : undefined} />
        </button>
      </div>
      {bloco}
    </div>
  )
}

export default CardResumo
