import {
  cleanupLegacySeedTimes,
  cleanupCargoBeneficiarios,
  migrateLegacyKeys,
  resetDataIfOutdated,
} from './utils/storage.js'
import { aplicarAtalhoDeDados } from './utils/atalhosDeDados.js'

// Roda uma vez, antes do primeiro render. migrateLegacyKeys() vem primeiro,
// resetDataIfOutdated() apaga os dados de versoes antigas (o modulo comeca
// vazio) e os atalhos ?seed=exemplo e ?reset=1 vem depois, para valer por
// cima da versao. As limpezas de dado legado rodam por ultimo.
export function initGestaoPessoas() {
  migrateLegacyKeys()
  resetDataIfOutdated()
  aplicarAtalhoDeDados()
  cleanupLegacySeedTimes()
  cleanupCargoBeneficiarios()

  // O atalho tambem vale digitado na barra com a pagina ja aberta: a troca de
  // hash nao recarrega, entao aplica e recarrega para as telas lerem os dados.
  window.addEventListener('hashchange', () => {
    if (aplicarAtalhoDeDados()) window.location.reload()
  })
}
