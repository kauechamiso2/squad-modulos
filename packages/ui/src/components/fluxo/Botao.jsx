import s from './Botao.module.css'

export default function Botao({
  variante = 'texto',
  desabilitado = false,
  onClick,
  children,
}) {
  const extra = variante === 'marca' ? s.marca : variante === 'contorno' ? s.contorno : ''
  const classe = extra ? `${s.botao} ${extra}` : s.botao
  return (
    <button
      type="button"
      className={classe}
      disabled={desabilitado}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
