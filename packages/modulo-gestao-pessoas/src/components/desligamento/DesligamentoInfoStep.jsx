import { useState } from 'react'
import CltShell from '../addCollaborator/clt/CltShell.jsx'
import { CampoDataAdmissao, CampoMoeda, CampoPagamento, LinhaFluxo } from '../campos/CamposFluxo.jsx'
import { DescricaoPanel } from '../addTeam/novoTime/TimePaineis.jsx'
import { AVISOS_PREVIOS } from '../../utils/colaboradorStatus.js'
import { addDaysIso, todayIso } from '../../utils/formatters.js'
import '../campos/Botoes.css'
import '../addCollaborator/clt/CltShell.css'

const LIMITE_MOTIVO = 40
const OPCOES_AVISO = Object.entries(AVISOS_PREVIOS).map(([id, rotulo]) => ({ id, rotulo }))
const DAQUI_A_30_DIAS = { rotulo: 'Daqui a 30 dias', data: () => addDaysIso(todayIso(), 30) }

/*
 * Passo 2 do desligamento - Figma 10355:4866 (CLT) e 10355:7821 (PJ), no
 * padrao das linhas de informacao. CLT: data, aviso previo (sem a linha em Com
 * justa causa) e motivo. PJ: data, motivo e multa. Continuar so com a data
 * (premissa do contexto; o Figma desenha o botao ativo).
 */
function DesligamentoInfoStep({ tipoContrato, dados, onChange, progress, onBack, onClose, onContinue }) {
  const [motivoAberto, setMotivoAberto] = useState(false)
  // O painel fica montado para animar a saida; a chave nova a cada abertura
  // zera o rascunho.
  const [aberturas, setAberturas] = useState(0)
  const set = (campo) => (valor) => onChange({ ...dados, [campo]: valor })
  const resumoMotivo =
    dados.motivo && dados.motivo.length > LIMITE_MOTIVO ? `${dados.motivo.slice(0, LIMITE_MOTIVO)}…` : dados.motivo

  return (
    <>
      <CltShell
        title="Desligamento"
        onClose={onClose}
        progress={progress}
        footerLeft={
          <button type="button" className="gp-botao-texto" onClick={onBack}>
            Voltar
          </button>
        }
        footerRight={
          <button type="button" className="gp-botao" disabled={!dados.data} onClick={onContinue}>
            Continuar
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
            <LinhaFluxo rotulo="Data do desligamento">
              <CampoDataAdmissao
                valor={dados.data}
                onSalvar={set('data')}
                atalho={DAQUI_A_30_DIAS}
                rotuloCalendario="Escolher data do desligamento"
              />
            </LinhaFluxo>
            {tipoContrato === 'CLT' && dados.avisoPrevio && (
              <LinhaFluxo rotulo="Aviso prévio">
                <CampoPagamento
                  rotulo="Aviso prévio"
                  valor={dados.avisoPrevio}
                  opcoes={OPCOES_AVISO}
                  onSalvar={set('avisoPrevio')}
                />
              </LinhaFluxo>
            )}
            <LinhaFluxo rotulo="Motivo do desligamento">
              <button
                type="button"
                className="linha-fluxo__botao"
                onClick={() => {
                  setAberturas((total) => total + 1)
                  setMotivoAberto(true)
                }}
              >
                {dados.motivo ? resumoMotivo : 'Adicionar'}
              </button>
            </LinhaFluxo>
            {tipoContrato === 'PJ' && (
              <LinhaFluxo rotulo="Multa por rescisão antecipada">
                <CampoMoeda valor={dados.multa} onSalvar={set('multa')} />
              </LinhaFluxo>
            )}
          </div>
        </div>
      </CltShell>

      {aberturas > 0 && (
        <DescricaoPanel
          key={aberturas}
          aberto={motivoAberto}
          titulo="Adicionar motivo"
          placeholder="Motivo do desligamento..."
          valor={dados.motivo ?? ''}
          onFechar={() => setMotivoAberto(false)}
          onSalvar={(texto) => {
            set('motivo')(texto || null)
            setMotivoAberto(false)
          }}
        />
      )}
    </>
  )
}

export default DesligamentoInfoStep
