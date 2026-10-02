import { useRef, useState } from 'react'
import { EyeSlash } from '@phosphor-icons/react'
import eyeIcon from '../../assets/icons/Eye.svg'
import plusGrayIcon from '../../assets/icons/PlusGray.svg'
import notePencilIcon from '../../assets/icons/NotePencil.svg'
import { formatDateDMonthYear } from '../../utils/formatters.js'
import './Detalhe.css'

const VAZIO = '—'

/*
 * Linha de perfil - "Profile row" (Figma 10355:1861, 10355:3229, 10355:2884):
 * o avatar de 40px, o nome em 20px Medium e o tipo, 16px entre eles. `tipo`
 * em 14px Regular cinza; `tipoGrande` em 20px Medium cinza (recurso).
 */
export function LinhaPerfil({ avatar, nome, tipo, tipoGrande = false }) {
  return (
    <div className="detalhe-perfil">
      {avatar}
      <span className="detalhe-perfil__nome">{nome}</span>
      {tipo && (
        <span className={tipoGrande ? 'detalhe-perfil__tipo detalhe-perfil__tipo--grande' : 'detalhe-perfil__tipo'}>
          {tipo}
        </span>
      )}
    </div>
  )
}

/*
 * Campo - "Detail fields" (Figma 10338:9462, 10355:3234, 10355:2888): 62px,
 * icone de 20, rotulo 14px Medium e o valor numa coluna de 290px, 12px entre
 * eles, com a acao (olho, copiar, telefone, mais) na borda direita.
 * Vazio: "Adicionar" em Medium e o mais. Travado: vazio vira "—", sem o mais.
 */
export function CampoDetalhe({ icone, rotulo, vazio = false, travado = false, acessorio, rotuloEstreito = false, topo = false, children }) {
  const vazioTravado = vazio && travado
  const classes = ['detalhe-campo']
  if (vazio && !travado) classes.push('detalhe-campo--vazia')
  if (topo) classes.push('detalhe-campo--topo')
  return (
    <div className={classes.join(' ')}>
      <span className="detalhe-campo__icone">{icone}</span>
      <span className={rotuloEstreito ? 'detalhe-campo__rotulo detalhe-campo__rotulo--estreito' : 'detalhe-campo__rotulo'}>
        {rotulo}
      </span>
      <div className="detalhe-campo__valor">
        {vazioTravado ? <span className="detalhe-campo__vazio">{VAZIO}</span> : children}
      </div>
      {vazio ? !travado && <img className="detalhe-campo__mais" src={plusGrayIcon} width={24} height={24} alt="" /> : acessorio}
    </div>
  )
}

// Botao de olho dos valores escondidos (campos e cards de custo).
export function Olho({ visivel, onAlternar, rotulo }) {
  return (
    <button
      type="button"
      className="detalhe-olho"
      aria-label={visivel ? `Ocultar ${rotulo}` : `Mostrar ${rotulo}`}
      onClick={onAlternar}
    >
      {visivel ? <EyeSlash size={24} color="var(--color-text-secondary)" /> : <img src={eyeIcon} width={24} height={24} alt="" />}
    </button>
  )
}

/*
 * Secao - "Section title": 16px Medium, 20px ate o conteudo. `acao` fica a
 * direita do titulo ("Add membro", "Add time": pilula branca de 40px com o
 * Plus de 24, Figma 10355:3312).
 */
export function SecaoDetalhe({ titulo, acao, onAcao, children }) {
  return (
    <section className="detalhe-secao">
      <div className="detalhe-secao__topo">
        <p className="detalhe-secao__titulo">{titulo}</p>
        {acao && (
          <button type="button" className="detalhe-secao__acao" onClick={onAcao}>
            {acao}
            <img src={plusGrayIcon} width={24} height={24} alt="" />
          </button>
        )}
      </div>
      {children}
    </section>
  )
}

/*
 * Cards de metrica - "Metric cards" (Figma 10355:1938, 10355:3274,
 * 10355:2923): borda, raio 8, 16px de padding e de espaco interno.
 */
export function MetricasGrade({ lado = false, children }) {
  return <div className={lado ? 'detalhe-metricas detalhe-metricas--lado' : 'detalhe-metricas'}>{children}</div>
}

