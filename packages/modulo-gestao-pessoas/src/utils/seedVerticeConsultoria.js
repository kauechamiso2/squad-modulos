import { addDaysIso } from './formatters.js'
import { generateId } from './storage.js'

/*
 * Cenario de teste Vertice Consultoria (docs/cenario-vertice-consultoria.md):
 * empresa ficticia para testes com usuarios, com 19 colaboradores, 5 times e
 * 7 recursos. O dia da carga e o D0: as datas da tabela "Date handling" sao
 * D0 mais o offset; as historicas (12 Mar 2018) ficam fixas.
 *
 * Adaptacoes ao modelo atual (contexto, "Seed and reset"):
 * - "Rescisao pendente" e "Em desligamento", e o checklist CLT de Sem justa
 *   causa tem 5 itens: Ricardo fica 3/5 e Marcelo 2/3.
 * - Times completos, com a familia de cor mais proxima da paleta de 36 e o
 *   icone do seletor (CurrencyCircleDollar nao existe nele: Financeiro usa
 *   Coin).
 * - As licencas entram como "Outro" com o nome; o fornecedor fica gravado,
 *   sem logo.
 * - Datas sem campo na tela (contrato gerado, contrato assinado, termo
 *   gerado) ficam gravadas em campos proprios, so como dado.
 */

const DOMINIO = 'verticeconsultoria.com.br'
const TODOS_ADMISSAO_CLT = ['contrato_assinado', 'documentos_enviados', 'exame_medico']
const TODOS_ADMISSAO_PJ = ['contrato_assinado']

const email = (nome) =>
  `${nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '.')}@${DOMINIO}`

const soDigitos = (texto) => texto.replace(/\D/g, '')

function jornada(horario) {
  return {
    diasSemana: 'SEG, TER, QUA, QUI, SEX',
    horario,
    almoco: '12:00 - 13:00',
    cargaDiaria: '8h',
    cargaSemanal: '40h',
    regime: 'Híbrido',
    homeOffice: '—',
  }
}

function conta(banco, agencia, numeroConta, titular) {
  return { banco, agencia, tipoConta: 'corrente', numeroConta, titular, chavePix: '' }
}

function pix(chave) {
  return { banco: '', agencia: '', tipoConta: 'corrente', numeroConta: '', titular: '', chavePix: chave }
}

// Base comum. `documentoEnviado` e o arquivo do item "Documentos enviados" do
// checklist de admissao, que a pagina lista em Documentos.
function pessoa({ tipo, nome, telefone, ...resto }) {
  return {
    id: generateId(),
    tipo,
    name: nome,
    cargos: [],
    times: [],
    email: email(nome),
    reportaPara: null,
    notas: [],
    contato: { tipo: 'telefone', valor: soDigitos(telefone) },
    envioContrato: { tipo: 'telefone', valor: soDigitos(telefone) },
    contratoGerado: true,
    dadosBancarios: null,
    admissao: { feitos: tipo === 'CLT' ? TODOS_ADMISSAO_CLT : TODOS_ADMISSAO_PJ },
    rescisao: null,
    ausencia: null,
    jornada: null,
    ...(tipo === 'CLT' ? { documentoEnviado: 'Documentos_pessoais.pdf', dataNascimento: null } : {}),
    ...resto,
  }
}

function clt({ nome, time, cargo, reportaPara = null, cpf, telefone, ativoDesde, salario, custo, horario, banco, ...resto }) {
  return pessoa({
    tipo: 'CLT',
    nome,
    telefone,
    cargos: [cargo],
    times: time ? [time] : [],
    reportaPara,
    cpf: soDigitos(cpf),
    dataAdmissao: ativoDesde,
    salario,
    custoParaEmpresa: custo,
    jornada: jornada(horario),
    dadosBancarios: banco,
    ...resto,
  })
}

function pj({ nome, time, cargo, reportaPara = null, cnpj, razaoSocial, telefone, ativoDesde, pagamento, valor, fim = null, banco, ...resto }) {
  return pessoa({
    tipo: 'PJ',
    nome,
    telefone,
    cargos: [cargo],
    times: time ? [time] : [],
    reportaPara,
    cnpj: soDigitos(cnpj),
    razaoSocial,
    dataAdmissao: ativoDesde,
    pagamento,
    valorContrato: valor,
    dataFimContrato: fim,
    dadosBancarios: banco,
    ...resto,
  })
}

const H_09 = '9:00 - 18:00'
const H_08 = '8:00 - 17:00'
const H_10 = '10:00 - 19:00'

