// Tempo de casa (contexto, secao 5 e 8): "8 meses" no primeiro ano e
// "1a 3m" depois; "—" antes da data de admissao ou sem ela. Conta meses
// cheios entre a admissao e hoje (datas ISO).

export function mesesDeCasa(dataAdmissao, hoje) {
  if (!dataAdmissao || dataAdmissao > hoje) return null
  const [ano, mes, dia] = dataAdmissao.split('-').map(Number)
  const [anoHoje, mesHoje, diaHoje] = hoje.split('-').map(Number)
  let meses = (anoHoje - ano) * 12 + (mesHoje - mes)
  if (diaHoje < dia) meses -= 1
  return Math.max(meses, 0)
}

export function formatarTempoDeCasa(meses) {
  if (meses == null) return '—'
  const inteiros = Math.round(meses)
  if (inteiros < 12) return inteiros === 1 ? '1 mês' : `${inteiros} meses`
  return `${Math.floor(inteiros / 12)}a ${inteiros % 12}m`
}

// Media dos meses de casa de quem ja foi admitido; null sem ninguem.
export function mediaDeMeses(listaDeMeses) {
  const validos = listaDeMeses.filter((meses) => meses != null)
  if (validos.length === 0) return null
  return validos.reduce((soma, meses) => soma + meses, 0) / validos.length
}
