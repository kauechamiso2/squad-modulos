import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlass, Check, User } from '@phosphor-icons/react'
import { FluxoLayout } from '@squad/ui'
import { useFluxo } from './estado.jsx'
import PainelNovoContato from '../../components/PainelNovoContato.jsx'
import * as Contatos from '../../lib/contatos.js'
import { iniciais, detectarTipo, formatarDocumento, mascararEnquantoDigita } from '../../lib/documentos.js'
import s from './Passos.module.css'

const MIN = 5
const MAX = 60

/*
 * Passo 3 - nome da transacao e pagador/recebedor.
 * Figma: 94939 repouso · 94919 hover · 94955 editando · 94977 digitando ·
 * 95001 selecionado · 95017 contato cadastrado · 95312/95336 novo contato.
 *
 * O titulo e UM paragrafo de texto corrido. O nome e um <span
 * contenteditable> inline: ele flui dentro da frase e quebra linha como
 * qualquer palavra. Nao pode ser bloco, inline-block com largura, nem input -
 * qualquer um desses forca uma quebra depois de "Aqui esta".
 */
function TelaNomeContato() {
  const navigate = useNavigate()
  const fluxo = useFluxo()
  const [editando, setEditando] = useState(false)
  const [sobreNome, setSobreNome] = useState(false)
  const [termo, setTermo] = useState('')
  const [painelContato, setPainelContato] = useState(false)
  const [dica, setDica] = useState(null)

  const nomeRef = useRef(null)
  const tituloRef = useRef(null)

  const rotuloPadrao = fluxo.nomePadrao
  const nomeVisivel = fluxo.nomeFinal

  const contato = fluxo.contatoId ? Contatos.porId(fluxo.contatoId) : null
  const encontrados = termo.trim() ? Contatos.buscar(termo) : []
  const tipoDoc = detectarTipo(termo)
  const digitando = termo.trim().length > 0
  /* Valor escolhido direto do resultado, sem virar contato cadastrado. */
  const avulso = fluxo.pagadorAvulso

  /*
   * Tooltip centralizado sobre o trecho do nome NA PRIMEIRA LINHA. Um span
   * que quebra linha tem varios client rects; o primeiro e a primeira linha.
   */
  useLayoutEffect(() => {
    if (!sobreNome || editando || !nomeRef.current || !tituloRef.current) {
      setDica(null)
      return
    }
    const rects = nomeRef.current.getClientRects()
    if (!rects.length) return
    const primeira = rects[0]
    const base = tituloRef.current.getBoundingClientRect()
    setDica({
      esquerda: primeira.left - base.left + primeira.width / 2,
      topo: -9,
    })
  }, [sobreNome, editando, nomeVisivel])

  /* Cursor no fim ao entrar em edicao. */
  useEffect(() => {
    if (!editando || !nomeRef.current) return
    const el = nomeRef.current
    el.textContent = fluxo.nome.trim() || rotuloPadrao
    el.focus()
    const faixa = document.createRange()
    faixa.selectNodeContents(el)
    faixa.collapse(false)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(faixa)
  }, [editando])

  const confirmar = () => {
    const texto = (nomeRef.current?.textContent ?? '').trim().slice(0, MAX)
    if (texto.length >= MIN) fluxo.setNome(texto)
    else if (nomeRef.current) nomeRef.current.textContent = nomeVisivel
    setEditando(false)
    setSobreNome(false)
  }

  /* Volta ao estado de busca com o texto anterior, para trocar o pagador.
     O Figma nao desenha esse estado; sem ele a pessoa fica presa na escolha. */
  const trocarPagador = () => {
    setTermo(contato ? contato.nome : (avulso ?? ''))
    fluxo.setContatoId(null)
    fluxo.setPagadorAvulso(null)
  }

  const selecionarResultado = (c) => {
    fluxo.setContatoId(c.id)
    fluxo.setPagadorAvulso(null)
    setTermo('')
  }

  const escolherAvulso = () => {
    fluxo.setPagadorAvulso(tipoDoc ? formatarDocumento(termo, tipoDoc) : termo.trim())
    fluxo.setContatoId(null)
    setTermo('')
  }

  const selecionado = contato || avulso

  return (
    <>
      <FluxoLayout
        titulo={fluxo.copy.tituloFluxo}
        fixarBordas
        progresso={3 / 4}
        onFechar={fluxo.sair}
        onVoltar={() => navigate('../valor')}
        onContinuar={() => navigate('../informacoes')}
      >
        <div className={s.blocoPasso3}>
          <div className={s.envolucroTitulo}>
            <h1 className={s.tituloPasso} ref={tituloRef}>
              Aqui está{' '}
              <span
                ref={nomeRef}
                className={`${s.nomeInline} ${sobreNome && !editando ? s.nomeHover : ''}`}
                contentEditable={editando}
                suppressContentEditableWarning
                role="textbox"
                tabIndex={0}
                aria-label="Nome da transação"
                onMouseEnter={() => setSobreNome(true)}
                onMouseLeave={() => setSobreNome(false)}
                onClick={() => { if (!editando) { setSobreNome(false); setEditando(true) } }}
                onBlur={editando ? confirmar : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); confirmar() }
                  if (e.key === 'Escape') { e.preventDefault(); setEditando(false) }
                }}
              >
                {editando ? null : nomeVisivel}
              </span>
              . {fluxo.copy.tituloContato}
            </h1>

            {dica ? (
              <span
                className={s.dica}
                style={{ left: `${dica.esquerda}px`, top: `${dica.topo}px` }}
                aria-hidden="true"
              >
                Clique para editar o nome
              </span>
            ) : null}
          </div>

          {editando ? (
            <p className={s.ajudaNome}>
              <span className={s.ajudaEsquerda}>
                <span>Mín. {MIN} caracteres</span>
                <span>Máx. {MAX} caracteres</span>
              </span>
              <span>{(nomeRef.current?.textContent ?? '').length}</span>
            </p>
          ) : null}

          <div className={s.blocoBusca}>
            {selecionado ? (
              <div
                className={s.campoSelecionado}
                role="button"
                tabIndex={0}
                onClick={trocarPagador}
                onKeyDown={(e) => { if (e.key === 'Enter') trocarPagador() }}
              >
                <span className={s.selecionadoEsquerda}>
                  {contato ? (
                    <>
                      <span className={s.avatarDuplo} style={{ background: corDoNome(contato.nome) }}>
                        {iniciais(contato.nome)}
                      </span>
                      <span className={s.textoSelecionado}>{contato.nome}</span>
                      {Contatos.documentoVisivel(contato) ? (
                        <span className={s.docSelecionado}>{Contatos.documentoVisivel(contato)}</span>
                      ) : null}
                    </>
                  ) : (
                    <span className={s.textoSelecionado}>{avulso}</span>
                  )}
                </span>
                <button
                  type="button"
                  className={s.limparSelecao}
                  aria-label="Trocar pagador"
                  onClick={(e) => { e.stopPropagation(); trocarPagador() }}
                >
                  <Check size={24} color="var(--fc-valor-positivo)" />
                </button>
              </div>
            ) : (
              <div className={s.campoBusca}>
                <input
                  className={s.entradaBusca}
                  value={termo}
                  placeholder={`Nome, cliente cadastrado, CPF ou CNPJ para vincular ${fluxo.copy.substantivo}`}
                  aria-label="Buscar contato"
                  onChange={(e) => setTermo(mascararEnquantoDigita(e.target.value))}
                  onKeyDown={(e) => {
                    /* Enter com um resultado aberto seleciona a primeira linha. */
                    if (e.key !== 'Enter' || !digitando) return
                    e.preventDefault()
                    if (encontrados.length) selecionarResultado(encontrados[0])
                    else escolherAvulso()
                  }}
                />
                {digitando ? null : <MagnifyingGlass size={24} color="#798282" />}
              </div>
            )}

            {!selecionado && digitando ? (
              <div className={s.cardResultado}>
                <p className={s.rotuloResultado}>Resultado:</p>

                {encontrados.length ? (
                  encontrados.map((c) => (
                    <div
                      key={c.id}
                      className={s.linhaResultado}
                      role="button"
                      tabIndex={0}
                      onClick={() => selecionarResultado(c)}
                      onKeyDown={(e) => { if (e.key === 'Enter') selecionarResultado(c) }}
                    >
                      <span className={s.resultadoEsquerda}>
                        <span className={s.avatarDuplo} style={{ background: corDoNome(c.nome) }}>
                          {iniciais(c.nome)}
                        </span>
                        <span className={s.textoResultado}>{c.nome}</span>
                      </span>
                      {Contatos.documentoVisivel(c) ? (
                        <span className={s.docResultado}>{Contatos.documentoVisivel(c)}</span>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div
                    className={s.linhaResultado}
                    role="button"
                    tabIndex={0}
                    onClick={escolherAvulso}
                    onKeyDown={(e) => { if (e.key === 'Enter') escolherAvulso() }}
                  >
                    <span className={s.resultadoEsquerda}>
                      <User size={24} />
                      <span className={s.textoResultado}>
                        {tipoDoc ? formatarDocumento(termo, tipoDoc) : termo}
                      </span>
                    </span>
                    <button
                      type="button"
                      className={s.botaoSalvarContato}
                      onClick={(e) => { e.stopPropagation(); setPainelContato(true) }}
                    >
                      Salvar contato
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </FluxoLayout>

      <PainelNovoContato
          aberto={painelContato}
          valorInicial={termo}
          onSalvar={(novo) => {
            setPainelContato(false)
            fluxo.setContatoId(novo.id)
            fluxo.setPagadorAvulso(null)
            setTermo('')
          }}
          onFechar={() => setPainelContato(false)}
        />
    </>
  )
}

/* Cor do avatar, estavel a partir do nome (o mock usa #1a73e8 e #188038). */
const CORES = ['#1a73e8', '#188038', '#186880', '#d53943', '#8c54ff']
export function corDoNome(nome) {
  let h = 0
  for (const ch of String(nome)) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return CORES[h % CORES.length]
}

export default TelaNomeContato