export function buildCenarioVertice(hoje) {
  const d = (dias) => addDaysIso(hoje, dias)

  const colaboradores = [
    // Em admissao
    clt({
      nome: 'Isabela Moura', time: null, cargo: 'Consultora', cpf: '620.966.542-03', telefone: '(11) 98111-8087',
      ativoDesde: d(19), salario: 7500, custo: 12750, horario: H_08, banco: null,
      email: '', dataNascimento: '1994-05-14',
      // Pendente 3/3: contrato gerado e enviado em D0 - 1, checklist todo aberto.
      admissao: { feitos: [] }, contratoGeradoEm: d(-1), documentoEnviado: undefined,
    }),
    pj({
      nome: 'Eduardo Prado', time: null, cargo: 'Desenvolvedor Frontend', cnpj: '07.229.710/0001-37',
      razaoSocial: 'EP Desenvolvimento de Software Ltda', telefone: '(11) 96519-8286',
      ativoDesde: d(5), pagamento: 'Mensal', valor: 11500, banco: null, email: '',
      // Contrato assinado em D0 - 2: Em atividade antes do inicio, com o alerta
      // de cadastro (falta time, reporta para, e-mail e dados bancarios).
      contratoAssinadoEm: d(-2),
    }),
    // Em desligamento
    clt({
      nome: 'Ricardo Teixeira', time: 'Financeiro', cargo: 'Assistente Financeiro', reportaPara: 'Sandra Figueiredo',
      cpf: '377.594.580-61', telefone: '(11) 99779-7302', ativoDesde: '2023-03-14', salario: 4200, custo: 7140,
      horario: H_09, banco: conta('Bradesco', '9966', '508516-9', 'Ricardo Teixeira'),
      rescisao: {
        tipo: 'sem_justa_causa',
        data: d(-5),
        avisoPrevio: 'indenizado',
        motivo: 'Reestruturação da área financeira',
        multa: null,
        envio: { tipo: 'telefone', valor: '11997797302' },
        termoGerado: true,
        termoGeradoEm: d(-5),
        feitos: ['extrato_fgts', 'exame_demissional'],
      },
    }),
    pj({
      nome: 'Marcelo Fontes', time: 'Tecnologia', cargo: 'Analista de QA', reportaPara: 'Leonardo Pires',
      cnpj: '41.115.109/0001-51', razaoSocial: 'MF Qualidade de Software Ltda', telefone: '(11) 97385-4704',
      ativoDesde: d(-107), pagamento: 'Mensal', valor: 9000, fim: d(16),
      banco: conta('Nubank PJ', '0001', '712851-4', 'MF Qualidade de Software Ltda'),
      rescisao: {
        tipo: 'fim_contrato',
        data: d(16),
        avisoPrevio: null,
        motivo: 'Contrato do projeto chega ao fim',
        multa: null,
        envio: { tipo: 'telefone', valor: '11973854704' },
        termoGerado: true,
        termoGeradoEm: d(-2),
        feitos: ['assinar_termo'],
      },
    }),
    // Comercial
    clt({ nome: 'Rodrigo Menezes', time: 'Comercial', cargo: 'Diretor Comercial', cpf: '158.813.998-03', telefone: '(11) 97722-9380', ativoDesde: '2018-03-12', salario: 22000, custo: 37400, horario: H_09, banco: conta('Itaú', '9975', '893322-7', 'Rodrigo Menezes') }),
    clt({ nome: 'Patrícia Lacerda', time: 'Comercial', cargo: 'Executiva de Contas', reportaPara: 'Rodrigo Menezes', cpf: '973.091.141-08', telefone: '(11) 97841-0188', ativoDesde: '2021-03-22', salario: 9500, custo: 16150, horario: H_09, banco: conta('Bradesco', '9032', '722390-5', 'Patrícia Lacerda'), ausencia: { tipo: 'ferias', inicio: d(-16), fim: d(3) } }),
    clt({ nome: 'Felipe Andrade', time: 'Comercial', cargo: 'Executivo de Contas', reportaPara: 'Rodrigo Menezes', cpf: '364.556.815-84', telefone: '(11) 96367-9133', ativoDesde: '2022-08-16', salario: 8500, custo: 14450, horario: H_09, banco: pix('36455681584') }),
    clt({ nome: 'Juliana Tavares', time: 'Comercial', cargo: 'Analista de Pré-vendas', reportaPara: 'Rodrigo Menezes', cpf: '729.405.576-91', telefone: '(11) 96371-6533', ativoDesde: '2026-01-20', salario: 5500, custo: 9350, horario: H_09, banco: conta('Nubank', '0001', '919351-1', 'Juliana Tavares') }),
    // Operacoes
    clt({ nome: 'Carla Bittencourt', time: 'Operações', cargo: 'Gerente de Operações', cpf: '689.768.469-40', telefone: '(11) 99793-7851', ativoDesde: '2018-08-05', salario: 16000, custo: 27200, horario: H_08, banco: conta('Santander', '9404', '553148-0', 'Carla Bittencourt') }),
    clt({ nome: 'Henrique Souza', time: 'Operações', cargo: 'Consultor Sênior', reportaPara: 'Carla Bittencourt', cpf: '932.081.967-09', telefone: '(11) 96583-7898', ativoDesde: '2020-11-09', salario: 11000, custo: 18700, horario: H_08, banco: conta('Banco do Brasil', '4750', '900900-1', 'Henrique Souza') }),
    // Chave PIX de telefone com o +55, para o tipo da chave sair "Telefone".
    clt({ nome: 'Mariana Duarte', time: 'Operações', cargo: 'Consultora', reportaPara: 'Carla Bittencourt', cpf: '778.486.488-42', telefone: '(11) 98860-7846', ativoDesde: '2023-01-10', salario: 7500, custo: 12750, horario: H_08, banco: pix('+55 11 98860-7846'), ausencia: { tipo: 'licenca_maternidade', inicio: d(-58), fim: d(61) } }),
    // Tecnologia
    clt({ nome: 'Leonardo Pires', time: 'Tecnologia', cargo: 'Coordenador de Tecnologia', cpf: '440.029.787-02', telefone: '(11) 97474-3274', ativoDesde: '2020-02-18', salario: 15000, custo: 25500, horario: H_10, banco: conta('Itaú', '5261', '736293-7', 'Leonardo Pires') }),
    clt({ nome: 'Beatriz Nogueira', time: 'Tecnologia', cargo: 'Analista de Dados', reportaPara: 'Leonardo Pires', cpf: '787.680.457-86', telefone: '(11) 99755-1611', ativoDesde: '2024-03-13', salario: 8000, custo: 13600, horario: H_10, banco: conta('Inter', '0001', '732818-8', 'Beatriz Nogueira'), ausencia: { tipo: 'licenca_medica', inicio: d(-2), fim: d(5) } }),
    pj({ nome: 'Gustavo Ramos', time: 'Tecnologia', cargo: 'Desenvolvedor Backend', reportaPara: 'Leonardo Pires', cnpj: '47.267.147/0001-06', razaoSocial: 'GR Tecnologia da Informação Ltda', telefone: '(11) 97516-1583', ativoDesde: '2025-05-15', pagamento: 'Mensal', valor: 13000, banco: pix('47.267.147/0001-06') }),
    pj({ nome: 'Thiago Cavalcanti', time: 'Tecnologia', cargo: 'Consultor de BI', reportaPara: 'Leonardo Pires', cnpj: '27.010.798/0001-09', razaoSocial: 'TC Consultoria em Dados Ltda', telefone: '(11) 99818-1360', ativoDesde: d(-51), pagamento: 'Valor fixo', valor: 48000, fim: d(79), banco: conta('Inter PJ', '0001', '269876-1', 'TC Consultoria em Dados Ltda') }),
    // Financeiro
    clt({ nome: 'Sandra Figueiredo', time: 'Financeiro', cargo: 'Gerente Financeira', cpf: '908.452.059-94', telefone: '(11) 98352-8060', ativoDesde: '2019-01-14', salario: 14500, custo: 24650, horario: H_09, banco: conta('Bradesco', '3209', '582316-3', 'Sandra Figueiredo') }),
    clt({ nome: 'Diego Matos', time: 'Financeiro', cargo: 'Analista Financeiro', reportaPara: 'Sandra Figueiredo', cpf: '792.984.162-61', telefone: '(11) 99829-2217', ativoDesde: '2023-06-05', salario: 5800, custo: 9860, horario: H_09, banco: conta('Caixa', '6013', '542364-6', 'Diego Matos') }),
    // RH
    clt({ nome: 'Renata Campos', time: 'RH', cargo: 'Coordenadora de RH', cpf: '628.360.161-83', telefone: '(11) 96210-5685', ativoDesde: '2019-06-03', salario: 10500, custo: 17850, horario: H_09, banco: conta('Santander', '6790', '989940-0', 'Renata Campos') }),
    clt({ nome: 'Lucas Barros', time: 'RH', cargo: 'Analista de DP', reportaPara: 'Renata Campos', cpf: '087.547.517-56', telefone: '(11) 99886-7644', ativoDesde: '2024-09-02', salario: 4800, custo: 8160, horario: H_09, banco: pix('08754751756') }),
  ].map((colaborador) => {
    // Isabela nao enviou documentos: sem o arquivo do item.
    if (colaborador.documentoEnviado === undefined) delete colaborador.documentoEnviado
    return colaborador
  })

  const porNome = new Map(colaboradores.map((colaborador) => [colaborador.name, colaborador]))
  const id = (nome) => {
    const colaborador = porNome.get(nome)
    if (!colaborador) throw new Error(`Cenário Vértice: colaborador "${nome}" não existe`)
    return colaborador.id
  }
  const ids = (...nomes) => nomes.map(id)

  // Cores: a familia mais proxima da sugestao (Azul #1f7cd0, Amarelo #e9a716,
  // Roxo #726ce2, Verde #1fb96e, Rosa #e94f9b) - o tom exato existe em cada uma.
  const times = [
    { name: 'Comercial', color: 'azul-3', icon: 'Tag', lider: 'Rodrigo Menezes', descricao: 'Prospecta, atende e fecha contratos com clientes de médio porte, da primeira reunião à renovação.' },
    { name: 'Operações', color: 'amareloLaranja-3', icon: 'Gear', lider: 'Carla Bittencourt', descricao: 'Conduz a entrega dos projetos de consultoria, garantindo prazo, qualidade e satisfação do cliente.' },
    { name: 'Tecnologia', color: 'roxo-3', icon: 'Code', lider: 'Leonardo Pires', descricao: 'Cuida dos sistemas internos, da infraestrutura e das soluções de dados usadas nos projetos.' },
    { name: 'Financeiro', color: 'verde-3', icon: 'Coin', lider: 'Sandra Figueiredo', descricao: 'Controla caixa, faturamento, contas a pagar e receber e o orçamento da empresa.' },
    { name: 'RH', color: 'rosa-2', icon: 'IdentificationBadge', lider: 'Renata Campos', descricao: 'Cuida da contratação, do desenvolvimento e do bem-estar das pessoas e da administração de pessoal.' },
  ].map(({ lider, ...time }) => ({ id: generateId(), pending: false, leaderId: id(lider), notas: [], ...time }))

  const variante = (valor, colaboradorIds) => ({ id: generateId(), valor, aplicaATodos: false, colaboradorIds })
  const unico = (valor) => [{ id: generateId(), valor, aplicaATodos: true, colaboradorIds: [] }]
  const vinculos = (teamNames = [], colaboradorIds = [], todaEmpresa = false) => ({ todaEmpresa, teamNames, colaboradorIds })
  const fontesDoPlano = vinculos(['Comercial', 'Operações', 'Financeiro', 'RH'], ids('Leonardo Pires', 'Beatriz Nogueira'))
  const lideres = ids('Rodrigo Menezes', 'Carla Bittencourt', 'Leonardo Pires', 'Sandra Figueiredo', 'Renata Campos')
  const demais = ids('Patrícia Lacerda', 'Felipe Andrade', 'Juliana Tavares', 'Henrique Souza', 'Mariana Duarte', 'Beatriz Nogueira', 'Diego Matos', 'Lucas Barros', 'Ricardo Teixeira')

  const recursos = [
    { tipoRecurso: 'beneficio', categoria: 'Plano de saúde', fornecedor: 'Alice', beneficiarios: fontesDoPlano, valores: [variante(780, lideres), variante(520, demais)] },
    { tipoRecurso: 'beneficio', categoria: 'Vale alimentação', fornecedor: 'Caju', beneficiarios: { ...fontesDoPlano }, valores: unico(900) },
    { tipoRecurso: 'beneficio', categoria: 'Bem-estar', fornecedor: 'Wellhub', beneficiarios: vinculos(['Comercial', 'Operações']), valores: unico(150) },
    { tipoRecurso: 'verba', nome: 'Verba de Treinamento', icone: 'Coin', beneficiarios: vinculos([], ids('Beatriz Nogueira', 'Henrique Souza', 'Juliana Tavares')), valores: unico(1200) },
    { tipoRecurso: 'licenca', servico: 'Outro', nome: 'Microsoft 365', fornecedor: 'Microsoft', beneficiarios: vinculos([], [], true), valores: unico(75) },
    { tipoRecurso: 'licenca', servico: 'Outro', nome: 'HubSpot CRM', fornecedor: 'HubSpot', beneficiarios: vinculos(['Comercial']), valores: unico(220) },
    { tipoRecurso: 'licenca', servico: 'Outro', nome: 'Power BI Pro', fornecedor: 'Microsoft', beneficiarios: vinculos(['Financeiro'], ids('Beatriz Nogueira', 'Thiago Cavalcanti')), valores: unico(60) },
  ].map((recurso) => ({ id: generateId(), linkBeneficio: null, contatoFornecedor: null, emailFornecedor: null, notas: [], ...recurso }))

  return { colaboradores, times, recursos }
}
