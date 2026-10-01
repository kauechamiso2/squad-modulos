import './SeletorSegmentado.css'

/*
 * Seletor de duas ou mais opcoes - Figma 10338:10977 (Telefone / Email no
 * "Enviar para"). Serve tambem para Contato e para Corrente / Poupanca.
 * `opcoes`: [{ id, rotulo }].
 */
function SeletorSegmentado({ opcoes, valor, onChange, rotulo }) {
  return (
    <div className="seletor-segmentado" role="radiogroup" aria-label={rotulo}>
      {opcoes.map((opcao) => (
        <button
          type="button"
          role="radio"
          aria-checked={valor === opcao.id}
          key={opcao.id}
          className={
            valor === opcao.id
              ? 'seletor-segmentado__opcao seletor-segmentado__opcao--ativa'
              : 'seletor-segmentado__opcao'
          }
          onClick={() => onChange(opcao.id)}
        >
          {opcao.rotulo}
        </button>
      ))}
    </div>
  )
}

export default SeletorSegmentado