export function MetricaLado({ children }) {
  return <div className="detalhe-metricas__lado">{children}</div>
}

// Um valor grande (40px Medium); com `oculto`, o olho no topo e "••••••".
export function MetricaValor({ rotulo, valor, comOlho = false }) {
  const [visivel, setVisivel] = useState(false)
  return (
    <div className="detalhe-metrica">
      <div className="detalhe-metrica__topo">
        <span className="detalhe-metrica__rotulo">{rotulo}</span>
        {comOlho && <Olho visivel={visivel} rotulo={rotulo.toLowerCase()} onAlternar={() => setVisivel((v) => !v)} />}
      </div>
      <span className="detalhe-metrica__valor">{comOlho && !visivel ? '••••••' : valor}</span>
    </div>
  )
}

// Linhas de rotulo cinza e valor de 24px a direita.
export function MetricaLinhas({ linhas }) {
  return (
    <div className="detalhe-metrica">
      {linhas.length === 0 ? (
        <span className="detalhe-metrica__rotulo">{VAZIO}</span>
      ) : (
        linhas.map(({ rotulo, valor }) => (
          <div className="detalhe-metrica__linha" key={rotulo}>
            <span className="detalhe-metrica__rotulo detalhe-metrica__rotulo--flex">{rotulo}</span>
            <span className="detalhe-metrica__valor-linha">{valor}</span>
          </div>
        ))
      )}
    </div>
  )
}

/*
 * Barra de segmentos: 8px, segmentos arredondados lado a lado, largura pela
 * porcentagem, e a legenda "Design: 60% | Vendas 30% | Marketing 10%".
 * `segmentos`: [{ rotulo, porcentagem, cor }].
 */
export function MetricaBarra({ rotulo, segmentos }) {
  const visiveis = segmentos.filter((segmento) => segmento.porcentagem > 0)
  const legenda = segmentos
    .map((segmento, indice) => `${segmento.rotulo}${indice === 0 ? ':' : ''} ${segmento.porcentagem}%`)
    .join(' | ')
  return (
    <div className="detalhe-metrica">
      <span className="detalhe-metrica__rotulo">{rotulo}</span>
      <div className="detalhe-metrica__barra">
        {visiveis.map((segmento) => (
          <span key={segmento.rotulo} style={{ flexGrow: segmento.porcentagem, background: segmento.cor }} />
        ))}
      </div>
      <span className="detalhe-metrica__rotulo">{segmentos.length ? legenda : VAZIO}</span>
    </div>
  )
}

/*
 * Linha de lista - "List rows" (Figma 10355:3318, 10355:3709, 10355:2959):
 * 56px, borda, raio 8, 16px de padding, 20px entre as partes. `inicio`: o
 * avatar ou badge de 32px. `textos`: [{ texto, cinza }]. `fim`: valor e
 * seta, X ou Download. Com `onClick` a linha inteira e um botao.
 */
export function LinhaLista({ inicio, textos, valor, fim, onClick }) {
  const conteudo = (
    <>
      {inicio}
      <span className="detalhe-lista__textos">
        {textos.map(({ texto, cinza }, indice) => (
          <span key={indice} className={cinza ? 'detalhe-lista__texto detalhe-lista__texto--cinza' : 'detalhe-lista__texto'}>
            {texto}
          </span>
        ))}
      </span>
      {valor != null && <span className="detalhe-lista__valor">{valor}</span>}
      {fim}
    </>
  )
  if (onClick) {
    return (
      <button type="button" className="detalhe-lista detalhe-lista--botao" onClick={onClick}>
        {conteudo}
      </button>
    )
  }
  return <div className="detalhe-lista">{conteudo}</div>
}

export function ListaDetalhe({ children }) {
  return <div className="detalhe-listas">{children}</div>
}

// Avatar de 32px com as iniciais brancas na cor escura do time.
export function AvatarIniciais({ nome, cor }) {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  const iniciais =
    partes.length > 1 ? `${partes[0][0]}${partes[partes.length - 1][0]}` : (partes[0] ?? '').slice(0, 2)
  return (
    <span className="detalhe-avatar" style={{ background: cor }}>
      {iniciais.toUpperCase()}
    </span>
  )
}

