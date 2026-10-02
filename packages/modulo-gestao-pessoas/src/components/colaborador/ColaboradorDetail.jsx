import { useEffect, useState } from 'react'
import DetalheShell, { CabecalhoDetalhe } from '../detalhe/DetalheShell.jsx'
import CamadaDetalhe from '../detalhe/CamadaDetalhe.jsx'
import DeleteColaboradorModal from './DeleteColaboradorModal.jsx'
import DesligarColaboradorModal from './DesligarColaboradorModal.jsx'
import PerfilColaborador from './perfil/PerfilColaborador.jsx'
import { perfilTravado } from '../../utils/cadastro.js'
import { STATUS, getStatus, marcarItemDaRescisao, podeDesligar } from '../../utils/colaboradorStatus.js'
import { COLLECTIONS, addItem, getCollection, setCollection } from '../../utils/storage.js'
import { novaNota } from '../../utils/notas.js'
import { useToast } from '../toast/ToastContext.jsx'
import '../status/StatusPill.css'
import './ColaboradorDetail.css'

/*
 * Pagina do colaborador - Figma 10355:1842 (painel) e 10355:2085 (tela
 * cheia). A casca e a do DetalheShell; o conteudo fica em
 * perfil/PerfilColaborador.
 */
function ColaboradorDetail({ id, mode, aberto, onClose, onExpand, onCollapse, onDataChanged, onDesligar, onAbrirRecurso }) {
  const { showToast } = useToast()
  const [collaborators, setCollaborators] = useState(() => getCollection(COLLECTIONS.COLABORADORES))
  const times = getCollection(COLLECTIONS.TIMES)
  const recursos = getCollection(COLLECTIONS.BENEFICIOS)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [desligarModalOpen, setDesligarModalOpen] = useState(false)

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
  }, [aberto])

  const collaborator = collaborators.find((item) => item.id === id) ?? null
  if (!collaborator) return null

  const status = getStatus(collaborator)
  // Pilula do cabecalho: vermelha em Em desligamento e Desligado (Figma
  // 10355:4133), cinza em Fim de contrato. Sem Figma para os dois ultimos:
  // premissa do contexto, o status final no cabecalho.
  const pilulaCabecalho = {
    [STATUS.EM_DESLIGAMENTO]: 'desligado',
    [STATUS.DESLIGADO]: 'desligado',
    [STATUS.FIM_DE_CONTRATO]: 'fim_de_contrato',
  }[status.id]

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

  // Confirmar o modal abre o fluxo de desligamento, que fica na home.
  const handleConfirmDesligar = () => {
    setDesligarModalOpen(false)
    onDesligar(id)
  }

  const marcarComoFeito = (itemId) => {
    persist(collaborators.map((item) => (item.id === id ? marcarItemDaRescisao(item, itemId) : item)))
  }

  const adicionarNota = (texto) => updateField('notas', [...(collaborator.notas ?? []), novaNota(texto)])

  const pipoBar = (
    <p className="colaborador-detail__pipo-bar">
      <span>Peça ao Pipo para</span>
      <strong>Resumir perfil,</strong>
      <strong>Redigir mensagem</strong>
      <span>ou</span>
      <strong>Comparar cargo</strong>
    </p>
  )

  const conteudo = (parte) => (
    <PerfilColaborador
      parte={parte}
      colaborador={collaborator}
      colaboradores={collaborators}
      times={times}
      recursos={recursos}
      travado={perfilTravado(collaborator)}
      pipoBar={pipoBar}
      onAtualizar={updateField}
      onAdicionarNota={adicionarNota}
      onMarcarComoFeito={marcarComoFeito}
      onAbrirRecurso={onAbrirRecurso}
      onCriarTime={(nome) => addItem(COLLECTIONS.TIMES, { name: nome, pending: true })}
    />
  )

  return (
    <DetalheShell
      aberto={aberto}
      mode={mode}
      className="colaborador-detail"
      titulo={
        <>
          Colaborador
          {pilulaCabecalho && <span className={`status-pill status-pill--${pilulaCabecalho}`}>{status.rotulo}</span>}
        </>
      }
      acoes={
        <CabecalhoDetalhe
          mode={mode}
          onExcluir={() => setDeleteModalOpen(true)}
          /* Some depois do desligamento iniciado (Figma 10355:4133). */
          onDesligar={podeDesligar(collaborator) ? () => setDesligarModalOpen(true) : undefined}
          onExpandir={onExpand}
          onRecolher={onCollapse}
        />
      }
      onClose={onClose}
      painel={mode === 'full' ? null : conteudo('painel')}
      esquerda={mode === 'full' ? conteudo('esquerda') : null}
      direita={mode === 'full' ? conteudo('direita') : null}
    >
      <CamadaDetalhe>
        {deleteModalOpen && (
          <DeleteColaboradorModal
            name={collaborator.name}
            onCancel={() => setDeleteModalOpen(false)}
            onConfirm={handleDelete}
          />
        )}
      </CamadaDetalhe>

      {desligarModalOpen && (
        <DesligarColaboradorModal
          name={collaborator.name}
          onCancel={() => setDesligarModalOpen(false)}
          onConfirm={handleConfirmDesligar}
        />
      )}
    </DetalheShell>
  )
}

export default ColaboradorDetail
