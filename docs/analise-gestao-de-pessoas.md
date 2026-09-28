# Análise — módulo `gestao-de-pessoa`

> Análise de leitura do projeto `~/Documents/gestao-de-pessoa`, feita para planejar a absorção
> dele pelo monorepo `squad-modulos`. Nenhum arquivo do projeto original foi alterado.
>
> - Repositório: `https://github.com/brunovasconcelos-maker/squad-gestao-pessoas`
> - Branch: `main` · commit analisado: `ef20e86`
> - Volume: ~8.200 linhas de JS/JSX + ~3.160 linhas de CSS, 104 arquivos em `src/`
> - Data da análise: 22/09/2026
>
> Tudo abaixo foi verificado lendo os arquivos. Onde o código não decide a questão, está marcado
> como **⚠️ não determinado pelo código**.

---

## 1. Stack real

### 1.1 Resumo

| Item | Valor real |
|---|---|
| Framework | **React 19** (`react` e `react-dom` em `^19.2.8`) |
| Linguagem | **JavaScript puro (JSX)** — não é TypeScript |
| Build | **Vite `^8.2.2`** + `@vitejs/plugin-react ^6.1.0` |
| CSS | **CSS puro, sem framework** — um `.css` por componente, importado no `.jsx` |
| Tailwind | **Não usa.** Nem v3, nem v4, nem plugin do Vite, nem PostCSS |
| Roteador | `react-router-dom ^7.18.3`, em modo **`HashRouter`** |
| Estado global | **Nenhuma lib.** `useState`/`useMemo` locais + `localStorage` como fonte de verdade |
| Ícones | `@phosphor-icons/react ^2.1.10` + 40 SVGs locais em `src/assets/icons/` |
| Fonte | `@fontsource/inter ^5.3.0` (pesos 400/500/600/700) |
| Lint | `oxlint ^1.79.0` (não é ESLint) |
| Testes | **Nenhum.** Sem runner, sem arquivo de teste, sem script `test` |

### 1.2 `package.json`

Nome do pacote: `squad-gestao-pessoas`. `"private": true`, `"type": "module"`, versão `0.0.0`.

Scripts: `dev` (`vite`), `build` (`vite build`), `lint` (`oxlint`), `preview` (`vite preview`).

**Dependências de runtime — só 5:**

```
@fontsource/inter     ^5.3.0
@phosphor-icons/react ^2.1.10
react                 ^19.2.8
react-dom             ^19.2.8
react-router-dom      ^7.18.3
```

**devDependencies:** `@types/react ^19.2.18`, `@types/react-dom ^19.2.4`, `@vitejs/plugin-react ^6.1.0`, `oxlint ^1.79.0`, `vite ^8.2.2`.

> Observação: os pacotes `@types/*` estão instalados, mas **não existe `tsconfig.json`** e não há
> nenhum arquivo `.ts`/`.tsx` no projeto. Eles servem apenas para o autocomplete do editor. O
> projeto é 100% JS.

### 1.3 Tailwind — confirmação de ausência

Verificado por busca direta: não há `tailwind.config.*`, não há `postcss.config.*`, não há
diretiva `@tailwind`/`@apply` em nenhum CSS, e `tailwindcss` não aparece no `package-lock.json`.
O único match para "postcss" no lockfile é `node_modules/postcss` como **dependência transitiva
do próprio Vite** — não há pipeline PostCSS configurado pelo projeto.

**Todo o estilo é CSS escrito à mão**, com convenção BEM (`.bloco__elemento--modificador`),
em arquivos co-localizados com os componentes.

### 1.4 Roteador

`src/App.jsx` tem 10 linhas e define **uma única rota**:

```jsx
<HashRouter>
  <Routes>
    <Route path="/*" element={<Home />} />
  </Routes>
</HashRouter>
```

Toda a navegação interna acontece dentro de `Home.jsx`, que lê a URL com `useMatch('/colaborador/:id')`
e `useSearchParams()`. O `HashRouter` (URLs com `#/`) foi escolhido porque o deploy é GitHub Pages,
que não reescreve rotas para `index.html`.

### 1.5 Gerenciamento de estado

Não há Redux, Zustand, Jotai, React Query nem sequer um `Context`. O modelo é:

1. **`localStorage` é o banco de dados.** `src/utils/storage.js` expõe `getCollection`/`setCollection`/
   `addItem`/`removeItems`/`duplicateItems` sobre 4 chaves: `colaboradores`, `times`, `cargos`, `beneficios`.
2. **`Home.jsx` é o único "store"**, com ~20 `useState`. `collaborators` fica em estado React; já
   `times`, `cargos` e `beneficios` são **lidos do `localStorage` a cada render** (linha ~118), de
   propósito, para refletir criações feitas dentro de modais aninhados.
3. **Sincronização é via callback manual.** Componentes que escrevem recebem uma prop `onDataChanged`
   e chamam ela com a lista nova depois de persistir. Não há evento, nem subscription, nem
   invalidação automática.

### 1.6 `.github/workflows/deploy.yml`

Único workflow. Faz **deploy no GitHub Pages**:

- **Gatilho:** `push` na branch `main`, ou `workflow_dispatch` manual.
- **Permissões:** `contents: read`, `pages: write`, `id-token: write`. Concorrência no grupo `pages` com `cancel-in-progress: true`.
- **Job `build`:** `actions/checkout@v4` → `actions/setup-node@v4` (**Node 20**, cache npm) → `npm ci` → `npm run build` → `actions/configure-pages@v5` → `actions/upload-pages-artifact@v3` com `path: dist`.
- **Job `deploy`:** depende de `build`, roda `actions/deploy-pages@v4` no environment `github-pages`.

Não roda lint, não roda teste, não roda type-check. O build depende de o `base` do Vite bater com
o nome do repositório — ver §7.

---

## 2. Árvore de `src/`

