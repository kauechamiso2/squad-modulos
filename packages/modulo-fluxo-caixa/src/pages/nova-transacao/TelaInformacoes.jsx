import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarBlank, CaretDown, CaretUp, Plus, Check } from '@phosphor-icons/react'
import { FluxoLayout } from '@squad/ui'
import { useFluxo } from './estado.jsx'
import PainelResumo from './PainelResumo.jsx'
import PainelObservacao from '../../components/PainelObservacao.jsx'
import Calendario from '../../components/Calendario.jsx'
import { REPETICOES } from '../../lib/transacoes.js'
import { hojeIso, formatarCurta, diaDoMes } from '../../lib/datas.js'
import s from './Passos.module.css'

/*
 * Passo 4 - informacoes (Figma 2279:95036; data 96596/96748; repeticao 95228).
 *
 * As tres primeiras linhas nao tem borda no Figma; so a de Observacao tem.
 */
function TelaInformacoes() {
  const navigate = useNavigate()
  const fluxo = useFluxo()
  const [calendario, setCalendario] = useState(false)
  const [painelObs, setPainelObs] = useState(false)
  const [resumo, setResumo] = useState(false)
  const [avancadasAbertas, setAvancadasAbertas] = useState(true)

  const ehHoje = fluxo.data === hojeIso()

  /* Os dias que ja tem lancamento ganham o ponto cinza no calendario. */
  const diasComTransacao = useMemo(
    () => new Set(fluxo.transacoesIniciais.map((t) => t.data)),
    [fluxo.transacoesIniciais],
  )

  const dia = diaDoMes(fluxo.data)

  return (
    <>
      <FluxoLayout
        titulo={fluxo.copy.tituloFluxo}
        fixarBordas
        progresso={1}
        onFechar={fluxo.sair}
        onVoltar={() => navigate('../nome')}
        onContinuar={() => setResumo(true)}
      >
        <div className={s.bloco}>
          <h1 className={s.tituloPasso}>{fluxo.copy.tituloInformacoes}</h1>

          <div className={s.listaInfo}>
            <div className={s.linhaInfo}>
              <span className={s.rotuloInfo}>Status</span>
              <span className={s.segmentado}>
                {fluxo.statusVisiveis.map((st) => {
                  const concluido = st.id === fluxo.copy.status[0].id
                  return (
                    <button
                      key={st.id}
                      type="button"
                      className={`${s.segmento} ${fluxo.status === st.id ? s.segmentoAtivo : ''}`}
                      disabled={fluxo.dataFutura && concluido}
                      onClick={() => fluxo.setStatus(st.id)}
                    >
                      {st.rotulo}
                    </button>
                  )
                })}
              </span>
            </div>

            <div className={s.linhaInfo}>
              <span className={s.rotuloInfo}>{fluxo.copy.rotuloData}</span>
              <span className={s.grupoPilulas}>
                {/*
                  Padrao (2279:95036): "Hoje" e a pilula preta de h42 e ao lado
                  fica o botao do calendario, tambem h42.
                  Com data escolhida (2279:96596): "Hoje" vira branca de h35 e a
                  pilula preta passa a ser a da data.
                */}
                {ehHoje ? (
                  <>
                    <span className={s.pilulaData}>Hoje</span>
                    <button
                      type="button"
                      className={s.botaoCalendario}
                      aria-label="Escolher data"
                      onClick={() => setCalendario(true)}
                    >
                      <CalendarBlank size={24} color="var(--cor-texto-secundario)" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className={s.pilula}
                      onClick={() => fluxo.escolherData(hojeIso())}
                    >
                      Hoje
                    </button>
                    <button
                      type="button"
                      className={`${s.pilula} ${s.pilulaAtiva}`}
                      onClick={() => setCalendario(true)}
                    >
                      {formatarCurta(fluxo.data)}
                    </button>
                  </>
                )}
              </span>
            </div>

            <div className={s.linhaInfo}>
              <span className={s.rotuloInfo}>Repete</span>
              <span className={s.grupoPilulas}>
                {REPETICOES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={`${s.pilula} ${fluxo.repete === r.id ? s.pilulaAtiva : ''}`}
                    onClick={() => fluxo.setRepete(r.id)}
                  >
                    {r.rotulo}
                  </button>
                ))}
              </span>
            </div>

            {fluxo.repete === 'mensal' ? (
              <div className={s.avancadas}>
                <button
                  type="button"
                  className={s.avancadasCabecalho}
                  aria-expanded={avancadasAbertas}
                  onClick={() => setAvancadasAbertas((v) => !v)}
                >
                  <span>Configurações avançadas</span>
                  {avancadasAbertas
                    ? <CaretUp size={24} color="var(--cor-texto-secundario)" />
                    : <CaretDown size={24} color="var(--cor-texto-secundario)" />}
                </button>
                {avancadasAbertas ? (
                  <div className={s.avancadasOpcoes} role="radiogroup" aria-label="Regra do mensal">
                    {[
                      { id: 'dia_fixo', rotulo: `Sempre no dia ${dia} de todo mês` },
                      { id: 'dia_util', rotulo: `Sempre no dia ${dia}, ou dia útil mais próximo` },
                    ].map((op) => (
                      <button
                        key={op.id}
                        type="button"
                        role="radio"
                        aria-checked={fluxo.regraMensal === op.id}
                        className={s.opcaoRadio}
                        onClick={() => fluxo.setRegraMensal(op.id)}
                      >
                        <span className={`${s.radio} ${fluxo.regraMensal === op.id ? s.radioAtivo : ''}`} />
                        <span>{op.rotulo}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <button
              type="button"
              className={`${s.observacao} ${fluxo.observacao.trim() ? s.observacaoPreenchida : ''}`}
              onClick={() => setPainelObs(true)}
            >
              <span className={s.observacaoTextos}>
                <span className={`${s.observacaoRotulo} ${fluxo.observacao.trim() ? s.observacaoRotuloPreenchido : ''}`}>
                  Observação
                </span>
                {fluxo.observacao.trim() ? (
                  <span className={s.observacaoTexto}>{fluxo.observacao}</span>
                ) : null}
              </span>
              {fluxo.observacao.trim()
                ? <Check size={24} color="var(--fc-valor-positivo)" />
                : <Plus size={24} color="var(--cor-texto-secundario)" />}
            </button>
          </div>
        </div>
      </FluxoLayout>

      <Calendario
          aberto={calendario}
          valor={fluxo.data}
          titulo={fluxo.copy.rotuloData}
          diasComTransacao={diasComTransacao}
          onEscolher={(d) => { fluxo.escolherData(d); setCalendario(false) }}
          onFechar={() => setCalendario(false)}
        />

      <PainelObservacao
          aberto={painelObs}
          valorInicial={fluxo.observacao}
          onSalvar={(t) => { fluxo.setObservacao(t); setPainelObs(false) }}
          onFechar={() => setPainelObs(false)}
        />

      <PainelResumo aberto={resumo} onCancelar={() => setResumo(false)} onFinalizar={fluxo.finalizar} />
    </>
  )
}

export default TelaInformacoes
