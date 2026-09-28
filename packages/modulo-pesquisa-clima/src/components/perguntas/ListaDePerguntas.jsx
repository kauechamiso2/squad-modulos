import s from './ListaDePerguntas.module.css'
import { estiloDaEscala } from './escala.js'
import { Interruptor } from '@squad/ui'
import { LIMITE_CURTA, LIMITE_LONGA } from '../../pages/nova-pesquisa/bancoDePerguntas.js'

import pencilSimpleLine from '../../assets/icons/PencilSimpleLine.svg'
import trash from '../../assets/icons/Trash.svg'
import circle from '../../assets/icons/Circle.svg'
import radioButton from '../../assets/icons/RadioButton.svg'
import square from '../../assets/icons/Square.svg'
import checkSquare from '../../assets/icons/CheckSquare.svg'
import star from '../../assets/icons/Star.svg'
import plus from '../../assets/icons/Plus.svg'
import { avisarValorDesconhecido } from '../../lib/desconhecido.js'
import { ehObrigatoria as obrigatoriaPadrao } from '../../lib/obrigatorias.js'

/*
 * Card de abertura, cards de pergunta e a linha de adicionar (Figma 8065:4915).
 *
 * Nasceu dentro da tela de revisão do fluxo e saiu de lá quando a aba
 * Perguntas do detalhe passou a mostrar exatamente a mesma lista. Não sabe de
 * onde vêm os dados nem o que os botões fazem: tudo entra por prop, o que é o
 * que permite ao detalhe interceptar os cliques quando a pesquisa está
 * rodando sem duplicar nada disto.
 *
 * Em `somenteLeitura` os botões somem — não desabilitados, ausentes. É como a
 * tela do ciclo mostra as perguntas de um ciclo fechado: aquilo já foi
 * perguntado e não há o que editar.
 *
 * O interruptor "Tornar obrigatória" fica à esquerda dos ícones e vale para
 * aquela pergunta só. O padrão da pesquisa, nas configurações avançadas,
 * decide por quem nunca foi mexida; mexer numa a solta do padrão.
 *
 * O vermelho do Trash vem do próprio SVG (#FF2633), não de CSS.
 */
const ESTRELAS = [1, 2, 3, 4, 5]

function Icone({ src, rotulo, onClick }) {
  return (
    <button type="button" className={s.acao} aria-label={rotulo} onClick={onClick}>
      <img className={s.icone} src={src} alt="" width={24} height={24} />
    </button>
  )
}

/*
 * Coluna de um degrau: o número em cima, o alvo embaixo. Serve tanto para a
 * escala de nota quanto para as estrelas — muda só o ícone.
 *
 * Com `onEscolher` vira botão: é a mesma coluna, clicável, que a vista de
 * quem responde usa.
 */
function Degrau({ numero, icone, marcado = false, rotulo, onEscolher }) {
  const conteudo = (
    <>
      <p className={s.numeroDegrau}>{numero}</p>
      <img className={s.icone} src={icone} alt="" width={24} height={24} />
    </>
  )
  if (!onEscolher) return <div className={s.degrau}>{conteudo}</div>
  return (
    <button
      type="button"
      className={`${s.degrau} ${s.alvo}`}
      role="radio"
      aria-checked={marcado}
      aria-label={rotulo ?? String(numero)}
      onClick={onEscolher}
    >
      {conteudo}
    </button>
  )
}

/*
 * As opções de uma pergunta de escolha.
 *
 * `opcoes` ausente derrubava a tela inteira — uma pergunta guardada sem o
 * campo levava junto a aba de Perguntas e a vista de quem responde, com um
 * `.map` de `undefined`. Uma lista vazia é o que ela é.
 *
 * Vazia não some calada, porém: uma pergunta de escolha sem escolha nenhuma
 * é uma pergunta que ninguém consegue responder, e quem está montando o
 * questionário precisa ver isso em vez de um espaço em branco.
 */
