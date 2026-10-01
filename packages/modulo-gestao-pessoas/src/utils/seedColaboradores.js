import { addDaysIso, buildEmailPrefix } from './formatters.js'
import { generateId } from './storage.js'

// Seed da aba Colaboradores, um colaborador para cada estado da home.
// Nomes, cargos e times vem do Figma da home (10331:4871), sem os erros do
// mock. Bruna Teixeira, Lucas Andrade, Renata Prado e Andre Moura nao estao no
// Figma; eles cobrem Em desligamento e Fim de contrato.
//
// Toda data e relativa ao dia em que o seed roda, nunca fixa.
//
// CLT e PJ tem os campos da pagina (documento, contato, valores, documentos
// e, em alguns, o "Completar cadastro" inteiro).

const TODOS_ADMISSAO_CLT = ['contrato_assinado', 'documentos_enviados', 'exame_medico']
const TODOS_ADMISSAO_PJ = ['contrato_assinado']

// Jornada de trabalho mockada ate o Opy existir (Figma 10355:3750).
const JORNADA_COMERCIAL = {
  diasSemana: 'SEG, TER, QUA, QUI, SEX',
  horario: '9:00 - 18:00',
  almoco: '12:00 - 13:00',
  cargaDiaria: '8h',
  cargaSemanal: '40h',
  regime: 'Híbrido',
  homeOffice: 'TER, QUI',
}

const JORNADA_PRESENCIAL = {
  diasSemana: 'SEG, TER, QUA, QUI, SEX',
  horario: '8:00 - 17:00',
  almoco: '12:00 - 13:00',
  cargaDiaria: '8h',
  cargaSemanal: '40h',
  regime: 'Presencial',
  homeOffice: '—',
}

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
    dataAdmissao: addDaysIso(dados.hoje, dias),
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
    // Estado salvo do Figma 10355:3778, com a chave PIX no CPF.
    dadosBancarios: { banco: 'Nubank', agencia: '0001', tipoConta: 'corrente', numeroConta: '12345-67', titular: 'Bruno Vasconcelos', chavePix: '52718364902' },
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

// Dados da pagina PJ por pessoa. Gabriel Luz tem o "Completar cadastro"
// inteiro; Camila Rocha e temporaria (com data de fim).
const PJ = {
  'Camila Rocha': {
    cnpj: '12345678000190', razaoSocial: 'Camila Rocha Tecnologia', telefone: '11928889900',
    pagamento: 'Mensal', valor: 9000, fim: 180,
  },
  'Gabriel Luz': {
    cnpj: '23456789000101', razaoSocial: 'Luz Design', telefone: '11919990011',
    pagamento: 'Mensal', valor: 12000, fim: null,
    reportaPara: 'Bruno Vasconcelos',
    dadosBancarios: { banco: 'Inter', agencia: '0001', tipoConta: 'corrente', numeroConta: '7654321', titular: 'Luz Design', chavePix: '' },
  },
  'Renata Prado': {
    cnpj: '34567890000112', razaoSocial: 'Prado Conteúdo', telefone: '11901112233',
    pagamento: 'Anual', valor: 96000, fim: null,
  },
  'André Moura': {
    cnpj: '45678901000123', razaoSocial: 'Moura Sistemas', telefone: '11992223344',
    pagamento: 'Valor fixo', valor: 30000, fim: -12,
  },
}

function camposPj(nome, hoje) {
  const dados = PJ[nome]
  if (!dados) throw new Error(`Seed: faltam os dados PJ de "${nome}"`)
  const { cnpj, razaoSocial, telefone, pagamento, valor, fim, reportaPara = null, dadosBancarios = null } = dados
  return {
    cnpj,
    razaoSocial,
    contato: { tipo: 'telefone', valor: telefone },
    pagamento,
    valorContrato: valor,
    dataFimContrato: fim == null ? null : addDaysIso(hoje, fim),
    reportaPara,
    dadosBancarios,
    envioContrato: { tipo: 'telefone', valor: telefone },
    contratoGerado: true,
  }
}

// Desligamento ja iniciado pelo fluxo, com o termo gerado e enviado.
function rescisao(hoje, { tipo, dias, avisoPrevio = null, multa = null, feitos }) {
  return {
    tipo,
    data: addDaysIso(hoje, dias),
    avisoPrevio,
    motivo: null,
    multa,
    envio: null,
    termoGerado: true,
    feitos,
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
      jornada: JORNADA_COMERCIAL,
    }),
    pj({
      hoje, dias: -210, name: 'Gabriel Luz', cargo: 'Consultor de UX', time: 'Design',
      admissao: { feitos: TODOS_ADMISSAO_PJ },
    }),
    clt({
      hoje, dias: -480, name: 'Victoria Cardoso', cargo: 'Head de SocialMedia', time: 'Marketing',
      admissao: { feitos: TODOS_ADMISSAO_CLT },
      ausencia: { tipo: 'ferias', inicio: addDaysIso(hoje, -3), fim: addDaysIso(hoje, 11) },
      jornada: JORNADA_COMERCIAL,
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
      jornada: JORNADA_PRESENCIAL,
    }),
    clt({
      hoje, dias: -150, name: 'Bruna Teixeira', cargo: 'Analista de Marketing', time: null,
      admissao: { feitos: TODOS_ADMISSAO_CLT },
    }),
    clt({
      hoje, dias: -730, name: 'Lucas Andrade', cargo: 'Executivo de Vendas', time: 'Vendas',
      admissao: { feitos: TODOS_ADMISSAO_CLT },
      // Pedido de demissao: 4 itens, 1 feito, Pendente 3/4.
      rescisao: rescisao(hoje, {
        tipo: 'pedido_demissao', dias: 10, avisoPrevio: 'trabalhado', feitos: ['assinar_termo'],
      }),
    }),
    pj({
      hoje, dias: -400, name: 'Renata Prado', cargo: 'Redatora', time: 'Marketing',
      admissao: { feitos: TODOS_ADMISSAO_PJ },
      // 3 itens, 1 feito, Pendente 2/3.
      rescisao: rescisao(hoje, {
        tipo: 'antecipada_empresa', dias: 5, multa: 8000, feitos: ['assinar_termo'],
      }),
    }),
    clt({
      hoje, dias: -1100, name: 'Pedro Martins', cargo: 'Designer Gráfico', time: 'Design',
      admissao: { feitos: TODOS_ADMISSAO_CLT },
      rescisao: rescisao(hoje, {
        tipo: 'sem_justa_causa',
        dias: -20,
        avisoPrevio: 'indenizado',
        feitos: ['assinar_termo', 'guia_saque_fgts', 'extrato_fgts', 'exame_demissional', 'termo_devolvido'],
      }),
    }),
    pj({
      hoje, dias: -300, name: 'André Moura', cargo: 'Desenvolvedor Backend', time: null,
      admissao: { feitos: TODOS_ADMISSAO_PJ },
      rescisao: rescisao(hoje, {
        tipo: 'fim_contrato', dias: -12, feitos: ['assinar_termo', 'pagamentos_pendentes', 'termo_devolvido'],
      }),
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
    jornada: null,
    ...(registro.tipo === 'CLT' ? camposClt(registro.name, hoje) : camposPj(registro.name, hoje)),
    ...registro,
  }))
}
