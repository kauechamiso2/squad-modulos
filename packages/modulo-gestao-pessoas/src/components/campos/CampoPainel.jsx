import './CampoPainel.css'

// Campo com rotulo dos paineis laterais - Figma 10338:10189 (dados
// bancarios) e 10343:14743 (informacoes do recurso): rotulo cinza e caixa
// de 56px com borda.
function CampoPainel({ rotulo, placeholder, valor, onChange, inputMode, type = 'text' }) {
  return (
    <label className="campo-painel">
      <span className="campo-painel__rotulo">{rotulo}</span>
      <input
        className="campo-painel__entrada"
        type={type}
        placeholder={placeholder}
        value={valor}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

export default CampoPainel
