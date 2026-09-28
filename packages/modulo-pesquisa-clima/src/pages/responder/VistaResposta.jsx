import { RodapeFluxo } from '@squad/ui'
import { estiloDaCapa } from '../../lib/capa.js'
import s from './Responder.module.css'

/*
 * A moldura das três telas de quem responde (Figma 8073:7375, 8073:7467 e
 * 8082:8325): a capa de 200px no topo, a coluna de 808px com o cartão
 * cavalgando os últimos 60px dela, e a barra de baixo.
 *
 * Fica fora do app interno de propósito — sem sidebar, sem cabeçalho de
 * abas. Quem abre o link de resposta não é quem administra a pesquisa.
 *
 * A barra de progresso aparece nas três telas do questionário — ela era
 * opcional, por "Mostrar barra de progresso", e a opção saiu junto com o
 * modal de avançadas. As telas de beco (link errado, fora do ar) não passam
 * `progresso`, e aí ela não existe: não há questionário para medir. O espaço
 * dos 8px continua reservado, senão os botões subiriam e a barra deixaria de
 * ter os 80px do Figma.
 */
export default function VistaResposta({
  pesquisa,
  progresso = null,
  /* O que a barra significa em palavras — "Pergunta 2 de 5". A barra era só
     um retângulo que cresce: quem não a enxerga não tinha como saber onde
     está no questionário. */
  rotuloProgresso,
  rodape = null,
  children,
}) {
  return (
    <div className={s.tela}>
      <div className={s.capa} style={estiloDaCapa(pesquisa.capa)} />

      <div className={s.coluna}>{children}</div>

      {rodape}

      {/* Nas telas sem Voltar/Continuar a barra é só a trilha. */}
      {progresso !== null && rodape === null ? (
        <div
          className={s.trilhaSozinha}
          role="progressbar"
          aria-label="Progresso da pesquisa"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progresso * 100)}
          aria-valuetext={rotuloProgresso}
        >
          <div
            className={s.trilhaPreenchida}
            style={{ width: `calc(${progresso * 100}% + 4px)` }}
          />
        </div>
      ) : null}
    </div>
  )
}

/* A barra de baixo das perguntas é a mesma do fluxo de criação: mesma altura,
   mesma trilha de 8px cortada na borda, mesmos Voltar e Continuar. */
export function RodapeDaVista({
  progresso,
  rotuloProgresso,
  ultima,
  travado,
  onVoltar,
  onContinuar,
}) {
  return (
    <RodapeFluxo
      progresso={progresso}
      rotuloProgresso={rotuloProgresso}
      rotuloContinuar={ultima ? 'Finalizar' : 'Continuar'}
      continuarDesabilitado={travado}
      onVoltar={onVoltar}
      onContinuar={onContinuar}
    />
  )
}
