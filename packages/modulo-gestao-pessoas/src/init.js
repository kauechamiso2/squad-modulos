import {
  cleanupLegacySeedTimes,
  cleanupCargoBeneficiarios,
  migrateLegacyKeys,
  resetDataIfOutdated,
} from './utils/storage.js'

// Roda uma vez, antes do primeiro render - mesma ordem e mesmo momento do
// main.jsx do projeto original. A unica adicao e migrateLegacyKeys(), que vem
// primeiro para que o seed enxergue os dados ja migrados. resetDataIfOutdated()
// vem antes das limpezas, que assim ja enxergam o seed.
export function initGestaoPessoas() {
  migrateLegacyKeys()
  resetDataIfOutdated()
  cleanupLegacySeedTimes()
  cleanupCargoBeneficiarios()
}
