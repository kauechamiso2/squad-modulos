import { useEffect, useRef, useState } from 'react'
import { useFitStatFontSize } from '../../utils/useFitStatFontSize.js'
import { At, CheckCircle, Flag, PiggyBank, NotePencil, Power, FrameCorners, Eye, EyeSlash } from '@phosphor-icons/react'
import closeIcon from '../../assets/icons/Close.svg'
import trashIcon from '../../assets/icons/Trash.svg'
import briefcaseIcon from '../../assets/icons/Briefcase.svg'
import usersFourIcon from '../../assets/icons/UsersFourGray.svg'
import userIcon from '../../assets/icons/User.svg'
import arrowUpRightIcon from '../../assets/icons/ArrowUpRight.svg'
import backToModalIcon from '../../assets/icons/Back-to-Modal.svg'
import { IconButton, PainelLateral } from '@squad/ui'
import ActivityTag from '../ActivityTag.jsx'
import InlineEditField from './InlineEditField.jsx'
import CargoField from './CargoField.jsx'
import TimeField from './TimeField.jsx'
import ReportaParaField from './ReportaParaField.jsx'
import DateField from './DateField.jsx'
import DeleteColaboradorModal from './DeleteColaboradorModal.jsx'
import DesligarColaboradorModal from './DesligarColaboradorModal.jsx'
import PerfilClt from './perfil/PerfilClt.jsx'
import { perfilTravado } from '../../utils/cadastro.js'
import { COLLECTIONS, addItem, getCollection, setCollection, getCollaboratorActiveSince } from '../../utils/storage.js'
import { resolveBeneficiaryIds } from '../../utils/beneficiarios.js'
import { getBeneficioTypeIcon, getBenefitFilterTipo } from '../../utils/beneficioOptions.js'
import {
  formatDatePt,
  formatDateDMonthYear,
  formatCurrencyBRL,
  formatPaymentValue,
  isValidEmail,
  amountToDigits,
  formatAmountFromDigits,
  centsToAmount,
} from '../../utils/formatters.js'
import { useToast } from '../toast/ToastContext.jsx'
import './ColaboradorDetail.css'

function computeTenureMonths(collaborator) {
  const iso = getCollaboratorActiveSince(collaborator)
  if (!iso) return null
  const [year, month, day] = iso.split('-').map(Number)
  const start = new Date(year, month - 1, day)
  const now = new Date()
  const totalMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
  return Math.max(totalMonths, 0)
}

function formatTenure(months) {
  if (months == null) return '—'
  const years = Math.floor(months / 12)
  const remMonths = months % 12
  return `${years}a ${remMonths}m`
}

