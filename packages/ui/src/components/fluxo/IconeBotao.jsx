import s from './IconeBotao.module.css'

/* `src` aceita uma URL de SVG ou um elemento React - ver IconButton. */
export default function IconeBotao({ src, rotulo, onClick }) {
  return (
    <button
      type="button"
      className={s.iconeBotao}
      aria-label={rotulo}
      onClick={onClick}
    >
      {typeof src === 'string'
        ? <img className={s.icone} src={src} alt="" width={24} height={24} />
        : src}
    </button>
  )
}
