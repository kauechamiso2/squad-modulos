import { useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaretRight } from '@phosphor-icons/react'
import { FluxoLayout } from '@squad/ui'
import { useFluxo } from './estado.jsx'
import { corDoNome } from './TelaNomeContato.jsx'
import * as Transacoes from '../../lib/transacoes.js'
import * as Categorias from '../../lib/categorias.js'
import * as Contatos from '../../lib/contatos.js'
import { formatarSemSimbolo, digitosParaCentavos, formatar } from '../../lib/moeda.js'
import { iniciais, ROTULO_TIPO } from '../../lib/documentos.js'
import s from './Passos.module.css'

/*
 * Passo 2 - valor (Figma 2279:94789 preenchido, 94840 vazio, 94891 sem historico).
 *
 * Os atalhos so listam combinacoes COM contato: uma linha de atalho sem
 * ninguem do lado direito nao ajuda a preencher nada.
 */
function TelaValor() {
  const navigate = useNavigate()
  const fluxo = useFluxo()
  const entradaRef = useRef(null)

  const categoria = Categorias.porId(fluxo.categoriaId)

  const comuns = useMemo(() => {
    const todas = Transacoes.combinacoesFrequentes(
      fluxo.transacoesIniciais, fluxo.tipo, fluxo.categoriaId, 10,
    )
    return todas.filter((c) => c.contatoId && Contatos.porId(c.contatoId)).slice(0, 3)
  }, [fluxo.transacoesIniciais, fluxo.tipo, fluxo.categoriaId])

  /*
   * "Faca sua primeira entrada em X" so vale quando a categoria nao tem
   * NENHUMA transacao. Ter transacoes mas nenhum atalho (porque nenhuma tinha
   * contato salvo) nao e a primeira vez - nesse caso o bloco some inteiro.
   */
  const primeiraVez = !fluxo.transacoesIniciais.some(
    (t) => t.tipo === fluxo.tipo && t.categoriaId === fluxo.categoriaId,
  )

  const aplicar = (c) => {
    fluxo.setValorCentavos(c.valorCentavos)
    fluxo.setContatoId(c.contatoId)
    navigate('../nome')
  }

  return (
    <FluxoLayout
      titulo={fluxo.copy.tituloFluxo}
      fixarBordas
      progresso={2 / 4}
      continuarDesabilitado={fluxo.valorCentavos === 0}
      onFechar={fluxo.sair}
      onVoltar={() => navigate('..')}
      onContinuar={() => navigate('../nome')}
    >
      <div className={s.blocoValorTopo}>
        <h1 className={s.tituloPasso}>{fluxo.copy.tituloValor}</h1>

        <div className={s.campoValor} onClick={() => entradaRef.current?.focus()}>
          <span className={s.cifrao}>R$</span>
          <span className={s.numero}>{formatarSemSimbolo(fluxo.valorCentavos)}</span>
          <span className={s.cursor} />
          <input
            ref={entradaRef}
            className={s.entradaEscondida}
            inputMode="numeric"
            aria-label={fluxo.copy.tituloValor}
            value={fluxo.valorCentavos ? String(fluxo.valorCentavos) : ''}
            onChange={(e) => fluxo.setValorCentavos(digitosParaCentavos(e.target.value))}
            onKeyDown={(e) => {
              /* Enter com valor preenchido equivale a Continuar. */
              if (e.key === 'Enter' && fluxo.valorCentavos > 0) {
                e.preventDefault()
                navigate('../nome')
              }
            }}
            autoFocus
          />
        </div>
      </div>

      <div className={s.blocoComuns}>
        {comuns.length || primeiraVez ? (
          <p className={s.rotuloComuns}>
            {comuns.length ? `${fluxo.copy.comunsEm} ` : `${fluxo.copy.primeiraVez} `}
            <span className={s.rotuloComunsCategoria}>
              {categoria?.nome}{comuns.length ? ':' : ''}
            </span>
          </p>
        ) : null}

        {comuns.length ? (
          <div className={s.listaComuns}>
            {comuns.map((c, i) => {
              const contato = Contatos.porId(c.contatoId)
              const doc = Contatos.documentoVisivel(contato)
              /* Contato so com documento (sem nome proprio): documento em
                 preto e o tipo em cinza, sem avatar (Figma 2279:94834). */
              const soDocumento = !contato.nome?.trim()
              return (
                <button key={i} type="button" className={s.linhaComum} onClick={() => aplicar(c)}>
                  <span className={s.linhaComumValor}>{formatar(c.valorCentavos)}</span>
                  <span className={s.linhaComumDireita}>
                    {soDocumento ? (
                      <>
                        <span className={s.linhaComumNome}>{doc}</span>
                        <span className={s.linhaComumDoc}>{ROTULO_TIPO[contato.tipoDocumento]}</span>
                      </>
                    ) : (
                      <>
                        <span className={s.avatar} style={{ background: corDoNome(contato.nome) }}>
                          {iniciais(contato.nome)[0]}
                        </span>
                        <span className={s.linhaComumNome}>{contato.nome}</span>
                        {doc ? <span className={s.linhaComumDoc}>{doc}</span> : null}
                      </>
                    )}
                    <CaretRight size={24} />
                  </span>
                </button>
              )
            })}
          </div>
        ) : null}
      </div>
    </FluxoLayout>
  )
}

export default TelaValor
