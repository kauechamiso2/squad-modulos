import { todayIso } from './formatters.js'
import { buildSeedColaboradores } from './seedColaboradores.js'
import { buildSeedTimes } from './seedTimes.js'
import { buildSeedRecursos } from './seedRecursos.js'

// Todas as chaves deste modulo vivem sob um prefixo proprio. No monorepo
// varios modulos dividem a mesma origem, entao chaves cruas como "times" ou
// "cargos" colidiriam com as de outro modulo. Ver migrateLegacyKeys() abaixo
// para a migracao dos dados gravados antes do prefixo existir.
const KEY_PREFIX = 'squad:gestao-pessoas:'

export const COLLECTIONS = {
  TIMES: 'times',
  COLABORADORES: 'colaboradores',
  BENEFICIOS: 'beneficios',
}

function storageKey(name) {
  return `${KEY_PREFIX}${name}`
}

function readCollection(name) {
  try {
    const raw = localStorage.getItem(storageKey(name))
    if (raw === null) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function writeCollection(name, items) {
  localStorage.setItem(storageKey(name), JSON.stringify(items))
}

// Migracao unica: copia as chaves sem prefixo gravadas pela versao standalone
// do projeto para as chaves prefixadas e remove as antigas. Idempotente - uma
// vez migrado (ou num navegador que nunca rodou a versao antiga) nao faz nada.
// So copia quando a chave nova ainda nao existe, para nunca sobrescrever dados
// mais recentes com os legados.
export function migrateLegacyKeys() {
  Object.values(COLLECTIONS).forEach((name) => {
    let legacy
    try {
      legacy = localStorage.getItem(name)
    } catch {
      return
    }
    if (legacy === null) return

    if (localStorage.getItem(storageKey(name)) === null) {
      localStorage.setItem(storageKey(name), legacy)
    }
    localStorage.removeItem(name)
  })
}

export function getCollaboratorActiveSince(collaborator) {
  return collaborator.dataAdmissao ?? collaborator.dataInicioContrato ?? null
}

export function generateId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

export function getCollection(name) {
  return readCollection(name) ?? []
}

export function setCollection(name, items) {
  writeCollection(name, items)
}

export function addItem(name, item) {
  const items = getCollection(name)
  const newItem = { id: generateId(), ...item }
  writeCollection(name, [...items, newItem])
  return newItem
}

export function removeItems(name, ids) {
  const idSet = new Set(ids)
  const items = getCollection(name).filter((item) => !idSet.has(item.id))
  writeCollection(name, items)
  return items
}

// Versao dos dados deste modulo. Subir a versao apaga os dados antigos do
// modulo - colaboradores, recursos e times - e grava o seed de novo. Dado do
// modelo anterior e apagado, nao convertido.
//   2: colaboradores com tipo, checklists, rescisao e ausencia.
//   3: recursos (Beneficio, Verba, Licenca) no lugar dos beneficios antigos.
//   4: campos da pagina CLT (CPF, contato, custo, dados bancarios, documentos).
//   5: campos da pagina PJ (CNPJ, razao social, pagamento, valor do contrato);
//      sem os campos antigos `contractType` e `desligado`.
//   6: checklist de desligamento do Figma (10355:3986, 10355:7067), tipos de
//      rescisao PJ, dados do desligamento e jornada de trabalho mockada.
//   7: paginas de detalhe - o time Design completo, notas de exemplo e os
//      dados de contato da Alice; recursos sem os campos legados `tipo` e `name`.
//
// So mexe em chaves deste modulo: o localStorage e dividido com os outros
// modulos do apps/web. Nao roda quando a versao gravada e mais nova que a
// deste codigo, para nunca apagar dado mais novo.
export const DATA_VERSION = 7
const DATA_VERSION_KEY = storageKey('versao-dados')

export function resetDataIfOutdated() {
  const stored = Number(localStorage.getItem(DATA_VERSION_KEY) ?? 0)
  if (stored >= DATA_VERSION) return

  const colaboradores = buildSeedColaboradores(todayIso())
  writeCollection(COLLECTIONS.COLABORADORES, colaboradores)
  writeCollection(COLLECTIONS.BENEFICIOS, buildSeedRecursos(colaboradores, todayIso()))
  writeCollection(COLLECTIONS.TIMES, buildSeedTimes(colaboradores, todayIso()))
  ensurePendingTimes(colaboradores.flatMap((colaborador) => colaborador.times))
  localStorage.setItem(DATA_VERSION_KEY, String(DATA_VERSION))
}

// Os times citados pelo seed entram como times pendentes - o mesmo registro
// que o app cria quando alguem digita um time novo - e so se ainda nao
// existir um time com o mesmo nome.
function ensurePendingTimes(names) {
  const times = readCollection(COLLECTIONS.TIMES) ?? []
  const existing = new Set(times.map((time) => time.name))
  const missing = [...new Set(names)].filter((name) => !existing.has(name))
  if (missing.length === 0) return
  writeCollection(COLLECTIONS.TIMES, [
    ...times,
    ...missing.map((name) => ({ id: generateId(), name, pending: true })),
  ])
}

// One-time cleanup for browsers whose "times" collection was seeded by an
// earlier version of seedInitialData with example data ("Vendas",
// "Marketing", both pending: false and no real members). That seed has been
// removed; this undoes its effects wherever it already ran, without
// touching times created for real - a legacy seed record is only ever
// removed, never mutated, and only when nobody actually belongs to it.
// Naturally a no-op once a given browser's storage no longer matches the
// old seed signature, so it's safe to run on every load.
const LEGACY_SEEDED_TIME_NAMES = ['Vendas', 'Marketing']

export function cleanupLegacySeedTimes() {
  const times = readCollection(COLLECTIONS.TIMES)
  if (times === null) return

  const colaboradores = readCollection(COLLECTIONS.COLABORADORES) ?? []
  const hasMembers = (teamName) =>
    colaboradores.some(
      (colaborador) =>
        Array.isArray(colaborador.times) && colaborador.times.includes(teamName),
    )

  let changed = false

  const withoutLegacySeeds = times.filter((time) => {
    const isLegacySeedSignature =
      LEGACY_SEEDED_TIME_NAMES.includes(time.name) &&
      !time.pending &&
      !hasMembers(time.name)
    if (isLegacySeedSignature) {
      changed = true
      return false
    }
    return true
  })

  if (changed) {
    writeCollection(COLLECTIONS.TIMES, withoutLegacySeeds)
  }
}

// One-time migration: cargo is no longer a valid beneficiary source for
// Benefícios (only colaboradores, times, and "Toda a empresa" are). Strips
// any leftover cargoNames reference from records saved under the old Step 3,
// without deleting the benefit record itself - if that leaves it with no
// beneficiary source at all, it's left as an empty selection rather than
// removed. Logged to the console since this silently changes saved data.
// Naturally a no-op once a given browser's storage no longer has any
// cargoNames left, so it's safe to run on every load.
export function cleanupCargoBeneficiarios() {
  const beneficios = readCollection(COLLECTIONS.BENEFICIOS)
  if (beneficios === null) return

  const affected = []

  const fixed = beneficios.map((benefit) => {
    const cargoNames = benefit.beneficiarios?.cargoNames
    if (!Array.isArray(cargoNames) || cargoNames.length === 0) return benefit
    affected.push({ id: benefit.id, name: benefit.name })
    return { ...benefit, beneficiarios: { ...benefit.beneficiarios, cargoNames: [] } }
  })

  if (affected.length > 0) {
    writeCollection(COLLECTIONS.BENEFICIOS, fixed)
    console.log(
      'cleanupCargoBeneficiarios: removed stale cargo beneficiary references from',
      affected.length,
      'benefit record(s):',
      affected,
    )
  }
}
