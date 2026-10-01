import {
  seedInitialData,
  cleanupLegacySeedTimes,
  cleanupMultiTeamColaboradores,
  cleanupCargoBeneficiarios,
  migrateLegacyKeys,
  resetColaboradoresIfOutdated,
} from './utils/storage.js'

// Roda uma vez, antes do primeiro render - mesma ordem e mesmo momento do
// main.jsx do projeto original. A unica adicao e migrateLegacyKeys(), que vem
// primeiro para que os seeds enxerguem os dados ja migrados e nao semeiem por
// cima de um storage que so parecia vazio. resetColaboradoresIfOutdated() vem
// antes das limpezas, que assim ja enxergam os colaboradores do seed.
export function initGestaoPessoas() {
  migrateLegacyKeys()
  seedInitialData()
  resetColaboradoresIfOutdated()
  cleanupLegacySeedTimes()
  cleanupMultiTeamColaboradores()
  cleanupCargoBeneficiarios()
}
