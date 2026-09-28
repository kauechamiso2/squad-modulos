import { MagnifyingGlass, User } from '@phosphor-icons/react'
import { AvatarIniciais, DropdownColuna } from '@squad/ui'
import s from './DropdownFiltroColuna.module.css'

/*
 * Os dropdowns de coluna do Fluxo de Caixa (Figma 2279:107226).
 *
 * A casca e o @squad/ui/DropdownColuna, o mesmo do Gestao de Pessoas; aqui
 * ficam as variaveis do Figma daqui, o visual de cada tipo de item e os
 * textos de vazio.
 */
function Envolucro({ children }) {
  return <div className={s.escopo}>{children}</div>
}

export function DropdownCategoria({ categorias, marcados, onAlternar, onFechar }) {
  return (
    <Envolucro>
      <DropdownColuna
        comBusca
        comContagem
        marcadosNoTopo
        tamanhoCheckbox={20}
        iconeBusca={<MagnifyingGlass size={20} color="var(--cor-texto-secundario)" />}
        itens={categorias.map((c) => ({
          id: c.id,
          rotulo: c.nome,
          visual: <span className={s.tile}>{c.emoji}</span>,
        }))}
        marcados={marcados}
        onAlternar={onAlternar}
        onFechar={onFechar}
        mensagemVazio={(termo) => `Nenhuma categoria com "${termo}" encontrada.`}
      />
    </Envolucro>
  )
}

export function DropdownContato({ contatos, marcados, onAlternar, onFechar }) {
  return (
    <Envolucro>
      <DropdownColuna
        comBusca
        comContagem
        marcadosNoTopo
        tamanhoCheckbox={20}
        iconeBusca={<MagnifyingGlass size={20} color="var(--cor-texto-secundario)" />}
        itens={contatos.map((c) => ({
          id: c.id,
          rotulo: c.rotulo,
          /* Contato salvo tem nome e ganha avatar de iniciais; o nao salvo e so
             um documento, e recebe o icone generico. */
          visual: c.salvo
            ? <AvatarIniciais nome={c.rotulo} />
            : <User size={20} />,
        }))}
        marcados={marcados}
        onAlternar={onAlternar}
        onFechar={onFechar}
        mensagemVazio={(termo) => `Nenhum contato com "${termo}" encontrado.`}
      />
    </Envolucro>
  )
}

export function DropdownTipo({ marcados, onAlternar, onFechar }) {
  return (
    <Envolucro>
      <DropdownColuna
        tamanhoCheckbox={20}
        itens={[
          { id: 'entrada', rotulo: 'Entrada' },
          { id: 'saida', rotulo: 'Saída' },
          { id: 'agendada', rotulo: 'Agendada' },
        ]}
        marcados={marcados}
        onAlternar={onAlternar}
        onFechar={onFechar}
      />
    </Envolucro>
  )
}