```
src/
├── main.jsx                    Entrypoint: importa as 4 fontes Inter, index.css, roda os 3 seeds/migrations
│                               de storage e monta <App/> em #root dentro de <StrictMode>.
├── App.jsx                     HashRouter com uma rota única `/*` → <Home/>. 10 linhas.
├── index.css                   Reset global: importa tokens.css, define font-family Inter,
│                               box-sizing border-box, zera margens de h1/h2/h3/p, body e #root.
│
├── styles/
│   └── tokens.css              ÚNICO arquivo de design tokens: 6 cores + 3 font-weights em :root.
│
├── pages/
│   ├── Home.jsx                (654 linhas) O hub. Detém todo o estado da aplicação, deriva as 4 listas
│   │                           filtradas, e faz early-return de tela cheia para cada um dos 4 wizards.
│   └── Home.css                Layout raiz: sidebar + conteúdo, painel de aba, overlay do detalhe.
│
├── utils/
│   ├── storage.js              (190) Camada de localStorage. COLLECTIONS, CRUD, generateId,
│   │                           seedInitialData (6 cargos + 5 benefícios legados) e 2 migrations
│   │                           idempotentes (cleanupLegacySeedTimes, cleanupMultiTeamColaboradores).
│   ├── formatters.js           (93) Formatação pt-BR: datas por extenso/curta, moeda BRL,
│   │                           conversão centavos↔dígitos, faixa salarial, validação de email.
│   ├── teamOptions.js          (305) Paleta de 10 cores de time (par light/dark) + catálogo de ~100
│   │                           ícones Phosphor em 7 categorias + heurística que adivinha o ícone pelo nome do time.
│   ├── beneficioOptions.js     (64) 7 tipos de benefício, ícone por tipo, sugestões de fornecedor
│   │                           por tipo, e normalização do tipo para filtro.
│   ├── beneficiarios.js        (31) Resolve ao vivo quais colaboradores um benefício cobre
│   │                           (ids diretos + nomes de time + nomes de cargo + flag todaEmpresa).
│   └── useDropdownPosition.js  (32) Hook que posiciona dropdown por viewport (fixed), evitando
│                               clipping em ancestral com scroll. Re-calcula em scroll/resize.
│
├── assets/
│   ├── icons/                  40 SVGs importados como URL (não inline). Ex.: Close, CaretRight,
│   │                           MagnifyingGlass, Trash, Plus, Square, RadioButton, DotsThree…
│   ├── illustrations/          8 SVGs + 2 PNGs. Ilustrações do NovoModal (Colaborador, Cargo,
│   │                           Cartao, Dinheiro, Presente, Adicionar…) e o avatar Pipo.png.
│   └── images/                 3 PNGs "Frame 2147223814*.png" — logos de fornecedores dos
│                               benefícios legados (alice, caju, gympass).
│
└── components/
    ├── Sidebar.jsx/.css            Barra lateral DECORATIVA: 5 divs vazios. Sem navegação real.
    ├── PageHeader.jsx/.css         Cabeçalho: botão voltar (sem ação), título, botão tutorial (sem ação), botão "Novo".
    ├── Tabs.jsx/.css               Abas genéricas controladas: recebe tabs[], activeTab, onChange.
    ├── IconButton.jsx/.css         Botão redondo com <img>. size/iconSize/className configuráveis.
    ├── ActivityTag.jsx/.css        Badge colorido de tipo de contrato: Freelancer / Consultor / Desligado.
    ├── BottomSearchBar.jsx/.css    (129) Barra flutuante inferior com 3 modos: default, search
    │                               (filtra a aba ativa) e "pipo" (assistente — UI apenas, sem backend).
    ├── BulkActionBar.jsx/.css      Barra de ação em massa: contagem, "Add em time", excluir, fechar.
    ├── AddEmTimeModal.jsx          Modal de seleção múltipla de times para a ação em massa.
    │
    ├── CollaboradoresToolbar.jsx/.css  Toolbar da aba Colaboradores: total, toggle tabela/grade, filtros.
    ├── CollaboratorsTable.jsx/.css     (272) Tabela de colaboradores. Cabeçalhos ordenáveis e
    │                                   cabeçalhos-filtro com dropdown. Checkbox de seleção, menu de linha.
    ├── CollaboratorsGrid.jsx/.css      (78) Mesma lista em cards.
    ├── FiltrosPanel.jsx/.css           (272) Painel lateral de filtros de colaboradores/cargos:
    │                                   pills de time/cargo/atividade + intervalo de datas. Estado em rascunho até Salvar.
    │
    ├── TimesToolbar.jsx/.css       Toolbar da aba Times.
    ├── TimesGrid.jsx/.css          (108) Cards de time com cluster de 2 stickers (cor + ícone).
    │                               Cards `pending` vêm primeiro e mostram botão "Criar time".
    ├── TimesFiltrosPanel.jsx       (166) Painel de filtros de times: status (Pendente/Completo) + faixa de nº de pessoas.
    │
    ├── CargosToolbar.jsx/.css      Toolbar da aba Cargos.
    ├── CargosTable.jsx/.css        (275) Tabela de cargos. As linhas são DERIVADAS dos colaboradores,
    │                               agrupadas por (cargo × tipo de contrato) — não da coleção `cargos`.
    │
    ├── BeneficiosToolbar.jsx/.css  Toolbar da aba Benefícios.
    ├── BeneficiosGrid.jsx/.css     (79) Cards de benefício. Distingue benefício legado (imagem/badge
    │                               fixa do seed) de benefício criado no fluxo (ícone por tipo).
    ├── BeneficiosFiltrosPanel.jsx  (175) Filtros de benefício: tipo + faixa de nº de pessoas.
    │
    ├── addCollaborator/            ⚠️ Apesar do nome, esta pasta é o DESIGN SYSTEM de facto.
    │   ├── WizardShell.jsx/.css        Casca de wizard em tela cheia: header+título+fechar, body, footer
    │   │                               com barra de progresso e slots footerLeft/footerRight. Usado pelos 4 fluxos.
    │   ├── ModalOverlay.jsx/.css       Overlay + painel centrado de largura configurável.
    │   ├── FieldModalShell.jsx/.css    Modal padrão de campo: título, fechar, body, footer Voltar/Salvar.
    │   ├── buttons.css                 `.text-button` e `.pill-button` — os dois botões de todo o produto.
    │   ├── SelectListModal.css         Estilos da lista com busca + checkbox. Importado por 20 arquivos.
    │   ├── LargeFieldInput.css         Estilo do input grande de texto. Importado por 4 arquivos.
    │   ├── Checkbox.jsx                Checkbox visual (SVG de check ou ícone Square).
    │   ├── RadioListModal.jsx/.css     Modal de escolha única em lista de rádio.
    │   ├── MultiSelectFieldModal.jsx   (101) Lista multi-seleção com busca + "Criar X: …" que grava
    │   │                               um item novo com `pending: true` na coleção. Usado para Cargo e Time.
    │   ├── DateFieldModal.jsx/.css     Modal de data com input nativo + showPicker().
    │   ├── EndDateFieldModal.jsx       Variante do acima com checkbox "Sem data de fim" (valor null).
    │   ├── SalarioModal.jsx            Modal de valor monetário (título configurável).
    │   ├── EmailModal.jsx              Modal de email com validação.
    │   ├── ContratoModal.jsx           RadioListModal pré-configurado: Fixo / Consultor / Freelancer.
    │   ├── PagamentoModal.jsx          RadioListModal pré-configurado: Mensal / Anual / …
    │   ├── ReportaParaModal.jsx        Seleção de gestor, opcionalmente filtrada pelos times do colaborador.
    │   ├── DiscardConfirmModal.jsx/.css  Confirmação "descartar alterações?" — usada pelos 4 wizards.
    │   ├── NovoModal.jsx/.css          (192) O seletor ilustrado com 4 opções que abre cada wizard.
    │   ├── AddCollaboratorFlow.jsx     Orquestrador do wizard de colaborador (2 passos).
    │   ├── Step1BasicInfo.jsx/.css     Passo 1: nome + tipo de contrato.
    │   └── Step2AdditionalInfo.jsx/.css (323) Passo 2: lista de campos que abrem modais. Persiste
    │                                    o colaborador com addItem() no Continuar. Campos variam por contrato.
    │
    ├── addTeam/
    │   ├── NovoTimeFlow.jsx        (167) Orquestrador. Cria OU edita (se receber teamId). No save,
    │   │                           grava o time e reconcilia `times[]` de cada colaborador (add/remove/rename).
    │   ├── Step1TeamInfo.jsx/.css  Nome + cor + ícone. O ícone é adivinhado pelo nome até o usuário tocar nele.
    │   ├── Step2TeamInfo.jsx       (167) Líder + membros + descrição.
    │   ├── ColorPickerModal.jsx/.css  Grade das 10 cores da paleta.
    │   ├── IconPickerModal.jsx/.css   (74) Grade de ~100 ícones Phosphor com busca, em 7 categorias.
    │   ├── LiderModal.jsx          Seleção única de líder entre colaboradores.
    │   ├── MembrosModal.jsx        Seleção múltipla de membros (título configurável — reusado em Cargos).
    │   └── DescricaoModal.jsx/.css Textarea de descrição.
    │
    ├── addCargo/
    │   ├── NovoCargoFlow.jsx       (149) Orquestrador. Cria OU edita (cargoId). Mesma reconciliação
    │   │                           de `cargos[]` nos colaboradores que o fluxo de time faz.
    │   ├── Step1CargoInfo.jsx      Nome do cargo + abre MembrosModal para escolher colaboradores.
    │   ├── Step2CargoInfo.jsx      (167) "Reporta a" + descrição.
    │   └── ReportaAModal.jsx       Seleção de a quem o cargo reporta, excluindo nomes já usados.
    │
    ├── addBeneficio/
    │   ├── NovoBeneficioFlow.jsx   (196) Orquestrador de 4 passos com um ramo extra ('2n') para "Outro".
    │   ├── Step1TipoBeneficio.jsx/.css  Grade dos 7 tipos de benefício.
    │   ├── Step2Beneficio.jsx/.css      (155) Nome do fornecedor, com sugestões por tipo.
    │   ├── OutroChooserStep.jsx         Ramo "Outro": escolhe Fixo ou Verba.
    │   ├── OutroNomeStep.jsx            Ramo "Outro": digita o nome livre.
    │   ├── Step3Beneficiarios.jsx/.css  Quem recebe — abre o BeneficiariosModal.
    │   ├── BeneficiariosModal.jsx       (145) Seleção mista: colaboradores + times + cargos + "toda a empresa".
    │   ├── Step4Valores.jsx/.css        (272) Variantes de valor. 1 variante = vale para todos;
    │   │                                N variantes = cada uma com seus atribuídos. + infos adicionais.
    │   ├── AtribuirModal.jsx            Atribui pessoas a uma variante, ocultando quem já está em outra.
    │   ├── LinkModal.jsx                Campo de link do benefício.
    │   ├── ContatoFornecedorModal.jsx   Campo de contato do fornecedor.
    │   └── EmailFornecedorModal.jsx     Campo de email do fornecedor (com validação).
    │
    └── colaborador/
        ├── ColaboradorDetail.jsx/.css   (457) O maior componente de tela. Detalhe do colaborador
        │                                em 2 modos: `panel` (gaveta lateral) e `full` (tela cheia).
        │                                Edição inline de todos os campos, notas, benefícios resolvidos,
        │                                desligar/reativar, excluir.
        ├── InlineEditField.jsx/.css     (93) Campo editável in loco, com validate/format/parse plugáveis.
        ├── CargoField.jsx               (133) Campo de cargo: dropdown com busca e criação inline.
        ├── TimeField.jsx                (80) Campo de time: mesma ideia, limitado a 1 time.
        ├── ReportaParaField.jsx         (123) Campo de gestor, excluindo o próprio colaborador.
        ├── DateField.jsx                (103) Campo de data com Calendar em dropdown + "sem data de fim".
        ├── Calendar.jsx/.css            (111) Calendário mensal próprio, em pt-BR. Sem lib de datas.
        ├── CollaboratorRowMenu.jsx/.css (122) Menu "…" da linha: Ver, Excluir, Desligar/Reativar.
        ├── DeleteColaboradorModal.jsx   Confirmação de exclusão.
        └── DesligarColaboradorModal.jsx Confirmação de desligamento.
```

---

## 3. Inventário de componentes

Legenda da coluna **Destino**:
**`[COMPARTILHADO]`** = deve ir para um pacote de UI do monorepo ·
**`[MÓDULO]`** = específico de gestão de pessoas, fica no módulo ·
**`[REESCREVER]`** = placeholder/decorativo, o monorepo provavelmente fornece o real.

### 3.1 Primitivos e cascas — candidatos diretos ao pacote compartilhado

| Componente | Props | Usado em | Destino |
|---|---|---|---|
| `IconButton` | `icon, alt='', onClick, size=40, iconSize=24, className=''` | PageHeader, WizardShell, FieldModalShell, RadioListModal, TimesGrid, BeneficiosGrid, ColaboradorDetail, CollaboratorRowMenu, ColorPicker, IconPicker | **[COMPARTILHADO]** — primitivo puro, zero acoplamento |
| `Tabs` | `tabs[{id,label}], activeTab, onChange` | Home | **[COMPARTILHADO]** — totalmente genérico e controlado |
| `ModalOverlay` | `children, width, className=''` | FieldModalShell, RadioListModal, ColorPickerModal, IconPickerModal | **[COMPARTILHADO]** |
| `FieldModalShell` | `title, onClose, onSave, saveDisabled=false, children` | MultiSelect, DateField, Salario, Email, EndDate, AddEmTime, Atribuir, Beneficiarios, Lider, Membros, ReportaA… (~12) | **[COMPARTILHADO]** — é o padrão de modal do produto |
| `WizardShell` | `title='Novo Colaborador', onClose, progress, footerLeft, footerRight, children` | Todos os 10 passos dos 4 wizards | **[COMPARTILHADO]** — trocar o default do título por prop obrigatória |
| `RadioListModal` | `title, options[], value, onSave, onClose` | ContratoModal, PagamentoModal | **[COMPARTILHADO]** |
| `Checkbox` | `checked` | MultiSelect, AddEmTime, DateField, Membros, Beneficiarios, Atribuir, EndDate | **[COMPARTILHADO]** — note que é só visual (não tem `onChange`) |
| `DiscardConfirmModal` | `onCancel, onConfirm` | Os 4 orquestradores de wizard | **[COMPARTILHADO]** — genérico, só o texto é fixo em pt-BR |
| `InlineEditField` | `value, displayValue, disabled, onSave, validate, formatForInput, parseInput` | ColaboradorDetail | **[COMPARTILHADO]** — já é plugável por callbacks, nada sabe de RH |
| `Calendar` | `value (ISO), onSelect` | DateField | **[COMPARTILHADO]** — calendário pt-BR sem dependência externa |
| `DateFieldModal` | `title, value, onSave, onClose` | Step2AdditionalInfo | **[COMPARTILHADO]** |
| `useDropdownPosition` | `(open, anchorRef) → rect` | DateField, CargoField, TimeField, ReportaParaField | **[COMPARTILHADO]** — hook utilitário |
| `buttons.css` | `.text-button`, `.pill-button` (+`:disabled`) | 15 arquivos | **[COMPARTILHADO]** — são os únicos 2 botões do produto |
| `SelectListModal.css` | `.select-list__*` | **20 arquivos** | **[COMPARTILHADO]** |
| `LargeFieldInput.css` | `.large-field-input*` | 4 arquivos | **[COMPARTILHADO]** |

### 3.2 Layout e chrome

| Componente | Props | Usado em | Destino |
|---|---|---|---|
| `Sidebar` | — (nenhuma) | Home | **[REESCREVER]** — são 5 `<div>` vazios, puro placeholder visual. No monorepo a sidebar real é do shell da aplicação. |
| `PageHeader` | `title, onNovoClick` | Home | **[COMPARTILHADO]**, com ressalva: os botões "voltar" e "tutorial" **não têm `onClick`** — são decorativos. Ao promover, transformar em props opcionais. |
| `BulkActionBar` | `count, onAddEmTime, onDelete, onClose` | Home | **[COMPARTILHADO] parcial** — o padrão (barra flutuante de seleção) é genérico, mas o botão "Add em time" é de RH. Promover com `actions[]` configurável. |
| `BottomSearchBar` | `activeTab, onSearchChange` | Home | **[COMPARTILHADO] parcial** — a barra e o modo "Pipo" (assistente) tendem a ser globais do Squad, mas os placeholders são hardcoded por aba de RH. |

### 3.3 Específicos do fluxo de gestão de pessoas

Todos **[MÓDULO]**.

| Componente | Props |
|---|---|
| `CollaboratorsTable` | `collaborators, selectedIds, onToggleSelect, onSelectAll, onDeselectAll, columnFilters, onToggleFilterOption, onClearFilter, timeOptions, cargoOptions, atividadeOptions, onRowClick, onDataChanged` |
| `CollaboratorsGrid` | `collaborators, selectedIds, onToggleSelect, onCardClick, onDataChanged` |
| `CollaboradoresToolbar` | `total, view, onViewChange, onFiltrosClick, filtersSummary, onClearAllFilters` |
| `FiltrosPanel` | `isOpen, onClose, filters, onSave, timeOptions, cargoOptions, atividadeOptions` |
| `TimesGrid` | `teams, onCriarTime` |
| `TimesToolbar` | `total, onFiltrosClick, filtersSummary, onClearAllFilters` |
| `TimesFiltrosPanel` | `isOpen, onClose, filters, onSave` |
| `CargosTable` | `rows, selectedIds, onToggleSelect, onSelectAll, onDeselectAll, columnFilters, onToggleFilterOption, onClearFilter, timeOptions, atividadeOptions, onCriarCargo` |
| `CargosToolbar` | `total, onFiltrosClick, filtersSummary, onClearAllFilters` |
| `BeneficiosGrid` | `benefits, collaborators` |
| `BeneficiosToolbar` | `total, onFiltrosClick, filtersSummary, onClearAllFilters` |
| `BeneficiosFiltrosPanel` | `isOpen, onClose, filters, onSave` |
| `ActivityTag` | `contractType, desligado=false` |
| `AddEmTimeModal` | `teams, onSave, onClose` |
| `NovoModal` | `onClose, onSelectColaborador, onSelectTime, onSelectCargo, onSelectBeneficio` |
| `AddCollaboratorFlow` | `onExit` |
| `Step1BasicInfo` | `name, onNameChange, contractType, onOpenContrato, onExit, onContinue` |
| `Step2AdditionalInfo` | `name, contractType, onBack, onExit, onContinue` |
| `EmailModal` | `value, onSave, onClose` |
| `ContratoModal` | `value, onSave, onClose` |
| `PagamentoModal` | `value, onSave, onClose` |
| `SalarioModal` | `title='Salário', value, onSave, onClose` |
| `EndDateFieldModal` | `value, onSave, onClose` |
| `MultiSelectFieldModal` | `title, collectionName, createLabelPrefix, value, onSave, onClose` |
| `ReportaParaModal` | `value, teamFilter=[], onSave, onClose` |
| `NovoTimeFlow` | `teamId, onExit` |
| `Step1TeamInfo` | `name, onNameChange, colorId, onColorChange, iconName, onIconChange, onExit, onContinue` |
| `Step2TeamInfo` | `leaderId, onLeaderChange, membroIds, onMembrosChange, descricao, onDescricaoChange, collaborators, onBack, onExit, onContinue` |
| `ColorPickerModal` | `onSelect, onClose` |
| `IconPickerModal` | `value, onSelect, onClose` |
| `LiderModal` | `value, collaborators, onSave, onClose` |
| `MembrosModal` | `title='Adicionar membros', collaborators, value, onSave, onClose` |
| `DescricaoModal` | `value, onSave, onClose` |
| `NovoCargoFlow` | `cargoId, onExit` |
| `Step1CargoInfo` | `name, onNameChange, memberCount, onOpenColaboradores, onExit, onContinue` |
| `Step2CargoInfo` | `members, collaborators, reportaAExtra, onReportaAExtraChange, descricao, onDescricaoChange, onBack, onExit, onContinue` |
| `ReportaAModal` | `collaborators, excludedNames, value, onSave, onClose` |
| `NovoBeneficioFlow` | `onExit` |
| `Step1TipoBeneficio` | `onChoose, onExit` |
| `Step2Beneficio` | `tipo, providerName, onProviderNameChange, onBack, onExit, onContinue` |
| `OutroChooserStep` | `onChoose, onBack, onExit` |
| `OutroNomeStep` | `outroSubtipo, outroName, onOutroNameChange, onBack, onExit, onContinue` |
| `Step3Beneficiarios` | `colaboradorIds, teamNames, cargoNames, todaEmpresa, onApplySelection, collaborators, times, cargos, onBack, onExit, onContinue` |
| `BeneficiariosModal` | `colaboradorIds, teamNames, cargoNames, todaEmpresa, collaborators, times, cargos, onSave, onClose` |
| `Step4Valores` | `variants, onAddVariant, onRemoveVariant, onDigitsChange, onAssign, resolvedBeneficiaryIds, collaborators, infoAdicional, onInfoAdicionalChange, onBack, onExit, onContinue` |
| `AtribuirModal` | `people, value, assignedElsewhere, onSave, onClose` |
| `LinkModal` / `ContatoFornecedorModal` / `EmailFornecedorModal` | `value, onSave, onClose` |
| `ColaboradorDetail` | `id, mode, onClose, onExpand, onCollapse, onDataChanged` |
| `CollaboratorRowMenu` | `collaborator, onView, onDataChanged` |
| `CargoField` | `value, cargos, disabled, onSave` |
| `TimeField` | `value, times, disabled, onSave` |
| `ReportaParaField` | `value, ownId, collaborators, disabled, onSave` |
| `DateField` | `value, allowNoEnd, disabled, displayValue, onSave` |
| `DeleteColaboradorModal` / `DesligarColaboradorModal` | `name, onCancel, onConfirm` |

### 3.4 ⚠️ Achado mais importante para a extração

**A pasta `addCollaborator/` já é o design system do projeto, só que disfarçada.**

Existem **42 imports de CSS atravessando pastas**, e praticamente todos apontam para
`addCollaborator/`:

- `addCollaborator/SelectListModal.css` → importado por **20 arquivos** em 5 pastas diferentes
- `addCollaborator/buttons.css` → importado por **15 arquivos**
- `addCollaborator/Step1BasicInfo.css` → importado por steps de time, cargo e benefício (a classe `.step1` virou layout compartilhado)
- `addCollaborator/Step2AdditionalInfo.css` → importado por steps de cargo e benefício (a classe `.step2__row` virou "linha de campo" compartilhada)
- `addCollaborator/FieldModalShell.css`, `LargeFieldInput.css`, `DiscardConfirmModal.css`, `ModalOverlay.css` → idem

Consequência prática: **não dá para mover só a pasta `addCollaborator/` nem para deletar nada dela
sem quebrar os outros três fluxos.** A primeira tarefa da migração deveria ser extrair esses 7
arquivos de CSS + as cascas (`WizardShell`, `ModalOverlay`, `FieldModalShell`, `IconButton`,
`Checkbox`, `buttons.css`) para o pacote compartilhado, e só então mover o resto.

---

## 4. Design tokens

### 4.1 O que está formalizado

**Único arquivo de tokens: `src/styles/tokens.css`** (12 linhas, importado por `index.css`).

```css
:root {
  --color-bg: #ffffff;
  --color-text: #000000;
  --color-text-secondary: #798282;
  --color-border: #e3e6e6;
  --color-overlay: #f4f5f5;
  --color-accent-blue: #0f71b0;

  --font-weight-semibold: 600;
  --font-weight-medium: 510;   /* ⚠️ 510, não 500 */
  --font-weight-regular: 400;
}
```

Adoção real desses tokens (contagem de `var(--…)` em todo o `src/`):

| Token | Usos |
|---|---|
| `--color-text` | 88 |
| `--font-weight-medium` | 58 |
| `--color-text-secondary` | 42 |
| `--color-border` | 38 |
| `--color-overlay` | 37 |
| `--font-weight-regular` | 34 |
| `--color-bg` | 31 |
| `--font-weight-semibold` | 8 |
| `--color-accent-blue` | **1** |

### 4.2 Tokens que existem mas não estão em CSS

**A paleta de cores de time está em JS, não em CSS** — `src/utils/teamOptions.js`, constante
`TEAM_COLOR_PALETTE`: 10 entradas com par `light`/`dark`, aplicadas via `style={{}}` inline.

| id | light | dark |
|---|---|---|
| amber | `#FBEDD0` | `#D39A00` |
| blue | `#E5F4FF` | `#0091FF` |
| red | `#FDE2E2` | `#E5484D` |
| green | `#E3F5E1` | `#2F9E44` |
| purple | `#EDE3FB` | `#8B5CF6` |
| orange | `#FFE8D6` | `#F76B15` |
| teal | `#D9F2F0` | `#12B5A5` |
| magenta | `#FBE0F0` | `#E64980` |
| indigo | `#E0E7FF` | `#4C6EF5` |
| brown | `#F0E6D9` | `#A16207` |

