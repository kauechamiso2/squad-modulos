import CltShell from './CltShell.jsx'
import {
  CampoContato,
  CampoDataAdmissao,
  CampoMascarado,
  CampoMoeda,
  LinhaFluxo,
} from '../../campos/CamposFluxo.jsx'
import { cpfValido, dataDigitadaParaIso, isoParaDigitos, mascaraCpf, mascaraData } from '../../../utils/mascaras.js'
import '../../campos/Botoes.css'
import './CltShell.css'

/*
 * Passo 4 do CLT - Figma 10338:10601 (linhas 10338:10668). Continuar fica
 * sempre ativo e abre o painel de contrato.
 */
function CltInformacoesStep({ dados, onChange, progress, onBack, onClose, onContinue }) {
  const set = (campo) => (valor) => onChange({ ...dados, [campo]: valor })

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
          <LinhaFluxo rotulo="CPF">
            <CampoMascarado
              valor={dados.cpf}
              onSalvar={set('cpf')}
              mascara={mascaraCpf}
              limite={11}
              validar={cpfValido}
              vazio="Adicionar"
            />
          </LinhaFluxo>
          <LinhaFluxo rotulo="Contato">
            <CampoContato valor={dados.contato} onSalvar={set('contato')} />
          </LinhaFluxo>
          <LinhaFluxo rotulo="Data de nascimento">
            <CampoMascarado
              valor={isoParaDigitos(dados.dataNascimento)}
              onSalvar={(digitos) => set('dataNascimento')(digitos ? dataDigitadaParaIso(digitos) : null)}
              mascara={mascaraData}
              limite={8}
              validar={(digitos) => Boolean(dataDigitadaParaIso(digitos))}
              vazio="DD/MM/AAAA"
              vazioCinza
            />
          </LinhaFluxo>
          <LinhaFluxo rotulo="Data de admissão">
            <CampoDataAdmissao valor={dados.dataAdmissao} onSalvar={set('dataAdmissao')} />
          </LinhaFluxo>
          <LinhaFluxo rotulo="Salário bruto">
            <CampoMoeda valor={dados.salario} onSalvar={set('salario')} />
          </LinhaFluxo>
          <LinhaFluxo rotulo="Custo para empresa">
            <CampoMoeda valor={dados.custoParaEmpresa} onSalvar={set('custoParaEmpresa')} />
          </LinhaFluxo>
        </div>
      </div>
    </CltShell>
  )
}

export default CltInformacoesStep
