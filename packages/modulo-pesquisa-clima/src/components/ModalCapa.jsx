import { useRef, useState } from 'react'
import { ModalConfirmar, ModalFluxo } from '@squad/ui'
import iguais from '../lib/iguais.js'
import {
  COR_PADRAO,
  CAPA_PADRAO,
  ehHex,
  estiloDaCapa,
  estiloDoRecorte,
  limitarFracao,
  normalizarCapa,
  recortarParaCapa,
  sobraDaCaixa,
} from '../lib/capa.js'
import s from './ModalCapa.module.css'

/*
 * "Editar Capa" — sem referência no Figma, montado com a linguagem que o
 * projeto já tem: a casca ModalFluxo (título, X, Voltar/Salvar) e as
 * sub-abas do mesmo desenho das da aba Respostas, só que mais estreitas
 * porque aqui a largura é a do modal.
 *
 * A prévia do topo tem a proporção da faixa da Revisão, que é onde a capa
 * aparece de verdade. Na aba Imagem ela é também a área de recorte: arrastar
 * dentro dela move a imagem, e o zoom fica logo abaixo. Duas caixas iguais —
 * uma para ver, outra para recortar — mostrariam a mesma coisa duas vezes.
 *
 * As três abas guardam estado próprio enquanto o modal está aberto: trocar de
 * aba e voltar não perde o que foi digitado. Só o que estiver na aba aberta
 * na hora do Salvar é que vira a capa — uma capa é de um tipo só.
 *
 * Fechar pergunta antes, e é a exceção do projeto junto com o editor de
 * pergunta — nos outros modais o fechar descarta calado, de propósito. Aqui
 * o que se perde pode ser uma imagem escolhida do computador e enquadrada à
 * mão, que não se refaz digitando de novo. A pergunta só aparece se fechar
 * agora fosse mesmo jogar algo fora.
 */
const ABAS = ['Cor sólida', 'Gradiente', 'Imagem']

/* Acima disso o navegador ainda abre, mas o recorte fica lento e o data URL
   grande demais para o localStorage. */
const TAMANHO_MAXIMO = 10 * 1024 * 1024

/*
 * O campo de hex aceita ser digitado por partes, então texto e cor andam
 * separados: o texto é o que está escrito, a cor é o último valor válido.
 * Sem isso, apagar um caractere para corrigir já apagaria a cor da prévia.
 */
function useCor(inicial) {
  const [texto, setTexto] = useState(inicial)
  const [cor, setCor] = useState(inicial)
  const definir = (bruto) => {
    const valor = bruto && !bruto.startsWith('#') ? `#${bruto}` : bruto
    setTexto(valor)
    if (ehHex(valor)) setCor(valor)
  }
  return { texto, cor, definir }
}

/* Amostra clicável: o seletor nativo fica por cima, invisível, para o clique
   em qualquer ponto do quadrado abrir o seletor do sistema. */
function Amostra({ cor, rotulo, onEscolher }) {
  return (
    <label className={s.amostra} style={{ background: cor }}>
      {/* O nome do controle está no próprio input; o rótulo visível fica
          acima, no campo. */}
      <input
        className={s.seletorNativo}
        type="color"
        value={cor}
        aria-label={rotulo}
        onChange={(e) => onEscolher(e.target.value)}
      />
    </label>
  )
}

/* Campo rotulado, como os dos outros modais do projeto: o rótulo em cima e o
   controle embaixo — aqui a amostra e o hex lado a lado. */
function CampoDeCor({ rotulo, campo }) {
  return (
    <div className={s.campo}>
      <span className={s.rotulo}>{rotulo}</span>
      <div className={s.linhaDeCor}>
        <Amostra cor={campo.cor} rotulo={rotulo} onEscolher={campo.definir} />
        <input
          className={s.campoHex}
          type="text"
          value={campo.texto}
          maxLength={7}
          spellCheck={false}
          aria-label={`${rotulo} em hexadecimal`}
          onChange={(e) => campo.definir(e.target.value.trim())}
        />
      </div>
    </div>
  )
}