### 4.3 Tipografia

- Família: **Inter** (`@fontsource/inter`, pesos 400/500/600/700 importados em `main.jsx`), com fallback `system-ui, sans-serif`.
- Escala de `font-size` em uso, por frequência: **14px (56×)**, **16px (30×)**, 20px (6×), 13px (4×), 12px (4×), 24px (3×), 18px (2×), 32px (1×).
- Não existe token de tamanho de fonte nem de line-height — todos os tamanhos são literais em px.

### 4.4 Radius

Nenhum token. Valores literais, por frequência:

`999px` (20×) · `360px` (18×) · `4px` (13×) · `8px` (7×) · `12px` (7×) · `16px` (6×) · `6px` (2×) · `10px` (2×) · `10.349px` (1×) · `0` (1×)

### 4.5 Sombras

Nenhum token. 6 sombras distintas:

| Sombra | Usos |
|---|---|
| `0px 0px 6px rgba(0,0,0,0.12)` | 9 |
| `0px 4px 12px rgba(0,0,0,0.12)` | 3 |
| `0px 4px 12px rgba(0,0,0,0.08)` | 2 |
| `0px 0px 12px rgba(0,0,0,0.08)` | 2 |
| `0px 2px 8px rgba(0,0,0,0.08)` | 1 |
| `0px 3.105px 5.071px rgba(0,0,0,0.05)` | 1 |

