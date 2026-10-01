import { useState } from 'react'
import { Briefcase, UsersFour } from '@phosphor-icons/react'
import userIcon from '../../../assets/icons/User.svg'
import phoneCallIcon from '../../../assets/icons/PhoneCall.svg'
import identificationCardIcon from '../../../assets/icons/IdentificationCard.svg'
import atIcon from '../../../assets/icons/At.svg'
import checkCircleGrayIcon from '../../../assets/icons/CheckCircleGray.svg'
import piggyBankIcon from '../../../assets/icons/PiggyBank.svg'
import eyeIcon from '../../../assets/icons/Eye.svg'
import plusGrayIcon from '../../../assets/icons/PlusGray.svg'
import checkCircleIcon from '../../../assets/icons/CheckCircle.svg'
import circleDashedIcon from '../../../assets/icons/CircleDashed.svg'
import filePdfIcon from '../../../assets/icons/FilePdf.svg'
import filePngIcon from '../../../assets/icons/FilePng.svg'
import downloadIcon from '../../../assets/icons/DownloadSimple.svg'
import arrowUpRightIcon from '../../../assets/icons/ArrowUpRight.svg'
import { EyeSlash } from '@phosphor-icons/react'
import InlineEditField from '../InlineEditField.jsx'
import CargoField from '../CargoField.jsx'
import ReportaParaField from '../ReportaParaField.jsx'
import DateField from '../DateField.jsx'
import TimesField from './TimesField.jsx'
import DadosBancariosPanel from './DadosBancariosPanel.jsx'
import { CampoContato, CampoMascarado } from '../../campos/CamposFluxo.jsx'
import { STATUS, getStatus } from '../../../utils/colaboradorStatus.js'
import { documentosDoColaborador, recursosDoColaborador } from '../../../utils/cadastro.js'
import { getBeneficiaryValue } from '../../../utils/beneficiarios.js'
import { getBeneficioTypeIcon } from '../../../utils/beneficioOptions.js'
import { TIPOS_RECURSO, tituloDoRecurso } from '../../../utils/recursos.js'
import { cnpjValido, cpfValido, emailValido, mascaraCnpj, mascaraCpf } from '../../../utils/mascaras.js'
import { SUFIXO_PAGAMENTO, custoBaseDoColaborador } from '../../../utils/custos.js'
import { useFitStatFontSize } from '../../../utils/useFitStatFontSize.js'
import {
  amountToDigits,
  centsToAmount,
  formatAmountFromDigits,
  formatCurrencyBRL,
  formatDateDMonthYear,
  todayIso,
} from '../../../utils/formatters.js'
import './Perfil.css'

const OCULTO = '••••••'
const TIPOS_CONTA = { corrente: 'Corrente', poupanca: 'Poupança' }
const ICONES_ARQUIVO = { pdf: filePdfIcon, png: filePngIcon }

// "Status do processo" - Figma 10338:9432. So em Pendente e Rescisao
// pendente; o contador e o do status, nunca o do mock.
function StatusProcesso({ colaborador }) {
  const status = getStatus(colaborador)
  if (status.id !== STATUS.PENDENTE && status.id !== STATUS.RESCISAO_PENDENTE) return null
  return (
    <div className="perfil-status">
      <div className="perfil-status__topo">
        <span>Status do processo</span>
        <span className="perfil-status__contador">{status.texto}</span>
      </div>
      {status.checklist.map((item) => (
        <div className="perfil-status__item" key={item.id}>
          <img src={item.feito ? checkCircleIcon : circleDashedIcon} width={20} height={20} alt={item.feito ? 'Feito' : 'Pendente'} />
          {item.rotulo}
        </div>
      ))}
    </div>
  )
}

function Cabecalho({ colaborador }) {
  return (
    <div className="perfil-cabecalho">
      <span className="perfil-cabecalho__avatar">
        <img src={userIcon} width={20} height={20} alt="" />
      </span>
      <span className="perfil-cabecalho__nome">{colaborador.name}</span>
      <span className="perfil-cabecalho__tipo">{colaborador.tipo}</span>
    </div>
  )
}

/*
 * Linha de campo - Figma 10338:9462: 62px, icone de 20, rotulo Medium e o
 * valor Regular. Vazio: "Adicionar" em Medium e o mais no fim da linha.
 */