// Custo total has no currency prefix - just the number.
function formatNumberBRL(value) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function ColaboradorDetail({ id, mode, aberto, onClose, onExpand, onCollapse, onDataChanged }) {
  const { showToast } = useToast()
  const [collaborators, setCollaborators] = useState(() => getCollection(COLLECTIONS.COLABORADORES))
  const times = getCollection(COLLECTIONS.TIMES)
  // Cargo nao tem colecao propria: as sugestoes sao os valores distintos ja
  // em uso entre os colaboradores.
  const cargoOptions = Array.from(
    new Set(collaborators.flatMap((collaborator) => collaborator.cargos)),
  )
  const beneficios = getCollection(COLLECTIONS.BENEFICIOS)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [desligarModalOpen, setDesligarModalOpen] = useState(false)
  const [addingNota, setAddingNota] = useState(false)
  const [notaText, setNotaText] = useState('')
  const notaInputRef = useRef(null)
  const notaSavingRef = useRef(false)
  const [custoVisible, setCustoVisible] = useState(false)
  const [salarioVisible, setSalarioVisible] = useState(false)

  /*
   * O painel fica montado enquanto a saida anima (o PainelLateral so o tira
   * do DOM no fim da transicao), entao nem o estado local nem os dados lidos
   * do storage se reiniciam sozinhos a cada abertura como acontecia quando o
   * Home desmontava. Releia e zere aqui, na subida de `aberto`.
   */
  useEffect(() => {
    if (!aberto) return
    setCollaborators(getCollection(COLLECTIONS.COLABORADORES))
    setDeleteModalOpen(false)
    setDesligarModalOpen(false)
    setAddingNota(false)
    setNotaText('')
    setCustoVisible(false)
    setSalarioVisible(false)
  }, [aberto])

  const collaborator = collaborators.find((item) => item.id === id) ?? null

  const persist = (updatedList) => {
    setCollection(COLLECTIONS.COLABORADORES, updatedList)
    setCollaborators(updatedList)
    onDataChanged?.(updatedList)
  }

  const updateField = (field, value) => {
    if (!collaborator) return
    persist(collaborators.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const isFreelancerOrConsultor =
    collaborator?.contractType === 'Freelancer' || collaborator?.contractType === 'Consultor'

  const beneficiosDoColaborador = beneficios
    .filter((benefit) => Boolean(benefit.tipo))
    .filter((benefit) => resolveBeneficiaryIds(benefit.beneficiarios, collaborators).has(id))
    .map((benefit) => {
      const variantWithValue = benefit.valores?.find(
        (variant) => variant.aplicaATodos || variant.colaboradorIds?.includes(id),
      )
      return {
        benefit,
        filterTipo: getBenefitFilterTipo(benefit),
        Icon: getBeneficioTypeIcon(benefit.tipo),
        assignedValue: variantWithValue ? formatCurrencyBRL(variantWithValue.valor) : '—',
        assignedValueRaw: variantWithValue?.valor ?? 0,
      }
    })

  // The rebuilt Freelancer flow saves the contract value as valorContrato;
  // Consultor still goes through the older flow, which saves valorPagamento
  // - read whichever is actually set, preferring the newer name.
  const salarioValue = collaborator
    ? isFreelancerOrConsultor
      ? (collaborator.valorContrato ?? collaborator.valorPagamento)
      : collaborator.salario
    : null
  const salarioFieldName = isFreelancerOrConsultor
    ? collaborator?.valorContrato != null
      ? 'valorContrato'
      : 'valorPagamento'
    : 'salario'
  const salarioDisplay =
    salarioValue == null
      ? 'Adicionar'
      : isFreelancerOrConsultor
        ? formatPaymentValue(salarioValue, collaborator.tipoPagamento)
        : formatCurrencyBRL(salarioValue)

  // "Custo para empresa" is the intended cost base when set - salário
  // bruto stays purely informational in that case. Falls back to
  // salário/valor de pagamento for records that predate the field (or
  // simply never set it).
  const custoBase = collaborator?.custoParaEmpresa ?? salarioValue ?? 0
  const custoTotal =
    custoBase + beneficiosDoColaborador.reduce((sum, item) => sum + item.assignedValueRaw, 0)
  const tenureMonths = collaborator ? computeTenureMonths(collaborator) : null

  // These two must be called unconditionally, before the early return below,
  // so the same number of hooks runs on every render regardless of whether
  // collaborator was found.
  const custoDisplayText = custoVisible ? formatNumberBRL(custoTotal) : '••••••'
  const tenureDisplayText = formatTenure(tenureMonths)
  const custoValueRef = useFitStatFontSize(custoDisplayText)
  const tenureValueRef = useFitStatFontSize(tenureDisplayText)

  if (!collaborator) return null

  const desligado = Boolean(collaborator.desligado)
  // A pagina CLT segue o Figma (perfil/PerfilClt). A PJ continua a de antes
  // ate a parte 4.
  const ehClt = collaborator.tipo === 'CLT'

  const handleDelete = () => {
    const updated = collaborators.filter((item) => item.id !== id)
    setCollection(COLLECTIONS.COLABORADORES, updated)
    onDataChanged?.(updated)
    showToast('danger', 'Colaborador excluído com sucesso')
    onClose()
  }

  const handlePowerClick = () => {
    // CLT: Reativar nao existe mais. O Desligar ainda e a ponte de antes do
    // fluxo de desligamento - marca `desligado` e trava os campos.
    if (ehClt && desligado) return
    if (desligado) {
      updateField('desligado', false)
      return
    }
    setDesligarModalOpen(true)
  }

  const handleConfirmDesligar = () => {
    updateField('desligado', true)
    setDesligarModalOpen(false)
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
    const notas = [...(collaborator.notas ?? []), { text: trimmed, timestamp: new Date().toISOString() }]
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

  const profileSection = (
    <div className="colaborador-detail__profile">
      <span className="colaborador-detail__avatar">
        <img src={userIcon} alt="" width={20} height={20} />
      </span>
      <span className="colaborador-detail__name">{collaborator.name}</span>
      <ActivityTag contractType={collaborator.contractType} desligado={desligado} />
    </div>
  )

  const pipoBar = (
    <p className="colaborador-detail__pipo-bar">
      <span>Peça ao Pipo para</span>
      <strong>Resumir perfil,</strong>
      <strong>Redigir mensagem</strong>
      <span>ou</span>
      <strong>Comparar cargo</strong>
    </p>
  )

  const infoList = (
    <div className="colaborador-detail__info-list">
      <div className="colaborador-detail__row">
        <At size={20} className="colaborador-detail__row-icon" />
        <span className="colaborador-detail__row-label">Email</span>
        <InlineEditField
          value={collaborator.email ?? ''}
          displayValue={collaborator.email || 'Adicionar'}
          disabled={desligado}
          validate={(draft) => isValidEmail(draft)}
          onSave={(draft) => updateField('email', draft)}
        />
      </div>

      <div className="colaborador-detail__row">
        <img
          className="colaborador-detail__row-icon"
          src={briefcaseIcon}
          alt=""
          width={20}
          height={20}
        />
        <span className="colaborador-detail__row-label">Cargo</span>
        <CargoField
          value={collaborator.cargos}
          cargoOptions={cargoOptions}
          disabled={desligado}
          onSave={(draft) => updateField('cargos', draft)}
        />
      </div>

      <div className="colaborador-detail__row">
        <img
          className="colaborador-detail__row-icon"
          src={usersFourIcon}
          alt=""
          width={20}
          height={20}
        />
        <span className="colaborador-detail__row-label">Time</span>
        <TimeField
          value={collaborator.times}
          times={times}
          disabled={desligado}
          onSave={(draft) => updateField('times', draft)}
        />
      </div>

      <div className="colaborador-detail__row">
        <img
          className="colaborador-detail__row-icon"
          src={userIcon}
          alt=""
          width={20}
          height={20}
        />
        <span className="colaborador-detail__row-label">Reporta para</span>
        <ReportaParaField
          value={collaborator.reportaPara}
          ownId={id}
          collaborators={collaborators}
          disabled={desligado}
          onSave={(name) => updateField('reportaPara', name)}
        />
      </div>

      {isFreelancerOrConsultor ? (
        <>
          <div className="colaborador-detail__row">
            <CheckCircle size={20} className="colaborador-detail__row-icon" />
            <span className="colaborador-detail__row-label">Início contrato</span>
            <DateField
              value={collaborator.dataInicioContrato}
              disabled={desligado}
              displayValue={
                collaborator.dataInicioContrato
                  ? formatDatePt(collaborator.dataInicioContrato)
                  : 'Adicionar'
              }
              onSave={(value) => updateField('dataInicioContrato', value)}
            />
          </div>
          <div className="colaborador-detail__row">
            <Flag size={20} className="colaborador-detail__row-icon" />
            <span className="colaborador-detail__row-label">Fim contrato</span>
            <DateField
              value={collaborator.dataFimContrato}
              allowNoEnd
              disabled={desligado}
              displayValue={
                collaborator.dataFimContrato === null
                  ? 'Sem data de fim'
                  : collaborator.dataFimContrato
                    ? formatDatePt(collaborator.dataFimContrato)
                    : 'Adicionar'
              }
              onSave={(value) => updateField('dataFimContrato', value)}
            />
          </div>
        </>
      ) : (
        <div className="colaborador-detail__row">
          <CheckCircle size={20} className="colaborador-detail__row-icon" />
          <span className="colaborador-detail__row-label">Ativo desde</span>
          <DateField
            value={collaborator.dataAdmissao}
            disabled={desligado}
            displayValue={
              collaborator.dataAdmissao ? formatDatePt(collaborator.dataAdmissao) : 'Adicionar'
            }
            onSave={(value) => updateField('dataAdmissao', value)}
          />
        </div>
      )}

      <div className="colaborador-detail__row">
        <PiggyBank size={20} className="colaborador-detail__row-icon" />
        <span className="colaborador-detail__row-label">Salário</span>
        <InlineEditField
          value={amountToDigits(salarioValue)}
          displayValue={salarioVisible ? salarioDisplay : '••••••'}
          disabled={desligado}
          formatForInput={(digits) => (digits ? formatAmountFromDigits(digits) : '')}
          parseInput={(text) => text.replace(/\D/g, '')}
          onSave={(digits) => updateField(salarioFieldName, centsToAmount(digits))}
        />
        <button
          type="button"
          className="colaborador-detail__mask-toggle"
          onClick={() => setSalarioVisible((value) => !value)}
          aria-label={salarioVisible ? 'Ocultar salário' : 'Mostrar salário'}
        >
          {salarioVisible ? <EyeSlash size={24} /> : <Eye size={24} />}
        </button>
      </div>
    </div>
  )

  const notesSection = (
    <div className="colaborador-detail__notes">
      {(collaborator.notas ?? []).map((nota, index) => (
        <div className="colaborador-detail__nota" key={index}>
          <span className="colaborador-detail__nota-date">
            {formatDateDMonthYear(nota.timestamp.slice(0, 10))}
          </span>
          <p className="colaborador-detail__nota-text">{nota.text}</p>
        </div>
      ))}

      {addingNota ? (
        <input
          ref={notaInputRef}
          type="text"
          autoFocus
          className="colaborador-detail__add-nota-input"
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
        <button type="button" className="colaborador-detail__add-nota" onClick={startAddNota}>
          <NotePencil size={20} color="var(--color-text-secondary)" />
          Adicionar nota
        </button>
      )}
    </div>
  )

  const metricsSection = (
    <div className="colaborador-detail__metrics">
      <p className="colaborador-detail__section-label">Métricas</p>
      <div className="colaborador-detail__stats-row">
        <div className="colaborador-detail__stat-card">
          <div className="colaborador-detail__stat-header">
            <span className="colaborador-detail__stat-label colaborador-detail__stat-label--medium">
              Custo total
            </span>
            <button
              type="button"
              className="colaborador-detail__stat-toggle"
              onClick={() => setCustoVisible((value) => !value)}
              aria-label={custoVisible ? 'Ocultar custo total' : 'Mostrar custo total'}
            >
              {custoVisible ? <EyeSlash size={24} /> : <Eye size={24} />}
            </button>
          </div>
          <span ref={custoValueRef} className="colaborador-detail__stat-value">
            {custoDisplayText}
          </span>
        </div>
        <div className="colaborador-detail__stat-card">
          <span className="colaborador-detail__stat-label">Tempo de casa</span>
          <span ref={tenureValueRef} className="colaborador-detail__stat-value">
            {tenureDisplayText}
          </span>
        </div>
      </div>
    </div>
  )

  const beneficiosSection = beneficiosDoColaborador.length > 0 && (
    <div className="colaborador-detail__beneficios">
      <p className="colaborador-detail__section-label">Beneficios</p>
      {beneficiosDoColaborador.map(({ benefit, filterTipo, Icon, assignedValue }) => (
        <div className="colaborador-detail__beneficio-row" key={benefit.id}>
          <span className="colaborador-detail__beneficio-icon">
            <Icon size={18} />
          </span>
          <span className="colaborador-detail__beneficio-info">
            <span className="colaborador-detail__beneficio-tipo">{filterTipo}</span>
            <span className="colaborador-detail__beneficio-name">{benefit.name}</span>
          </span>
          <span className="colaborador-detail__beneficio-value">{assignedValue}</span>
          <img src={arrowUpRightIcon} width={24} height={24} alt="" />
        </div>
      ))}
    </div>
  )

  /*
   * A casca (veu, painel de 540, deslize de 280ms) virou @squad/ui/PainelLateral
   * quando o Fluxo de Caixa passou a usar a mesma no resumo de transacao.
   *
   * O modo tela cheia continua sendo CSS daqui: ele anima largura, posicao e
   * padding no MESMO elemento do modo painel, entao entra como classe extra em
   * vez de virar outro componente - senao o morph entre os dois modos quebra.
   */
  const cabecalhoDireita = (
    <>
      <IconButton icon={trashIcon} alt="Excluir" onClick={() => setDeleteModalOpen(true)} />
      <button
        type="button"
        className={
          desligado
            ? 'icon-button colaborador-detail__power-button colaborador-detail__power-button--active'
            : 'icon-button colaborador-detail__power-button'
        }
        onClick={handlePowerClick}
        disabled={ehClt && desligado}
        aria-label={desligado && !ehClt ? 'Reativar' : 'Desligar'}
      >
        <Power size={24} weight={desligado ? 'fill' : 'regular'} />
      </button>
      {mode === 'full' ? (
        <button
          type="button"
          className="icon-button colaborador-detail__expand-button"
          onClick={onCollapse}
          aria-label="Recolher"
        >
          <img src={backToModalIcon} alt="" width={24} height={24} />
        </button>
      ) : (
        <button
          type="button"
          className="icon-button colaborador-detail__expand-button"
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
      titulo="Colaborador"
      /* O foco inicial vem para o X, nunca para a lixeira. */
      acaoEsquerda={<IconButton icon={closeIcon} alt="Fechar" data-foco-inicial onClick={onClose} />}
      acaoDireita={cabecalhoDireita}
      comRodape={false}
      onFechar={onClose}
      className={[
        'gp-painel',
        'colaborador-detail',
        mode === 'full' ? 'colaborador-detail--full' : 'colaborador-detail--panel',
      ].join(' ')}
      classNameVeu={`gp-painel ${mode === 'full' ? 'colaborador-detail-overlay--oculto' : ''}`.trim()}
    >
      <div className="colaborador-detail__scroll">
        {ehClt ? (
          <PerfilClt
            colaborador={collaborator}
            colaboradores={collaborators}
            times={times}
            recursos={beneficios}
            travado={perfilTravado(collaborator)}
            mode={mode}
            pipoBar={pipoBar}
            notas={notesSection}
            onAtualizar={updateField}
            onCriarTime={(nome) => addItem(COLLECTIONS.TIMES, { name: nome, pending: true })}
          />
        ) : mode === 'full' ? (
          <div className="colaborador-detail__columns">
            <div className="colaborador-detail__column colaborador-detail__column--main">
              {profileSection}
              {pipoBar}
              {infoList}
              {metricsSection}
              {beneficiosSection}
            </div>
            <div className="colaborador-detail__column colaborador-detail__column--notes">
              {notesSection}
            </div>
          </div>
        ) : (
          <>
            {profileSection}
            {pipoBar}
            {infoList}
            {notesSection}
            {metricsSection}
            {beneficiosSection}
          </>
        )}
      </div>

      {deleteModalOpen && (
        <DeleteColaboradorModal
          name={collaborator.name}
          onCancel={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
        />
      )}

      {desligarModalOpen && (
        <DesligarColaboradorModal
          name={collaborator.name}
          onCancel={() => setDesligarModalOpen(false)}
          onConfirm={handleConfirmDesligar}
        />
      )}
    </PainelLateral>
  )
}

export default ColaboradorDetail
