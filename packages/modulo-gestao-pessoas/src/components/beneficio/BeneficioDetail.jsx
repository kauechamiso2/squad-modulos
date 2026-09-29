import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  At,
  Buildings,
  Link as LinkIcon,
  Phone,
  Copy,
  Eye,
  EyeSlash,
  NotePencil,
  FrameCorners,
  Plus,
  X,
} from '@phosphor-icons/react'
import closeIcon from '../../assets/icons/Close.svg'
import trashIcon from '../../assets/icons/Trash.svg'
import backToModalIcon from '../../assets/icons/Back-to-Modal.svg'
import desktopIcon from '../../assets/icons/Desktop.svg'
import vanIcon from '../../assets/icons/Van.svg'
import aliceImage from '../../assets/images/Frame 2147223814.png'
import cajuImage from '../../assets/images/Frame 2147223814-1.png'
import gympassImage from '../../assets/images/Frame 2147223814-2.png'
import DeleteBeneficioModal from './DeleteBeneficioModal.jsx'
import AdicionarTimeModal from './AdicionarTimeModal.jsx'
import AdicionarMembroModal from './AdicionarMembroModal.jsx'
import { COLLECTIONS, getCollection, setCollection } from '../../utils/storage.js'
import { computeBenefitMetrics } from '../../utils/beneficiarios.js'
import { getBeneficioTypeIcon, getBenefitFilterTipo } from '../../utils/beneficioOptions.js'
import { getTeamColorTones, getTeamIconComponent } from '../../utils/teamOptions.js'
import { formatDateDMonthYear, formatCurrencyBRL } from '../../utils/formatters.js'
import { useToast } from '../toast/ToastContext.jsx'
import './BeneficioDetail.css'
import { IconButton, PainelLateral } from '@squad/ui'

const IMAGE_BY_KEY = {
  alice: aliceImage,
  caju: cajuImage,
  gympass: gympassImage,
}

const ICON_BY_KEY = {
  desktop: desktopIcon,
  van: vanIcon,
}

const STAT_VALUE_MAX_FONT = 40
const STAT_VALUE_MIN_FONT = 20
const STAT_VALUE_FONT_STEP = 2

