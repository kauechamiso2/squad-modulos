# Gestão de Pessoas: project context and spec

Last updated: 2026-10-01

## How to use this document

- **Figma is the source of truth.** This document transcribes the Figma screen by screen, with node ids, and adds the project rules that a screen cannot show. If the code, this document and Figma disagree, Figma wins. Report the difference.
- Fetch every screen state from Figma with its own node id before building it, and read sizes, weights, colors and spacing from the design context. Map SF Pro to Inter: Semibold 600, Medium 500, Regular 400.
- Where Figma has no screen, the item says **No Figma** and gives the rule to follow. Do not invent anything beyond it. Ask.
- Each section lists the mock errors of its frames. Do not copy them.
- Build in the order of "Build order", with a build, a browser check and a short report at the end of each part.
- An earlier version of this document compared the old platform ("Before") with the decisions ("Now"). That history was removed. Only the current spec remains.

## Product context

Gestão de Pessoas is the module of the Pipo agent (people and knowledge) for creating and managing a company's collaborators in one place. It is built for HR teams of companies with 50 to 100 employees.

**Out of scope:** recruiting, shift schedules (Opy), time tracking, real contract generation and e-signature (Juri), and benefit cards and payments.

**Not built yet:** the Pipo chat, Opy data (schedule, vacation, leaves), file upload and real contract generation. These touchpoints are simulated or interface only: contract generation is simulated, absences are mocked in the seed, and Jornada de trabalho and Documentos have no real action.

**The model in short.** There are two contract types, CLT and PJ. Cargo is free text. Status is calculated from a checklist and never picked by hand. A person can be in several teams. Recursos have three types (Benefício, Verba, Licença) and link to the whole company, to teams or to people, never to a cargo.

## Stack and working rules

**Stack**

- React, Vite and react-router-dom, with HashRouter.
- Monorepo with npm workspaces and one `package-lock.json` at the root. The module lives in `packages/modulo-gestao-pessoas/` and is mounted by `apps/web` at `/gestao-de-pessoas/*`, under the single HashRouter. Build with `npm run build` at the root. The Vite `base` is set in `apps/web` and must not change.
- Shared components come from `@squad/ui` (Tabela, LinhaTabela, DropdownColuna), which other modules such as Fluxo de Caixa also use. Do not change their defaults. If the module needs something different, add an opt-in prop with the current default.
- Font: Inter through `@fontsource/inter`. No CDN.
- Data: `localStorage` only. The storage is shared with the other modules of `apps/web`, so only touch keys of this module. The key `squad:gestao-pessoas:versao-dados` holds the data version: bumping it clears this module's old data and writes the seed again. When the stored version is newer than the code, nothing runs.
- Icons: SVG files in the module's icons folder, named exactly as the Figma layers. `@phosphor-icons/react` is also installed.
- Logos and images: `src/assets/images`, named by supplier or service (for example `alice`, `slack`), because the Figma layers are generic ("image 1").
- This document lives in `docs/contexto-gestao-de-pessoas.md`, at the monorepo root.

**Working rules**

- Build the visual first, then the behavior.
- Keep each change narrow, with no side effects on other modules.
- No silent fallbacks and no placeholders. If an asset is missing or something fails, report it.
- Verify with a local build and a quick browser check.
- UI copy is in Brazilian Portuguese, in sentence case, even where Figma uses capitals. Brand names keep their own spelling. No em dashes in any text, except "—" as the empty-value symbol.
- Title highlights use #e9a716, unless a section says otherwise.
- Dates always come from the real current day. Never hardcode a date.

## Data model

### Collaborator

| Field | Notes |
| --- | --- |
| tipo | CLT or PJ |
| nome, cargo | Cargo is free text and optional |
| contato | Type (telefone or email) and value |
| email, times, reportaPara | Filled in "Completar cadastro". Times is a list |
| CLT fields | cpf, dataNascimento, dataAdmissao, salarioBruto, custoEmpresa |
| PJ fields | cnpj, razaoSocial, dataAdmissao, dataFimContrato (none means a fixed PJ, a date means a temporary PJ), pagamento (Mensal, Anual or Valor fixo), valorContrato |
| envioContrato, contratoGerado | Where the contract was sent (channel and destination) and whether it was generated |
| dadosBancarios | banco, agencia, tipoConta (Corrente or Poupança), numeroConta, titular, chavePix. Complete with a full account (banco, agência, número and titular) or a chave PIX |
| admissao, rescisao | Checklists. Rescisão stores the termination type for CLT |
| ausencia | tipo (ferias, licenca_medica, licenca_maternidade, licenca_paternidade), inicio, fim. Mocked in the seed, with no screen to edit it |
| notas | Notes with their date |
| contractType, desligado | Legacy fields, kept only for the bridges (see Implementation status) |

### Status

Status comes only from `getStatus()` in `colaboradorStatus.js`.

| Status | When | Color |
| --- | --- | --- |
| Pendente X/Y | The admission checklist is open. X is how many items are missing and Y the total. CLT has 3 items and starts at 3/3. PJ has 1 item and starts at 1/1 | Yellow |
| Em atividade | The admission checklist reached zero. If anything from "Completar cadastro" is missing, the alert icon shows | Green |
| Rescisão pendente X/Y | The termination document was generated. Fields are locked | Yellow |
| Desligado (CLT) or Fim de contrato (PJ) | The termination checklist reached zero. Locked for good | Red for Desligado, gray for Fim de contrato |

**Checklist labels**, in this order:

| Status | Items |
| --- | --- |
| Pendente, CLT | Contrato assinado, Documentos enviados, Exame médico feito |
| Pendente, PJ | Contrato assinado |
| Rescisão pendente, CLT | TRCT, Guia de saque do FGTS, Requerimento do seguro-desemprego, Extrato do FGTS, Exame demissional, Rescisão assinada (provisional labels) |
| Rescisão pendente, PJ | Termo de encerramento enviado, Termo assinado devolvido, Última nota fiscal (provisional labels) |

