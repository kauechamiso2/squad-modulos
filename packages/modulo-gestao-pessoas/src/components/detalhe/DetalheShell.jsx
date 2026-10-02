import { IconButton, PainelLateral } from '@squad/ui'
import closeIcon from '../../assets/icons/Close.svg'
import trashIcon from '../../assets/icons/Trash.svg'
import powerIcon from '../../assets/icons/Power.svg'
import frameCornersIcon from '../../assets/icons/FrameCorners.svg'
import backToModalIcon from '../../assets/icons/Back-to-Modal.svg'
import './Detalhe.css'

/*
 * Acoes da direita do cabecalho - "Detail page shell" (Figma 10355:1842 e
 * 10355:2086): Trash vermelho, Power (so colaborador, e so quando passado) e
 * FrameCorners no painel ou Back-to-Modal na tela cheia, 12px entre eles.
 */
export function CabecalhoDetalhe({ mode, onExcluir, onDesligar, onExpandir, onRecolher }) {
  return (
    <span className="detalhe__acoes">
      <IconButton icon={trashIcon} alt="Excluir" onClick={onExcluir} />
      {onDesligar && <IconButton icon={powerIcon} alt="Desligar" onClick={onDesligar} />}
      {mode === 'full' ? (
        <IconButton icon={backToModalIcon} alt="Recolher" onClick={onRecolher} />
      ) : (
        <IconButton icon={frameCornersIcon} alt="Expandir" onClick={onExpandir} />
      )}
    </span>
  )
}

/*
 * Casca das paginas de colaborador, time e recurso. Painel: 540px, 20px do
 * topo e da direita, rolagem interna, secoes a 40px. Tela cheia: cabecalho de
 * 64px e duas colunas, a esquerda de 500px em 320px e a direita de 316px em
 * 880px (Figma 10355:2085). O modo tela cheia e classe extra no MESMO painel,
 * para os dois animarem um para o outro.
 *
 * `painel`: o conteudo na ordem do painel. `esquerda` e `direita`: as colunas
 * da tela cheia.
 */
function DetalheShell({
  aberto,
  mode,
  titulo,
  className = '',
  acoes,
  onClose,
  painel,
  esquerda,
  direita,
  children,
}) {
  const cheio = mode === 'full'
  return (
    <PainelLateral
      aberto={aberto}
      titulo={<span className="detalhe__titulo">{titulo}</span>}
      /* O foco inicial vem para o X, nunca para a lixeira. */
      acaoEsquerda={<IconButton icon={closeIcon} alt="Fechar" data-foco-inicial onClick={onClose} />}
      acaoDireita={acoes}
      comRodape={false}
      onFechar={onClose}
      className={['gp-painel', 'detalhe', cheio ? 'detalhe--full' : 'detalhe--panel', className].join(' ').trim()}
      classNameVeu={`gp-painel ${cheio ? 'detalhe__veu--oculto' : ''}`.trim()}
    >
      {cheio ? (
        <div className="detalhe__colunas">
          <div className="detalhe__coluna detalhe__coluna--esquerda">{esquerda}</div>
          <div className="detalhe__coluna detalhe__coluna--direita">{direita}</div>
        </div>
      ) : (
        <div className="detalhe__painel">{painel}</div>
      )}
      {children}
    </PainelLateral>
  )
}

export default DetalheShell
