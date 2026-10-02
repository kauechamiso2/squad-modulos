import { useEffect, useMemo, useRef, useState } from 'react'
import briefcaseIcon from '../../../assets/icons/Briefcase.svg'
import plusIcon from '../../../assets/icons/PlusBlack.svg'
import CltShell from './CltShell.jsx'
import CheckVerde from '../../campos/CheckVerde.jsx'
import '../../campos/Botoes.css'
import './CltShell.css'
import './CargoStep.css'

/*
 * Passo 3 - Figma 10338:10536 (vazio), 10338:10551 (digitando, lista
 * 10338:10566) e 10338:10585 (escolhido). Cargo e texto livre: a lista
 * sugere os cargos em uso que batem com o texto e, por ultimo,
 * 'Add "{texto}"', que fica com o que foi digitado.
 */
function CargoStep({ name, cargosEmUso, initialCargo, progress, onBack, onClose, onSkip, onContinue }) {
  const [texto, setTexto] = useState(initialCargo)
  const [escolhido, setEscolhido] = useState(Boolean(initialCargo))
  const [aberto, setAberto] = useState(false)
  const campoRef = useRef(null)

  useEffect(() => {
    if (!aberto) return
    function fecharFora(event) {
      if (campoRef.current && !campoRef.current.contains(event.target)) setAberto(false)
    }
    document.addEventListener('mousedown', fecharFora)
    return () => document.removeEventListener('mousedown', fecharFora)
  }, [aberto])

  const busca = texto.trim()
  const sugestoes = useMemo(() => {
    if (!busca) return []
    const termo = busca.toLowerCase()
    return cargosEmUso.filter((cargo) => cargo.toLowerCase().includes(termo))
  }, [busca, cargosEmUso])

  const escolher = (cargo) => {
    setTexto(cargo)
    setEscolhido(true)
    setAberto(false)
  }

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
        <div className="clt-shell__footer-row-right">
          <button type="button" className="gp-botao-texto" onClick={onSkip}>
            Não tenho ainda, pular
          </button>
          <button type="button" className="gp-botao" onClick={() => onContinue(busca)}>
            Continuar
          </button>
        </div>
      }
    >
      <div className="clt-shell__content">
        <h1 className="clt-shell__title">
          Muito bem,
          <br />
          hora de definir o cargo
          <br />
          de <span className="clt-shell__destaque">{name}.</span>
        </h1>

        <div className="cargo-step__campo" ref={campoRef}>
          <div
            className={
              escolhido ? 'clt-large-input-wrap clt-large-input-wrap--filled' : 'clt-large-input-wrap'
            }
          >
            <input
              type="text"
              autoFocus
              className="clt-large-input"
              placeholder="Adicionar cargo"
              value={texto}
              onChange={(event) => {
                setTexto(event.target.value)
                setEscolhido(false)
                setAberto(true)
              }}
              onFocus={() => busca && !escolhido && setAberto(true)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && busca) escolher(busca)
                if (event.key === 'Escape') setAberto(false)
              }}
            />
            {escolhido && <CheckVerde />}
          </div>

          {aberto && busca && (
            <div className="cargo-step__lista" role="listbox">
              {sugestoes.map((cargo) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  key={cargo}
                  className="cargo-step__item"
                  onClick={() => escolher(cargo)}
                >
                  <img src={briefcaseIcon} width={24} height={24} alt="" />
                  <span className="cargo-step__rotulo">{cargo}</span>
                </button>
              ))}
              <button
                type="button"
                role="option"
                aria-selected={false}
                className="cargo-step__item"
                onClick={() => escolher(busca)}
              >
                <img src={briefcaseIcon} width={24} height={24} alt="" />
                <span className="cargo-step__rotulo">Add &quot;{busca}&quot;</span>
                <img src={plusIcon} width={24} height={24} alt="" />
              </button>
            </div>
          )}
        </div>
      </div>
    </CltShell>
  )
}

export default CargoStep