| Termination type (CLT) | Items | Counter |
| --- | --- | --- |
| Sem justa causa | 6 | 6/6 |
| Fim de contrato de experiência | 6 | 6/6 |
| Acordo entre as partes | 5 (no seguro-desemprego) | 5/5 |
| Pedido de demissão | 4 (no seguro-desemprego, no guia de saque) | 4/4 |
| Com justa causa | 4 (no seguro-desemprego, no guia de saque) | 4/4 |

Checklist items have no required order. A collaborator can be Em atividade before the start date. The checklist is read-only everywhere and has no automation, so a collaborator created in the flow stays Pendente until a way to mark items exists. Have a labor-law professional review the termination checklist before production.

**Completar cadastro:** CLT needs e-mail, time, reporta para, recursos and dados bancários. PJ needs the same, without recursos. When anything is missing on someone Em atividade, the alert icon shows on the home.

### Team

Nome, cor (a light and dark pair from 36 colors, 6 families of 6 shades, with no repeats between teams), ícone, membros, líder, descrição, and a pending flag. A pending team comes from typing a new team name on the collaborator page, or from the seed.

A team counts Pendente, Em atividade and Rescisão pendente members, and a person counts in every team they belong to. Desligado and Fim de contrato do not count. Only Pendente and Em atividade people can be added as members or leader.

### Recurso

| Field | Notes |
| --- | --- |
| tipo | Benefício, Verba or Licença |
| Benefício | categoria (Plano de saúde, Vale transporte, Vale alimentação, Bem-estar, Plano odontológico, Seguro de vida, or Outro with a name) and fornecedor |
| Verba | nome and ícone (Coin when created in the flow, Desktop in the home office seed example) |
| Licença | serviço (Google Workspace, Claude, Figma, Slack, Adobe Creative Cloud, ChatGPT, or Outro with a name) |
| vínculos | Toda a empresa, times or pessoas. Toda a empresa is exclusive. No cargo |
| valores | One value for everyone, or variants with each person in exactly one |
| informações | Link, contato do fornecedor and email do fornecedor, for Benefício and Licença |

A recurso counts unique people. A person reached by two links counts once. Desligado and Fim de contrato stop counting from their exit date.

### Costs

- Custo total of a CLT is custo para empresa plus the recursos.
- Custo total of a PJ is the contract value plus the recursos. Mensal counts the value, Anual counts one twelfth and Valor fixo counts the full value (provisional).
- A recurso reaching a person through more than one link counts once.
- The team cost sums its members. A person in two teams counts in both.

### Seed

- 13 collaborators covering every status, with dates relative to the real current day. Names come from Figma, plus Bruna Teixeira (Em atividade, no team), Lucas Andrade (CLT, Rescisão pendente 3/4), Renata Prado (PJ, Rescisão pendente 2/3) and André Moura (PJ, Fim de contrato).
- Absences: Victoria Cardoso (férias), Gustavo Lima (licença paternidade) and Beatriz Souza (licença médica).
- Design, Marketing and Vendas as pending teams, only when no team with the same name exists.
- 5 recursos, replacing the old benefits seed: Plano de saúde (Alice), Auxílio Home Office (verba, Desktop icon), Slack (licença), Vale alimentação (Caju) and Vale transporte. They mix whole-company, team and individual links, and use variants, so counts and ranges are real.
- Documents for collaborators whose checklist items are done.

## Implementation status

**Done** in branch `feat/gp-build-order`, one commit per part of "Build order":

| Part | What was built |
| --- | --- |
| Before | The collaborator model, `getStatus()`, the seed of collaborators and absences, the storage version key, and the Colaboradores table and grid (branch `feat/gp-status-home`) |
| 1 | Tabs "Recursos", search placeholders, Times cards (4 per row, people count, outlined "Criar time", total of complete teams), the recurso model (`utils/recursos.js`), the Recursos cards (logo or icon, title by type, value or range, unique people) with search by title and supplier and the Tipo de recurso filter, and the seed of the 5 recursos |
| 2 | Novo modal (Colaborador, Time, Recurso) and the CLT flow: Tipo, Nome, Cargo, Informações, the "Informações para contrato" panel, the "Enviar para" sheet and both toasts |
| 3 | The collaborator page (`colaborador/perfil/PerfilColaborador.jsx`): Status do processo, fields in the Figma order, multi-team field that creates pending teams, Dados bancários panel, Recursos, Jornada and Documentos; the alert "Informações faltando" on the table and the grid |
| 4 | The PJ flow (CNPJ, razão social, data de fim, pagamento and valor) and the PJ page |
| 5 | The create-team flow from Figma, with the search-and-pick pattern (`campos/BuscaEEscolha.jsx`), the leader and description side panels and the toast "Time criado com sucesso!" |
| 6 | The create-recurso flow (`addRecurso/`) with the Benefício, Verba and Licença paths, variants, the Atribuir panel and the Informações panel |

The storage version is 5. Each bump rewrites this module's collaborators, recursos and teams with the seed.

**Decisions taken while building, to confirm:**

