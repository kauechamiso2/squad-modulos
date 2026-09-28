import { Fragment, useEffect, useRef, useState } from 'react'
import CorpoDaResposta from '../perguntas/CorpoDaResposta.jsx'
import { valorDe } from '../../lib/respostas.js'
import s from './LeituraDeRespostas.module.css'

import caretDown from '../../assets/icons/CaretDown.svg'
import trash from '../../assets/icons/Trash.svg'
import downloadSimple from '../../assets/icons/DownloadSimple.svg'

/*
 * As duas leituras de um conjunto de respostas: uma pergunta de cada vez, com
 * todo mundo; ou uma pessoa de cada vez, com todas as perguntas.
 *
 * Saiu da aba Respostas da pesquisa quando a tela do ciclo passou a mostrar
 * exatamente o mesmo par. Não sabe de onde vêm as respostas nem o que deletar
 * e baixar fazem: sem handler, os botões ficam inertes, que é o estado da tela
 * do ciclo por enquanto.
 */

/* Anda pela lista sem sair dela: nas pontas o botão desliga. */
function Seta({ direcao, rotulo, onClick, desabilitado }) {
  return (
    <button
      type="button"
      className={s.seta}
      aria-label={rotulo}
      disabled={desabilitado}
      onClick={onClick}
    >
      <img
        className={`${s.icone20} ${direcao === 'anterior' ? s.paraEsquerda : s.paraDireita}`}
        src={caretDown}
        alt=""
        width={20}
        height={20}
      />
    </button>
  )
}

function CartaoResposta({ rotulo, pergunta, resposta, enunciado }) {
  const valor = valorDe(resposta, pergunta)
  return (
    <section className={s.cartao}>
      <div className={s.topoCartao}>
        <p className={s.rotuloCartao}>{rotulo}</p>
      </div>
      {enunciado ? <p className={s.enunciado}>{enunciado}</p> : null}
      {/* Sem valor o corpo não desenha nada, e o cartão ficava com o enunciado
          e um buraco embaixo. Dizer que não foi respondida é a diferença entre
          uma tela vazia e uma tela que informa. */}
      {valor ? (
        <CorpoDaResposta pergunta={pergunta} resposta={valor} />
      ) : (
        <p className={s.semResposta}>Sem resposta para esta pergunta.</p>
      )}
    </section>
  )
}

/*
 * O card de uma pergunta extra condicional (lib/perguntaExtra.js) que
 * disparou nesta resposta — só existe aqui, nunca na lista fixa de
 * perguntas, porque nasceu da resposta em si. Por isso o número tem duas
 * partes: a resposta a que pertence, e a ordem entre as extras dela, para o
 * caso de mais de uma pergunta da pesquisa ter disparado a sua.
 *
 * A borda azul e a tag "Gerada através da pergunta anterior" (Figma
 * 8217:2254, 8217:2397) são o que distingue este card dos das perguntas de
 * verdade — sem isso pareceria que a pesquisa sempre teve essa pergunta.
 * Sempre respostaLonga por enquanto (gerarPerguntaExtra), então o texto
 * entra direto, sem passar pelo CorpoDaResposta genérico.
 */
function CartaoRespostaExtra({ numero, extra, resposta }) {
  const valor = valorDe(resposta, extra)
  return (
    <section className={`${s.cartao} ${s.cartaoExtra}`}>
      <div className={s.topoCartaoExtra}>
        <p className={s.rotuloCartao}>Resposta {numero}</p>
        <p className={s.tagExtra}>Gerada através da pergunta anterior</p>
      </div>
      <p className={s.enunciado}>{extra.enunciado}</p>
      {valor ? (
        <p className={s.textoExtra}>{valor.valor}</p>
      ) : (
        <p className={s.semResposta}>Sem resposta para esta pergunta.</p>
      )}
    </section>
  )
}

