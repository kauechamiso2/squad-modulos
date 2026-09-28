import VistaResposta from './VistaResposta.jsx'
import { cicloCheio } from '../../lib/participacao.js'
import s from './Responder.module.css'

import pipo from '../../assets/images/Pipo-Loading.png'
import { daTabela } from '../../lib/desconhecido.js'

/*
 * O que quem abre o link vê quando a pesquisa não está recebendo respostas —
 * que é tudo menos um ciclo correndo.
 *
 * São cinco situações e não uma. Antes só encerrada e fora do ar paravam
 * aqui: quem abria o link de uma pausada respondia como se nada fosse, e quem
 * abria o de uma agendada respondia para o nada — a resposta entrava e
 * desaparecia na próxima poda, com a tela de agradecimento já dada.
 *
 * Sem referência no Figma — a moldura é a mesma das outras telas de quem
 * responde, com o cartão centrado da tela final e sem botão nenhum, porque
 * não há o que fazer aqui.
 *
 * Cada texto diz o que de fato houve, e o que a pessoa pode esperar. Dizer
 * "não está no ar" para uma pesquisa que simplesmente acabou mandaria alguém
 * cobrar quem enviou por um problema que não existe; dizer "encerrada" para
 * uma que ainda vai abrir faria a pessoa jogar o link fora.
 */
const MOTIVOS = {
  encerrada: {
    titulo: 'Essa pesquisa foi encerrada.',
    /* Mesmo tratamento da tela final: o Pipo entra embaixo do cartão. */
    ilustracao: true,
  },
  rascunho: {
    titulo: 'Esta pesquisa ainda não foi publicada',
    texto:
      'Quem cuida dela ainda está preparando o formulário. Tente de novo mais tarde com o mesmo link.',
  },
  agendada: {
    titulo: 'Esta pesquisa ainda não começou',
    texto:
      'Ela já está marcada, mas o período de respostas não abriu. Guarde este link: ele passa a funcionar quando a pesquisa for enviada.',
  },
  aguardando: {
    titulo: 'Esta pesquisa está pausada no momento',
    texto:
      'Ela não está recebendo respostas agora. Guarde este link: ele volta a funcionar no próximo período de respostas.',
  },
  naoAtiva: {
    titulo: 'Esta pesquisa não está no ar',
    texto:
      'O formulário foi despublicado, então não dá para responder agora. Se você recebeu este link, vale avisar quem enviou.',
  },
  padrao: {
    titulo: 'Esta pesquisa não está recebendo respostas',
    texto:
      'O formulário não está aberto agora. Se você recebeu este link, vale avisar quem enviou.',
  },
}

export default function TelaForaDoAr({ pesquisa }) {
  /* Cheia é o mesmo fim que encerrada, para quem chega: o ciclo já colheu
     todas as respostas que tinha para colher. Vale mesmo com a pesquisa ainda
     rodando, e por isso vem antes do status. */
  const cheia = cicloCheio(pesquisa)
  const motivo =
    cheia || pesquisa.status === 'encerrada'
      ? MOTIVOS.encerrada
      : /* Quem recebeu o link não administra a pesquisa: um status estranho
           não vira diagnóstico na cara dele, cai no aviso genérico. O valor
           vai para o console, que é onde quem cuida do dado vai procurar. */
        (daTabela(MOTIVOS, pesquisa.status, 'status da pesquisa') ??
        MOTIVOS.padrao)

  return (
    <VistaResposta pesquisa={pesquisa}>
      <section className={`${s.cartao} ${s.cartaoCentrado}`}>
        <h1 className={s.nome}>{motivo.titulo}</h1>
        {motivo.texto ? <p className={s.paragrafo}>{motivo.texto}</p> : null}
      </section>

      {motivo.ilustracao ? (
        <img
          className={s.ilustracao}
          src={pipo}
          alt="Pipo trabalhando no computador"
          width={580}
          height={324}
        />
      ) : null}
    </VistaResposta>
  )
}
