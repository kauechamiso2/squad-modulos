import {
  seedInitialData,
  cleanupLegacySeedTimes,
  cleanupMultiTeamColaboradores,
  cleanupCargoBeneficiarios,
  migrateLegacyKeys,
} from './utils/storage.js'

// Roda uma vez, antes do primeiro render - mesma ordem e mesmo momento do
// main.jsx do projeto original. A unica adicao e migrateLegacyKeys(), que vem
// primeiro para que os seeds enxerguem os dados ja migrados e nao semeiem por
// cima de um storage que so parecia vazio.
export function initGestaoPessoas() {
  migrateLegacyKeys()
  seedInitialData()
  cleanupLegacySeedTimes()
  cleanupMultiTeamColaboradores()
  cleanupCargoBeneficiarios()
}
