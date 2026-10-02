import CltShell from '../addCollaborator/clt/CltShell.jsx'
import CheckVerde from '../campos/CheckVerde.jsx'
import '../campos/Botoes.css'
import '../addCollaborator/clt/CltShell.css'

// Nome da verba - Figma 10343:14541 e 10343:14650. "Outro" (beneficio e
// licenca) usa o mesmo passo (contexto, secao 7, Assumptions).
function NomeStep({ titulo, placeholder, valor, onChange, progress, onBack, onClose, onContinue }) {
  const preenchido = valor.trim().length > 0
  return (
    <CltShell
      title="Novo recurso"
      onClose={onClose}
      progress={progress}
      footerLeft={
        <button type="button" className="gp-botao-texto" onClick={onBack}>
          Voltar
        </button>
      }
      footerRight={
        <button type="button" className="gp-botao" disabled={!preenchido} onClick={onContinue}>
          Continuar
        </button>
      }
    >
      <div className="clt-shell__content">
        <h1 className="clt-shell__title">{titulo}</h1>
        <div className={preenchido ? 'clt-large-input-wrap clt-large-input-wrap--filled' : 'clt-large-input-wrap'}>
          <input
            type="text"
            autoFocus
            className="clt-large-input"
            placeholder={placeholder}
            value={valor}
            onChange={(event) => onChange(event.target.value)}
          />
          {preenchido && <CheckVerde />}
        </div>
      </div>
    </CltShell>
  )
}

export default NomeStep
