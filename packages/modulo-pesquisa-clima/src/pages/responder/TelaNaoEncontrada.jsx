import VistaResposta from './VistaResposta.jsx'
import { CAPA_PADRAO } from '../../lib/capa.js'
import s from './Responder.module.css'

/*
 * O que quem abre o link vê quando não há pesquisa para abrir.
 *
 * São dois becos, e nenhum deles é "a pesquisa está fechada" — por isso a
 * tela é outra, e não mais um motivo dentro de TelaForaDoAr:
 *
 * - `link`: o id do endereço não corresponde a pesquisa nenhuma. Antes daqui
 *   a vista montava o exemplo do Figma no lugar, com nome e perguntas de
 *   mentira: a pessoa respondia até o fim, via a tela de agradecimento e
 *   nada era guardado, porque não havia onde. Um link errado tem de dizer
 *   que está errado.
 *
 * - `envio`: a pesquisa existia quando o link abriu, mas na hora de enviar
 *   ela sumiu ou a gravação não passou. A resposta não entrou, e dizer
 *   obrigado seria dizer que entrou.
 *
 * - `dados`: não deu para ler o que está guardado. O link pode estar certo e
 *   a pesquisa existir — dizer "não encontrada" mandaria a pessoa cobrar de
 *   quem enviou um problema que não é do link.
 *
 * Mesma moldura das outras telas de quem responde. Sem capa da pesquisa —
 * não há pesquisa —, então vale o gradiente padrão.
 */
const MOTIVOS = {
  link: {
    titulo: 'Pesquisa não encontrada',
    texto:
      'Este link não leva a nenhuma pesquisa. Ele pode ter sido copiado pela metade, ou a pesquisa pode ter sido apagada. Vale confirmar o endereço com quem enviou.',
  },
  dados: {
    titulo: 'Não foi possível carregar a pesquisa',
    texto:
      'Os dados guardados neste navegador não puderam ser lidos, então não dá para abrir o formulário agora. O link pode estar correto. Tente de novo mais tarde, ou em outro navegador.',
  },
  envio: {
    titulo: 'Sua resposta não pôde ser enviada',
    texto:
      'Não foi possível guardar o que você respondeu — a pesquisa pode ter sido apagada, ou o armazenamento deste navegador está cheio. Nada foi registrado. Se puder, avise quem enviou o link antes de tentar de novo.',
  },
}

export default function TelaNaoEncontrada({ motivo = 'link' }) {
  const { titulo, texto } = MOTIVOS[motivo] ?? MOTIVOS.link

  return (
    <VistaResposta pesquisa={{ capa: CAPA_PADRAO }}>
      <section className={`${s.cartao} ${s.cartaoCentrado}`} role="alert">
        <h1 className={s.nome}>{titulo}</h1>
        <p className={s.paragrafo}>{texto}</p>
      </section>
    </VistaResposta>
  )
}
