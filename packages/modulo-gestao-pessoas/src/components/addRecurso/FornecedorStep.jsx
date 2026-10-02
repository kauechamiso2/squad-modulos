import { useState } from 'react'
import magnifyingGlassIcon from '../../assets/icons/MagnifyingGlassGray.svg'
import squareIcon from '../../assets/icons/Square.svg'
import checkSquareIcon from '../../assets/icons/CheckSquare.svg'
import plusIcon from '../../assets/icons/PlusBlack.svg'
import CltShell from '../addCollaborator/clt/CltShell.jsx'
import { BadgeAmarelo, BadgeLogo } from './Marcas.jsx'
import { ICONES_CATEGORIA } from './icones.js'
import { LOGOS } from '../../utils/logos.js'
import '../campos/Botoes.css'
import '../addCollaborator/clt/CltShell.css'
import '../addCollaborator/clt/CargoStep.css'
import '../campos/BuscaEEscolha.css'
import './NovoRecurso.css'

/*
 * Fornecedor - Figma 10343:14659: busca e grade 2x2 de sugestoes com
 * checkbox, logo e nome. Escolha unica e obrigatoria. Fora do Figma
 * (contexto, Assumptions): fornecedor sem logo usa o icone da categoria, e
 * digitar um fornecedor fora da lista oferece 'Add "{texto}"'.
 */
function FornecedorStep({ categoria, sugestoes, valor, onChange, progress, onBack, onClose, onContinue }) {
  const [busca, setBusca] = useState('')
  const termo = busca.trim()
  const lista = valor && !sugestoes.includes(valor) ? [valor, ...sugestoes] : sugestoes
  const visiveis = termo ? lista.filter((nome) => nome.toLowerCase().includes(termo.toLowerCase())) : lista
  const existe = lista.some((nome) => nome.toLowerCase() === termo.toLowerCase())
  const placeholder = categoria === 'Plano de saúde' ? 'Buscar plano...' : 'Buscar fornecedor...'

  const marca = (nome) =>
    LOGOS[nome] ? <BadgeLogo nome={nome} tamanho={32} /> : <BadgeAmarelo Icone={ICONES_CATEGORIA[categoria]} tamanho={32} />

  return (
    <CltShell
      title="Novo recurso"
      onClose={onClose}
      progress={progress}
      footerLeft={
        <button type="button" className="gp-botao-texto" onClick={onBack}>
          Voltar
        </button>
      }
      footerRight={
        <button type="button" className="gp-botao" disabled={!valor} onClick={onContinue}>
          Continuar
        </button>
      }
    >
      <div className="clt-shell__content">
        <h1 className="clt-shell__title">
          Qual o fornecedor
          <br />
          do <span className="clt-shell__destaque">{categoria}?</span>
        </h1>
        <div className="recurso-fornecedor">
          <label className="busca-escolha__campo">
            <input
              className="busca-escolha__entrada"
              placeholder={placeholder}
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
            <img src={magnifyingGlassIcon} width={24} height={24} alt="" />
          </label>
          <div className="recurso-fornecedor__grade" role="radiogroup" aria-label="Fornecedor">
            {visiveis.map((nome) => (
              <button
                type="button"
                role="radio"
                aria-checked={valor === nome}
                key={nome}
                className="recurso-fornecedor__opcao"
                onClick={() => onChange(nome)}
              >
                <span className="recurso-fornecedor__check">
                  <img src={valor === nome ? checkSquareIcon : squareIcon} width={24} height={24} alt="" />
                </span>
                {marca(nome)}
                <span className="recurso-fornecedor__nome">{nome}</span>
              </button>
            ))}
          </div>
          {termo && !existe && (
            <button
              type="button"
              className="cargo-step__item recurso-fornecedor__adicionar"
              onClick={() => {
                onChange(termo)
                setBusca('')
              }}
            >
              {marca(termo)}
              <span className="cargo-step__rotulo">Add &quot;{termo}&quot;</span>
              <img src={plusIcon} width={24} height={24} alt="" />
            </button>
          )}
        </div>
      </div>
    </CltShell>
  )
}

export default FornecedorStep
