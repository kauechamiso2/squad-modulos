import CheckVerde from '../../campos/CheckVerde.jsx'
import CltShell from '../../addCollaborator/clt/CltShell.jsx'
import '../../campos/Botoes.css'
import '../../addCollaborator/clt/CltShell.css'

// Passo 1 - Figma 10342:12820 e 10342:12832. Voltar aqui fecha o fluxo sem
// modal.
function TimeNomeStep({ name, onNameChange, onBack, onClose, onContinue }) {
  const canContinue = name.trim().length > 0

  return (
    <CltShell
      title="Novo time"
      onClose={onClose}
      progress={25}
      footerLeft={
        <button type="button" className="gp-botao-texto" onClick={onBack}>
          Voltar
        </button>
      }
      footerRight={
        <button
          type="button"
          className="gp-botao"
          disabled={!canContinue}
          onClick={onContinue}
        >
          Continuar
        </button>
      }
    >
      <div className="clt-shell__content">
        <h1 className="clt-shell__title">
          Qual será
          <br />
          o nome do time?
        </h1>

        <div
          className={
            name
              ? 'clt-large-input-wrap clt-large-input-wrap--filled'
              : 'clt-large-input-wrap'
          }
        >
          <input
            type="text"
            autoFocus
            className="clt-large-input"
            placeholder="Nome do time"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
          />
          {name && <CheckVerde />}
        </div>
      </div>
    </CltShell>
  )
}

export default TimeNomeStep
