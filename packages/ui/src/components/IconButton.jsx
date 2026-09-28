import './IconButton.css'

/*
 * `icon` aceita as duas formas que os consumidores tem: uma URL de SVG (o
 * Gestao de Pessoas, que importa .svg locais) ou um elemento React (o Fluxo de
 * Caixa, que usa @phosphor-icons/react). `alt` e `iconSize` so valem para a
 * URL - o elemento ja traz o proprio tamanho.
 */
function IconButton({
  icon,
  alt = '',
  onClick,
  size = 40,
  iconSize = 24,
  className = '',
  ...resto
}) {
  return (
    <button
      type="button"
      className={`icon-button ${className}`.trim()}
      style={{ width: size, height: size }}
      onClick={onClick}
      {...resto}
    >
      {typeof icon === 'string'
        ? <img src={icon} alt={alt} width={iconSize} height={iconSize} />
        : icon}
    </button>
  )
}

export default IconButton
