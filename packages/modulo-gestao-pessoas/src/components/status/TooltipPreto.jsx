import polygonIcon from '../../assets/icons/Polygon 1.svg'
import './TooltipPreto.css'

// Tooltip preto acima do icone, com a seta "Polygon 1" do Figma. Quem usa
// precisa ter position: relative.
function TooltipPreto({ texto }) {
  return (
    <span className="tooltip-preto" role="tooltip">
      <span className="tooltip-preto__caixa">{texto}</span>
      <span className="tooltip-preto__seta">
        <span className="tooltip-preto__seta-giro">
          <img src={polygonIcon} alt="" />
        </span>
      </span>
    </span>
  )
}

export default TooltipPreto
