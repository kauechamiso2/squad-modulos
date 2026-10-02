import { useState } from 'react'
import { createPortal } from 'react-dom'
import { PainelLateral } from '@squad/ui'
import closeIcon from '../../../assets/icons/Close.svg'
import SeletorSegmentado from '../../campos/SeletorSegmentado.jsx'
import Campo from '../../campos/CampoPainel.jsx'
import { dadosBancariosCompletos } from '../../../utils/cadastro.js'
import '../../campos/Botoes.css'
import './Perfil.css'

const TIPOS_CONTA = [
  { id: 'corrente', rotulo: 'Corrente' },
  { id: 'poupanca', rotulo: 'Poupança' },
]

const VAZIO = { banco: '', agencia: '', tipoConta: 'corrente', numeroConta: '', titular: '', chavePix: '' }

/*
 * Segundo painel da pagina do colaborador - Figma 10338:10177. Salvar exige
 * a conta inteira (banco, agencia, numero e titular) ou uma chave PIX.
 */
function DadosBancariosPanel({ aberto, valor, onFechar, onSalvar }) {
  const [rascunho, setRascunho] = useState(() => ({ ...VAZIO, ...valor }))
  const set = (campo) => (texto) => setRascunho((atual) => ({ ...atual, [campo]: texto }))

  // Fora do painel do colaborador, que define as proprias --painel-* (540px,
  // tela cheia) e elas vazariam para este. Dentro da .gp-modulo, para manter
  // os tokens do modulo.
  const destino = document.querySelector('.gp-modulo')
  if (!destino) throw new Error('DadosBancariosPanel precisa estar dentro de .gp-modulo')

  return createPortal(
    <PainelLateral
      className="gp-painel gp-painel--rolagem-afastada"
      classNameVeu="gp-painel"
      aberto={aberto}
      titulo="Dados bancários"
      iconeFechar={closeIcon}
      onFechar={onFechar}
      rodape={
        <>
          <button type="button" className="gp-botao-texto" onClick={onFechar}>
            Cancelar
          </button>
          <button
            type="button"
            className="gp-botao"
            disabled={!dadosBancariosCompletos(rascunho)}
            onClick={() => onSalvar(rascunho)}
          >
            Salvar
          </button>
        </>
      }
    >
      <div className="dados-bancarios">
        <Campo rotulo="Banco" placeholder="Nome ou código do banco" valor={rascunho.banco} onChange={set('banco')} />
        <div className="dados-bancarios__grupo">
          <Campo rotulo="Agência" placeholder="000" valor={rascunho.agencia} onChange={set('agencia')} inputMode="numeric" />
          <div className="dados-bancarios__conta">
            <SeletorSegmentado
              rotulo="Tipo de conta"
              opcoes={TIPOS_CONTA}
              valor={rascunho.tipoConta}
              onChange={set('tipoConta')}
            />
            <Campo
              rotulo="Número da conta"
              placeholder="00000 00"
              valor={rascunho.numeroConta}
              onChange={set('numeroConta')}
              inputMode="numeric"
            />
          </div>
        </div>
        <Campo rotulo="Titular da conta" placeholder="Nome do titular" valor={rascunho.titular} onChange={set('titular')} />
        <div className="dados-bancarios__pix">
          <Campo rotulo="Chave PIX" placeholder="Chave" valor={rascunho.chavePix} onChange={set('chavePix')} />
        </div>
      </div>
    </PainelLateral>,
    destino,
  )
}

export default DadosBancariosPanel