function ListaDeOpcoes({
  opcoes,
  temOutro,
  icone,
  iconeMarcado,
  marcadas = [],
  onAlternar,
}) {
  const base = Array.isArray(opcoes) ? opcoes : []
  const linhas = temOutro ? [...base, 'Outro'] : base

  if (!linhas.length) {
    return (
      <p className={s.semOpcoes}>
        Esta pergunta é de escolha, mas não tem nenhuma opção — ninguém
        consegue respondê-la assim. Edite a pergunta para acrescentar as
        opções.
      </p>
    )
  }

  return (
    <div className={s.opcoes} role={onAlternar ? 'group' : undefined}>
      {linhas.map((opcao, indice) => {
        const marcada = marcadas.includes(indice)
        const arte = marcada && iconeMarcado ? iconeMarcado : icone
        const dentro = (
          <>
            <img className={s.icone} src={arte} alt="" width={24} height={24} />
            <p className={s.textoOpcao}>{opcao}</p>
          </>
        )
        return onAlternar ? (
          <button
            type="button"
            // eslint-disable-next-line react/no-array-index-key
            key={`${opcao}-${indice}`}
            className={`${s.opcao} ${s.alvo}`}
            aria-pressed={marcada}
            onClick={() => onAlternar(indice)}
          >
            {dentro}
          </button>
        ) : (
          // eslint-disable-next-line react/no-array-index-key
          <div key={`${opcao}-${indice}`} className={s.opcao}>
            {dentro}
          </div>
        )
      })}
    </div>
  )
}

/*
 * O corpo muda com o tipo; o cabeçalho e o enunciado são iguais em todos.
 *
 * Exportado porque a vista de quem responde desenha a mesma pergunta: os
 * alvos, os campos e a escala são os mesmos, muda só quem responde a eles.
 *
 * Sem `onResponder` é o desenho da pergunta — alvos vazios e campos com
 * placeholder, que é o que a lista do administrador mostra. Com
 * `onResponder`, os mesmos alvos viram botões e os campos passam a ser
 * controlados: é a mesma geometria, agora respondível.
 *
 * Estrelas responde na escala numerada de Circle/RadioButton, e não em
 * estrelas: não existe no projeto uma estrela cheia que faça par com a
 * vazia, e é a mesma escolha que CorpoDaResposta já fez para mostrar uma
 * resposta de estrelas.
 */
export function CorpoDaPergunta({ pergunta, valor, onResponder }) {
  const responder = typeof onResponder === 'function' ? onResponder : null
  const escolher = (n) => (responder ? () => responder(n) : undefined)

  switch (pergunta.tipo) {
    case 'nota': {
      const degraus = Array.from({ length: (pergunta.maximo ?? 5) + 1 }, (_, i) => i)
      return (
        <div className={s.escala} role={responder ? 'radiogroup' : undefined}>
          <p className={s.pontaEscala}>{pergunta.pontaEsquerda}</p>
          <div className={s.degraus} style={estiloDaEscala(degraus.length)}>
            {degraus.map((n) => (
              <Degrau
                key={n}
                numero={n}
                icone={responder && valor === n ? radioButton : circle}
                marcado={valor === n}
                onEscolher={escolher(n)}
              />
            ))}
          </div>
          <p className={s.pontaEscala}>{pergunta.pontaDireita}</p>
        </div>
      )
    }
    case 'escolhaUnica':
      return (
        <ListaDeOpcoes
          opcoes={pergunta.opcoes}
          temOutro={pergunta.temOutro}
          icone={circle}
          iconeMarcado={radioButton}
          marcadas={valor === undefined || valor === null ? [] : [valor]}
          onAlternar={responder ? (i) => responder(i) : undefined}
        />
      )
    case 'escolhaMultipla':
      return (
        <ListaDeOpcoes
          opcoes={pergunta.opcoes}
          temOutro={pergunta.temOutro}
          icone={square}
          iconeMarcado={checkSquare}
          marcadas={valor || []}
          onAlternar={
            responder
              ? (i) => {
                  const atuais = valor || []
                  const proximas = atuais.includes(i)
                    ? atuais.filter((x) => x !== i)
                    : [...atuais, i]
                  responder(proximas.sort((a, b) => a - b))
                }
              : undefined
          }
        />
      )
    case 'respostaCurta':
      return (
        <div className={s.linha}>
          <input
            className={s.campo}
            type="text"
            maxLength={LIMITE_CURTA}
            placeholder="Resposta curta..."
            aria-label="Resposta curta"
            {...(responder
              ? { value: valor ?? '', onChange: (e) => responder(e.target.value) }
              : {})}
          />
        </div>
      )
    case 'respostaLonga':
      return (
        <div className={s.linha}>
          <textarea
            className={s.campo}
            rows={1}
            maxLength={LIMITE_LONGA}
            placeholder="Resposta longa..."
            aria-label="Resposta longa"
            {...(responder
              ? { value: valor ?? '', onChange: (e) => responder(e.target.value) }
              : {})}
          />
        </div>
      )
    case 'estrelas':
      return (
        <div
          className={`${s.escala} ${s.escalaCentrada}`}
          role={responder ? 'radiogroup' : undefined}
        >
          <div className={s.degraus} style={estiloDaEscala(ESTRELAS.length)}>
            {ESTRELAS.map((n) => (
              <Degrau
                key={n}
                numero={n}
                icone={responder ? (valor === n ? radioButton : circle) : star}
                marcado={valor === n}
                onEscolher={escolher(n)}
              />
            ))}
          </div>
        </div>
      )
    default:
      /* Pergunta de tipo desconhecido não pode sumir em silêncio: quem monta
         precisa ver que ela está no questionário e que não dá para
         desenhá-la. */
      avisarValorDesconhecido('tipo da pergunta', pergunta.tipo)
      return (
        <p className={s.semSuporte}>
          Pergunta de um tipo que esta tela não sabe mostrar
          ({String(pergunta.tipo)}).
        </p>
      )
  }
}

