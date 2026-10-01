import { useMemo, useState } from 'react'
import TipoContratacaoStep from './TipoContratacaoStep.jsx'
import DiscardConfirmModal from './DiscardConfirmModal.jsx'
import CltNomeStep from './clt/CltNomeStep.jsx'
import CargoStep from './clt/CargoStep.jsx'
import CltInformacoesStep from './clt/CltInformacoesStep.jsx'
import PjInformacoesStep from './clt/PjInformacoesStep.jsx'
import InformacoesContratoPanel from './contrato/InformacoesContratoPanel.jsx'
import EnviarParaSheet from './contrato/EnviarParaSheet.jsx'
import { useToast } from '../toast/ToastContext.jsx'
import { COLLECTIONS, addItem, getCollection } from '../../utils/storage.js'
import { formatAmountFromDigits, formatCurrencyBRL } from '../../utils/formatters.js'
import { SUFIXO_PAGAMENTO } from '../../utils/custos.js'
import {
  cnpjValido,
  contatoValido,
  cpfValido,
  formatarContato,
  formatarDataBr,
  mascaraCnpj,
  mascaraCpf,
} from '../../utils/mascaras.js'

// Passos para a barra de progresso: Tipo, Nome, Cargo, Informações.
const PASSOS = 4
const progresso = (passo) => (passo / PASSOS) * 100

// Espera simulada da geracao do contrato (1 a 2 segundos).
const ESPERA_CONTRATO_MS = 1500

const DADOS_CLT = {
  cpf: null,
  contato: null,
  dataNascimento: null,
  dataAdmissao: null,
  salario: null,
  custoParaEmpresa: null,
}

const DADOS_PJ = {
  cnpj: null,
  razaoSocial: null,
  contato: null,
  dataAdmissao: null,
  dataFimContrato: null,
  semDataFim: false,
  pagamento: 'Mensal',
  valorContrato: null,
}

function valorComCentavos(valor) {
  return formatAmountFromDigits(Math.round(valor * 100).toString())
}

/*
 * Criar colaborador - Figma 10338:11277 (CLT) e 10338:11286 (PJ). Os dois
 * passam por Tipo, Nome, Cargo, Informações e o painel de contrato; muda o
 * passo Informações e as linhas do painel.
 */
