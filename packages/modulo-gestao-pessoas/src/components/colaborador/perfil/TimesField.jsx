import { useEffect, useRef, useState } from 'react'
import closeIcon from '../../../assets/icons/Close.svg'
import caretDownIcon from '../../../assets/icons/CaretDownBlack.svg'
import { useDropdownPosition } from '../../../utils/useDropdownPosition.js'
import { getTeamColorTones } from '../../../utils/teamOptions.js'
import '@squad/ui/styles/SelectListModal.css'
import '../InlineEditField.css'
import '../ColaboradorDetail.css'
import './Perfil.css'

function corDoTime(time) {
  if (!time || time.pending) return 'var(--gp-texto-esmaecido)'
  return getTeamColorTones(time.color).dark
}

/*
 * Time na pagina do colaborador (contexto, secao 5): varios times em
 * pilulas, com busca. Digitar um time que nao existe oferece 'Add "{texto}"',
 * que cria um time pendente - ele aparece na aba Times para ser completado.
 * Cada escolha ou remocao ja grava.
 */
function TimesField({ value, times, disabled, onSave, onCriarTime }) {
  const [editando, setEditando] = useState(false)
  const [busca, setBusca] = useState('')
  const ancoraRef = useRef(null)
  const rect = useDropdownPosition(editando, ancoraRef)

  useEffect(() => {
    if (!editando) return
    function fecharFora(event) {
      if (ancoraRef.current?.contains(event.target)) return
      if (event.target.closest?.('.colaborador-field__dropdown')) return
      setEditando(false)
      setBusca('')
    }
    document.addEventListener('mousedown', fecharFora)
    return () => document.removeEventListener('mousedown', fecharFora)
  }, [editando])

  const porNome = new Map(times.map((time) => [time.name, time]))
  const termo = busca.trim()
  const disponiveis = times.filter(
    (time) => !value.includes(time.name) && time.name.toLowerCase().includes(termo.toLowerCase()),
  )
  const existe = times.some((time) => time.name.toLowerCase() === termo.toLowerCase())

  const adicionar = (nome) => {
    onSave([...value, nome])
    setBusca('')
  }

  const criar = () => {
    onCriarTime(termo)
    adicionar(termo)
  }

  const remover = (nome) => onSave(value.filter((item) => item !== nome))

  const pilulas = (removiveis) =>
    value.map((nome) => (
      <span className="perfil-time" key={nome}>
        <span className="perfil-time__ponto" style={{ background: corDoTime(porNome.get(nome)) }} />
        {nome}
        {/* Leitura: a seta do Figma 10355:3657, que some com o perfil
            travado (10355:4132). */}
        {!removiveis && !disabled && <img src={caretDownIcon} width={16} height={16} alt="" />}
        {removiveis && (
          <button
            type="button"
            className="perfil-time__remover"
            aria-label={`Tirar do time ${nome}`}
            onClick={() => remover(nome)}
          >
            <img src={closeIcon} width={14} height={14} alt="" />
          </button>
        )}
      </span>
    ))

  if (!editando) {
    return (
      <button
        type="button"
        className="colaborador-detail__value-button perfil-times__leitura"
        disabled={disabled}
        onClick={() => setEditando(true)}
      >
        {value.length ? pilulas(false) : 'Adicionar'}
      </button>
    )
  }

  return (
    <div className="colaborador-field colaborador-field--fill" ref={ancoraRef}>
      <div className="perfil-times__edicao">
        {pilulas(true)}
        <input
          type="text"
          autoFocus
          className="perfil-times__busca"
          placeholder="Buscar time..."
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation()
              setEditando(false)
            }
            if (event.key === 'Enter' && termo) {
              const igual = times.find((time) => time.name.toLowerCase() === termo.toLowerCase())
              if (igual && !value.includes(igual.name)) adicionar(igual.name)
              else if (!igual) criar()
            }
          }}
        />
      </div>

      {rect && (
        <div className="colaborador-field__dropdown" style={{ top: rect.top, left: rect.left }}>
          <div className="select-list__list">
            {disponiveis.map((time) => (
              <button type="button" key={time.id} className="select-list__item" onClick={() => adicionar(time.name)}>
                <span className="perfil-time__ponto" style={{ background: corDoTime(time) }} />
                <span className="select-list__item-label">{time.name}</span>
              </button>
            ))}
            {termo && !existe && (
              <button type="button" className="select-list__item" onClick={criar}>
                <span className="select-list__item-label">Add &quot;{termo}&quot;</span>
              </button>
            )}
            {disponiveis.length === 0 && (!termo || existe) && (
              <p className="select-list__empty">Nenhum time encontrado.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TimesField