function Linha({ icone, rotulo, vazio, acessorio, rotuloEstreito = false, children }) {
  return (
    <div className={vazio ? 'perfil-linha perfil-linha--vazia' : 'perfil-linha'}>
      <span className="perfil-linha__icone">{icone}</span>
      <span className={rotuloEstreito ? 'perfil-linha__rotulo perfil-linha__rotulo--estreito' : 'perfil-linha__rotulo'}>
        {rotulo}
      </span>
      <div className="perfil-linha__valor">{children}</div>
      {vazio ? <img className="perfil-linha__mais" src={plusGrayIcon} width={24} height={24} alt="" /> : acessorio}
    </div>
  )
}

const iconeSvg = (src) => <img src={src} width={20} height={20} alt="" />

function CampoValor({ valor, oculto, travado, onSalvar, semMoeda = false }) {
  const texto = semMoeda ? formatAmountFromDigits(amountToDigits(valor)) : formatCurrencyBRL(valor ?? 0)
  return (
    <InlineEditField
      value={amountToDigits(valor)}
      displayValue={valor == null ? 'Adicionar' : oculto ? OCULTO : texto}
      disabled={travado}
      formatForInput={(digitos) => (digitos ? formatAmountFromDigits(digitos) : '')}
      parseInput={(texto) => texto.replace(/\D/g, '')}
      onSave={(digitos) => onSalvar(digitos ? centsToAmount(digitos) : null)}
    />
  )
}

function Olho({ visivel, onAlternar, rotulo }) {
  return (
    <button
      type="button"
      className="perfil-linha__olho"
      aria-label={visivel ? `Ocultar ${rotulo}` : `Mostrar ${rotulo}`}
      onClick={onAlternar}
    >
      {visivel ? <EyeSlash size={24} color="var(--color-text-secondary)" /> : <img src={eyeIcon} width={24} height={24} alt="" />}
    </button>
  )
}

// CLT mostra o CPF; PJ, o CNPJ.
const DOCUMENTOS = {
  CLT: { campo: 'cpf', mascara: mascaraCpf, limite: 11, validar: cpfValido, sufixo: 'CPF' },
  PJ: { campo: 'cnpj', mascara: mascaraCnpj, limite: 14, validar: cnpjValido, sufixo: 'CNPJ' },
}

