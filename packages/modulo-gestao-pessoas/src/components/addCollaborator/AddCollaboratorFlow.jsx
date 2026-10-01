import { useMemo, useState } from 'react'
import TipoContratacaoStep from './TipoContratacaoStep.jsx'
import DiscardConfirmModal from './DiscardConfirmModal.jsx'
import CltNomeStep from './clt/CltNomeStep.jsx'
import CargoStep from './clt/CargoStep.jsx'
import CltInformacoesStep from './clt/CltInformacoesStep.jsx'
import CltCargoTimeStep from './clt/CltCargoTimeStep.jsx'
import CltInfoStep from './clt/CltInfoStep.jsx'
import InformacoesContratoPanel from './contrato/InformacoesContratoPanel.jsx'
import EnviarParaSheet from './contrato/EnviarParaSheet.jsx'
import { useToast } from '../toast/ToastContext.jsx'
import { COLLECTIONS, addItem, getCollection } from '../../utils/storage.js'
import { formatCurrencyBRL } from '../../utils/formatters.js'
import { contatoValido, cpfValido, formatarContato, formatarDataBr, mascaraCpf } from '../../utils/mascaras.js'

// Passos do CLT para a barra de progresso: Tipo, Nome, Cargo, Informações.
const PASSOS_CLT = 4
const progresso = (passo) => (passo / PASSOS_CLT) * 100

// Espera simulada da geracao do contrato (1 a 2 segundos).
const ESPERA_CONTRATO_MS = 1500

const DADOS_VAZIOS = {
  cpf: null,
  contato: null,
  dataNascimento: null,
  dataAdmissao: null,
  salario: null,
  custoParaEmpresa: null,
}

/*
 * Criar colaborador - Figma 10338:11277. O CLT segue o Figma: Tipo, Nome,
 * Cargo, Informações e o painel de contrato. O PJ ainda segue o caminho de
 * antes ate a Parte 4 (CltCargoTimeStep e CltInfoStep).
 */
