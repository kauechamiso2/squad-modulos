import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Crown,
  Eyedropper,
  Smiley,
  FileText,
  NotePencil,
  FrameCorners,
  CaretDown,
  Plus,
  X,
  Eye,
  EyeSlash,
} from '@phosphor-icons/react'
import closeIcon from '../../assets/icons/Close.svg'
import trashIcon from '../../assets/icons/Trash.svg'
import userIcon from '../../assets/icons/User.svg'
import arrowUpRightIcon from '../../assets/icons/ArrowUpRight.svg'
import backToModalIcon from '../../assets/icons/Back-to-Modal.svg'
import LiderModal from '../addTeam/LiderModal.jsx'
import ColorPickerModal from '../addTeam/ColorPickerModal.jsx'
import IconPickerModal from '../addTeam/IconPickerModal.jsx'
import DescricaoModal from '../addTeam/DescricaoModal.jsx'
import MembrosModal from '../addTeam/MembrosModal.jsx'
import DeleteTimeModal from './DeleteTimeModal.jsx'
import RemoveMemberModal from './RemoveMemberModal.jsx'
import { COLLECTIONS, getCollection, setCollection, getCollaboratorActiveSince } from '../../utils/storage.js'
import { resolveBeneficiaryIds } from '../../utils/beneficiarios.js'
import { getBeneficioTypeIcon, getBenefitFilterTipo } from '../../utils/beneficioOptions.js'
import { formatDateDMonthYear, formatCurrencyBRL } from '../../utils/formatters.js'
import { getTeamColorTones, getTeamIconComponent } from '../../utils/teamOptions.js'
import { useToast } from '../toast/ToastContext.jsx'
import '../addTeam/Step1TeamInfo.css'
import './TimeDetail.css'
import { IconButton, PainelLateral } from '@squad/ui'

