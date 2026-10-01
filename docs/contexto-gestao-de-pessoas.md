# Gestão de Pessoas: project context

Last updated: 2026-10-01

## How to use this document

This is the working context for Gestão de Pessoas: what the platform did before and what it must do now, one topic at a time.

- Audit the repository against each topic before changing code, and report any difference first.
- Work on one topic at a time, and wait for confirmation before starting the next.
- The "Before" columns describe what earlier prompts built. If the code differs, trust the code.
- The "Now" columns are decisions confirmed by the project owner.
- Figma is the source of truth for every visual. Never build a new screen without a Figma link.

## Product context

Gestão de Pessoas is the module of the Pipo agent (people and knowledge) for creating and managing a company's collaborators in one place. It is built for HR teams of companies with 50 to 100 employees.

**Out of scope** (other Squad modules or other platforms):

- Recruiting
- Shift schedules (Opy)
- Time tracking
- Real contract generation and e-signature (Juri)
- Benefit cards and payments (benefit platforms)

**Not built yet:**

- Pipo chat
- Opy data (schedule, vacation, leaves)
- File upload and photos
- Real contract generation

Touchpoints with other modules are simulated or hidden. Contract generation is simulated, vacation and leave icons use absences mocked in the seed, and the work schedule is a read-only field.

## Overall before and after

Eleven areas changed. The table gives the platform before the recent decisions and as it must be now.

| Area | Before | Now |
| --- | --- | --- |
| Tabs | Colaboradores, Times, Cargos, Benefícios | Colaboradores, Times, Recursos |
| Contract types | Fixo, Freelancer, Consultor | CLT and PJ only. A temporary PJ is a PJ with a contract end date. "Consultor" survives only as a cargo name |
| Cargo | Own entity with a tab, a page, a creation flow and a pending state | Free text on the collaborator, with suggestions from cargos already in use |
| Create collaborator | Two-step wizard: name and type, then fields | Two phases. Phase 1: data and a generated contract (simulated). Phase 2, "Completar cadastro", done on the collaborator page: time, reporta para, e-mail, benefits (CLT only), bank data |
| Status | Atividade tag and a manual Desligado | Calculated from a checklist: Pendente, Em atividade (with alert), Rescisão pendente, Desligado or Fim de contrato |
| Offboarding | Manual mark with a confirmation | Own flow for CLT and PJ, with a termination document and a checklist |
| Collaborator profile | E-mail, cargo, time, reporta para, dates, salary, photo | Adds CPF or CNPJ, phone, bank data, gross salary and cost to company (CLT), payment type and contract value (PJ), work schedule (read-only), checklist, notes, and metrics (total cost, tenure) |
| Teams | Wizard and completing drafts | Same, in 4 steps (name, color and icon, members, leader and description), plus a team total-cost card |
| Benefícios | Benefits and allowances, with cargo as a link source | Recursos with 3 paths (Benefício, Verba, Licença). Links are whole company, teams and people, never cargo |
| Visual standards | Values set per screen | One standard for hover, borders, typography, panels, confirmations and toasts |
| Other modules | None | Opy and Juri touchpoints are simulated or hidden |

Work schedule ("jornada"): it is only mocked for now and shown read-only in the profile, with no field or flow to enter it until Opy exists. The table shows only "PJ", and fixed or temporary is defined by the contract end date in the creation flow. A collaborator can belong to more than one team.

## Stack and working rules

The stack does not change: React and Vite with HashRouter, no backend, GitHub Pages. The rules below apply to every change.

**Stack**

- React + Vite + react-router-dom, with HashRouter (GitHub Pages has no server rewrites).
- Monorepo with npm workspaces and one `package-lock.json` at the root. The module lives in `packages/modulo-gestao-pessoas/` and is mounted by `apps/web` at `/gestao-de-pessoas/*`, under the single HashRouter. Build with `npm run build` at the root. The Vite `base` is set in `apps/web` and must not be changed.
- Shared components come from `@squad/ui` (Tabela, LinhaTabela, DropdownColuna), which other modules such as Fluxo de Caixa also use. Do not change their defaults. If the module needs something different, propose an opt-in prop with the current default.
- This document lives in `docs/contexto-gestao-de-pessoas.md`, at the monorepo root.
- Font: Inter, installed through `@fontsource/inter`. No CDN, because the Claude Code sandbox blocks it.
- Data: `localStorage` only, no backend. The storage is shared with the other modules in `apps/web`, so only touch keys of this module.
- Deploy: GitHub Actions to GitHub Pages, with `cancel-in-progress: true`.
- Icons: SVG files in `src/assets/icons`, named exactly as the Figma layers (for example `CheckSquare.svg` for every checked checkbox). `@phosphor-icons/react` is also installed.
- Illustrations live in `src/assets/illustrations` and images in `src/assets/images`.

**Working rules**

- Fetch each screen state from Figma with its own node id. Map SF Pro to Inter: Semibold 600, Medium 500, Regular 400.
- Build the visual shell first, then add behavior in a separate step.
- Keep each change narrow, and avoid side effects.
- No silent fallbacks. If an asset is missing or something fails, report it. Never use a placeholder.
- Verify at the Medium level: a local build plus a quick check in the browser.
- UI copy is in Brazilian Portuguese, in sentence case. No em dashes in any text. The only exception is "—" as the empty-value symbol, in cells and fields with no value.
- Title highlights always use #e9a716, for example "criar hoje?" in the Novo modal and the name in flow titles.
- Dates always use the real current day. Never hardcode a date.
- Old `localStorage` data from the previous model is cleared, not converted.

## Implementation status

The code started at the "Before" state of every topic. This section records what is already built and the temporary bridges that keep the old screens working. Remove each bridge when its topic is done.

**Topic 1, done** in branch `feat/gp-status-home`:

