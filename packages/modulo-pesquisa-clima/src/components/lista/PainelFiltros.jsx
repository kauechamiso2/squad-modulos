import { useEffect, useRef, useState } from 'react'
import { X, CalendarBlank, Percent } from '@phosphor-icons/react'
import s from './PainelFiltros.module.css'
import closeIcon from '../../assets/icons/Close.svg'
import calendarBlankIcon from '../../assets/icons/CalendarBlank.svg'
import { PilulaFiltro } from '@squad/ui'

const MES_CURTO = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

/* "2026-09-28" -> "28 Set". Lido campo a campo, e não com `new Date(texto)`:
   o construtor entende a data como UTC, e pedir dia/mês de volta em fuso
   negativo pode devolver o dia anterior. Exportada: o resumo de filtros na
   Home usa o mesmo formato para as datas de Período. */
export function formatarDataCurta(isoData) {
  const [ano, mes, dia] = isoData.split('-').map(Number)
  return `${dia} ${MES_CURTO[mes - 1]}`
}

const ATIVIDADE_OPCOES = ['Rodando', 'Pausada', 'Encerrada']

/* A casca da pilula virou @squad/ui/PilulaFiltro quando o Fluxo de Caixa
   passou a usar a mesma; aqui fica so o icone local. */
function Pilula({ selecionado, onClick, children }) {
  return (
    <PilulaFiltro
      selecionada={selecionado}
      iconeLimpar={<X size={20} color="#ffffff" />}
      onClick={onClick}
    >
      {children}
    </PilulaFiltro>
  )
}

function CampoData({ valor, onChange }) {
  const campoRef = useRef(null)
  const abrir = () => campoRef.current?.showPicker?.() ?? campoRef.current?.focus()

  return (
    <div className={s.pilulaData} onClick={abrir}>
      <img src={calendarBlankIcon} width={20} height={20} alt="" />
      <span className={valor ? s.textoData : `${s.textoData} ${s.textoDataVazio}`}>
        {valor ? formatarDataCurta(valor) : 'Selecionar data'}
      </span>
      <input
        ref={campoRef}
        type="date"
        className={s.campoDataNativo}
        value={valor ?? ''}
        onChange={(evento) => {
          if (evento.target.value) onChange(evento.target.value)
        }}
      />
    </div>
  )
}

function CampoNumero({ valor, onChange, placeholder, icone }) {
  const aoMudar = (evento) => {
    const cru = evento.target.value
    onChange(cru === '' ? null : Number(cru))
  }

  if (!icone) {
    return (
      <input
        type="number"
        inputMode="numeric"
        min={0}
        className={s.pilulaNumero}
        placeholder={placeholder}
        value={valor ?? ''}
        onChange={aoMudar}
      />
    )
  }

  return (
    <div className={s.pilulaNumeroComIcone}>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        className={s.campoNumeroInterno}
        placeholder={placeholder}
        value={valor ?? ''}
        onChange={aoMudar}
      />
      {icone}
    </div>
  )
}

function draftVazio() {
  return {
    atividade: new Set(),
    periodo: { start: null, end: null },
    taxa: { min: null, max: null },
    ciclos: { min: null, max: null },
  }
}

function clonarFiltros(filtros) {
  return {
    atividade: new Set(filtros.atividade),
    periodo: { ...filtros.periodo },
    taxa: { ...filtros.taxa },
    ciclos: { ...filtros.ciclos },
  }
}

/*
 * Painel "Filtros" (porte do FiltrosPanel do Gestão de Pessoas) — mesma
 * casca deslizante, com as quatro seções que não moram no cabeçalho da
 * tabela: Atividade (agrupamento simplificado dos seis status reais),
 * Período (data do evento de cada pesquisa), Taxa de resposta e Número de
 * ciclos.
 *
 * `filtros`/`onSalvar` cobrem só essas quatro chaves — Público, Tipo e
 * Status continuam só nos cabeçalhos de coluna, no mesmo objeto de filtros
 * lá fora, mas fora do que este painel mexe.
 */
