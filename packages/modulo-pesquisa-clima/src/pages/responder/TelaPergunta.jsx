import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { CorpoDaPergunta } from '../../components/perguntas/ListaDePerguntas.jsx'
import VistaResposta, { RodapeDaVista } from './VistaResposta.jsx'
import { temResposta, useResposta } from './RespostaProvider.jsx'
import s from './Responder.module.css'
import p from '../../components/perguntas/ListaDePerguntas.module.css'
import { MODULE_BASE } from '../../routes.js'

/*
 * Uma pergunta por tela (Figma 8073:7467).
 *
 * O corpo é o mesmo `CorpoDaPergunta` da lista do fluxo, agora respondível —
 * os alvos e os campos são os mesmos, muda só quem responde a eles. O cartão
 * também é o mesmo desenho, sem os botões de editar e apagar.
 *
 * A divisória embaixo do enunciado não vem: nesta vista o Figma desenha o
 * bloco do enunciado sem linha, ao contrário da lista do administrador.
 *
 * A posição vem da URL, e a ordem vem da sessão.
 */
export default function TelaPergunta() {
  const { pesquisa, perguntas, valores, responder, enviar, obrigatoria } =
    useResposta()
  const navigate = useNavigate()
  const { id, numero } = useParams()

  const posicao = Number(numero)
  /* Número fora da lista (URL digitada à mão, pergunta apagada): volta para
     a abertura em vez de mostrar uma tela vazia. */
  if (!Number.isInteger(posicao) || posicao < 1 || posicao > perguntas.length) {
    return <Navigate to={`${MODULE_BASE}/responder/${id}`} replace />
  }

  const indice = posicao - 1
  const pergunta = perguntas[indice]
  const ultima = indice === perguntas.length - 1
  const progresso = (indice + 1) / perguntas.length
  const travado = obrigatoria(pergunta) && !temResposta(valores[pergunta.id])

  const irPara = (destino) => navigate(`${MODULE_BASE}/responder/${id}${destino}`)

  return (
    <VistaResposta
      pesquisa={pesquisa}
      rotuloProgresso={`Pergunta ${posicao} de ${perguntas.length}`}
      rodape={
        <RodapeDaVista
          rotuloProgresso={`Pergunta ${posicao} de ${perguntas.length}`}
          progresso={progresso}
          ultima={ultima}
          travado={travado}
          onVoltar={() => irPara(indice === 0 ? '' : `/pergunta/${posicao - 1}`)}
          onContinuar={() => (ultima ? enviar() : irPara(`/pergunta/${posicao + 1}`))}
        />
      }
    >
      <section className={p.cartao}>
        <div className={p.topoCartao}>
          <p className={p.rotuloPergunta}>Pergunta {posicao}:</p>
        </div>

        <div className={s.linhaEnunciado}>
          <p className={p.enunciado}>
            {pergunta.enunciado}
            {obrigatoria(pergunta) ? <span className={s.asterisco}>*</span> : null}
          </p>
        </div>

        <CorpoDaPergunta
          pergunta={pergunta}
          valor={valores[pergunta.id]}
          onResponder={(valor) => responder(pergunta.id, valor)}
        />
      </section>
    </VistaResposta>
  )
}
