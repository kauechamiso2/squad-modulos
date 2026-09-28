import { aparar } from './respostas.js'
import { sincronizarHistorico } from './historico.js'

/*
 * Depois de uma virada de status — ou de uma troca de público —, as respostas
 * e o histórico acertam o passo na mesma gravação.
 *
 * Se esperassem o próximo giro do motor, as abas Respostas e Ciclos
 * passariam até 30s mostrando o ciclo que acabou de fechar — pausar e ir
 * direto nos Ciclos mostraria uma linha a menos.
 *
 * Do lado das respostas o acerto é só a poda: público menor que a lista não
 * existe. Nada aqui repõe o que foi apagado.
 */
export const acertarPasso = (p) => sincronizarHistorico(aparar(p))
