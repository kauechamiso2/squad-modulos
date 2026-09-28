import s from './OpcaoRadio.module.css'

/*
 * Radio das escolhas "Essa entrada / Todas as proximas" e das configuracoes
 * avancadas do mensal. Estava so no Fluxo de Caixa; virou compartilhado quando
 * os modais de editar e remover passaram a usar o mesmo desenho.
 */
export default function OpcaoRadio({ marcada, onEscolher, children }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={marcada}
      className={s.opcao}
      onClick={onEscolher}
    >
      <span className={`${s.marca} ${marcada ? s.marcada : ''}`} />
      <span>{children}</span>
    </button>
  )
}
