import { useEffect, useRef, useState } from 'react'
import IconButton from './IconButton.jsx'
import useModal from './fluxo/useModal.js'
import s from './PainelLateral.module.css'

/*
 * Casca do painel lateral colado a direita: veu, painel deslizante, cabecalho
 * com X, area rolavel e rodape fixo com Cancelar + acao principal.
 *
 * `iconeFechar` aceita as duas formas que os consumidores tem: uma URL de SVG
 * (o Gestao de Pessoas, que importa .svg locais) ou um elemento React (o Fluxo
 * de Caixa, que usa @phosphor-icons/react). O botao fica igual nos dois.
 *
 * `prenderFoco` liga o useModal (Esc, foco preso, clique fora). Fica desligado
 * por padrao porque o Gestao de Pessoas nunca teve esse comportamento e ligar
 * por padrao moveria o foco dele - quem quer, pede.
 */
function PainelLateral({
  aberto = true,
  titulo,
  iconeFechar,
  onFechar,
  rotuloCancelar = 'Cancelar',
  rotuloConfirmar,
  onConfirmar,
  confirmarDesabilitado = false,
  rodape,
  /*
   * Cabecalho alternativo: o painel de detalhe (Gestao de Pessoas e o resumo
   * de transacao do Fluxo de Caixa) poe o X a esquerda e uma acao a direita,
   * em vez do titulo a esquerda e o X a direita. Quem passa `acaoEsquerda`
   * assume o cabecalho inteiro e o `iconeFechar` nao e usado.
   */
  acaoEsquerda,
  acaoDireita,
  /* Sem rodape: o painel de detalhe nao tem. `false` some com a barra. */
  comRodape = true,
  /*
   * Classes extras no painel e no veu. O detalhe do colaborador do Gestao de
   * Pessoas alterna entre painel e tela cheia animando largura, posicao e
   * padding no MESMO elemento; a variante de tela cheia vive na CSS dele e
   * entra por aqui, para o morph continuar acontecendo num elemento so.
   */
  className = '',
  classNameVeu = '',
  prenderFoco = false,
  children,
}) {
  /*
   * Entrada e saida animadas mesmo quando o painel monta e desmonta.
   *
   * O Gestao de Pessoas mantem o painel montado e so troca a classe, entao a
   * transicao roda sozinha. O Fluxo de Caixa monta o painel ja aberto e o
   * desmonta ao fechar - sem os dois estados no DOM, o navegador nao tem de
   * onde interpolar e nada anima.
   *
   * `entrou` resolve a entrada: o primeiro render sai sem as classes de aberto
   * e elas entram no frame seguinte. Dois requestAnimationFrame porque um so
   * ainda cai dentro do mesmo frame de pintura em parte dos navegadores.
   *
   * `saindo` resolve a saida: ao fechar tiramos as classes e seguramos o painel
   * no DOM ate o transitionend - com um timeout de seguranca, porque o evento
   * nao dispara se a transicao for cancelada ou se nao houver nenhuma.
   */
  const [entrou, setEntrou] = useState(false)
  const [presente, setPresente] = useState(aberto)
  const painelRef = useRef(null)

  useEffect(() => {
    if (aberto) {
      setPresente(true)
      let segundo
      const primeiro = requestAnimationFrame(() => {
        segundo = requestAnimationFrame(() => setEntrou(true))
      })
      return () => {
        cancelAnimationFrame(primeiro)
        if (segundo) cancelAnimationFrame(segundo)
      }
    }

    setEntrou(false)
    if (!presente) return undefined

    const el = painelRef.current
    const duracao = el
      ? (parseFloat(getComputedStyle(el).transitionDuration) || 0) * 1000
      : 0
    let relogio
    const terminar = () => {
      clearTimeout(relogio)
      setPresente(false)
    }
    el?.addEventListener('transitionend', terminar, { once: true })
    relogio = setTimeout(terminar, duracao + 50)
    return () => {
      clearTimeout(relogio)
      el?.removeEventListener('transitionend', terminar)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto])

  /*
   * O useModal so liga quando o painel esta de fato no DOM: no primeiro render
   * de abertura `presente` ainda e false e o componente devolve null, entao o
   * ref do painel nao existe e o gancho nao teria elemento para prender.
   */
  const caixa = useModal(prenderFoco && presente && aberto ? onFechar : undefined)

  if (!presente) return null

  const mostrando = aberto && entrou

  return (
    <>
      <div
        className={`${s.veu} ${mostrando ? s.veuAberto : ''} ${classNameVeu}`.trim()}
        onClick={onFechar}
      />
      <div
        className={`${s.painel} ${mostrando ? s.painelAberto : ''} ${className}`.trim()}
        ref={(el) => {
          /* Sem valor de retorno: o React 19 trata o retorno de um ref
             callback como funcao de limpeza. */
          painelRef.current = el
          if (prenderFoco) caixa.current = el
        }}
      >
        <div className={s.cabecalho}>
          {acaoEsquerda ? (
            <>
              {acaoEsquerda}
              <span className={`${s.titulo} ${s.tituloCentral}`}>{titulo}</span>
              {acaoDireita}
            </>
          ) : (
            <>
          <span className={s.titulo}>{titulo}</span>
          {typeof iconeFechar === 'string' ? (
            <IconButton icon={iconeFechar} alt="Fechar" size={40} iconSize={24} onClick={onFechar} />
          ) : (
            <button type="button" className={s.botaoFechar} aria-label="Fechar" onClick={onFechar}>
              {iconeFechar}
            </button>
          )}
            </>
          )}
        </div>

        <div className={s.rolagem}>{children}</div>

        {comRodape ? (
        <div className={s.rodape}>
          {rodape ?? (
            <>
              <button type="button" className={s.botaoTexto} onClick={onFechar}>
                {rotuloCancelar}
              </button>
              {rotuloConfirmar ? (
                <button
                  type="button"
                  className={s.botaoPrincipal}
                  disabled={confirmarDesabilitado}
                  onClick={onConfirmar}
                >
                  {rotuloConfirmar}
                </button>
              ) : null}
            </>
          )}
        </div>
        ) : null}
      </div>
    </>
  )
}

export default PainelLateral