- Collaborator model: `tipo` (CLT or PJ), `admissao` (admission checklist), `rescisao` (termination checklist, with the termination type for CLT, which defines the items that apply) and `ausencia` (type, start and end).
- Status comes only from `getStatus()` in `colaboradorStatus.js`.
- Seed in `seedColaboradores.js`: 13 collaborators covering every status, with dates relative to the real current day. Names come from Figma, plus Bruna Teixeira (Em atividade, no team), Lucas Andrade (CLT, Rescisão pendente 3/4), Renata Prado (PJ, Rescisão pendente 2/3) and André Moura (PJ, Fim de contrato). Absences: Victoria Cardoso (férias), Gustavo Lima (licença paternidade) and Beatriz Souza (licença médica).
- The seed creates Design, Marketing and Vendas as pending teams, only when no team with the same name exists.
- Old data is cleared through the key `squad:gestao-pessoas:versao-dados`. When the stored version is older or missing, old collaborators are deleted and the seed is written. When it is newer than the code, nothing runs. Keys of other modules and the existing benefits seed are kept.
- Table and grid follow the homepage Figma: Tipo and Status columns and filters, status popover, absence badges and tooltips, faded rows, "—" for empty values and the grid card without a photo.
- Icons exported from Figma: Island, Baby, Stethoscope, CircleDashed, CheckCircle, and the tooltip pointer as `Polygon 1.svg`.

**Still missing in Topic 1:** tab names (still "Benefícios"), search placeholders, the Novo modal, "+N" in the Time column (still names separated by commas), the alert icon and the offboarding icon.

**Temporary bridges:**

| Bridge | Why | Remove in |
| --- | --- | --- |
| The current creation flow saves `tipo` and an open admission checklist. Fixo becomes CLT, and PJ, Freelancer and Consultor become PJ | So a new collaborator enters as Pendente 3/3 or 1/1 | Topics 5 and 6 |
| Desligar and Reativar are gone from the home row menu | Today Desligar only toggled a boolean, which contradicts the status model | Topic 12 |
| The collaborator page still toggles `desligado`, shows the Desligado tag, locks fields and offers Reativar. The home ignores it, so the table status does not change | The page is still the old one | Topics 9 and 12 |
| The seed also writes the legacy fields `contractType` (Fixo or PJ) and `desligado: true` for Pedro Martins and André Moura | So the old collaborator page shows the right fields and locks them | Topic 9 |

**Known differences, not done:**

- Table padding: Figma uses 12px in rows and header, with 4px header corners, while `Tabela` in `@squad/ui` uses 16px. Fix with an opt-in prop.
- Tab height does not match Figma, and the "Ver mais..." button in the Filtros panel has no style.

## Topic 1: Homepage

The homepage keeps its header, responsive width and toolbar, and changes the tabs, the Novo modal, the search placeholder and the row menu.

**Figma:** file `ZQZtZy7exqkUi5u33CUvuM`, section `10331:4871` (Ajustes-home-modulo-gestao-de-pessoa). Frames: default table `10331:3109`, row hover `10331:3312`, multiple selection `10331:3515`, hover on Pendente 3/3 CLT `10331:3724`, hover on Pendente 2/3 CLT `10331:4355`, hover on Pendente 1/1 PJ `10331:3940`, vacation tooltip `10331:4148` and grid `10331:4571`.

The sample data in these frames has errors: "Vendedir" as a cargo, "Beatriz Souza" in the Time column, Gustavo as CLT in the table and PJ in the grid, and "Total: 6 colaboradores" above 9 rows. Do not copy them.

### Layout, tabs and bars

| Element | Before | Now |
| --- | --- | --- |
| Tabs | Colaboradores, Times, Cargos, Benefícios | Colaboradores, Times, Recursos |
| "Novo" modal | 4 cards: Colaborador, Time, Cargo, Benefício | 3 cards: Colaborador, Time, Recurso |
| Floating search placeholder | Per tab: pessoa, time, cargo, benefício | Per tab: "Buscar uma pessoa...", "Buscar um time...", "Buscar um recurso..." |
| Row menu (3 dots) | Ver colaborador, Excluir, Desligar. Desligar marked the person as Desligado after a confirmation | Same items. Desligar opens the "Desligar {Nome}?" modal, which starts the offboarding flow (CLT or PJ) |

Unchanged: the header (back, title, tutorial, Novo), the responsive content width, the 40px toolbar, the bulk selection bar ("Add em time", delete, close), the #f4f5f5 hover, and the "Pergunte ao Pipo" pill (interface only, no chat).

### Colaboradores table and grid card

The table gains two columns, Tipo and Status, and loses Ativo desde and Atividade. Header (48px) and row (64px) sizes do not change.

| Element | Before | Now |
| --- | --- | --- |
| Columns | Checkbox, Nome, Time, Cargo, Ativo desde, Atividade, 3-dot menu | Checkbox, Nome, Time (first team plus "+N" when there are more), Cargo, Tipo, Status, icon slot, 3-dot menu |
| Tipo | Did not exist | "CLT" or "PJ" |
| Status | Did not exist | Status pill with a counter when pending (see the status model). Hovering a Pendente or Rescisão pendente pill gives it a border in its own color and opens a read-only checklist popover below it |
| Icon slot | None | Left of the 3-dot menu. Absence icons sit on a round blue badge: Island (férias), Baby (licença maternidade or paternidade) and Stethoscope (licença médica). On hover, a black tooltip above the icon reads "{Ausência} até dd/mm", for example "Férias até 12/10". The alert and offboarding icons also go here, but are not designed yet |
| Grid card | Avatar or photo, name, cargo, time, Atividade tag | No photo. Top: checkbox on the left, and the absence icon and 3-dot menu on the right. Middle: name, cargo and time. Bottom: Tipo as plain text on the left and the Status pill on the right. Tipo is not a pill |
| Desligado and Fim de contrato rows | Normal text | All text and the checkbox are faded (tone from Figma `10331:3265`), and the pill keeps its color. The grid card gets the same fade |
| Empty values | Not defined | "—", for example Time for someone without a team |
| Selected row | Not defined | Background #f4f5f5 |

### Column filters and sorting

| Column | Before | Now |
| --- | --- | --- |
| Nome | Sort A to Z in 3 states, icon becomes X while active | Same |
| Time | Dropdown with the registered teams | Same |
| Cargo | Dropdown with the cargos collection | Dropdown with the cargos in use by collaborators, because the collection is gone |
| Ativo desde | Sort by date | Column removed. The date stays available in the Período filter |
| Atividade | Dropdown: Freelancer, Consultor, Desligado | Column removed |
| Tipo | Did not exist | Dropdown: CLT, PJ |
| Status | Did not exist | Dropdown: Pendente, Em atividade, Rescisão pendente, Desligado, Fim de contrato |

