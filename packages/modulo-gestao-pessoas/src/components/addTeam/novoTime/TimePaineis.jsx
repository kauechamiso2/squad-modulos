import { useState } from 'react'
import { PainelLateral } from '@squad/ui'
import closeIcon from '../../../assets/icons/Close.svg'
import magnifyingGlassIcon from '../../../assets/icons/MagnifyingGlassGray.svg'
import squareIcon from '../../../assets/icons/Square.svg'
import checkSquareIcon from '../../../assets/icons/CheckSquare.svg'
import { TEAM_ICON_CATEGORIES, TEAM_COLOR_PALETTE, getAvailableColorOptions } from '../../../utils/teamOptions.js'
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
 *
 * Com `multiplo`, o mesmo painel escolhe varias pessoas ("Add membro" e
 * "Add time" das paginas de time e recurso, que nao tem Figma): `valor` e
 * `onSalvar` usam uma lista de ids, e sem `membros` a lista mostra todos os
 * `candidatos`. `subtitulo(pessoa)` troca o cargo em cinza.
 */
export function LiderPanel({
  aberto,
  valor,
  membros,
  candidatos,
  onFechar,
  onSalvar,
  titulo = 'Adicionar líder',
  multiplo = false,
  vazio = 'Nenhum membro escolhido ainda.',
  subtitulo = (pessoa) => pessoa.cargos?.[0],
}) {
  const [busca, setBusca] = useState('')
  const [escolhidos, setEscolhidos] = useState(() => new Set(multiplo ? valor : valor ? [valor] : []))
  const termo = busca.trim().toLowerCase()
  const inicial = membros ?? candidatos
  const lista = termo ? candidatos.filter((pessoa) => pessoa.name.toLowerCase().includes(termo)) : inicial

  const alternar = (id) => {
    setEscolhidos((atual) => {
      if (!multiplo) return atual.has(id) ? new Set() : new Set([id])
      const proximo = new Set(atual)
      if (proximo.has(id)) proximo.delete(id)
      else proximo.add(id)
      return proximo
    })
  }

  return (
    <PainelLateral
      className="gp-painel gp-painel--rolagem-afastada"
      classNameVeu="gp-painel"
      aberto={aberto}
      titulo={titulo}
      iconeFechar={closeIcon}
      onFechar={onFechar}
      rodape={
        <Rodape
          onCancelar={onFechar}
          onSalvar={() => onSalvar(multiplo ? [...escolhidos] : ([...escolhidos][0] ?? null))}
        />
      }
    >
      <div className="time-painel">
        <label className="time-painel__busca">
          <img src={magnifyingGlassIcon} width={24} height={24} alt="" />
          <input placeholder="Pesquisar" value={busca} onChange={(event) => setBusca(event.target.value)} />
        </label>
        <div className="time-painel__lista">
          {lista.map((pessoa) => {
            const marcado = escolhidos.has(pessoa.id)
            const extra = subtitulo(pessoa)
            return (
              <button
                type="button"
                role="checkbox"
                aria-checked={marcado}
                key={pessoa.id}
                className="time-painel__pessoa"
                onClick={() => alternar(pessoa.id)}
              >
                <span className="time-painel__check">
                  <img src={marcado ? checkSquareIcon : squareIcon} width={24} height={24} alt="" />
                </span>
                <span className="time-painel__nome">{pessoa.name}</span>
                {extra && <span className="time-painel__cargo">{extra}</span>}
              </button>
            )
          })}
          {lista.length === 0 && <p className="time-painel__vazio">{termo ? 'Nenhum resultado.' : vazio}</p>}
        </div>
      </div>
    </PainelLateral>
  )
}

// "Adicionar descricao" - Figma 10342:13099. O desligamento usa o mesmo
// painel para o motivo ("Adicionar motivo").
export function DescricaoPanel({
  aberto,
  valor,
  onFechar,
  onSalvar,
  titulo = 'Adicionar descrição',
  placeholder = 'Descrição do time...',
}) {
  const [texto, setTexto] = useState(valor)
  return (
    <PainelLateral
      className="gp-painel"
      classNameVeu="gp-painel"
      aberto={aberto}
      titulo={titulo}
      iconeFechar={closeIcon}
      onFechar={onFechar}
      rodape={<Rodape onCancelar={onFechar} onSalvar={() => onSalvar(texto.trim())} />}
    >
      <textarea
        className="time-painel__descricao"
        placeholder={placeholder}
        autoFocus
        value={texto}
        onChange={(event) => setTexto(event.target.value)}
      />
    </PainelLateral>
  )
}

