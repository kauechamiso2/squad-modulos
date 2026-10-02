import { createElement, useEffect, useState } from 'react'
import crownIcon from '../../assets/icons/Crown.svg'
import eyedropperIcon from '../../assets/icons/Eyedropper.svg'
import smileyIcon from '../../assets/icons/Smiley.svg'
import fileTextIcon from '../../assets/icons/FileTextGray.svg'
import userIcon from '../../assets/icons/User.svg'
import caretDownIcon from '../../assets/icons/CaretDownBlack.svg'
import xIcon from '../../assets/icons/X.svg'
import arrowUpRightIcon from '../../assets/icons/ArrowUpRight.svg'
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
import { CorPanel, DescricaoPanel, IconePanel, LiderPanel } from '../addTeam/novoTime/TimePaineis.jsx'
import DeleteTimeModal from './DeleteTimeModal.jsx'
import RemoveMemberModal from './RemoveMemberModal.jsx'
import { COLLECTIONS, getCollection, setCollection } from '../../utils/storage.js'
import { STATUS, getStatus } from '../../utils/colaboradorStatus.js'
import { metricasDoTime } from '../../utils/detalhes.js'
import { tipoENomeDoRecurso } from '../../utils/recursos.js'
import { formatarTempoDeCasa } from '../../utils/tempoDeCasa.js'
import { novaNota } from '../../utils/notas.js'
import { todayIso } from '../../utils/formatters.js'
import { getTeamColorTones, getTeamIconComponent } from '../../utils/teamOptions.js'
import { useToast } from '../toast/ToastContext.jsx'