### 4.6 Espaçamento

Nenhum token. `gap` segue uma escala de 4 razoavelmente disciplinada:

`8px` (37×) · `12px` (30×) · `20px` (8×) · `40px` (7×) · `4px` (6×) · `24px` (3×) · `16px` (3×) · `6px` (2×) · `32px` (1×) · `21px` (1×) · `120px` (1×)

`padding` mais comuns: `12px 16px` (11×), `0 16px` (10×), `24px` (8×), `16px 0` (6×), `0 40px` (4×).

### 4.7 Inconsistências encontradas

1. **`--font-weight-medium: 510`** — valor não padrão (Inter variable permite, mas é uma escolha
   silenciosa). Pior: existem **9 ocorrências de `font-weight: 500` hardcoded**, ou seja, há dois
   "medium" ligeiramente diferentes convivendo na UI.
2. **Preto e branco escapam dos tokens.** `#000000` e `#ffffff` aparecem hardcoded 5× cada, em
   `FiltrosPanel.css` (pill selecionada) e `Calendar.css` (dia selecionado), embora existam
   `--color-text` e `--color-bg` com exatamente esses valores.
3. **Cores semânticas sem token.** As cores de estado do `ActivityTag` são literais:
   `#0091ff` (Consultor), `#60c60c` (Freelancer), `#ff2633` (Desligado). O vermelho `#ff2633`
   se repete em `ColaboradorDetail.css`. Nada disso está em `tokens.css`.
