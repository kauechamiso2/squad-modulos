import { X } from '@phosphor-icons/react'
import { PainelLateral } from '@squad/ui'
import { useFluxo } from './estado.jsx'
import * as Categorias from '../../lib/categorias.js'
import * as Contatos from '../../lib/contatos.js'
import { partes } from '../../lib/moeda.js'
import { formatarCurta, hojeIso } from '../../lib/datas.js'
import { REPETICOES } from '../../lib/transacoes.js'
import s from '../../components/Painel.module.css'

/* Painel "Resumo de entrada" / "Resumo de saída" (Figma 2279:95131). */
function PainelResumo({
  aberto,
  onCancelar, onFinalizar }) {
  const fluxo = useFluxo()
  const categoria = Categorias.porId(fluxo.categoriaId)
  const { inteiro, centavos } = partes(fluxo.valorCentavos)
  const status = fluxo.copy.status.find((st) => st.id === fluxo.status)
  const repete = REPETICOES.find((r) => r.id === fluxo.repete)

  const nome = fluxo.nomeFinal

  /*
   * Mesma regra da coluna Contato da tabela: o nome quando o contato foi
   * salvo, e o que foi vinculado quando nao foi.
   */
  const pagador = Contatos.rotuloDaTransacao({
    contatoId: fluxo.contatoId,
    contatoAvulso: fluxo.pagadorAvulso,
  }) || '—'

  return (
    <PainelLateral
      aberto={aberto}
      titulo={fluxo.copy.tituloResumo}
      iconeFechar={<X size={24} color="var(--cor-texto-secundario)" />}
      onFechar={onCancelar}
      rotuloConfirmar="Finalizar"
      onConfirmar={onFinalizar}
      prenderFoco
    >
      <p className={s.valorResumo}>
        <span className={s.valorResumoSimbolo}>R$</span>
        <span className={s.valorResumoNumero}>
          {inteiro.replace('R$', '')}{centavos}
        </span>
      </p>

      <div className={s.linhasResumo}>
        <div className={s.linhaResumo}>
          <span className={s.rotuloResumo}>Nome</span>
          <span className={s.valorLinhaResumo}>{nome}</span>
        </div>

        <div className={s.linhaResumo}>
          <span className={s.rotuloResumo}>{fluxo.copy.rotuloPapel}</span>
          <span className={s.valorLinhaResumo}>{pagador}</span>
        </div>

        <div className={s.linhaResumo}>
          <span className={s.rotuloResumo}>Categoria</span>
          <span className={s.valorLinhaResumo}>
            <span className={s.circuloEmoji}>{categoria?.emoji}</span>
            {categoria?.nome}
          </span>
        </div>

        <div className={s.linhaResumo}>
          <span className={s.rotuloResumo}>Status</span>
          <span className={s.valorLinhaResumo}>{status?.rotulo ?? '—'}</span>
        </div>

        <div className={s.linhaResumo}>
          <span className={s.rotuloResumo}>{fluxo.copy.rotuloData}</span>
          <span className={s.valorLinhaResumo}>
            {fluxo.data === hojeIso() ? 'Hoje' : formatarCurta(fluxo.data)}
          </span>
        </div>

        <div className={s.linhaResumo}>
          <span className={s.rotuloResumo}>Repete</span>
          <span className={s.valorLinhaResumo}>{repete?.rotulo ?? 'Não'}</span>
        </div>

        <div className={`${s.linhaResumo} ${s.linhaResumoAlta}`}>
          <span className={s.rotuloResumo}>Observação</span>
          <span className={`${s.valorLinhaResumo} ${s.valorLinhaResumoEsquerda}`}>
            {fluxo.observacao.trim() || '—'}
          </span>
        </div>
      </div>
    </PainelLateral>
  )
}

export default PainelResumo