Dropdown behavior does not change. It is multi-select, updates live with no save button, and the icon becomes X while a filter is active. Filters combine with AND across columns and OR within a column, stay in sync with the Filtros panel, and the floating search matches only the name. Pendente matches any counter (3/3, 2/3, 1/1), and so does Rescisão pendente. The Time filter matches a collaborator when any of their teams is selected.

### Filtros panel

The sections are now Time, Cargo, Período, Tipo and Status. Período filters by the "Ativo desde" date (admission or contract start). Tipo and Status replace the old Atividade section (Fixo, Consultor, Freelancer).

### Status model

Status is calculated from a stored checklist, and nobody picks it by hand. Tipo and Status are separate columns.

Before, there was only the Atividade tag: Fixo had none, Freelancer was blue, Consultor was green, and Desligado was a manual mark with a confirmation that locked the fields and could be undone with "Reativar".

| Status | When it appears | Color |
| --- | --- | --- |
| Pendente X/Y | The contract was generated and the checklist is open. X is how many items are still missing and Y is the total. CLT has 3 items (contract signed, documents sent, admission exam) and starts at 3/3. PJ has 1 item (contract signed) and starts at 1/1 | Yellow |
| Em atividade | The checklist reached zero. If anything from "Completar cadastro" is missing (time, reporta para, e-mail, benefits for CLT only, bank data), an alert icon appears beside the pill and disappears once everything is filled | Green |
| Rescisão pendente X/Y | The termination document was generated in the offboarding flow. Fields become locked and the offboarding icon appears. The CLT checklist has 4 to 6 items depending on the termination type (see Topic 12): TRCT, FGTS withdrawal guide, unemployment insurance request, FGTS statement, dismissal exam, signed termination. The PJ checklist has 3 items: termination document sent, signed document returned, last invoice | Yellow |
| Desligado (CLT) or Fim de contrato (PJ) | The offboarding checklist reached zero. The row stays in the table, locked for good | Red for Desligado, gray for Fim de contrato |

- Checklist items have no required order.
- A collaborator can be Em atividade before the start date, because the contract is already signed.
- Absence icons (vacation, medical leave, maternity or paternity leave) will come from Opy. Until then, absences are mocked in the seed: an optional absence on the collaborator, with a type and start and end dates relative to the real current day. There is no screen to create or edit it. The icon shows only while the absence is active (start ≤ today ≤ end).
- Checklist items are not editable in the interface for now. There is no automation and no screen to mark them, and the status is derived from the stored checklist state. The checklist is shown read-only in the status popover on the homepage (table and grid) and on the profile. Clicking an item does nothing.

**Checklist labels**, in this order. Open items use CircleDashed and done items use a green CheckCircle.

| Status | Items |
| --- | --- |
| Pendente, CLT | Contrato assinado, Documentos enviados, Exame médico feito |
| Pendente, PJ | Contrato assinado |
| Rescisão pendente, CLT | TRCT, Guia de saque do FGTS, Requerimento do seguro-desemprego, Extrato do FGTS, Exame demissional, Rescisão assinada. Only the items that apply to the termination type (Topic 12) |
| Rescisão pendente, PJ | Termo de encerramento enviado, Termo assinado devolvido, Última nota fiscal |

The Pendente labels come from Figma. The Rescisão pendente labels are provisional, written from Topic 12, and need a Figma check.

### Homepage decisions

These were confirmed by the project owner.

- The Período filter stays and filters by "Ativo desde".
- With no sort active, Pendente and Rescisão pendente rows come first.
- Absence icons show from absences mocked in the seed, with the tooltip "{Ausência} até dd/mm", until Opy exists.
- The status popover is read-only and opens for Pendente and Rescisão pendente. Em atividade, Desligado and Fim de contrato have no popover.
- Desligado and Fim de contrato rows are faded.
- In the grid, Tipo is plain text.
- The empty-value symbol is "—" across the platform.
- "Reativar" is removed. Desligado and Fim de contrato are final.
- Offboarding a collaborator who is still Pendente (unsigned contract) is not handled.
- Old `localStorage` data is cleared.
- Colors: Pendente and Rescisão pendente yellow, Em atividade green, Desligado red, Fim de contrato gray.
- Consultor and Freelancer no longer exist as types. Consultor is only a cargo name.

**Open point:** should the Time filter include a "Sem time" option for collaborators without a team? It was suggested and not confirmed.

## Topic 2: Times tab

The Times tab keeps its design, and the cards go from 3 to 4 per row. The detail view and the creation flow are separate topics.

