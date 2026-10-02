import {
  User,
  Users,
  UsersFour,
  UsersThree,
  Handshake,
  Baby,
  Student,
  GraduationCap,
  IdentificationBadge,
  Certificate,
  PencilRuler,
  Palette,
  PaintBrush,
  Ruler,
  Pen,
  Crop,
  Image,
  PictureInPicture,
  Camera,
  FilmSlate,
  MagicWand,
  Briefcase,
  Suitcase,
  Buildings,
  Presentation,
  PresentationChart,
  ChartLine,
  ChartLineUp,
  ChartBar,
  ChartPie,
  Target,
  Trophy,
  Rocket,
  Lightbulb,
  Strategy,
  Kanban,
  Calendar,
  Clipboard,
  Note,
  Files,
  Folder,
  Code,
  Terminal,
  Cpu,
  Desktop,
  Laptop,
  Database,
  CloudCheck,
  GitBranch,
  Bug,
  Robot,
  Wrench,
  Gear,
  Circuitry,
  Plug,
  WifiHigh,
  ChatCircle,
  Chat,
  Envelope,
  Megaphone,
  Broadcast,
  Phone,
  Headset,
  Video,
  Microphone,
  SpeakerHigh,
  Globe,
  Storefront,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Bank,
  Wallet,
  CreditCard,
  Coin,
  Coins,
  Money,
  Receipt,
  Truck,
  Van,
  Airplane,
  Package,
  Scales,
  Handbag,
  Factory,
  Recycle,
  Leaf,
  Tree,
  Heart,
  Star,
  Sparkle,
  Compass,
  MapPin,
  Flag,
  Anchor,
  Hammer,
  Toolbox,
  Cube,
  Gift,
  Balloon,
  Confetti,
  Books,
  BookOpen,
} from '@phosphor-icons/react'

// 6 hue families of 6 shades each, in this exact order within a family -
// the canonical team color palette. A few shades (#726ce2, #1fb96e,
// #e9a716) double as anchors already used elsewhere in the app.
const TEAM_COLOR_FAMILIES = [
  {
    family: 'vermelho',
    shades: ['#f24c4c', '#e6393f', '#d62839', '#c11530', '#a5102b', '#8a0d24'],
  },
  {
    family: 'rosa',
    shades: ['#f26fb0', '#e94f9b', '#d93384', '#c11d70', '#a4145e', '#870f4c'],
  },
  {
    family: 'roxo',
    shades: ['#9b7ff0', '#8465e3', '#726ce2', '#5f4fc7', '#4c3fae', '#3a3095'],
  },
  {
    family: 'verde',
    shades: ['#4fd88a', '#2fc474', '#1fb96e', '#17a05c', '#0f8a4c', '#08733d'],
  },
  {
    family: 'azul',
    shades: ['#4fa8f0', '#2f8fe0', '#1f7cd0', '#0f68bd', '#0a5aa3', '#084a88'],
  },
  {
    family: 'amareloLaranja',
    shades: ['#ffd668', '#f5c144', '#e9a716', '#e08f14', '#c67810', '#a8630d'],
  },
]

// Blends a hex color toward white to derive a pale background tone to pair
// with it - the palette above only defines the accent/dark shade per
// swatch, but badges/chips throughout the app render a light+dark pair.
function lightenHex(hex, amount = 0.82) {
  const value = parseInt(hex.slice(1), 16)
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255]
  return `#${channels
    .map((channel) => Math.round(channel + (255 - channel) * amount).toString(16).padStart(2, '0'))
    .join('')}`
}

export const TEAM_COLOR_PALETTE = TEAM_COLOR_FAMILIES.flatMap(({ family, shades }) =>
  shades.map((hex, index) => ({
    id: `${family}-${index + 1}`,
    family,
    dark: hex,
    light: lightenHex(hex),
  })),
)

export function getTeamColorTones(colorId) {
  return TEAM_COLOR_PALETTE.find((entry) => entry.id === colorId) ?? TEAM_COLOR_PALETTE[0]
}