4. **Dois cinzas de borda concorrentes.** `--color-border` é `#e3e6e6`, mas `TimesGrid.css` e
   `BeneficiosGrid.css` usam `1px solid #d9d9d9`, e `DescricaoModal.css`/`DateFieldModal.css` usam
   `#b2b9b9`. Três cinzas de borda diferentes.
5. **`--color-accent-blue` é praticamente morto** — 1 uso em todo o projeto. Já o azul da paleta
   de times (`#0091FF`) é usado de fato. Provavelmente sobra de uma versão anterior.
6. **Paleta "quente" órfã** em `BottomSearchBar.css`: `#fdf6e8`, `#fbedd0`, `#5d4309`, `#f6dca2`.
   O `#fbedd0` e o `#5d4309` também aparecem em `ColaboradorDetail.css`. É um tema secundário
   (amarelo/âmbar, do assistente Pipo) que nunca virou token.
7. **Radius duplicado semanticamente:** `999px` e `360px` significam a mesma coisa ("pílula") e
   são usados quase igualmente (20× e 18×). Além disso `10.349px` é claramente um valor
   exportado do Figma sem arredondar.
8. **Sem dark mode.** `index.css` fixa `color-scheme: light`. Não há `prefers-color-scheme`
   em lugar nenhum. Se o monorepo tiver tema escuro, este módulo não acompanha.

