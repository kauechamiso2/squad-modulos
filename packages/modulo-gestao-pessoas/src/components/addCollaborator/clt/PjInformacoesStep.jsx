import InlineEditField from '../../colaborador/InlineEditField.jsx'
import CltShell from './CltShell.jsx'
import {
  CampoContato,
  CampoDataAdmissao,
  CampoDataFim,
  CampoMascarado,
  CampoMoeda,
  CampoPagamento,
  LinhaFluxo,
} from '../../campos/CamposFluxo.jsx'
import { cnpjValido, mascaraCnpj } from '../../../utils/mascaras.js'
import { PAGAMENTOS, SUFIXO_PAGAMENTO } from '../../../utils/custos.js'
import '../../campos/Botoes.css'
import './CltShell.css'

/*
 * Passo 4 do PJ - Figma 10338:11594 (linhas 10338:11602). Continuar fica
 * sempre ativo e abre o painel de contrato.
 */
function PjInformacoesStep({ dados, onChange, progress, onBack, onClose, onContinue }) {
  const set = (campo) => (valor) => onChange({ ...dados, [campo]: valor })
  const sufixo = SUFIXO_PAGAMENTO[dados.pagamento]

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
        <button type="button" className="gp-botao" onClick={onContinue}>
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
          <LinhaFluxo rotulo="CNPJ">
            <CampoMascarado
              valor={dados.cnpj}
              onSalvar={set('cnpj')}
              mascara={mascaraCnpj}
              limite={14}
              validar={cnpjValido}
              vazio="Adicionar"
            />
          </LinhaFluxo>
          <LinhaFluxo rotulo="Razão social">
            <InlineEditField
              value={dados.razaoSocial ?? ''}
              displayValue={dados.razaoSocial || 'Adicionar'}
              onSave={(texto) => set('razaoSocial')(texto.trim() || null)}
            />
          </LinhaFluxo>
          <LinhaFluxo rotulo="Contato">
            <CampoContato valor={dados.contato} onSalvar={set('contato')} />
          </LinhaFluxo>
          <LinhaFluxo rotulo="Data de admissão">
            <CampoDataAdmissao
              valor={dados.dataAdmissao}
              onSalvar={(data) => {
                // Uma data de fim antes da nova admissao deixa de valer.
                const fimInvalido = dados.dataFimContrato && dados.dataFimContrato < data
                onChange({ ...dados, dataAdmissao: data, ...(fimInvalido ? { dataFimContrato: null } : {}) })
              }}
            />
          </LinhaFluxo>
          <LinhaFluxo rotulo="Data de fim do contrato">
            <CampoDataFim
              valor={dados.dataFimContrato}
              semData={dados.semDataFim}
              minDate={dados.dataAdmissao}
              onSalvar={({ data, semData }) => onChange({ ...dados, dataFimContrato: data, semDataFim: semData })}
            />
          </LinhaFluxo>
          <LinhaFluxo rotulo="Pagamento">
            <CampoPagamento valor={dados.pagamento} opcoes={PAGAMENTOS} onSalvar={set('pagamento')} />
          </LinhaFluxo>
          <LinhaFluxo rotulo="Valor do contrato">
            <span className="linha-fluxo__com-sufixo">
              <CampoMoeda valor={dados.valorContrato} onSalvar={set('valorContrato')} />
              {sufixo && <span className="linha-fluxo__sufixo">{sufixo}</span>}
            </span>
          </LinhaFluxo>
        </div>
      </div>
    </CltShell>
  )
}

export default PjInformacoesStep
