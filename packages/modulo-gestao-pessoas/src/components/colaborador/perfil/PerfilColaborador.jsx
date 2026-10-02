import { useState } from 'react'
import { Briefcase, UsersFour } from '@phosphor-icons/react'
import userIcon from '../../../assets/icons/User.svg'
import phoneCallIcon from '../../../assets/icons/PhoneCall.svg'
import identificationCardIcon from '../../../assets/icons/IdentificationCard.svg'
import atIcon from '../../../assets/icons/At.svg'
import checkCircleGrayIcon from '../../../assets/icons/CheckCircleGray.svg'
import piggyBankIcon from '../../../assets/icons/PiggyBank.svg'
import checkCircleIcon from '../../../assets/icons/CheckCircle.svg'
import circleDashedIcon from '../../../assets/icons/CircleDashed.svg'
import filePdfIcon from '../../../assets/icons/FilePdf.svg'
import filePngIcon from '../../../assets/icons/FilePng.svg'
import downloadIcon from '../../../assets/icons/DownloadSimple.svg'
import arrowUpRightIcon from '../../../assets/icons/ArrowUpRight.svg'
import { MarcaDoRecurso } from '../../RecursosGrid.jsx'
import InlineEditField from '../InlineEditField.jsx'
import CargoField from '../CargoField.jsx'
import ReportaParaField from '../ReportaParaField.jsx'
import DateField from '../DateField.jsx'
import TimesField from './TimesField.jsx'
import DadosBancariosPanel from './DadosBancariosPanel.jsx'
import { CampoContato, CampoMascarado } from '../../campos/CamposFluxo.jsx'
import { STATUS, getStatus } from '../../../utils/colaboradorStatus.js'
import { documentosDoColaborador, recursosDoColaborador } from '../../../utils/cadastro.js'
import { custoDoColaborador, valorDaPessoaNoRecurso } from '../../../utils/detalhes.js'
import { tipoENomeDoRecurso } from '../../../utils/recursos.js'
import { cnpjValido, cpfValido, emailValido, mascaraCnpj, mascaraCpf, tipoChavePix } from '../../../utils/mascaras.js'
import { SUFIXO_PAGAMENTO } from '../../../utils/custos.js'
import { formatarTempoDeCasa, mesesDeCasa } from '../../../utils/tempoDeCasa.js'
import {
  AdicionarNota,
  CampoDetalhe,
  LinhaDoTempo,
  LinhaLista,
  LinhaPerfil,
  ListaDetalhe,
  MetricaValor,
  MetricasGrade,
  Olho,
  SecaoDetalhe,
  SecaoVazia,
} from '../../detalhe/Blocos.jsx'
import { iconeCampo } from '../../detalhe/iconeCampo.jsx'
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
    <LinhaPerfil
      avatar={
        <span className="detalhe-avatar-perfil">
          <img src={userIcon} width={20} height={20} alt="" />
        </span>
      }
      nome={colaborador.name}
      tipo={colaborador.tipo}
    />
  )
}

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
    <div className="detalhe-campos">
      <CampoDetalhe travado={travado} icone={iconeCampo(phoneCallIcon)} rotulo="Contato" vazio={!colaborador.contato}>
        <CampoContato valor={colaborador.contato} disabled={travado} onSalvar={(valor) => onAtualizar('contato', valor)} />
      </CampoDetalhe>
      <CampoDetalhe travado={travado} icone={iconeCampo(identificationCardIcon)} rotulo="Documento" vazio={!colaborador[documento.campo]}>
        <span className="detalhe-campo__documento">
          <CampoMascarado
            valor={colaborador[documento.campo]}
            onSalvar={(valor) => onAtualizar(documento.campo, valor)}
            mascara={documento.mascara}
            limite={documento.limite}
            validar={documento.validar}
            vazio="Adicionar"
            disabled={travado}
          />
          {colaborador[documento.campo] && <span className="detalhe-campo__sufixo">{documento.sufixo}</span>}
        </span>
      </CampoDetalhe>
      <CampoDetalhe travado={travado} icone={<Briefcase size={20} color="var(--color-text-secondary)" />} rotulo="Cargo" vazio={!colaborador.cargos.length}>
        <CargoField
          value={colaborador.cargos}
          cargoOptions={cargosEmUso}
          disabled={travado}
          onSave={(valor) => onAtualizar('cargos', valor)}
        />
      </CampoDetalhe>
      <CampoDetalhe travado={travado} icone={iconeCampo(atIcon)} rotulo="Email" vazio={!colaborador.email}>
        <InlineEditField
          value={colaborador.email ?? ''}
          displayValue={colaborador.email || 'Adicionar'}
          disabled={travado}
          validate={(texto) => texto.trim() === '' || emailValido(texto)}
          onSave={(texto) => onAtualizar('email', texto.trim())}
        />
      </CampoDetalhe>
      <CampoDetalhe travado={travado} icone={<UsersFour size={20} color="var(--color-text-secondary)" />} rotulo="Time" vazio={!colaborador.times.length}>
        <TimesField
          value={colaborador.times}
          times={times}
          disabled={travado}
          onSave={(valor) => onAtualizar('times', valor)}
          onCriarTime={onCriarTime}
        />
      </CampoDetalhe>
      <CampoDetalhe travado={travado} icone={iconeCampo(userIcon)} rotulo="Reporta para" vazio={!colaborador.reportaPara}>
        <ReportaParaField
          value={colaborador.reportaPara}
          ownId={colaborador.id}
          collaborators={candidatos}
          disabled={travado}
          onSave={(nome) => onAtualizar('reportaPara', nome)}
        />
      </CampoDetalhe>
      <CampoDetalhe travado={travado} icone={iconeCampo(checkCircleGrayIcon)} rotulo="Ativo desde" vazio={!colaborador.dataAdmissao}>
        <DateField
          value={colaborador.dataAdmissao}
          disabled={travado}
          displayValue={colaborador.dataAdmissao ? formatDateDMonthYear(colaborador.dataAdmissao) : 'Adicionar'}
          onSave={(valor) => onAtualizar('dataAdmissao', valor)}
        />
      </CampoDetalhe>
      {colaborador.tipo === 'PJ' ? (
        <CampoDetalhe
          travado={travado}
          icone={iconeCampo(piggyBankIcon)}
          rotulo="Salário"
          rotuloEstreito
          vazio={colaborador.valorContrato == null}
          acessorio={<Olho visivel={salarioVisivel} rotulo="salário" onAlternar={() => setSalarioVisivel((v) => !v)} />}
        >
          {/* PJ: o valor do contrato com o sufixo do pagamento (Figma 10338:12202). */}
          <span className="detalhe-campo__documento detalhe-campo__documento--perto">
            <CampoValor
              valor={colaborador.valorContrato}
              oculto={!salarioVisivel}
              travado={travado}
              semMoeda
              onSalvar={(valor) => onAtualizar('valorContrato', valor)}
            />
            {colaborador.valorContrato != null && SUFIXO_PAGAMENTO[colaborador.pagamento] && (
              <span className="detalhe-campo__sufixo detalhe-campo__sufixo--regular">
                {SUFIXO_PAGAMENTO[colaborador.pagamento]}
              </span>
            )}
          </span>
        </CampoDetalhe>
      ) : (
        <>
          <CampoDetalhe
            travado={travado}
            icone={iconeCampo(piggyBankIcon)}
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
          </CampoDetalhe>
          <CampoDetalhe
            travado={travado}
            icone={iconeCampo(piggyBankIcon)}
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
          </CampoDetalhe>
        </>
      )}
    </div>
  )
}