---

## 5. Fluxo de navegação

### 5.1 Ponto crucial: só 3 URLs existem

O roteador tem **uma rota** (`/*`). Dentro de `Home.jsx`, apenas três estados são refletidos na URL:

| URL (com `HashRouter`) | Tela |
|---|---|
| `#/` | Home com as 4 abas |
| `#/colaborador/:id` | Home + detalhe do colaborador em **gaveta lateral** |
| `#/colaborador/:id?view=full` | Detalhe do colaborador em **tela cheia** |

**Todo o resto — as 4 abas e os 4 wizards inteiros — não tem URL.** As abas são `useState`
(`activeTab`). Os wizards são *early returns* de `Home`:

```jsx
if (addCollaboratorFlowOpen) return <AddCollaboratorFlow onExit={…} />
if (novoTimeFlowOpen)        return <NovoTimeFlow teamId={novoTimeTeamId} onExit={…} />
if (novoCargoFlowOpen)       return <NovoCargoFlow cargoId={novoCargoId} onExit={…} />
if (novoBeneficioFlowOpen)   return <NovoBeneficioFlow onExit={…} />
```

Consequências: não há deep-link para um wizard; o botão "voltar" do navegador não sai de um
wizard; e um refresh no meio de um wizard perde tudo.

### 5.2 Percurso do usuário

```
#/  Home
 ├── Tabs (useState, sem URL)
 │    ├── Colaboradores ── toggle tabela ⇄ grade (useState `view`)
 │    ├── Times
 │    ├── Cargos
 │    └── Benefícios
 │
 ├── Barra inferior: BottomSearchBar (busca a aba ativa) …
 │   … ou BulkActionBar quando há seleção → "Add em time" | Excluir
 │
 ├── Painel de filtros lateral (por entidade; estado em rascunho até "Salvar")
 │
 ├── [Novo] → NovoModal ─┬→ Colaborador → AddCollaboratorFlow
 │                       ├→ Time       → NovoTimeFlow
 │                       ├→ Cargo      → NovoCargoFlow
 │                       └→ Benefício  → NovoBeneficioFlow
 │
 └── clique em linha/card → #/colaborador/:id (gaveta)
                              ├── expandir → ?view=full
                              ├── recolher → volta para gaveta
                              └── fechar   → #/
```

**Wizard de Colaborador** (2 passos, `progress` 50 → 100)
`Step1BasicInfo` (nome + contrato via `ContratoModal`) → `Step2AdditionalInfo` (lista de campos,
cada um abrindo um modal) → **Continuar persiste** com `addItem(COLABORADORES)` → `onExit()`.

**Wizard de Time** (2 passos) — aceita `teamId`, então serve para **criar e editar**.
`Step1TeamInfo` (nome, cor, ícone) → `Step2TeamInfo` (líder, membros, descrição) →
`handleSave()` grava o time **e reconcilia o array `times[]` de cada colaborador** (adiciona
quem entrou, remove quem saiu, renomeia se o nome mudou).

**Wizard de Cargo** (2 passos) — aceita `cargoId`, também cria e edita. Mesma reconciliação,
sobre `cargos[]`.

**Wizard de Benefício** (4 passos + ramo) — o único não linear:

```
1 TipoBeneficio ─┬─ tipo ≠ "Outro" ─→ 2 Step2Beneficio (fornecedor) ─┐
                 └─ tipo = "Outro" ─→ 2 OutroChooserStep (Fixo|Verba)│
                                       └→ '2n' OutroNomeStep ────────┤
                                                                     ↓
                                              3 Step3Beneficiarios (quem recebe)
                                                                     ↓
                                              4 Step4Valores (variantes de valor + infos)
                                                                     ↓
                                                       addItem(BENEFICIOS)
```

O "voltar" do passo 3 é condicional: `setStep(tipo === 'Outro' ? '2n' : 2)`. Note que `step` é
tipado de forma mista — números e a string `'2n'`.

