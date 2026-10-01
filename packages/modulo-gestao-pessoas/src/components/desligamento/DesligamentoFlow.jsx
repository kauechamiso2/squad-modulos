import { useState } from 'react'
import CartoesStep from '../addRecurso/CartoesStep.jsx'
import DiscardConfirmModal from '../addCollaborator/DiscardConfirmModal.jsx'
import InformacoesContratoPanel from '../addCollaborator/contrato/InformacoesContratoPanel.jsx'
import EnviarParaSheet from '../addCollaborator/contrato/EnviarParaSheet.jsx'
import DesligamentoInfoStep from './DesligamentoInfoStep.jsx'
import { useToast } from '../toast/ToastContext.jsx'
import { COLLECTIONS, getCollection, setCollection } from '../../utils/storage.js'
import { AVISOS_PREVIOS, podeDesligar, tiposDeRescisao } from '../../utils/colaboradorStatus.js'
import { formatCurrencyBRL, formatDateDMonthYear } from '../../utils/formatters.js'
import { contatoValido, formatarContato, mascaraCnpj, mascaraCpf } from '../../utils/mascaras.js'
import fileXIcon from '../../assets/icons/FileX.svg'
import sirenIcon from '../../assets/icons/Siren.svg'
import handWavingIcon from '../../assets/icons/HandWaving.svg'
import handshakeIcon from '../../assets/icons/Handshake.svg'
import hourglassHighIcon from '../../assets/icons/HourglassHigh.svg'
import doorOpenIcon from '../../assets/icons/DoorOpen.svg'

// Passos para a barra de progresso: Tipo de rescisão e Informações.
const PASSOS = 2
const progresso = (passo) => (passo / PASSOS) * 100

// Espera simulada da geracao do termo (1 a 2 segundos), como a do contrato.
const ESPERA_TERMO_MS = 1500

// Icones dos cards, com o nome das layers do Figma (10355:4796, 10355:7761).
const ICONES = {
  CLT: {
    sem_justa_causa: fileXIcon,
    com_justa_causa: sirenIcon,
    pedido_demissao: handWavingIcon,
    acordo: handshakeIcon,
    fim_contrato_experiencia: hourglassHighIcon,
  },
  PJ: {
    fim_contrato: fileXIcon,
    antecipada_empresa: doorOpenIcon,
    antecipada_prestador: handWavingIcon,
    acordo: handshakeIcon,
  },
}

const SEM_AVISO = ['com_justa_causa']

function Badge({ icone }) {
  return (
    <span className="recurso-badge recurso-badge--amarelo" style={{ width: 56, height: 56 }}>
      <img src={icone} width={24} height={24} alt="" />
    </span>
  )
}

/*
 * Desligamento - Figma 10355:3451 (CLT) e 10355:5041 (PJ). Abre pelo modal
 * "Desligar {Nome}?". Tipo de rescisão, Informações e o painel do termo; os
 * dois botoes do painel gravam o desligamento e voltam para a tabela, com a
 * pessoa Em desligamento.
 */
