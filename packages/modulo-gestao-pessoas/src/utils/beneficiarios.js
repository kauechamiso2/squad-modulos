// Resolves the live set of collaborador ids covered by a benefit's stored
// references (direct ids, team names, cargo names, company-wide flag).
// Always recompute from the current collections - never cache the result -
// so membership changes made elsewhere in the app are reflected immediately.
export function resolveBeneficiaryIds(beneficiarios, collaborators) {
  if (!beneficiarios) return new Set()

  if (beneficiarios.todaEmpresa) {
    return new Set(collaborators.map((collaborator) => collaborator.id))
  }

  const teamNameSet = new Set(beneficiarios.teamNames ?? [])
  const cargoNameSet = new Set(beneficiarios.cargoNames ?? [])
  const result = new Set(beneficiarios.colaboradorIds ?? [])

  collaborators.forEach((collaborator) => {
    const inTeam = collaborator.times.some((name) => teamNameSet.has(name))
    const inCargo = collaborator.cargos.some((name) => cargoNameSet.has(name))
    if (inTeam || inCargo) result.add(collaborator.id)
  })

  return result
}

// Legacy seed benefits carry a static memberCount; benefits created via the
// Novo Benefício flow always resolve their count live from the current
// colaboradores/times/cargos collections.
export function getBenefitMemberCount(benefit, collaborators) {
  if (!benefit.tipo) return benefit.memberCount
  return resolveBeneficiaryIds(benefit.beneficiarios, collaborators).size
}