/*
 * "Cor do time" - Shared patterns, Pickers: painel lateral, nunca modal
 * central. As 6 cores, uma por familia (a primeira livre de cada), como o
 * seletor antigo, com a cor atual do time no lugar da da familia dela. Vem
 * marcada a cor atual (no fluxo, a primeira livre, que o passo ja escolheu).
 */
export function CorPanel({ aberto, valor, usadas, onFechar, onSalvar }) {
  // A cor atual do time entra no lugar da opcao da familia dela, para
  // aparecer marcada mesmo nao sendo a primeira livre.
  const atual = TEAM_COLOR_PALETTE.find((cor) => cor.id === valor)
  const opcoes = getAvailableColorOptions(usadas).map((opcao) =>
    atual && opcao.family === atual.family ? atual : opcao,
  )
  const [escolhida, setEscolhida] = useState(() =>
    opcoes.some((opcao) => opcao.id === valor) ? valor : (opcoes[0]?.id ?? null),
  )
  return (
    <PainelLateral
      className="gp-painel"
      classNameVeu="gp-painel"
      aberto={aberto}
      titulo="Cor do time"
      iconeFechar={closeIcon}
      onFechar={onFechar}
      rodape={<Rodape onCancelar={onFechar} onSalvar={() => onSalvar(escolhida)} salvarDesabilitado={!escolhida} />}
    >
      <div className="time-painel__cores" role="radiogroup" aria-label="Cor do time">
        {opcoes.map((opcao) => (
          <button
            type="button"
            role="radio"
            aria-checked={opcao.id === escolhida}
            aria-label={opcao.id}
            key={opcao.id}
            className={opcao.id === escolhida ? 'time-painel__cor time-painel__cor--escolhida' : 'time-painel__cor'}
            style={{ background: opcao.dark }}
            onClick={() => setEscolhida(opcao.id)}
          />
        ))}
      </div>
    </PainelLateral>
  )
}

/*
 * "Ícone do time" - Shared patterns, Pickers: painel lateral com a busca e as
 * categorias de icones do seletor antigo. O icone so muda ao salvar.
 */
export function IconePanel({ aberto, valor, cor, onFechar, onSalvar }) {
  const [busca, setBusca] = useState('')
  const [escolhido, setEscolhido] = useState(valor)
  const termo = busca.trim().toLowerCase()
  const categorias = TEAM_ICON_CATEGORIES.map((categoria) => ({
    ...categoria,
    icons: termo ? categoria.icons.filter((icone) => icone.name.toLowerCase().includes(termo)) : categoria.icons,
  })).filter((categoria) => categoria.icons.length > 0)

  return (
    <PainelLateral
      className="gp-painel gp-painel--rolagem-afastada"
      classNameVeu="gp-painel"
      aberto={aberto}
      titulo="Ícone do time"
      iconeFechar={closeIcon}
      onFechar={onFechar}
      rodape={<Rodape onCancelar={onFechar} onSalvar={() => onSalvar(escolhido)} salvarDesabilitado={!escolhido} />}
    >
      <div className="time-painel">
        <label className="time-painel__busca">
          <img src={magnifyingGlassIcon} width={24} height={24} alt="" />
          <input placeholder="Buscar ícone..." value={busca} onChange={(event) => setBusca(event.target.value)} />
        </label>
        {categorias.length === 0 && <p className="time-painel__vazio">Nenhum ícone encontrado.</p>}
        {categorias.map((categoria) => (
          <div className="time-painel__categoria" key={categoria.id}>
            <p className="time-painel__categoria-rotulo">{categoria.label}</p>
            <div className="time-painel__icones">
              {categoria.icons.map(({ name, Icon }) => (
                <button
                  type="button"
                  key={name}
                  aria-label={name}
                  aria-pressed={name === escolhido}
                  className={name === escolhido ? 'time-painel__icone time-painel__icone--escolhido' : 'time-painel__icone'}
                  onClick={() => setEscolhido(name)}
                >
                  <Icon size={24} color={name === escolhido ? cor : undefined} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PainelLateral>
  )
}