function DesligamentoFlow({ colaboradorId, onExit }) {
  const { showToast } = useToast()
  const [colaborador] = useState(() => {
    const encontrado = getCollection(COLLECTIONS.COLABORADORES).find((item) => item.id === colaboradorId)
    if (!encontrado) throw new Error(`Desligamento: colaborador ${colaboradorId} não existe`)
    if (!podeDesligar(encontrado)) throw new Error(`Desligamento: ${encontrado.name} já está em desligamento ou desligado`)
    return encontrado
  })
  const ehPj = colaborador.tipo === 'PJ'
  const tipos = tiposDeRescisao(colaborador.tipo)

  const [step, setStep] = useState('tipo')
  const [dados, setDados] = useState({ tipo: null, data: null, avisoPrevio: null, motivo: null, multa: null })
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false)
  const [painelAberto, setPainelAberto] = useState(false)
  const [enviarPara, setEnviarPara] = useState(null)
  const [folhaAberta, setFolhaAberta] = useState(false)
  const [gerando, setGerando] = useState(false)

  const abrirDescarte = () => setDiscardConfirmOpen(true)

  const escolherTipo = (tipo) => {
    // Trocar de tipo mantem o resto; o aviso previo nasce em Trabalhado e
    // some em Com justa causa.
    const avisoPrevio = ehPj || SEM_AVISO.includes(tipo) ? null : (dados.avisoPrevio ?? 'trabalhado')
    setDados({ ...dados, tipo, avisoPrevio })
    setStep('info')
  }

  const abrirPainel = () => {
    setEnviarPara(contatoValido(colaborador.contato) ? colaborador.contato : null)
    setPainelAberto(true)
  }

  const salvar = (termoGerado) => {
    const lista = getCollection(COLLECTIONS.COLABORADORES)
    const rescisao = {
      tipo: dados.tipo,
      data: dados.data,
      avisoPrevio: ehPj ? null : dados.avisoPrevio,
      motivo: dados.motivo,
      multa: ehPj ? dados.multa : null,
      envio: termoGerado ? enviarPara : null,
      termoGerado,
      feitos: [],
    }
    setCollection(
      COLLECTIONS.COLABORADORES,
      lista.map((item) => (item.id === colaborador.id ? { ...item, rescisao } : item)),
    )
    showToast('success', 'Desligamento iniciado com sucesso')
    onExit({ desligado: true })
  }

  const gerarEEnviar = () => {
    setGerando(true)
    setTimeout(() => salvar(true), ESPERA_TERMO_MS)
  }

  const documento = ehPj
    ? { rotulo: 'Documento', valor: colaborador.cnpj ? mascaraCnpj(colaborador.cnpj) : null, sufixo: 'CNPJ' }
    : { rotulo: 'Documento', valor: colaborador.cpf ? mascaraCpf(colaborador.cpf) : null, sufixo: 'CPF' }
  const linhasTermo = [
    { rotulo: 'Nome', valor: colaborador.name },
    documento,
    { rotulo: 'Tipo de rescisão', valor: dados.tipo ? tipos[dados.tipo].rotulo : null },
    { rotulo: 'Data do desligamento', valor: dados.data ? formatDateDMonthYear(dados.data) : null },
    ehPj
      ? { rotulo: 'Multa por rescisão antecipada', valor: dados.multa ? formatCurrencyBRL(dados.multa) : null }
      : { rotulo: 'Aviso prévio', valor: dados.avisoPrevio ? AVISOS_PREVIOS[dados.avisoPrevio] : null },
  ]

  return (
    <>
      {step === 'tipo' && (
        <CartoesStep
          tituloFluxo="Desligamento"
          titulo={
            <>
              Qual o tipo de rescisão
              <br />
              de <span className="clt-shell__destaque">{colaborador.name}</span>?
            </>
          }
          cartoes={Object.entries(tipos).map(([id, tipo]) => ({
            id,
            rotulo: tipo.rotulo,
            marca: <Badge icone={ICONES[colaborador.tipo][id]} />,
          }))}
          onEscolher={escolherTipo}
          onClose={abrirDescarte}
        />
      )}

      {step === 'info' && (
        <DesligamentoInfoStep
          tipoContrato={colaborador.tipo}
          dados={dados}
          onChange={setDados}
          progress={progresso(2)}
          onBack={() => setStep('tipo')}
          onClose={abrirDescarte}
          onContinue={abrirPainel}
        />
      )}

      {step === 'info' && (
        <InformacoesContratoPanel
          titulo="Informações para termo de rescisão"
          rotuloSalvarSem="Salvar sem termo"
          rotuloGerar="Gerar e enviar"
          aberto={painelAberto}
          linhas={linhasTermo}
          enviarPara={formatarContato(enviarPara)}
          onEditarEnviarPara={() => setFolhaAberta(true)}
          podeGerar={contatoValido(enviarPara)}
          gerando={gerando}
          onFechar={() => setPainelAberto(false)}
          onSalvarSemContrato={() => salvar(false)}
          onGerarContrato={gerarEEnviar}
        />
      )}

      {folhaAberta && (
        <EnviarParaSheet
          valor={enviarPara}
          onFechar={() => setFolhaAberta(false)}
          onSalvar={(contato) => {
            setEnviarPara(contato)
            setFolhaAberta(false)
          }}
        />
      )}

      {discardConfirmOpen && (
        <DiscardConfirmModal onCancel={() => setDiscardConfirmOpen(false)} onConfirm={() => onExit({ desligado: false })} />
      )}
    </>
  )
}

export default DesligamentoFlow
