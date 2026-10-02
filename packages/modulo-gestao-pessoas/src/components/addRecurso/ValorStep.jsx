import { useState } from 'react'
import { PainelLateral } from '@squad/ui'
import closeIcon from '../../assets/icons/Close.svg'
import plusIcon from '../../assets/icons/PlusGray.svg'
import trashIcon from '../../assets/icons/TrashGray.svg'
import squareIcon from '../../assets/icons/Square.svg'
import checkIcon from '../../assets/icons/Check.svg'
import checkSquareIcon from '../../assets/icons/CheckSquare.svg'
import CltShell from '../addCollaborator/clt/CltShell.jsx'
import { formatAmountFromDigits } from '../../utils/formatters.js'
import '../campos/Botoes.css'
import '../addCollaborator/clt/CltShell.css'
import './NovoRecurso.css'

/*
 * "Atribuir" - Figma 10343:13999 e 10343:14152: os beneficiarios em linhas
 * com checkbox e nome. Quem ja esta em outra variante aparece com o check
 * verde e nao pode ser marcado.
 */
function AtribuirPanel({ aberto, pessoas, marcados, emOutras, onFechar, onSalvar }) {
  const [selecao, setSelecao] = useState(() => new Set(marcados))
  const alternar = (id) =>
    setSelecao((atual) => {
      const nova = new Set(atual)
      if (nova.has(id)) nova.delete(id)
      else nova.add(id)
      return nova
    })

  return (
    <PainelLateral
      className="gp-painel gp-painel--rolagem-afastada"
      classNameVeu="gp-painel"
      aberto={aberto}
      titulo="Atribuir"
      iconeFechar={closeIcon}
      onFechar={onFechar}
      rodape={
        <>
          <button type="button" className="gp-botao-texto" onClick={onFechar}>
            Cancelar
          </button>
          <button type="button" className="gp-botao" onClick={() => onSalvar([...selecao])}>
            Salvar
          </button>
        </>
      }
    >
      <div className="recurso-atribuir">
        {/* Quem ja esta em outra variante vai para o fim, com o check verde
            (contexto, secao 7). */}
        {[...pessoas.filter((pessoa) => !emOutras.has(pessoa.id)), ...pessoas.filter((pessoa) => emOutras.has(pessoa.id))].map((pessoa) => {
          const bloqueado = emOutras.has(pessoa.id)
          const marcado = selecao.has(pessoa.id)
          return (
            <button
              type="button"
              role="checkbox"
              aria-checked={bloqueado || marcado}
              disabled={bloqueado}
              key={pessoa.id}
              className="recurso-atribuir__pessoa"
              onClick={() => alternar(pessoa.id)}
            >
              <img src={bloqueado ? checkIcon : marcado ? checkSquareIcon : squareIcon} width={24} height={24} alt="" />
              <span className="recurso-atribuir__nome">{pessoa.name}</span>
              {pessoa.cargos?.[0] && <span className="recurso-atribuir__cargo">{pessoa.cargos[0]}</span>}
            </button>
          )
        })}
      </div>
    </PainelLateral>
  )
}

// Large input de valor com o "R$" cinza na frente - Figma 10343:14355.
function CampoValor({ digitos, onChange, autoFocus }) {
  return (
    <label className="recurso-valor__campo">
      <span className="recurso-valor__moeda">R$</span>
      <input
        className="recurso-valor__entrada"
        inputMode="numeric"
        autoFocus={autoFocus}
        value={formatAmountFromDigits(digitos || '0')}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, '').replace(/^0+/, ''))}
      />
    </label>
  )
}

/*
 * Valor - Figma 10343:13839 (um valor), 10343:13858 (variantes), 10343:14305
 * e 10343:14347 (todos atribuidos). Com variantes, cada linha tem a
 * contagem em azul, "Atribuir" (ou "Alterar" quando todo mundo ja tem
 * variante) e a lixeira, e Continuar so libera com todos atribuidos.
 */
function ValorStep({
  titulo,
  variantes,
  onChange,
  pessoas,
  novaVariante,
  rotuloContinuar,
  progress,
  onBack,
  onClose,
  onContinue,
}) {
  const [atribuindo, setAtribuindo] = useState(null)
  const [aberturas, setAberturas] = useState(0)
  const comVariantes = variantes.length > 1
  const atribuidos = new Set(variantes.flatMap((variante) => variante.colaboradorIds))
  const totalAtribuidos = pessoas.filter((pessoa) => atribuidos.has(pessoa.id)).length
  const todosAtribuidos = totalAtribuidos === pessoas.length
  const podeContinuar = !comVariantes || todosAtribuidos

  const atualizar = (id, campos) =>
    onChange(variantes.map((variante) => (variante.id === id ? { ...variante, ...campos } : variante)))

  const varianteAberta = variantes.find((variante) => variante.id === atribuindo)
  const emOutras = new Set(
    variantes.filter((variante) => variante.id !== atribuindo).flatMap((variante) => variante.colaboradorIds),
  )

  return (
    <>
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
          <button type="button" className="gp-botao" disabled={!podeContinuar} onClick={onContinue}>
            {rotuloContinuar}
          </button>
        }
      >
        <div className="clt-shell__content">
          <h1 className="clt-shell__title">{titulo}</h1>
          <div className="recurso-valor">
            <div className="recurso-valor__lista">
              {variantes.map((variante, indice) => (
                <div className="recurso-valor__linha" key={variante.id}>
                  <CampoValor
                    digitos={variante.digitos}
                    autoFocus={indice === 0}
                    onChange={(digitos) => atualizar(variante.id, { digitos })}
                  />
                  {comVariantes && (
                    <span className="recurso-valor__acoes">
                      <button
                        type="button"
                        className="recurso-valor__atribuir"
                        onClick={() => {
                          setAberturas((total) => total + 1)
                          setAtribuindo(variante.id)
                        }}
                      >
                        {variante.colaboradorIds.length > 0 && (
                          <span className="recurso-valor__contagem">{variante.colaboradorIds.length}</span>
                        )}
                        {todosAtribuidos ? 'Alterar' : 'Atribuir'}
                        <img src={plusIcon} width={24} height={24} alt="" />
                      </button>
                      <button
                        type="button"
                        className="recurso-valor__lixeira"
                        aria-label="Excluir variante"
                        onClick={() => onChange(variantes.filter((item) => item.id !== variante.id))}
                      >
                        <img src={trashIcon} width={24} height={24} alt="" />
                      </button>
                    </span>
                  )}
                </div>
              ))}
              {comVariantes && (
                <p className="recurso-valor__contador">
                  {totalAtribuidos}/{pessoas.length} atribuídos
                </p>
              )}
            </div>
            <button type="button" className="recurso-outro" onClick={() => onChange([...variantes, novaVariante()])}>
              <span>Adicionar variante de valor</span>
              <span className="recurso-outro__seta">
                <img src={plusIcon} width={24} height={24} alt="" />
              </span>
            </button>
          </div>
        </div>
      </CltShell>

      {aberturas > 0 && (
        <AtribuirPanel
          key={aberturas}
          aberto={Boolean(varianteAberta)}
          pessoas={pessoas}
          marcados={varianteAberta?.colaboradorIds ?? []}
          emOutras={emOutras}
          onFechar={() => setAtribuindo(null)}
          onSalvar={(ids) => {
            atualizar(atribuindo, { colaboradorIds: ids })
            setAtribuindo(null)
          }}
        />
      )}
    </>
  )
}

export default ValorStep
