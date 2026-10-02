import { createElement } from 'react'
import squareIcon from '../../assets/icons/Square.svg'
import checkSquareIcon from '../../assets/icons/CheckSquare.svg'
import CltShell from '../addCollaborator/clt/CltShell.jsx'
import { CampoBusca, ListaEscolhidos } from '../campos/BuscaEEscolha.jsx'
import { getTeamColorTones, getTeamIconComponent, guessTeamIconName } from '../../utils/teamOptions.js'
import '../campos/Botoes.css'
import '../addCollaborator/clt/CltShell.css'
import './NovoRecurso.css'

function IconeDoTime({ time }) {
  const cor = time.pending ? 'var(--color-text-secondary)' : getTeamColorTones(time.color).dark
  return createElement(getTeamIconComponent(time.icon ?? guessTeamIconName(time.name)), { size: 24, color: cor })
}

/*
 * Beneficiarios - Figma 10343:13670, 10343:13814 (Toda a empresa),
 * 10343:13720 (digitando) e 10343:13761 (escolhidos). Busca por pessoa ou
 * time (so Pendente e Em atividade), e a linha "Toda a empresa", que e
 * exclusiva. Opcional. Times na busca: icone, nome e contagem (Assumptions).
 */
function BeneficiariosStep({
  titulo,
  valor,
  onChange,
  pessoas,
  times,
  totalEmpresa,
  progress,
  onBack,
  onClose,
  onContinue,
}) {
  const { todaEmpresa, teamNames, colaboradorIds } = valor
  const porId = new Map(pessoas.map((pessoa) => [pessoa.id, pessoa]))
  const porNome = new Map(times.map((time) => [time.name, time]))

  const itens = [
    ...times
      .filter((time) => !teamNames.includes(time.name))
      .map((time) => ({
        id: `time:${time.name}`,
        nome: time.name,
        detalhe: `${time.contagem} pessoas`,
        icone: <IconeDoTime time={time} />,
      })),
    ...pessoas
      .filter((pessoa) => !colaboradorIds.includes(pessoa.id))
      .map((pessoa) => ({ id: `pessoa:${pessoa.id}`, nome: pessoa.name, detalhe: pessoa.cargos?.[0] ?? null })),
  ]

  const escolher = (chave) => {
    const [tipo, ...resto] = chave.split(':')
    const id = resto.join(':')
    onChange({
      todaEmpresa: false,
      teamNames: tipo === 'time' ? [...teamNames, id] : teamNames,
      colaboradorIds: tipo === 'pessoa' ? [...colaboradorIds, id] : colaboradorIds,
    })
  }

  const desmarcar = (chave) => {
    const [tipo, ...resto] = chave.split(':')
    const id = resto.join(':')
    onChange({
      ...valor,
      teamNames: tipo === 'time' ? teamNames.filter((nome) => nome !== id) : teamNames,
      colaboradorIds: tipo === 'pessoa' ? colaboradorIds.filter((item) => item !== id) : colaboradorIds,
    })
  }

  const escolhidos = [
    ...teamNames.map((nome) => ({
      id: `time:${nome}`,
      nome,
      detalhe: `${porNome.get(nome)?.contagem ?? 0} pessoas`,
    })),
    ...colaboradorIds
      .map((id) => porId.get(id))
      .filter(Boolean)
      .map((pessoa) => ({ id: `pessoa:${pessoa.id}`, nome: pessoa.name, detalhe: pessoa.cargos?.[0] ?? null })),
  ]

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
        <button type="button" className="gp-botao" onClick={onContinue}>
          Continuar
        </button>
      }
    >
      <div className="clt-shell__content">
        <h1 className="clt-shell__title">{titulo}</h1>
        <div>
          <CampoBusca placeholder="Buscar nome ou time..." itens={itens} onEscolher={escolher} />
          <button
            type="button"
            role="checkbox"
            aria-checked={todaEmpresa}
            className="busca-escolha__escolhido recurso-toda-empresa"
            onClick={() =>
              onChange(todaEmpresa ? { ...valor, todaEmpresa: false } : { todaEmpresa: true, teamNames: [], colaboradorIds: [] })
            }
          >
            <span className="busca-escolha__check">
              <img src={todaEmpresa ? checkSquareIcon : squareIcon} width={24} height={24} alt="" />
            </span>
            <span className="busca-escolha__nome">Toda a empresa</span>
            <span className="busca-escolha__detalhe busca-escolha__detalhe--regular">{totalEmpresa} pessoas</span>
          </button>
          {!todaEmpresa && <ListaEscolhidos itens={escolhidos} onDesmarcar={desmarcar} />}
        </div>
      </div>
    </CltShell>
  )
}

export default BeneficiariosStep