// Exactly one swatch per family - the first shade in that family's ordered
// list not already assigned to another team - omitting a family entirely
// once all 6 of its shades are in use (fewer than 6 options is then
// expected, not a bug).
export function getAvailableColorOptions(usedColorIds) {
  const usedSet = new Set(usedColorIds)
  const options = []
  for (const { family, shades } of TEAM_COLOR_FAMILIES) {
    for (let index = 0; index < shades.length; index += 1) {
      const id = `${family}-${index + 1}`
      if (!usedSet.has(id)) {
        options.push(TEAM_COLOR_PALETTE.find((entry) => entry.id === id))
        break
      }
    }
  }
  return options
}

export function pickDefaultColorId(usedColorIds) {
  const options = getAvailableColorOptions(usedColorIds)
  if (options.length === 0) return TEAM_COLOR_PALETTE[0].id
  return options[Math.floor(Math.random() * options.length)].id
}

const DEFAULT_ICON_NAME = 'UsersFour'

export const TEAM_ICON_CATEGORIES = [
  {
    id: 'pessoas',
    label: 'Pessoas',
    icons: [
      { name: 'User', Icon: User },
      { name: 'Users', Icon: Users },
      { name: 'UsersFour', Icon: UsersFour },
      { name: 'UsersThree', Icon: UsersThree },
      { name: 'Handshake', Icon: Handshake },
      { name: 'Baby', Icon: Baby },
      { name: 'Student', Icon: Student },
      { name: 'GraduationCap', Icon: GraduationCap },
      { name: 'IdentificationBadge', Icon: IdentificationBadge },
      { name: 'Certificate', Icon: Certificate },
    ],
  },
  {
    id: 'design',
    label: 'Design',
    icons: [
      { name: 'PencilRuler', Icon: PencilRuler },
      { name: 'Palette', Icon: Palette },
      { name: 'PaintBrush', Icon: PaintBrush },
      { name: 'Ruler', Icon: Ruler },
      { name: 'Pen', Icon: Pen },
      { name: 'Crop', Icon: Crop },
      { name: 'Image', Icon: Image },
      { name: 'PictureInPicture', Icon: PictureInPicture },
      { name: 'Camera', Icon: Camera },
      { name: 'FilmSlate', Icon: FilmSlate },
      { name: 'MagicWand', Icon: MagicWand },
    ],
  },
  {
    id: 'negocios',
    label: 'Negócios',
    icons: [
      { name: 'Briefcase', Icon: Briefcase },
      { name: 'Suitcase', Icon: Suitcase },
      { name: 'Buildings', Icon: Buildings },
      { name: 'Presentation', Icon: Presentation },
      { name: 'PresentationChart', Icon: PresentationChart },
      { name: 'ChartLine', Icon: ChartLine },
      { name: 'ChartLineUp', Icon: ChartLineUp },
      { name: 'ChartBar', Icon: ChartBar },
      { name: 'ChartPie', Icon: ChartPie },
      { name: 'Target', Icon: Target },
      { name: 'Trophy', Icon: Trophy },
      { name: 'Rocket', Icon: Rocket },
      { name: 'Lightbulb', Icon: Lightbulb },
      { name: 'Strategy', Icon: Strategy },
      { name: 'Kanban', Icon: Kanban },
      { name: 'Calendar', Icon: Calendar },
      { name: 'Clipboard', Icon: Clipboard },
      { name: 'Note', Icon: Note },
      { name: 'Files', Icon: Files },
      { name: 'Folder', Icon: Folder },
    ],
  },
  {
    id: 'tech',
    label: 'Tech',
    icons: [
      { name: 'Code', Icon: Code },
      { name: 'Terminal', Icon: Terminal },
      { name: 'Cpu', Icon: Cpu },
      { name: 'Desktop', Icon: Desktop },
      { name: 'Laptop', Icon: Laptop },
      { name: 'Database', Icon: Database },
      { name: 'CloudCheck', Icon: CloudCheck },
      { name: 'GitBranch', Icon: GitBranch },
      { name: 'Bug', Icon: Bug },
      { name: 'Robot', Icon: Robot },
      { name: 'Wrench', Icon: Wrench },
      { name: 'Gear', Icon: Gear },
      { name: 'Circuitry', Icon: Circuitry },
      { name: 'Plug', Icon: Plug },
      { name: 'WifiHigh', Icon: WifiHigh },
    ],
  },
  {
    id: 'comunicacao',
    label: 'Comunicação',
    icons: [
      { name: 'ChatCircle', Icon: ChatCircle },
      { name: 'Chat', Icon: Chat },
      { name: 'Envelope', Icon: Envelope },
      { name: 'Megaphone', Icon: Megaphone },
      { name: 'Broadcast', Icon: Broadcast },
      { name: 'Phone', Icon: Phone },
      { name: 'Headset', Icon: Headset },
      { name: 'Video', Icon: Video },
      { name: 'Microphone', Icon: Microphone },
      { name: 'SpeakerHigh', Icon: SpeakerHigh },
      { name: 'Globe', Icon: Globe },
    ],
  },
  {
    id: 'comercio',
    label: 'Comércio',
    icons: [
      { name: 'Storefront', Icon: Storefront },
      { name: 'ShoppingBag', Icon: ShoppingBag },
      { name: 'ShoppingCart', Icon: ShoppingCart },
      { name: 'Tag', Icon: Tag },
      { name: 'Bank', Icon: Bank },
      { name: 'Wallet', Icon: Wallet },
      { name: 'CreditCard', Icon: CreditCard },
      { name: 'Coin', Icon: Coin },
      { name: 'Coins', Icon: Coins },
      { name: 'Money', Icon: Money },
      { name: 'Receipt', Icon: Receipt },
      { name: 'Truck', Icon: Truck },
      { name: 'Van', Icon: Van },
      { name: 'Airplane', Icon: Airplane },
      { name: 'Package', Icon: Package },
      { name: 'Scales', Icon: Scales },
      { name: 'Handbag', Icon: Handbag },
      { name: 'Factory', Icon: Factory },
    ],
  },
  {
    id: 'objetos',
    label: 'Objetos',
    icons: [
      { name: 'Recycle', Icon: Recycle },
      { name: 'Leaf', Icon: Leaf },
      { name: 'Tree', Icon: Tree },
      { name: 'Heart', Icon: Heart },
      { name: 'Star', Icon: Star },
      { name: 'Sparkle', Icon: Sparkle },
      { name: 'Compass', Icon: Compass },
      { name: 'MapPin', Icon: MapPin },
      { name: 'Flag', Icon: Flag },
      { name: 'Anchor', Icon: Anchor },
      { name: 'Hammer', Icon: Hammer },
      { name: 'Toolbox', Icon: Toolbox },
      { name: 'Cube', Icon: Cube },
      { name: 'Gift', Icon: Gift },
      { name: 'Balloon', Icon: Balloon },
      { name: 'Confetti', Icon: Confetti },
      { name: 'Books', Icon: Books },
      { name: 'BookOpen', Icon: BookOpen },
    ],
  },
]

