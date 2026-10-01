import { addDaysIso, buildEmailPrefix } from './formatters.js'
import { generateId } from './storage.js'

// Seed da aba Colaboradores, um colaborador para cada estado da home.
// Nomes, cargos e times vem do Figma da home (10331:4871), sem os erros do
// mock. Os tres ultimos nomes nao estao no Figma: ele nao desenha Rescisao
// pendente nem Fim de contrato.
//
// Toda data e relativa ao dia em que o seed roda, nunca fixa.
//
// CLT tem os campos da pagina nova (CPF, contato, salario, custo, documentos
// e, em alguns, o "Completar cadastro" inteiro). Os PJ ainda gravam os campos
// antigos `contractType` e `desligado`, que a pagina PJ de antes le ate a
// parte 4.

const TODOS_ADMISSAO_CLT = ['contrato_assinado', 'documentos_enviados', 'exame_medico']
const TODOS_ADMISSAO_PJ = ['contrato_assinado']

function clt({ dias, ...dados }) {
  return {
    tipo: 'CLT',
    dataAdmissao: addDaysIso(dados.hoje, dias),
    ...dados,
  }
}

function pj({ dias, ...dados }) {
  return {
    tipo: 'PJ',
    contractType: 'PJ',
    dataInicioContrato: addDaysIso(dados.hoje, dias),
    dataFimContrato: null,
    ...dados,
  }
}

// Dados da pagina CLT por pessoa. Bruno Vasconcelos, Gustavo Lima e Beatriz
// Souza tem o "Completar cadastro" inteiro; Victoria Cardoso fica sem dados
// bancarios e Bruna Teixeira sem time e sem reporta para, para o alerta da
// home aparecer neles.
const CLT = {
  'Marina Ferraz': { cpf: '12434556780', telefone: '11989165456', nascimento: -10960, salario: 9000, custo: 11500 },
  'Rafael Nunes': { cpf: '38291047561', telefone: '11976543210', nascimento: -9500, salario: 4000, custo: 5600 },
  'Bruno Vasconcelos': {
    cpf: '52718364902', telefone: '11991234567', nascimento: -12000, salario: 10000, custo: 12000,
    reportaPara: 'Beatriz Souza',
    dadosBancarios: { banco: 'Nubank', agencia: '0001', tipoConta: 'corrente', numeroConta: '1234567', titular: 'Bruno Vasconcelos', chavePix: '' },
  },
  'Victoria Cardoso': { cpf: '60193847265', telefone: '11982223344', nascimento: -11300, salario: 14000, custo: 17800, reportaPara: 'Beatriz Souza' },
  'Gustavo Lima': {
    cpf: '71829364015', telefone: '11973334455', nascimento: -10200, salario: 7500, custo: 9400,
    reportaPara: 'Bruno Vasconcelos',
    dadosBancarios: { banco: '', agencia: '', tipoConta: 'corrente', numeroConta: '', titular: '', chavePix: 'gustavo.lima@email.com' },
  },
  'Beatriz Souza': {
    cpf: '84920175346', telefone: '11964445566', nascimento: -13800, salario: 16000, custo: 20100,
    reportaPara: 'Victoria Cardoso',
    dadosBancarios: { banco: 'Itaú', agencia: '0412', tipoConta: 'corrente', numeroConta: '98765', titular: 'Beatriz Souza', chavePix: '' },
  },
  'Bruna Teixeira': { cpf: '93017462851', telefone: '11955556677', nascimento: -9100, salario: 6000, custo: 7600 },
  'Lucas Andrade': { cpf: '20475839164', telefone: '11946667788', nascimento: -10500, salario: 8000, custo: 10100 },
  'Pedro Martins': { cpf: '31586940273', telefone: '11937778899', nascimento: -14200, salario: 6500, custo: 8200 },
}

function camposClt(nome, hoje) {
  const dados = CLT[nome]
  if (!dados) throw new Error(`Seed: faltam os dados CLT de "${nome}"`)
  const { cpf, telefone, nascimento, salario, custo, reportaPara = null, dadosBancarios = null } = dados
  return {
    cpf,
    contato: { tipo: 'telefone', valor: telefone },
    dataNascimento: addDaysIso(hoje, nascimento),
    salario,
    custoParaEmpresa: custo,
    reportaPara,
    dadosBancarios,
    // O documento enviado no checklist de admissao (Figma 10338:9576).
    documentoEnviado: 'CNH.png',
    envioContrato: { tipo: 'telefone', valor: telefone },
    contratoGerado: true,
  }
}