function Campos({ colaborador, colaboradores, times, travado, onAtualizar, onCriarTime }) {
  const documento = DOCUMENTOS[colaborador.tipo]
  const [salarioVisivel, setSalarioVisivel] = useState(false)
  const [custoVisivel, setCustoVisivel] = useState(false)
  const cargosEmUso = [...new Set(colaboradores.flatMap((item) => item.cargos ?? []))]
  // Reporta para busca so entre Pendente e Em atividade.
  const candidatos = colaboradores.filter((item) =>
    [STATUS.PENDENTE, STATUS.EM_ATIVIDADE].includes(getStatus(item).id),
  )

  return (
    <div className="perfil-campos">
      <Linha icone={iconeSvg(phoneCallIcon)} rotulo="Contato" vazio={!colaborador.contato}>
        <CampoContato valor={colaborador.contato} disabled={travado} onSalvar={(valor) => onAtualizar('contato', valor)} />
      </Linha>
      <Linha icone={iconeSvg(identificationCardIcon)} rotulo="Documento" vazio={!colaborador[documento.campo]}>
        <span className="perfil-linha__documento">
          <CampoMascarado
            valor={colaborador[documento.campo]}
            onSalvar={(valor) => onAtualizar(documento.campo, valor)}
            mascara={documento.mascara}
            limite={documento.limite}
            validar={documento.validar}
            vazio="Adicionar"
            disabled={travado}
          />
          {colaborador[documento.campo] && <span className="perfil-linha__sufixo">{documento.sufixo}</span>}
        </span>
      </Linha>
      <Linha icone={<Briefcase size={20} color="var(--color-text-secondary)" />} rotulo="Cargo" vazio={!colaborador.cargos.length}>
        <CargoField
          value={colaborador.cargos}
          cargoOptions={cargosEmUso}
          disabled={travado}
          onSave={(valor) => onAtualizar('cargos', valor)}
        />
      </Linha>
      <Linha icone={iconeSvg(atIcon)} rotulo="Email" vazio={!colaborador.email}>
        <InlineEditField
          value={colaborador.email ?? ''}
          displayValue={colaborador.email || 'Adicionar'}
          disabled={travado}
          validate={(texto) => texto.trim() === '' || emailValido(texto)}
          onSave={(texto) => onAtualizar('email', texto.trim())}
        />
      </Linha>
      <Linha icone={<UsersFour size={20} color="var(--color-text-secondary)" />} rotulo="Time" vazio={!colaborador.times.length}>
        <TimesField
          value={colaborador.times}
          times={times}
          disabled={travado}
          onSave={(valor) => onAtualizar('times', valor)}
          onCriarTime={onCriarTime}
        />
      </Linha>
      <Linha icone={iconeSvg(userIcon)} rotulo="Reporta para" vazio={!colaborador.reportaPara}>
        <ReportaParaField
          value={colaborador.reportaPara}
          ownId={colaborador.id}
          collaborators={candidatos}
          disabled={travado}
          onSave={(nome) => onAtualizar('reportaPara', nome)}
        />
      </Linha>
      <Linha icone={iconeSvg(checkCircleGrayIcon)} rotulo="Ativo desde" vazio={!colaborador.dataAdmissao}>
        <DateField
          value={colaborador.dataAdmissao}
          disabled={travado}
          displayValue={colaborador.dataAdmissao ? formatDateDMonthYear(colaborador.dataAdmissao) : 'Adicionar'}
          onSave={(valor) => onAtualizar('dataAdmissao', valor)}
        />
      </Linha>
      {colaborador.tipo === 'PJ' ? (
        <Linha
          icone={iconeSvg(piggyBankIcon)}
          rotulo="Salário"
          rotuloEstreito
          vazio={colaborador.valorContrato == null}
          acessorio={<Olho visivel={salarioVisivel} rotulo="salário" onAlternar={() => setSalarioVisivel((v) => !v)} />}
        >
          {/* PJ: o valor do contrato com o sufixo do pagamento (Figma 10338:12202). */}
          <span className="perfil-linha__documento perfil-linha__documento--perto">
            <CampoValor
              valor={colaborador.valorContrato}
              oculto={!salarioVisivel}
              travado={travado}
              semMoeda
              onSalvar={(valor) => onAtualizar('valorContrato', valor)}
            />
            {colaborador.valorContrato != null && SUFIXO_PAGAMENTO[colaborador.pagamento] && (
              <span className="perfil-linha__sufixo perfil-linha__sufixo--regular">
                {SUFIXO_PAGAMENTO[colaborador.pagamento]}
              </span>
            )}
          </span>
        </Linha>
      ) : (
        <>
          <Linha
            icone={iconeSvg(piggyBankIcon)}
            rotulo="Salário bruto"
            rotuloEstreito
            vazio={colaborador.salario == null}
            acessorio={<Olho visivel={salarioVisivel} rotulo="salário bruto" onAlternar={() => setSalarioVisivel((v) => !v)} />}
          >
            <CampoValor
              valor={colaborador.salario}
              oculto={!salarioVisivel}
              travado={travado}
              onSalvar={(valor) => onAtualizar('salario', valor)}
            />
          </Linha>
          <Linha
            icone={iconeSvg(piggyBankIcon)}
            rotulo="Custo para empresa"
            rotuloEstreito
            vazio={colaborador.custoParaEmpresa == null}
            acessorio={<Olho visivel={custoVisivel} rotulo="custo para empresa" onAlternar={() => setCustoVisivel((v) => !v)} />}
          >
            <CampoValor
              valor={colaborador.custoParaEmpresa}
              oculto={!custoVisivel}
              travado={travado}
              onSalvar={(valor) => onAtualizar('custoParaEmpresa', valor)}
            />
          </Linha>
        </>
      )}
    </div>
  )
}

function formatTempoDeCasa(dataAdmissao, hoje) {
  if (!dataAdmissao || dataAdmissao > hoje) return '—'
  const [ano, mes] = dataAdmissao.split('-').map(Number)
  const [anoHoje, mesHoje] = hoje.split('-').map(Number)
  const meses = Math.max((anoHoje - ano) * 12 + (mesHoje - mes), 0)
  return `${Math.floor(meses / 12)}a ${meses % 12}m`
}

