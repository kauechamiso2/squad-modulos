import { generateId } from './storage.js'
import { camposLegados } from './recursos.js'

// Os 5 recursos do Figma da aba Recursos (10334:5539), ligados aos
// colaboradores e times do seed. Misturam empresa toda, times e pessoas, e
// usam variantes, para a contagem e a faixa de valor sairem dos vinculos
// reais - nao precisam bater com os numeros do mock.

function idsPorNome(colaboradores, nomes) {
  return nomes.map((nome) => {
    const colaborador = colaboradores.find((item) => item.name === nome)
    if (!colaborador) throw new Error(`Seed de recursos: colaborador "${nome}" não existe no seed`)
    return colaborador.id
  })
}

function variante(valor, colaboradorIds) {
  return { id: generateId(), valor, aplicaATodos: false, colaboradorIds }
}

function valorUnico(valor) {
  return [{ id: generateId(), valor, aplicaATodos: true, colaboradorIds: [] }]
}

export function buildSeedRecursos(colaboradores) {
  const ids = (...nomes) => idsPorNome(colaboradores, nomes)
  const naoDesign = colaboradores
    .filter((colaborador) => !colaborador.times.includes('Design'))
    .map((colaborador) => colaborador.id)
  const doDesign = colaboradores
    .filter((colaborador) => colaborador.times.includes('Design'))
    .map((colaborador) => colaborador.id)
  const pessoasVa = [...ids('Victoria Cardoso', 'Marina Ferraz')]
  const timesVa = ['Vendas', 'Marketing']
  const membrosVa = colaboradores
    .filter((colaborador) => colaborador.times.some((time) => timesVa.includes(time)))
    .map((colaborador) => colaborador.id)
  const todosVa = [...new Set([...membrosVa, ...pessoasVa])]
  const aVa = todosVa.filter((id) => !ids('Beatriz Souza', 'Lucas Andrade').includes(id))

  const recursos = [
    {
      tipoRecurso: 'beneficio',
      categoria: 'Plano de saúde',
      fornecedor: 'Alice',
      beneficiarios: { todaEmpresa: true, teamNames: [], colaboradorIds: [] },
      valores: [variante(400, naoDesign), variante(500, doDesign)],
    },
    {
      tipoRecurso: 'verba',
      nome: 'Auxílio Home Office',
      icone: 'Desktop',
      beneficiarios: {
        todaEmpresa: false,
        teamNames: [],
        colaboradorIds: ids('Bruno Vasconcelos', 'Gabriel Luz', 'Bruna Teixeira'),
      },
      valores: [
        variante(450, ids('Bruno Vasconcelos')),
        variante(400, ids('Gabriel Luz', 'Bruna Teixeira')),
      ],
    },
    {
      tipoRecurso: 'licenca',
      servico: 'Slack',
      beneficiarios: { todaEmpresa: false, teamNames: ['Design', 'Marketing'], colaboradorIds: ids('Lucas Andrade') },
      valores: valorUnico(50),
    },
    {
      tipoRecurso: 'beneficio',
      categoria: 'Vale alimentação',
      fornecedor: 'Caju',
      // Victoria esta no time Marketing e tambem individualmente: conta uma vez.
      beneficiarios: { todaEmpresa: false, teamNames: timesVa, colaboradorIds: pessoasVa },
      valores: [variante(800, aVa), variante(1200, ids('Beatriz Souza', 'Lucas Andrade'))],
    },
    {
      tipoRecurso: 'beneficio',
      categoria: 'Vale transporte',
      fornecedor: 'VEM',
      // Pedro Martins ja saiu: fica no vinculo, mas nao conta.
      beneficiarios: {
        todaEmpresa: false,
        teamNames: [],
        colaboradorIds: ids('Rafael Nunes', 'Beatriz Souza', 'Lucas Andrade', 'Pedro Martins'),
      },
      valores: [
        variante(400, ids('Rafael Nunes', 'Beatriz Souza')),
        variante(450, ids('Lucas Andrade', 'Pedro Martins')),
      ],
    },
  ]

  return recursos.map((recurso) => ({
    id: generateId(),
    linkBeneficio: null,
    contatoFornecedor: null,
    emailFornecedor: null,
    notas: [],
    ...recurso,
    ...camposLegados(recurso),
  }))
}