export default function PainelFiltros({ aberto, onFechar, filtros, onSalvar }) {
  const [rascunho, setRascunho] = useState(draftVazio)

  useEffect(() => {
    if (aberto) setRascunho(clonarFiltros(filtros))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto])

  const alternarAtividade = (valor) =>
    setRascunho((atual) => {
      const proximo = new Set(atual.atividade)
      if (proximo.has(valor)) proximo.delete(valor)
      else proximo.add(valor)
      return { ...atual, atividade: proximo }
    })

  const definirPeriodo = (qual, valor) =>
    setRascunho((atual) => ({ ...atual, periodo: { ...atual.periodo, [qual]: valor } }))

  const definirTaxa = (qual, valor) =>
    setRascunho((atual) => ({ ...atual, taxa: { ...atual.taxa, [qual]: valor } }))

  const definirCiclos = (qual, valor) =>
    setRascunho((atual) => ({ ...atual, ciclos: { ...atual.ciclos, [qual]: valor } }))

  const cancelar = () => onFechar()

  const salvar = () => {
    onSalvar(rascunho)
    onFechar()
  }

  return (
    <>
      <div
        className={aberto ? `${s.sobreposicao} ${s.sobreposicaoAberta}` : s.sobreposicao}
        onClick={cancelar}
      />
      <div className={aberto ? `${s.painel} ${s.painelAberto}` : s.painel}>
        <div className={s.cabecalho}>
          <span className={s.titulo}>Filtros</span>
          <button
            type="button"
            className={s.botaoFechar}
            aria-label="Fechar filtros"
            onClick={cancelar}
          >
            <img src={closeIcon} width={24} height={24} alt="" />
          </button>
        </div>

        <div className={s.rolagem}>
          <section className={s.secao}>
            <span className={s.rotulo}>Atividade:</span>
            <div className={s.pilulas}>
              {ATIVIDADE_OPCOES.map((opcao) => (
                <Pilula
                  key={opcao}
                  selecionado={rascunho.atividade.has(opcao)}
                  onClick={() => alternarAtividade(opcao)}
                >
                  {opcao}
                </Pilula>
              ))}
            </div>
          </section>

          <section className={s.secao}>
            <span className={s.rotulo}>Período:</span>
            <div className={s.linhaIntervalo}>
              <CampoData
                valor={rascunho.periodo.start}
                onChange={(valor) => definirPeriodo('start', valor)}
              />
              <span className={s.conector}>a</span>
              <CampoData
                valor={rascunho.periodo.end}
                onChange={(valor) => definirPeriodo('end', valor)}
              />
            </div>
          </section>

          <section className={s.secao}>
            <span className={s.rotulo}>Taxa de resposta:</span>
            <div className={s.linhaIntervalo}>
              <CampoNumero
                valor={rascunho.taxa.min}
                onChange={(valor) => definirTaxa('min', valor)}
                placeholder="Mínimo"
              />
              <span className={s.conector}>a</span>
              <CampoNumero
                valor={rascunho.taxa.max}
                onChange={(valor) => definirTaxa('max', valor)}
                placeholder="Máximo"
                icone={<Percent size={20} color="var(--cor-texto-secundario)" />}
              />
            </div>
          </section>

          <section className={`${s.secao} ${s.secaoUltima}`}>
            <span className={s.rotulo}>Numero de ciclos:</span>
            <div className={s.linhaIntervalo}>
              <CampoNumero
                valor={rascunho.ciclos.min}
                onChange={(valor) => definirCiclos('min', valor)}
                placeholder="Mínimo"
              />
              <span className={s.conector}>a</span>
              <CampoNumero
                valor={rascunho.ciclos.max}
                onChange={(valor) => definirCiclos('max', valor)}
                placeholder="Máximo"
              />
            </div>
          </section>
        </div>

        <div className={s.rodape}>
          <button type="button" className={s.botaoCancelar} onClick={cancelar}>
            Cancelar
          </button>
          <button type="button" className={s.botaoSalvar} onClick={salvar}>
            Salvar Filtros
          </button>
        </div>
      </div>
    </>
  )
}