- Medium is 500 inside the module (`tokens.css`). `@squad/ui` uses 510, and with Inter loaded only at 400, 500, 600 and 700 the browser rendered every Medium text as 600.
- The flows and new panels use module buttons (`campos/Botoes.css`, 14px with 16px padding), because `.text-button` (16px) and the disabled `.pill-button` text (#798282) of `@squad/ui` differ from Figma.
- Field names keep the existing code names where they existed: `name`, `cargos` (list), `salario`, `custoParaEmpresa` and `dataAdmissao` (also for PJ). New fields follow this document.
- Money stays a float in reais, as before. Values show cents ("R$12.000,00"), as in the Recursos tab Figma; the collaborator page Figma shows "R$12.000".
- Tempo de casa keeps the "1a 9m" format; Figma shows "1 dia" and this document does not define the format.
- Phone mask follows Figma ("11 98916 5456"); CPF and CNPJ follow the masks of this document.
- Info-row and section labels use Medium, as Figma draws them, where this document says Regular.
- The Vale transporte seed has the supplier "VEM", because the model needs one.
- "Outro" name step titles: "Qual o nome do benefício?" and "Qual o nome da licença?".
- Category icons on the light blue badge (cards) and on the yellow badge (flow) come from Phosphor when the Figma layer name collides with an existing SVG of another color.

**Temporary bridges:**

| Bridge | Why | Remove in |
| --- | --- | --- |
| Desligar and Reativar are gone from the home row menu | Desligar only toggled a boolean, which contradicts the status model | Offboarding |
| The collaborator page Desligar sets `desligado: true` and locks the fields (no Reativar) | There is no offboarding flow yet | Offboarding |
| Recursos also save `tipo` (the category with the old spelling) and `name` | So the old benefit detail page keeps opening | Recurso page |
| The team page reads the base cost from `custos.js` and counts CLT and PJ by `tipo` | The team page has no Figma yet and read the old contract types | Team page |
| The team page still uses the old centered modals for leader, description and members | Out of this round | Team page |

**Known differences, not done:**

- The table uses 16px padding from `Tabela` in `@squad/ui` while Figma uses 12px with 4px header corners (fix with an opt-in prop), the tab height does not match Figma, and the "Ver mais..." button in the Filtros panel has no style.
- Side panels sit 24px from the edge (this document); Figma shows 20px.
- The supplier step shows every suggestion in two columns; Figma shows the first four.
- The benefit detail page counts people who already left, and shows the Gift icon for Licença (old page logic).
- Saved states without Figma follow this document: the recursos list on the profile, saved bank data, the edit state of the Informações rows, the saved leader and description.

## Figma index

File `ZQZtZy7exqkUi5u33CUvuM` (Gestão de Pessoas 2.0).

| Section | Node |
| --- | --- |
| Home adjustments (Colaboradores) | `10331:4871` |
| Times and Recursos tabs | `10334:5435` |
| Create collaborator CLT, and the CLT collaborator page | `10338:11277` |
| Create collaborator PJ, and the PJ collaborator page | `10338:11286` |
| Create team | `10342:12570` |
| Create recurso | `10343:13283` |

No Figma yet: the team page, the recurso page, offboarding, and new states of the floating search.

## Shared patterns

| Pattern | Spec |
| --- | --- |
| Flow shell | Full screen. Header 64px with the flow title on the left and the X on the right. The X opens "Descartar edições.". Content 532px wide. Footer 80px with the progress bar (current step divided by the steps of the path), Voltar and Continuar. Steps made of cards have no footer, and a click on a card advances. Voltar goes back one step and keeps the data. In every Figma flow the progress bar does not move, which is a mock error |
| Large input | 24px Regular, #798282 when empty and black when filled, with a green check when valid |
| Info rows | 72px rows with a divider. Label in Regular on the left, value or "Adicionar" on the right. Click to edit, Enter saves, unless a panel is specified |
| Side panel | Opens from the right, 20px from the top and 24px from the side, over the overlay, with a slide. Title and X at the top, Cancelar and Salvar (or the specific buttons) at the bottom. The exit is the same animation reversed |
| Search and pick | Search field with a magnifier. Typing opens a list with a User icon, the name and the cargo in gray, with the #f4f5f5 hover. Each choice becomes a row with a checked CheckSquare, the name and the cargo in gray, and a divider |
| Hover | Background #f4f5f5, no shadow. Exceptions: Novo cards (#e3e6e6 and wiggling stickers), filter pills (#e3e6e6) and tabs (black text, no underline) |
| Borders and text | 1px solid #e3e6e6. Secondary text #798282 |
| Overlay | rgba(227,230,230,0.6) with blur |
| Typography | Inter. Page title 24px Medium. Step title 32px with -1px letter-spacing. Buttons 14px Medium. Table header 12px in a 48px bar, rows 64px |
| Buttons | 40px high, 16px on the sides, 24px icon after the text |
| Checkbox | Square, and CheckSquare.svg when checked |
| Status pills | Rounded, 12px Medium. Green rgba(1,180,108,0.1) with #60c60c. Blue rgba(0,145,255,0.1) with #0091ff. Yellow rgba(209,170,66,0.1) with #eac764. Red rgba(255,38,51,0.1) with #ff2633. Gray #e3e6e6 with #798282 |
| People count on cards | User icon (16px) plus the number |
| Absence badge and tooltip | Round blue badge with the icon. Black tooltip above it, with a pointer (`Polygon 1.svg`) |
| Faded row | Text in #b2b9b9 for Desligado and Fim de contrato. The checkbox stays the same Square.svg (#c2c8c8) |
| Empty value | "—", the only em dash allowed |
| Toasts | Bottom right, 24px from the bottom and 20px from the right, radius 8px, padding 12px. They disappear after 5 seconds, stack vertically, slide in from the right and leave with a squash and fly-out in under 400ms. Positive: green #60c60c, circle #c8ff9b with a check, white text, and an X to close. Neutral: #f4f5f5, circle #e3e6e6 with a trash icon, black text |
| Confirmation modal | Centered, 568px wide, a round X above the card, an icon badge of 40x40 in #fbedd0, title 32px, text 16px in #798282, and the buttons Cancelar and the confirm one (black) |
| Floating bar | 24px from the bottom, 64px high |

## 1. Home

The header has the back button, "Gestão de Pessoas", the tutorial button (GraduationCap) and "Novo" (black pill, plus after the text). The tabs are Colaboradores, Times and Recursos.

### Colaboradores

**Figma:** section `10331:4871`. Frames: table `10331:3109`, row hover `10331:3312`, selection `10331:3515`, hover on Pendente 3/3 CLT `10331:3724`, Pendente 2/3 `10331:4355`, Pendente 1/1 PJ `10331:3940`, vacation tooltip `10331:4148`, grid `10331:4571`. The alert comes from `10338:9581` (Warning `10338:9635`, tooltip `10338:9667`).

| Element | Spec |
| --- | --- |
| Toolbar | 40px: "Total: X colaboradores", Filtros, and the grid and table toggle |
| Columns | Checkbox, Nome, Time, Cargo, Tipo ("CLT" or "PJ" as text), Status, icon slot and the 3-dot menu |
| Time column | The team names. With several teams, the first team plus "+N" (No Figma for "+N"; today the names are separated by commas) |
| Status pill hover | Pendente and Rescisão pendente get a border in their own color and a read-only popover below with the checklist: CircleDashed for open items and a green CheckCircle for done ones. The popover stays open while the mouse moves into it. Other statuses have no popover |
| Icon slot | Absence badges: Island (férias), Baby (licença maternidade or paternidade) and Stethoscope (licença médica), with the tooltip "{Ausência} até dd/mm", shown only while the absence is active. Alert: a gray Warning with no badge and the tooltip "Informações faltando". Clicking it opens the collaborator page. The offboarding icon also goes here (No Figma) |
| Desligado and Fim de contrato | Faded row, the pill keeps its color |
| Empty values | "—" |
| Row and selection | Hover and selected rows use #f4f5f5. While rows are selected, the floating bar shows "{N} selecionados", "Add em time" (FolderSimplePlus), a red trash and close |
| Row menu | Ver colaborador and Excluir. Desligar returns with offboarding and then opens "Desligar {Nome}?". Reativar does not exist |
| Grid | 4 cards per row, no photo. Top: checkbox on the left, and the absence or alert icon and the 3-dot menu on the right. Middle: name, cargo and time ("—" when empty). Bottom: the Tipo as plain text on the left and the status pill on the right |
| Order | With no sort active, Pendente and Rescisão pendente rows come first |
| Column filters | Nome sorts A to Z in 3 states, and its icon becomes an X while active. Time, Cargo (cargos in use), Tipo (CLT, PJ) and Status (the 5 statuses) are multi-select dropdowns that update live, with the icon becoming an X while active. Filters combine with AND across columns and OR within a column. Pendente matches any counter, and so does Rescisão pendente. Time matches a person when any of their teams is selected |
| Filtros panel | Time, Cargo, Período (by the "Ativo desde" date), Tipo and Status, in sync with the column filters |
| Floating search | "Buscar uma pessoa...", matching the name only |

**Mock errors:** "Vendedir" as a cargo, "Beatriz Souza" in the Time column, Gustavo Lima as CLT in the table and PJ in the grid, cargo names that change between table and grid, and "Total: 6 colaboradores" above 9 rows.

### Times

**Figma:** section `10334:5435`. Frames: default `10334:5436` (pending card `10334:5464`, "Criar time" `10334:5473`, complete card `10334:5480`, count `10334:5476`), card hover `10334:5643` (`10334:5680`).

| Element | Spec |
| --- | --- |
| Toolbar | "Total: X times", counting only complete teams, and Filtros (Status: Pendente, Completo; Número de pessoas with minimum and maximum). No view toggle |
| Cards | 4 per row, 180px high |
| Complete card | Two stickers (UsersFour and the team icon, in the team color), the arrow at the top right, the name in 16px Semibold and the people count. No 3-dot menu. Hover #f4f5f5. A click opens the team page |
| Pending card | Dashed border, gray stickers and an outlined "Criar time" button in place of the arrow, which opens the create-team flow at step 2 with the name and members set. The card itself does not open a page. Pending cards come first |
| Floating search | "Buscar um time..." |

### Recursos

**Figma:** section `10334:5435`, frame `10334:5539` (cards `10334:5574`, `10334:5588`, `10334:5602`, `10334:5615`, `10334:5629`). The tab after creating a recurso: `10343:13530` and `10343:13592`.

| Element | Spec |
| --- | --- |
| Toolbar | "Total: X recursos" and Filtros (Tipo de recurso: Benefício, Verba, Licença; Número de pessoas) |
| Cards | 4 per row, 180px high. Icon or logo (56px) at the top left, arrow at the top right, title in 16px Semibold, and a bottom line with the value on the left and the people count on the right. No 3-dot menu. A click opens the recurso page |
| Title | Benefício: the category, or the typed name for Outro. Verba: its name. Licença: the service |
| Value | One value ("R$50,00"), or with variants the range from the lowest to the highest ("R$400,00-500,00") |
| Icon | The supplier or service logo when the asset exists (Alice, Amil, SulAmérica, Bradesco Saúde, Caju and the 6 licença services). Without a logo, on a light blue badge: the category icon for Benefício (Stethoscope, Van, ForkKnife, Barbell, Tooth, Shield, and Gift for Outro, provisional), Key for Licença and the verba's own icon for Verba |
| Floating search | "Buscar um recurso...", matching the title and the supplier, so "Alice" finds the Plano de saúde |

**Mock errors:** "Total: 5 beneficios", the placeholder "Buscar um time...", "Plano de Saude" and "Auxilio" without accents, and people counts that do not come from real links.

### Floating search and Pergunte ao Pipo

No new Figma. Fixed at the bottom, 24px from the edge, centered in the content area, 64px high and 468px wide. The default state has the magnifier, the placeholder of the tab and the "Pergunte ao Pipo" pill. On focus the pill becomes an X, the list filters live, and the X clears the text. Clicking the pill turns the bar cream, with the Pipo avatar, "Pergunte ao Pipo...", a microphone that becomes a paper plane while typing, and an X. The Pipo state is interface only: typing filters nothing and sending does nothing. The bar sits behind the overlay of modals and panels.

## 2. Novo modal

**Figma:** `10338:10223`. Title "O que vamos criar hoje?" with "criar hoje?" in #e9a716. Three 160x160 cards with stickers: Colaborador, Time and Recurso. Hover #e3e6e6 with wiggling stickers. An X above the modal or a click on the overlay closes it. Colaborador opens the create-collaborator flow, Time the create-team flow and Recurso the create-recurso flow.

## 3. Create collaborator, CLT

**Figma:** section `10338:11277`. Frames: type `10338:10471` (FileText `10338:10478`), name empty, focused and filled `10338:10498`, `10338:10510` and `10338:10522`, cargo empty, typing and chosen `10338:10536`, `10338:10551` (list `10338:10566`) and `10338:10585`, Informações `10338:10601` (rows `10338:10668`, header `10338:10715`, footer `10338:10662`), contract panel `10338:10660` and `10338:10763` (panel `10338:10720`), Enviar para with Telefone and Email `10338:10866` and `10338:10987` (sheet `10338:10970`), table and toast `10338:8993`. Reference images: the flow `10338:10469` and the status path `10338:10470`.

Header: "Novo colaborador". 4 steps for the progress bar: Tipo, Nome, Cargo, Informações.

| Step | Spec |
| --- | --- |
| 1. Tipo | "Qual o tipo de contratação?". Cards CLT and PJ, each with FileText on a yellow badge and an arrow. No footer |
| 2. Nome | "Qual o nome do novo colaborador?". Large input "Nome do colaborador" with focus state and green check. Continuar is disabled until there is a name |
| 3. Cargo | "Muito bem, hora de definir o cargo de {Nome}." with the name in #e9a716. Large input "Adicionar cargo". Typing opens a list of matching cargos in use, each with a briefcase icon, and a last item 'Add "{text}"' with a plus that keeps the typed text. The chosen cargo shows the green check. Footer: "Não tenho ainda, pular" skips, and Continuar is always active |
| 4. Informações | "Finalize com algumas informações adicionais." Rows in this order: CPF ("Adicionar", mask 000.000.000-00, only the 11 digits are checked), Contato ("Adicionar", Telefone or Email with the same switch as the Enviar para sheet), Data de nascimento ("DD/MM/AAAA" with a mask), Data de admissão (a "Próxima segunda" pill and a calendar button, then the date in DD/MM/AAAA), Salário bruto and Custo para empresa (currency, "0,00" when empty). No Figma for the edit state: use the info-row pattern. Continuar is always active and opens the contract panel |
| Contract panel | "Informações para contrato", a side panel over the flow. Rows: Nome, Documento (the CPF followed by "CPF"), Data de nascimento, Cargo, Salário bruto, Data de admissão and Enviar para, with "—" when empty. Enviar para comes from Contato, and its pencil opens the "Enviar para" sheet: a Telefone and Email switch, the field with a green check when valid, Salvar, and an X that closes without saving. Footer: "Salvar sem contrato" (text button) and "Gerar contrato" (black), which is active only with CPF, data de admissão, salário bruto and Enviar para. The X of the panel goes back to Informações and keeps the data |
| Result | "Gerar contrato" waits 1 to 2 seconds (with the button's loading state if it exists, otherwise disabled), closes the flow and shows the toast "Contrato criado e enviado". "Salvar sem contrato" shows "Colaborador criado com sucesso". Both enter as Pendente 3/3 with the admission checklist open |

**Mock errors:** "Novo Colaborador", "Data de Nascimento", "Data de Admissão" and "Informações para Contrato" with capitals, the cargo title saying "cargo e time", cargo names and salaries that change between frames, and "Total: 6 colaboradores" above one row.

## 4. Create collaborator, PJ

**Figma:** section `10338:11286`. Frames: type `10338:11537`, name `10338:11564`, cargo `10338:11578`, Informações `10338:11594` (rows `10338:11602`), contract panel `10338:11669` (panel `10338:11745`), table and toast `10338:11794`. Reference image: `10338:11536`.

Steps 1 to 3, the contract panel, the Enviar para sheet and the result work as in CLT. The differences:

| Step | Spec |
| --- | --- |
| 4. Informações | Rows in this order: CNPJ ("Adicionar", mask 00.000.000/0000-00, only the 14 digits are checked), Razão social ("Adicionar"), Contato ("Adicionar"), Data de admissão (as in CLT), Data de fim do contrato (an unselected "Não especificar" pill and a calendar button; picking a date replaces the pill, reopening the calendar lets the user change it or check "Não especificar data de fim", and days before the admission date are disabled), Pagamento (pills Mensal, selected in black by default, Anual and Valor fixo) and Valor do contrato (currency, suffix "/mês" for Mensal, "/ano" for Anual and none for Valor fixo) |
| Contract panel | Rows: Nome, Documento (the CNPJ followed by "CNPJ"), Cargo, Data de admissão, Data de fim do contrato ("Sem especificar" when there is none), Pagamento, Valor (with its suffix) and Enviar para. No razão social. "Gerar contrato" is active only with documento, data de admissão, valor and Enviar para |
| Result | Enters as Pendente 1/1, with "Contrato assinado" open |

**Mock errors:** the CNPJ "1234 4567 8981 0001 50", "Razão Social" with a capital, and Gustavo Lima as a new PJ (he is CLT in the seed).

## 5. Collaborator page

The collaborator, team and recurso pages share one shell: a side panel with a slide, full screen through the expand icon, and full screen when opened by link.

**Figma, CLT:** Pendente with nothing done `10338:9083` (panel `10338:9174`), Pendente with documents `10338:9323` (panel `10338:9414`), Em atividade with information missing `10338:9671`, Dados bancários panel `10338:9924` (panel `10338:10177`).

**Figma, PJ:** Pendente 1/1 `10338:11884` (panel `10338:11975`), Em atividade with the contract `10338:12111` (panel `10338:12202`).

| Element | Spec |
| --- | --- |
| Header | X, "Colaborador", Excluir (red trash), Desligar (power) and Expandir |
| Status do processo | Gray card at the top while Pendente, with the counter on the right and the checklist read-only. Rescisão pendente uses the same card with the termination items. The card disappears in Em atividade |
| Profile | Generic avatar, the name and the Tipo in gray ("CLT" or "PJ"), then the static Pipo bar "Peça ao Pipo para Resumir perfil, Redigir mensagem ou Comparar cargo" |
| Fields, CLT | Contato, Documento (the CPF followed by "CPF"), Cargo, Email, Time, Reporta para, Ativo desde, Salário bruto and Custo para empresa, each with its icon. Data de nascimento is stored but not shown |
| Fields, PJ | Contato, Documento (the CNPJ followed by "CNPJ"), Cargo, Email, Time, Reporta para, Ativo desde and Salário, which shows the contract value with its suffix. Razão social, data de fim and pagamento are stored but not shown |
| Empty fields | "Adicionar" and a plus on the right |
| Editing | Gray hover and a click to edit. Email is text and Enter saves. Cargo is free text with suggestions. Time accepts several teams as pills with a search, and typing a team that does not exist creates a pending team. Reporta para searches among Pendente and Em atividade people. Contato uses Telefone or Email. Dates use the calendar. Salário bruto, Custo para empresa and Salário are hidden by default, each with its own eye |
| Notes | "Adicionar nota" in the row. Enter saves with the date |
| Métricas | Custo total (with an eye) and Tempo de casa ("—" before the admission date) |
| Recursos | The recursos the person receives. Empty: "Nenhum recurso adicionado" and "Adicionar". Adding from the profile has no Figma, so it has no action yet |
| Jornada de trabalho | "Nenhuma escala conectada" and "Conectar". Interface only until Opy exists |
| Dados bancários | Empty: "Nenhum dado adicionado" and "Adicionar", which opens a second side panel with Banco ("Nome ou código do banco"), Agência, a Corrente or Poupança switch, Número da conta, Titular da conta and Chave PIX, plus Cancelar and Salvar. Salvar needs a full account or a chave PIX. No Figma for the saved state: the section shows the data as rows, and a click reopens the panel |
| Documentos | Files tied to completed checklist items: "Contrato_CLT" or "Contrato_PJ" for Contrato assinado, the sent document (for example "CNH.png") for Documentos enviados, and "Exames_Medico" for Exame médico feito, each with a file-type badge and "Download". Empty: "Nenhum documento adicionado" and "Adicionar". Download and Adicionar are interface only |
| Locking | Rescisão pendente, Desligado and Fim de contrato lock every field |

**Mock errors:** "Salário Bruno", "Nenhum escala conectada", "Nenhum dado adicionado" in Documentos, "Pendente 3/3" with two items done, "Nome do Titular" and "Nome ou Código do banco" with capitals, and dates, cargos and salaries that change between frames.

## 6. Create team

**Figma:** section `10342:12570`. Frames: name empty and filled `10342:12820` and `10342:12832`, color and icon `10342:12846` (rows `10342:12852`), members empty `10342:12876`, members while typing `10342:12895` (list `10342:12909`), members chosen `10342:12930` (list `10342:12944`), Informações adicionais `10342:12977` (rows `10342:12985`), leader panel `10342:13004` (panel `10342:13032`), description panel `10342:13071` (panel `10342:13099`), Times tab with the toast `10342:13110` (toast `10342:13162`).

Header: "Novo time". 4 steps. The flow opens blank from Novo, or at step 2 from a pending card, with the name and members set.

| Step | Spec |
| --- | --- |
| 1. Nome | "Qual será o nome do time?". Large input "Nome do time" with the green check. Continuar is disabled until there is a name. Voltar on this step closes the flow with no modal |
| 2. Cor e ícone | "Muito bem, hora de definir a cor e o ícone de {Nome}." with the name and the final period in #e9a716. Two 72px rows with a divider: a gray Eyedropper and "Cor" in Regular, with the light and dark circles on the right, and a gray Smiley and "Ícone" in Regular, with a gray pill holding the icon in the team color and a caret. Color and icon come prefilled (the first color not used by another team), and the pickers keep working as today. Continuar is always active |
| 3. Quem faz parte | "Quem faz parte do time {icon} {Nome}?": the team icon on a small badge in the light team color, and the name and the question mark in the team color. Search field "Buscar nome..." with the search-and-pick pattern, listing only Pendente and Em atividade people who are not chosen yet. No suggestion grid. Unchecking removes the person. Optional, so Continuar is always active |
| 4. Informações adicionais | "Finalize com algumas informações adicionais." Rows "Líder do time" and "Descrição" in Regular, each with "Adicionar". The footer button is "Criar time" |
| Leader panel | Side panel "Adicionar líder" with a gray search field "Pesquisar" and rows with a checkbox, the name and the cargo in gray. The list starts with the members of step 3, and the search finds any Pendente or Em atividade person. Only one can be checked. Cancelar and Salvar. A leader who is not a member becomes one |
| Description panel | Side panel "Adicionar descrição" with a text area "Descrição do time...", Cancelar and Salvar |
| Saved leader or description | No Figma: the row shows the leader's name or the start of the description in place of "Adicionar", and a click reopens the panel |
| Result | Saves name, color, icon, members, leader and description, adds the team to each member's teams without removing the others, and turns a pending team complete. Back to the Times tab with the toast "Time criado com sucesso!" |

**Mock errors:** the header "Novo Tome" and, from step 3 on, "Novo Colaborador", the step 2 title without "e o", the result card with "3 pessoas" and a 3-dot menu (the Times tab spec wins), "Total: 3 times" above 1 card, and names and cargos repeated or changed between frames.

## 7. Create recurso

**Figma:** section `10343:13283`, one row per path.

- Benefício: type `10343:14389`, category `10343:14465`, supplier `10343:14659`, beneficiaries `10343:13670` and `10343:13814`, value `10343:13839`, variants `10343:13858`, Atribuir panel `10343:13999` and `10343:14152`, variants assigned `10343:14305` and `10343:14347`, Informações `10343:14709`, Informações panel `10343:14743`.
- Verba: type `10343:14427`, name `10343:14541` and `10343:14650`, beneficiaries while typing `10343:13720`, beneficiaries chosen `10343:13761`, value `10343:13898`, variants `10343:13917` and `10343:13957`, Recursos tab after creating `10343:13530`.
- Licença: type `10343:14548`, service `10343:14586`, beneficiaries `10343:13695`, value `10343:14802` and `10343:14821`, Informações `10343:14840`, Recursos tab after creating `10343:13592`.

Header: "Novo recurso". The type, category and service steps have no footer.

| Path | Steps |
| --- | --- |
| Benefício (6 steps) | 1. Tipo. 2. Categoria. 3. Fornecedor. 4. Beneficiários. 5. Valor. 6. Informações, with the button "Criar benefício" |
| Verba (4 steps) | 1. Tipo. 2. Nome. 3. Beneficiários. 4. Valor, with the button "Criar verba". No Informações step |
| Licença (5 steps) | 1. Tipo. 2. Serviço. 3. Beneficiários. 4. Valor. 5. Informações, with the button "Criar licença" |

| Step | Spec |
| --- | --- |
| Tipo | "Qual o tipo de recurso irá criar agora?". Cards with an icon on a yellow badge and an arrow: Benefício (Gift), Verba (Coin) and Licença (Key) |
| Categoria | "Qual o benefício que irá criar agora?" with "benefício" in #e9a716. 6 cards with an icon on a yellow badge and an arrow: Plano de saúde (Stethoscope), Vale transporte (Van), Vale alimentação (ForkKnife), Bem-estar (Barbell), Plano odontológico (Tooth) and Seguro de vida (Shield), plus a full-width "Outro" row |
| Fornecedor | "Qual o fornecedor do {categoria}?" with the category in #e9a716. Search field "Buscar plano..." and a 2x2 grid of suggestions, each with a checkbox, the logo and the name (the suggestions are listed below). Single choice, required |
| Nome (Verba) | "Para que será essa verba?" with "verba?" in #e9a716. Large input "Nome da verba" with the green check. Continuar is disabled until there is a name |
| Serviço | "Qual a licença que irá criar agora?" with "licença" in #e9a716. 6 cards with the service logo: Google Workspace, Claude, Figma, Slack, Adobe Creative Cloud and ChatGPT, plus a full-width "Outro" row |
| Beneficiários | Title: "Quem vai receber esse benefício?", "Quem vai receber o {nome}?" with the verba name in #e9a716, or "Quem vai receber a licença do {serviço}?". Search field "Buscar nome ou time..." and, below it, the row "Toda a empresa" with a checkbox and the count in gray. No team suggestions. Search and pick for people. Toda a empresa is exclusive. Only Pendente and Em atividade people. Optional |
| Valor | "Qual o valor do benefício (por pessoa)?", "da verba (por pessoa)?" or "da licença (por pessoa)?". Large input with a gray "R$" prefix, and the card "Adicionar variante de valor" with a plus. With variants, each row has the value, the count in blue, "Atribuir" with a plus and a trash icon, and below them the counter "x/y atribuídos". When everyone is assigned, "Atribuir" becomes "Alterar". Continuar unlocks only when everyone is assigned |
| Atribuir panel | Side panel "Atribuir" with the beneficiaries as rows with a checkbox and the name. Anyone in another variant shows a green check in place of the checkbox and cannot be picked. Cancelar and Salvar |
| Informações | "Finalize com algumas informações adicionais." Rows "Link do benefício" (or "Link da licença"), "Contato do fornecedor" and "Email do fornecedor", each with "Adicionar". Any "Adicionar" opens a side panel "Adicionar" with the three fields, Cancelar and Salvar |
| Result | Back to the Recursos tab with the new card |

**Assumptions, with no Figma:**

- The Licença Informações screen in Figma is a copy of the Benefício one. It uses the same layout and panel, with "Link da licença" and the button "Criar licença".
- "Outro" in the category or service step asks only for the recurso name, with the layout of the verba name step.
- The supplier search placeholder is "Buscar fornecedor..." outside Plano de saúde. Typing a supplier that is not suggested offers 'Add "{text}"', as in the cargo step. Suppliers without a logo asset use the category icon.
- A verba created in the flow gets the Coin icon.
- Teams in the beneficiaries search use the team icon, the name and the count.
- The toast is "Recurso criado com sucesso", because Figma shows none.

**Supplier suggestions.** Figma has logos for Alice, Amil, SulAmérica and Bradesco Saúde, and the Recursos tab has Caju.

| Category | Suggestions |
| --- | --- |
| Plano de saúde | Alice, Amil, SulAmérica, Bradesco Saúde, Hapvida NotreDame Intermédica, Unimed, Porto Seguro Saúde |
| Vale transporte | Bilhete Único, Uber, 99, VEM |
| Vale alimentação | Caju, VR, Ticket, Alelo, Swile, Pluxee |
| Bem-estar | Wellhub, TotalPass, SmartFit |
| Plano odontológico | Odontoprev, Amil Dental, SulAmérica Odonto, Bradesco Dental, Uniodonto |
| Seguro de vida | Porto Seguro Vida, Bradesco Vida e Previdência, MetLife, Prudential, SulAmérica Vida |

**Mock errors:** the card "Licenças", "Qual o licença", "Contado do fornecedor", "atribuidos", "Google workspace" and "Chat GPT", the Licença Informações screen copied from Benefício, and the Continuar drawn active before everyone is assigned.

## 8. Team page

**No Figma.** Header: Close, Delete and Expand. Profile: the icon in the team color and the name. Only complete teams open.

- Info: Líder, Cor, Ícone and Descrição (2 lines and "ver mais..."), plus "Adicionar nota". Cor and Ícone open the pickers.
- Metrics: Total de membros, Tempo médio de casa, Custo total do time (with an eye), Cargos representados and Tipo de contratação (a bar with CLT and PJ).
- Members: "Add membro" searches Pendente and Em atividade people not in the team. Rows have an avatar in the team color, the name, the cargo and an X with a confirmation. The list includes Pendente, Em atividade and Rescisão pendente. Adding adds this team to the person's teams, and removing takes out only this team.
- Recursos: the aggregated list with the value range.
- Delete: a confirmation, and the members lose only this team.

## 9. Recurso page

**No Figma.** Route `#/recurso/:id`.

- Profile: the logo or icon, the name and the type in gray. Benefício: the supplier and the category. Verba: the name and "Verba". Licença: the service and "Licença".
- Info, read-only, with "—" when empty: Fornecedor, Link, Contato and E-mail for Benefício, and Link, Contato and E-mail for Licença. Link and Contato have a copy icon. Verba has no info fields.
- Metrics: Total de beneficiários, Custo total (with an eye), the list of Valores with a count, and Por time (a bar). The value is "por pessoa".
- Links: "Add time" and "Add membro", each with a value, and rows with the icon or avatar, the name, the value and an X. The whole company has its own row when it is a link.

## 10. Offboarding

**No Figma.** A 3-step flow started from the "Desligar {Nome}?" modal, from the profile icon or the row menu.

| Step | CLT | PJ |
| --- | --- | --- |
| 1. Tipo de rescisão | Sem justa causa, Com justa causa, Pedido de demissão, Acordo entre as partes, Fim de contrato de experiência | Fim de contrato, Rescisão antecipada pela empresa, Rescisão antecipada pelo prestador, Acordo entre as partes |
| 2. Informações | Data do desligamento (required), Aviso prévio (Trabalhado, Indenizado or Não se aplica, hidden for Com justa causa) and Motivo (optional) | Data do desligamento (required) and Motivo (optional) |
| 3. Termo | "Gerar termo de rescisão", confirm the contact, "Gerar termo e enviar" | "Gerar termo de encerramento", same mechanics |

Starting copy: "Qual o tipo de rescisão?", "Informações do desligamento de {Nome}" and "Confirme o contato para envio do termo". In step 2, Continuar is disabled until the date is set. In step 3, the contact comes prefilled and editable, the button waits 1 to 2 seconds, the toast "Desligamento iniciado com sucesso" appears and the flow returns to the table. The collaborator becomes Rescisão pendente with the offboarding icon and locked fields. Until the exit date, the person still counts in teams and recursos.

## 11. Confirmations and toasts

| Modal | Text | Confirm |
| --- | --- | --- |
| Excluir colaborador | "Tem certeza que quer excluir o colaborador {Nome}? Essa ação não pode ser desfeita. Se preferir, você pode desligá-lo e mantê-lo na sua lista de colaboradores." | Excluir |
| Excluir vários | "Excluir {N} colaboradores?" | Excluir |
| Excluir time | "Tem certeza que quer excluir o time {Nome}? Essa ação não pode ser desfeita. Os colaboradores deixam de fazer parte deste time e continuam nos outros, se houver." | Excluir |
| Excluir recurso | "Tem certeza que quer excluir o recurso {Nome}? Essa ação não pode ser desfeita." | Excluir |
| Desligar | "Tem certeza que quer desligar o colaborador {Nome}? Você vai escolher o tipo de rescisão e gerar o termo. Depois de gerado, os campos ficam bloqueados." | Desligar |
| Descartar edições | Title "Descartar edições." and "Tem certeza que deseja descartar? Ao sair, todo o progresso será perdido. Nenhuma informação será salva." Opens from the X of every flow, never from Voltar | Descartar |
| Remover membro do time | A small confirmation. It takes out only that team | Remover |

| Toast | Style |
| --- | --- |
| "Contrato criado e enviado" | Positive, with an X (Figma `10338:8993`) |
| "Colaborador criado com sucesso" | Positive |
| "Time criado com sucesso!" | Positive, with an X (Figma `10342:13162`) |
| "Recurso criado com sucesso" | Positive (assumption) |
| "Desligamento iniciado com sucesso" | Positive |
| "{N} colaboradores adicionados ao time {Time}" | Positive |
| "Colaborador excluído com sucesso", "Time excluído com sucesso", "Recurso excluído com sucesso" | Neutral |

Inline edits on the profile, saved filters and removing a member show no toast.

## Build order

| Part | Scope | Sections |
| --- | --- | --- |
| 1 | Times and Recursos tabs: tab name "Recursos", search placeholders, Times cards, the recurso model, the Recursos cards and the recursos seed (bump the storage version) | 1 (Times, Recursos), Data model |
| 2 | Novo modal and create collaborator CLT, with the result on the table | 2, 3 |
| 3 | Collaborator page for CLT and the alert icon on the home | 1 (Colaboradores, icon slot), 5 |
| 4 | Create collaborator PJ and the PJ page | 4, 5 |
| 5 | Create team | 6 |
| 6 | Create recurso | 7 |

Not in this round, because there is no Figma: the team page, the recurso page, offboarding and the floating search. Keep the bridges they need working.

## Open points

- Should the Time filter have a "Sem time" option?
- The checklist has no screen to mark items, so new collaborators stay Pendente.
- PJ: Custo total for Anual and Valor fixo is provisional, and the page does not show the end date of a temporary PJ.
- Create recurso: confirm the assumptions of section 7.
- Termination checklist labels are provisional and need a labor-law review.
- Floating search: should switching tabs clear the text, and how does the bar behave in the detail views?
- Recurso page: should "Add time" and "Add membro" offer only Pendente and Em atividade?
- Should Desligar hide when the status is Rescisão pendente, Desligado or Fim de contrato?
- No Figma yet: adding a recurso from the profile, the saved state of Dados bancários, the edit state of the Informações rows, the loading state of "Gerar contrato", and logos for the other suppliers. The icon of Benefício "Outro" (Gift) is provisional.