function AddCollaboratorFlow({ onExit }) {
  const { showToast } = useToast()
  const [step, setStep] = useState('tipo')
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false)

  const [nome, setNome] = useState('')
  const [cargo, setCargo] = useState('')
  const [dados, setDados] = useState(DADOS_VAZIOS)
  const [painelAberto, setPainelAberto] = useState(false)
  // Enviar para nasce do Contato e pode ser trocado na folha sem mexer nele.
  const [enviarPara, setEnviarPara] = useState(null)
  const [folhaAberta, setFolhaAberta] = useState(false)
  const [gerando, setGerando] = useState(false)

  // Caminho PJ de hoje (ponte ate a Parte 4).
  const [pjCargo, setPjCargo] = useState('')
  const [pjTeam, setPjTeam] = useState('')

  const cargosEmUso = useMemo(
    () => [...new Set(getCollection(COLLECTIONS.COLABORADORES).flatMap((item) => item.cargos ?? []))],
    [],
  )

  const openDiscardConfirm = () => setDiscardConfirmOpen(true)

  const abrirPainel = () => {
    setEnviarPara(contatoValido(dados.contato) ? dados.contato : null)
    setPainelAberto(true)
  }

  const podeGerar =
    cpfValido(dados.cpf ?? '') &&
    Boolean(dados.dataAdmissao) &&
    (dados.salario ?? 0) > 0 &&
    contatoValido(enviarPara)

  const salvarClt = (contratoGerado) => {
    addItem(COLLECTIONS.COLABORADORES, {
      tipo: 'CLT',
      name: nome.trim(),
      cargos: cargo ? [cargo] : [],
      times: [],
      email: '',
      reportaPara: null,
      notas: [],
      cpf: dados.cpf,
      contato: dados.contato,
      dataNascimento: dados.dataNascimento,
      dataAdmissao: dados.dataAdmissao,
      salario: dados.salario,
      custoParaEmpresa: dados.custoParaEmpresa,
      envioContrato: contratoGerado ? enviarPara : null,
      contratoGerado,
      dadosBancarios: null,
      documentos: [],
      // Entra como Pendente 3/3: o checklist de admissao nasce todo aberto.
      admissao: { feitos: [] },
      rescisao: null,
      ausencia: null,
    })
  }

  const salvarSemContrato = () => {
    salvarClt(false)
    showToast('success', 'Colaborador criado com sucesso')
    onExit()
  }

  const gerarContrato = () => {
    setGerando(true)
    setTimeout(() => {
      salvarClt(true)
      showToast('success', 'Contrato criado e enviado')
      onExit()
    }, ESPERA_CONTRATO_MS)
  }

  const linhasContrato = [
    { rotulo: 'Nome', valor: nome.trim() || null },
    { rotulo: 'Documento', valor: dados.cpf ? mascaraCpf(dados.cpf) : null, sufixo: 'CPF' },
    { rotulo: 'Data de nascimento', valor: formatarDataBr(dados.dataNascimento) },
    { rotulo: 'Cargo', valor: cargo || null },
    { rotulo: 'Salário bruto', valor: dados.salario ? formatCurrencyBRL(dados.salario) : null },
    { rotulo: 'Data de admissão', valor: formatarDataBr(dados.dataAdmissao) },
  ]

  return (
    <>
      {step === 'tipo' && (
        <TipoContratacaoStep
          onChoose={(tipo) => setStep(tipo === 'CLT' ? 'clt-nome' : 'pj-nome')}
          onExit={openDiscardConfirm}
        />
      )}

      {step === 'clt-nome' && (
        <CltNomeStep
          name={nome}
          onNameChange={setNome}
          progress={progresso(2)}
          onBack={() => setStep('tipo')}
          onClose={openDiscardConfirm}
          onContinue={() => setStep('clt-cargo')}
        />
      )}

      {step === 'clt-cargo' && (
        <CargoStep
          name={nome.trim()}
          cargosEmUso={cargosEmUso}
          initialCargo={cargo}
          progress={progresso(3)}
          onBack={() => setStep('clt-nome')}
          onClose={openDiscardConfirm}
          onSkip={() => {
            setCargo('')
            setStep('clt-info')
          }}
          onContinue={(valor) => {
            setCargo(valor)
            setStep('clt-info')
          }}
        />
      )}

      {step === 'clt-info' && (
        <CltInformacoesStep
          dados={dados}
          onChange={setDados}
          progress={progresso(4)}
          onBack={() => setStep('clt-cargo')}
          onClose={openDiscardConfirm}
          onContinue={abrirPainel}
        />
      )}

      {step === 'clt-info' && (
        <InformacoesContratoPanel
          aberto={painelAberto}
          linhas={linhasContrato}
          enviarPara={formatarContato(enviarPara)}
          onEditarEnviarPara={() => setFolhaAberta(true)}
          podeGerar={podeGerar}
          gerando={gerando}
          onFechar={() => setPainelAberto(false)}
          onSalvarSemContrato={salvarSemContrato}
          onGerarContrato={gerarContrato}
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

      {step === 'pj-nome' && (
        <CltNomeStep
          name={nome}
          onNameChange={setNome}
          progress={33}
          onBack={() => setStep('tipo')}
          onClose={openDiscardConfirm}
          onContinue={() => setStep('pj-cargo-time')}
        />
      )}

      {step === 'pj-cargo-time' && (
        <CltCargoTimeStep
          name={nome}
          initialCargo={pjCargo}
          initialTeam={pjTeam}
          onBack={() => setStep('pj-nome')}
          onClose={openDiscardConfirm}
          onSkip={() => {
            setPjCargo('')
            setPjTeam('')
            setStep('pj-info')
          }}
          onContinue={(cargoName, teamName) => {
            setPjCargo(cargoName)
            setPjTeam(teamName)
            setStep('pj-info')
          }}
        />
      )}

      {step === 'pj-info' && (
        <CltInfoStep
          name={nome}
          cargoName={pjCargo}
          teamName={pjTeam}
          contractType="PJ"
          onBack={() => setStep('pj-cargo-time')}
          onClose={openDiscardConfirm}
          onCreate={() => {
            showToast('success', 'Colaborador criado com sucesso')
            onExit()
          }}
        />
      )}

      {discardConfirmOpen && (
        <DiscardConfirmModal onCancel={() => setDiscardConfirmOpen(false)} onConfirm={onExit} />
      )}
    </>
  )
}

export default AddCollaboratorFlow
