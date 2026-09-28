// Componentes extraidos de src/components/addCollaborator/ do projeto original.
// Estavam la por acidente historico: eram importados por addTeam/, addCargo/,
// addBeneficio/ e colaborador/ (42 imports cruzando pastas). Os arquivos foram
// MOVIDOS, nao reescritos - markup e nomes de classe sao identicos ao original.
export { default as IconButton } from './components/IconButton.jsx'
export { default as WizardShell } from './components/WizardShell.jsx'
export { default as ModalOverlay } from './components/ModalOverlay.jsx'
export { default as FieldModalShell } from './components/FieldModalShell.jsx'
export { default as Checkbox } from './components/Checkbox.jsx'
export { default as DiscardConfirmModal } from './components/DiscardConfirmModal.jsx'

// Componente novo, do monorepo.
export { default as ModuleCard } from './components/ModuleCard.jsx'

// --- Casca de fluxo (wizard) e primitivos, extraidos do Pesquisa de Clima na
// --- etapa 0, quando o Fluxo de Caixa virou o segundo consumidor.
export { default as FluxoLayout } from './components/fluxo/FluxoLayout.jsx'
export { default as CabecalhoFluxo } from './components/fluxo/CabecalhoFluxo.jsx'
export { default as RodapeFluxo } from './components/fluxo/RodapeFluxo.jsx'
export { default as Botao } from './components/fluxo/Botao.jsx'
export { default as IconeBotao } from './components/fluxo/IconeBotao.jsx'
export { default as ModalFluxo } from './components/fluxo/ModalFluxo.jsx'
export { default as ModalConfirmar } from './components/fluxo/ModalConfirmar.jsx'
export { default as Interruptor } from './components/fluxo/Interruptor.jsx'
export { default as LinhaResumo } from './components/fluxo/LinhaResumo.jsx'
export { default as useModal } from './components/fluxo/useModal.js'

// --- Barras flutuantes do rodape. Etapa 0: estavam duplicadas entre Gestao de
// --- Pessoas e Pesquisa de Clima; o Fluxo de Caixa seria a terceira copia.
// --- O que diverge entre os modulos vem por prop (icones, textos, slot de acao).
export { default as BottomSearchBar } from './components/BottomSearchBar.jsx'
export { default as BarraSelecao } from './components/BarraSelecao.jsx'

// --- Primitivos de tabela e toolbar. Etapa 3: extraidos do Gestao de Pessoas
// --- quando o Fluxo de Caixa virou o segundo consumidor. O que diverge entre
// --- os modulos vem por custom property, com default igual ao valor do GP.
export { Tabela, CabecalhoTabela, CelulaCabecalho, LinhaTabela, classesCelula } from './components/tabela/Tabela.jsx'
export { Toolbar, TotalItens, AcoesToolbar, ChipFiltro, BotaoFiltros } from './components/Toolbar.jsx'

// --- Painel lateral colado a direita. Extraido do FiltrosPanel do Gestao de
// --- Pessoas quando o Fluxo de Caixa virou o segundo consumidor.
export { default as PainelLateral } from './components/PainelLateral.jsx'

// --- Etapa de filtros do Fluxo de Caixa: pecas que existiam duplicadas ou so
// --- no Gestao de Pessoas e agora tem um segundo consumidor.
export { default as PilulaFiltro } from './components/PilulaFiltro.jsx'
export { default as DropdownColuna } from './components/DropdownColuna.jsx'
export { default as AvatarIniciais, corDoNome, iniciais } from './components/AvatarIniciais.jsx'

// --- Etapa 3 do Fluxo de Caixa: pecas do painel de detalhe, que ja existiam no
// --- detalhe do colaborador do Gestao de Pessoas.
export { default as LinhaInfo } from './components/LinhaInfo.jsx'
export { default as CampoInline } from './components/CampoInline.jsx'
export { default as OpcaoRadio } from './components/OpcaoRadio.jsx'
