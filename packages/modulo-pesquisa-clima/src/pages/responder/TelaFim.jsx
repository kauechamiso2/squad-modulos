import { Navigate, useParams } from 'react-router-dom'
import VistaResposta from './VistaResposta.jsx'
import { useResposta } from './RespostaProvider.jsx'
import s from './Responder.module.css'

/* O nome do arquivo é o da layer do Figma, como manda a convenção do
   projeto — é o @2x da caixa de 580x324 da tela. */
import pipo from '../../assets/images/7T7nCfyZ97uiZuW6Yue_3_VWS87PuS 1@2x.png'
import { MODULE_BASE } from '../../routes.js'

/*
 * Tela final (Figma 8082:8325). O texto do cartão é a mensagem final que a
 * pesquisa tem configurada; abaixo dele vem a ilustração do Pipo.
 *
 * Sem botão nenhum: acabou.
 *
 * Só aparece para quem acabou de enviar. Abrir ou recarregar este endereço
 * mostrava "Sua resposta foi enviada!" sem que nada tivesse sido enviado — a
 * afirmação vinha da URL, e não do que aconteceu. Sem envio nesta sessão, o
 * caminho é a abertura da pesquisa, que é o estado verdadeiro: dá para
 * responder. Recarregar depois de enviar cai lá também — a sessão se perdeu e
 * o aplicativo não tem como saber que foi esta pessoa que respondeu; afirmar
 * que foi seria adivinhar.
 */
export default function TelaFim() {
  const { pesquisa, enviou } = useResposta()
  const { id } = useParams()

  if (!enviou) return <Navigate to={`${MODULE_BASE}/responder/${id}`} replace />

  return (
    <VistaResposta pesquisa={pesquisa} progresso={1}>
      <section className={`${s.cartao} ${s.cartaoCentrado}`}>
        <h1 className={s.nome}>Sua resposta foi enviada!</h1>
        <p className={s.paragrafo}>{pesquisa.configuracao?.mensagemFinal}</p>
      </section>

      <img
        className={s.ilustracao}
        src={pipo}
        alt="Pipo descansando numa espreguiçadeira"
        width={580}
        height={324}
      />
    </VistaResposta>
  )
}
