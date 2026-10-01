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
import { MarcaDoRecurso } from '../../RecursosGrid.jsx'
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
import { OUTRO, TIPOS_RECURSO } from '../../../utils/recursos.js'
import { cnpjValido, cpfValido, emailValido, mascaraCnpj, mascaraCpf, tipoChavePix } from '../../../utils/mascaras.js'
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
const VAZIO = '—'
const TIPOS_CONTA = { corrente: 'Corrente', poupanca: 'Poupança' }
const ICONES_ARQUIVO = { pdf: filePdfIcon, png: filePngIcon }

// "Status do processo" - Figma 10338:9432 (admissao, so leitura) e
// 10355:4148 (desligamento). So com checklist aberto; o contador e o do
// status, nunca o do mock. No desligamento todo item aberto tem "Marcar como
// feito", inclusive os que o Figma desenhou sem: sem isso ninguem chega a
// Desligado ou Fim de contrato.
function StatusProcesso({ colaborador, onMarcarComoFeito }) {
  const status = getStatus(colaborador)
  if (status.id !== STATUS.PENDENTE && status.id !== STATUS.EM_DESLIGAMENTO) return null
  const marcavel = status.id === STATUS.EM_DESLIGAMENTO
  return (
    <div className="perfil-status">
      <div className="perfil-status__topo">
        <span>Status do processo</span>
        <span className="perfil-status__contador">{status.texto}</span>
      </div>
      {status.checklist.map((item) => (
        <div className="perfil-status__item" key={item.id}>
          <img src={item.feito ? checkCircleIcon : circleDashedIcon} width={20} height={20} alt={item.feito ? 'Feito' : 'Pendente'} />
          <span className="perfil-status__rotulo">{item.rotulo}</span>
          {marcavel && !item.feito && (
            <button type="button" className="perfil-status__marcar" onClick={() => onMarcarComoFeito(item.id)}>
              Marcar como feito
            </button>
          )}
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
 * Travada (Em desligamento em diante, 10355:4132): vazio vira "—", sem
 * "Adicionar" e sem o mais.
 */
function Linha({ icone, rotulo, vazio, travado = false, acessorio, rotuloEstreito = false, children }) {
  const vazioTravado = vazio && travado
  return (
    <div className={vazio && !travado ? 'perfil-linha perfil-linha--vazia' : 'perfil-linha'}>
      <span className="perfil-linha__icone">{icone}</span>
      <span className={rotuloEstreito ? 'perfil-linha__rotulo perfil-linha__rotulo--estreito' : 'perfil-linha__rotulo'}>
        {rotulo}
      </span>
      <div className="perfil-linha__valor">{vazioTravado ? <span className="perfil-linha__vazio">{VAZIO}</span> : children}</div>
      {vazio ? !travado && <img className="perfil-linha__mais" src={plusGrayIcon} width={24} height={24} alt="" /> : acessorio}
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
      <Linha travado={travado} icone={iconeSvg(phoneCallIcon)} rotulo="Contato" vazio={!colaborador.contato}>
        <CampoContato valor={colaborador.contato} disabled={travado} onSalvar={(valor) => onAtualizar('contato', valor)} />
      </Linha>
      <Linha travado={travado} icone={iconeSvg(identificationCardIcon)} rotulo="Documento" vazio={!colaborador[documento.campo]}>
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
      <Linha travado={travado} icone={<Briefcase size={20} color="var(--color-text-secondary)" />} rotulo="Cargo" vazio={!colaborador.cargos.length}>
        <CargoField
          value={colaborador.cargos}
          cargoOptions={cargosEmUso}
          disabled={travado}
          onSave={(valor) => onAtualizar('cargos', valor)}
        />
      </Linha>
      <Linha travado={travado} icone={iconeSvg(atIcon)} rotulo="Email" vazio={!colaborador.email}>
        <InlineEditField
          value={colaborador.email ?? ''}
          displayValue={colaborador.email || 'Adicionar'}
          disabled={travado}
          validate={(texto) => texto.trim() === '' || emailValido(texto)}
          onSave={(texto) => onAtualizar('email', texto.trim())}
        />
      </Linha>
      <Linha travado={travado} icone={<UsersFour size={20} color="var(--color-text-secondary)" />} rotulo="Time" vazio={!colaborador.times.length}>
        <TimesField
          value={colaborador.times}
          times={times}
          disabled={travado}
          onSave={(valor) => onAtualizar('times', valor)}
          onCriarTime={onCriarTime}
        />
      </Linha>
      <Linha travado={travado} icone={iconeSvg(userIcon)} rotulo="Reporta para" vazio={!colaborador.reportaPara}>
        <ReportaParaField
          value={colaborador.reportaPara}
          ownId={colaborador.id}
          collaborators={candidatos}
          disabled={travado}
          onSave={(nome) => onAtualizar('reportaPara', nome)}
        />
      </Linha>
      <Linha travado={travado} icone={iconeSvg(checkCircleGrayIcon)} rotulo="Ativo desde" vazio={!colaborador.dataAdmissao}>
        <DateField
          value={colaborador.dataAdmissao}
          disabled={travado}
          displayValue={colaborador.dataAdmissao ? formatDateDMonthYear(colaborador.dataAdmissao) : 'Adicionar'}
          onSave={(valor) => onAtualizar('dataAdmissao', valor)}
        />
      </Linha>
      {colaborador.tipo === 'PJ' ? (
        <Linha
          travado={travado}
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
            travado={travado}
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
            travado={travado}
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

// Secao vazia - Figma 10338:9537: texto cinza, a acao e o mais. Sem `acao`
// (perfil travado), so o texto.
function SecaoVazia({ texto, acao, onAcao }) {
  if (!acao) {
    return (
      <div className="perfil-vazio">
        <span className="perfil-vazio__texto">{texto}</span>
      </div>
    )
  }
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

// Tipo em cinza e nome de cada recurso na linha - Figma 10355:3706.
// Beneficio: a categoria e o fornecedor (ou o nome de Outro). Verba: "Verba"
// e o nome. Licenca: "Licença" e o servico (ou o nome de Outro).
function tipoENomeDoRecurso(recurso) {
  switch (recurso.tipoRecurso) {
    case 'beneficio':
      return recurso.categoria === OUTRO
        ? { tipo: OUTRO, nome: recurso.nome }
        : { tipo: recurso.categoria, nome: recurso.fornecedor }
    case 'verba':
      return { tipo: TIPOS_RECURSO.verba, nome: recurso.nome }
    case 'licenca':
      return { tipo: TIPOS_RECURSO.licenca, nome: recurso.servico === OUTRO ? recurso.nome : recurso.servico }
    default:
      throw new Error(`Tipo de recurso desconhecido "${recurso.tipoRecurso}" no recurso ${recurso.id}`)
  }
}

// Recursos - Figma 10355:3706: uma linha de 56px com borda por recurso, o
// logo ou icone de 32px, o tipo e o nome, o valor da pessoa e a seta, que
// abre a pagina do recurso.
function Recursos({ colaborador, recursosDaPessoa, travado, onAbrirRecurso }) {
  const timeDaPessoa = colaborador.times[0] ?? null
  return (
    <section className="perfil-secao">
      <p className="perfil-secao__titulo">Recursos</p>
      {recursosDaPessoa.length === 0 ? (
        // "Adicionar" ainda sem acao: o Figma nao mostra como adicionar daqui.
        <SecaoVazia texto="Nenhum recurso adicionado" acao={travado ? undefined : 'Adicionar'} />
      ) : (
        <div className="perfil-recursos">
          {recursosDaPessoa.map((recurso) => {
            const { tipo, nome } = tipoENomeDoRecurso(recurso)
            return (
              <button type="button" className="perfil-recurso" key={recurso.id} onClick={() => onAbrirRecurso(recurso.id)}>
                <MarcaDoRecurso recurso={recurso} tamanho={32} />
                <span className="perfil-recurso__nomes">
                  <span className="perfil-recurso__tipo">{tipo}</span>
                  <span className="perfil-recurso__nome">{nome || VAZIO}</span>
                </span>
                <span className="perfil-recurso__valor">
                  {formatCurrencyBRL(getBeneficiaryValue(recurso, colaborador.id, timeDaPessoa))}
                </span>
                <img src={arrowUpRightIcon} width={24} height={24} alt="" />
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}

// Cartao de linhas rotulo e valor - Figma 10355:3750 e 10355:3778: borda,
// raio 8, linhas de 48px, rotulo Medium e valor Regular numa coluna de 290px.
function CartaoDeLinhas({ linhas }) {
  return (
    <span className="perfil-cartao">
      {linhas.map(({ rotulo, valor, sufixo }) => (
        <span className="perfil-cartao__linha" key={rotulo}>
          <span className="perfil-cartao__rotulo">{rotulo}</span>
          <span className="perfil-cartao__valor">
            {valor || VAZIO}
            {valor && sufixo && <span className="perfil-cartao__sufixo">{sufixo}</span>}
          </span>
        </span>
      ))}
    </span>
  )
}

// Jornada de trabalho - Figma 10355:3750. Mockada no seed ate o Opy
// existir; sem jornada, "Nenhuma escala conectada" e "Conectar" (so
// interface).
function Jornada({ jornada, travado }) {
  return (
    <section className="perfil-secao">
      <p className="perfil-secao__titulo">Jornada de trabalho</p>
      {jornada ? (
        <CartaoDeLinhas
          linhas={[
            { rotulo: 'Dias da semana', valor: jornada.diasSemana },
            { rotulo: 'Horário', valor: jornada.horario },
            { rotulo: 'Almoço', valor: jornada.almoco },
            { rotulo: 'Carga diária', valor: jornada.cargaDiaria },
            { rotulo: 'Carga semanal', valor: jornada.cargaSemanal },
            { rotulo: 'Regime', valor: jornada.regime },
            { rotulo: 'Home office', valor: jornada.homeOffice },
          ]}
        />
      ) : travado ? (
        <SecaoVazia texto="Nenhuma escala conectada" />
      ) : (
        <SecaoVazia texto="Nenhuma escala conectada" acao="Conectar" />
      )}
    </section>
  )
}

// Chave PIX com a mascara do tipo: CPF e CNPJ com pontos, o resto como
// foi digitado.
function chavePixFormatada(chave) {
  const tipo = tipoChavePix(chave)
  if (tipo === 'CPF') return mascaraCpf(chave.replace(/\D/g, ''))
  if (tipo === 'CNPJ') return mascaraCnpj(chave.replace(/\D/g, ''))
  return chave
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
  const preenchido = ['banco', 'agencia', 'numeroConta', 'titular', 'chavePix'].some(
    (campo) => String(dados?.[campo] ?? '').trim() !== '',
  )
  const chavePix = dados?.chavePix?.trim() ?? ''

  return (
    <section className="perfil-secao">
      <p className="perfil-secao__titulo">Dados bancários</p>
      {!preenchido ? (
        <SecaoVazia texto="Nenhum dado adicionado" acao={travado ? undefined : 'Adicionar'} onAcao={travado ? undefined : abrir} />
      ) : (
        // Estado salvo - Figma 10355:3778. O clique reabre o painel.
        <button type="button" className="perfil-cartao-botao" disabled={travado} onClick={abrir}>
          <CartaoDeLinhas
            linhas={[
              { rotulo: 'Banco', valor: dados.banco },
              { rotulo: 'Agência', valor: dados.agencia },
              { rotulo: 'Tipo de conta', valor: dados.numeroConta ? TIPOS_CONTA[dados.tipoConta] : '' },
              { rotulo: 'Número da conta', valor: dados.numeroConta },
              { rotulo: 'Titular', valor: dados.titular },
              { rotulo: 'Chave PIX', valor: chavePix && chavePixFormatada(chavePix), sufixo: chavePix && tipoChavePix(chavePix) },
            ]}
          />
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
function Documentos({ colaborador, travado }) {
  const documentos = documentosDoColaborador(colaborador)
  return (
    <section className="perfil-secao">
      <p className="perfil-secao__titulo">Documentos</p>
      {documentos.length === 0 ? (
        <SecaoVazia texto="Nenhum documento adicionado" acao={travado ? undefined : 'Adicionar'} />
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
function PerfilColaborador({
  colaborador,
  colaboradores,
  times,
  recursos,
  travado,
  mode,
  pipoBar,
  notas,
  onAtualizar,
  onCriarTime,
  onMarcarComoFeito,
  onAbrirRecurso,
}) {
  const hoje = todayIso()
  const recursosDaPessoa = recursosDoColaborador(colaborador, recursos, colaboradores, hoje)

  const principal = (
    <>
      <StatusProcesso colaborador={colaborador} onMarcarComoFeito={onMarcarComoFeito} />
      <div className={travado ? 'perfil-bloco perfil-bloco--travado' : 'perfil-bloco'}>
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
      <Recursos colaborador={colaborador} recursosDaPessoa={recursosDaPessoa} travado={travado} onAbrirRecurso={onAbrirRecurso} />
      <Jornada jornada={colaborador.jornada} travado={travado} />
      <DadosBancarios
        dados={colaborador.dadosBancarios}
        travado={travado}
        onSalvar={(valor) => onAtualizar('dadosBancarios', valor)}
      />
      <Documentos colaborador={colaborador} travado={travado} />
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
