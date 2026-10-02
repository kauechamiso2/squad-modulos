import arrowUpRightIcon from '../../assets/icons/ArrowUpRight.svg'
import CltShell from '../addCollaborator/clt/CltShell.jsx'
import '../addCollaborator/clt/CltShell.css'
import './NovoRecurso.css'

/*
 * Passo de cards - Figma 10343:14389 (tipo), 10343:14465 (categoria) e
 * 10343:14586 (servico): 3 por linha, 180px, badge, seta e rotulo. "Outro"
 * ocupa a linha inteira embaixo. Sem rodape: o clique avanca. O desligamento
 * usa o mesmo passo para o tipo de rescisao (10355:4796, 10355:7761).
 */
function CartoesStep({ tituloFluxo = 'Novo recurso', titulo, cartoes, comOutro = false, onEscolher, onClose }) {
  return (
    <CltShell title={tituloFluxo} onClose={onClose}>
      <div className="clt-shell__content">
        <h1 className="clt-shell__title">{titulo}</h1>
        <div className="recurso-cartoes">
          <div className="recurso-cartoes__grade">
            {cartoes.map((cartao) => (
              <button type="button" key={cartao.id} className="recurso-cartao" onClick={() => onEscolher(cartao.id)}>
                <span className="recurso-cartao__topo">
                  {cartao.marca}
                  <img src={arrowUpRightIcon} width={24} height={24} alt="" />
                </span>
                <span className="recurso-cartao__rotulo">{cartao.rotulo}</span>
              </button>
            ))}
          </div>
          {comOutro && (
            <button type="button" className="recurso-outro" onClick={() => onEscolher('Outro')}>
              <span>Outro</span>
              <span className="recurso-outro__seta">
                <img src={arrowUpRightIcon} width={24} height={24} alt="" />
              </span>
            </button>
          )}
        </div>
      </div>
    </CltShell>
  )
}

export default CartoesStep