/*
 * "Adicionar nota" - linha de 62px com NotePencil abaixo de uma divisoria
 * (Figma 10355:3270). Enter grava com a data de hoje; Esc ou sair vazio
 * cancela. `semDivisoria` para o fim da linha do tempo da tela cheia.
 */
export function AdicionarNota({ onSalvar, semDivisoria = false }) {
  const [editando, setEditando] = useState(false)
  const [texto, setTexto] = useState('')
  const salvandoRef = useRef(false)

  const cancelar = () => {
    setEditando(false)
    setTexto('')
  }
  const salvar = () => {
    const limpo = texto.trim()
    if (limpo) onSalvar(limpo)
    cancelar()
  }

  return (
    <div className={semDivisoria ? 'detalhe-nota-nova detalhe-nota-nova--fim' : 'detalhe-nota-nova'}>
      <img src={notePencilIcon} width={20} height={20} alt="" />
      {editando ? (
        <input
          type="text"
          autoFocus
          className="detalhe-nota-nova__entrada"
          placeholder="Escreva uma nota..."
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              salvandoRef.current = true
              salvar()
            }
            if (event.key === 'Escape') {
              event.stopPropagation()
              cancelar()
            }
          }}
          onBlur={() => {
            if (salvandoRef.current) {
              salvandoRef.current = false
              return
            }
            cancelar()
          }}
        />
      ) : (
        <button type="button" className="detalhe-nota-nova__botao" onClick={() => setEditando(true)}>
          Adicionar nota
        </button>
      )}
    </div>
  )
}

/*
 * Linha do tempo de notas - "Notes timeline" (Figma 10355:2104): borda em
 * cima, 30px em cima e 16px nos lados e embaixo, 24px entre as notas, cada
 * uma com a borda esquerda cinza, a data em 12px e o texto em 14px. Mais
 * antiga primeiro; "Adicionar nota" fecha a lista. `divisoria` falso no
 * painel, onde a linha "Adicionar nota" ja tem a divisoria (premissa da
 * secao 5: a mesma linha do tempo abaixo dela).
 */
export function LinhaDoTempo({ notas, onSalvar, comAdicionar = true, divisoria = true }) {
  const ordenadas = [...(notas ?? [])].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  if (!comAdicionar && ordenadas.length === 0) return null
  return (
    <div className={divisoria ? 'detalhe-tempo' : 'detalhe-tempo detalhe-tempo--sem-divisoria'}>
      {ordenadas.map((nota, indice) => (
        <div className="detalhe-tempo__nota" key={`${nota.timestamp}-${indice}`}>
          <span className="detalhe-tempo__data">{formatarDataNota(nota.timestamp)}</span>
          <p className="detalhe-tempo__texto">{nota.text}</p>
        </div>
      ))}
      {comAdicionar && <AdicionarNota onSalvar={onSalvar} semDivisoria />}
    </div>
  )
}

// "02 Set 2026": o dia com dois digitos.
function formatarDataNota(timestamp) {
  const texto = formatDateDMonthYear(timestamp.slice(0, 10))
  return texto.replace(/^(\d) /, '0$1 ')
}

// Secao vazia - Figma 10338:9537: texto cinza, a acao e o mais. Sem `acao`
// (perfil travado), so o texto. Sem `onAcao`, a acao e so interface.
export function SecaoVazia({ texto, acao, onAcao }) {
  if (!acao) {
    return (
      <div className="detalhe-vazio">
        <span className="detalhe-vazio__texto">{texto}</span>
      </div>
    )
  }
  const conteudo = (
    <>
      <span>{acao}</span>
      <img src={plusGrayIcon} width={24} height={24} alt="" />
    </>
  )
  return (
    <div className="detalhe-vazio">
      <span className="detalhe-vazio__texto">{texto}</span>
      {onAcao ? (
        <button type="button" className="detalhe-vazio__botao" onClick={onAcao}>
          {conteudo}
        </button>
      ) : (
        <span className="detalhe-vazio__botao detalhe-vazio__botao--inerte">{conteudo}</span>
      )}
    </div>
  )
}
