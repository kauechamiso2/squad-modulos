import { useState } from 'react'
import { PainelLateral } from '@squad/ui'
import closeIcon from '../../../assets/icons/Close.svg'
import magnifyingGlassIcon from '../../../assets/icons/MagnifyingGlassGray.svg'
import squareIcon from '../../../assets/icons/Square.svg'
import checkSquareIcon from '../../../assets/icons/CheckSquare.svg'
import '../../campos/Botoes.css'
import './NovoTimeSteps.css'

function Rodape({ onCancelar, onSalvar, salvarDesabilitado = false }) {
  return (
    <>
      <button type="button" className="gp-botao-texto" onClick={onCancelar}>
        Cancelar
      </button>
      <button type="button" className="gp-botao" disabled={salvarDesabilitado} onClick={onSalvar}>
        Salvar
      </button>
    </>
  )
}

/*
 * "Adicionar lider" - Figma 10342:13032. A lista comeca com os membros do
 * passo 3; a busca acha qualquer pessoa Pendente ou Em atividade. So um
 * marcado. Quem vira lider sem ser membro entra no time ao salvar.
 */
export function LiderPanel({ aberto, valor, membros, candidatos, onFechar, onSalvar }) {
  const [busca, setBusca] = useState('')
  const [escolhido, setEscolhido] = useState(valor)
  const termo = busca.trim().toLowerCase()
  const lista = termo ? candidatos.filter((pessoa) => pessoa.name.toLowerCase().includes(termo)) : membros

  return (
    <PainelLateral
      className="gp-painel gp-painel--rolagem-afastada"
      classNameVeu="gp-painel"
      aberto={aberto}
      titulo="Adicionar líder"
      iconeFechar={closeIcon}
      onFechar={onFechar}
      rodape={<Rodape onCancelar={onFechar} onSalvar={() => onSalvar(escolhido)} />}
    >
      <div className="time-painel">
        <label className="time-painel__busca">
          <img src={magnifyingGlassIcon} width={24} height={24} alt="" />
          <input placeholder="Pesquisar" value={busca} onChange={(event) => setBusca(event.target.value)} />
        </label>
        <div className="time-painel__lista">
          {lista.map((pessoa) => {
            const marcado = pessoa.id === escolhido
            return (
              <button
                type="button"
                role="checkbox"
                aria-checked={marcado}
                key={pessoa.id}
                className="time-painel__pessoa"
                onClick={() => setEscolhido(marcado ? null : pessoa.id)}
              >
                <span className="time-painel__check">
                  <img src={marcado ? checkSquareIcon : squareIcon} width={24} height={24} alt="" />
                </span>
                <span className="time-painel__nome">{pessoa.name}</span>
                {pessoa.cargos?.[0] && <span className="time-painel__cargo">{pessoa.cargos[0]}</span>}
              </button>
            )
          })}
          {lista.length === 0 && (
            <p className="time-painel__vazio">{termo ? 'Nenhum resultado.' : 'Nenhum membro escolhido ainda.'}</p>
          )}
        </div>
      </div>
    </PainelLateral>
  )
}

// "Adicionar descricao" - Figma 10342:13099.
export function DescricaoPanel({ aberto, valor, onFechar, onSalvar }) {
  const [texto, setTexto] = useState(valor)
  return (
    <PainelLateral
      className="gp-painel"
      classNameVeu="gp-painel"
      aberto={aberto}
      titulo="Adicionar descrição"
      iconeFechar={closeIcon}
      onFechar={onFechar}
      rodape={<Rodape onCancelar={onFechar} onSalvar={() => onSalvar(texto.trim())} />}
    >
      <textarea
        className="time-painel__descricao"
        placeholder="Descrição do time..."
        autoFocus
        value={texto}
        onChange={(event) => setTexto(event.target.value)}
      />
    </PainelLateral>
  )
}
