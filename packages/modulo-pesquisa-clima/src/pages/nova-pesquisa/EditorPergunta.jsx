import { useState } from 'react'
import s from './Editor.module.css'
import { Botao, IconeBotao, Interruptor, ModalConfirmar, useModal } from '@squad/ui'
import iguais from '../../lib/iguais.js'
import {
  TIPOS,
  converterPergunta,
  perguntaVazia,
  LIMITE_CURTA,
  LIMITE_LONGA,
} from './bancoDePerguntas.js'
import {
  suportaExtra,
  perguntaExtraDe,
  opcoesNegativasDe,
  perguntaExtraNaEscala,
  perguntaExtraSemOpcao,
} from '../../lib/perguntaExtra.js'

import close from '../../assets/icons/Close.svg'
import trash from '../../assets/icons/Trash.svg'
import checkSquare from '../../assets/icons/CheckSquare.svg'
import square from '../../assets/icons/Square.svg'
import caretDown from '../../assets/icons/CaretDown.svg'
import caretUpDown from '../../assets/icons/CaretUpDown.svg'
import plus from '../../assets/icons/Plus.svg'

const NOTA_MIN = 3
const NOTA_MAX = 10
const MIN_OPCOES = 2

/* A escala de nota sempre começa em zero; só o teto é configurável. */
const TETOS = Array.from(
  { length: NOTA_MAX - NOTA_MIN + 1 },
  (_, i) => NOTA_MIN + i,
)

/*
 * Editor de pergunta. Serve para os dois casos: editar uma existente e criar
 * uma nova — a diferença é só a pergunta que entra.
 *
 * O corpo segue o Figma por tipo (8197:5921 Avaliação, 8201:9071/8203:12280
 * Múltipla/Única, 8203:13413 Curta/Longa): campos rotulados, opções em lista
 * com remover ao lado, e o tipo escolhido antes de tudo quando é nova — a
 * escolha inicial do tipo (tela "Escolha o tipo da pergunta" logo abaixo)
 * não tem frame próprio no Figma, e segue a mesma convenção de construtor de
 * formulário do resto do modal.
 *
 * A edição acontece numa cópia: só o "Salvar" devolve, então fechar descarta.
 *
 * Fechar pergunta antes, e é a exceção do projeto — nos outros modais o
 * fechar descarta calado, de propósito, porque o que se perde ali é um campo
 * ou dois. Aqui é uma pergunta inteira: enunciado, opções, rótulos. Só
 * pergunta se houver o que perder; sem nada alterado desde que abriu, fecha
 * direto.
 */
