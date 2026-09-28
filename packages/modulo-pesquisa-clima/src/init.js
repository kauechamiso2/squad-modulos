import { migrarChaveLegada } from './lib/pesquisas.js'

// Roda uma vez, antes do primeiro render, no mesmo padrao do modulo de
// Gestao de Pessoas.
export function initPesquisaClima() {
  migrarChaveLegada()
}