function formatNumero(valor) {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Metricas - Figma 10355:1938 (painel, lado a lado) e 10355:2334 (tela
// cheia, empilhados). Custo total: custo para empresa (CLT) ou valor do
// contrato (PJ) mais os recursos, cada recurso uma vez.
function Metricas({ colaborador, colaboradores, recursos, hoje, empilhado }) {
  const custo = custoDoColaborador(colaborador, recursos, colaboradores, hoje)
  const cards = (
    <>
      <MetricaValor rotulo="Custo total" valor={formatNumero(custo)} comOlho />
      <MetricaValor rotulo="Tempo de casa" valor={formatarTempoDeCasa(mesesDeCasa(colaborador.dataAdmissao, hoje))} />
    </>
  )
  return (
    <SecaoDetalhe titulo="Métricas">
      <MetricasGrade>{empilhado ? cards : <div className="detalhe-metricas__lado">{cards}</div>}</MetricasGrade>
    </SecaoDetalhe>
  )
}

// Recursos - Figma 10355:3706: uma linha de 56px com borda por recurso, o
// logo ou icone de 32px, o tipo e o nome, o valor da pessoa e a seta, que
// abre a pagina do recurso.
function Recursos({ colaborador, recursosDaPessoa, travado, onAbrirRecurso }) {
  return (
    <SecaoDetalhe titulo="Recursos">
      {recursosDaPessoa.length === 0 ? (
        // "Adicionar" ainda sem acao: o Figma nao mostra como adicionar daqui.
        <SecaoVazia texto="Nenhum recurso adicionado" acao={travado ? undefined : 'Adicionar'} />
      ) : (
        <ListaDetalhe>
          {recursosDaPessoa.map((recurso) => {
            const { tipo, nome } = tipoENomeDoRecurso(recurso)
            return (
              <LinhaLista
                key={recurso.id}
                onClick={() => onAbrirRecurso(recurso.id)}
                inicio={<MarcaDoRecurso recurso={recurso} tamanho={32} />}
                textos={[
                  { texto: tipo, cinza: true },
                  { texto: nome || VAZIO },
                ]}
                valor={formatCurrencyBRL(valorDaPessoaNoRecurso(recurso, colaborador))}
                fim={<img src={arrowUpRightIcon} width={24} height={24} alt="" />}
              />
            )
          })}
        </ListaDetalhe>
      )}
    </SecaoDetalhe>
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
    <SecaoDetalhe titulo="Jornada de trabalho">
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
    </SecaoDetalhe>
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
    <SecaoDetalhe titulo="Dados bancários">
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
    </SecaoDetalhe>
  )
}

// Documentos ligados aos itens concluidos do checklist (Figma 10338:9558).
// Download e Adicionar sao so interface: ainda nao existe upload.
function Documentos({ colaborador, travado }) {
  const documentos = documentosDoColaborador(colaborador)
  return (
    <SecaoDetalhe titulo="Documentos">
      {documentos.length === 0 ? (
        <SecaoVazia texto="Nenhum documento adicionado" acao={travado ? undefined : 'Adicionar'} />
      ) : (
        <ListaDetalhe>
          {documentos.map((documento) => {
            const icone = ICONES_ARQUIVO[documento.formato]
            if (!icone) throw new Error(`Sem ícone para o arquivo "${documento.nome}"`)
            return (
              <LinhaLista
                key={documento.nome}
                inicio={
                  <span className="detalhe-badge detalhe-badge--arquivo">
                    <img src={icone} width={20} height={20} alt={documento.formato.toUpperCase()} />
                  </span>
                }
                textos={[{ texto: documento.nome, cinza: true }]}
                fim={
                  <span className="detalhe-lista__download">
                    Download
                    <img src={downloadIcon} width={24} height={24} alt="" />
                  </span>
                }
              />
            )
          })}
        </ListaDetalhe>
      )}
    </SecaoDetalhe>
  )
}

/*
 * Pagina do colaborador - Figma 10355:1842 (painel) e 10355:2085 (tela
 * cheia); estados de 10338:9174, 10338:9414, 10338:9671, 10338:11975,
 * 10338:12202 e 10355:3986. `parte`: 'painel' (tudo na ordem do painel),
 * 'esquerda' ou 'direita' (as colunas da tela cheia). A casca fica no
 * ColaboradorDetail.
 */
function PerfilColaborador({
  parte,
  colaborador,
  colaboradores,
  times,
  recursos,
  travado,
  pipoBar,
  onAtualizar,
  onCriarTime,
  onAdicionarNota,
  onMarcarComoFeito,
  onAbrirRecurso,
}) {
  const hoje = todayIso()
  const recursosDaPessoa = recursosDoColaborador(colaborador, recursos, colaboradores, hoje)

  if (parte === 'direita') {
    return (
      <>
        <Metricas colaborador={colaborador} colaboradores={colaboradores} recursos={recursos} hoje={hoje} empilhado />
        <LinhaDoTempo notas={colaborador.notas} onSalvar={onAdicionarNota} />
      </>
    )
  }

  const painel = parte === 'painel'
  return (
    <>
      <StatusProcesso colaborador={colaborador} onMarcarComoFeito={onMarcarComoFeito} />
      <div className={travado ? 'detalhe-bloco perfil-bloco--travado' : 'detalhe-bloco'}>
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
        {painel && (
          <>
            {/* Painel: as notas salvas abaixo da linha "Adicionar nota" (premissa
                da secao 5, sem Figma). */}
            <AdicionarNota onSalvar={onAdicionarNota} />
            <LinhaDoTempo notas={colaborador.notas} comAdicionar={false} divisoria={false} />
          </>
        )}
      </div>
      {painel && <Metricas colaborador={colaborador} colaboradores={colaboradores} recursos={recursos} hoje={hoje} />}
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
}

export default PerfilColaborador
