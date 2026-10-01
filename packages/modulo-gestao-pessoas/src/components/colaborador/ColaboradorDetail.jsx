import { useEffect, useRef, useState } from 'react'
import { NotePencil, Power, FrameCorners } from '@phosphor-icons/react'
import closeIcon from '../../assets/icons/Close.svg'
import trashIcon from '../../assets/icons/Trash.svg'
import backToModalIcon from '../../assets/icons/Back-to-Modal.svg'
import { IconButton, PainelLateral } from '@squad/ui'
import DeleteColaboradorModal from './DeleteColaboradorModal.jsx'
import DesligarColaboradorModal from './DesligarColaboradorModal.jsx'
import PerfilColaborador from './perfil/PerfilColaborador.jsx'
import { perfilTravado } from '../../utils/cadastro.js'
import { COLLECTIONS, addItem, getCollection, setCollection } from '../../utils/storage.js'
import { formatDateDMonthYear } from '../../utils/formatters.js'
import { useToast } from '../toast/ToastContext.jsx'
import './ColaboradorDetail.css'

/*
 * Pagina do colaborador. Aqui fica a casca - painel, tela cheia, cabecalho,
 * barra do Pipo e notas -, e o conteudo do Figma (CLT e PJ) fica em
 * perfil/PerfilColaborador.
 */
function ColaboradorDetail({ id, mode, aberto, onClose, onExpand, onCollapse, onDataChanged }) {
  const { showToast } = useToast()
  const [collaborators, setCollaborators] = useState(() => getCollection(COLLECTIONS.COLABORADORES))
  const times = getCollection(COLLECTIONS.TIMES)
  const recursos = getCollection(COLLECTIONS.BENEFICIOS)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [desligarModalOpen, setDesligarModalOpen] = useState(false)
  const [addingNota, setAddingNota] = useState(false)
  const [notaText, setNotaText] = useState('')
  const notaSavingRef = useRef(false)

  /*
   * O painel fica montado enquanto a saida anima (o PainelLateral so o tira
   * do DOM no fim da transicao), entao nem o estado local nem os dados lidos
   * do storage se reiniciam sozinhos a cada abertura. Releia e zere aqui, na
   * subida de `aberto`.
   */
  useEffect(() => {
    if (!aberto) return
    setCollaborators(getCollection(COLLECTIONS.COLABORADORES))
    setDeleteModalOpen(false)
    setDesligarModalOpen(false)
    setAddingNota(false)
    setNotaText('')
  }, [aberto])

  const collaborator = collaborators.find((item) => item.id === id) ?? null
  if (!collaborator) return null

  const desligado = Boolean(collaborator.desligado)

  const persist = (updatedList) => {
    setCollection(COLLECTIONS.COLABORADORES, updatedList)
    setCollaborators(updatedList)
    onDataChanged?.(updatedList)
  }

  const updateField = (field, value) => {
    persist(collaborators.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleDelete = () => {
    const updated = collaborators.filter((item) => item.id !== id)
    setCollection(COLLECTIONS.COLABORADORES, updated)
    onDataChanged?.(updated)
    showToast('danger', 'Colaborador excluído com sucesso')
    onClose()
  }

  // Ponte ate o fluxo de desligamento: o Desligar marca `desligado` e trava
  // os campos. Reativar nao existe mais.
  const handleConfirmDesligar = () => {
    updateField('desligado', true)
    setDesligarModalOpen(false)
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

  const pipoBar = (
    <p className="colaborador-detail__pipo-bar">
      <span>Peça ao Pipo para</span>
      <strong>Resumir perfil,</strong>
      <strong>Redigir mensagem</strong>
      <span>ou</span>
      <strong>Comparar cargo</strong>
    </p>
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
        <button type="button" className="colaborador-detail__add-nota" onClick={() => setAddingNota(true)}>
          <NotePencil size={20} color="var(--color-text-secondary)" />
          Adicionar nota
        </button>
      )}
    </div>
  )

  /*
   * A casca (veu, painel de 540, deslize de 280ms) e o @squad/ui/PainelLateral.
   * O modo tela cheia anima largura, posicao e padding no MESMO elemento do
   * modo painel, entao entra como classe extra.
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
        onClick={() => setDesligarModalOpen(true)}
        disabled={desligado}
        aria-label="Desligar"
      >
        <Power size={24} weight={desligado ? 'fill' : 'regular'} />
      </button>
      {mode === 'full' ? (
        <button type="button" className="icon-button colaborador-detail__expand-button" onClick={onCollapse} aria-label="Recolher">
          <img src={backToModalIcon} alt="" width={24} height={24} />
        </button>
      ) : (
        <button type="button" className="icon-button colaborador-detail__expand-button" onClick={onExpand} aria-label="Expandir">
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
        <PerfilColaborador
          colaborador={collaborator}
          colaboradores={collaborators}
          times={times}
          recursos={recursos}
          travado={perfilTravado(collaborator)}
          mode={mode}
          pipoBar={pipoBar}
          notas={notesSection}
          onAtualizar={updateField}
          onCriarTime={(nome) => addItem(COLLECTIONS.TIMES, { name: nome, pending: true })}
        />
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
