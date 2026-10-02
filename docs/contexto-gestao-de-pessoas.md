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
| Em desligamento X/Y | The offboarding flow was finished (with or without the term). Fields are locked. In the table, the grid and the checklist card it shows as "Pendente X/Y", with a red Power badge in the icon slot. The page header shows the red pill "Em desligamento" | Yellow pill, red badge and red header pill |
| Desligado (CLT) or Fim de contrato (PJ) | The termination checklist reached zero. Locked for good | Red for Desligado, gray for Fim de contrato |

**Checklist labels**, in this order:

| Status | Items |
| --- | --- |
| Pendente, CLT | Contrato assinado, Documentos enviados, Exame médico feito |
| Pendente, PJ | Contrato assinado |
| Em desligamento, CLT | Assinar termo de rescisão, Enviar guia para saque do FGTS, Enviar extrato atualizado do FGTS, Exame demissional realizado, Termo de rescisão assinado e devolvido |
| Em desligamento, PJ | Assinar termo de encerramento, Pagamentos pendentes, Termo assinado e devolvido |

The Em desligamento labels come from Figma (`10355:3986` for CLT, `10355:7067` for PJ). Figma shows the CLT list for Sem justa causa and the PJ list for Antecipada pela empresa.

| Termination type (CLT) | Items | Counter |
| --- | --- | --- |
| Sem justa causa | 5 | 5/5 |
| Fim de contrato de experiência | 5 (assumption) | 5/5 |
| Acordo entre partes | 5 (assumption) | 5/5 |
| Pedido de demissão | 4, without the FGTS withdrawal guide (assumption) | 4/4 |
| Com justa causa | 4, without the FGTS withdrawal guide (assumption) | 4/4 |

Every PJ termination type uses the same 3 items (assumption).

Checklist items have no required order. A collaborator can be Em atividade before the start date. The admission checklist is read-only and has no automation, so a collaborator created in the flow stays Pendente. The termination checklist can be marked on the collaborator page with "Marcar como feito" (section 5). Have a labor-law professional review the termination checklist before production.

**Completar cadastro:** CLT needs e-mail, time, reporta para, recursos and dados bancários. PJ needs the same, without recursos. When anything is missing on someone Em atividade, the alert icon shows on the home.

### Team

Nome, cor (a light and dark pair from 36 colors, 6 families of 6 shades, with no repeats between teams), ícone, membros, líder, descrição, and a pending flag. A pending team comes from typing a new team name on the collaborator page, or from the seed.

A team counts Pendente, Em atividade and Em desligamento members, and a person counts in every team they belong to. Desligado and Fim de contrato do not count. Only Pendente and Em atividade people can be added as members or leader.

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

- 13 collaborators covering every status, with dates relative to the real current day. Names come from Figma, plus Bruna Teixeira (Em atividade, no team), Lucas Andrade (CLT, Em desligamento 3/4), Renata Prado (PJ, Em desligamento 2/3) and André Moura (PJ, Fim de contrato).
- Absences: Victoria Cardoso (férias), Gustavo Lima (licença paternidade) and Beatriz Souza (licença médica).
- Design, Marketing and Vendas as pending teams, only when no team with the same name exists.
- 5 recursos, replacing the old benefits seed: Plano de saúde (Alice), Auxílio Home Office (verba, Desktop icon), Slack (licença), Vale alimentação (Caju) and Vale transporte. They mix whole-company, team and individual links, and use variants, so counts and ranges are real.
- Documents for collaborators whose checklist items are done.

## Implementation status

**Done** in branch `feat/gp-build-order`, parts 1 to 8 of the build order, each checked in the browser at 1440 against Figma. Data version 7.

- Parts 1 to 6: Times and Recursos tabs, Novo modal, create collaborator CLT and PJ, the collaborator page and the home alert, create team, create recurso.
- Part 7: the "Desligar {Nome}?" modal, the offboarding flow for CLT and PJ, the Em desligamento state in the table, the grid and the page, "Marcar como feito" on every open termination item, Desligado and Fim de contrato at zero, and the filled Recursos, Jornada de trabalho and Dados bancários on the page.
- Part 8: the collaborator, team and recurso pages in panel and full screen, all built from shared components in `components/detalhe/` (shell and header, profile row, fields, section title, metric cards, list rows, notes timeline). Opening by link lands in full screen; expand and Back-to-Modal switch modes. The recurso page moved to the route `#/recurso/:id`. The seed has notes for Bruno Vasconcelos, Gabriel Luz, the Design team and the Alice plan.

**Bridges:** none left. The old benefício page and the legacy recurso fields `tipo` and `name` (`camposLegados`) were removed with part 8, and the team page no longer reads its own cost formula.

**Decisions where the spec is silent:**

