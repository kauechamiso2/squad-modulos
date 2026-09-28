import { useEffect, useRef, useState } from 'react'
import s from './CampoInline.module.css'

/*
 * Valor que vira campo ao ser clicado. Nasceu no detalhe do colaborador do
 * Gestao de Pessoas (`InlineEditField`) e o resumo de transacao do Fluxo de
 * Caixa usa o mesmo: fundo cinza, raio 4, padding 10 e um X de 16px para
 * limpar. Enter salva, Esc cancela, clicar fora salva.
 *
 * `--campo-inline-peso`  400 no GP · 500 no Fluxo de Caixa
 */
function CampoInline({
  value,
  displayValue,
  disabled,
  onSave,
  validate,
  formatForInput,
  parseInput,
  iconeLimpar,
  multilinha = false,
  placeholder,
  /*
   * Clicar fora: o Gestao de Pessoas descarta (era o comportamento dele) e o
   * Fluxo de Caixa salva (Figma 2279:102890). Default = GP.
   */
  salvarAoSair = false,
  /* Ja nasce em edicao: e o caso do campo de nota, que substitui a acao
     "Adicionar nota" e nao tem estado de leitura proprio. */
  iniciarEditando = false,
  onCancelar,
}) {
  const [editing, setEditing] = useState(iniciarEditando)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef(null)
  const savingRef = useRef(false)

  useEffect(() => {
    if (editing) {
      const el = inputRef.current
      el?.focus()
      /* Cursor no fim, nao selecionando tudo: quem clica quer emendar. */
      const fim = String(el?.value ?? '').length
      el?.setSelectionRange?.(fim, fim)
    }
  }, [editing])

  const startEdit = () => {
    if (disabled) return
    setDraft(value)
    setEditing(true)
  }

  const cancel = () => {
    setEditing(false)
    setDraft(value)
    onCancelar?.()
  }

  const save = () => {
    if (validate && !validate(draft)) { cancel(); return }
    savingRef.current = true
    onSave(draft)
    setEditing(false)
  }

  const handleBlur = () => {
    /* Enter dispara save() e logo um blur, quando o input desmonta - esse blur
       nao pode cancelar e desfazer o que acabou de ser salvo. */
    if (savingRef.current) {
      savingRef.current = false
      return
    }
    if (salvarAoSair) save()
    else cancel()
  }

  if (!editing) {
    return (
      <button type="button" className={s.valor} onClick={startEdit} disabled={disabled}>
        {displayValue}
      </button>
    )
  }

  const Campo = multilinha ? 'textarea' : 'input'

  return (
    <div className={s.campo} data-escape-local="">
      <Campo
        ref={inputRef}
        {...(multilinha ? { rows: 1 } : { type: 'text', inputMode: parseInput ? 'numeric' : 'text' })}
        className={`${s.entrada} ${multilinha ? s.entradaMultilinha : ''}`}
        placeholder={placeholder}
        value={formatForInput ? formatForInput(draft) : draft}
        onChange={(event) =>
          setDraft(parseInput ? parseInput(event.target.value) : event.target.value)
        }
        onKeyDown={(event) => {
          /* Multilinha: Enter salva e Shift+Enter quebra a linha. */
          if (event.key === 'Enter' && !(multilinha && event.shiftKey)) {
            event.preventDefault()
            save()
          }
          if (event.key === 'Escape') {
            /* O Esc para aqui: sem isto ele subiria ate o painel que contem o
               campo e fecharia os dois de uma vez. */
            event.stopPropagation()
            cancel()
          }
        }}
        onBlur={handleBlur}
      />
      <button
        type="button"
        className={s.limpar}
        aria-label="Limpar"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setDraft('')}
      >
        {iconeLimpar}
      </button>
    </div>
  )
}

export default CampoInline
