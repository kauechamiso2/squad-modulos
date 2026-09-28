import { useState } from 'react'
import { X } from '@phosphor-icons/react'
import { ModalConfirmar, OpcaoRadio } from '@squad/ui'
import { formatar } from '../lib/moeda.js'
import { paraData } from '../lib/datas.js'
import { rotuloDaTransacao } from '../lib/contatos.js'
import { ESCOPOS } from '../lib/series.js'
import s from './ModalEscopo.module.css'

/*
 * Os tres modais de escopo do resumo de transacao (Figma 2279:102515, 102698,
 * 104737, 104529). Todos sao o ModalConfirmar do @squad/ui com o mesmo corpo:
 * ou uma frase, ou o par de radios "Essa / Todas as proximas".
 */
const SUBSTANTIVO = { entrada: 'entrada', saida: 'saída' }

function diaEMes(isoStr) {
  const d = paraData(isoStr)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

function ModalEscopo({ transacao, acao, onConfirmar, onCancelar }) {
  /* "Todas as proximas" ja vem marcado ao editar data (Figma 2279:104737); ao
     remover e ao editar repeticao vem "Essa" (2279:102698, 104529). */
  const [escopo, setEscopo] = useState(
    acao === 'data' ? ESCOPOS.PROXIMAS : ESCOPOS.ESTA,
  )
  const palavra = SUBSTANTIVO[transacao.tipo]
  const repete = transacao.repete && transacao.repete !== 'nao'
  const contato = rotuloDaTransacao(transacao)

  const titulo = acao === 'remover'
    ? `Remover ${palavra}`
    : acao === 'data' ? 'Editar data' : 'Editar repetição'

  /* Sem repeticao so existe o caso de remover, e ele mostra a frase. */
  const semEscolha = acao === 'remover' && !repete

  return (
    <ModalConfirmar
      titulo={titulo}
      largura={532}
      espacamento={40}
      rodapeADireita
      iconeFechar={<X size={24} />}
      rotuloCancelar="Cancelar"
      rotuloConfirmar={semEscolha ? 'Remover' : 'Confirmar'}
      texto={
        semEscolha ? (
          <span className={s.frase}>
            Você registrou <b className={s.destaque}>{formatar(transacao.valorCentavos)}</b>
            {contato ? <> de <b className={s.destaque}>{contato}</b></> : null}
            {' '}em <b className={s.destaque}>{diaEMes(transacao.data)}</b>. Confirme se deseja
            remover do fluxo de caixa.
          </span>
        ) : (
          <div className={s.opcoes} role="radiogroup" aria-label={titulo}>
            <OpcaoRadio
              marcada={escopo === ESCOPOS.ESTA}
              onEscolher={() => setEscopo(ESCOPOS.ESTA)}
            >
              {`Essa ${palavra}`}
            </OpcaoRadio>
            <OpcaoRadio
              marcada={escopo === ESCOPOS.PROXIMAS}
              onEscolher={() => setEscopo(ESCOPOS.PROXIMAS)}
            >
              {`Todas as próximas ${palavra}s`}
            </OpcaoRadio>
          </div>
        )
      }
      onConfirmar={() => onConfirmar(semEscolha ? ESCOPOS.ESTA : escopo)}
      onCancelar={onCancelar}
    />
  )
}

export default ModalEscopo