- Seed: Design is now a complete team (green, Palette, leader Bruno Vasconcelos, description and notes), because only complete teams open the team page. Marketing and Vendas stay pending.
- Full-screen header: 32px side padding, as in Figma `10355:2086` (the shared pattern says 40px).
- Recurso profile: the category in 20px Medium #798282, as in Figma `10355:2887` (section 9 says Regular).
- Recurso full screen: Total de beneficiários as a row card above Custo total, as Figma `10355:2514` stacks them; side by side only in the panel.
- Tempo de casa: "N meses" under a year ("1 mês" for one), "Xa Ym" from a year on.
- Por time on the recurso page: each person counts in the team linked to the recurso, else their first team; people without a team form a gray "Sem time" segment, and pending teams are gray.
- "Add time" offers complete teams that are not linked yet. With Toda a empresa linked, "Add time" and "Add membro" are hidden, since it is exclusive. The Toda a empresa row uses a gray badge with Buildings.
- Removing a team or a person from a recurso has no confirmation (only team members have one, per section 8). Copy and PhoneOutgoing show only when there is a value; PhoneOutgoing is a `tel:` link.
- Panels and modals opened from a detail page render above both modes.
- Earlier decisions (part 7): locked pages show "—" on empty fields and hide empty-state actions; the term panel needs a valid Enviar para; the Chave PIX type is inferred from its format.

**Known differences, not done:** the table uses 16px padding from `Tabela` in `@squad/ui` while Figma uses 12px with 4px header corners, the tab height and the home header spacing do not match Figma, the "Ver mais..." button in the Filtros panel has no style, the side-panel veil has no blur, the progress bar fills to the real step (Figma never moves it, a mock error), and money is still stored as reais with decimals, not integer cents.

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
| Offboarding CLT | `10355:3451` |
| Offboarding PJ | `10355:5041` |
| Collaborator, team and recurso pages (panel and full screen) | `10355:1553` |

No Figma yet: new states of the floating search, and the edit states of the detail pages.

## Shared patterns