// The stat cards have a fixed width and must never grow to fit their value
// - instead, shrink the value's own font-size until it fits the card's
// fixed width. Re-measures whenever the text changes or the card itself is
// resized (e.g. switching between panel and full-screen).
function useFitStatFontSize(text) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const fit = () => {
      let size = STAT_VALUE_MAX_FONT
      el.style.fontSize = `${size}px`
      while (size > STAT_VALUE_MIN_FONT && el.scrollWidth > el.clientWidth) {
        size -= STAT_VALUE_FONT_STEP
        el.style.fontSize = `${size}px`
      }
    }

    fit()

    const observer = new ResizeObserver(fit)
    observer.observe(el)
    return () => observer.disconnect()
  }, [text])

  return ref
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function BeneficioDetail({ id, mode, aberto, onClose, onExpand, onCollapse }) {
  const { showToast } = useToast()
  const [benefits, setBenefits] = useState(() => getCollection(COLLECTIONS.BENEFICIOS))
  const [collaborators, setCollaborators] = useState(() => getCollection(COLLECTIONS.COLABORADORES))
  const [times, setTimes] = useState(() => getCollection(COLLECTIONS.TIMES))

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [addTimeModalOpen, setAddTimeModalOpen] = useState(false)
  const [addMembroModalOpen, setAddMembroModalOpen] = useState(false)
  const [addingNota, setAddingNota] = useState(false)
  const [notaText, setNotaText] = useState('')
  const notaInputRef = useRef(null)
  const notaSavingRef = useRef(false)
  const [custoVisible, setCustoVisible] = useState(false)
  const [copiedField, setCopiedField] = useState(null)


  /*
   * O painel fica montado enquanto a saida anima (o PainelLateral so o tira
   * do DOM no fim da transicao), entao nem o estado local nem os dados lidos
   * do storage se reiniciam sozinhos a cada abertura como acontecia quando o
   * Home desmontava. Releia e zere aqui, na subida de `aberto`.
   */
  useEffect(() => {
    if (!aberto) return
    setBenefits(getCollection(COLLECTIONS.BENEFICIOS))
    setCollaborators(getCollection(COLLECTIONS.COLABORADORES))
    setTimes(getCollection(COLLECTIONS.TIMES))
    setDeleteModalOpen(false)
    setAddTimeModalOpen(false)
    setAddMembroModalOpen(false)
    setAddingNota(false)
    setNotaText('')
    setCustoVisible(false)
    setCopiedField(null)
  }, [aberto])

  const benefit = benefits.find((item) => item.id === id) ?? null

  const persistBenefits = (updated) => {
    setCollection(COLLECTIONS.BENEFICIOS, updated)
    setBenefits(updated)
  }

  const updateField = (field, value) => {
    if (!benefit) return
    persistBenefits(benefits.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const updateBeneficiarios = (nextBeneficiarios) => updateField('beneficiarios', nextBeneficiarios)

  // computeBenefitMetrics and the font-fit hook below must run unconditionally,
  // before the early return, so the same number of hooks runs on every
  // render regardless of whether the benefit was found.
  const metrics = benefit ? computeBenefitMetrics(benefit, collaborators, times) : null
  const custoDisplayText = benefit
    ? custoVisible
      ? formatCurrencyBRL(metrics.custoTotal)
      : '••••••'
    : ''
  const custoValueRef = useFitStatFontSize(custoDisplayText)

  if (!benefit) return null

  const isCreatedBenefit = Boolean(benefit.tipo)
  const typeLabel = getBenefitFilterTipo(benefit)
  const beneficiarios = benefit.beneficiarios ?? {
    colaboradorIds: [],
    teamNames: [],
    todaEmpresa: false,
  }

  const copyToClipboard = async (field, value) => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 1500)
    } catch {
      // Clipboard API unavailable or denied - nothing more we can do here.
    }
  }

  const handleDelete = () => {
    const updated = benefits.filter((item) => item.id !== id)
    setCollection(COLLECTIONS.BENEFICIOS, updated)
    showToast('danger', 'Benefício excluído com sucesso')
    onClose()
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
    const notas = [...(benefit.notas ?? []), { text: trimmed, timestamp: new Date().toISOString() }]
    updateField('notas', notas)
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

  const handleAddTime = (teamName, valor) => {
    const teamNames = Array.from(new Set([...(beneficiarios.teamNames ?? []), teamName]))
    const teamValores = { ...(beneficiarios.teamValores ?? {}), [teamName]: valor }
    updateBeneficiarios({ ...beneficiarios, teamNames, teamValores })
    setAddTimeModalOpen(false)
  }

  const handleRemoveTime = (teamName) => {
    const teamNames = (beneficiarios.teamNames ?? []).filter((name) => name !== teamName)
    const teamValores = { ...(beneficiarios.teamValores ?? {}) }
    delete teamValores[teamName]
    updateBeneficiarios({ ...beneficiarios, teamNames, teamValores })
  }

  const handleAddMembro = (collaboradorId, valor) => {
    const colaboradorIds = Array.from(new Set([...(beneficiarios.colaboradorIds ?? []), collaboradorId]))
    const colaboradorValores = { ...(beneficiarios.colaboradorValores ?? {}), [collaboradorId]: valor }
    updateBeneficiarios({ ...beneficiarios, colaboradorIds, colaboradorValores })
    setAddMembroModalOpen(false)
  }

  const handleRemoveMembro = (collaboradorId) => {
    const colaboradorIds = (beneficiarios.colaboradorIds ?? []).filter((cid) => cid !== collaboradorId)
    const colaboradorValores = { ...(beneficiarios.colaboradorValores ?? {}) }
    delete colaboradorValores[collaboradorId]
    updateBeneficiarios({ ...beneficiarios, colaboradorIds, colaboradorValores })
  }

  const handleRemoveTodaEmpresa = () => {
    updateBeneficiarios({ ...beneficiarios, todaEmpresa: false, todaEmpresaValor: null })
  }

  const totalBeneficiarios = metrics.totalBeneficiarios

  const teamRecordByName = new Map(times.map((team) => [team.name, team]))

  const teamSources = (beneficiarios.teamNames ?? [])
    .map((teamName) => {
      const team = teamRecordByName.get(teamName)
      if (!team) return null
      const memberCount = collaborators.filter(
        (collaborator) => Array.isArray(collaborator.times) && collaborator.times.includes(teamName),
      ).length
      const valor = beneficiarios.teamValores?.[teamName] ?? 0
      return { team, memberCount, valor }
    })
    .filter(Boolean)

  const individualSources = (beneficiarios.colaboradorIds ?? [])
    .map((collaboradorId) => {
      const collaborator = collaborators.find((item) => item.id === collaboradorId)
      if (!collaborator) return null
      const valor = beneficiarios.colaboradorValores?.[collaboradorId] ?? 0
      return { collaborator, valor }
    })
    .filter(Boolean)

  const todaEmpresaValue =
    beneficiarios.todaEmpresaValor ??
    (benefit.valores?.length === 1 && benefit.valores[0].aplicaATodos ? benefit.valores[0].valor : 0)

  const nonMemberTimes = times.filter((team) => !(beneficiarios.teamNames ?? []).includes(team.name))
  const nonMemberCollaborators = collaborators.filter(
    (collaborator) => !(beneficiarios.colaboradorIds ?? []).includes(collaborator.id),
  )

  const badgeContent = isCreatedBenefit ? (
    (() => {
      const CategoryIcon = getBeneficioTypeIcon(benefit.tipo)
      return <CategoryIcon size={20} />
    })()
  ) : benefit.iconType === 'image' ? (
    <img className="beneficio-detail__badge-image" src={IMAGE_BY_KEY[benefit.image]} alt="" />
  ) : (
    <img src={ICON_BY_KEY[benefit.icon]} width={20} height={20} alt="" />
  )

  const profileSection = (
    <div className="beneficio-detail__profile">
      <span className="beneficio-detail__badge">{badgeContent}</span>
      <span className="beneficio-detail__title-group">
        <span className="beneficio-detail__name">{benefit.name}</span>
        {typeLabel && <span className="beneficio-detail__type">{typeLabel}</span>}
      </span>
    </div>
  )

  const infoList = (
    <div className="beneficio-detail__info-list">
      <div className="beneficio-detail__row">
        <Buildings size={20} className="beneficio-detail__row-icon" />
        <span className="beneficio-detail__row-label">Fornecedor</span>
        <span className="beneficio-detail__row-value">{benefit.name || '—'}</span>
      </div>

      <div className="beneficio-detail__row">
        <LinkIcon size={20} className="beneficio-detail__row-icon" />
        <span className="beneficio-detail__row-label">Link</span>
        <span className="beneficio-detail__row-value">{benefit.linkBeneficio || '—'}</span>
        {copiedField === 'link' && <span className="beneficio-detail__copy-feedback">copiado</span>}
        {benefit.linkBeneficio && (
          <button
            type="button"
            className="beneficio-detail__copy-button"
            onClick={() => copyToClipboard('link', benefit.linkBeneficio)}
            aria-label="Copiar link"
          >
            <Copy size={20} />
          </button>
        )}
      </div>

      <div className="beneficio-detail__row">
        <Phone size={20} className="beneficio-detail__row-icon" />
        <span className="beneficio-detail__row-label">Contato</span>
        <span className="beneficio-detail__row-value">{benefit.contatoFornecedor || '—'}</span>
        {copiedField === 'contato' && <span className="beneficio-detail__copy-feedback">copiado</span>}
        {benefit.contatoFornecedor && (
          <button
            type="button"
            className="beneficio-detail__copy-button"
            onClick={() => copyToClipboard('contato', benefit.contatoFornecedor)}
            aria-label="Copiar contato"
          >
            <Copy size={20} />
          </button>
        )}
      </div>

      <div className="beneficio-detail__row">
        <At size={20} className="beneficio-detail__row-icon" />
        <span className="beneficio-detail__row-label">Email</span>
        <span className="beneficio-detail__row-value">{benefit.emailFornecedor || '—'}</span>
      </div>
    </div>
  )

  const notesSection = (
    <div className="beneficio-detail__notes">
      {(benefit.notas ?? []).map((nota, index) => (
        <div className="beneficio-detail__nota" key={index}>
          <span className="beneficio-detail__nota-date">
            {formatDateDMonthYear(nota.timestamp.slice(0, 10))}
          </span>
          <p className="beneficio-detail__nota-text">{nota.text}</p>
        </div>
      ))}

      {addingNota ? (
        <input
          ref={notaInputRef}
          type="text"
          autoFocus
          className="beneficio-detail__add-nota-input"
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
        <button type="button" className="beneficio-detail__add-nota" onClick={startAddNota}>
          <NotePencil size={20} color="var(--color-text-secondary)" />
          Adicionar nota
        </button>
      )}
    </div>
  )

  const metricsSection = (
    <div className="beneficio-detail__metrics">
      <p className="beneficio-detail__section-label">Métricas</p>

      <div className="beneficio-detail__stats-row">
        <div className="beneficio-detail__stat-card">
          <span className="beneficio-detail__stat-label">Total de beneficiários</span>
          <span className="beneficio-detail__stat-value">{totalBeneficiarios}</span>
        </div>
        <div className="beneficio-detail__stat-card">
          <div className="beneficio-detail__stat-header">
            <span className="beneficio-detail__stat-label beneficio-detail__stat-label--medium">
              Custo total
            </span>
            <button
              type="button"
              className="beneficio-detail__stat-toggle"
              onClick={() => setCustoVisible((value) => !value)}
              aria-label={custoVisible ? 'Ocultar custo total' : 'Mostrar custo total'}
            >
              {custoVisible ? <EyeSlash size={24} /> : <Eye size={24} />}
            </button>
          </div>
          <span ref={custoValueRef} className="beneficio-detail__stat-value">
            {custoDisplayText}
          </span>
        </div>
      </div>

      <div className="beneficio-detail__stat-card">
        <span className="beneficio-detail__stat-label">Valores</span>
        {metrics.valueBreakdown.length === 0 ? (
          <span className="beneficio-detail__value-amount">—</span>
        ) : (
          metrics.valueBreakdown.map(({ valor, count }) => (
            <div className="beneficio-detail__value-row" key={valor}>
              <span className="beneficio-detail__value-amount">{formatCurrencyBRL(valor)}</span>
              <span className="beneficio-detail__value-count">{count}</span>
            </div>
          ))
        )}
      </div>

      <div className="beneficio-detail__stat-card">
        <span className="beneficio-detail__stat-label">Por time</span>
        {metrics.teamBreakdown.length === 0 ? (
          <span className="beneficio-detail__value-amount">—</span>
        ) : (
          <>
            <div className="beneficio-detail__team-bar">
              {metrics.teamBreakdown.map(({ teamName, percent }) => (
                <span
                  key={teamName}
                  style={{
                    flex: percent || 0.0001,
                    background:
                      teamName === 'Sem time'
                        ? '#c9cccc'
                        : getTeamColorTones(teamRecordByName.get(teamName)?.color).dark,
                  }}
                />
              ))}
            </div>
            <p className="beneficio-detail__team-legend">
              {metrics.teamBreakdown.map((t) => `${t.teamName}: ${t.percent}%`).join(' | ')}
            </p>
          </>
        )}
      </div>
    </div>
  )

  const timesSection = (
    <div className="beneficio-detail__times">
      <div className="beneficio-detail__section-header">
        <p className="beneficio-detail__section-label beneficio-detail__section-label--flex">Times</p>
        <button
          type="button"
          className="beneficio-detail__add-button"
          onClick={() => setAddTimeModalOpen(true)}
        >
          Add time
          <Plus size={20} color="#798282" />
        </button>
      </div>

      <div className="beneficio-detail__source-list">
        {teamSources.map(({ team, memberCount, valor }) => {
          const { light, dark } = getTeamColorTones(team.color)
          const TeamIcon = getTeamIconComponent(team.icon)
          return (
            <div className="beneficio-detail__source-row" key={team.id}>
              <span className="beneficio-detail__source-badge" style={{ background: light }}>
                <TeamIcon size={16} color={dark} />
              </span>
              <div className="beneficio-detail__source-info">
                <span className="beneficio-detail__source-name">{team.name}</span>
                <span className="beneficio-detail__source-meta">{memberCount} pessoas</span>
                <span className="beneficio-detail__source-meta">{formatCurrencyBRL(valor)}</span>
              </div>
              <button
                type="button"
                className="beneficio-detail__source-remove"
                onClick={() => handleRemoveTime(team.name)}
                aria-label="Remover time"
              >
                <X size={24} />
              </button>
            </div>
          )
        })}

        {beneficiarios.todaEmpresa && (
          <div className="beneficio-detail__source-row">
            <span className="beneficio-detail__source-badge beneficio-detail__source-badge--empresa">
              <Buildings size={16} />
            </span>
            <div className="beneficio-detail__source-info">
              <span className="beneficio-detail__source-name">Toda a empresa</span>
              <span className="beneficio-detail__source-meta">
                {formatCurrencyBRL(todaEmpresaValue)}
              </span>
            </div>
            <button
              type="button"
              className="beneficio-detail__source-remove"
              onClick={handleRemoveTodaEmpresa}
              aria-label="Remover toda a empresa"
            >
              <X size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const membrosSection = (
    <div className="beneficio-detail__membros">
      <div className="beneficio-detail__section-header">
        <p className="beneficio-detail__section-label beneficio-detail__section-label--flex">
          Membros individuais
        </p>
        <button
          type="button"
          className="beneficio-detail__add-button"
          onClick={() => setAddMembroModalOpen(true)}
        >
          Add membro
          <Plus size={20} color="#798282" />
        </button>
      </div>

      <div className="beneficio-detail__source-list">
        {individualSources.map(({ collaborator, valor }) => {
          const memberTeamName = collaborator.times?.[0]
          const memberTeamRecord = teamRecordByName.get(memberTeamName)
          const { dark } = getTeamColorTones(memberTeamRecord?.color)
          return (
            <div className="beneficio-detail__source-row" key={collaborator.id}>
              <span
                className="beneficio-detail__source-badge beneficio-detail__source-badge--avatar"
                style={{ background: dark }}
              >
                {getInitials(collaborator.name)}
              </span>
              <div className="beneficio-detail__source-info">
                <span className="beneficio-detail__source-name">{collaborator.name}</span>
                <span className="beneficio-detail__source-meta">{formatCurrencyBRL(valor)}</span>
              </div>
              <button
                type="button"
                className="beneficio-detail__source-remove"
                onClick={() => handleRemoveMembro(collaborator.id)}
                aria-label="Remover membro"
              >
                <X size={24} />
              </button>
            </div>
          )
        })}
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
            className="icon-button beneficio-detail__expand-button"
            onClick={onCollapse}
            aria-label="Recolher"
          >
            <img src={backToModalIcon} alt="" width={24} height={24} />
          </button>
        ) : (
          <button
            type="button"
            className="icon-button beneficio-detail__expand-button"
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
      titulo="Benefício"
      /* O foco inicial vem para o X, nunca para a lixeira. */
      acaoEsquerda={<IconButton icon={closeIcon} alt="Fechar" data-foco-inicial onClick={onClose} />}
      acaoDireita={cabecalhoDireita}
      comRodape={false}
      onFechar={onClose}
      className={[
        'gp-painel',
        'beneficio-detail',
        mode === 'full' ? 'beneficio-detail--full' : 'beneficio-detail--panel',
      ].join(' ')}
      classNameVeu={`gp-painel ${mode === 'full' ? 'beneficio-detail-overlay--oculto' : ''}`.trim()}
    >
      <div className="beneficio-detail__scroll">
        {mode === 'full' ? (
          <div className="beneficio-detail__columns">
            <div className="beneficio-detail__column beneficio-detail__column--main">
              {profileSection}
              {infoList}
              {metricsSection}
              {timesSection}
              {membrosSection}
            </div>
            <div className="beneficio-detail__column beneficio-detail__column--notes">
              {notesSection}
            </div>
          </div>
        ) : (
          <>
            {profileSection}
            {infoList}
            {notesSection}
            {metricsSection}
            {timesSection}
            {membrosSection}
          </>
        )}
      </div>

      {deleteModalOpen && (
        <DeleteBeneficioModal
          name={benefit.name}
          onCancel={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
        />
      )}

      {addTimeModalOpen && (
        <AdicionarTimeModal
          times={nonMemberTimes}
          excludedNames={beneficiarios.teamNames ?? []}
          onClose={() => setAddTimeModalOpen(false)}
          onSave={handleAddTime}
        />
      )}

      {addMembroModalOpen && (
        <AdicionarMembroModal
          collaborators={nonMemberCollaborators}
          excludedIds={beneficiarios.colaboradorIds ?? []}
          onClose={() => setAddMembroModalOpen(false)}
          onSave={handleAddMembro}
        />
      )}
    </PainelLateral>
  )
}

export default BeneficioDetail