export function PorPergunta({ perguntas, respostas }) {
  const [indice, setIndice] = useState(0)
  const [listaAberta, setListaAberta] = useState(false)
  const envoltorio = useRef(null)

  /* Clicar fora fecha — senão o suspenso fica atrás de tudo. */
  useEffect(() => {
    if (!listaAberta) return undefined
    const aoClicar = (e) => {
      if (!envoltorio.current?.contains(e.target)) setListaAberta(false)
    }
    document.addEventListener('mousedown', aoClicar)
    return () => document.removeEventListener('mousedown', aoClicar)
  }, [listaAberta])

  const pergunta = perguntas[indice]

  return (
    <>
      <section className={s.cartao}>
        <div className={s.topoNavegador}>
          <p className={s.rotuloCartao}>
            Pergunta {indice + 1} de {perguntas.length}
          </p>
          <div className={s.setas}>
            <Seta
              direcao="anterior"
              rotulo="Pergunta anterior"
              desabilitado={indice === 0}
              onClick={() => setIndice((i) => i - 1)}
            />
            <Seta
              direcao="proxima"
              rotulo="Próxima pergunta"
              desabilitado={indice >= perguntas.length - 1}
              onClick={() => setIndice((i) => i + 1)}
            />
          </div>
        </div>

        <div className={s.envoltorioLista} ref={envoltorio}>
          <button
            type="button"
            className={s.seletor}
            aria-expanded={listaAberta}
            aria-label="Escolher pergunta"
            onClick={() => setListaAberta((aberta) => !aberta)}
          >
            <span className={s.textoSeletor}>{pergunta?.enunciado}</span>
            <img className={s.icone20} src={caretDown} alt="" width={20} height={20} />
          </button>
          {listaAberta ? (
            <div className={s.listaPerguntas} role="listbox">
              {perguntas.map((q, i) => (
                <button
                  type="button"
                  key={q.id}
                  className={`${s.itemLista} ${i === indice ? s.itemAtual : ''}`}
                  role="option"
                  aria-selected={i === indice}
                  onClick={() => {
                    setIndice(i)
                    setListaAberta(false)
                  }}
                >
                  {i + 1}. {q.enunciado}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Ninguém respondeu esta: uma linha só, em vez de um cartão por pessoa
          repetindo a mesma ausência. Acontece com pergunta acrescentada depois
          de a coleta já ter começado. */}
      {pergunta && !respostas.some((r) => valorDe(r, pergunta)) ? (
        <section className={s.cartao}>
          <p className={s.semResposta}>
            Ninguém respondeu esta pergunta ainda.
          </p>
        </section>
      ) : (
        respostas.map((resposta, i) => {
          /* Só a extra desta pergunta, se esta resposta a disparou — a vista
             mostra uma pergunta de cada vez, então nunca há mais de uma para
             mostrar aqui, e o "M" é sempre 1. */
          const extra = (resposta.extras || []).find(
            (e) => e.origemId === pergunta?.id,
          )
          return (
            <Fragment key={resposta.id}>
              <CartaoResposta
                rotulo={`Resposta ${i + 1}`}
                pergunta={pergunta}
                resposta={resposta}
              />
              {extra ? (
                <CartaoRespostaExtra
                  numero={`${i + 1}.1`}
                  extra={extra}
                  resposta={resposta}
                />
              ) : null}
            </Fragment>
          )
        })
      )}
    </>
  )
}

export function Individual({ perguntas, respostas, onBaixar, onDeletar }) {
  const [indice, setIndice] = useState(0)
  const total = respostas.length

  /* Deletar encurta a lista: sem isso o índice ficaria apontando para fora
     dela e a tela mostraria um vazio. */
  useEffect(() => {
    if (indice > 0 && indice >= total) setIndice(total - 1)
  }, [indice, total])

  const pessoa = respostas[indice]

  /* Uma linha por pergunta, com a extra dela — se esta pessoa a disparou —
     logo depois. O "M" conta as extras desta resposta na ordem em que as
     perguntas que as geraram aparecem, para o caso de mais de uma ter
     disparado a sua. */
  let contadorExtra = 0
  const linhas = perguntas.map((q, i) => {
    const extra = (pessoa?.extras || []).find((e) => e.origemId === q.id)
    if (extra) contadorExtra += 1
    return { q, i, extra, numero: contadorExtra }
  })

  return (
    <>
      <section className={`${s.cartao} ${s.cartaoNavegador}`}>
        <div className={s.topoNavegador}>
          <p className={s.rotuloCartao}>
            Resposta {indice + 1} de {total}
          </p>
          <div className={s.setas}>
            <Seta
              direcao="anterior"
              rotulo="Resposta anterior"
              desabilitado={indice === 0}
              onClick={() => setIndice((i) => i - 1)}
            />
            <Seta
              direcao="proxima"
              rotulo="Próxima resposta"
              desabilitado={indice >= total - 1}
              onClick={() => setIndice((i) => i + 1)}
            />
            <button
              type="button"
              className={s.acaoIcone}
              aria-label="Baixar resposta"
              disabled={!onBaixar}
              onClick={() => onBaixar?.(pessoa, indice)}
            >
              <img src={downloadSimple} alt="" width={24} height={24} />
            </button>
            <button
              type="button"
              className={s.acaoIcone}
              aria-label="Deletar resposta"
              disabled={!onDeletar}
              onClick={() => onDeletar?.(pessoa, indice)}
            >
              <img src={trash} alt="" width={24} height={24} />
            </button>
          </div>
        </div>
      </section>

      {linhas.map(({ q, i, extra, numero }) => (
        <Fragment key={q.id}>
          <CartaoResposta
            rotulo={`Pergunta ${i + 1}:`}
            enunciado={q.enunciado}
            pergunta={q}
            resposta={pessoa}
          />
          {extra ? (
            <CartaoRespostaExtra
              numero={`${indice + 1}.${numero}`}
              extra={extra}
              resposta={pessoa}
            />
          ) : null}
        </Fragment>
      ))}
    </>
  )
}