| Pattern | Spec |
| --- | --- |
| Flow shell | Full screen, with the background linear-gradient(90deg, rgba(255,255,255,0.85), rgba(255,255,255,0.85)) over linear-gradient(179.3deg, #eef6fb, #ffffff). Header 64px with a 1px #e3e6e6 bottom border, 40px side padding, the flow title (16px Medium, letter-spacing -0.26px) on the left and the 40px X on the right. The X opens "Descartar edições.". Content 532px wide. Footer 80px with the progress bar (current step divided by the steps of the path), Voltar and Continuar. Steps made of cards have no footer, and a click on a card advances. Voltar goes back one step and keeps the data. In every Figma flow the progress bar does not move, which is a mock error |
| Large input | 24px Regular, #798282 when empty and black when filled, with a green check when valid |
| Info rows | 530px wide, 72px rows with a 1px #e3e6e6 bottom divider (none on the last row). Label 14px Medium black on the left, value or "Adicionar" 14px Medium black on the right. Pills are 40px high, 16px side padding, fully rounded, 8px apart: unselected with a 1px #e3e6e6 border, selected black with white text. The calendar button is the same pill with a 24px CalendarPlus. Click to edit, Enter saves, unless a panel is specified |
| Type cards | Steps where a card choice advances. Cards 180px high in rows of 3 with 12px gaps (a last row keeps the same card width, aligned left), 24px padding, radius 16px, 1px #e3e6e6 border, white, #f4f5f5 on hover. Top: a 56px badge (radius 10px, #fbedd0) with a 24px icon, and the 24px ArrowUpRight. Bottom: the label in 16px Medium, letter-spacing -0.26px, line-height 1.2 |
| Summary panel | Contract and term panels: 428px wide side panel, white, 1px #e3e6e6 border, radius 8px, 24px padding, 40px between header and body. Title 16px Medium, letter-spacing -0.26px. Rows 56px, #f4f5f5, radius 8px, 16px padding, 16px apart, label 14px Medium #798282 on the left and value 14px Medium black on the right (a document type such as "CPF" follows the value in #798282, 16px apart). The Enviar para row adds a 20px PencilSimpleLine. Footer with a 1px #e3e6e6 top border, 24px padding, buttons 12px apart aligned right |
| Side panel | Opens from the right, 20px from the top and 24px from the side, over the overlay, with a slide. Title and X at the top, Cancelar and Salvar (or the specific buttons) at the bottom. The exit is the same animation reversed |
| Search and pick | Search field with a magnifier. Typing opens a list with a User icon, the name and the cargo in gray, with the #f4f5f5 hover. Each choice becomes a row with a checked CheckSquare, the name and the cargo in gray, and a divider |
| Hover | Background #f4f5f5, no shadow. Exceptions: Novo cards (#e3e6e6 and wiggling stickers), filter pills (#e3e6e6) and tabs (black text, no underline) |
| Borders and text | 1px solid #e3e6e6. Secondary text #798282 |
| Overlay | rgba(227,230,230,0.6) with blur |
| Typography | Inter. Page title 24px Medium. Step title 32px Semibold, line-height 1.1, letter-spacing -0.26px, at 176px from the top of the flow, 532px wide. Buttons 14px Medium. Table header 12px in a 48px bar, rows 64px |
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
| Inline edit input | The edit state of a value in an info row or a profile field: a #f4f5f5 field, radius 8px, 40px high and 290px wide for every field (not the full row), aligned to the right, with a 24px X that cancels. Enter saves. Only one field can be in edit mode at a time: starting another edit commits the current value if it is valid, otherwise discards it |
| Stacked layers | When a panel or modal opens over another panel (Dados bancários over the collaborator page, a picker over the team page), the new layer gets its own overlay, rgba(227,230,230,0.6) with blur, above the layer behind it, so the one behind is dimmed and never shows through |
| Filter pills | Every option in the Filtros panels (Time, Cargo, Tipo, Status, Tipo de recurso, Status of teams) and the "Ver mais..." control are pills: #f4f5f5, 40px high, 16px side padding; selected black with white text and an X. Never a native button |
| Pickers | The color picker and the icon picker open as side panels (the side-panel pattern), never as centered modals: "Cor do time" with the 6 colors, and "Ícone do time" with the search field and the icon categories, both with Cancelar and Salvar |
| Detail page shell | Panel: 540px wide, white, radius 8px, 24px padding, 20px from the top and from the right edge, over the overlay, sliding in from the right; the content scrolls inside it. Header row 40px: the X, the title (16px Medium, letter-spacing -0.26px) and, on the right, 12px apart, the red Trash, the Power (collaborator only) and the FrameCorners expand icon. Sections are 40px apart. Full screen (expand, or opened by link): a 64px header with the X, the title and, on the right, the red Trash, the Power (collaborator only) and the Back-to-Modal icon that returns to the panel; then two columns from 120px below the header: the left one 500px wide at 320px from the left (profile, fields and the list sections) and the right one 316px wide at 880px (Métricas stacked, a 1px #e3e6e6 divider, the notes timeline and "Adicionar nota") |
| Profile row | A 40px round avatar (#f4f5f5 with a 20px icon, the team icon on the light team color, or the 40px logo), the name in 20px Medium with letter-spacing -0.26px, and the type in 14px Regular #798282, 16px apart. 14px below, the Pipo bar (collaborator only) |
| Detail fields | 62px rows: a 20px icon, the label (14px Medium black, 158px wide) and the value (14px, 290px wide), 12px apart. An action icon (eye, copy, phone, plus) sits at the right edge. "Adicionar nota" is a 62px row with NotePencil below a 1px #e3e6e6 line |
| Section title | 16px Medium, letter-spacing -0.26px, 20px above its content |
| Metric cards | 1px #e3e6e6 border, radius 8px, 16px padding, 16px internal gap, 12px between cards. Label 14px Medium #798282. A single big value is 40px Medium (with a 24px Eye at the top right when it is a cost). Row values (count per cargo, per value, members and tenure) are 24px Medium, right-aligned. Bars are 8px high, fully rounded segments side by side, with a 14px #798282 caption such as "Design: 60% | Vendas 30% | Marketing 10%" |
| List rows | 56px rows with a 1px #e3e6e6 border, radius 8px, 16px padding, 20px gaps, 12px apart. A 32px round avatar with white initials in the team's dark color, a 32px logo or icon badge, or a 32px file-type badge. Texts 14px Medium: name black, secondary gray. On the right: a value and a 24px ArrowUpRight, a 24px X, or "Download" and DownloadSimple. Section headers put the action ("Add membro", "Add time", a white 40px pill with a 24px Plus) on the right |
| Notes timeline | Full screen only: a container with a 1px #e3e6e6 top border, 30px top, 16px side and bottom padding, 24px between notes. Each note has a 1px #798282 left border, 16px left padding and 16px between the date (12px Regular #798282, "02 Set 2026") and the text (14px Regular black). Oldest first. "Adicionar nota" closes the list, with a 20px NotePencil and 14px Regular text, 12px apart |

## 1. Home

The header has the back button, "Gestão de Pessoas", the tutorial button (GraduationCap) and "Novo" (black pill, plus after the text). The tabs are Colaboradores, Times and Recursos.

### Colaboradores

**Figma:** section `10331:4871`. Frames: table `10331:3109`, row hover `10331:3312`, selection `10331:3515`, hover on Pendente 3/3 CLT `10331:3724`, Pendente 2/3 `10331:4355`, Pendente 1/1 PJ `10331:3940`, vacation tooltip `10331:4148`, grid `10331:4571`. The alert comes from `10338:9581` (Warning `10338:9635`, tooltip `10338:9667`).

| Element | Spec |
| --- | --- |
| Toolbar | 40px: "Total: X colaboradores", Filtros, and the grid and table toggle |
| Columns | Checkbox, Nome, Time, Cargo, Tipo ("CLT" or "PJ" as text), Status, icon slot and the 3-dot menu |
| Time column | The team names. With several teams, the first team plus "+N" (No Figma for "+N"; today the names are separated by commas) |
| Status pill hover | Pendente (admission) and Em desligamento (both shown as "Pendente X/Y") get a border in their own color and a read-only popover below with the checklist: CircleDashed for open items and a green CheckCircle for done ones. The popover stays open while the mouse moves into it. Other statuses have no popover |
| Icon slot | Absence badges: Island (férias), Baby (licença maternidade or paternidade) and Stethoscope (licença médica), with the tooltip "{Ausência} até dd/mm", shown only while the absence is active. Alert: a gray Warning with no badge and the tooltip "Informações faltando". Clicking it opens the collaborator page. Offboarding: a red Power icon on a light red round badge while the person is Em desligamento (Figma `10355:3841`); its tooltip has no Figma (assumption: "Em desligamento") |
| Desligado and Fim de contrato | Faded row, the pill keeps its color |
| Empty values | "—" |
| Row and selection | Hover and selected rows use #f4f5f5. While rows are selected, the floating bar shows "{N} selecionados", "Add em time" (FolderSimplePlus), a red trash and close. There is no Duplicar |
| Row menu | Ver colaborador and Excluir. Desligar returns with offboarding and then opens "Desligar {Nome}?". Reativar does not exist |
| Grid | 4 cards per row, no photo. Top: checkbox on the left, and the absence or alert icon and the 3-dot menu on the right. Middle: name, cargo and time ("—" when empty). Bottom: the Tipo as plain text on the left and the status pill on the right |
| Order | With no sort active, Pendente and Em desligamento rows come first, and Desligado and Fim de contrato rows come last (Figma `10355:6926`) |
| Column filters | Nome sorts A to Z in 3 states, and its icon becomes an X while active. Time, Cargo (cargos in use), Tipo (CLT, PJ) and Status (Pendente, Em atividade, Em desligamento, Desligado, Fim de contrato) are multi-select dropdowns that update live, with the icon becoming an X while active. Filters combine with AND across columns and OR within a column. Pendente matches any counter, and so does Em desligamento. Time matches a person when any of their teams is selected |
| Filtros panel | Time, Cargo, Período (by the "Ativo desde" date), Tipo and Status, in sync with the column filters |
| Floating search | "Buscar uma pessoa...", matching the name only |

**Mock errors:** "Vendedir" as a cargo, "Beatriz Souza" in the Time column, Gustavo Lima as CLT in the table and PJ in the grid, cargo names that change between table and grid, and "Total: 6 colaboradores" above 9 rows.

### Times

**Figma:** section `10334:5435`. Frames: default `10334:5436` (pending card `10334:5464`, "Criar time" `10334:5473`, complete card `10334:5480`, count `10334:5476`), card hover `10334:5643` (`10334:5680`).

| Element | Spec |
| --- | --- |
| Toolbar | "Total: X times", counting only complete teams, and Filtros (Status: Pendente, Completo as filter pills; Número de pessoas with minimum and maximum). No view toggle |
| Cards | 4 per row, 180px high |
| Complete card | Two stickers (UsersFour and the team icon, in the team color), the arrow at the top right, the name in 16px Semibold and the people count. No 3-dot menu. Hover #f4f5f5. A click opens the team page |
| Pending card | Dashed border, gray stickers and an outlined "Criar time" button in place of the arrow, which opens the create-team flow at step 2 with the name and members set. The card itself does not open a page. Pending cards come first |
| Floating search | "Buscar um time..." |

### Recursos

**Figma:** section `10334:5435`, frame `10334:5539` (cards `10334:5574`, `10334:5588`, `10334:5602`, `10334:5615`, `10334:5629`). The tab after creating a recurso: `10343:13530` and `10343:13592`.

| Element | Spec |
| --- | --- |
| Toolbar | "Total: X recursos" and Filtros (Tipo de recurso: Benefício, Verba, Licença as filter pills; Número de pessoas) |
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

The collaborator, team and recurso pages share the detail page shell (Shared patterns).

**Figma, Em atividade:** section `10355:1553`. Frames: home `10355:1557`, panel `10355:1699` (panel `10355:1842`, profile row `10355:1861`, Métricas `10355:1938`), full screen `10355:2085` (header `10355:2086`, Métricas `10355:2334`, notes timeline `10355:2104`).

**Figma, CLT:** Pendente with nothing done `10338:9083` (panel `10338:9174`), Pendente with documents `10338:9323` (panel `10338:9414`), Em atividade with information missing `10338:9671`, Dados bancários panel `10338:9924` (panel `10338:10177`).

**Figma, PJ:** Pendente 1/1 `10338:11884` (panel `10338:11975`), Em atividade with the contract `10338:12111` (panel `10338:12202`).

| Element | Spec |
| --- | --- |
| Header | X, "Colaborador", Excluir (red trash), Desligar (power) and Expandir. While Em desligamento, the red pill "Em desligamento" sits after "Colaborador" and the Desligar icon disappears (Figma `10355:3986`) |
| Status do processo | Gray card at the top while Pendente, with the counter on the right and the admission checklist read-only. While Em desligamento, the same card shows the termination items with the counter "Pendente X/Y", and open items that Figma marks with "Marcar como feito" on the right. A click marks the item done (green CheckCircle) and updates the counter. At zero, the person becomes Desligado (CLT) or Fim de contrato (PJ). The card disappears in Em atividade |
| Profile | Generic avatar, the name and the Tipo in gray ("CLT" or "PJ"), then the static Pipo bar "Peça ao Pipo para Resumir perfil, Redigir mensagem ou Comparar cargo" |
| Fields, CLT | Contato, Documento (the CPF followed by "CPF"), Cargo, Email, Time, Reporta para, Ativo desde, Salário bruto and Custo para empresa, each with its icon. Data de nascimento is stored but not shown |
| Fields, PJ | Contato, Documento (the CNPJ followed by "CNPJ"), Cargo, Email, Time, Reporta para, Ativo desde and Salário, which shows the contract value with its suffix. Razão social, data de fim and pagamento are stored but not shown |
| Empty fields | "Adicionar" and a plus on the right |
| Editing | Gray hover and a click to edit. Email is text and Enter saves. Cargo is free text with suggestions. Time accepts several teams as pills with a search, and typing a team that does not exist creates a pending team. Reporta para searches among Pendente and Em atividade people. Contato uses Telefone or Email. Dates use the calendar. Salário bruto, Custo para empresa and Salário are hidden by default, each with its own eye |
| Notes | "Adicionar nota" in the row. Enter saves with the date. Full screen shows the notes as the timeline in the right column (`10355:2104`). The panel has no Figma for the saved notes (assumption: the same timeline below the "Adicionar nota" row) |
| Métricas | Two metric cards: Custo total (40px, with an eye, custo para empresa plus recursos) and Tempo de casa (40px, "8 meses", "1a 3m", "—" before the admission date). Side by side in the panel, stacked in the right column of the full screen |
| Recursos | Filled (Figma `10355:3706`): one bordered 56px row per recurso, with the 32px logo or icon, the type in gray (the category for Benefício, "Verba" or "Licença") followed by the name, the person's value and an arrow that opens the recurso page. Empty: "Nenhum recurso adicionado" and "Adicionar". Adding from the profile has no Figma, so it has no action yet |
| Jornada de trabalho | Filled (Figma `10355:3750`): a bordered card with 48px rows Dias da semana, Horário, Almoço, Carga diária, Carga semanal, Regime and Home Office, mocked in the seed until Opy exists. Empty: "Nenhuma escala conectada" and "Conectar", interface only |
| Dados bancários | Empty: "Nenhum dado adicionado" and "Adicionar", which opens a second side panel with Banco ("Nome ou código do banco"), Agência, a Corrente or Poupança switch, Número da conta, Titular da conta and Chave PIX, plus Cancelar and Salvar. Salvar needs a full account or a chave PIX. Saved state (Figma `10355:3778`): a bordered card with 48px rows Banco, Agência, Tipo de conta, Número da conta, Titular and Chave PIX, with the key type in gray after the key (for example "CPF"). A click reopens the panel |
| Documentos | Files tied to completed checklist items: "Contrato_CLT" or "Contrato_PJ" for Contrato assinado, the sent document (for example "CNH.png") for Documentos enviados, and "Exames_Medico" for Exame médico feito, each with a file-type badge and "Download". Empty: "Nenhum documento adicionado" and "Adicionar". Download and Adicionar are interface only |
| Locking | Em desligamento, Desligado and Fim de contrato lock every field |

**Mock errors:** "Salário Bruno", "Nenhum escala conectada", "Nenhum dado adicionado" in Documentos, "Pendente 3/3" with two items done, "Nome do Titular" and "Nome ou Código do banco" with capitals, and dates, cargos and salaries that change between frames.

## 6. Create team

**Figma:** section `10342:12570`. Frames: name empty and filled `10342:12820` and `10342:12832`, color and icon `10342:12846` (rows `10342:12852`), members empty `10342:12876`, members while typing `10342:12895` (list `10342:12909`), members chosen `10342:12930` (list `10342:12944`), Informações adicionais `10342:12977` (rows `10342:12985`), leader panel `10342:13004` (panel `10342:13032`), description panel `10342:13071` (panel `10342:13099`), Times tab with the toast `10342:13110` (toast `10342:13162`).

Header: "Novo time". 4 steps. The flow opens blank from Novo, or at step 2 from a pending card, with the name and members set.

| Step | Spec |
| --- | --- |
| 1. Nome | "Qual será o nome do time?". Large input "Nome do time" with the green check. Continuar is disabled until there is a name. Team names are unique: if a complete or pending team already has the name (ignoring case and spaces), the check does not appear, Continuar stays disabled and a 12px #ff2633 message "Já existe um time com esse nome" shows below the field (No Figma). Voltar on this step closes the flow with no modal |
| 2. Cor e ícone | "Muito bem, hora de definir a cor e o ícone de {Nome}." with the name and the final period in #e9a716. Two 72px rows with a divider: a gray Eyedropper and "Cor" in 14px Medium, with the light and dark circles on the right, and a gray Smiley and "Ícone" in 14px Medium, with a gray pill holding the icon in the team color and a caret. Color and icon come prefilled (the first color not used by another team), and the pickers open as side panels (Shared patterns, Pickers). Continuar is always active |
| 3. Quem faz parte | "Quem faz parte do time {icon} {Nome}?": the team icon on a small badge in the light team color, and the name and the question mark in the team color. Search field "Buscar nome..." with the search-and-pick pattern, listing only Pendente and Em atividade people who are not chosen yet. No suggestion grid. Unchecking removes the person. Optional, so Continuar is always active |
| 4. Informações adicionais | "Finalize com algumas informações adicionais." Rows "Líder do time" and "Descrição" in 14px Medium, each with "Adicionar". The footer button is "Criar time" |
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
| Atribuir panel | Side panel "Atribuir" with the beneficiaries as rows with a checkbox, the name and the cargo in gray (the cargo is a project decision; Figma shows only names). Anyone in another variant shows a green check in place of the checkbox, cannot be picked, and is listed at the end. Cancelar and Salvar |
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

**Figma:** section `10355:1553`. Frames: Times tab `10355:3007`, panel `10355:3110` (panel `10355:3214`, fields `10355:3228`, Métricas `10355:3274`, members `10355:3309`, recursos `10355:3344`), full screen `10355:2346`. Only complete teams open.

| Element | Spec |
| --- | --- |
| Header | X and "Time", with the red Trash and the expand icon. No Power |
| Profile | The 40px badge in the light team color with the team icon, and the name in 20px Medium |
| Fields | Líder (Crown): a 24px avatar and the name. Cor (Eyedropper): a #f4f5f5 pill with the 12px dot in the team color and a caret, which opens the color picker as a side panel. Ícone (Smiley): the same pill with the icon and a caret, which opens the icon picker as a side panel. Descrição (FileText): the text in 14px, up to 3 lines, then "ver mais..." in #798282, which expands it. Then "Adicionar nota" |
| Métricas | Four metric cards: Total de membros and Tempo médio de casa as two rows with 24px values; Custo total do time (40px, with an eye); Cargos representados, one row per cargo with its count in 24px; Tipo de contratação, a bar of CLT (#039300) and PJ (#2a79d7) with the caption "CLT: 60% \| PJ 40%" |
| Membros | Section with "Add membro" on the right. List rows with the avatar initials in the team's dark color, the name, the cargo in gray and an X with a confirmation. The list includes Pendente, Em atividade and Em desligamento. "Add membro" offers only Pendente and Em atividade people not in the team (No Figma for the picker: the leader-panel pattern, with several choices). Adding adds this team to the person's teams, and removing takes out only this team |
| Recursos | Section "Recursos" with list rows: the logo or icon, the type in gray, the name, the value range of the members and an arrow to the recurso page |
| Full screen | Left: profile, fields, Membros and Recursos. Right: the four metric cards, the divider, the notes timeline and "Adicionar nota" |
| Delete | A confirmation, and the members lose only this team |

**Mock errors:** the section title "Beneficios" (Recursos), the bar caption "Fixo: 60% \| Freelancer 30% \| Consultor 10%" with a third segment, the Power icon in the full-screen header, and "Total: 3 times" above 4 cards.

## 9. Recurso page

**Figma:** section `10355:1553`. Frames: Recursos tab `10355:2660`, panel `10355:2764` (panel `10355:2869`, fields `10355:2883`, Métricas `10355:2923`, times `10355:2950`, members `10355:2969`), full screen `10355:2514`. Figma shows a Benefício. Route `#/recurso/:id`.

| Element | Spec |
| --- | --- |
| Header | X and the type as title ("Benefício", "Verba" or "Licença"), with the red Trash and the expand icon. No Power |
| Profile | The 40px logo or icon badge, the name in 20px Medium (the supplier for Benefício, the name for Verba, the service for Licença) and, for Benefício, the category in 20px Regular #798282 |
| Fields, Benefício | Fornecedor (Buildings): the supplier name. Link (Link): the link, with a 24px Copy on the right. Contato (Phone): the phone, with a PhoneOutgoing on the right. Email (At). Read-only, with "—" when empty. Then "Adicionar nota" |
| Fields, Licença | Link, Contato and Email, as above |
| Fields, Verba | None. Only "Adicionar nota" |
| Métricas | Total de beneficiários (40px) and Custo total (40px, with an eye) side by side; a card with one row per value ("R$450,00" in gray and the count in 24px); Por time, a bar with one segment per team in the team's dark color and the caption "Design: 60% \| Vendas 30% \| Marketing 10%". Values are "por pessoa" |
| Times | Section with "Add time" on the right. List rows: the 32px badge in the light team color with the team icon, the name, "N pessoas" in gray, the value and an X. The whole company has its own row when it is a link (No Figma) |
| Membros individuais | Section with "Add membro" on the right. List rows: the avatar initials, the name, the value and an X |
| Full screen | Left: profile, fields, Times and Membros individuais. Right: the metric cards, the divider and "Adicionar nota" with the notes timeline |
| Adding links | No Figma: "Add time" and "Add membro" open the leader-panel pattern with several choices, offering only Pendente and Em atividade people and existing teams. A new link takes the recurso's base value; variants are managed in the creation flow |
| Who counts | Desligado and Fim de contrato stop counting from their exit date |

**Mock errors:** "Beneficio" without the accent, "Alice LTDA." as the supplier (use the supplier name), "Total de membros 3" in the full-screen metrics (it is Total de beneficiários, the same number as the panel), the Power icon in the full-screen header, "Total: 5 beneficios", "Plano de Saude", "Auxilio" and "Vale Refeição" on the tab.

## 10. Offboarding

**Figma, CLT:** section `10355:3451`. Frames: the page before (`10355:3455`, panel `10355:3598`), the Desligar modal `10355:4398` (modal `10355:4783`), termination type `10355:4796`, Informações `10355:4855`, term panel `10355:4896`, table after `10355:3841`, page Em desligamento `10355:3986` (panel `10355:4132`).

**Figma, PJ:** section `10355:5041`. Frames: the page before `10355:6649`, the Desligar modal `10355:7363` (modal `10355:7748`), termination type `10355:7761`, Informações `10355:7810`, term panel `10355:7847`, table after `10355:6926`, page Em desligamento `10355:7067` (panel `10355:7213`).

**Entry.** The Desligar icon (Power) in the collaborator page header, and the Desligar item of the row menu. Both open the Desligar modal (section 11). Confirming opens the flow.

**Shell.** Header "Desligamento" on the left and the X on the right, which opens "Descartar edições.". 2 steps for the progress bar: Tipo de rescisão and Informações. The type step has no footer.

| Step | CLT | PJ |
| --- | --- | --- |
| 1. Tipo de rescisão | "Qual o tipo de rescisão de {Nome}?", with the name in #e9a716 and the question mark in black. 5 cards with an icon on a yellow badge and an arrow: Sem justa causa (FileX), Com justa causa (Siren), Pedido de demissão (HandWaving), Acordo entre partes (Handshake) and Fim de contrato de experiência (HourglassHigh). A click advances | The same title. 4 cards: Fim de contrato (FileX), Antecipada pela empresa (DoorOpen), Antecipada pelo prestador (HandWaving) and Acordo entre partes (Handshake) |
| 2. Informações | "Finalize com algumas informações adicionais." Rows: Data do desligamento (a "Daqui a 30 dias" pill and a calendar button), Aviso prévio (pills Trabalhado, selected by default, Indenizado and Não se aplica; hidden for Com justa causa) and Motivo do desligamento ("Adicionar") | Rows: Data do desligamento, Motivo do desligamento ("Adicionar") and Multa por rescisão antecipada (currency, "0,00" when empty) |
| Term panel | "Informações para termo de rescisão". Rows: Nome, Documento (the CPF followed by "CPF"), Tipo de rescisão, Data do desligamento ("30 Out 2026" format), Aviso prévio and Enviar para (pencil, the same sheet as the contract) | The same title. Rows: Nome, Documento (the CNPJ followed by "CNPJ"), Tipo de rescisão, Data do desligamento, Multa por rescisão antecipada and Enviar para |

The term panel footer has "Salvar sem termo" (text button) and "Gerar e enviar" (black). The X of the panel goes back to Informações and keeps the data. Motivo do desligamento is stored but not shown in the panel.

**Result.** "Gerar e enviar" waits 1 to 2 seconds. Both buttons close the flow and return to the table. The person becomes Em desligamento: the row shows "Pendente X/Y" with the red Power badge (`10355:3841`), and the page shows the "Em desligamento" pill, the termination checklist with "Marcar como feito", locked fields (the team pill loses its caret and the empty fields lose "Adicionar") and no Desligar icon (`10355:3986`). Until the exit date the person still counts in teams and recursos. When the checklist reaches zero, the person becomes Desligado (CLT) or Fim de contrato (PJ), the row fades and moves to the end of the list (`10355:6926`).

**Visual details read from the design context:**

- Desligar modal (`10355:4783`): 393px wide, white, radius 16px, 24px padding, content centered with 40px gaps. The 40px white round X sits 40px above it. Badge 40x40, radius 8px, #ffe9ea, with a 24px red Power. Title 24px Semibold, line-height 1.1, letter-spacing -0.26px, centered, in two lines ("Desligar" and "{Nome}?"). Text 14px Regular #798282, centered, line-height 1.2. Buttons in one row, spread apart: "Cancelar" as a text button and "Desligar" black.
- Type step (`10355:4796`, `10355:7761`): the type-card pattern. Title "Qual o tipo de rescisão" on the first line and "de {Nome}?" on the second, with only the name in #e9a716.
- Informações (`10355:4866`, `10355:7821`): the info-row pattern. Aviso prévio puts its three pills right after the label, 12px apart. Multa por rescisão antecipada shows "0,00" in 14px Medium black.
- Term panel (`10355:4938`, `10355:7885`): the summary-panel pattern, title "Informações para termo de rescisão" for CLT and PJ.
- Table row (`10355:3884`): the Power badge is 32x32, fully round, #ffe9ea, with a 20px red Power, 12px before the 3-dot menu. The pill is the yellow "Pendente X/Y".
- Page header (`10355:4133`): X, "Colaborador" (16px Medium), then the red status pill "Em desligamento" (rgba(255,38,51,0.1) with #ff2633, 12px Medium), 12px apart, and on the right only the trash (red) and the expand icon.
- Status card (`10355:4148`): #f4f5f5, radius 8px, 12px padding. Header row with 12px by 8px padding: "Status do processo" 14px Medium black and the counter 14px Medium #798282. Item rows with 12px by 8px padding and 8px gaps: a 20px CircleDashed, the label 14px Medium black, and "Marcar como feito" 14px Medium black on the right.
- Locked fields (`10355:4132`): the team pill (#f4f5f5, 32px high, a 12px dot in the team color and the name) loses its caret.

**Assumptions, with no Figma:**

- Continuar in Informações is disabled until Data do desligamento is set, although Figma draws it active.
- "Adicionar" on Motivo do desligamento opens a side panel "Adicionar motivo" with a text area, Cancelar and Salvar, like the team description.
- Multa por rescisão antecipada shows for every PJ termination type.
- Both buttons show the toast "Desligamento iniciado com sucesso". Figma shows no toast.
- The termination checklist items that Figma draws without "Marcar como feito" (Exame demissional realizado and Termo de rescisão assinado e devolvido for CLT, Termo assinado e devolvido for PJ) need a decision: see Open points.
- The page of a Desligado or Fim de contrato person has no Figma: it keeps the locked fields and shows the final status pill in the header.

**Mock errors:** "Assinar termo de recisão" (rescisão), "Salário Bruno", "Vale Refeição" in the Recursos list (Vale alimentação), "R400,00" (R$400,00), "Agencia" (Agência), "Home Office" with capitals in Jornada, Gustavo Lima shown as CLT in the PJ result table, the PJ page in Em desligamento still showing "Adicionar" and plus icons on empty fields (they are locked), the CPF written as "124 345 567 80" (use the 000.000.000-00 mask), and "Total: 6 colaboradores" above 5 rows.

## 11. Confirmations and toasts

| Modal | Text | Confirm |
| --- | --- | --- |
| Excluir colaborador | "Tem certeza que quer excluir o colaborador {Nome}? Essa ação não pode ser desfeita. Se preferir, você pode desligá-lo e mantê-lo na sua lista de colaboradores." | Excluir |
| Excluir vários | "Excluir {N} colaboradores?" | Excluir |
| Excluir time | "Tem certeza que quer excluir o time {Nome}? Essa ação não pode ser desfeita. Os colaboradores deixam de fazer parte deste time e continuam nos outros, se houver." | Excluir |
| Excluir recurso | "Tem certeza que quer excluir o recurso {Nome}? Essa ação não pode ser desfeita." | Excluir |
| Desligar | Figma `10355:4783`: its own layout, not the shared confirmation modal (see section 10 for sizes). A red Power icon on a #ffe9ea badge, the title "Desligar {Nome}?" and "Tem certeza que quer desligar o colaborador {Nome}? Os campos ficarão bloqueados para edição, mas você continuará vendo o perfil. Essa ação não pode ser desfeita.". Confirming opens the offboarding flow | Desligar |
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
| 7 | Offboarding CLT and PJ, the Em desligamento state on the home and the page, and the filled states of Recursos, Jornada and Dados bancários on the page | 10, 5, 1, 11 |
| 8 | Detail pages from Figma: the collaborator page full screen with the notes timeline, the team page and the recurso page | 5, 8, 9 |

Not in this round, because there is no Figma: the floating search. Keep the bridges they need working.

## Open points

- Should the Time filter have a "Sem time" option?
- The checklist has no screen to mark items, so new collaborators stay Pendente.
- PJ: Custo total for Anual and Valor fixo is provisional, and the page does not show the end date of a temporary PJ.
- Create recurso: confirm the assumptions of section 7.
- Termination checklist labels are provisional and need a labor-law review.
- Floating search: should switching tabs clear the text, and how does the bar behave in the detail views?
- Detail pages: no Figma for the pickers behind "Add membro" and "Add time", for the saved notes inside the panel, for the whole-company row on the recurso page, or for the Verba and Licença variants of the recurso page.
- Offboarding: how do the items without "Marcar como feito" get done? Without it nobody reaches Desligado or Fim de contrato.
- Should the admission checklist also get "Marcar como feito", so new collaborators can leave Pendente?
- No Figma yet: adding a recurso from the profile, the saved state of Dados bancários, the edit state of the Informações rows, the loading state of "Gerar contrato", and logos for the other suppliers. The icon of Benefício "Outro" (Gift) is provisional.
