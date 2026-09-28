import { useEffect, useRef, useState } from 'react'
import Selo from '../../components/Selo.jsx'
import Rosca from '../../components/detalhe/Rosca.jsx'
import { statusDe } from '../../lib/pesquisas.js'
import {
  camposDe,
  taxaAtualDe,
  tempoMedioDe,
  desistenciaDe,
  piorAvaliacaoDe,
  resumoDe,
} from '../../lib/geral.js'
import { taxasAnteriores } from '../../lib/historico.js'
import s from './AbaGeral.module.css'

import caretDown from '../../assets/icons/CaretDown.svg'

/*
 * Conteúdo da aba Geral (Figma 8032:1573).
 *
 * A pesquisa vem inteira por prop; o que cada bloco mostra sai de `lib/geral.js`.
 * Datas, status, tipo, ciclos e a taxa que o motor sobe são reais; tempo médio,
 * desistências, as notas por pergunta e o texto do Pipo continuam simulados,
 * porque não há backend coletando resposta nenhuma.
 *
 * O seletor de período do cartão de taxa anterior lista os ciclos já
 * fechados e troca o que o cartão mostra. O botão de três pontos continua no
 * lugar sem fazer nada.
 */
function Campo({ rotulo, valor }) {
  return (
    <div className={s.campo}>
      <span className={s.rotulo}>{rotulo}</span>
      <span className={s.valor}>{valor}</span>
    </div>
  )
}

/*
 * O seletor de ciclo do cartão anterior. Mesma caixa suspensa dos outros
 * seletores do detalhe: botão com o rótulo atual e a lista embaixo, que fecha
 * ao clicar fora.
 *
 * Com um ciclo só ele continua aparecendo, com uma opção — o cartão não muda
 * de forma por causa de quantos ciclos já rodaram.
 */
function SeletorDePeriodo({ ciclos, escolhido, onEscolher }) {
  const [aberta, setAberta] = useState(false)
  const envoltorio = useRef(null)

  useEffect(() => {
    if (!aberta) return undefined
    const aoClicar = (e) => {
      if (!envoltorio.current?.contains(e.target)) setAberta(false)
    }
    document.addEventListener('mousedown', aoClicar)
    return () => document.removeEventListener('mousedown', aoClicar)
  }, [aberta])

  return (
    <div className={s.envoltorioPeriodo} ref={envoltorio}>
      <button
        type="button"
        className={s.periodo}
        aria-expanded={aberta}
        aria-label="Escolher ciclo"
        onClick={() => setAberta((a) => !a)}
      >
        {escolhido.periodo}
        <img src={caretDown} alt="" width={16} height={16} />
      </button>
      {aberta ? (
        <div className={s.listaPeriodos} role="listbox">
          {ciclos.map((c) => (
            <button
              type="button"
              key={c.numero}
              className={`${s.itemPeriodo} ${c.numero === escolhido.numero ? s.itemAtual : ''}`}
              role="option"
              aria-selected={c.numero === escolhido.numero}
              onClick={() => {
                onEscolher(c.numero)
                setAberta(false)
              }}
            >
              {c.periodo}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function CartaoTaxa({ dados, seletor = null }) {
  return (
    <section className={s.cartao}>
      <div className={s.topoTaxa}>
        <p className={s.tituloCartao}>{dados.titulo}</p>
        {seletor}
      </div>
      <div className={s.linhaRosca}>
        <Rosca taxa={dados.taxa} />
        <div className={s.textosRosca}>
          <p className={s.textoPrincipal}>{dados.principal}</p>
          <p className={s.textoApoio}>{dados.apoio}</p>
        </div>
      </div>
    </section>
  )
}

/* Os dois primeiros cartões da faixa de baixo: número e unidade na mesma
   linha de base. */
function CartaoNumero({ titulo, valor, unidade }) {
  return (
    <section className={s.cartao}>
      <p className={s.tituloCartao}>{titulo}</p>
      <div className={s.numeroLinha}>
        <span className={s.numeroGrande}>{valor}</span>
        <span className={s.unidade}>{unidade}</span>
      </div>
    </section>
  )
}

export default function AbaGeral({ pesquisa }) {
  const campos = camposDe(pesquisa)
  const atual = taxaAtualDe(pesquisa)

  /* O ciclo escolhido no seletor. `null` é "ainda não escolhi", e aí vale o
     mais recente — que é o que a lista já traz na frente. */
  const [cicloEscolhido, setCicloEscolhido] = useState(null)
  const anteriores = taxasAnteriores(pesquisa)
  const anterior =
    anteriores.find((c) => c.numero === cicloEscolhido) ?? anteriores[0] ?? null
  const piorAvaliacao = piorAvaliacaoDe(pesquisa)
  const tempoMedio = tempoMedioDe(pesquisa)
  const desistencia = desistenciaDe(pesquisa)

  return (
    <div className={s.coluna}>
      <section className={`${s.cartao} ${s.cartaoInfo}`}>
        <h2 className={s.nome}>{pesquisa.nome}</h2>

        <Selo status={statusDe(pesquisa)} />

        {/* Quatro campos em duas linhas de dois: os dois primeiros mudam de
            rótulo conforme o status, "Tipo" e "Ciclos" aparecem sempre. */}
        <div className={s.linhaCampos}>
          <Campo {...campos[0]} />
          <Campo {...campos[1]} />
        </div>
        <div className={s.linhaCampos}>
          <Campo {...campos[2]} />
          <Campo {...campos[3]} />
        </div>
      </section>

      <div className={s.faixa}>
        <CartaoTaxa dados={atual} />
        {anterior ? (
          <CartaoTaxa
            dados={anterior}
            seletor={
              <SeletorDePeriodo
                ciclos={anteriores}
                escolhido={anterior}
                onEscolher={setCicloEscolhido}
              />
            }
          />
        ) : null}
      </div>

      <section className={s.pipo}>
        <p>Resumo do Pipo</p>
        <p className={s.resumo}>{resumoDe(pesquisa, atual, anterior)}</p>
      </section>

      <div className={s.faixa}>
        <CartaoNumero
          titulo="Tempo médio de resposta"
          valor={tempoMedio.valor}
          unidade={tempoMedio.unidade}
        />
        <CartaoNumero
          titulo="Taxa de desistência"
          valor={desistencia.valor}
          unidade={desistencia.unidade}
        />
        {/* Sem pergunta de nota não há pior nota, e o cartão some em vez de
            mostrar um número inventado.

            O terceiro empilha número e pergunta, e usa um corpo menor: o
            Figma desenha 50px aqui contra os 80px dos vizinhos, que é o que
            deixa um "2,5" caber sem espremer o cartão. */}
        {piorAvaliacao ? (
          <section className={`${s.cartao} ${s.cartaoAvaliacao}`}>
            <p className={s.tituloCartao}>Pior avaliação</p>
            <div className={s.blocoAvaliacao}>
              <span className={s.numeroMedio}>{piorAvaliacao.valor}</span>
              <span className={s.unidade}>{piorAvaliacao.pergunta}</span>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
