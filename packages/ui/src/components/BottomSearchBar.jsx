import { useRef, useState } from 'react'
import s from './BottomSearchBar.module.css'

/*
 * Barra de busca flutuante do rodape, com tres estados:
 *
 *  - padrao: lupa + placeholder + pilula do assistente
 *  - busca: foco no campo, filtra a lista enquanto digita, X fecha
 *  - assistente: fundo amarelo, avatar no lugar da lupa, microfone vira
 *    aviao de papel assim que ha texto. Digitar aqui nao filtra nada: e
 *    reservado para a pergunta ao assistente, que ainda nao existe.
 *
 * So a pilula entra no modo assistente, e ela so aparece no padrao - por isso
 * nao da para ir de "busca" direto para "assistente" sem passar por um campo
 * vazio primeiro.
 *
 * Tudo o que difere entre os modulos vem por prop:
 *
 *  - `icones`: os SVGs nao sao os mesmos arquivos nos dois modulos, e o clima
 *    usa componentes do Phosphor onde o Gestao de Pessoas usa <img>.
 *  - `placeholder`: o Gestao de Pessoas troca por aba; o clima tem um so.
 *  - `corPlaceholder`: usado so pelo Gestao de Pessoas (ver o .module.css).
 */
function BottomSearchBar({
  placeholder,
  placeholderAssistente = 'Pergunte ao Pipo...',
  rotuloPilula = 'Pergunte ao Pipo',
  avatarAssistente,
  icones = {},
  corPlaceholder,
  corPilulaFundo,
  corPilulaTexto,
  onBuscar,
}) {
  const [modo, setModo] = useState('padrao')
  const [valor, setValor] = useState('')
  const campoRef = useRef(null)

  const alterar = (e) => {
    const novoValor = e.target.value
    setValor(novoValor)
    if (modo === 'busca') onBuscar?.(novoValor)
  }

  const focar = () => setModo((atual) => (atual === 'padrao' ? 'busca' : atual))

  const ativarAssistente = () => {
    setModo('assistente')
    campoRef.current?.focus()
  }

  const limparBusca = () => {
    setValor('')
    setModo('padrao')
    onBuscar?.('')
    campoRef.current?.blur()
  }

  const limparAssistente = () => {
    setValor('')
    setModo('padrao')
    campoRef.current?.blur()
  }

  const textoCampo = modo === 'assistente' ? placeholderAssistente : placeholder

  return (
    <div
      className={`${s.barra} ${modo === 'assistente' ? s.barraPipo : ''}`}
      style={{
        ...(corPlaceholder ? { '--busca-cor-placeholder': corPlaceholder } : null),
        ...(corPilulaFundo ? { '--busca-pilula-fundo': corPilulaFundo } : null),
        ...(corPilulaTexto ? { '--busca-pilula-texto': corPilulaTexto } : null),
      }}
    >
      <div className={s.molduraIcone}>
        {modo === 'assistente' ? (
          <img className={s.avatarPipo} src={avatarAssistente} alt="" />
        ) : (
          icones.lupa
        )}
      </div>

      <input
        ref={campoRef}
        type="text"
        className={s.campo}
        placeholder={textoCampo}
        value={valor}
        onChange={alterar}
        onFocus={focar}
        aria-label={textoCampo}
      />

      {modo === 'padrao' ? (
        <button type="button" className={s.pilulaPipo} onClick={ativarAssistente}>
          {rotuloPilula}
        </button>
      ) : null}

      {modo === 'busca' ? (
        <button
          type="button"
          className={s.fechar}
          aria-label="Fechar busca"
          onClick={limparBusca}
        >
          {icones.fecharBusca}
        </button>
      ) : null}

      {modo === 'assistente' ? (
        <>
          <button
            type="button"
            className={`${s.acaoPipo} ${s.acaoPipoTransparente}`}
            aria-label={valor ? 'Enviar' : 'Gravar áudio'}
          >
            {valor ? icones.enviar : icones.microfone}
          </button>
          <button
            type="button"
            className={s.acaoPipo}
            aria-label="Fechar Pipo"
            onClick={limparAssistente}
          >
            {icones.fecharAssistente}
          </button>
        </>
      ) : null}
    </div>
  )
}

export default BottomSearchBar
