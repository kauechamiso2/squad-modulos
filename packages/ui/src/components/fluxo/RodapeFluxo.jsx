import s from './RodapeFluxo.module.css'
import Botao from './Botao.jsx'

/*
 * Barra de baixo do fluxo: Voltar, a trilha de progresso e Continuar.
 * Compartilhada por todas as telas do fluxo, inclusive a revisão, que tem
 * moldura própria e por isso não usa o FluxoLayout inteiro.
 *
 * `progresso` é a fração do passo atual — quem chama decide, porque o caminho
 * em branco pula dois passos e salta na trilha.
 */
export default function RodapeFluxo({
  progresso,
  rotuloProgresso,
  mostrarContinuar = true,
  rotuloContinuar = 'Continuar',
  mostrarPular = false,
  continuarDesabilitado = false,
  onVoltar,
  onContinuar,
  onPular,
}) {
  return (
    <div className={s.rodape}>
      <div
        className={s.progresso}
        role="progressbar"
        aria-label="Progresso"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progresso * 100)}
        aria-valuetext={rotuloProgresso}
      >
        <div
          className={s.progressoPreenchido}
          style={{ width: `calc(${progresso * 100}% + 4px)` }}
        />
      </div>
      <div className={s.acoes}>
        <Botao onClick={onVoltar}>Voltar</Botao>
        <div className={s.acoesDireita}>
          {mostrarPular ? <Botao onClick={onPular}>Pular</Botao> : null}
          {mostrarContinuar ? (
            <Botao
              variante="marca"
              desabilitado={continuarDesabilitado}
              onClick={onContinuar}
            >
              {rotuloContinuar}
            </Botao>
          ) : null}
        </div>
      </div>
    </div>
  )
}
