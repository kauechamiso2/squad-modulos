// Todas as chaves deste modulo vivem sob um prefixo proprio. No monorepo
// varios modulos dividem a mesma origem, entao chaves cruas como "times" ou
// "cargos" colidiriam com as de outro modulo. Ver migrateLegacyKeys() abaixo
// para a migracao dos dados gravados antes do prefixo existir.
const KEY_PREFIX = 'squad:gestao-pessoas:'

export const COLLECTIONS = {
  CARGOS: 'cargos',
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

export function duplicateItems(name, ids) {
  const idSet = new Set(ids)
  const items = getCollection(name)
  const duplicates = items
    .filter((item) => idSet.has(item.id))
    .map((item) => ({
      ...item,
      id: generateId(),
      name: `${item.name} (cópia)`,
    }))
  const updated = [...items, ...duplicates]
  writeCollection(name, updated)
  return updated
}

function ensureSeeded(name, seedFactory) {
  if (readCollection(name) !== null) return
  writeCollection(name, seedFactory())
}

export function seedInitialData() {
  ensureSeeded(COLLECTIONS.CARGOS, () =>
    [
      'Designer de Produto Senior',
      'Designer de Produto Pleno',
      'Designer de Produto Junior',
      'Designer Gráfico',
      'Head de Produto',
      'Head de Marketing',
    ].map((name) => ({ id: generateId(), name, pending: false })),
  )

  ensureSeeded(COLLECTIONS.BENEFICIOS, () => [
    {
      id: generateId(),
      name: 'Plano de Saude',
      memberCount: 12,
      iconType: 'image',
      image: 'alice',
    },
    {
      id: generateId(),
      name: 'Vale Refeição',
      memberCount: 12,
      iconType: 'image',
      image: 'caju',
    },
    {
      id: generateId(),
      name: 'Auxilio Home Office',
      memberCount: 12,
      iconType: 'badge',
      icon: 'desktop',
    },
    {
      id: generateId(),
      name: 'Gympass',
      memberCount: 12,
      iconType: 'image',
      image: 'gympass',
    },
    {
      id: generateId(),
      name: 'Vale Transporte',
      memberCount: 12,
      iconType: 'badge',
      icon: 'van',
    },
  ])
}

// One-time cleanup for browsers whose "times" collection was seeded by an
// earlier version of seedInitialData with example data ("Design", "Vendas",
// "Marketing", all pending: false). That seed has been removed; this undoes
// its effects wherever it already ran, without touching times created for
// real. Naturally a no-op once a given browser's storage no longer matches
// the old seed signature, so it's safe to run on every load.
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

  const withDesignPendingFixed = withoutLegacySeeds.map((time) => {
    if (time.name === 'Design' && !time.pending) {
      changed = true
      return { ...time, pending: true }
    }
    return time
  })

  if (changed) {
    writeCollection(COLLECTIONS.TIMES, withDesignPendingFixed)
  }
}

// One-time cleanup: a colaborador's "times" array should hold at most one
// team, but records saved before that rule was enforced may still carry
// more than one. Keep only the first and drop the rest. Naturally a no-op
// once every record already has 0 or 1 team, so safe to run on every load.
export function cleanupMultiTeamColaboradores() {
  const colaboradores = readCollection(COLLECTIONS.COLABORADORES)
  if (colaboradores === null) return

  let changed = false
  const fixed = colaboradores.map((colaborador) => {
    if (Array.isArray(colaborador.times) && colaborador.times.length > 1) {
      changed = true
      return { ...colaborador, times: [colaborador.times[0]] }
    }
    return colaborador
  })

  if (changed) {
    writeCollection(COLLECTIONS.COLABORADORES, fixed)
  }
}