### 5.3 Como o estado atravessa as telas

Quatro mecanismos distintos, e vale conhecer todos antes de refatorar:

1. **Props drilling dentro de um wizard.** Cada orquestrador (`*Flow.jsx`) detém todo o rascunho
   em `useState` e passa valor + setter para o passo. Nada é persistido até o passo final. Um
   `DiscardConfirmModal` protege a saída.

2. **`localStorage` entre telas.** A comunicação real entre o wizard e a Home é o storage. O
   wizard grava, chama `onExit()`, e a Home **relê** a coleção:
   ```jsx
   onExit={() => { setCollaborators(getCollection(COLLECTIONS.COLABORADORES)); setNovoTimeFlowOpen(false) }}
   ```

3. **Leitura direta a cada render (deliberada).** Em `Home.jsx`, `times`, `cargos` e `beneficios`
   **não ficam em estado** — são lidos do storage em todo render. Isso existe porque um modal
   aninhado (`MultiSelectFieldModal`) pode criar um time ou cargo no meio de outro fluxo, e a
   aba precisa refletir isso sem nenhum evento. O comentário no código diz isso explicitamente.

4. **Callback `onDataChanged` subindo.** Componentes profundos que escrevem no storage
   (`ColaboradorDetail`, `CollaboratorRowMenu`, `CollaboratorsTable`, `CollaboratorsGrid`)
   recebem `onDataChanged` e chamam com a lista nova, que a Home aplica em `setCollaborators`.

5. **URL como estado.** Só para o detalhe do colaborador: o `:id` e `?view=full`. Há ainda um
   detalhe sutil em `Home.jsx` — um módulo-level `initialHashPath` lido **uma vez por page load**
   decide se a tela abriu direto na rota de colaborador (link colado / refresh), o que força modo
   tela cheia; um `forceFullScreenRef` guarda isso e é zerado se o usuário recolher para gaveta.

### 5.4 Modelo de dados (`localStorage`)

Quatro chaves, todas arrays de objetos com `id` gerado por `generateId()` (`Date.now().toString(36) + random`).

- **`colaboradores`** — `{ id, name, contractType: 'Fixo'|'Consultor'|'Freelancer', email, cargos: string[], times: string[], reportaPara, desligado?, notas? }` e, se `Fixo`: `dataAdmissao`, `salario`; senão: `dataInicioContrato`, `dataFimContrato` (`null` = sem fim), `tipoPagamento`, `valorPagamento`.
- **`times`** — `{ id, name, color, icon, leaderId, membros: id[], descricao, pending }`
- **`cargos`** — `{ id, name, colaboradorIds: id[], reportaAExtra, descricao, pending }`
- **`beneficios`** — criados: `{ id, tipo, name, outroSubtipo, beneficiarios: {colaboradorIds, teamNames, cargoNames, todaEmpresa}, valores: [{id, valor, aplicaATodos, colaboradorIds}], linkBeneficio, contatoFornecedor, emailFornecedor }`; legados (seed): `{ id, name, memberCount, iconType, image|icon }`.

⚠️ **Observação de modelagem:** colaborador referencia time e cargo **por nome (string)**, não por
id. É por isso que renomear um time exige varrer todos os colaboradores. A flag `pending: true`
marca registros criados "de raspão" dentro de outro fluxo, que ainda não passaram pelo wizard completo.

---

## 6. Dependências externas e chamadas de API

### 6.1 Chamadas de rede: nenhuma

Busca por `fetch(`, `axios`, `XMLHttpRequest`, `WebSocket`, `EventSource` em todo o `src/`:
**zero ocorrências**. Não há cliente HTTP, nem camada de serviço, nem cliente GraphQL.

**Não há mocks no sentido de fixtures de API.** O que existe é `seedInitialData()` em
`storage.js`, que na primeira visita do navegador popula:

- **`cargos`**: 6 nomes fixos (Designer de Produto Senior/Pleno/Junior, Designer Gráfico, Head de Produto, Head de Marketing), todos `pending: false`.
- **`beneficios`**: 5 registros legados (Plano de Saude, Vale Refeição, Auxilio Home Office, Gympass, Vale Transporte), todos com `memberCount: 12` fixo.
- **`colaboradores` e `times` não são semeados** — começam vazios.

Há ainda duas **migrations idempotentes** rodadas em todo load (`main.jsx`):
`cleanupLegacySeedTimes()` (remove times de um seed antigo) e `cleanupMultiTeamColaboradores()`
(trunca `times[]` para no máximo 1 item).

⚠️ **Implicação para o monorepo:** o módulo não tem nenhuma fronteira de dados. Quando o Squad
tiver backend, a substituição é inteiramente dentro de `src/utils/storage.js` — mas as funções
hoje são **síncronas**, e toda a UI depende disso (`const times = getCollection(...)` direto no
corpo do render). Trocar por API assíncrona **não é um swap de implementação**: exige tornar
assíncronos todos os pontos de leitura e introduzir estados de loading/erro que hoje não existem
em lugar nenhum. É o maior item de trabalho não-óbvio da migração.

### 6.2 Superfície externa real

| Origem | O que entra no bundle |
|---|---|
| `@phosphor-icons/react` | ~110 ícones distintos (≈100 em `teamOptions.js`, 7 em `beneficioOptions.js`, o resto avulso) |
| `@fontsource/inter` | 4 arquivos de fonte, **auto-hospedados** (nada vem de CDN em runtime) |
| `react`, `react-dom`, `react-router-dom` | — |

**Nenhuma requisição externa em runtime.** Sem Google Fonts, sem CDN, sem analytics, sem
telemetria, sem Sentry. A aplicação funciona offline depois de carregada.

### 6.3 APIs do navegador usadas

`localStorage` (crítico — é o banco), `window.location.hash`, `requestAnimationFrame`
(animação de entrada do detalhe), `getBoundingClientRect` + listeners de `scroll`/`resize`
(`useDropdownPosition`), `document.addEventListener('mousedown')` (fechar ao clicar fora),
e `HTMLInputElement.showPicker()` (seletor de data nativo — **sem fallback além de `?.focus()`**).

---

## 7. Riscos para mover o projeto para dentro do monorepo

Ordenados por gravidade.

### 🔴 Alto

**1. `base` do Vite está fixo no nome do repositório antigo**

```js
// vite.config.js
export default defineConfig({ base: '/squad-gestao-pessoas/', plugins: [react()] })
```

