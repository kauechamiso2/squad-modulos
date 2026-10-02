import CheckVerde from '../../campos/CheckVerde.jsx'
import CltShell from '../../addCollaborator/clt/CltShell.jsx'
import '../../campos/Botoes.css'
import '../../addCollaborator/clt/CltShell.css'
import './NovoTimeSteps.css'

// Passo 1 - Figma 10342:12820 e 10342:12832. Voltar aqui fecha o fluxo sem
// modal. Nome repetido (secao 6, sem Figma): sem o check verde, Continuar
// desabilitado e a mensagem abaixo do campo.
function TimeNomeStep({ name, repetido = false, onNameChange, onBack, onClose, onContinue }) {
  const canContinue = name.trim().length > 0 && !repetido

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
          {name && !repetido && <CheckVerde />}
        </div>
        {repetido && <p className="time-step__erro-nome">Já existe um time com esse nome</p>}
      </div>
    </CltShell>
  )
}

export default TimeNomeStep
