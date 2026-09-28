import { useMemo, useState } from 'react'
import { CaretLeft, CaretRight, X } from '@phosphor-icons/react'
import { PainelLateral } from '@squad/ui'
import { paraData, iso, diasNoMes, hojeIso, MESES_NOMES } from '../lib/datas.js'
import s from './Calendario.module.css'

const SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

/*
 * Calendario do passo 4 (Figma 2279:96855). Abre como painel lateral, nao como
 * popover nem modal centralizado.
 *
 * `diasComTransacao` e um Set de 'YYYY-MM-DD': os dias que ja tem lancamento
 * ganham o ponto cinza embaixo do numero ("Scheduling Indicator" no Figma).
 *
 * Dias anteriores a hoje ficam desabilitados - nao faz sentido agendar para
 * tras, e o Figma ja os desenha em #b2b9b9.
 */
function Calendario({
  aberto,
  valor, diasComTransacao, titulo, semCasca = false, tamanhoSeta = 24, onEscolher, onFechar }) {
  const hoje = hojeIso()
  const [escolhido, setEscolhido] = useState(valor)
  const inicial = paraData(valor || hoje)
  const [ano, setAno] = useState(inicial.getFullYear())
  const [mes, setMes] = useState(inicial.getMonth())

  /*
   * Semanas completas. O Figma (2279:96912 no fluxo, 2279:108290 no popover)
   * preenche as bordas com os dias do mes anterior e do seguinte em #b2b9b9,
   * em vez de deixar celulas vazias - a grade fica retangular.
   *
   * Completa ate fechar a ultima semana, nao ate 42 celulas fixas: marco de
   * 2026 cabe em 5 linhas e e assim que o Figma desenha.
   */
  const celulas = useMemo(() => {
    const primeiro = new Date(ano, mes, 1).getDay()
    const total = diasNoMes(ano, mes)
    const anteriores = diasNoMes(ano, mes - 1)
    const lista = []
    for (let i = primeiro; i > 0; i -= 1) {
      lista.push({ dia: anteriores - i + 1, mes: -1 })
    }
    for (let d = 1; d <= total; d += 1) lista.push({ dia: d, mes: 0 })
    let d = 1
    while (lista.length % 7 !== 0) {
      lista.push({ dia: d, mes: 1 })
      d += 1
    }
    return lista
  }, [ano, mes])

  const andar = (n) => {
    const d = new Date(ano, mes + n, 1)
    setAno(d.getFullYear())
    setMes(d.getMonth())
  }

  const cartao = (
      <div className={s.cartao}>
        <div className={s.cabecalho}>
          <button type="button" className={s.seta} aria-label="Mês anterior" onClick={() => andar(-1)}>
            <CaretLeft size={tamanhoSeta} color="var(--cor-texto-secundario)" />
          </button>
          <span className={s.mes}>{MESES_NOMES[mes]}, {ano}</span>
          <button type="button" className={s.seta} aria-label="Próximo mês" onClick={() => andar(1)}>
            <CaretRight size={tamanhoSeta} color="var(--cor-texto-secundario)" />
          </button>
        </div>

        <div className={s.grade} role="grid">
          {SEMANA.map((d, i) => (
            <span key={i} className={s.diaSemana}>{d}</span>
          ))}
          {celulas.map((celula, i) => {
            const data = iso(new Date(ano, mes + celula.mes, celula.dia))
            const passado = data < hoje
            const foraDoMes = celula.mes !== 0
            return (
              <button
                key={`${data}-${i}`}
                type="button"
                className={`${s.celula} ${s.dia} ${foraDoMes ? s.diaForaDoMes : ''} ${data === escolhido ? s.diaAtivo : ''}`}
                disabled={passado}
                aria-current={data === escolhido ? 'date' : undefined}
                onClick={() => {
                  setEscolhido(data)
                  if (celula.mes !== 0) andar(celula.mes)
                  /* Sem a casca nao ha rodape com Salvar: a escolha aplica
                     direto, como o popover dos Filtros espera. */
                  if (semCasca) onEscolher(data)
                }}
              >
                <span className={s.numero}>{celula.dia}</span>
                {diasComTransacao?.has(data) ? <span className={s.ponto} /> : null}
              </button>
            )
          })}
        </div>
      </div>
  )

  if (semCasca) return cartao

  return (
    <PainelLateral
      aberto={aberto}
      titulo={titulo}
      iconeFechar={<X size={24} color="var(--cor-texto-secundario)" />}
      onFechar={onFechar}
      rotuloConfirmar="Salvar"
      onConfirmar={() => onEscolher(escolhido)}
      prenderFoco
    >
      {cartao}
    </PainelLateral>
  )
}

export default Calendario
