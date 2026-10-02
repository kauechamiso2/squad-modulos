import { createElement, useEffect, useState } from 'react'
import buildingsIcon from '../../assets/icons/Buildings.svg'
import linkIcon from '../../assets/icons/Link.svg'
import copyIcon from '../../assets/icons/Copy.svg'
import phoneIcon from '../../assets/icons/Phone.svg'
import phoneOutgoingIcon from '../../assets/icons/PhoneOutgoing.svg'
import atIcon from '../../assets/icons/At.svg'
import xIcon from '../../assets/icons/X.svg'
import DetalheShell, { CabecalhoDetalhe } from '../detalhe/DetalheShell.jsx'
import CamadaDetalhe from '../detalhe/CamadaDetalhe.jsx'
import {
  AdicionarNota,
  AvatarIniciais,
  CampoDetalhe,
  LinhaDoTempo,
  LinhaLista,
  LinhaPerfil,
  ListaDetalhe,
  MetricaBarra,
  MetricaLinhas,
  MetricaValor,
  MetricasGrade,
  SecaoDetalhe,
} from '../detalhe/Blocos.jsx'
import { iconeCampo } from '../detalhe/iconeCampo.jsx'
import { MarcaDoRecurso } from '../RecursosGrid.jsx'
import { LiderPanel } from '../addTeam/novoTime/TimePaineis.jsx'
import DeleteRecursoModal from './DeleteRecursoModal.jsx'
import { COLLECTIONS, getCollection, setCollection } from '../../utils/storage.js'
import { STATUS, getStatus } from '../../utils/colaboradorStatus.js'
import { faixaDeValores, metricasDoRecurso, valorBaseDoRecurso, valorDaPessoaNoRecurso } from '../../utils/detalhes.js'
import { TIPOS_RECURSO, tipoENomeDoRecurso, tituloDoRecurso } from '../../utils/recursos.js'
import { novaNota } from '../../utils/notas.js'
import { formatCurrencyBRL, todayIso } from '../../utils/formatters.js'
import { getTeamColorTones, getTeamIconComponent } from '../../utils/teamOptions.js'
import { useToast } from '../toast/ToastContext.jsx'

const VAZIO = '—'