export default function ListaDePerguntas({
  nome,
  abertura,
  perguntas,
  somenteLeitura = false,
  /* Quem não passar a função vê o que a própria pergunta diz. O padrão era
     `false`, que mentia: pergunta sem marcação é obrigatória. */
  ehObrigatoria = obrigatoriaPadrao,
  onEditarAbertura,
  onEditarPergunta,
  onRemoverPergunta,
  onAlternarObrigatoria,
  onAdicionar,
}) {
  return (
    <>
      <section className={s.cartao}>
        <div className={s.topoCartao}>
          <p className={s.rotuloAbertura}>Abertura</p>
          {somenteLeitura ? null : (
            <Icone
              src={pencilSimpleLine}
              rotulo="Editar abertura"
              onClick={onEditarAbertura}
            />
          )}
        </div>
        <div className={s.linha}>
          <p className={s.nomePesquisa}>{nome || 'Nova Pesquisa'}</p>
        </div>
        <div className={s.linha}>
          <p className={s.introducao}>{abertura}</p>
        </div>
      </section>

      {perguntas.map((pergunta, indice) => (
        <section key={pergunta.id} className={s.cartao}>
          <div className={s.topoCartao}>
            <p className={s.rotuloPergunta}>Pergunta {indice + 1}:</p>
            {somenteLeitura ? null : (
              <div className={s.acoes}>
                <div className={s.grupoObrigatoria}>
                  <span className={s.rotuloObrigatoria}>Tornar obrigatória</span>
                  <Interruptor
                    pequeno
                    ligado={ehObrigatoria(pergunta)}
                    rotulo={`Tornar obrigatória a pergunta ${indice + 1}`}
                    onAlternar={() => onAlternarObrigatoria(pergunta)}
                  />
                </div>
                <span className={s.divisorAcoes} aria-hidden="true" />
                <Icone
                  src={pencilSimpleLine}
                  rotulo={`Editar pergunta ${indice + 1}`}
                  onClick={() => onEditarPergunta(pergunta)}
                />
                <Icone
                  src={trash}
                  rotulo={`Excluir pergunta ${indice + 1}`}
                  onClick={() => onRemoverPergunta(pergunta)}
                />
              </div>
            )}
          </div>
          <div className={s.linha}>
            <p className={s.enunciado}>{pergunta.enunciado}</p>
          </div>
          <CorpoDaPergunta pergunta={pergunta} />
        </section>
      ))}

      {somenteLeitura ? null : (
        <button type="button" className={s.adicionar} onClick={onAdicionar}>
          <span className={s.textoAdicionar}>Adicionar pergunta</span>
          <img className={s.icone} src={plus} alt="" width={24} height={24} />
        </button>
      )}
    </>
  )
}
