import { useEffect, useRef, useState } from 'react'
import magnifyingGlassIcon from '../../assets/icons/MagnifyingGlassGray.svg'
import userIcon from '../../assets/icons/User.svg'
import checkSquareIcon from '../../assets/icons/CheckSquare.svg'
import './BuscaEEscolha.css'

/*
 * Padrao "search and pick" (contexto, "Shared patterns") - Figma
 * 10342:12895 (digitando, lista 10342:12909) e 10342:12930 (escolhidos,
 * 10342:12944). Campo com lupa; ao digitar abre a lista com o icone User, o
 * nome e o cargo em cinza. Cada escolha vira uma linha com o CheckSquare
 * marcado, e desmarcar tira a pessoa.
 *
 * `itens`: [{ id, nome, detalhe, icone? }] - so os que ainda podem ser
 * escolhidos. `icone` troca o User (os times no beneficiarios usam o icone
 * do time).
 */
export function CampoBusca({ itens, placeholder, onEscolher }) {
  const [busca, setBusca] = useState('')
  const [aberto, setAberto] = useState(false)
  const caixaRef = useRef(null)

  useEffect(() => {
    if (!aberto) return
    function fecharFora(event) {
      if (caixaRef.current && !caixaRef.current.contains(event.target)) setAberto(false)
    }
    document.addEventListener('mousedown', fecharFora)
    return () => document.removeEventListener('mousedown', fecharFora)
  }, [aberto])

  const termo = busca.trim().toLowerCase()
  const encontrados = termo ? itens.filter((item) => item.nome.toLowerCase().includes(termo)) : []

  return (
    <div className="busca-escolha" ref={caixaRef}>
      <label className="busca-escolha__campo">
        <input
          className="busca-escolha__entrada"
          placeholder={placeholder}
          value={busca}
          onChange={(event) => {
            setBusca(event.target.value)
            setAberto(true)
          }}
          onFocus={() => setAberto(true)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setAberto(false)
          }}
        />
        <img src={magnifyingGlassIcon} width={24} height={24} alt="" />
      </label>

      {aberto && termo && (
        <div className="busca-escolha__lista" role="listbox">
          {encontrados.map((item) => (
            <button
              type="button"
              role="option"
              aria-selected={false}
              key={item.id}
              className="busca-escolha__opcao"
              onClick={() => {
                onEscolher(item.id)
                setBusca('')
                setAberto(false)
              }}
            >
              {item.icone ?? <img src={userIcon} width={24} height={24} alt="" />}
              <span className="busca-escolha__nome">{item.nome}</span>
              {item.detalhe && <span className="busca-escolha__detalhe">{item.detalhe}</span>}
            </button>
          ))}
          {encontrados.length === 0 && <p className="busca-escolha__vazio">Nenhum resultado.</p>}
        </div>
      )}
    </div>
  )
}

export function ListaEscolhidos({ itens, onDesmarcar }) {
  if (itens.length === 0) return null
  return (
    <div className="busca-escolha__escolhidos">
      {itens.map((item) => (
        <button
          type="button"
          role="checkbox"
          aria-checked
          key={item.id}
          className="busca-escolha__escolhido"
          onClick={() => onDesmarcar(item.id)}
        >
          <span className="busca-escolha__check">
            <img src={checkSquareIcon} width={24} height={24} alt="" />
          </span>
          <span className="busca-escolha__nome">{item.nome}</span>
          {item.detalhe && <span className="busca-escolha__detalhe busca-escolha__detalhe--regular">{item.detalhe}</span>}
        </button>
      ))}
    </div>
  )
}