function formatNumero(valor) {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Custo total: custo para empresa (CLT) ou valor do contrato (PJ) mais os
// recursos, cada recurso uma vez.
function Metricas({ colaborador, recursosDaPessoa, hoje }) {
  const [visivel, setVisivel] = useState(false)
  const timeDaPessoa = colaborador.times[0] ?? null
  const custo =
    custoBaseDoColaborador(colaborador) +
    recursosDaPessoa.reduce((soma, recurso) => soma + getBeneficiaryValue(recurso, colaborador.id, timeDaPessoa), 0)
  const textoCusto = visivel ? formatNumero(custo) : OCULTO
  const textoTempo = formatTempoDeCasa(colaborador.dataAdmissao, hoje)
  const custoRef = useFitStatFontSize(textoCusto)
  const tempoRef = useFitStatFontSize(textoTempo)

  return (
    <section className="perfil-secao">
      <p className="perfil-secao__titulo">Métricas</p>
      <div className="perfil-metricas">
        <div className="perfil-metrica">
          <div className="perfil-metrica__topo">
            <span className="perfil-metrica__rotulo">Custo total</span>
            <Olho visivel={visivel} rotulo="custo total" onAlternar={() => setVisivel((v) => !v)} />
          </div>
          <span ref={custoRef} className="perfil-metrica__valor">{textoCusto}</span>
        </div>
        <div className="perfil-metrica">
          <span className="perfil-metrica__rotulo">Tempo de casa</span>
          <span ref={tempoRef} className="perfil-metrica__valor">{textoTempo}</span>
        </div>
      </div>
    </section>
  )
}

// Secao vazia - Figma 10338:9537: texto cinza, a acao e o mais.
function SecaoVazia({ texto, acao, onAcao }) {
  const conteudo = (
    <>
      <span className="perfil-vazio__acao">{acao}</span>
      <img src={plusGrayIcon} width={24} height={24} alt="" />
    </>
  )
  return (
    <div className="perfil-vazio">
      <span className="perfil-vazio__texto">{texto}</span>
      {onAcao ? (
        <button type="button" className="perfil-vazio__botao" onClick={onAcao}>
          {conteudo}
        </button>
      ) : (
        <span className="perfil-vazio__botao perfil-vazio__botao--inerte">{conteudo}</span>
      )}
    </div>
  )
}

function Recursos({ colaborador, recursosDaPessoa }) {
  const timeDaPessoa = colaborador.times[0] ?? null
  return (
    <section className="perfil-secao">
      <p className="perfil-secao__titulo">Recursos</p>
      {recursosDaPessoa.length === 0 ? (
        // "Adicionar" ainda sem acao: o Figma nao mostra como adicionar daqui.
        <SecaoVazia texto="Nenhum recurso adicionado" acao="Adicionar" />
      ) : (
        recursosDaPessoa.map((recurso) => {
          const Icone = getBeneficioTypeIcon(recurso.tipo)
          return (
            <div className="colaborador-detail__beneficio-row" key={recurso.id}>
              <span className="colaborador-detail__beneficio-icon">
                <Icone size={18} />
              </span>
              <span className="colaborador-detail__beneficio-info">
                <span className="colaborador-detail__beneficio-tipo">{TIPOS_RECURSO[recurso.tipoRecurso]}</span>
                <span className="colaborador-detail__beneficio-name">{tituloDoRecurso(recurso)}</span>
              </span>
              <span className="colaborador-detail__beneficio-value">
                {formatCurrencyBRL(getBeneficiaryValue(recurso, colaborador.id, timeDaPessoa))}
              </span>
              <img src={arrowUpRightIcon} width={24} height={24} alt="" />
            </div>
          )
        })
      )}
    </section>
  )
}

function DadosBancarios({ dados, travado, onSalvar }) {
  const [aberto, setAberto] = useState(false)
  // Montado depois da primeira abertura, para animar a saida; a chave nova a
  // cada abertura zera o rascunho.
  const [aberturas, setAberturas] = useState(0)
  const abrir = () => {
    setAberturas((total) => total + 1)
    setAberto(true)
  }
  const linhas = dados
    ? [
        ['Banco', dados.banco],
        ['Agência', dados.agencia],
        ['Tipo de conta', dados.numeroConta ? TIPOS_CONTA[dados.tipoConta] : ''],
        ['Número da conta', dados.numeroConta],
        ['Titular da conta', dados.titular],
        ['Chave PIX', dados.chavePix],
      ].filter(([, valor]) => String(valor ?? '').trim() !== '')
    : []

  return (
    <section className="perfil-secao">
      <p className="perfil-secao__titulo">Dados bancários</p>
      {linhas.length === 0 ? (
        <SecaoVazia texto="Nenhum dado adicionado" acao="Adicionar" onAcao={travado ? undefined : abrir} />
      ) : (
        // Sem Figma para o estado salvo: linhas de rotulo e valor, e o clique
        // reabre o painel.
        <button type="button" className="perfil-bancarios" disabled={travado} onClick={abrir}>
          {linhas.map(([rotulo, valor]) => (
            <span className="perfil-bancarios__linha" key={rotulo}>
              <span className="perfil-bancarios__rotulo">{rotulo}</span>
              <span className="perfil-bancarios__valor">{valor}</span>
            </span>
          ))}
        </button>
      )}
      {aberturas > 0 && (
        <DadosBancariosPanel
          key={aberturas}
          aberto={aberto}
          valor={dados}
          onFechar={() => setAberto(false)}
          onSalvar={(valor) => {
            onSalvar(valor)
            setAberto(false)
          }}
        />
      )}
    </section>
  )
}

// Documentos ligados aos itens concluidos do checklist (Figma 10338:9558).
// Download e Adicionar sao so interface: ainda nao existe upload.
function Documentos({ colaborador }) {
  const documentos = documentosDoColaborador(colaborador)
  return (
    <section className="perfil-secao">
      <p className="perfil-secao__titulo">Documentos</p>
      {documentos.length === 0 ? (
        <SecaoVazia texto="Nenhum documento adicionado" acao="Adicionar" />
      ) : (
        <div className="perfil-documentos">
          {documentos.map((documento) => {
            const icone = ICONES_ARQUIVO[documento.formato]
            if (!icone) throw new Error(`Sem ícone para o arquivo "${documento.nome}"`)
            return (
              <div className="perfil-documento" key={documento.nome}>
                <span className="perfil-documento__badge">
                  <img src={icone} width={20} height={20} alt={documento.formato.toUpperCase()} />
                </span>
                <span className="perfil-documento__nome">{documento.nome}</span>
                <span className="perfil-documento__download">
                  Download
                  <img src={downloadIcon} width={24} height={24} alt="" />
                </span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

/*
 * Pagina do colaborador. CLT: Figma 10338:9174 (Pendente), 10338:9414 (com
 * documentos) e 10338:9671 (Em atividade). PJ: 10338:11975 (Pendente 1/1) e
 * 10338:12202 (Em atividade). A casca (painel, tela cheia, cabecalho, notas e
 * barra do Pipo) fica no ColaboradorDetail.
 */
function PerfilColaborador({ colaborador, colaboradores, times, recursos, travado, mode, pipoBar, notas, onAtualizar, onCriarTime }) {
  const hoje = todayIso()
  const recursosDaPessoa = recursosDoColaborador(colaborador, recursos, colaboradores, hoje)

  const principal = (
    <>
      <StatusProcesso colaborador={colaborador} />
      <div className="perfil-bloco">
        <Cabecalho colaborador={colaborador} />
        {pipoBar}
        <Campos
          colaborador={colaborador}
          colaboradores={colaboradores}
          times={times}
          travado={travado}
          onAtualizar={onAtualizar}
          onCriarTime={onCriarTime}
        />
        {mode !== 'full' && notas}
      </div>
      <Metricas colaborador={colaborador} recursosDaPessoa={recursosDaPessoa} hoje={hoje} />
      <Recursos colaborador={colaborador} recursosDaPessoa={recursosDaPessoa} />
      <section className="perfil-secao">
        <p className="perfil-secao__titulo">Jornada de trabalho</p>
        {/* So interface ate o Opy existir. */}
        <SecaoVazia texto="Nenhuma escala conectada" acao="Conectar" />
      </section>
      <DadosBancarios
        dados={colaborador.dadosBancarios}
        travado={travado}
        onSalvar={(valor) => onAtualizar('dadosBancarios', valor)}
      />
      <Documentos colaborador={colaborador} />
    </>
  )

  if (mode === 'full') {
    return (
      <div className="colaborador-detail__columns">
        <div className="colaborador-detail__column colaborador-detail__column--main perfil-colaborador">{principal}</div>
        <div className="colaborador-detail__column colaborador-detail__column--notes">{notas}</div>
      </div>
    )
  }
  return <div className="perfil-colaborador">{principal}</div>
}

export default PerfilColaborador
