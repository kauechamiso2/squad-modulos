// Contas das paginas de detalhe (contexto, "Data model > Costs" e secoes 5,
// 8 e 9). Tudo recalculado a partir das colecoes, nunca guardado.

import { getBeneficiaryValue } from './beneficiarios.js'
import { getStatus, isEncerrado } from './colaboradorStatus.js'
import { custoBaseDoColaborador } from './custos.js'
import { recursosDoColaborador } from './cadastro.js'
import { pessoasDoRecurso, valorDoRecurso } from './recursos.js'
import { mediaDeMeses, mesesDeCasa } from './tempoDeCasa.js'
import { formatCurrencyBRL } from './formatters.js'
import { getTeamColorTones } from './teamOptions.js'

// O valor que a pessoa recebe do recurso. Quem esta em varios times usa o
// time ligado ao recurso, se houver.
export function valorDaPessoaNoRecurso(recurso, pessoa) {
  const timesLigados = new Set(recurso.beneficiarios?.teamNames ?? [])
  const time = pessoa.times?.find((nome) => timesLigados.has(nome)) ?? pessoa.times?.[0] ?? null
  return getBeneficiaryValue(recurso, pessoa.id, time)
}

// Custo total da pessoa: custo para empresa (CLT) ou valor do contrato (PJ)
// mais cada recurso que chega ate ela, uma vez.
export function custoDoColaborador(pessoa, recursos, colaboradores, hoje) {
  return (
    custoBaseDoColaborador(pessoa) +
    recursosDoColaborador(pessoa, recursos, colaboradores, hoje).reduce(
      (soma, recurso) => soma + valorDaPessoaNoRecurso(recurso, pessoa),
      0,
    )
  )
}

function porcentagem(parte, total) {
  return total ? Math.round((parte / total) * 100) : 0
}

// Faixa de valores, como no card do recurso: "R$450,00" ou "R$450,00-550,00".
export function faixaDeValores(valores) {
  if (valores.length === 0) return '—'
  return valorDoRecurso({ id: 'faixa', valores: valores.map((valor) => ({ valor })) })
}

// Membros do time: Pendente, Em atividade e Em desligamento.
export function membrosDoTime(time, colaboradores) {
  return colaboradores.filter((pessoa) => pessoa.times.includes(time.name) && !isEncerrado(getStatus(pessoa)))
}

// Metricas e recursos do time - Figma 10355:3274 e 10355:3344.
export function metricasDoTime(time, colaboradores, recursos, hoje) {
  const membros = membrosDoTime(time, colaboradores)
  const cargos = new Map()
  membros.forEach((pessoa) => {
    ;(pessoa.cargos ?? []).forEach((cargo) => cargos.set(cargo, (cargos.get(cargo) ?? 0) + 1))
  })
  const clt = membros.filter((pessoa) => pessoa.tipo === 'CLT').length
  const pj = membros.filter((pessoa) => pessoa.tipo === 'PJ').length

  const recursosDoTime = recursos
    .map((recurso) => {
      const alcancados = pessoasDoRecurso(recurso, colaboradores, hoje).filter((pessoa) =>
        membros.some((membro) => membro.id === pessoa.id),
      )
      if (alcancados.length === 0) return null
      return { recurso, faixa: faixaDeValores(alcancados.map((pessoa) => valorDaPessoaNoRecurso(recurso, pessoa))) }
    })
    .filter(Boolean)

  return {
    membros,
    mediaDeMeses: mediaDeMeses(membros.map((pessoa) => mesesDeCasa(pessoa.dataAdmissao, hoje))),
    custo: membros.reduce((soma, pessoa) => soma + custoDoColaborador(pessoa, recursos, colaboradores, hoje), 0),
    cargos: [...cargos.entries()].sort((a, b) => b[1] - a[1]),
    contratacao: { CLT: porcentagem(clt, membros.length), PJ: porcentagem(pj, membros.length) },
    recursos: recursosDoTime,
  }
}

// Metricas do recurso - Figma 10355:2923. Por time: o time de cada pessoa
// (o ligado ao recurso, senao o primeiro), na cor escura do time; quem nao
// tem time entra como "Sem time".
export function metricasDoRecurso(recurso, colaboradores, times, hoje) {
  const pessoas = pessoasDoRecurso(recurso, colaboradores, hoje)
  const porValor = new Map()
  const porTime = new Map()
  const timesLigados = new Set(recurso.beneficiarios?.teamNames ?? [])
  let custo = 0

  pessoas.forEach((pessoa) => {
    const valor = valorDaPessoaNoRecurso(recurso, pessoa)
    custo += valor
    porValor.set(valor, (porValor.get(valor) ?? 0) + 1)
    const time = pessoa.times.find((nome) => timesLigados.has(nome)) ?? pessoa.times[0] ?? null
    porTime.set(time, (porTime.get(time) ?? 0) + 1)
  })

  const porNome = new Map(times.map((time) => [time.name, time]))
  return {
    pessoas,
    total: pessoas.length,
    custo,
    porValor: [...porValor.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([valor, quantidade]) => ({ rotulo: formatCurrencyBRL(valor), valor: quantidade })),
    porTime: [...porTime.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([nome, quantidade]) => {
        const time = nome ? porNome.get(nome) : null
        return {
          rotulo: nome ?? 'Sem time',
          porcentagem: porcentagem(quantidade, pessoas.length),
          cor: time && !time.pending ? getTeamColorTones(time.color).dark : 'var(--gp-texto-esmaecido)',
        }
      }),
  }
}

// Valor base de um vinculo novo no recurso: o primeiro valor dele. As
// variantes ficam no fluxo de criacao (contexto, secao 9).
export function valorBaseDoRecurso(recurso) {
  const valor = recurso.valores?.[0]?.valor
  if (valor == null) throw new Error(`Recurso ${recurso.id} sem valor`)
  return valor
}
