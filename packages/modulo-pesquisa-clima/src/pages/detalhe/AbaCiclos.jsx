import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Rosca from '../../components/detalhe/Rosca.jsx'
import { historicoDe, ordenar, COLUNAS } from '../../lib/historico.js'
import { fraseDeAtividade } from '../../lib/alteracoes.js'
import s from './AbaCiclos.module.css'

import caretRight from '../../assets/icons/CaretRight.svg'
import arrowsDownUp from '../../assets/icons/ArrowsDownUp.svg'
import warning from '../../assets/icons/Warning.svg'
import { MODULE_BASE } from '../../routes.js'

/*
 * Aba Ciclos (Figma 8032:1828).
 *
 * Uma linha por ciclo encerrado — o que está rodando não entra, porque a
 * lista é do que já fechou. Os dados vêm de lib/historico.js e são simulados,
 * menos a contagem e a numeração dos ciclos, que saem da pesquisa.
 *
 * O arquivo desenha o mesmo ArrowsDownUp neutro nas quatro colunas, sem
 * estado de ativa nem de direção. A coluna em uso fica com o rótulo em preto
 * em vez de cinza — é a distinção que dá para fazer sem inventar um ícone que
 * o arquivo não tem.
 *
 * A seta da direita substitui o menu de três pontos do arquivo, a pedido: ela
 * só diz que a linha abre. É o CaretRight do projeto — não há uma seta reta
 * em src/assets/icons.
 */
export default function AbaCiclos({ pesquisa }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [ordem, setOrdem] = useState({ coluna: 'numero', crescente: false })

  const ciclos = ordenar(historicoDe(pesquisa), ordem.coluna, ordem.crescente)

  /* Clicar na mesma coluna inverte; em outra, começa decrescente — que é como
     a lista chega, do ciclo mais novo para o mais velho. */
  const alternar = (coluna) =>
    setOrdem((atual) =>
      atual.coluna === coluna
        ? { coluna, crescente: !atual.crescente }
        : { coluna, crescente: false },
    )

  const abrir = (ciclo) => navigate(`${MODULE_BASE}/pesquisas/${id}/ciclos/${ciclo.numero}`)

  if (!ciclos.length) {
    return (
      <div className={s.vazio}>
        <p className={s.textoVazio}>
          Nenhum ciclo encerrado ainda. Quando o ciclo atual fechar, ele
          aparece aqui.
        </p>
      </div>
    )
  }

  return (
    <div className={s.tela}>
      {/* O cabeçalho sangra até a borda; as colunas dele alinham com as
          células porque o recuo acompanha o da coluna das linhas mais os
          16px de padding do card. */}
      <div className={s.cabecalho} role="row">
        {COLUNAS.map((coluna) => {
          const ativa = ordem.coluna === coluna.id
          const conteudo = (
            <>
              <span className={s.rotuloColuna}>{coluna.nome}</span>
              {coluna.ordenavel ? (
                <img
                  className={s.icone16}
                  src={arrowsDownUp}
                  alt=""
                  width={16}
                  height={16}
                />
              ) : null}
            </>
          )
          return coluna.ordenavel ? (
            <button
              type="button"
              key={coluna.id}
              className={`${s.coluna} ${s[coluna.id]} ${ativa ? s.colunaAtiva : ''}`}
              aria-sort={
                ativa ? (ordem.crescente ? 'ascending' : 'descending') : 'none'
              }
              onClick={() => alternar(coluna.id)}
            >
              {conteudo}
            </button>
          ) : (
            <span key={coluna.id} className={`${s.coluna} ${s[coluna.id]}`}>
              {conteudo}
            </span>
          )
        })}
        <span className={s.vaoDaSeta} />
      </div>

      <div className={s.linhas}>
        {ciclos.map((ciclo) => (
          <div
            key={ciclo.id}
            className={s.linha}
            role="button"
            tabIndex={0}
            aria-label={`Abrir ciclo ${ciclo.numero}`}
            onClick={() => abrir(ciclo)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' && e.key !== ' ') return
              e.preventDefault()
              abrir(ciclo)
            }}
          >
            <span className={`${s.celula} ${s.numero}`}>Ciclo {ciclo.numero}</span>
            <span className={`${s.celula} ${s.inicio}`}>{ciclo.envio}</span>

            <span className={`${s.celula} ${s.fim}`}>
              {ciclo.encerrado}
              {ciclo.cedo ? (
                /* O balão abre no hover; o title nativo cobre o teclado e o
                   leitor de tela, que não passam por aqui. */
                <span
                  className={s.aviso}
                  title="Encerrado antes do prazo: a pesquisa foi pausada durante o ciclo."
                >
                  <img
                    className={s.icone16}
                    src={warning}
                    alt="Encerrado antes do prazo"
                    width={16}
                    height={16}
                  />
                  <span className={s.balao} role="tooltip">
                    Encerrado antes do prazo: a pesquisa foi pausada durante o
                    ciclo.
                  </span>
                </span>
              ) : null}
            </span>

            <span className={`${s.celula} ${s.taxa}`}>
              <Rosca taxa={ciclo.taxa} tamanho={28} traco={6} rotulo={false} />
              <span className={s.textoTaxa}>{ciclo.taxa}% responderam</span>
            </span>

            <span className={`${s.celula} ${s.atividade}`}>
              {ciclo.alteracoes ? (
                <>
                  <span className={s.ponto} />
                  <span className={s.textoAtividade}>
                    {fraseDeAtividade(ciclo.alteracoes)}
                  </span>
                </>
              ) : null}
            </span>

            <span className={s.abrir}>
              <img src={caretRight} alt="" width={24} height={24} />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
