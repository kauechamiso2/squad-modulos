import { X } from '@phosphor-icons/react'
import { ModalConfirmar } from '@squad/ui'
import { formatar } from '../lib/moeda.js'
import { paraData } from '../lib/datas.js'
import { rotuloDaTransacao } from '../lib/contatos.js'
import s from './ModalConfirmacao.module.css'

/*
 * "Confirmação de entrada" (Figma 2279:97240), centralizado.
 *
 * Vem da anotacao 2279:96454: "Pensei do Fin mandar notificacao via chat para
 * pessoa confirmar se essa entrada foi validada ou nao. Caso a pessoa nao
 * confirmar ficar com (i) de atencao e o preco continua em laranja."
 * A notificacao pelo Fin ainda nao existe, entao o (i) da tabela e quem abre.
 */
const COPY = {
  entrada: {
    titulo: 'Confirmação de entrada',
    acao: 'Confirmar recebimento',
    recusa: 'Não recebi',
    preposicao: 'de',
    meio: 'mas o recebimento ainda não foi confirmado.',
  },
  saida: {
    titulo: 'Confirmação de saída',
    acao: 'Confirmar pagamento',
    recusa: 'Não paguei',
    /* "para", nao "de" - e o que o Figma da Saida escreve (2279:100164). */
    preposicao: 'para',
    meio: 'mas o pagamento ainda não foi confirmado.',
  },
}

function diaEMes(isoStr) {
  const d = paraData(isoStr)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

function ModalConfirmacao({ transacao, onConfirmar, onFechar }) {
  const copy = COPY[transacao.tipo]
  const contato = rotuloDaTransacao(transacao)
  const quando = diaEMes(transacao.data)

  return (
    <ModalConfirmar
      titulo={copy.titulo}
      largura={532}
      espacamento={40}
      rodapeADireita
      iconeFechar={<X size={24} />}
      rotuloCancelar={copy.recusa}
      rotuloConfirmar={copy.acao}
      texto={
        <span className={s.texto}>
          Você registrou <b className={s.destaque}>{formatar(transacao.valorCentavos, { espaco: true })}</b>
          {contato
            ? <> {copy.preposicao} <b className={s.destaque}>{contato} em {quando}</b></>
            : <> em <b className={s.destaque}>{quando}</b></>}
          , {copy.meio} Confirme para que esse valor passe a contar no saldo do mês.
        </span>
      }
      onConfirmar={onConfirmar}
      onCancelar={onFechar}
    />
  )
}

export default ModalConfirmacao
