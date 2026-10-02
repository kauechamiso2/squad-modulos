import { useState } from 'react'
import { PainelLateral } from '@squad/ui'
import closeIcon from '../../assets/icons/Close.svg'
import CltShell from '../addCollaborator/clt/CltShell.jsx'
import { LinhaFluxo } from '../campos/CamposFluxo.jsx'
import CampoPainel from '../campos/CampoPainel.jsx'
import '../campos/Botoes.css'
import '../addCollaborator/clt/CltShell.css'
import './NovoRecurso.css'

/*
 * Informacoes - Figma 10343:14709 e painel "Adicionar" 10343:14743. Qualquer
 * "Adicionar" abre o painel com os tres campos. A Licenca usa o mesmo
 * layout, com "Link da licenca" (contexto, Assumptions).
 */
function InfoStep({ rotuloLink, valor, onChange, rotuloCriar, progress, onBack, onClose, onCriar }) {
  const [aberto, setAberto] = useState(false)
  const [aberturas, setAberturas] = useState(0)
  const [rascunho, setRascunho] = useState(valor)
  const abrir = () => {
    setRascunho(valor)
    setAberturas((total) => total + 1)
    setAberto(true)
  }
  const campos = [
    { chave: 'link', rotulo: rotuloLink },
    { chave: 'contato', rotulo: 'Contato do fornecedor' },
    { chave: 'email', rotulo: 'Email do fornecedor' },
  ]

  return (
    <>
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
          <button type="button" className="gp-botao" onClick={onCriar}>
            {rotuloCriar}
          </button>
        }
      >
        <div className="clt-shell__content">
          <h1 className="clt-shell__title">
            Finalize com algumas
            <br />
            informações adicionais.
          </h1>
          <div>
            {campos.map((campo) => (
              <LinhaFluxo key={campo.chave} rotulo={campo.rotulo}>
                <button type="button" className="linha-fluxo__botao" onClick={abrir}>
                  {valor[campo.chave] || 'Adicionar'}
                </button>
              </LinhaFluxo>
            ))}
          </div>
        </div>
      </CltShell>

      {aberturas > 0 && (
        <PainelLateral
          key={aberturas}
          className="gp-painel"
          classNameVeu="gp-painel"
          aberto={aberto}
          titulo="Adicionar"
          iconeFechar={closeIcon}
          onFechar={() => setAberto(false)}
          rodape={
            <>
              <button type="button" className="gp-botao-texto" onClick={() => setAberto(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className="gp-botao"
                onClick={() => {
                  onChange(rascunho)
                  setAberto(false)
                }}
              >
                Salvar
              </button>
            </>
          }
        >
          <div className="recurso-info-painel">
            {campos.map((campo) => (
              <CampoPainel
                key={campo.chave}
                rotulo={campo.rotulo}
                placeholder={campo.rotulo}
                type={campo.chave === 'email' ? 'email' : 'text'}
                valor={rascunho[campo.chave]}
                onChange={(texto) => setRascunho((atual) => ({ ...atual, [campo.chave]: texto }))}
              />
            ))}
          </div>
        </PainelLateral>
      )}
    </>
  )
}

export default InfoStep
