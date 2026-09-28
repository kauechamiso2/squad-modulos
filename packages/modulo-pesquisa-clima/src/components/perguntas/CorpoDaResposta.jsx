import s from './ListaDePerguntas.module.css'
import { estiloDaEscala } from './escala.js'

import circle from '../../assets/icons/Circle.svg'
import radioButton from '../../assets/icons/RadioButton.svg'
import square from '../../assets/icons/Square.svg'
import checkSquare from '../../assets/icons/CheckSquare.svg'
import { avisarValorDesconhecido } from '../../lib/desconhecido.js'

/*
 * O que uma pessoa respondeu, desenhado com a mesma geometria da pergunta
 * (Figma 8032:1809) — por isso divide o CSS com ListaDePerguntas: escala,
 * degraus e lista de opções são os mesmos, muda só qual alvo está marcado.
 *
 * Escolhida: RadioButton no lugar do Circle, CheckSquare no lugar do Square.
 * É o par que o projeto já usa nos modais de configuração.
 *
 * Estrelas cai na mesma escala numerada da nota: o Figma não desenha uma
 * resposta de estrelas, e não existe no projeto uma estrela "cheia" que faça
 * par com a vazia, como Circle faz com RadioButton. Numa resposta o que
 * importa é qual valor foi dado, e a escala já diz isso.
 */
function Escala({ de, ate, escolhido, esquerda, direita }) {
  const passos = Array.from({ length: ate - de + 1 }, (_, i) => de + i)
  return (
    <div className={`${s.escala} ${esquerda ? '' : s.escalaCentrada}`}>
      {esquerda ? <p className={s.pontaEscala}>{esquerda}</p> : null}
      <div className={s.degraus} style={estiloDaEscala(passos.length)}>
        {passos.map((n) => (
          <div key={n} className={s.degrau}>
            <p className={s.numeroDegrau}>{n}</p>
            <img
              className={s.icone}
              src={n === escolhido ? radioButton : circle}
              alt={n === escolhido ? 'Escolhida' : ''}
              width={24}
              height={24}
            />
          </div>
        ))}
      </div>
      {direita ? <p className={s.pontaEscala}>{direita}</p> : null}
    </div>
  )
}

/* Mesma regra da lista de perguntas: escolha sem opção nenhuma não vira um
   espaço em branco, que faria a resposta guardada parecer vazia. */
function Opcoes({ opcoes, marcadas, unica }) {
  if (!opcoes.length) {
    return (
      <p className={s.semSuporte}>
        A pergunta desta resposta não tem opção nenhuma guardada, então não dá
        para mostrar o que foi escolhido.
      </p>
    )
  }

  return (
    <div className={s.opcoes}>
      {opcoes.map((opcao, indice) => {
        const escolhida = marcadas.includes(indice)
        const vazio = unica ? circle : square
        const cheio = unica ? radioButton : checkSquare
        return (
          // eslint-disable-next-line react/no-array-index-key
          <div key={`${opcao}-${indice}`} className={s.opcao}>
            <img
              className={s.icone}
              src={escolhida ? cheio : vazio}
              alt={escolhida ? 'Escolhida' : ''}
              width={24}
              height={24}
            />
            <p className={s.textoOpcao}>{opcao}</p>
          </div>
        )
      })}
    </div>
  )
}

export default function CorpoDaResposta({ pergunta, resposta }) {
  if (!resposta) return null

  switch (resposta.tipo) {
    case 'nota':
      return (
        <Escala
          de={0}
          ate={pergunta.maximo ?? 5}
          escolhido={resposta.valor}
          esquerda={pergunta.pontaEsquerda}
          direita={pergunta.pontaDireita}
        />
      )
    case 'estrelas':
      return <Escala de={1} ate={5} escolhido={resposta.valor} />
    case 'escolhaUnica':
      return (
        <Opcoes opcoes={pergunta.opcoes || []} marcadas={[resposta.valor]} unica />
      )
    case 'escolhaMultipla':
      return <Opcoes opcoes={pergunta.opcoes || []} marcadas={resposta.valor} />
    case 'respostaCurta':
    case 'respostaLonga':
      /* O texto vem em cinza, como o Figma desenha — é o que a pessoa
         escreveu, não um rótulo da tela. */
      return (
        <div className={s.textoRespondido}>
          <p className={s.textoLivre}>{resposta.valor}</p>
        </div>
      )
    default:
      /* Tipo que o projeto não conhece: some da tela se devolver `null`, e a
         resposta guardada parece não existir. Melhor dizer que ela está lá e
         que não dá para desenhá-la. */
      avisarValorDesconhecido('tipo da pergunta', resposta.tipo)
      return (
        <p className={s.semSuporte}>
          Resposta guardada num formato que esta tela não sabe mostrar
          ({String(resposta.tipo)}).
        </p>
      )
  }
}