| Element | Before | Now |
| --- | --- | --- |
| Top bar | "Total: X times" and the Filtros button | Same |
| Cards per row | 3 | 4, like the Colaboradores grid and the Recursos tab |
| Card | 180px high. Two icon stickers (the team sticker and the team's chosen icon, in the team color), name (16px semibold), "N pessoas" (14px), arrow in the corner, 3-dot menu on hover only | Same |
| Pending team | Dashed border, gray stickers, "Criar time" link in the corner, no menu. Listed first | Same |
| Where a pending team comes from | Typing a new name in the Time field of the create-collaborator flow | Typing a new name in the Time field on the collaborator page (to confirm) |
| "Criar time" on a pending card | Opens the creation flow at the color and icon step, with members already selected | Same |
| 3-dot menu | Ver time, Excluir | Same |
| Excluir | Confirmation, and the members become teamless | Same |
| "N pessoas" | Collaborators whose Time is this team | Also counts Pendente and Rescisão pendente collaborators, and counts a person in every team they belong to. Desligado and Fim de contrato are not counted |
| Filtros | Status (Pendente, Completo) and Número de pessoas (minimum and maximum) | Same |
| Floating search | "Buscar um time..." | Same |

## Topic 3: Recursos tab

Benefícios becomes Recursos, with three types instead of benefits and allowances only. The detail view and the creation flows are separate topics.

| Element | Before | Now |
| --- | --- | --- |
| Name | Benefícios | Recursos |
| Top bar | "Total: X benefícios" and Filtros | "Total: X recursos" and Filtros |
| Cards per row | 4 | 4 |
| Card | 180px high. Logo or icon (56px), arrow, name (16px semibold), "N pessoas", 3-dot menu on hover | Same |
| What exists | Benefits by category, plus Fixo and Verba | 3 types: Benefício, Verba and Licença |
| Card icon | Provider logo or category icon on a light badge | Benefício: category icon (Stethoscope, Van, ForkKnife, Barbell, Tooth, Shield). Verba: HandCoins. Licença: Key. No logos for now |
| "N pessoas" | Live count of people, teams and cargos linked | Live count of people, teams and the whole company. Cargo is gone. Desligado and Fim de contrato collaborators stop counting from their exit date |
| Pending state | Does not exist | Does not exist |
| 3-dot menu | Ver benefício, Excluir | Ver recurso, Excluir |
| Filtros | Tipo de benefício (8 options) and Número de pessoas | Tipo de recurso (Benefício, Verba, Licença) and Número de pessoas |
| Floating search | "Buscar um benefício..." | "Buscar um recurso..." |
| Initial data | 5 examples seeded in code | None. The tab opens empty until someone creates a recurso |

## Topic 4: Floating search and Pergunte ao Pipo

The floating search stays as it is, with new placeholders. "Pergunte ao Pipo" stays an interface only: sending a question does nothing, and the Pipo functions come after the pages are built.

| Element | Before | Now |
| --- | --- | --- |
| Position | Fixed at the bottom, 24px from the edge, centered in the content area. Pill 64px high and 468px wide | Same |
| Default state | Magnifier, a placeholder per tab, and the "Pergunte ao Pipo" pill | Same, with the placeholders "Buscar uma pessoa...", "Buscar um time..." and "Buscar um recurso..." |
| Search state | On focus the pill becomes an X. The list filters live, by name only. The X clears the text and returns to the default | Same |
| What the search matches | Name of the person, team, cargo or benefit | Name of the person, team or recurso. Cargo is gone |
| Pipo state | Click on the pill: cream background, Pipo avatar instead of the magnifier, "Pergunte ao Pipo...", a microphone that becomes a paper plane when typing, and an X that clears and returns to the default. Typing filters nothing and sending does nothing | Same. The Pipo chat still has no design |
| Selection bar | Replaces the search while rows are selected (Colaboradores only) | Same, with "Add em time", delete and close |
| Layers and height | Sits behind the overlay of modals and panels. Same height in the 3 states and in the selection bar | Same |

**Planned for later, not built.** The owner described two Pipo functions: importing a document with the information of collaborators and teams and registering everything without going through the flows, and summaries about collaborators, teams and recursos. The Pipo chat has no design yet, so do not build any behavior until it exists.

**Open points** (suggested, not confirmed):

- Switching tabs clears the typed text and changes the placeholder.
- In Recursos, the search matches only the card name (for example "Alice"), not the type or the supplier.
- In the detail view, the bar stays behind the overlay in the side panel and is hidden in full screen.

## Topic 5: Novo button, modal and CLT Phase 1

The Novo modal loses the Cargo card, and the creation flow for a CLT collaborator is split in two phases. This topic covers the modal and Phase 1, which ends with a simulated contract. Phase 2 ("Completar cadastro") and the PJ flow (Topic 6) are separate topics.

### Novo button and modal

| Element | Before | Now |
| --- | --- | --- |
| Button | Black pill, 40px, "Novo" and the plus icon after the text | Same |
| Title | "O que vamos criar hoje?", with "criar hoje?" in #e9a716 | Same |
| Cards | 4 cards of 160x160 (Colaborador, Time, Cargo, Benefício), with stickers and a label | 3 cards: Colaborador, Time, Recurso. Recurso uses the Benefício illustration at the same size, and the modal gets narrower |
| Hover | #e3e6e6 background and the stickers wiggle | Same |
| Close | X outside the modal, above it, or a click on the overlay | Same |
| Overlay | rgba(227,230,230,0.6) with blur | Same |
| Card destinations | Colaborador opens the flow. Time and Benefício open their flows. Cargo opened Novo cargo | Cargo is gone. Time and Recurso open their flows (later topics) |

### Create collaborator, CLT, Phase 1

| Step | Before | Now |
| --- | --- | --- |
| Shell | Gradient background, 64px header ("Novo Colaborador" and X), 80px footer with progress bar and Voltar and Continuar, content 532px wide | Same. The header changed in Figma, so check it when the new screens arrive. The bar counts current step divided by 5 |
| 1. Contract type | 4 cards (CLT, PJ, Freelancer, Consultor). A click advances | 2 cards (CLT and PJ), same behavior |
| 2. Name | "Qual o nome do novo colaborador?", large field, green check when filled. Continuar is disabled until there is a name | Same |
| 3. Cargo | Cargo and Time on one screen, with search, quick create of cargo and time, and suggestion chips. Could be skipped | Cargo only, as free text with suggestions from cargos in use, no quick create. Time moves to Phase 2 |
| 4. Informações (CLT) | Data de admissão ("Hoje" and "Próxima segunda" pills plus a calendar), e-mail, reporta para, salário bruto, custo para empresa, photo. All optional | Data de admissão (same pills), CPF, data de nascimento, salário bruto, custo para empresa and telefone de contato. E-mail, reporta para and bank data move to Phase 2, and the photo is gone. There is no jornada field |
| 5. Contract (new) | Did not exist. The last step ("Criar colaborador") saved the person already active | Confirm the contact that receives the contract and generate it (simulated). The phone comes prefilled and editable. "Gerar contrato e enviar" waits 1 to 2 seconds, shows the toast and returns to the table |
| After | The person entered the table with no status | Enters as Pendente 3/3, with the toast "Colaborador criado com sucesso" |
| Voltar and X | Voltar goes back one step and keeps the data. The X opens the "Descartar edições." modal | Same |

**Rules for the contract.** CPF, data de admissão, salário bruto and telefone are required to generate it, and nothing blocks Continuar in Informações. "Gerar contrato e enviar" is active only when those four are filled. Otherwise the user can create the collaborator without generating the contract. The CPF field applies a mask and validates only the digit count (11), accepting any digits.

**Open points:**

- Status of a collaborator created without a contract. Suggested: Pendente 3/3, with "contrato assinado" still open. Not confirmed.
- The flow header changed in Figma. Check it against the new screens when the links arrive.

## Topic 6: Create collaborator, PJ, Phase 1

The PJ flow uses the same shell and steps as the CLT flow, and differs in the Informações step. Freelancer and Consultor no longer have their own paths: a PJ is fixed or temporary depending only on the contract end date.

| Step | Before | Now |
| --- | --- | --- |
| 1. Type | PJ was one of 4 cards. Freelancer and Consultor had their own paths | PJ is one of 2 cards. Fixed or temporary is defined only by the contract end date |
| 2. Name | Same as CLT | Same |
| 3. Cargo | Cargo and Time on one screen, with quick create | Cargo only, as free text with suggestions. Time moves to Phase 2 |
| 4. Informações | PJ fixo: data de admissão, e-mail, reporta para, salário, photo. Freelancer and Consultor: start date, end date ("Não especificar" plus a calendar), e-mail, reporta para, payment (Mensal, Anual, Valor fixo), contract value with a "/mês" or "/ano" suffix, photo | One path: CNPJ, razão social, data de início do contrato, data de fim do contrato (optional), pagamento with valor do contrato, and telefone de contato. E-mail, reporta para and bank data move to Phase 2, and the photo is gone |
| 5. Contract | Did not exist | Same as CLT: confirm the phone, "Gerar contrato e enviar" (simulated) and the toast |
| After | Entered with no status | Enters as Pendente 1/1, because PJ has 1 checklist item (contract signed) |

PJ has no CPF, data de nascimento, salário bruto, custo para empresa or jornada. The "Custo total" of a PJ is the contract value plus the recursos.

### Informações fields (PJ)

| Field | Behavior |
| --- | --- |
| CNPJ | Mask, 14 digits |
| Razão social | Text |
| Data de início do contrato | "Hoje" and "Próxima segunda" pills plus a calendar. The CLT label is "Data de admissão" |
| Data de fim do contrato | Starts with an unselected "Não especificar" pill. Picking a date in the calendar replaces the pill. Reopening the calendar lets the user change the date or check "Não especificar data de fim". Without an end date the PJ is fixed, and with one it is temporary |
| Pagamento | Mensal (default), Anual or Valor fixo |
| Valor do contrato | Currency. Suffix "/mês" for Mensal, "/ano" for Anual, none for Valor fixo |
| Telefone de contato | Phone, prefilled in the contract step |

**Rules.** CNPJ, razão social, data de início, valor do contrato and telefone are required to generate the contract. "Gerar contrato e enviar" is active only when they are filled, and otherwise the user can create the collaborator without generating the contract. Nothing blocks Continuar in Informações.

CPF and CNPJ fields apply a mask and validate only the digit count (CPF 11, CNPJ 14). Any digits are accepted, with no checksum check.

**Open point:** the status of a PJ created without a contract. Suggested: Pendente 1/1, the same open point as the CLT flow.

## Topic 7: Create team flow

The flow keeps its 4 steps, and a collaborator can now belong to more than one team. Titles and layouts of the steps changed slightly in Figma, so check each screen when the links arrive.

| Element | Before | Now |
| --- | --- | --- |
| Entry from Novo | Novo > Time opens the flow blank | Same |
| Entry from a pending card | "Criar time" opens at step 2 (color and icon), with the name set and the team's current members already selected | Same |
| Shell | Full screen like the collaborator flow: gradient, "Novo Time" header with X, footer with a progress bar (current step divided by 4) | Same. The header changed in Figma, so check it |
| 1. Nome | "Qual será o nome do time?", large field, green check. Continuar is disabled until there is a name | Same |
| 2. Cor e ícone | Title with the name in #e9a716. Cor: light and dark pair, with a picker of 6 colors (one per family, always the first not used by another team). Ícone: pill that opens a picker with search and categories. Color and icon come prefilled, so Continuar is always active | Same. The title is corrected to "Muito bem, hora de definir a cor e o ícone de {Nome}." |
| 3. Quem faz parte | Search among existing people only (no creating) and a 2x3 grid of 6 suggestions with name, cargo and checkbox. A marked person moves to the first slot and pushes the others, until the 6 slots are marked, then the list grows. Optional | Search only, with no suggestions. The layout comes from the new Figma screen |
| 4. Informações adicionais | Líder do time (any collaborator, who becomes a member automatically) and Descrição (text modal). Optional. Button "Criar time" | Same |
| On finish | Saves name, color, icon, members, leader and description. Sets the Time of each member (one team per person), shows the toast "Time criado com sucesso" and returns to the Times tab. A pending team stops being pending | Same, but the team is added to each member's teams without removing the others |
| Voltar and X | Voltar goes back one step and keeps the data. The X opens "Descartar edições." Leaving a pending team does not delete the draft | Same. Voltar on step 1 closes the flow with no modal |

**Who can be a member or leader.** Only Pendente and Em atividade collaborators appear in steps 3 and 4. People in Rescisão pendente, Desligado or Fim de contrato are left out, because their profile is locked and they stop counting in the team.

The quick creation of a team by typing a new name in the Time field belongs to the collaborator page topic, still to be filled in.

**Confirmed.** Because a person can be in several teams:

- The Time column and the grid card show the first team plus "+N" when there are more.
- The Time filter matches a collaborator when any of their teams is selected.
- "N pessoas" counts a person in every team they belong to.
- The Time field in "Completar cadastro" and in the profile accepts several teams.
- A recurso reaching a person through two teams is counted once.

## Topic 8: Create recurso flow

The flow gains a first step with the 3 types of recurso. The Benefício path keeps what was designed, and the Verba and Licença paths are new. The Figma screens for Verba and Licença come later, so do not build their visuals without the links.

| Element | Before | Now |
| --- | --- | --- |
| Entry | Novo > Benefício opens the flow | Novo > Recurso opens the flow |
| Shell | Full screen: gradient, "Novo Benefício" header with X, footer with a progress bar and Voltar and Continuar. The X opens "Descartar edições." | Same, with the header "Novo Recurso" |
| Type of recurso | Did not exist. Step 1 was already the category | New first step with 3 cards: Benefício, Verba and Licença. A click advances |
| Beneficiaries | Search by person, team, cargo or whole company. Suggestions: "Toda a empresa" and up to 3 teams. "Toda a empresa" is exclusive. Live link, optional | Same, without cargo. Only Pendente and Em atividade collaborators appear |
| Value | One value applies to everyone. "Adicionar variante de valor" adds another, with "Atribuir" (with a count), a trash button and the counter "x/y atribuídos". The Atribuir panel lists the people, and anyone already in another variant shows a green check at the end. When everyone is assigned the button becomes "Alterar", and Continuar only unlocks then | Same |
| Final button | "Criar benefício" | "Criar recurso" in the 3 paths |
| On finish | Back to the Benefícios tab with the toast "Benefício criado com sucesso" | Back to the Recursos tab with the toast "Recurso criado com sucesso" |

### Paths and steps

| Path | Steps |
| --- | --- |
| Benefício (6 steps) | 1. Tipo. 2. Categoria: 6 cards and "Outro", a click advances. 3. Fornecedor: search and a 2x2 grid of suggestions, single choice, with the option to type a new one, required. 4. Beneficiários. 5. Valor, "por pessoa". 6. Informações adicionais: link, supplier contact and supplier e-mail, edited in the row. Titles carry the category name in #e9a716 |
| Verba (5 steps) | 1. Tipo. 2. Nome: "Para que é essa verba?". 3. Beneficiários. 4. Valor por pessoa, with variants. 5. Informações: Link and Descrição. No supplier fields |
| Licença (5 steps) | 1. Tipo. 2. Serviço: Google Workspace, Microsoft 365, Figma, Slack, Notion, Adobe Creative Cloud and "Outro". 3. Beneficiários. 4. "Valor por assento", with variants. 5. Informações: Link de acesso ou painel admin, and Data de renovação. The chosen service is the supplier, so there is no supplier step |

**"Outro".** In the Benefício category step and in the Licença service step, "Outro" asks only for the name of the recurso, in place of the supplier or service choice, and the flow continues.

### Supplier suggestions (Benefício)

No logos for now. Each suggestion uses the category icon.

| Category | Suggestions |
| --- | --- |
| Plano de Saúde | Alice, Amil, SulAmérica, Bradesco Saúde, Hapvida NotreDame Intermédica, Unimed, Porto Seguro Saúde |
| Vale Transporte | Bilhete Único, Uber, 99, VEM |
| Vale Alimentação | Caju, VR, Ticket, Alelo, Swile, Pluxee |
| Bem-Estar | Wellhub, TotalPass, SmartFit |
| Plano Odontológico | Odontoprev, Amil Dental, SulAmérica Odonto, Bradesco Dental, Uniodonto |
| Seguro de Vida | Porto Seguro Vida, Bradesco Vida e Previdência, MetLife, Prudential, SulAmérica Vida |

The value rules are the same in all paths: one value applies to everyone, and with 2 or more variants each person belongs to exactly one. Desligado and Fim de contrato collaborators stop counting as beneficiaries from their exit date.

## Topic 9: Collaborator page

The three detail pages (collaborator, team and recurso) share one shell that did not change: a side panel with a slide animation, full screen through the expand icon, and full screen when opened by link. The collaborator page changes in its header actions, fields, metrics and locking.

| Element | Before | Now |
| --- | --- | --- |
| Header | Close, Delete, Desligar (toggled with a confirmation) and Expand | Same four icons. Desligar opens the "Desligar {Nome}?" modal, which starts the offboarding flow (CLT or PJ), and Reativar is removed |
| Profile header | Generic avatar, name and a tag (Freelancer, Consultor or Desligado) | Changed. Check the Figma link for how status and type appear |
| Pipo bar | "Peça ao Pipo para Resumir perfil, Redigir mensagem ou Comparar cargo", static | Same |
| Fields, Fixo | E-mail, Cargo, Time, Reporta para, Ativo desde, Salário | **CLT:** E-mail, Cargo, Time(s), Reporta para, Ativo desde, CPF, Data de nascimento, Telefone, Salário bruto, Custo para empresa, Jornada (mocked, read-only), Dados bancários |
| Fields, Freelancer and Consultor | E-mail, Cargo, Time, Reporta para, Início and Fim do contrato, Salário with the payment suffix | **PJ:** E-mail, Cargo, Time(s), Reporta para, CNPJ, Razão social, Telefone, Início and Fim do contrato, Pagamento and Valor do contrato, Dados bancários |
| Editing | Gray hover and a click to edit. E-mail and Salário are text (Enter saves). Cargo had search and creation. Time was a single team. Reporta para has search. Dates have a calendar | Same, except: Cargo is free text with suggestions and no creating. Time accepts several teams, shown as pills. The new fields follow the same patterns. Dados bancários is one row that lets the user choose PIX (key type and key) or bank account (bank, agency, type and number) |
| Notes | "Adicionar nota" in the row, Enter saves with the date | Same |
| Metrics | Custo total (salary plus benefits, with an eye) and Tempo de casa | Custo total = custo para empresa (CLT) or valor do contrato (PJ), plus the recursos the person receives. A recurso reaching the person through more than one link counts once. Salário bruto, Custo para empresa and Valor do contrato are hidden by default, each with its own eye. Tempo de casa is the same |
| Benefícios | List of benefits with the person's value | "Recursos" section: benefits, verbas and licenças |
| Checklist and alert | Did not exist | While Pendente or Rescisão pendente, the profile shows the checklist read-only, with no marking. The alert for an incomplete registration opens the page, where the missing fields (time, reporta para, e-mail, benefits for CLT, bank data) are completed |
| Locked fields | Desligado locked every field | Rescisão pendente, Desligado and Fim de contrato lock every field |

## Topic 10: Team page

The team page keeps its structure. What changes is the member rules, because a collaborator can belong to several teams, and the cost, which now follows the contract types.

| Element | Before | Now |
| --- | --- | --- |
| Header and profile | Close, Delete and Expand. Icon in the team color and the name. Only complete teams open | Same |
| Info | Líder, Cor, Ícone and Descrição (2 lines and "ver mais..."), plus "Adicionar nota". Cor and Ícone open the pickers | Same |
| Metrics | Total de membros, Tempo médio de casa, Custo total do time (with an eye), Cargos representados and Tipo de contratação (bar of Fixo, Freelancer and Consultor) | Same, with the bar only for CLT and PJ. The cost sums custo para empresa (CLT) or valor do contrato (PJ) plus the members' recursos |
| Members | "Add membro" (search among people not in the team) and rows with an avatar in the team color, name, cargo and an X with a confirmation. Adding replaced the person's team | Adding adds this team to the person's teams and keeps the others. Removing takes out only this team. The list includes Pendente, Em atividade and Rescisão pendente, and Desligado and Fim de contrato leave it. "Add membro" offers only Pendente and Em atividade |
| Benefícios | Aggregated list with the value range | "Recursos" section, with the value range |
| Delete | Confirmation, and the members became teamless | Confirmation, and the members lose only this team |

**Cost rule.** A person in two teams counts the full cost in both. Duplicated items count once: a recurso that reaches the same person through more than one link, for example the whole company plus a team, counts once for that person.

## Topic 11: Recurso page

The Benefício page becomes the Recurso page, and the three types (Benefício, Verba and Licença) share it. The info fields change per type, and cargo is no longer a link source.

| Element | Before | Now |
| --- | --- | --- |
| Route and name | #/beneficio/:id | #/recurso/:id |
| Profile | Logo or icon, supplier name, and the type in gray (for example "Alice" and "Plano de Saúde") | Same. Verba: the name and "Verba". Licença: the service and "Licença" |
| Info | Fornecedor, Link, Contato and E-mail. Link and Contato have a copy icon. Read-only, with "-" when empty | Benefício: same. Verba: Link and Descrição. Licença: Link de acesso and Data de renovação. Still read-only, with "—" when empty, the platform's empty-value symbol |
| Metrics | Total de beneficiários, Custo total (with an eye), list of Valores with a count, and Por time (bar) | Same. The value is "por pessoa", or "por assento" for licenças |
| Times and individual members | "Add time" and "Add membro", each with a value. Rows with icon or avatar, name, value and an X | Same |
| Whole company | Own row, with value and removal, when it is a link | Same |
| Cargo | Was a link source | Gone |
| Who counts | Any collaborator of the link | Desligado and Fim de contrato stop counting from their exit date |

**Open point** (suggested, not confirmed): "Add time" and "Add membro" on this page offer only Pendente and Em atividade collaborators, as in the creation flow.

## Topic 12: Offboarding (CLT and PJ)

Offboarding becomes a 3-step flow started from the "Desligar {Nome}?" modal. The collaborator only becomes Desligado (CLT) or Fim de contrato (PJ) after a checklist is completed. Titles and layouts come from the Figma screens.

| Element | Before | Now |
| --- | --- | --- |
| Entry | Desligar icon on the profile and the "Desligar" item in the 3-dot menu | Same two entries |
| Confirmation | Modal "Desligar {Nome}?", explaining that the fields become locked | The modal stays and is the trigger that starts the flow |
| Effect | Marked the collaborator as Desligado at once, with a red pill, and locked the fields | A 3-step flow, and only after it the collaborator becomes Rescisão pendente |
| Revert | The icon or the item "Reativar" undid it | Does not exist |
| After the flow | Row with the Desligado pill | Pill "Rescisão pendente X/Y", the offboarding icon and locked fields, with the checklist read-only on the profile |
| End | Desligado, locked | A completed checklist becomes Desligado (CLT) or Fim de contrato (PJ), locked for good |

### Steps by type

| Step | CLT | PJ |
| --- | --- | --- |
| 1. Tipo de rescisão | 5 cards: Sem justa causa, Com justa causa, Pedido de demissão, Acordo entre as partes, Fim de contrato de experiência. Icons come from Figma (the suggestion was FileX, ShieldWarning, DoorOpen, Handshake, HourglassSimple) | 4 cards: Fim de contrato, Rescisão antecipada pela empresa, Rescisão antecipada pelo prestador, Acordo entre as partes. Icons come from Figma |
| 2. Informações | Data do desligamento (required), Aviso prévio (Trabalhado, Indenizado or Não se aplica, hidden for Com justa causa) and Motivo (optional) | Data do desligamento (required) and Motivo (optional). No penalty field |
| 3. Termo | "Gerar termo de rescisão", confirm the contact, button "Gerar termo e enviar" | "Gerar termo de encerramento", same mechanics |

Starting copy, to check against Figma: step 1 "Qual o tipo de rescisão?", step 2 "Informações do desligamento de {Nome}", step 3 "Confirme o contato para envio do termo".

**Rules.** In step 2, Continuar is disabled until the date is set. In step 3, the phone comes prefilled and editable, the button waits 1 to 2 seconds, the toast "Desligamento iniciado com sucesso" appears and the flow returns to the table.

### Checklist after the flow

The CLT items are: TRCT, FGTS withdrawal guide, unemployment insurance request, FGTS statement, dismissal exam and signed termination. Which ones apply depends on the type, so the counter changes. Have a labor-law professional review these rules before production.

| Tipo de rescisão (CLT) | Items | Initial counter |
| --- | --- | --- |
| Sem justa causa | 6 | 6/6 |
| Fim de contrato de experiência | 6 | 6/6 |
| Acordo entre as partes | 5 (no unemployment insurance request) | 5/5 |
| Pedido de demissão | 4 (no unemployment insurance request, no FGTS withdrawal guide) | 4/4 |
| Com justa causa | 4 (no unemployment insurance request, no FGTS withdrawal guide) | 4/4 |

The PJ checklist always has 3 items: termination document sent, signed document returned and last invoice. The counter starts at 3/3.

Fields lock only after the term is generated. Until the exit date the person still counts in teams and recursos. Checklist items have no screen to mark them, as in Topic 1.

**Open point** (suggested, not confirmed): hide the Desligar item and icon when the status is Rescisão pendente, Desligado or Fim de contrato.

## Topic 13: Confirmations and toasts

Confirmations share one modal shell and toasts share one component. The Desligar text changes because it now starts the offboarding flow, and the Excluir time text follows the multiple-team rule.

### Confirmation modals

Shell: centered, 568px wide, a round X above the card, an icon badge of 40x40 in #fbedd0, title 32px, text 16px in #798282, and the buttons Cancelar and the confirm one (black). The confirm labels are "Excluir", "Desligar" and "Descartar".

| Modal | Before | Now |
| --- | --- | --- |
| Excluir colaborador | "Tem certeza que quer excluir o colaborador {Nome}? Essa ação não pode ser desfeita. Se preferir, você pode desligá-lo e mantê-lo na sua lista de colaboradores." | Same |
| Excluir vários | "Excluir {N} colaboradores?", without the suggestion to offboard | Same |
| Excluir time | "...Os colaboradores desse time ficarão sem time atribuído." | "Tem certeza que quer excluir o time {Nome}? Essa ação não pode ser desfeita. Os colaboradores deixam de fazer parte deste time e continuam nos outros, se houver." |
| Excluir recurso | "Tem certeza que quer excluir o benefício {Nome}? Essa ação não pode ser desfeita." | Same, with "recurso" |
| Desligar | "Tem certeza que quer desligar o colaborador {Nome}? Os campos ficarão bloqueados para edição, mas você continuará vendo o perfil. Essa ação não pode ser desfeita." It marked Desligado at once | "Tem certeza que quer desligar o colaborador {Nome}? Você vai escolher o tipo de rescisão e gerar o termo. Depois de gerado, os campos ficam bloqueados." It starts the offboarding flow |
| Descartar edições | Title "Descartar edições." and "Tem certeza que deseja descartar? Ao sair, todo o progresso será perdido. Nenhuma informação será salva." Opens from the X of the creation flows, never from Voltar | Same, and it also applies to the offboarding flow |
| Remover membro do time | Small modal asking for confirmation | Same, and it takes out only that team |

### Toasts

Toasts sit at the bottom right (24px from the bottom, 20px from the right), with radius 8px and padding 12px. They disappear after 5 seconds, stack vertically, slide in from the right, and leave with a "flick": a squash and then a fly-out to the right, in under 400ms.

| Toast | Before | Now |
| --- | --- | --- |
| Positive (green #60c60c, circle #c8ff9b with a check, white text) | Creation of collaborator, team and benefício, and "Duplicado com sucesso" | "Colaborador criado com sucesso", "Time criado com sucesso" and "Recurso criado com sucesso". "Duplicado" is gone, because Duplicar left the selection bar |
| Neutral (#f4f5f5, circle #e3e6e6 with a trash icon, black text) | "Excluído com sucesso" for collaborator, team and benefício | Same, with "Recurso excluído com sucesso" |
| Offboarding | Did not exist | "Desligamento iniciado com sucesso", in the positive style |
| Add em time | Did not exist | Positive toast: "{N} colaboradores adicionados ao time {Time}" |
| No toast | Not defined | Inline edits on the profile, saved filters and removing a member show no toast |

## Topic 14: Visual standards

The standards below apply to every screen. They did not change, except the status pills, which gain new values. New elements from the Figma screens (profile pills for status and type, alert icon) are added when the links arrive. The homepage elements are already in.

| Standard | Value | Changes now |
| --- | --- | --- |
| Hover | Background #f4f5f5, no shadow. Exceptions: Novo cards (#e3e6e6 and wiggling stickers), filter pills (#e3e6e6) and tabs (black text, no underline) | No |
| Borders | 1px solid #e3e6e6 everywhere | No |
| Secondary text | #798282 | No |
| Title highlight | #e9a716 | Already registered |
| Overlay | rgba(227,230,230,0.6) with blur | No |
| Typography | Inter. Page title 24px Medium. Step title 32px with -1px letter-spacing. Buttons 14px Medium. Table header 12px in a 48px bar, rows 64px | No |
| Large input | 24px Regular, #798282 when empty and black when filled | No |
| Buttons | 40px high, 16px on the sides, 24px icon after the text | No |
| Panels | Slide in from the right, 20px from the top and 24px from the side. The exit is the same animation reversed. The scrollbar shows only on scroll or hover, 4px from the edge | No |
| Checkbox | Square, and CheckSquare.svg when checked | No |
| Floating bar | 24px from the bottom, 64px high | No |
| Team colors | 36 colors: 6 families of 6 shades, with no repeats between teams | No |
| Status pills | Rounded, 12px Medium. Green rgba(1,180,108,0.1) with #60c60c. Blue rgba(0,145,255,0.1) with #0091ff. Yellow rgba(209,170,66,0.1) with #eac764 (accent/yellow). Red rgba(255,38,51,0.1) with #ff2633. Gray #e3e6e6 with #798282 | Yes: Pendente and Rescisão pendente are yellow (from Figma, replacing the old orange #fff3e9 and #ff9230), Em atividade green, Desligado red and Fim de contrato gray. On hover, Pendente and Rescisão pendente get a border in their own color |
| Empty value | "—", the only em dash allowed in the interface | Yes |
| Absence badge and tooltip | Round blue badge with the icon. Black tooltip above it, with a pointer. Values from Figma `10331:4148` | Yes |
| Checklist popover | White popover below the pill, 36px items. Values from Figma `10331:3724` | Yes |
| Faded row | Text in #b2b9b9, for Desligado and Fim de contrato. The checkbox stays the same Square.svg (#c2c8c8) as other rows | Yes |

## Remaining work

All planned topics are written. What is left depends on the Figma links and on decisions marked as open in the topics above.

- [ ] Collaborator page: how "Completar cadastro" works there (time, reporta para, e-mail, benefits for CLT, bank data) and whether typing a new team creates a pending team
- [x] Figma for the homepage adjustments (`10331:4871`)
- [ ] Figma links: flow headers, profile pills for status and type, offboarding screens and icons, create-team step 3, and the Verba and Licença screens
- [ ] Homepage elements not designed yet: alert icon for an incomplete registration, "+N" for several teams, Rescisão pendente and Fim de contrato rows, offboarding icon, and tooltips for licença médica, maternidade and paternidade
- [ ] Confirm the Rescisão pendente checklist labels in Portuguese
- [ ] Remove the temporary bridges as Topics 5, 6, 9 and 12 are done (see Implementation status)
- [ ] Table padding through an opt-in prop in `@squad/ui`, tab height and the "Ver mais..." style in Filtros
- [ ] Add this document to git, so it is versioned with the code
- [ ] Open points marked in the topics (floating search, Time filter, Recurso page, Desligar menu item)