const ICON_COMPONENTS_BY_NAME = TEAM_ICON_CATEGORIES.reduce((acc, category) => {
  category.icons.forEach(({ name, Icon }) => {
    acc[name] = Icon
  })
  return acc
}, {})

export function getTeamIconComponent(iconName) {
  return ICON_COMPONENTS_BY_NAME[iconName] ?? UsersFour
}

const KEYWORD_ICON_MAP = [
  { keywords: ['venda', 'comercial', 'sales', 'negocio', 'negóci'], iconName: 'Tag' },
  { keywords: ['design', 'produto'], iconName: 'PencilRuler' },
  { keywords: ['marketing', 'growth', 'crescimento'], iconName: 'Megaphone' },
  { keywords: ['dev', 'desenvolv', 'engenharia', 'tech', 'tecno'], iconName: 'Code' },
  { keywords: ['financeiro', 'finança', 'financa'], iconName: 'Wallet' },
  { keywords: ['rh', 'pessoa', 'people', 'humano', 'gente'], iconName: 'UsersFour' },
  { keywords: ['suporte', 'atendimento', 'cs'], iconName: 'Headset' },
  { keywords: ['juridico', 'jurídico', 'legal'], iconName: 'Scales' },
  { keywords: ['log', 'operac', 'operaç'], iconName: 'Truck' },
]

export function guessTeamIconName(name) {
  const normalized = name.trim().toLowerCase()
  if (!normalized) return DEFAULT_ICON_NAME
  const match = KEYWORD_ICON_MAP.find((entry) =>
    entry.keywords.some((keyword) => normalized.includes(keyword)),
  )
  return match ? match.iconName : DEFAULT_ICON_NAME
}
