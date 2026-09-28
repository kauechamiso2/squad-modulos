/*
 * Grade de emojis por dominio, 7 colunas, com busca (Figma 2279:94479).
 * Mesma ideia do seletor de icone de time do Gestao de Pessoas: categorias
 * nomeadas em vez de uma lista unica gigante.
 *
 * Cada emoji leva nome em portugues e palavras em ingles porque o Figma
 * (2279:94620) mostra a busca por "Money" achando 💰 💵 💳 🏦 - o nome do
 * emoji no padrao Unicode e em ingles, e quem digita costuma usar os dois.
 */
const e = (emoji, nome, en) => ({ emoji, nome, en })

export const DOMINIOS = [
  {
    id: 'dinheiro',
    rotulo: 'Dinheiro',
    emojis: [
      e('💰', 'Saco de dinheiro', 'money bag cash'),
      e('💵', 'Nota de dinheiro', 'money banknote dollar cash'),
      e('💳', 'Cartão de crédito', 'money credit card'),
      e('🏦', 'Banco', 'money bank'),
      e('🧾', 'Recibo', 'receipt invoice'),
      e('📈', 'Gráfico subindo', 'chart increasing growth'),
      e('📉', 'Gráfico caindo', 'chart decreasing loss'),
      e('💸', 'Dinheiro voando', 'money with wings cash spend'),
      e('🪙', 'Moeda', 'coin'),
      e('💹', 'Gráfico com iene', 'chart yen'),
      e('🤝', 'Aperto de mão', 'handshake deal'),
      e('🛍️', 'Sacolas de compras', 'shopping bags retail'),
    ],
  },
  {
    id: 'trabalho',
    rotulo: 'Trabalho',
    emojis: [
      e('💼', 'Maleta', 'briefcase work business'),
      e('📅', 'Calendário', 'calendar date'),
      e('🗂️', 'Divisórias de arquivo', 'card index dividers files'),
      e('📊', 'Gráfico de barras', 'bar chart report'),
      e('🖥️', 'Computador', 'desktop computer'),
      e('💻', 'Notebook', 'laptop computer'),
      e('⚙️', 'Engrenagem', 'gear settings operation'),
      e('🧰', 'Caixa de ferramentas', 'toolbox maintenance'),
      e('📌', 'Alfinete', 'pushpin pin'),
      e('📎', 'Clipe de papel', 'paperclip attachment'),
      e('🗓️', 'Calendário mensal', 'spiral calendar month'),
      e('📋', 'Prancheta', 'clipboard list'),
    ],
  },
  {
    id: 'casa',
    rotulo: 'Casa',
    emojis: [
      e('🏠', 'Casa', 'house home rent'),
      e('🛋️', 'Sofá', 'couch furniture'),
      e('🔌', 'Tomada', 'electric plug energy'),
      e('🚿', 'Chuveiro', 'shower water'),
      e('🧹', 'Vassoura', 'broom cleaning'),
      e('🪴', 'Planta', 'potted plant'),
      e('🛠️', 'Ferramentas', 'hammer and wrench tools repair'),
      e('🔑', 'Chave', 'key access'),
      e('🧺', 'Cesto', 'basket laundry'),
      e('🪑', 'Cadeira', 'chair furniture'),
      e('🚪', 'Porta', 'door'),
      e('💡', 'Lâmpada', 'light bulb energy idea'),
    ],
  },
  {
    id: 'comida',
    rotulo: 'Comida',
    emojis: [
      e('🍔', 'Hambúrguer', 'hamburger food'),
      e('🍕', 'Pizza', 'pizza food'),
      e('☕', 'Café', 'coffee hot beverage'),
      e('🍎', 'Maçã', 'apple fruit food'),
      e('🥗', 'Salada', 'salad food healthy'),
      e('🍞', 'Pão', 'bread food'),
      e('🛒', 'Carrinho de compras', 'shopping cart market groceries'),
      e('🍽️', 'Prato e talheres', 'fork and knife plate restaurant'),
      e('🥤', 'Copo com canudo', 'cup with straw drink'),
      e('🍰', 'Bolo', 'shortcake cake dessert'),
      e('🍜', 'Macarrão', 'steaming bowl noodles food'),
      e('🧀', 'Queijo', 'cheese food'),
    ],
  },
  {
    id: 'transporte',
    rotulo: 'Transporte',
    emojis: [
      e('🚗', 'Carro', 'car automobile'),
      e('⛽', 'Posto de gasolina', 'fuel pump gas'),
      e('🚌', 'Ônibus', 'bus transport'),
      e('✈️', 'Avião', 'airplane flight travel'),
      e('🚕', 'Táxi', 'taxi cab'),
      e('🛵', 'Motoneta', 'motor scooter delivery'),
      e('🚲', 'Bicicleta', 'bicycle bike'),
      e('🛻', 'Picape', 'pickup truck'),
      e('🚦', 'Semáforo', 'traffic light'),
      e('🧭', 'Bússola', 'compass navigation'),
      e('🅿️', 'Estacionamento', 'parking'),
      e('🚄', 'Trem', 'train high speed'),
    ],
  },
  {
    id: 'pessoas',
    rotulo: 'Pessoas',
    emojis: [
      e('👤', 'Pessoa', 'bust in silhouette person client'),
      e('👥', 'Pessoas', 'busts in silhouette people clients'),
      e('🧑‍💼', 'Profissional', 'office worker professional'),
      e('👨‍👩‍👧', 'Família', 'family'),
      e('🙌', 'Mãos para cima', 'raising hands celebration'),
      e('🫱', 'Mão para a direita', 'rightwards hand'),
      e('🧑‍🔧', 'Mecânico', 'mechanic technician'),
      e('👩‍⚕️', 'Profissional de saúde', 'health worker doctor'),
      e('🎓', 'Formatura', 'graduation cap education'),
      e('🏥', 'Hospital', 'hospital health'),
      e('🎁', 'Presente', 'gift present'),
      e('❤️', 'Coração', 'red heart love'),
    ],
  },
]

export const TODOS_EMOJIS = DOMINIOS.flatMap((d) =>
  d.emojis.map((item) => ({ ...item, dominio: d.rotulo })),
)

/* Acentos fora, para "coracao" achar "Coração". */
function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

/*
 * Busca por nome em portugues, palavras em ingles ou nome do dominio. Sem
 * termo, devolve a grade inteira na ordem dos dominios.
 */
export function buscarEmojis(termo) {
  const t = normalizar(termo).trim()
  if (!t) return TODOS_EMOJIS
  return TODOS_EMOJIS.filter((item) =>
    normalizar(item.nome).includes(t) ||
    normalizar(item.en).includes(t) ||
    normalizar(item.dominio).includes(t),
  )
}

export function nomeDoEmoji(emoji) {
  return TODOS_EMOJIS.find((item) => item.emoji === emoji)?.nome ?? null
}

export default DOMINIOS