export default function ModalCapa({ valor, onSalvar, onFechar }) {
  const capa = normalizarCapa(valor)

  const [aba, setAba] = useState(
    capa.tipo === 'imagem' ? 'Imagem' : capa.tipo === 'solida' ? 'Cor sólida' : 'Gradiente',
  )
  const solida = useCor(capa.tipo === 'solida' ? capa.cor : COR_PADRAO)
  const de = useCor(capa.tipo === 'gradiente' ? capa.de : CAPA_PADRAO.de)
  const ate = useCor(capa.tipo === 'gradiente' ? capa.ate : CAPA_PADRAO.ate)

  /* `elemento` é a imagem já decodificada; é dela que o canvas recorta. Fica
     no estado junto com o resto para não haver duas fontes da mesma imagem. */
  const [imagem, setImagem] = useState(null)
  const [erro, setErro] = useState('')
  const [arrastandoArquivo, setArrastandoArquivo] = useState(false)
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false)
  const entrada = useRef(null)
  const arrasto = useRef(null)

  const carregar = (arquivo) => {
    setErro('')
    if (!arquivo) return
    if (!arquivo.type.startsWith('image/')) {
      setErro('Escolha um arquivo de imagem.')
      return
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      setErro('Imagem muito grande — o limite é 10 MB.')
      return
    }
    const leitor = new FileReader()
    leitor.onload = () => {
      const elemento = new Image()
      elemento.onload = () =>
        setImagem({
          fonte: leitor.result,
          elemento,
          largura: elemento.naturalWidth,
          altura: elemento.naturalHeight,
          zoom: 1,
          fx: 0.5,
          fy: 0.5,
        })
      elemento.onerror = () => setErro('Não foi possível abrir essa imagem.')
      elemento.src = leitor.result
    }
    leitor.onerror = () => setErro('Não foi possível ler o arquivo.')
    leitor.readAsDataURL(arquivo)
  }

  const recortando = aba === 'Imagem' && imagem

  const aoPressionar = (e) => {
    if (!recortando) return
    arrasto.current = {
      x: e.clientX,
      y: e.clientY,
      fx: imagem.fx,
      fy: imagem.fy,
      caixa: e.currentTarget.getBoundingClientRect(),
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const aoMover = (e) => {
    const inicio = arrasto.current
    if (!inicio) return
    const [sobraL, sobraA] = sobraDaCaixa(inicio.caixa, imagem)
    setImagem((i) => ({
      ...i,
      fx: sobraL > 0 ? limitarFracao(inicio.fx - (e.clientX - inicio.x) / sobraL) : i.fx,
      fy: sobraA > 0 ? limitarFracao(inicio.fy - (e.clientY - inicio.y) / sobraA) : i.fy,
    }))
  }

  const aoSoltar = () => {
    arrasto.current = null
  }

  /* O que a prévia mostra agora — e, no Salvar, o que vira a capa. */
  const estiloDaPrevia = recortando
    ? estiloDoRecorte(imagem)
    : aba === 'Cor sólida'
      ? estiloDaCapa({ tipo: 'solida', cor: solida.cor })
      : aba === 'Gradiente'
        ? estiloDaCapa({ tipo: 'gradiente', de: de.cor, ate: ate.cor })
        : null

  const salvar = () => {
    if (aba === 'Cor sólida') return onSalvar({ tipo: 'solida', cor: solida.cor })
    if (aba === 'Gradiente') {
      return onSalvar({ tipo: 'gradiente', de: de.cor, ate: ate.cor })
    }
    if (!imagem) return onFechar()
    try {
      return onSalvar({ tipo: 'imagem', dados: recortarParaCapa(imagem.elemento, imagem) })
    } catch {
      // Canvas "sujo" por uma imagem de outra origem, por exemplo.
      setErro('Não foi possível recortar essa imagem.')
      return undefined
    }
  }

  const imagemNova = aba === 'Imagem' && imagem !== null

  /* O que o Salvar gravaria agora. Na aba Imagem sem imagem escolhida ele não
     grava nada, então o que vale ali é a capa como já está. */
  const proposta =
    aba === 'Cor sólida'
      ? { tipo: 'solida', cor: solida.cor }
      : aba === 'Gradiente'
        ? { tipo: 'gradiente', de: de.cor, ate: ate.cor }
        : capa

  /*
   * Se fechar agora joga alguma coisa fora.
   *
   * A conta não é "mexeu em algum campo", é "o Salvar mudaria a capa" — o que
   * já inclui trocar de aba, porque é a aba aberta que decide o tipo da capa
   * que sai daqui. Sair de um gradiente com a aba Cor sólida aberta troca a
   * capa; não perguntar seria descartar essa troca calado.
   *
   * Imagem escolhida conta sempre: o recorte vira um data URL novo, que nunca
   * é igual ao que já estava guardado.
   */
  const alterada = imagemNova || !iguais(proposta, capa)

  const fechar = () => {
    if (alterada) setConfirmandoDescarte(true)
    else onFechar()
  }

  return (
    <>
      <ModalFluxo
        titulo="Editar Capa"
        espacamento={24}
        onVoltar={fechar}
        onFechar={fechar}
        onSalvar={salvar}
      >
        <div className={s.corpo}>
          {/* A prévia tem a proporção da faixa da Revisão. Na aba Imagem ela é
              a própria área de recorte, e por isso vira uma superfície de
              arrasto. */}
          <div
            className={`${s.previa} ${recortando ? s.previaArrastavel : ''} ${
              estiloDaPrevia ? '' : s.previaVazia
            }`}
            style={estiloDaPrevia ?? undefined}
            role={recortando ? 'application' : undefined}
            aria-label={recortando ? 'Arraste para posicionar a imagem' : undefined}
            onPointerDown={aoPressionar}
            onPointerMove={aoMover}
            onPointerUp={aoSoltar}
            onPointerCancel={aoSoltar}
          >
            {estiloDaPrevia ? null : <span className={s.previaTexto}>Sem imagem</span>}
          </div>

          <div className={s.subabas} role="tablist" aria-label="Tipo de capa">
            {ABAS.map((nome) => (
              <button
                type="button"
                key={nome}
                className={`${s.subaba} ${nome === aba ? s.ativa : ''}`}
                role="tab"
                aria-selected={nome === aba}
                onClick={() => setAba(nome)}
              >
                {nome}
              </button>
            ))}
          </div>

          {aba === 'Cor sólida' ? (
            <div className={s.painel}>
              <CampoDeCor rotulo="Cor da capa" campo={solida} />
            </div>
          ) : null}

          {aba === 'Gradiente' ? (
            <div className={s.painel}>
              <CampoDeCor rotulo="Cor inicial" campo={de} />
              <CampoDeCor rotulo="Cor final" campo={ate} />
            </div>
          ) : null}

          {aba === 'Imagem' ? (
            <div className={s.painel}>
              <input
                ref={entrada}
                className={s.oculto}
                type="file"
                accept="image/*"
                aria-label="Escolher imagem"
                onChange={(e) => carregar(e.target.files?.[0])}
              />

              {imagem ? (
                <>
                  <label className={s.linhaZoom}>
                    <span className={s.rotuloZoom}>Zoom</span>
                    <input
                      className={s.zoom}
                      type="range"
                      min="1"
                      max="4"
                      step="0.01"
                      value={imagem.zoom}
                      aria-label="Zoom da imagem"
                      onChange={(e) =>
                        setImagem((i) => ({ ...i, zoom: Number(e.target.value) }))
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className={s.trocar}
                    onClick={() => entrada.current?.click()}
                  >
                    Trocar imagem
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={`${s.area} ${arrastandoArquivo ? s.areaAtiva : ''}`}
                  onClick={() => entrada.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setArrastandoArquivo(true)
                  }}
                  onDragLeave={() => setArrastandoArquivo(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setArrastandoArquivo(false)
                    carregar(e.dataTransfer.files?.[0])
                  }}
                >
                  <span className={s.areaTitulo}>Arraste uma imagem aqui</span>
                  <span className={s.areaApoio}>ou clique para escolher do computador</span>
                </button>
              )}
            </div>
          ) : null}

          {erro ? (
            <p className={s.erro} role="alert">
              {erro}
            </p>
          ) : null}
        </div>
      </ModalFluxo>

      {confirmandoDescarte ? (
        <ModalConfirmar
          titulo="Descartar alterações?"
          texto="Você perderá as alterações feitas nesta capa."
          rotuloConfirmar="Descartar"
          onConfirmar={onFechar}
          onCancelar={() => setConfirmandoDescarte(false)}
        />
      ) : null}
    </>
  )
}
