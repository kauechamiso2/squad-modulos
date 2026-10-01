import CltShell from '../../addCollaborator/clt/CltShell.jsx'
import { CampoBusca, ListaEscolhidos } from '../../campos/BuscaEEscolha.jsx'
import { getTeamColorTones, getTeamIconComponent } from '../../../utils/teamOptions.js'
import '../../campos/Botoes.css'
import '../../addCollaborator/clt/CltShell.css'
import './NovoTimeSteps.css'

const paraItem = (colaborador) => ({
  id: colaborador.id,
  nome: colaborador.name,
  detalhe: colaborador.cargos?.[0] ?? null,
})

/*
 * Passo 3 - Figma 10342:12876 (vazio), 10342:12895 (digitando) e
 * 10342:12930 (escolhidos). So a busca, sem grade de sugestoes. A busca so
 * oferece Pendente e Em atividade que ainda nao foram escolhidos. Opcional.
 */
function TimeMembrosStep({
  name,
  colorId,
  iconName,
  candidatos,
  colaboradores,
  memberOrder,
  onMemberOrderChange,
  progress,
  onBack,
  onClose,
  onContinue,
}) {
  const { light, dark } = getTeamColorTones(colorId)
  const TeamIcon = getTeamIconComponent(iconName)
  const escolhidos = new Set(memberOrder)
  const porId = new Map(colaboradores.map((colaborador) => [colaborador.id, colaborador]))

  return (
    <CltShell
      title="Novo time"
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
        <h1 className="clt-shell__title">
          Quem faz parte
          <br />
          do time{' '}
          <span className="time-step__title-badge" style={{ background: light }}>
            <TeamIcon size={19.2} color={dark} />
          </span>{' '}
          <span style={{ color: dark }}>{name}?</span>
        </h1>

        <div>
          <CampoBusca
            placeholder="Buscar nome..."
            itens={candidatos.filter((colaborador) => !escolhidos.has(colaborador.id)).map(paraItem)}
            onEscolher={(id) => onMemberOrderChange([...memberOrder, id])}
          />
          <ListaEscolhidos
            itens={memberOrder.map((id) => porId.get(id)).filter(Boolean).map(paraItem)}
            onDesmarcar={(id) => onMemberOrderChange(memberOrder.filter((item) => item !== id))}
          />
        </div>
      </div>
    </CltShell>
  )
}

export default TimeMembrosStep
