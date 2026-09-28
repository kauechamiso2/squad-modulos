import { useNavigate, useParams } from 'react-router-dom'
import { Botao } from '@squad/ui'
import VistaResposta from './VistaResposta.jsx'
import { useResposta } from './RespostaProvider.jsx'
import { EMAIL_EXEMPLO } from './exemplo.js'
import s from './Responder.module.css'

import eyeClosed from '../../assets/icons/EyeClosed.svg'
import { MODULE_BASE } from '../../routes.js'

/*
 * Primeira tela de quem responde (Figma 8073:7375).
 *
 * O e-mail e o "Mudar conta" são decorativos: não há login nesta vista.
 */
export default function TelaAbertura() {
  const { pesquisa, perguntas, obrigatoria } = useResposta()
  const navigate = useNavigate()
  const { id } = useParams()

  const anonimas = Boolean(pesquisa.configuracao?.respostasAnonimas)
  const temObrigatoria = perguntas.some(obrigatoria)

  return (
    <VistaResposta pesquisa={pesquisa} progresso={0}>
      <section className={s.cartao}>
        <h1 className={s.nome}>{pesquisa.nome}</h1>
        <p className={s.paragrafo}>{pesquisa.abertura}</p>

        <p className={s.paragrafo}>
          Você está respondendo como: <strong className={s.email}>{EMAIL_EXEMPLO}</strong>{' '}
          <span className={s.mudarConta}>Mudar conta</span>
        </p>

        {anonimas ? (
          <div className={s.linhaAnonima}>
            <img
              className={s.iconeAnonimo}
              src={eyeClosed}
              alt=""
              width={24}
              height={24}
            />
            <p className={s.notaAnonima}>
              Não se preocupe, suas respostas serão anônimas
            </p>
          </div>
        ) : null}

        {temObrigatoria ? (
          <p className={s.notaObrigatoria}>*Indica uma pergunta obrigatória</p>
        ) : null}
      </section>

      {/* Publicada e sem pergunta nenhuma: o botão apagado sem explicação
          deixava quem abriu o link sem saber o que fazer nem o que houve. O
          problema é de quem montou a pesquisa, e é isso que a tela diz. */}
      {perguntas.length === 0 ? (
        <section className={`${s.cartao} ${s.cartaoCentrado}`} role="alert">
          <p className={s.paragrafo}>
            Esta pesquisa ainda não tem perguntas configuradas, então não há o
            que responder por enquanto. Guarde este link e avise quem enviou —
            ele volta a funcionar assim que as perguntas forem adicionadas.
          </p>
        </section>
      ) : (
        <div className={s.acaoCentral}>
          <Botao
            variante="marca"
            onClick={() => navigate(`${MODULE_BASE}/responder/${id}/pergunta/1`)}
          >
            Começar pesquisa
          </Botao>
        </div>
      )}
    </VistaResposta>
  )
}