Esse `base` existe porque o GitHub Pages serve o site em `usuario.github.io/squad-gestao-pessoas/`.
Dentro de `squad-modulos` o caminho muda. Se ficar como está, **todos os assets 404 em produção**
(o dev server local continua funcionando, então a quebra só aparece depois do deploy). Precisa
virar algo como `/squad-modulos/gestao-de-pessoas/`, ou ser parametrizado por env.

**2. CSS é 100% global — colisão real entre módulos**

Não há CSS Modules, nem `scoped`, nem hashing. Todo `import './X.css'` injeta regras no escopo
global. Já existem hoje **9 seletores de raiz genéricos** que qualquer outro módulo do Squad
pode redefinir sem perceber:

`.pill-button` · `.text-button` · `.beneficio-card` · `.beneficio-tipo` · `.time-card` ·
`.team-color-dot` · `.team-color-swatch-button` · `.team-field-row` · `.team-icon-swatch-button`

Pior: `tokens.css` define variáveis em `:root`. Dois módulos com `tokens.css` diferentes no mesmo
bundle — **o último a carregar vence**, silenciosamente. Decidir cedo entre CSS Modules,
prefixo por módulo, ou um pacote de tokens único para o monorepo.

**3. `addCollaborator/` é um pacote compartilhado disfarçado de pasta de feature**

42 imports de CSS cruzando pastas apontam para lá (detalhe em §3.4). Qualquer reorganização de
pastas que mova `addCollaborator/` sem mover junto os consumidores quebra os fluxos de time,
cargo, benefício **e** o detalhe do colaborador. Extrair primeiro o design system, migrar depois.

**4. `localStorage` sem namespace**

As chaves são literalmente `'colaboradores'`, `'times'`, `'cargos'`, `'beneficios'`. Em um monorepo
onde vários módulos rodam **na mesma origem**, outro módulo com um conceito de "times" sobrescreve
os dados deste. Prefixar (`squad:gestao-pessoas:times`) é obrigatório — e exige uma migration,
porque os dados já existentes nos navegadores estão sob as chaves antigas.

### 🟡 Médio

**5. O workflow de deploy assume um repositório de um projeto só**

`deploy.yml` faz `npm ci` + `npm run build` na raiz e publica `dist/` inteiro no Pages. Num
monorepo isso precisa virar build por workspace (com `working-directory` ou filtro de pacote),
e o Pages passa a hospedar vários módulos — o que muda o `base` de cada um. O grupo de
concorrência `pages` também vira gargalo: dois módulos publicando ao mesmo tempo se cancelam.

**6. `HashRouter` não compõe com um shell de aplicação**

Só pode haver um roteador de hash na página. Se o monorepo tiver um shell com `BrowserRouter`,
este módulo precisa migrar para rotas aninhadas e um `basename`. A migração em si é pequena
(`App.jsx` tem 10 linhas), mas **muda todas as URLs** de `#/colaborador/:id` para
`/gestao-de-pessoas/colaborador/:id`, invalidando qualquer link salvo.

**7. Wizards não são rotas**

Os 4 fluxos são early-returns que substituem a página sem mexer na URL. Se o shell do monorepo
tiver chrome persistente (header, sidebar), esses returns vão **escapar do layout** e ocupar a
tela inteira. Provavelmente precisam virar rotas de verdade, ou serem renderizados em portal.

**8. `Sidebar` é falsa e `PageHeader` tem botões mortos**

`Sidebar` são 5 `<div>` vazios sem navegação. Em `PageHeader`, os botões "voltar" e "tutorial"
são renderizados **sem `onClick`**. No projeto isolado isso passa como mock visual; dentro do
monorepo, ou o shell fornece esses elementos (e o módulo para de renderizá-los), ou eles
precisam ganhar comportamento.

**9. Nomes de arquivo com espaço**

`src/assets/images/Frame 2147223814.png`, `-1.png`, `-2.png` são importados com espaço no
caminho (`from '../assets/images/Frame 2147223814.png'`). Vite lida bem, mas alguns bundlers,
scripts de CI e ferramentas de workspace não. Renomear (`alice.png`, `caju.png`, `gympass.png`)
é barato e remove uma classe inteira de problema.

### 🟢 Baixo — riscos que **não** se materializaram

Vale registrar o que foi verificado e está limpo, para não gastar tempo com isso:

- **Sem variáveis de ambiente.** Zero ocorrências de `import.meta.env`, `process.env` ou `VITE_*`. Nada de `.env` para migrar.
- **Sem aliases de path.** Todos os imports internos são relativos (`./`, `../`, `../../`). Não há `@/`, `~/`, nem `paths` de tsconfig. Mudar a pasta do projeto **não quebra nenhum import**.
- **Sem imports profundos entre módulos.** A profundidade máxima é `../../`, sempre dentro de `src/`. Nada sai da raiz do projeto.
- **`public/` tem um único arquivo:** `favicon.svg`, referenciado como `/favicon.svg` em `index.html`. É o **único** caminho absoluto do projeto — e o Vite reescreve ele com o `base`, então acompanha automaticamente a correção do item 1.
- **Todos os outros assets são importados, não referenciados por URL.** Os 40 ícones, 10 ilustrações e 3 imagens entram por `import x from '../assets/…'`, ou seja, passam pelo bundler, ganham hash e seguem o `base`. Podem mudar de pasta sem risco.
- **Sem uso de `import.meta.url` ou `BASE_URL`** no código.
- **Sem CSS órfão.** Todos os 47 arquivos `.css` têm ao menos um importador.
- **Sem testes para migrar** (o que também significa: sem rede de segurança para a migração).

### 7.1 Ordem sugerida de migração

1. Namespaçar as chaves de `localStorage` **e escrever a migration** dos dados antigos.
2. Extrair o design system (`WizardShell`, `ModalOverlay`, `FieldModalShell`, `IconButton`, `Checkbox`, `Tabs`, `RadioListModal`, `InlineEditField`, `Calendar`, `useDropdownPosition` + `buttons.css`, `SelectListModal.css`, `LargeFieldInput.css`, `tokens.css`) para um pacote compartilhado — antes de mover qualquer coisa de lugar.
3. Consolidar os tokens: absorver a paleta de times, as cores semânticas do `ActivityTag`, radius, sombras e a escala de fonte; resolver o conflito `510` vs `500`.
4. Decidir o isolamento de CSS (CSS Modules ou prefixo) e aplicar nos 9 seletores genéricos.
5. Mover o módulo para `packages/gestao-de-pessoas` (ou equivalente) — os imports relativos sobrevivem intactos.
6. Ajustar `base` do Vite e reescrever o workflow de deploy por workspace.
7. Por último, e só se o shell exigir: trocar `HashRouter` por rotas aninhadas e promover os wizards a rotas.
