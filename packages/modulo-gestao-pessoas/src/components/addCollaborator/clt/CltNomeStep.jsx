import CheckVerde from '../../campos/CheckVerde.jsx'
import CltShell from './CltShell.jsx'
import '../../campos/Botoes.css'
import './CltShell.css'

function CltNomeStep({ name, onNameChange, progress, onBack, onClose, onContinue }) {
  const canContinue = name.trim().length > 0

  return (
    <CltShell
      onClose={onClose}
      progress={progress}
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
          Qual o nome
          <br />
          do novo colaborador?
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
            placeholder="Nome do colaborador"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
          />
          {name && <CheckVerde />}
        </div>
      </div>
    </CltShell>
  )
}

export default CltNomeStep