export default function EditorPergunta({ pergunta, numero, onSalvar, onFechar }) {
  const [rascunho, setRascunho] = useState(pergunta)
  /* A pergunta como estava ao abrir o editor — é com ela que o rascunho se
     compara para saber se há alterações. Numa pergunta nova ela nasce junto
     com o tipo escolhido, e é por isso que é estado e não a prop. */
  const [original, setOriginal] = useState(pergunta)
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false)
  /* O texto de uma opção ainda não confirmada — só vira opção de verdade,
     em rascunho.opcoes, no clique do "+". Fica fora do rascunho porque não
     é uma opção da pergunta enquanto não é confirmada: contá-la ali faria o
     "Salvar" travar por uma linha que a pessoa ainda nem terminou de
     escrever, e um "Voltar" no meio a perderia como qualquer outro campo
     não confirmado. */
  const [novaOpcao, setNovaOpcao] = useState('')

  const alterada = !iguais(rascunho, original)
  const fechar = () => {
    if (alterada) setConfirmandoDescarte(true)
    else onFechar()
  }
  /* Esc segue o mesmo caminho do X: com algo alterado, passa pela pergunta de
     descarte em vez de jogar fora direto. */
  const caixa = useModal(fechar)

  /* Sem pergunta ainda: primeiro passo é escolher o tipo. */
  if (!rascunho) {
    return (
      <div className={s.scrim}>
        <div className={s.modal} ref={caixa} role="dialog" aria-label="Nova pergunta">
          <div className={s.cabecalho}>
            <p className={s.titulo}>Nova pergunta</p>
            {/* Ainda não há nada para descartar: só se escolheu o tipo. */}
            <IconeBotao src={close} rotulo="Fechar" onClick={onFechar} />
          </div>
          <p className={s.dica}>Escolha o tipo da pergunta.</p>
          <div className={s.tipos}>
            {TIPOS.map(({ id, nome }) => (
              <button
                key={id}
                type="button"
                className={s.tipo}
                onClick={() => {
                  const nova = perguntaVazia(id)
                  setRascunho(nova)
                  setOriginal(nova)
                }}
              >
                {nome}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const alterar = (campos) => setRascunho((r) => ({ ...r, ...campos }))

  /*
   * Trocar o tipo troca os campos abaixo, levando junto o que ainda faz
   * sentido para o tipo novo.
   *
   * Numa pergunta nova em que ainda não se digitou nada, a base acompanha a
   * troca: escolher "Texto longo", mudar de ideia e fechar não é alteração
   * nenhuma. Numa pergunta que já existia a base fica como estava — aí a
   * troca de tipo é justamente o que se perderia ao fechar.
   */
  const trocarTipo = (tipo) => {
    const intocada = !alterada
    setRascunho((r) => converterPergunta(r, tipo))
    if (!pergunta && intocada) setOriginal((o) => converterPergunta(o, tipo))
  }

  const alterarOpcao = (indice, texto) =>
    alterar({
      opcoes: rascunho.opcoes.map((o, i) => (i === indice ? texto : o)),
    })

  /* Confirma o que estava em "Adicionar opção": vira uma linha de verdade
     na lista, e o campo volta a ficar vazio para a próxima. Em branco não
     faz nada — é o que já mantém o "+" desabilitado. */
  const adicionarOpcao = () => {
    const texto = novaOpcao.trim()
    if (!texto) return
    alterar({ opcoes: [...rascunho.opcoes, texto] })
    setNovaOpcao('')
  }

  const removerOpcao = (indice) =>
    alterar({
      opcoes: rascunho.opcoes.filter((_, i) => i !== indice),
      /* A opção some, e as negativas marcadas nela ou depois dela têm de
         acompanhar — senão a marca ficaria apontando para a opção que tomou
         o lugar da removida. */
      ...(rascunho.perguntaExtra
        ? { perguntaExtra: perguntaExtraSemOpcao(rascunho.perguntaExtra, indice) }
        : {}),
    })

  const temOpcoes =
    rascunho.tipo === 'escolhaUnica' || rascunho.tipo === 'escolhaMultipla'

  /* Só o enunciado é obrigatório; opções em branco travam o salvar porque
     virariam linhas vazias no cartão. */
  const podeSalvar =
    rascunho.enunciado.trim() !== '' &&
    (!temOpcoes || rascunho.opcoes.every((o) => o.trim() !== ''))

  const extra = perguntaExtraDe(rascunho)
  const opcoesNegativas = suportaExtra(rascunho.tipo)
    ? opcoesNegativasDe(rascunho)
    : []

  return (
    <div className={s.scrim}>
      <div
        className={`${s.modal} ${s.modalPergunta}`}
        ref={caixa}
        role="dialog"
        aria-label="Editar pergunta"
      >
        <div className={s.cabecalho}>
          {/* O número da pergunta na lista, e não mais o tipo — é o que o
              Figma passou a desenhar (8203:14400 e irmãos). Quem quer saber
              o tipo olha o próprio seletor, logo abaixo. */}
          <p className={s.titulo}>Pergunta {numero}</p>
          <IconeBotao src={close} rotulo="Fechar" onClick={fechar} />
        </div>

        <div className={`${s.corpo} ${s.corpoPergunta}`}>
          {/* Trocar o tipo aqui troca os campos abaixo: o que não vale mais
              para o tipo novo sai do rascunho junto. */}
          <label className={s.campo}>
            <span className={s.rotulo}>Tipo</span>
            <span className={s.selecaoEnvoltorio}>
              <select
                className={`${s.entrada} ${s.selecaoEntrada}`}
                value={rascunho.tipo}
                onChange={(e) => trocarTipo(e.target.value)}
              >
                {TIPOS.map(({ id, nome }) => (
                  <option key={id} value={id}>
                    {nome}
                  </option>
                ))}
              </select>
              <img className={s.selecaoIcone} src={caretDown} alt="" width={24} height={24} />
            </span>
          </label>

          <label className={s.campo}>
            <span className={s.rotulo}>Pergunta</span>
            <textarea
              className={s.entrada}
              rows={2}
              value={rascunho.enunciado}
              placeholder="Escreva a pergunta"
              onChange={(e) => alterar({ enunciado: e.target.value })}
            />
          </label>

          {rascunho.tipo === 'nota' ? (
            <>
              <div className={s.campo}>
                <span className={s.rotulo}>Escala</span>
                {/* Duas caixas unidas por "a" (Figma 8200:6811): a piso é
                    sempre zero neste projeto, então a caixa da esquerda é só
                    visual — quem muda é o teto, na caixa da direita. */}
                <div className={s.linhaEscala}>
                  {/* Sem seta e sem cor de campo ativo: não é um controle,
                      é o piso fixo da escala, mostrado só para dizer onde
                      ela começa. */}
                  <div
                    className={`${s.caixaEscala} ${s.caixaEscalaFixa}`}
                    aria-hidden="true"
                  >
                    <span>0</span>
                  </div>
                  <span className={s.escalaSeparador}>a</span>
                  <span className={s.selecaoEnvoltorio}>
                    <select
                      className={`${s.entrada} ${s.selecaoEntrada}`}
                      value={rascunho.maximo}
                      onChange={(e) => {
                        const maximo = Number(e.target.value)
                        alterar({
                          maximo,
                          /* O teto pode baixar; uma nota marcada como
                             negativa que ficou fora da escala nova não pode
                             continuar marcada, senão a lista mostraria uma
                             opção que a pergunta não tem mais. */
                          ...(rascunho.perguntaExtra
                            ? {
                                perguntaExtra: perguntaExtraNaEscala(
                                  rascunho.perguntaExtra,
                                  maximo,
                                ),
                              }
                            : {}),
                        })
                      }}
                    >
                      {TETOS.map((teto) => (
                        <option key={teto} value={teto}>
                          {teto}
                        </option>
                      ))}
                    </select>
                    <img
                      className={s.selecaoIcone}
                      src={caretUpDown}
                      alt=""
                      width={24}
                      height={24}
                    />
                  </span>
                </div>
              </div>
              <div className={s.duasColunas}>
                <label className={s.campo}>
                  <span className={s.rotulo}>Rótulo da esquerda</span>
                  <input
                    className={s.entrada}
                    type="text"
                    value={rascunho.pontaEsquerda}
                    placeholder="Não recomendaria"
                    onChange={(e) => alterar({ pontaEsquerda: e.target.value })}
                  />
                </label>
                <label className={s.campo}>
                  <span className={s.rotulo}>Rótulo da direita</span>
                  <input
                    className={s.entrada}
                    type="text"
                    value={rascunho.pontaDireita}
                    placeholder="Recomendaria"
                    onChange={(e) => alterar({ pontaDireita: e.target.value })}
                  />
                </label>
              </div>
            </>
          ) : null}

          {temOpcoes ? (
            <div className={s.campo}>
              <span className={s.rotulo}>Opções</span>
              <div className={s.opcoes}>
                {rascunho.opcoes.map((opcao, indice) => (
                  // As opções não têm id próprio; a posição é o que as
                  // distingue enquanto se edita a lista.
                  // eslint-disable-next-line react/no-array-index-key
                  <div key={indice} className={s.linhaOpcao}>
                    <input
                      className={s.entrada}
                      type="text"
                      value={opcao}
                      placeholder={`Opção ${indice + 1}`}
                      onChange={(e) => alterarOpcao(indice, e.target.value)}
                    />
                    <button
                      type="button"
                      className={s.acaoIcone}
                      aria-label={`Remover opção ${indice + 1}`}
                      disabled={rascunho.opcoes.length <= MIN_OPCOES}
                      onClick={() => removerOpcao(indice)}
                    >
                      <img className={s.icone} src={trash} alt="" width={24} height={24} />
                    </button>
                  </div>
                ))}
                {/* A própria lista de opções ganha uma última linha para
                    adicionar (Figma 8203:12280) — não é mais um botão solto
                    abaixo dela. Começa vazia: só vira opção no clique do
                    "+", e depois volta a ficar vazia para a próxima. */}
                <div className={s.linhaOpcao}>
                  <input
                    className={s.entrada}
                    type="text"
                    value={novaOpcao}
                    placeholder="Adicionar opção"
                    onChange={(e) => setNovaOpcao(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return
                      e.preventDefault()
                      adicionarOpcao()
                    }}
                  />
                  <button
                    type="button"
                    className={s.acaoIcone}
                    aria-label="Adicionar opção"
                    disabled={!novaOpcao.trim()}
                    onClick={adicionarOpcao}
                  >
                    <img className={s.icone} src={plus} alt="" width={24} height={24} />
                  </button>
                </div>
              </div>
              <button
                type="button"
                className={s.alternador}
                onClick={() => alterar({ temOutro: !rascunho.temOutro })}
              >
                <img
                  className={s.icone}
                  src={rascunho.temOutro ? checkSquare : square}
                  alt=""
                  width={24}
                  height={24}
                />
                Incluir opção &quot;Outro&quot;
              </button>
            </div>
          ) : null}

          {rascunho.tipo === 'respostaCurta' ? (
            <p className={s.dica}>
              A resposta aceita até {LIMITE_CURTA} caracteres.
            </p>
          ) : null}
          {rascunho.tipo === 'respostaLonga' ? (
            <p className={s.dica}>
              A resposta aceita até {LIMITE_LONGA} caracteres.
            </p>
          ) : null}
          {rascunho.tipo === 'estrelas' ? (
            <p className={s.dica}>A escala é sempre de 5 estrelas.</p>
          ) : null}

          {/* Só nos quatro tipos com um conjunto fechado de respostas — nota,
              estrelas, única e múltipla. Texto curto e texto longo não têm o
              que marcar como negativo (Figma 8203:14400, 8203:9794). */}
          {suportaExtra(rascunho.tipo) ? (
            <div className={s.campo}>
              <div className={s.linhaExtra}>
                <span className={s.rotuloEInterruptor}>
                  <span className={s.rotuloExtra}>
                    Gerar pergunta extra quando a resposta for negativa
                  </span>
                  <Interruptor
                    pequeno
                    ligado={extra.ativa}
                    rotulo="Gerar pergunta extra quando a resposta for negativa"
                    onAlternar={() =>
                      alterar({ perguntaExtra: { ...extra, ativa: !extra.ativa } })
                    }
                  />
                </span>
                {/* Chevron decorativo — só aparece com a lista aberta, como
                    o Figma desenha (8200:6833 vs 8201:9110). Não tem clique
                    próprio: quem abre e fecha é o interruptor ao lado. */}
                {extra.ativa ? (
                  <img
                    className={s.chevronExtra}
                    src={caretDown}
                    alt=""
                    width={24}
                    height={24}
                  />
                ) : null}
              </div>

              {extra.ativa ? (
                <div className={s.listaNegativas}>
                  <p className={s.tituloNegativas}>Marque as opções negativas</p>
                  {opcoesNegativas.map(({ valor, texto }) => {
                    const marcada = extra.negativas.includes(valor)
                    return (
                      <button
                        key={valor}
                        type="button"
                        className={s.opcaoNegativa}
                        aria-pressed={marcada}
                        onClick={() =>
                          alterar({
                            perguntaExtra: {
                              ...extra,
                              negativas: marcada
                                ? extra.negativas.filter((v) => v !== valor)
                                : [...extra.negativas, valor],
                            },
                          })
                        }
                      >
                        <img
                          className={s.icone}
                          src={marcada ? checkSquare : square}
                          alt=""
                          width={24}
                          height={24}
                        />
                        <span>{texto}</span>
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className={s.rodape}>
          {/* "Voltar", não "Cancelar" — é como o Figma rotula o par com
              Salvar (8200:6871 e irmãos). O clique continua o mesmo: fecha
              o editor, perguntando antes se há o que descartar. */}
          <Botao onClick={fechar}>Voltar</Botao>
          <Botao
            variante="marca"
            desabilitado={!podeSalvar}
            onClick={() => onSalvar(rascunho)}
          >
            Salvar
          </Botao>
        </div>
      </div>

      {confirmandoDescarte ? (
        <ModalConfirmar
          titulo="Descartar alterações?"
          texto="Você perderá o que foi editado nesta pergunta."
          rotuloConfirmar="Descartar"
          onConfirmar={onFechar}
          onCancelar={() => setConfirmandoDescarte(false)}
        />
      ) : null}
    </div>
  )
}