function formatNumero(valor) {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const pessoas = (quantidade) => (quantidade === 1 ? '1 pessoa' : `${quantidade} pessoas`)

// Perfil: o nome e, so no Beneficio, a categoria em cinza (secao 9).
function nomeECategoria(recurso) {
  const { tipo, nome } = tipoENomeDoRecurso(recurso)
  if (recurso.tipoRecurso === 'beneficio') return { nome: nome || tituloDoRecurso(recurso), categoria: tipo }
  return { nome: nome || tituloDoRecurso(recurso), categoria: null }
}

// Campo so de leitura, com "—" quando vazio e a acao a direita.
function CampoLeitura({ icone, rotulo, valor, acao }) {
  return (
    <CampoDetalhe icone={iconeCampo(icone)} rotulo={rotulo} acessorio={valor ? acao : null}>
      <span className="detalhe-campo__texto">{valor || VAZIO}</span>
    </CampoDetalhe>
  )
}

/*
 * Pagina do recurso - Figma 10355:2869 (painel) e 10355:2514 (tela cheia),
 * desenhada para Beneficio. Campos 10355:2883, metricas 10355:2923, times
 * 10355:2950 e membros individuais 10355:2969.
 */
function RecursoDetail({ id, mode, aberto, onClose, onExpand, onCollapse, onDataChanged }) {
  const { showToast } = useToast()
  const [recursos, setRecursos] = useState(() => getCollection(COLLECTIONS.BENEFICIOS))
  const colaboradores = getCollection(COLLECTIONS.COLABORADORES)
  const times = getCollection(COLLECTIONS.TIMES)

  const [excluindo, setExcluindo] = useState(false)
  const [painel, setPainel] = useState(null)
  const [aberturas, setAberturas] = useState(0)

  useEffect(() => {
    if (!aberto) return
    setRecursos(getCollection(COLLECTIONS.BENEFICIOS))
    setExcluindo(false)
    setPainel(null)
  }, [aberto])

  const recurso = recursos.find((item) => item.id === id) ?? null
  if (!recurso) return null

  const hoje = todayIso()
  const metricas = metricasDoRecurso(recurso, colaboradores, times, hoje)
  const beneficiarios = recurso.beneficiarios ?? {}
  const contados = new Set(metricas.pessoas.map((pessoa) => pessoa.id))
  const { nome, categoria } = nomeECategoria(recurso)

  const gravar = (lista) => {
    setCollection(COLLECTIONS.BENEFICIOS, lista)
    setRecursos(lista)
    onDataChanged?.(lista)
  }
  const atualizar = (campos) => gravar(recursos.map((item) => (item.id === id ? { ...item, ...campos } : item)))
  const atualizarBeneficiarios = (campos) => atualizar({ beneficiarios: { ...beneficiarios, ...campos } })

  const excluir = () => {
    gravar(recursos.filter((item) => item.id !== id))
    showToast('danger', 'Recurso excluído com sucesso')
    onClose()
  }

  // Vinculo novo entra com o valor base do recurso (premissa da secao 9).
  const adicionarTimes = (nomes) => {
    const base = valorBaseDoRecurso(recurso)
    const teamValores = { ...(beneficiarios.teamValores ?? {}) }
    nomes.forEach((nomeDoTime) => {
      teamValores[nomeDoTime] = base
    })
    atualizarBeneficiarios({ teamNames: [...(beneficiarios.teamNames ?? []), ...nomes], teamValores })
  }
  const removerTime = (nomeDoTime) => {
    const teamValores = { ...(beneficiarios.teamValores ?? {}) }
    delete teamValores[nomeDoTime]
    atualizarBeneficiarios({ teamNames: (beneficiarios.teamNames ?? []).filter((item) => item !== nomeDoTime), teamValores })
  }
  const adicionarMembros = (ids) => {
    const base = valorBaseDoRecurso(recurso)
    const colaboradorValores = { ...(beneficiarios.colaboradorValores ?? {}) }
    ids.forEach((pessoaId) => {
      colaboradorValores[pessoaId] = base
    })
    atualizarBeneficiarios({ colaboradorIds: [...(beneficiarios.colaboradorIds ?? []), ...ids], colaboradorValores })
  }
  const removerMembro = (pessoaId) => {
    const colaboradorValores = { ...(beneficiarios.colaboradorValores ?? {}) }
    delete colaboradorValores[pessoaId]
    atualizarBeneficiarios({
      colaboradorIds: (beneficiarios.colaboradorIds ?? []).filter((item) => item !== pessoaId),
      colaboradorValores,
    })
  }

  const abrirPainel = (qual) => {
    setAberturas((total) => total + 1)
    setPainel(qual)
  }

  const adicionarNota = (texto) => atualizar({ notas: [...(recurso.notas ?? []), novaNota(texto)] })

  const timesPorNome = new Map(times.map((time) => [time.name, time]))
  const timesLigados = (beneficiarios.teamNames ?? []).map((nomeDoTime) => {
    const membros = metricas.pessoas.filter((pessoa) => pessoa.times.includes(nomeDoTime))
    const valor =
      beneficiarios.teamValores?.[nomeDoTime] ??
      (membros.length ? faixaDeValores(membros.map((pessoa) => valorDaPessoaNoRecurso(recurso, pessoa))) : null)
    return { nome: nomeDoTime, time: timesPorNome.get(nomeDoTime) ?? null, membros, valor }
  })
  const membrosIndividuais = colaboradores.filter(
    (pessoa) => (beneficiarios.colaboradorIds ?? []).includes(pessoa.id) && contados.has(pessoa.id),
  )
  // Toda a empresa e exclusiva: com ela ligada, nao entram times nem pessoas.
  const todaEmpresa = Boolean(beneficiarios.todaEmpresa)

  const perfil = (
    <LinhaPerfil avatar={<MarcaDoRecurso recurso={recurso} tamanho={40} />} nome={nome} tipo={categoria} tipoGrande />
  )

  const comCampos = recurso.tipoRecurso !== 'verba'
  const campos = comCampos && (
    <div className="detalhe-campos">
      {recurso.tipoRecurso === 'beneficio' && (
        <CampoLeitura icone={buildingsIcon} rotulo="Fornecedor" valor={recurso.fornecedor} />
      )}
      <CampoLeitura
        icone={linkIcon}
        rotulo="Link"
        valor={recurso.linkBeneficio}
        acao={
          <button
            type="button"
            className="detalhe-campo__acao"
            aria-label="Copiar link"
            onClick={() => navigator.clipboard?.writeText(recurso.linkBeneficio)}
          >
            <img src={copyIcon} width={20} height={20} alt="" />
          </button>
        }
      />
      <CampoLeitura
        icone={phoneIcon}
        rotulo="Contato"
        valor={recurso.contatoFornecedor}
        acao={
          <a className="detalhe-campo__acao" href={`tel:${String(recurso.contatoFornecedor ?? '').replace(/\D/g, '')}`} aria-label="Ligar">
            <img src={phoneOutgoingIcon} width={20} height={20} alt="" />
          </a>
        }
      />
      <CampoLeitura icone={atIcon} rotulo="Email" valor={recurso.emailFornecedor} />
    </div>
  )

  // Painel: total e custo lado a lado, em 40px. Tela cheia (10355:2514): o
  // total numa linha de 24px e o custo embaixo.
  const secaoMetricas = (
    <SecaoDetalhe titulo="Métricas">
      <MetricasGrade>
        {mode === 'full' ? (
          <>
            <MetricaLinhas linhas={[{ rotulo: 'Total de beneficiários', valor: metricas.total }]} />
            <MetricaValor rotulo="Custo total" valor={formatNumero(metricas.custo)} comOlho />
          </>
        ) : (
          <div className="detalhe-metricas__lado">
            <MetricaValor rotulo="Total de beneficiários" valor={metricas.total} />
            <MetricaValor rotulo="Custo total" valor={formatNumero(metricas.custo)} comOlho />
          </div>
        )}
        <MetricaLinhas linhas={metricas.porValor} />
        <MetricaBarra rotulo="Por time" segmentos={metricas.porTime} />
      </MetricasGrade>
    </SecaoDetalhe>
  )

  const botaoRemover = (rotulo, onRemover) => (
    <button type="button" className="detalhe-lista__icone-botao" aria-label={rotulo} onClick={onRemover}>
      <img src={xIcon} width={24} height={24} alt="" />
    </button>
  )

  const secaoTimes = (
    <SecaoDetalhe titulo="Times" acao={todaEmpresa ? null : 'Add time'} onAcao={() => abrirPainel('times')}>
      {(todaEmpresa || timesLigados.length > 0) && (
        <ListaDetalhe>
          {todaEmpresa && (
            // Sem Figma: a empresa toda tem a propria linha.
            <LinhaLista
              inicio={
                <span className="detalhe-badge" style={{ background: 'var(--color-overlay)' }}>
                  <img src={buildingsIcon} width={20} height={20} alt="" />
                </span>
              }
              textos={[
                { texto: 'Toda a empresa' },
                { texto: pessoas(metricas.total), cinza: true },
                {
                  texto:
                    beneficiarios.todaEmpresaValor != null
                      ? formatCurrencyBRL(beneficiarios.todaEmpresaValor)
                      : faixaDeValores(metricas.pessoas.map((pessoa) => valorDaPessoaNoRecurso(recurso, pessoa))),
                  cinza: true,
                },
              ]}
              fim={botaoRemover('Remover toda a empresa', () => atualizarBeneficiarios({ todaEmpresa: false }))}
            />
          )}
          {timesLigados.map(({ nome: nomeDoTime, time, membros, valor }) => {
            const tons = time && !time.pending ? getTeamColorTones(time.color) : null
            const Icone = getTeamIconComponent(time?.icon)
            return (
              <LinhaLista
                key={nomeDoTime}
                inicio={
                  <span className="detalhe-badge" style={{ background: tons?.light ?? 'var(--color-overlay)' }}>
                    {createElement(Icone, { size: 19.2, color: tons?.dark ?? 'var(--gp-texto-esmaecido)' })}
                  </span>
                }
                textos={[
                  { texto: nomeDoTime },
                  { texto: pessoas(membros.length), cinza: true },
                  { texto: typeof valor === 'number' ? formatCurrencyBRL(valor) : (valor ?? VAZIO), cinza: true },
                ]}
                fim={botaoRemover(`Remover o time ${nomeDoTime}`, () => removerTime(nomeDoTime))}
              />
            )
          })}
        </ListaDetalhe>
      )}
    </SecaoDetalhe>
  )

  const secaoMembros = (
    <SecaoDetalhe titulo="Membros individuais" acao={todaEmpresa ? null : 'Add membro'} onAcao={() => abrirPainel('membros')}>
      {membrosIndividuais.length > 0 && (
        <ListaDetalhe>
          {membrosIndividuais.map((pessoa) => {
            const time = pessoa.times.map((nomeDoTime) => timesPorNome.get(nomeDoTime)).find((item) => item && !item.pending)
            return (
              <LinhaLista
                key={pessoa.id}
                inicio={
                  <AvatarIniciais
                    nome={pessoa.name}
                    cor={time ? getTeamColorTones(time.color).dark : 'var(--gp-texto-esmaecido)'}
                  />
                }
                textos={[
                  { texto: pessoa.name },
                  { texto: formatCurrencyBRL(valorDaPessoaNoRecurso(recurso, pessoa)), cinza: true },
                ]}
                fim={botaoRemover(`Remover ${pessoa.name}`, () => removerMembro(pessoa.id))}
              />
            )
          })}
        </ListaDetalhe>
      )}
    </SecaoDetalhe>
  )

  const ligados = new Set(beneficiarios.teamNames ?? [])
  const timesDisponiveis = times
    .filter((time) => !time.pending && !ligados.has(time.name))
    .map((time) => ({
      id: time.name,
      name: time.name,
      quantidade: colaboradores.filter((pessoa) => pessoa.times.includes(time.name)).length,
    }))
  const individuais = new Set(beneficiarios.colaboradorIds ?? [])
  const pessoasDisponiveis = colaboradores.filter(
    (pessoa) => [STATUS.PENDENTE, STATUS.EM_ATIVIDADE].includes(getStatus(pessoa).id) && !individuais.has(pessoa.id),
  )

  return (
    <DetalheShell
      aberto={aberto}
      mode={mode}
      titulo={TIPOS_RECURSO[recurso.tipoRecurso]}
      acoes={
        <CabecalhoDetalhe mode={mode} onExcluir={() => setExcluindo(true)} onExpandir={onExpand} onRecolher={onCollapse} />
      }
      onClose={onClose}
      painel={
        <>
          <div className="detalhe-bloco">
            {perfil}
            {campos}
            <AdicionarNota onSalvar={adicionarNota} />
            <LinhaDoTempo notas={recurso.notas} comAdicionar={false} divisoria={false} />
          </div>
          {secaoMetricas}
          {secaoTimes}
          {secaoMembros}
        </>
      }
      esquerda={
        <>
          <div className="detalhe-bloco">
            {perfil}
            {campos}
          </div>
          {secaoTimes}
          {secaoMembros}
        </>
      }
      direita={
        <>
          {secaoMetricas}
          <LinhaDoTempo notas={recurso.notas} onSalvar={adicionarNota} />
        </>
      }
    >
      <CamadaDetalhe>
        {excluindo && (
          <DeleteRecursoModal name={tituloDoRecurso(recurso)} onCancel={() => setExcluindo(false)} onConfirm={excluir} />
        )}
        {aberturas > 0 && (
          <>
            <LiderPanel
              key={`times-${aberturas}`}
              multiplo
              titulo="Adicionar times"
              vazio="Nenhum time para adicionar."
              aberto={painel === 'times'}
              valor={[]}
              candidatos={timesDisponiveis}
              subtitulo={(time) => pessoas(time.quantidade)}
              onFechar={() => setPainel(null)}
              onSalvar={(nomes) => {
                if (nomes.length) adicionarTimes(nomes)
                setPainel(null)
              }}
            />
            <LiderPanel
              key={`membros-${aberturas}`}
              multiplo
              titulo="Adicionar membros"
              vazio="Ninguém para adicionar."
              aberto={painel === 'membros'}
              valor={[]}
              candidatos={pessoasDisponiveis}
              onFechar={() => setPainel(null)}
              onSalvar={(ids) => {
                if (ids.length) adicionarMembros(ids)
                setPainel(null)
              }}
            />
          </>
        )}
      </CamadaDetalhe>
    </DetalheShell>
  )
}

export default RecursoDetail