function AddCollaboratorFlow({ onExit }) {
  const { showToast } = useToast()
  const [step, setStep] = useState('tipo')
  const [tipo, setTipo] = useState('CLT')
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false)

  const [nome, setNome] = useState('')
  const [cargo, setCargo] = useState('')
  const [dadosClt, setDadosClt] = useState(DADOS_CLT)
  const [dadosPj, setDadosPj] = useState(DADOS_PJ)
  const [painelAberto, setPainelAberto] = useState(false)
  // Enviar para nasce do Contato e pode ser trocado na folha sem mexer nele.
  const [enviarPara, setEnviarPara] = useState(null)
  const [folhaAberta, setFolhaAberta] = useState(false)
  const [gerando, setGerando] = useState(false)

  const ehPj = tipo === 'PJ'
  const dados = ehPj ? dadosPj : dadosClt

  const cargosEmUso = useMemo(
    () => [...new Set(getCollection(COLLECTIONS.COLABORADORES).flatMap((item) => item.cargos ?? []))],
    [],
  )

  const openDiscardConfirm = () => setDiscardConfirmOpen(true)

  const abrirPainel = () => {
    setEnviarPara(contatoValido(dados.contato) ? dados.contato : null)
    setPainelAberto(true)
  }

  // CLT: CPF, data de admissao, salario bruto e Enviar para. PJ: documento,
  // data de admissao, valor e Enviar para.
  const podeGerar = ehPj
    ? cnpjValido(dadosPj.cnpj ?? '') &&
      Boolean(dadosPj.dataAdmissao) &&
      (dadosPj.valorContrato ?? 0) > 0 &&
      contatoValido(enviarPara)
    : cpfValido(dadosClt.cpf ?? '') &&
      Boolean(dadosClt.dataAdmissao) &&
      (dadosClt.salario ?? 0) > 0 &&
      contatoValido(enviarPara)

  const salvar = (contratoGerado) => {
    const comum = {
      tipo,
      name: nome.trim(),
      cargos: cargo ? [cargo] : [],
      times: [],
      email: '',
      reportaPara: null,
      notas: [],
      contato: dados.contato,
      dataAdmissao: dados.dataAdmissao,
      envioContrato: contratoGerado ? enviarPara : null,
      contratoGerado,
      dadosBancarios: null,
      // Entra como Pendente 3/3 (CLT) ou 1/1 (PJ): o checklist de admissao
      // nasce todo aberto.
      admissao: { feitos: [] },
      rescisao: null,
      ausencia: null,
    }
    const especificos = ehPj
      ? {
          cnpj: dadosPj.cnpj,
          razaoSocial: dadosPj.razaoSocial,
          dataFimContrato: dadosPj.dataFimContrato,
          pagamento: dadosPj.pagamento,
          valorContrato: dadosPj.valorContrato,
        }
      : {
          cpf: dadosClt.cpf,
          dataNascimento: dadosClt.dataNascimento,
          salario: dadosClt.salario,
          custoParaEmpresa: dadosClt.custoParaEmpresa,
        }
    addItem(COLLECTIONS.COLABORADORES, { ...comum, ...especificos })
  }

  const salvarSemContrato = () => {
    salvar(false)
    showToast('success', 'Colaborador criado com sucesso')
    onExit()
  }

  const gerarContrato = () => {
    setGerando(true)
    setTimeout(() => {
      salvar(true)
      showToast('success', 'Contrato criado e enviado')
      onExit()
    }, ESPERA_CONTRATO_MS)
  }

  const linhasContrato = ehPj
    ? [
        { rotulo: 'Nome', valor: nome.trim() || null },
        { rotulo: 'Documento', valor: dadosPj.cnpj ? mascaraCnpj(dadosPj.cnpj) : null, sufixo: 'CNPJ' },
        { rotulo: 'Cargo', valor: cargo || null },
        { rotulo: 'Data de admissão', valor: formatarDataBr(dadosPj.dataAdmissao) },
        {
          rotulo: 'Data de fim do contrato',
          valor: dadosPj.dataFimContrato ? formatarDataBr(dadosPj.dataFimContrato) : 'Sem especificar',
        },
        { rotulo: 'Pagamento', valor: dadosPj.pagamento },
        {
          rotulo: 'Valor',
          valor: dadosPj.valorContrato ? valorComCentavos(dadosPj.valorContrato) : null,
          sufixo: SUFIXO_PAGAMENTO[dadosPj.pagamento],
          sufixoPerto: true,
        },
      ]
    : [
        { rotulo: 'Nome', valor: nome.trim() || null },
        { rotulo: 'Documento', valor: dadosClt.cpf ? mascaraCpf(dadosClt.cpf) : null, sufixo: 'CPF' },
        { rotulo: 'Data de nascimento', valor: formatarDataBr(dadosClt.dataNascimento) },
        { rotulo: 'Cargo', valor: cargo || null },
        { rotulo: 'Salário bruto', valor: dadosClt.salario ? formatCurrencyBRL(dadosClt.salario) : null },
        { rotulo: 'Data de admissão', valor: formatarDataBr(dadosClt.dataAdmissao) },
      ]

  const passoInformacoes = {
    dados,
    progress: progresso(4),
    onBack: () => setStep('cargo'),
    onClose: openDiscardConfirm,
    onContinue: abrirPainel,
  }

  return (
    <>
      {step === 'tipo' && (
        <TipoContratacaoStep
          onChoose={(escolhido) => {
            setTipo(escolhido)
            setStep('nome')
          }}
          onExit={openDiscardConfirm}
        />
      )}

      {step === 'nome' && (
        <CltNomeStep
          name={nome}
          onNameChange={setNome}
          progress={progresso(2)}
          onBack={() => setStep('tipo')}
          onClose={openDiscardConfirm}
          onContinue={() => setStep('cargo')}
        />
      )}

      {step === 'cargo' && (
        <CargoStep
          name={nome.trim()}
          cargosEmUso={cargosEmUso}
          initialCargo={cargo}
          progress={progresso(3)}
          onBack={() => setStep('nome')}
          onClose={openDiscardConfirm}
          onSkip={() => {
            setCargo('')
            setStep('info')
          }}
          onContinue={(valor) => {
            setCargo(valor)
            setStep('info')
          }}
        />
      )}

      {step === 'info' && !ehPj && <CltInformacoesStep {...passoInformacoes} onChange={setDadosClt} />}
      {step === 'info' && ehPj && <PjInformacoesStep {...passoInformacoes} onChange={setDadosPj} />}

      {step === 'info' && (
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

      {discardConfirmOpen && (
        <DiscardConfirmModal onCancel={() => setDiscardConfirmOpen(false)} onConfirm={onExit} />
      )}
    </>
  )
}

export default AddCollaboratorFlow
