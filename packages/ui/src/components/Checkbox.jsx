import squareIcon from '../assets/icons/Square.svg'
import '../styles/SelectListModal.css'

/*
 * `tamanho` existe porque o dropdown de coluna do Fluxo de Caixa usa 20px
 * (Figma 2279:107233) e todo o resto do Gestao de Pessoas usa 24. O default e
 * 24, entao o GP nao muda.
 */
function Checkbox({ checked, tamanho = 24 }) {
  const marca = Math.round(tamanho * (14 / 24))
  if (!checked) {
    return <img src={squareIcon} alt="" width={tamanho} height={tamanho} />
  }
  return (
    <span
      className="select-list__checkbox select-list__checkbox--checked"
      style={tamanho === 24 ? undefined : { width: tamanho, height: tamanho }}
    >
      <svg width={marca} height={marca} viewBox="0 0 16 16" fill="none">
        <path
          d="M13.5 4.5L6 12L2.5 8.5"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export default Checkbox
