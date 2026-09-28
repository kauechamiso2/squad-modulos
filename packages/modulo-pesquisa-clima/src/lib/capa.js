/*
 * A capa de uma pesquisa: a faixa larga que a tela de Revisão desenha no topo.
 *
 * Três formas, uma de cada vez — cor sólida, gradiente ou imagem. A imagem
 * fica guardada como data URL já recortada na proporção da faixa: não há
 * servidor de arquivos, e guardar o original inteiro estouraria o
 * localStorage por uma imagem que só vai aparecer nessa proporção.
 *
 * `estiloDaCapa` devolve um objeto de estilo, e não uma string, porque a
 * imagem precisa de três propriedades para preencher a faixa sem deformar.
 * Serve tanto para a faixa de 200px quanto para a amostra de 32px.
 */

/* Ângulo e paradas do gradiente do Figma (8065:4916). O mesmo desenho da
   faixa da Revisão, para a prévia do modal não mentir. */
const ANGULO = '96.57deg'
const INICIO = '10.98%'
const FIM = '90.35%'

export const CAPA_PADRAO = {
  tipo: 'gradiente',
  de: '#d2cffb',
  ate: '#5c52ed',
}

export const COR_PADRAO = '#5c52ed'

/* A faixa ocupa a largura da tela (1440) com 200px de altura. É essa a
   proporção que o recorte da imagem tem de respeitar. */
export const LARGURA_DA_CAPA = 1440
export const ALTURA_DA_CAPA = 200
export const PROPORCAO = LARGURA_DA_CAPA / ALTURA_DA_CAPA

export const ehHex = (texto) => /^#[0-9a-fA-F]{6}$/.test(texto)

export const gradienteCss = (de, ate) =>
  `linear-gradient(${ANGULO}, ${de} ${INICIO}, ${ate} ${FIM})`

/*
 * Aceita o que estiver guardado e devolve sempre uma capa completa. A
 * primeira versão guardava só um hex solto; quem já salvou uma cor assim não
 * pode ver a capa sumir por causa do formato novo.
 */
export function normalizarCapa(capa) {
  if (!capa) return CAPA_PADRAO
  if (typeof capa === 'string') return { tipo: 'solida', cor: capa }
  if (capa.tipo === 'solida' || capa.tipo === 'gradiente' || capa.tipo === 'imagem') {
    return capa
  }
  return CAPA_PADRAO
}

export function estiloDaCapa(capa) {
  const c = normalizarCapa(capa)
  if (c.tipo === 'solida') return { background: c.cor }
  if (c.tipo === 'imagem') {
    return {
      backgroundImage: `url(${c.dados})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
  }
  return { background: gradienteCss(c.de, c.ate) }
}

/* ---- recorte da imagem ---- */

/*
 * O maior retângulo na proporção da faixa que cabe na imagem — o recorte com
 * zoom 1. Zoom maior encolhe esse retângulo (aproxima), e `fx`/`fy` dizem
 * onde ele fica, de 0 (encostado à esquerda/topo) a 1 (à direita/base).
 *
 * Tudo em coordenadas da imagem, e não em pixels de tela: a prévia do modal e
 * o canvas que grava têm tamanhos diferentes e precisam do mesmo recorte.
 */
export function recorteBase(largura, altura) {
  if (largura / altura >= PROPORCAO) return [altura * PROPORCAO, altura]
  return [largura, largura / PROPORCAO]
}

export const limitarFracao = (n) => Math.min(1, Math.max(0, n))

/*
 * O estilo que põe a imagem na caixa mostrando exatamente o recorte. As
 * porcentagens do `background-size` são relativas à caixa, e as do
 * `background-position` alinham o mesmo ponto da imagem com o da caixa — que
 * é justamente o significado de `fx`/`fy`.
 */
export function estiloDoRecorte({ fonte, largura, altura, zoom, fx, fy }) {
  const [baseL, baseA] = recorteBase(largura, altura)
  /* Os dois números saem da mesma ampliação, mas em porcentagens de lados
     diferentes da caixa — por isso não são iguais quando a imagem não está
     na proporção da faixa. */
  const escalaL = (100 * largura) / (baseL / zoom)
  const escalaA = (100 * altura) / (baseA / zoom)
  return {
    backgroundImage: `url(${fonte})`,
    backgroundSize: `${escalaL}% ${escalaA}%`,
    backgroundPosition: `${fx * 100}% ${fy * 100}%`,
    backgroundRepeat: 'no-repeat',
  }
}

/*
 * Quanto da imagem sobra para fora da caixa, em pixels dela. É o que converte
 * o arrasto do ponteiro em passo de `fx`/`fy`: arrastar a caixa inteira tem
 * de percorrer toda a sobra, nem mais nem menos.
 */
export function sobraDaCaixa(caixa, { largura, altura, zoom }) {
  const [baseL, baseA] = recorteBase(largura, altura)
  return [
    caixa.width * (largura / (baseL / zoom) - 1),
    caixa.height * (altura / (baseA / zoom) - 1),
  ]
}

/*
 * Grava o recorte num canvas do tamanho da faixa. JPEG e não PNG porque o
 * data URL vai para o localStorage: um PNG de 1440x200 passa fácil de 1 MB,
 * e o espaço é de poucos megabytes para todas as pesquisas juntas.
 */
export function recortarParaCapa(elemento, { largura, altura, zoom, fx, fy }) {
  const [baseL, baseA] = recorteBase(largura, altura)
  const recorteL = baseL / zoom
  const recorteA = baseA / zoom
  const canvas = document.createElement('canvas')
  canvas.width = LARGURA_DA_CAPA
  canvas.height = ALTURA_DA_CAPA
  const ctx = canvas.getContext('2d')
  ctx.drawImage(
    elemento,
    fx * (largura - recorteL),
    fy * (altura - recorteA),
    recorteL,
    recorteA,
    0,
    0,
    LARGURA_DA_CAPA,
    ALTURA_DA_CAPA,
  )
  return canvas.toDataURL('image/jpeg', 0.82)
}