function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function computeAverageTenureMonths(members) {
  const now = new Date()
  const monthsList = members
    .map((member) => getCollaboratorActiveSince(member))
    .filter(Boolean)
    .map((iso) => {
      const [year, month, day] = iso.split('-').map(Number)
      const start = new Date(year, month - 1, day)
      const totalMonths =
        (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
      return Math.max(totalMonths, 0)
    })
  if (monthsList.length === 0) return null
  return monthsList.reduce((sum, value) => sum + value, 0) / monthsList.length
}

function formatTenure(months) {
  if (months == null) return '—'
  const rounded = Math.round(months)
  const years = Math.floor(rounded / 12)
  const remMonths = rounded % 12
  return `${years}a ${remMonths}m`
}

function formatBeneficioAggregate(values) {
  if (values.length === 0) return '—'
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (min === max) return formatCurrencyBRL(min)
  const fmt = (value) =>
    value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `R$${fmt(min)}-${fmt(max)}`
}

// Custo total has no currency prefix - just the number.
function formatNumberBRL(value) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Same "Custo total" formula as the Colaborador page: the member's own
// salário/valorPagamento plus every benefit value individually assigned to
// them (not aggregated across the team, which is what beneficiosDoTime does).
function computeMemberCusto(member, collaborators, beneficios) {
  const isFreelancerOrConsultor =
    member.contractType === 'Freelancer' || member.contractType === 'Consultor'
  const salarioValue = (isFreelancerOrConsultor ? member.valorPagamento : member.salario) ?? 0
  const beneficiosValue = beneficios
    .filter((benefit) => Boolean(benefit.tipo))
    .filter((benefit) => resolveBeneficiaryIds(benefit.beneficiarios, collaborators).has(member.id))
    .reduce((sum, benefit) => {
      const variant = benefit.valores?.find(
        (item) => item.aplicaATodos || item.colaboradorIds?.includes(member.id),
      )
      return sum + (variant?.valor ?? 0)
    }, 0)
  return salarioValue + beneficiosValue
}

function TimeDetail({ id, mode, aberto, onClose, onExpand, onCollapse, onDataChanged }) {
  const { showToast } = useToast()
  const [times, setTimes] = useState(() => getCollection(COLLECTIONS.TIMES))
  const [collaborators, setCollaborators] = useState(() => getCollection(COLLECTIONS.COLABORADORES))
  const beneficios = getCollection(COLLECTIONS.BENEFICIOS)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [removeMemberTarget, setRemoveMemberTarget] = useState(null)
  const [openFieldModal, setOpenFieldModal] = useState(null)
  const [descExpanded, setDescExpanded] = useState(false)
  const [addingNota, setAddingNota] = useState(false)
  const [notaText, setNotaText] = useState('')
  const notaInputRef = useRef(null)
  const notaSavingRef = useRef(false)
  const [custoVisible, setCustoVisible] = useState(false)


  /*
   * O painel fica montado enquanto a saida anima (o PainelLateral so o tira
   * do DOM no fim da transicao), entao nem o estado local nem os dados lidos
   * do storage se reiniciam sozinhos a cada abertura como acontecia quando o
   * Home desmontava. Releia e zere aqui, na subida de `aberto`.
   */
  useEffect(() => {
    if (!aberto) return
    setTimes(getCollection(COLLECTIONS.TIMES))
    setCollaborators(getCollection(COLLECTIONS.COLABORADORES))
    setDeleteModalOpen(false)
    setRemoveMemberTarget(null)
    setOpenFieldModal(null)
    setDescExpanded(false)
    setAddingNota(false)
    setNotaText('')
    setCustoVisible(false)
  }, [aberto])

  const team = times.find((item) => item.id === id) ?? null

  const persistTimes = (updatedTimes) => {
    setCollection(COLLECTIONS.TIMES, updatedTimes)
    setTimes(updatedTimes)
  }

  const persistCollaborators = (updatedCollaborators) => {
    setCollection(COLLECTIONS.COLABORADORES, updatedCollaborators)
    setCollaborators(updatedCollaborators)
    onDataChanged?.(updatedCollaborators)
  }

  const updateTeamField = (field, value) => {
    if (!team) return
    persistTimes(times.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const members = useMemo(() => {
    if (!team) return []
    return collaborators.filter(
      (collaborator) => Array.isArray(collaborator.times) && collaborator.times.includes(team.name),
    )
  }, [collaborators, team])

  /*
   * Estes ganchos precisam vir antes do `if (!team)`: um gancho depois de um
   * return condicional muda a ordem entre renders. Nenhum deles depende de
   * `team` - todos partem de `members`, que ja trata o time ausente.
   */
  const avgTenureMonths = computeAverageTenureMonths(members)

  const custoTotalTime = useMemo(
    () => members.reduce((sum, member) => sum + computeMemberCusto(member, collaborators, beneficios), 0),
    [members, collaborators, beneficios],
  )
  const custoDisplayText = custoVisible ? formatNumberBRL(custoTotalTime) : '••••••'

  const cargoCounts = useMemo(() => {
    const map = new Map()
    members.forEach((member) => {
      ;(member.cargos ?? []).forEach((cargoName) => {
        map.set(cargoName, (map.get(cargoName) ?? 0) + 1)
      })
    })
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [members])

  const contractPercentages = useMemo(() => {
    const counts = { Fixo: 0, Freelancer: 0, Consultor: 0 }
    members.forEach((member) => {
      const type = member.contractType || 'Fixo'
      if (counts[type] != null) counts[type] += 1
    })
    const total = members.length
    return {
      Fixo: total ? Math.round((counts.Fixo / total) * 100) : 0,
      Freelancer: total ? Math.round((counts.Freelancer / total) * 100) : 0,
      Consultor: total ? Math.round((counts.Consultor / total) * 100) : 0,
    }
  }, [members])

  const nonMemberCollaborators = useMemo(() => {
    const memberIds = new Set(members.map((member) => member.id))
    return collaborators.filter((collaborator) => !memberIds.has(collaborator.id))
  }, [collaborators, members])

  const beneficiosDoTime = useMemo(() => {
    return beneficios
      .filter((benefit) => Boolean(benefit.tipo))
      .map((benefit) => {
        const beneficiaryIds = resolveBeneficiaryIds(benefit.beneficiarios, collaborators)
        const qualifyingMemberIds = members
          .filter((member) => beneficiaryIds.has(member.id))
          .map((member) => member.id)
        if (qualifyingMemberIds.length === 0) return null
        const values = qualifyingMemberIds
          .map((memberId) => {
            const variant = benefit.valores?.find(
              (item) => item.aplicaATodos || item.colaboradorIds?.includes(memberId),
            )
            return variant ? variant.valor : null
          })
          .filter((value) => value != null)
        return {
          benefit,
          filterTipo: getBenefitFilterTipo(benefit),
          Icon: getBeneficioTypeIcon(benefit.tipo),
          aggregateValue: formatBeneficioAggregate(values),
        }
      })
      .filter(Boolean)
  }, [beneficios, collaborators, members])

  if (!team) return null

  const { light, dark } = getTeamColorTones(team.color)
  const TeamIcon = getTeamIconComponent(team.icon)
  const leader = members.find((member) => member.id === team.leaderId) ?? null

  const handleDelete = () => {
    const updatedTimes = times.filter((item) => item.id !== id)
    setCollection(COLLECTIONS.TIMES, updatedTimes)

    const updatedCollaborators = collaborators.map((collaborator) =>
      Array.isArray(collaborator.times) && collaborator.times.includes(team.name)
        ? { ...collaborator, times: [] }
        : collaborator,
    )
    setCollection(COLLECTIONS.COLABORADORES, updatedCollaborators)
    onDataChanged?.(updatedCollaborators)
    showToast('danger', 'Time excluído com sucesso')
    onClose()
  }

  const handleRemoveMember = (memberId) => {
    const updated = collaborators.map((collaborator) =>
      collaborator.id === memberId ? { ...collaborator, times: [] } : collaborator,
    )
    persistCollaborators(updated)
    if (team.leaderId === memberId) {
      updateTeamField('leaderId', null)
    }
  }

  const startAddNota = () => {
    setNotaText('')
    setAddingNota(true)
  }

  const cancelAddNota = () => {
    setAddingNota(false)
    setNotaText('')
  }

  const saveNota = () => {
    const trimmed = notaText.trim()
    if (!trimmed) {
      cancelAddNota()
      return
    }
    notaSavingRef.current = true
    const notas = [...(team.notas ?? []), { text: trimmed, timestamp: new Date().toISOString() }]
    updateTeamField('notas', notas)
    setAddingNota(false)
    setNotaText('')
  }

  const handleNotaBlur = () => {
    if (notaSavingRef.current) {
      notaSavingRef.current = false
      return
    }
    cancelAddNota()
  }


  const profileSection = (
    <div className="time-detail__profile">
      <span className="time-detail__badge" style={{ background: light }}>
        <TeamIcon size={24} color={dark} />
      </span>
      <span className="time-detail__name">{team.name}</span>
    </div>
  )

  const infoList = (
    <div className="time-detail__info-list">
      <div className="time-detail__row">
        <Crown size={20} className="time-detail__row-icon" />
        <span className="time-detail__row-label">Líder</span>
        <button
          type="button"
          className="time-detail__value-button time-detail__leader-button"
          onClick={() => setOpenFieldModal('lider')}
        >
          <span className="time-detail__avatar-sm">
            <img src={userIcon} alt="" width={12} height={12} />
          </span>
          <span>{leader?.name ?? 'Adicionar'}</span>
        </button>
      </div>

      <div className="time-detail__row">
        <Eyedropper size={20} className="time-detail__row-icon" />
        <span className="time-detail__row-label">Cor</span>
        <div className="time-detail__row-control team-field-row__control">
          <span className="team-color-dot" style={{ background: light }} />
          <span className="team-color-dot" style={{ background: dark }} />
          <button
            type="button"
            className="team-color-swatch-button"
            style={{ background: dark }}
            onClick={() => setOpenFieldModal('cor')}
            aria-label="Escolher cor do time"
          />
        </div>
      </div>

      <div className="time-detail__row">
        <Smiley size={20} className="time-detail__row-icon" />
        <span className="time-detail__row-label">Ícone</span>
        <button
          type="button"
          className="time-detail__icon-pill"
          onClick={() => setOpenFieldModal('icone')}
          aria-label="Escolher icone do time"
        >
          <TeamIcon size={16} color={dark} />
          <CaretDown size={16} />
        </button>
      </div>

      <div className="time-detail__row time-detail__row--descricao">
        <FileText size={20} className="time-detail__row-icon" />
        <span className="time-detail__row-label">Descrição</span>
        <div className="time-detail__descricao-content">
          <p
            className={
              descExpanded
                ? 'time-detail__descricao-text'
                : 'time-detail__descricao-text time-detail__descricao-text--clamped'
            }
            onClick={() => setOpenFieldModal('descricao')}
          >
            {team.descricao || 'Adicionar'}
          </p>
          {team.descricao && (
            <button
              type="button"
              className="time-detail__ver-mais"
              onClick={(event) => {
                event.stopPropagation()
                setDescExpanded((value) => !value)
              }}
            >
              {descExpanded ? 'ver menos...' : 'ver mais...'}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  const notesSection = (
    <div className="time-detail__notes">
      {(team.notas ?? []).map((nota, index) => (
        <div className="time-detail__nota" key={index}>
          <span className="time-detail__nota-date">
            {formatDateDMonthYear(nota.timestamp.slice(0, 10))}
          </span>
          <p className="time-detail__nota-text">{nota.text}</p>
        </div>
      ))}

      {addingNota ? (
        <input
          ref={notaInputRef}
          type="text"
          autoFocus
          className="time-detail__add-nota-input"
          placeholder="Escreva uma nota..."
          value={notaText}
          onChange={(event) => setNotaText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              notaSavingRef.current = true
              saveNota()
            }
            if (event.key === 'Escape') cancelAddNota()
          }}
          onBlur={handleNotaBlur}
        />
      ) : (
        <button type="button" className="time-detail__add-nota" onClick={startAddNota}>
          <NotePencil size={20} color="var(--color-text-secondary)" />
          Adicionar nota
        </button>
      )}
    </div>
  )

  const metricsSection = (
    <div className="time-detail__metrics">
      <p className="time-detail__section-label">Métricas</p>

      <div className="time-detail__stats-row">
        <div className="time-detail__stat-card">
          <span className="time-detail__stat-label">Total de membros</span>
          <span className="time-detail__stat-value">{members.length}</span>
        </div>
        <div className="time-detail__stat-card">
          <span className="time-detail__stat-label">Tempo média de casa</span>
          <span className="time-detail__stat-value">{formatTenure(avgTenureMonths)}</span>
        </div>
      </div>

      <div className="time-detail__stat-card">
        <div className="time-detail__stat-header">
          <span className="time-detail__stat-label time-detail__stat-label--medium">
            Custo total do time
          </span>
          <button
            type="button"
            className="time-detail__stat-toggle"
            onClick={() => setCustoVisible((value) => !value)}
            aria-label={custoVisible ? 'Ocultar custo total do time' : 'Mostrar custo total do time'}
          >
            {custoVisible ? <EyeSlash size={24} /> : <Eye size={24} />}
          </button>
        </div>
        <span className="time-detail__stat-value">{custoDisplayText}</span>
      </div>

      <div className="time-detail__stat-card">
        <span className="time-detail__stat-label">Cargos representados</span>
        {cargoCounts.length === 0 ? (
          <span className="time-detail__cargo-name">—</span>
        ) : (
          cargoCounts.map(([cargoName, count]) => (
            <div className="time-detail__cargo-row" key={cargoName}>
              <span className="time-detail__cargo-name">{cargoName}</span>
              <span className="time-detail__cargo-count">{count}</span>
            </div>
          ))
        )}
      </div>

      <div className="time-detail__stat-card">
        <span className="time-detail__contract-label">Tipo de contratação</span>
        <div className="time-detail__contract-bar">
          <span style={{ flex: contractPercentages.Fixo || 0.0001, background: '#039300' }} />
          <span style={{ flex: contractPercentages.Freelancer || 0.0001, background: '#2a79d7' }} />
          <span style={{ flex: contractPercentages.Consultor || 0.0001, background: '#fbb21a' }} />
        </div>
        <p className="time-detail__contract-legend">
          Fixo: {contractPercentages.Fixo}% | Freelancer: {contractPercentages.Freelancer}% | Consultor:{' '}
          {contractPercentages.Consultor}%
        </p>
      </div>
    </div>
  )

  const membrosSection = (
    <div className="time-detail__membros">
      <div className="time-detail__section-header">
        <p className="time-detail__section-label time-detail__section-label--flex">Membros</p>
        <button
          type="button"
          className="time-detail__add-membro-button"
          onClick={() => setOpenFieldModal('membros')}
        >
          Add membro
          <Plus size={20} color="#798282" />
        </button>
      </div>

      <div className="time-detail__member-list">
        {members.map((member) => (
          <div className="time-detail__member-row" key={member.id}>
            <span className="time-detail__member-avatar" style={{ background: dark }}>
              {getInitials(member.name)}
            </span>
            <div className="time-detail__member-info">
              <span className="time-detail__member-name">{member.name}</span>
              <span className="time-detail__member-cargo">{member.cargos?.[0] ?? ''}</span>
            </div>
            <button
              type="button"
              className="time-detail__member-remove"
              onClick={() => setRemoveMemberTarget(member)}
              aria-label="Remover membro"
            >
              <X size={24} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )

  const beneficiosSection = beneficiosDoTime.length > 0 && (
    <div className="time-detail__beneficios">
      <p className="time-detail__section-label">Benefícios</p>
      <div className="time-detail__beneficio-list">
        {beneficiosDoTime.map(({ benefit, filterTipo, Icon, aggregateValue }) => (
          <div className="time-detail__beneficio-row" key={benefit.id}>
            <span className="time-detail__beneficio-icon">
              <Icon size={18} />
            </span>
            <span className="time-detail__beneficio-info">
              <span className="time-detail__beneficio-tipo">{filterTipo}</span>
              <span className="time-detail__beneficio-name">{benefit.name}</span>
            </span>
            <span className="time-detail__beneficio-value">{aggregateValue}</span>
            <img src={arrowUpRightIcon} width={24} height={24} alt="" />
          </div>
        ))}
      </div>
    </div>
  )

  /*
   * A casca (veu, painel de 540, deslize de 280ms) e o @squad/ui/PainelLateral,
   * o mesmo do detalhe do colaborador - uma animacao so, a do ui.
   *
   * O modo tela cheia continua sendo CSS daqui: ele anima largura, posicao e
   * padding no MESMO elemento do modo painel, entao entra como classe extra.
   */
  const cabecalhoDireita = (
    <>
        <IconButton icon={trashIcon} alt="Excluir" onClick={() => setDeleteModalOpen(true)} />
        {mode === 'full' ? (
          <button
            type="button"
            className="icon-button time-detail__expand-button"
            onClick={onCollapse}
            aria-label="Recolher"
          >
            <img src={backToModalIcon} alt="" width={24} height={24} />
          </button>
        ) : (
          <button
            type="button"
            className="icon-button time-detail__expand-button"
            onClick={onExpand}
            aria-label="Expandir"
          >
            <FrameCorners size={24} />
          </button>
        )}
    </>
  )

  return (
    <PainelLateral
      aberto={aberto}
      titulo="Time"
      /* O foco inicial vem para o X, nunca para a lixeira. */
      acaoEsquerda={<IconButton icon={closeIcon} alt="Fechar" data-foco-inicial onClick={onClose} />}
      acaoDireita={cabecalhoDireita}
      comRodape={false}
      onFechar={onClose}
      className={[
        'gp-painel',
        'time-detail',
        mode === 'full' ? 'time-detail--full' : 'time-detail--panel',
      ].join(' ')}
      classNameVeu={`gp-painel ${mode === 'full' ? 'time-detail-overlay--oculto' : ''}`.trim()}
    >
      <div className="time-detail__scroll">
        {mode === 'full' ? (
          <div className="time-detail__columns">
            <div className="time-detail__column time-detail__column--main">
              {profileSection}
              {infoList}
              {metricsSection}
              {membrosSection}
              {beneficiosSection}
            </div>
            <div className="time-detail__column time-detail__column--notes">{notesSection}</div>
          </div>
        ) : (
          <>
            {profileSection}
            {infoList}
            {notesSection}
            {metricsSection}
            {membrosSection}
            {beneficiosSection}
          </>
        )}
      </div>

      {deleteModalOpen && (
        <DeleteTimeModal
          name={team.name}
          onCancel={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
        />
      )}

      {removeMemberTarget && (
        <RemoveMemberModal
          name={removeMemberTarget.name}
          onCancel={() => setRemoveMemberTarget(null)}
          onConfirm={() => {
            handleRemoveMember(removeMemberTarget.id)
            setRemoveMemberTarget(null)
          }}
        />
      )}

      {openFieldModal === 'lider' && (
        <LiderModal
          value={team.leaderId}
          collaborators={members}
          onClose={() => setOpenFieldModal(null)}
          onSave={(selected) => {
            updateTeamField('leaderId', selected)
            setOpenFieldModal(null)
          }}
        />
      )}

      {openFieldModal === 'cor' && (
        <ColorPickerModal
          usedColorIds={times
            .filter((otherTeam) => otherTeam.id !== team.id && otherTeam.color)
            .map((otherTeam) => otherTeam.color)}
          onClose={() => setOpenFieldModal(null)}
          onSelect={(colorId) => {
            updateTeamField('color', colorId)
            setOpenFieldModal(null)
          }}
        />
      )}

      {openFieldModal === 'icone' && (
        <IconPickerModal
          value={team.icon}
          onClose={() => setOpenFieldModal(null)}
          onSelect={(iconName) => {
            updateTeamField('icon', iconName)
            setOpenFieldModal(null)
          }}
        />
      )}

      {openFieldModal === 'descricao' && (
        <DescricaoModal
          value={team.descricao}
          onClose={() => setOpenFieldModal(null)}
          onSave={(descricao) => {
            updateTeamField('descricao', descricao)
            setOpenFieldModal(null)
          }}
        />
      )}

      {openFieldModal === 'membros' && (
        <MembrosModal
          title="Adicionar membros"
          collaborators={nonMemberCollaborators}
          value={[]}
          onClose={() => setOpenFieldModal(null)}
          onSave={(newIds) => {
            const newIdSet = new Set(newIds)
            const updated = collaborators.map((collaborator) =>
              newIdSet.has(collaborator.id) ? { ...collaborator, times: [team.name] } : collaborator,
            )
            persistCollaborators(updated)
            setOpenFieldModal(null)
          }}
        />
      )}
    </PainelLateral>
  )
}

export default TimeDetail