function formatNumero(valor) {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// So Pendente e Em atividade entram como membro ou lider (contexto, "Team").
const podeEntrar = (pessoa) => [STATUS.PENDENTE, STATUS.EM_ATIVIDADE].includes(getStatus(pessoa).id)

/*
 * Pagina do time - Figma 10355:3214 (painel) e 10355:2346 (tela cheia). So
 * times completos abrem. Campos 10355:3228, metricas 10355:3274, membros
 * 10355:3309 e recursos 10355:3344.
 */
function TimeDetail({ id, mode, aberto, onClose, onExpand, onCollapse, onDataChanged, onAbrirRecurso }) {
  const { showToast } = useToast()
  const [times, setTimes] = useState(() => getCollection(COLLECTIONS.TIMES))
  const [colaboradores, setColaboradores] = useState(() => getCollection(COLLECTIONS.COLABORADORES))
  const recursos = getCollection(COLLECTIONS.BENEFICIOS)

  const [excluindo, setExcluindo] = useState(false)
  const [removendo, setRemovendo] = useState(null)
  const [painel, setPainel] = useState(null)
  // Os paineis ficam montados para animar a saida; a chave nova a cada
  // abertura zera o rascunho deles.
  const [aberturas, setAberturas] = useState(0)
  const [descricaoAberta, setDescricaoAberta] = useState(false)

  /*
   * O painel fica montado enquanto a saida anima, entao releia e zere aqui,
   * na subida de `aberto`.
   */
  useEffect(() => {
    if (!aberto) return
    setTimes(getCollection(COLLECTIONS.TIMES))
    setColaboradores(getCollection(COLLECTIONS.COLABORADORES))
    setExcluindo(false)
    setRemovendo(null)
    setPainel(null)
    setDescricaoAberta(false)
  }, [aberto])

  const time = times.find((item) => item.id === id) ?? null
  if (!time) return null

  const hoje = todayIso()
  const metricas = metricasDoTime(time, colaboradores, recursos, hoje)
  const { light, dark } = getTeamColorTones(time.color)
  const IconeTime = getTeamIconComponent(time.icon)
  const lider = colaboradores.find((pessoa) => pessoa.id === time.leaderId) ?? null
  const idsMembros = new Set(metricas.membros.map((pessoa) => pessoa.id))

  const gravarTimes = (lista) => {
    setCollection(COLLECTIONS.TIMES, lista)
    setTimes(lista)
  }
  const atualizarTime = (campos) => gravarTimes(times.map((item) => (item.id === id ? { ...item, ...campos } : item)))

  const gravarColaboradores = (lista) => {
    setCollection(COLLECTIONS.COLABORADORES, lista)
    setColaboradores(lista)
    onDataChanged?.(lista)
  }

  // Entrar soma este time aos da pessoa; sair tira so este time.
  const adicionarMembros = (ids) => {
    const novos = new Set(ids)
    gravarColaboradores(
      colaboradores.map((pessoa) =>
        novos.has(pessoa.id) && !pessoa.times.includes(time.name) ? { ...pessoa, times: [...pessoa.times, time.name] } : pessoa,
      ),
    )
  }
  const removerMembro = (pessoaId) => {
    gravarColaboradores(
      colaboradores.map((pessoa) =>
        pessoa.id === pessoaId ? { ...pessoa, times: pessoa.times.filter((nome) => nome !== time.name) } : pessoa,
      ),
    )
    if (time.leaderId === pessoaId) atualizarTime({ leaderId: null })
  }

  const excluir = () => {
    gravarTimes(times.filter((item) => item.id !== id))
    gravarColaboradores(
      colaboradores.map((pessoa) =>
        pessoa.times.includes(time.name) ? { ...pessoa, times: pessoa.times.filter((nome) => nome !== time.name) } : pessoa,
      ),
    )
    showToast('danger', 'Time excluído com sucesso')
    onClose()
  }

  const abrirPainel = (qual) => {
    setAberturas((total) => total + 1)
    setPainel(qual)
  }

  const adicionarNota = (texto) => atualizarTime({ notas: [...(time.notas ?? []), novaNota(texto)] })
  const candidatos = colaboradores.filter(podeEntrar)

  const perfil = (
    <LinhaPerfil
      avatar={
        <span className="detalhe-avatar-perfil detalhe-avatar-perfil--time" style={{ background: light }}>
          {createElement(IconeTime, { size: 24, color: dark })}
        </span>
      }
      nome={time.name}
    />
  )

  const campos = (
    <div className="detalhe-campos">
      <CampoDetalhe icone={iconeCampo(crownIcon)} rotulo="Líder" vazio={!lider}>
        <button type="button" className={lider ? 'detalhe-valor-botao' : 'detalhe-valor-botao detalhe-valor-botao--vazio'} onClick={() => abrirPainel('lider')}>
          {lider ? (
            <>
              <span className="detalhe-avatar-pequeno">
                <img src={userIcon} width={12} height={12} alt="" />
              </span>
              {lider.name}
            </>
          ) : (
            'Adicionar'
          )}
        </button>
      </CampoDetalhe>
      <CampoDetalhe icone={iconeCampo(eyedropperIcon)} rotulo="Cor">
        <button type="button" className="detalhe-pilula" aria-label="Escolher cor do time" onClick={() => abrirPainel('cor')}>
          <span className="detalhe-pilula__ponto" style={{ background: dark }} />
          <img src={caretDownIcon} width={16} height={16} alt="" />
        </button>
      </CampoDetalhe>
      <CampoDetalhe icone={iconeCampo(smileyIcon)} rotulo="Ícone">
        <button type="button" className="detalhe-pilula detalhe-pilula--icone" aria-label="Escolher ícone do time" onClick={() => abrirPainel('icone')}>
          {createElement(IconeTime, { size: 24, color: dark })}
          <img src={caretDownIcon} width={16} height={16} alt="" />
        </button>
      </CampoDetalhe>
      <CampoDetalhe icone={iconeCampo(fileTextIcon)} rotulo="Descrição" vazio={!time.descricao} topo={Boolean(time.descricao)}>
        {time.descricao ? (
          <span className="detalhe-descricao">
            <button
              type="button"
              className={descricaoAberta ? 'detalhe-descricao__texto detalhe-descricao__texto--aberto' : 'detalhe-descricao__texto'}
              onClick={() => abrirPainel('descricao')}
            >
              {time.descricao}
            </button>
            <button type="button" className="detalhe-descricao__ver-mais" onClick={() => setDescricaoAberta((valor) => !valor)}>
              {descricaoAberta ? 'ver menos...' : 'ver mais...'}
            </button>
          </span>
        ) : (
          <button type="button" className="detalhe-valor-botao detalhe-valor-botao--vazio" onClick={() => abrirPainel('descricao')}>
            Adicionar
          </button>
        )}
      </CampoDetalhe>
    </div>
  )

  const secaoMetricas = (
    <SecaoDetalhe titulo="Métricas">
      <MetricasGrade>
        <MetricaLinhas
          linhas={[
            { rotulo: 'Total de membros', valor: metricas.membros.length },
            { rotulo: 'Tempo médio de casa', valor: formatarTempoDeCasa(metricas.mediaDeMeses) },
          ]}
        />
        <MetricaValor rotulo="Custo total do time" valor={formatNumero(metricas.custo)} comOlho />
        <MetricaLinhas linhas={metricas.cargos.map(([rotulo, valor]) => ({ rotulo, valor }))} />
        <MetricaBarra
          rotulo="Tipo de contratação"
          segmentos={
            metricas.membros.length
              ? [
                  { rotulo: 'CLT', porcentagem: metricas.contratacao.CLT, cor: 'var(--gp-contratacao-clt)' },
                  { rotulo: 'PJ', porcentagem: metricas.contratacao.PJ, cor: 'var(--gp-contratacao-pj)' },
                ]
              : []
          }
        />
      </MetricasGrade>
    </SecaoDetalhe>
  )

  const secaoMembros = (
    <SecaoDetalhe titulo="Membros" acao="Add membro" onAcao={() => abrirPainel('membros')}>
      {metricas.membros.length > 0 && (
        <ListaDetalhe>
          {metricas.membros.map((pessoa) => (
            <LinhaLista
              key={pessoa.id}
              inicio={<AvatarIniciais nome={pessoa.name} cor={dark} />}
              textos={[{ texto: pessoa.name }, ...(pessoa.cargos?.[0] ? [{ texto: pessoa.cargos[0], cinza: true }] : [])]}
              fim={
                <button
                  type="button"
                  className="detalhe-lista__icone-botao"
                  aria-label={`Remover ${pessoa.name} do time`}
                  onClick={() => setRemovendo(pessoa)}
                >
                  <img src={xIcon} width={24} height={24} alt="" />
                </button>
              }
            />
          ))}
        </ListaDetalhe>
      )}
    </SecaoDetalhe>
  )

  const secaoRecursos = metricas.recursos.length > 0 && (
    <SecaoDetalhe titulo="Recursos">
      <ListaDetalhe>
        {metricas.recursos.map(({ recurso, faixa }) => {
          const { tipo, nome } = tipoENomeDoRecurso(recurso)
          return (
            <LinhaLista
              key={recurso.id}
              onClick={() => onAbrirRecurso(recurso.id)}
              inicio={<MarcaDoRecurso recurso={recurso} tamanho={32} />}
              textos={[{ texto: tipo, cinza: true }, { texto: nome || '—' }]}
              valor={faixa}
              fim={<img src={arrowUpRightIcon} width={24} height={24} alt="" />}
            />
          )
        })}
      </ListaDetalhe>
    </SecaoDetalhe>
  )

  return (
    <DetalheShell
      aberto={aberto}
      mode={mode}
      titulo="Time"
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
            <LinhaDoTempo notas={time.notas} comAdicionar={false} divisoria={false} />
          </div>
          {secaoMetricas}
          {secaoMembros}
          {secaoRecursos}
        </>
      }
      esquerda={
        <>
          <div className="detalhe-bloco">
            {perfil}
            {campos}
          </div>
          {secaoMembros}
          {secaoRecursos}
        </>
      }
      direita={
        <>
          {secaoMetricas}
          <LinhaDoTempo notas={time.notas} onSalvar={adicionarNota} />
        </>
      }
    >
      <CamadaDetalhe>
        {excluindo && <DeleteTimeModal name={time.name} onCancel={() => setExcluindo(false)} onConfirm={excluir} />}

        {removendo && (
          <RemoveMemberModal
            name={removendo.name}
            onCancel={() => setRemovendo(null)}
            onConfirm={() => {
              removerMembro(removendo.id)
              setRemovendo(null)
            }}
          />
        )}

        {aberturas > 0 && (
          <>
            <LiderPanel
              key={`lider-${aberturas}`}
              aberto={painel === 'lider'}
              valor={time.leaderId ?? null}
              membros={metricas.membros.filter(podeEntrar)}
              candidatos={candidatos}
              onFechar={() => setPainel(null)}
              onSalvar={(liderId) => {
                // Quem vira lider sem ser membro entra no time.
                if (liderId && !idsMembros.has(liderId)) adicionarMembros([liderId])
                atualizarTime({ leaderId: liderId })
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
              candidatos={candidatos.filter((pessoa) => !idsMembros.has(pessoa.id))}
              onFechar={() => setPainel(null)}
              onSalvar={(ids) => {
                adicionarMembros(ids)
                setPainel(null)
              }}
            />
            <CorPanel
              key={`cor-${aberturas}`}
              aberto={painel === 'cor'}
              valor={time.color}
              usadas={times.filter((outro) => outro.id !== time.id && outro.color).map((outro) => outro.color)}
              onFechar={() => setPainel(null)}
              onSalvar={(cor) => {
                atualizarTime({ color: cor })
                setPainel(null)
              }}
            />
            <IconePanel
              key={`icone-${aberturas}`}
              aberto={painel === 'icone'}
              valor={time.icon}
              cor={dark}
              onFechar={() => setPainel(null)}
              onSalvar={(icone) => {
                atualizarTime({ icon: icone })
                setPainel(null)
              }}
            />
            <DescricaoPanel
              key={`descricao-${aberturas}`}
              aberto={painel === 'descricao'}
              valor={time.descricao ?? ''}
              onFechar={() => setPainel(null)}
              onSalvar={(texto) => {
                atualizarTime({ descricao: texto })
                setPainel(null)
              }}
            />
          </>
        )}
      </CamadaDetalhe>
    </DetalheShell>
  )
}

export default TimeDetail