export function buildSeedColaboradores(hoje) {
  const registros = [
    clt({
      hoje, dias: 7, name: 'Marina Ferraz', cargo: 'Product Designer Pleno', time: null,
      admissao: { feitos: [] },
    }),
    clt({
      hoje, dias: 3, name: 'Rafael Nunes', cargo: 'Vendedor', time: null,
      admissao: { feitos: ['contrato_assinado'] },
    }),
    pj({
      hoje, dias: 5, name: 'Camila Rocha', cargo: 'Desenvolvedor Frontend', time: null,
      admissao: { feitos: [] },
    }),
    clt({
      hoje, dias: -620, name: 'Bruno Vasconcelos', cargo: 'Product Designer Senior', time: 'Design',
      admissao: { feitos: TODOS_ADMISSAO_CLT },
    }),
    pj({
      hoje, dias: -210, name: 'Gabriel Luz', cargo: 'Consultor de UX', time: 'Design',
      admissao: { feitos: TODOS_ADMISSAO_PJ },
    }),
    clt({
      hoje, dias: -480, name: 'Victoria Cardoso', cargo: 'Head de SocialMedia', time: 'Marketing',
      admissao: { feitos: TODOS_ADMISSAO_CLT },
      ausencia: { tipo: 'ferias', inicio: addDaysIso(hoje, -3), fim: addDaysIso(hoje, 11) },
    }),
    clt({
      hoje, dias: -350, name: 'Gustavo Lima', cargo: 'Ilustrador', time: 'Design',
      admissao: { feitos: TODOS_ADMISSAO_CLT },
      ausencia: { tipo: 'licenca_paternidade', inicio: addDaysIso(hoje, -30), fim: addDaysIso(hoje, 90) },
    }),
    clt({
      hoje, dias: -900, name: 'Beatriz Souza', cargo: 'Coordenadora Comercial', time: 'Vendas',
      admissao: { feitos: TODOS_ADMISSAO_CLT },
      ausencia: { tipo: 'licenca_medica', inicio: addDaysIso(hoje, -1), fim: addDaysIso(hoje, 6) },
    }),
    clt({
      hoje, dias: -150, name: 'Bruna Teixeira', cargo: 'Analista de Marketing', time: null,
      admissao: { feitos: TODOS_ADMISSAO_CLT },
    }),
    clt({
      hoje, dias: -730, name: 'Lucas Andrade', cargo: 'Executivo de Vendas', time: 'Vendas',
      admissao: { feitos: TODOS_ADMISSAO_CLT },
      rescisao: { tipo: 'pedido_demissao', data: addDaysIso(hoje, 10), feitos: ['trct'] },
    }),
    pj({
      hoje, dias: -400, name: 'Renata Prado', cargo: 'Redatora', time: 'Marketing',
      admissao: { feitos: TODOS_ADMISSAO_PJ },
      rescisao: { tipo: null, data: addDaysIso(hoje, 5), feitos: ['termo_enviado'] },
    }),
    clt({
      hoje, dias: -1100, name: 'Pedro Martins', cargo: 'Designer Gráfico', time: 'Design',
      admissao: { feitos: TODOS_ADMISSAO_CLT },
      rescisao: {
        tipo: 'sem_justa_causa',
        data: addDaysIso(hoje, -20),
        feitos: ['trct', 'guia_saque_fgts', 'seguro_desemprego', 'extrato_fgts', 'exame_demissional', 'rescisao_assinada'],
      },
    }),
    pj({
      hoje, dias: -300, name: 'André Moura', cargo: 'Desenvolvedor Backend', time: null,
      admissao: { feitos: TODOS_ADMISSAO_PJ },
      desligado: true,
      rescisao: {
        tipo: null,
        data: addDaysIso(hoje, -12),
        feitos: ['termo_enviado', 'termo_devolvido', 'ultima_nota_fiscal'],
      },
    }),
  ]

  return registros.map(({ hoje: _hoje, cargo, time, ...registro }) => ({
    id: generateId(),
    email: `${buildEmailPrefix(registro.name)}empresa.com`,
    cargos: [cargo],
    times: time ? [time] : [],
    reportaPara: null,
    notas: [],
    rescisao: null,
    ausencia: null,
    dadosBancarios: null,
    ...(registro.tipo === 'CLT' ? camposClt(registro.name, hoje) : {}),
    ...registro,
  }))
}
