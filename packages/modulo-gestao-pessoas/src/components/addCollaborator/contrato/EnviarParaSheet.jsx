import { useState } from 'react'
import xIcon from '../../../assets/icons/X.svg'
import CheckVerde from '../../campos/CheckVerde.jsx'
import SeletorSegmentado from '../../campos/SeletorSegmentado.jsx'
import { OPCOES_CONTATO, contatoValido, mascaraTelefone, soDigitos } from '../../../utils/mascaras.js'
import '../../campos/Botoes.css'
import './Contrato.css'

/*
 * Folha "Enviar para" - Figma 10338:10970 (Telefone 10338:10866, Email
 * 10338:10987). Abre por cima do painel de contrato. O X fecha sem salvar;
 * Salvar so com um contato valido.
 */
function EnviarParaSheet({ valor, onSalvar, onFechar }) {
  const [rascunho, setRascunho] = useState(valor ?? { tipo: 'telefone', valor: '' })
  const valido = contatoValido(rascunho)
  const ehEmail = rascunho.tipo === 'email'

  return (
    <>
      <div className="enviar-para__veu" onClick={onFechar} />
      <div className="enviar-para" role="dialog" aria-label="Enviar para">
        <div className="enviar-para__topo">
          <span className="enviar-para__titulo">Enviar para</span>
          <button type="button" className="enviar-para__fechar" aria-label="Fechar" onClick={onFechar}>
            <img src={xIcon} width={24} height={24} alt="" />
          </button>
        </div>

        <div className="enviar-para__campos">
          <SeletorSegmentado
            rotulo="Enviar por"
            opcoes={OPCOES_CONTATO}
            valor={rascunho.tipo}
            onChange={(tipo) => setRascunho({ tipo, valor: '' })}
          />
          <div className={valido ? 'clt-large-input-wrap clt-large-input-wrap--filled' : 'clt-large-input-wrap'}>
            <input
              autoFocus
              key={rascunho.tipo}
              className="clt-large-input"
              type={ehEmail ? 'email' : 'text'}
              inputMode={ehEmail ? 'email' : 'numeric'}
              placeholder={ehEmail ? 'nome@email.com' : '00 00000 0000'}
              value={ehEmail ? rascunho.valor : mascaraTelefone(rascunho.valor)}
              onChange={(event) =>
                setRascunho({
                  tipo: rascunho.tipo,
                  valor: ehEmail ? event.target.value.trim() : soDigitos(event.target.value, 11),
                })
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter' && valido) onSalvar(rascunho)
              }}
            />
            {valido && <CheckVerde />}
          </div>
        </div>

        <div className="enviar-para__rodape">
          <button type="button" className="gp-botao" disabled={!valido} onClick={() => onSalvar(rascunho)}>
            Salvar
          </button>
        </div>
      </div>
    </>
  )
}

export default EnviarParaSheet
