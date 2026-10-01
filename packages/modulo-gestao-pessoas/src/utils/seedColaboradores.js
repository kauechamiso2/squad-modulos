import { addDaysIso, buildEmailPrefix } from './formatters.js'
import { generateId } from './storage.js'

// Seed da aba Colaboradores, um colaborador para cada estado da home.
// Nomes, cargos e times vem do Figma da home (10331:4871), sem os erros do
// mock. Os tres ultimos nomes nao estao no Figma: ele nao desenha Rescisao
// pendente nem Fim de contrato.
//
// Toda data e relativa ao dia em que o seed roda, nunca fixa.
//
// `contractType` e `desligado` sao campos antigos que a home nao le mais. Ficam
// so para a pagina do colaborador, que ainda nao foi refeita (Topico 9),
// mostrar o tipo e travar os campos de quem ja saiu.

const TODOS_ADMISSAO_CLT = ['contrato_assinado', 'documentos_enviados', 'exame_medico']
const TODOS_ADMISSAO_PJ = ['contrato_assinado']

function clt({ dias, ...dados }) {
  return {
    tipo: 'CLT',
    contractType: 'Fixo',
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
      desligado: true,
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
    ...registro,
  }))
}
