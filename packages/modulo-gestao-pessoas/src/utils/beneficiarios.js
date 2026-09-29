// Resolves the live set of collaborador ids covered by a benefit's stored
// references (direct ids, team names, company-wide flag). Cargo is not a
// valid beneficiary source - only colaboradores, times, and "Toda a
// empresa" are. Always recompute from the current collections - never
// cache the result - so membership changes made elsewhere in the app are
// reflected immediately.
export function resolveBeneficiaryIds(beneficiarios, collaborators) {
  if (!beneficiarios) return new Set()

  if (beneficiarios.todaEmpresa) {
    return new Set(collaborators.map((collaborator) => collaborator.id))
  }

  const teamNameSet = new Set(beneficiarios.teamNames ?? [])
  const result = new Set(beneficiarios.colaboradorIds ?? [])

  collaborators.forEach((collaborator) => {
    const inTeam = collaborator.times.some((name) => teamNameSet.has(name))
    if (inTeam) result.add(collaborator.id)
  })

  return result
}

// Always the live-resolved count - including for legacy seed benefits,
// which carry no real beneficiarios data and so simply resolve to 0 rather
// than falling back to their static placeholder memberCount field.
export function getBenefitMemberCount(benefit, collaborators) {
  return resolveBeneficiaryIds(benefit.beneficiarios, collaborators).size
}

// A beneficiary's own assigned value, in priority order: an individual
// override, then the value of the team source they belong to, then the
// company-wide value. Falls back to the Novo Benefício wizard's variant
// assignment (valores) for benefits saved before the detail view's
// per-source values existed, so older records still show a sensible cost.
export function getBeneficiaryValue(benefit, collaboradorId, memberTeamName) {
  const beneficiarios = benefit.beneficiarios ?? {}

  if (beneficiarios.colaboradorValores?.[collaboradorId] != null) {
    return beneficiarios.colaboradorValores[collaboradorId]
  }
  if (
    memberTeamName &&
    beneficiarios.teamNames?.includes(memberTeamName) &&
    beneficiarios.teamValores?.[memberTeamName] != null
  ) {
    return beneficiarios.teamValores[memberTeamName]
  }
  if (beneficiarios.todaEmpresa && beneficiarios.todaEmpresaValor != null) {
    return beneficiarios.todaEmpresaValor
  }

  const variants = benefit.valores ?? []
  if (variants.length === 1 && variants[0].aplicaATodos) return variants[0].valor
  const variant = variants.find((item) => item.colaboradorIds?.includes(collaboradorId))
  return variant ? variant.valor : 0
}

// Live métricas for the Benefício detail view: total beneficiaries, total
// cost, a breakdown of distinct values in use, and a per-team breakdown of
// the current beneficiary set - all recomputed from the current
// colaboradores/times collections, never cached.
export function computeBenefitMetrics(benefit, collaborators, times) {
  const beneficiaryIds = resolveBeneficiaryIds(benefit.beneficiarios, collaborators)
  const teamNames = new Set(times.map((team) => team.name))

  let custoTotal = 0
  const valueCounts = new Map()
  const teamCounts = new Map()

  beneficiaryIds.forEach((id) => {
    const collaborator = collaborators.find((item) => item.id === id)
    if (!collaborator) return

    const memberTeamName = collaborator.times?.find((name) => teamNames.has(name)) ?? null
    const value = getBeneficiaryValue(benefit, id, memberTeamName)
    custoTotal += value
    valueCounts.set(value, (valueCounts.get(value) ?? 0) + 1)

    const teamKey = memberTeamName ?? 'Sem time'
    teamCounts.set(teamKey, (teamCounts.get(teamKey) ?? 0) + 1)
  })

  const total = beneficiaryIds.size

  return {
    totalBeneficiarios: total,
    custoTotal,
    valueBreakdown: Array.from(valueCounts.entries())
      .map(([valor, count]) => ({ valor, count }))
      .sort((a, b) => b.valor - a.valor),
    teamBreakdown: Array.from(teamCounts.entries()).map(([teamName, count]) => ({
      teamName,
      count,
      percent: total ? Math.round((count / total) * 100) : 0,
    })),
  }
}
