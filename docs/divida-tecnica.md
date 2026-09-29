# Dívida técnica — squad-modulos

Registro do que ficou pendente na montagem do monorepo. Itens marcados
**[herdado]** já existiam no projeto original e foram preservados de propósito,
porque esta etapa exigia fidelidade visual e comportamental. **[novo]** é dívida
criada pela própria migração.

---

## 1. Storage síncrono vs. API futura — **[herdado]** · impacto alto

`packages/modulo-gestao-pessoas/src/utils/storage.js` é a única camada de dados
do módulo, e é **inteiramente síncrona**. Não há `fetch`, `axios`, cliente
GraphQL nem qualquer chamada de rede em todo o módulo.

O problema não é trocar a implementação — é que a UI depende da sincronicidade.
Em `pages/Home.jsx`, três coleções são lidas **no corpo do render**:

```js
const times = getCollection(COLLECTIONS.TIMES)
const cargos = getCollection(COLLECTIONS.CARGOS)
const beneficios = getCollection(COLLECTIONS.BENEFICIOS)
```

Isso é deliberado (há comentário no código explicando): um modal aninhado pode
criar um time no meio de outro fluxo, e a aba precisa refletir isso sem evento
nem subscription.

Consequência: **trocar `localStorage` por API não é um swap de implementação.**
Exige tornar assíncronos todos os pontos de leitura e introduzir estados de
carregamento e de erro que hoje **não existem em lugar nenhum** do módulo —
nenhum spinner, nenhum empty state de falha, nenhum retry. É o maior item de
trabalho não-óbvio do módulo.

Quando for feito, vale aproveitar para revisar dois pontos relacionados:

- Colaborador referencia time e cargo **por nome (string)**, não por id. Por isso
  renomear um time obriga a varrer todos os colaboradores (ver `NovoTimeFlow.handleSave`).
- A sincronização entre componentes é feita por callback manual `onDataChanged`,
  propagado à mão até a `Home`.

## 2. Os dois "medium": 510 vs. 500 — **[herdado]** · impacto baixo, pegadinha alta

`--font-weight-medium` vale **510** em `packages/ui/src/tokens.css`. É o valor do
projeto original (510 é o peso "Medium" do SF Pro, de onde o design veio) e **58
regras dependem dele**.

Só que existem ainda **17 ocorrências de `font-weight: 500` hardcoded** no CSS
do módulo e do `packages/ui`. Ou seja: convivem dois "medium" com 10 unidades de
diferença.

Eram 9 na migração inicial. A sincronização final com o repositório de origem
(`ef20e86` → `c8b28e3`) **acrescentou mais 8** — os commits de tipografia
escreveram `font-weight: 500` direto, em vez do token: `PageHeader.css` (2),
`CollaboratorsTable.css`, `CargosTable.css` e as 4 toolbars. Ou seja, a dívida
cresceu junto com a sincronização, e agora não há mais upstream de onde ela possa
voltar a crescer.

Foi mantido exatamente como estava, por instrução explícita — normalizar na hora
mudaria pixels e contaminaria a comparação com o original. **Agora que o módulo é
a fonte da verdade e não há mais sincronização pendente, este é um bom momento
para normalizar**: decidir entre 500 e 510, aplicar em todos os pontos e conferir
a diferença visual uma vez só.

### ⚠️ Medição: o `510` não existe na fonte, e resolve para **600**

`@fontsource/inter` entrega **pesos estáticos** (100…900 de cem em cem) — não há
arquivo de peso 510, e o `apps/web` carrega só 400, 500, 600 e 700.

Pelo algoritmo de font matching do CSS, um peso desejado **acima de 500** procura
primeiro para cima. Com 400/500/600/700 disponíveis, **510 cai em 600**.

Medido no navegador, largura do mesmo texto em Inter 16px:

| peso pedido | largura renderizada |
|---|---|
| 400 | 261,22px |
| 500 | 263,39px |
| **510** | **265,55px** |
| 600 | **265,55px** |

E no `.page-header__title` real do Gestão de Pessoas: `510` → 221,28px, idêntico
a `600` → 221,28px, e diferente de `500` → 219,59px.

**Consequência:** hoje, no Gestão de Pessoas, toda regra que usa
`--font-weight-medium` renderiza em **semibold 600** — o mesmo que
`--font-weight-semibold`. A distinção entre "medium" e "semibold" que o token
sugere **não existe na tela**. As 17 ocorrências de `font-weight: 500` hardcoded
são, ironicamente, as únicas que de fato renderizam em medium.

Isso reforça a escolha do Pesquisa de Clima (`--peso-medio: 500`), que é o
mapeamento documentado no `CLAUDE.md` daquele projeto e o que realmente produz
medium com esta fonte.

**Decisão em aberto, aguardando o time.** Trocar `--font-weight-medium` de 510
para 500 no Gestão de Pessoas muda pixel em dezenas de telas (texto ficaria mais
leve do que está hoje). As opções:

1. **510 → 500** no `ui`. Alinha os dois módulos, e o resultado passa a ser o
   medium de verdade. Muda a aparência atual do GP.
2. **Carregar um peso 510 real**, trocando `@fontsource/inter` por
   `@fontsource-variable/inter`. Aí o 510 passa a existir e nada mais precisa
   mudar de valor — mas muda o arquivo de fonte servido nos dois módulos.
3. **Assumir o 600**: trocar `--font-weight-medium` para 600 e admitir que
   sempre foi isso. Zero mudança visual, mas o token perde o nome.

Até decidir, o GP fica em 510 e o clima em 500.

**Cuidado ao normalizar:** a camada `theme` do Tailwind v4 também define
`--font-weight-medium`, com valor **500**. Hoje o nosso 510 vence porque
`tokens.css` é importado **fora** de qualquer `@layer` (estilos sem layer vencem
os que estão em layer). Se alguém mover esse import para dentro de um `@layer`,
o módulo inteiro silenciosamente passa de 510 para 500. Há um comentário
avisando disso em `apps/web/src/index.css` — vale manter.

Onde estão os 9 hardcoded:

```bash
grep -rn "font-weight: 500" packages/modulo-gestao-pessoas/src
```

## 3. Ausência total de testes — **[herdado]** · impacto alto

Não há runner, nem arquivo de teste, nem script `test` — nem nos projetos de
origem, nem aqui. O Pesquisa de Clima entrou com mais ~17.100 linhas sem um
único teste, e sem sequer um linter no projeto de origem (daí as 27 advertências
novas do oxlint, todas herdadas). A migração inteira foi validada por **comparação visual pixel a pixel**
contra o original rodando em paralelo (ver `docs/diferencas-gestao-de-pessoas.md`),
que é uma rede de segurança de uma vez só: some no momento em que o projeto
original deixar de existir ou divergir.

Antes de mexer na lógica do módulo, vale ter pelo menos:

- testes de unidade para `utils/` (`formatters`, `beneficiarios`, `storage`, incluindo `migrateLegacyKeys`);
- um teste de fumaça por fluxo (colaborador, time, cargo, benefício);
- idealmente, um teste de regressão visual que substitua a comparação manual.

## 4. Componentes ambíguos movidos para `@squad/ui` — **[novo]** · impacto médio

O critério de extração foi mecânico: **o que era importado de fora de
`addCollaborator/` virou pacote compartilhado.** Foram 42 imports cruzando
pastas no original. O que só era usado dentro do fluxo de colaborador ficou no
módulo.

Isso resolve o acoplamento, mas deixa três incômodos:

### 4.1 CSS compartilhado sem componente correspondente

`Step1BasicInfo.css` e `Step2AdditionalInfo.css` foram para `packages/ui/src/styles/`
porque steps de **time, cargo e benefício** os importavam. Mas
`Step1BasicInfo.jsx` e `Step2AdditionalInfo.jsx` continuam no módulo, já que só
o fluxo de colaborador os usa.

Resultado: o módulo tem um componente que importa o próprio CSS de dentro do
pacote de UI. É honesto quanto à realidade do acoplamento, mas confuso de ler.
A classe `.step1` virou layout compartilhado e a `.step2__row` virou "linha de
campo" compartilhada — os dois deveriam ganhar nome próprio e componente próprio
(`WizardStepLayout`, `FieldRow`), em vez de seguirem batizados pelo primeiro
lugar onde apareceram.

### 4.2 `IconButton` foi junto sem ser de `addCollaborator/`

`IconButton` morava em `components/`, não em `addCollaborator/`. Foi para
`packages/ui` porque `WizardShell` e `FieldModalShell` dependem dele — sem isso
o pacote não fecharia. É usado 17 vezes no total. A decisão está certa, mas foge
do critério declarado e por isso fica registrada aqui.

### 4.3 Pares a unificar com o Pesquisa de Clima — **[novo]** · impacto médio

A entrada do segundo módulo mostrou que **os dois implementam o mesmo design
system duas vezes**, com mecânicas diferentes (BEM global + tokens em inglês no
GP; CSS Modules + tokens em português no clima). Não é suposição: os comentários
do código do clima dizem, em três lugares, que o componente é porte manual do GP.

Nesta etapa a decisão foi **duplicar** — portar exigiria reescrever a casca das 7
telas do fluxo contra uma API diferente, sem original para comparar pixel a
pixel. Os pares mapeados, para quando for a hora (tabela completa em
`docs/modulo-pesquisa-clima.md`):

| Clima | `@squad/ui` | Distância |
|---|---|---|
| `FluxoLayout`+`CabecalhoFluxo`+`RodapeFluxo` | `WizardShell` | quase idêntico (96px/80px/trilha 8px batem) |
| `ModalFluxo` | `ModalOverlay`+`FieldModalShell` | quase idêntico (532/24/16/gap 40 batem) |
| `ModalConfirmar` | `DiscardConfirmModal` | clima é superset |
| `Botao` (marca) | `.pill-button` | padding 12/16 vs 12/20 |
| `Botao` (texto) | `.text-button` | tamanhos diferentes |
| `Botao` (contorno) | — | só no clima |
| `IconeBotao` | `IconButton` | falta hover/modificador no clima |
| `Sidebar`, `BottomSearchBar`, `BarraSelecao`/`BulkActionBar` | — | **duplicados nos dois módulos**, nenhum no `ui` |
| `useModal` | — | **só no clima, e melhor**: foco preso, Esc, clique fora, trava de scroll. Os modais do GP não têm nada disso — candidato a subir do clima para o `ui`. |

O caminho de menor risco é começar pelos três que hoje estão duplicados e em
lugar nenhum (`Sidebar`, `BottomSearchBar`, barra de seleção) e pelo `useModal`,
que é ganho puro para o GP.

### 4.4-bis Props de compatibilidade no `@squad/ui` — **[novo]** · impacto baixo

A etapa 0 unificou `BottomSearchBar` e `BarraSelecao`, mas três props existem
**só para manter os módulos pixel-idênticos enquanto os tokens estão
bifurcados**. Elas não são desenho: são dívida com nome.

| Prop | Quem passa | Por quê | Some quando |
|---|---|---|---|
| `corPlaceholder` | Gestão de Pessoas | o compartilhado usa `--cor-texto-secundario` (#6a7272, WCAG do clima); o GP usa `--color-text-secondary` (#798282) | a paleta WCAG for propagada (item 4.4) |
| `pesoContagem` | Gestão de Pessoas | o compartilhado usa `--peso-medio` (500); o GP usa `--font-weight-medium` (510) | os dois "medium" forem unificados (item 2) |
| `corPilulaFundo` / `corPilulaTexto` | Fluxo de Caixa | a pílula do assistente é "Fin" `#d0effb`/`#04232f` ali e "Pipo" `#fbedd0`/`#5d4309` nos outros | nunca — esta é legítima, são assistentes diferentes |

As duas primeiras são temporárias e devem sair junto com os itens 2 e 4.4. A
terceira fica: assistentes diferentes com identidade própria é parametrização
de verdade, não contorno.

### 4.5 CSS do `ModalConfirmar` duplicado — **[novo]** · impacto baixo

O `ModalConfirmar` importava 7 classes de
`modulo-pesquisa-clima/src/pages/nova-pesquisa/Editor.module.css`. Ao subir para
o `ui` as 7 regras foram **copiadas na letra** para
`ui/components/fluxo/ModalConfirmar.module.css`, porque aquele arquivo continua
no clima (as telas de editor usam outras classes dele).

São duas cópias das mesmas regras. Se o desenho do modal mudar, os dois lugares
precisam mudar juntos. O certo é o clima passar a importar do `ui` também —
trabalho pequeno, mas mexe nas telas de editor e por isso ficou de fora da etapa 0.

### 4.4 Paleta WCAG do clima deve propagar para o GP — **[novo]** · impacto médio

O Pesquisa de Clima escureceu cinco cores para passar no WCAG AA e documentou as
razões de contraste linha a linha. O Gestão de Pessoas ainda usa as originais,
três delas hardcoded (`#798282`, `#0091ff`, `#ff2633`).

| Papel | GP hoje | Clima | Contraste antes → depois |
|---|---|---|---|
| texto secundário | `#798282` | `#6a7272` | 3.61 → 4.51 |
| texto tênue | `#9ba4a4` | `#6d7878` | 2.55 → 4.56 |
| azul | `#0091ff` | `#006bbc` | 2.71 → 4.51 |
| vermelho | `#ff2633` | `#d0000c` | 3.05 → 4.51 |
| laranja | `#ff9230` | `#b45500` | 2.05 → 4.54 |

**Plano acordado:** a paleta do clima vira o padrão do monorepo, **em tarefa
separada**. O trabalho é: mover as 5 cores para `packages/ui/src/tokens.css`,
apontar os aliases do clima para elas, substituir os hardcoded do GP pelos tokens
e conferir o resultado tela a tela. O laranja é o que mais muda de aparência —
escurecido o bastante para passar, ele se aproxima do marrom, e vale confirmar
com o design antes.

Até lá os dois convivem: nenhuma cor colide por nome, só por papel.

### 4.5 Candidatos que ficaram para trás

`Tabs` é totalmente genérico (recebe `tabs[]`, `activeTab`, `onChange`) e
`RadioListModal`, `MultiSelectFieldModal` e `DateFieldModal` são quase genéricos —
mas nenhum era importado de fora de `addCollaborator/`, então ficaram no módulo
pelo critério. O segundo módulo que precisar de abas ou de um modal de lista vai
querer promovê-los.

### 4.6 Dois SVGs duplicados

`Close.svg` e `Square.svg` foram **copiados** para `packages/ui/src/assets/icons/`
para o pacote ser autocontido; as cópias originais continuam no módulo. São dois
arquivos pequenos, mas são duas fontes de verdade.

## 5. Workflow de deploy ainda não existe — **[novo]** · impacto alto quando publicar

Por instrução, nenhum workflow foi criado — o repositório ainda não existe no
GitHub. Quando for criado, três coisas precisam sair juntas:

1. **`base` do Vite.** Hoje `'/'` em `apps/web/vite.config.js`. Vira
   `'/<nome-do-repo>/'` no Pages. **Valor errado não quebra o `npm run dev`** —
   só o site depois do deploy, com 404 em todos os assets.
2. **Build por workspace.** O workflow do projeto original rodava `npm ci` +
   `npm run build` na raiz e publicava `dist/` — o que aqui significa publicar
   só `apps/web`. Funciona hoje, mas não escala se um dia houver mais de um app.
3. **Concorrência.** O original usava `concurrency: { group: 'pages' }`. Com um
   único app isso está certo; com vários, dois deploys simultâneos se cancelam.

Vale também rodar `npm run lint` no CI — hoje nada impede um push com regressão
de lint, já que o workflow original não rodava linter.

## 6. Sidebar decorativa e botão "tutorial" sem ação — **[herdado]** · impacto baixo

Herdado tal e qual, porque mexer mudaria pixels:

- `Sidebar` são **5 `<div>` vazios**, sem navegação nenhuma.
- Em `PageHeader`, o botão "tutorial" é renderizado **sem `onClick`**.

Num projeto isolado isso passava como mock visual. Dentro do monorepo a pergunta
fica de pé: ou o shell da aplicação passa a fornecer esses elementos (e o módulo
para de renderizá-los), ou eles precisam ganhar comportamento.

**Resolvido:** o botão "voltar" do `PageHeader` também não tinha `onClick` e hoje
leva à home do monorepo. O destino é injetado de fora, via prop `backTo` em
`GestaoPessoasRoutes` (ver `apps/web/src/router.jsx`), então o módulo continua
sem conhecer a aplicação que o hospeda. Sem `backTo` a seta volta a ser inerte,
como no projeto original.

## 7. Wizards não são rotas — **[herdado]** · impacto médio

Os 4 fluxos (`AddCollaboratorFlow`, `NovoTimeFlow`, `NovoCargoFlow`,
`NovoBeneficioFlow`) são *early returns* dentro de `Home.jsx` que substituem a
página inteira **sem mexer na URL**:

```jsx
if (addCollaboratorFlowOpen) return <AddCollaboratorFlow onExit={…} />
```

Consequências, todas preservadas do original: não há deep link para um wizard, o
botão voltar do navegador não sai de um wizard, e um refresh no meio perde tudo.

Isso vira problema de verdade no dia em que o monorepo tiver chrome persistente
(header, sidebar de navegação entre módulos): os wizards vão **escapar do
layout** e ocupar a tela inteira, incluindo por cima da navegação do shell.
Nessa hora eles precisam virar rotas de verdade ou ser renderizados em portal.

## 8. Bundle único de ~1,15 MB — **[novo, mas causa herdada]** · impacto médio

O build emite um chunk de **1,15 MB (322 kB gzip)** e o Vite avisa. Eram 896 kB
com um módulo só; o Pesquisa de Clima somou ~255 kB. A causa de base é o
`@phosphor-icons/react` (`utils/teamOptions.js` importa ~100 ícones nomeados para
o seletor de ícone de time), mais o CSS, que foi de 63 kB para 139 kB.

A projeção já não é confortável: **todo módulo entra no bundle inicial**, mesmo
para quem só abre a home. Com 14 cards previstos no `modules.js`, esse caminho
leva a vários megabytes. A saída natural é carregar cada módulo com `React.lazy` + `import()` dinâmico no
`router.jsx`. Vale fazer **antes do terceiro módulo** — com dois ainda é barato,
e o ponto de corte por rota já está claro. Note que hoje até o `initPesquisaClima()`
importado no `main.jsx` puxa o CSS do módulo para todas as páginas, porque vem do
mesmo barrel: separar a inicialização do barrel é parte do mesmo trabalho.

## 9. CSS global sem isolamento — **[herdado]** · impacto médio

Não há CSS Modules nem hashing: todo `import './X.css'` injeta regras no escopo
global. Hoje isso está **sob controle e verificado** — nenhum seletor é definido
em mais de um arquivo, entre os 47 `.css` do módulo.

Mas o isolamento é por disciplina, não por ferramenta. Existem 9 seletores de
raiz genéricos que um módulo futuro pode redefinir sem perceber:

`.pill-button` · `.text-button` · `.beneficio-card` · `.beneficio-tipo` ·
`.time-card` · `.team-color-dot` · `.team-color-swatch-button` ·
`.team-field-row` · `.team-icon-swatch-button`

Antes do terceiro módulo entrar, vale decidir entre CSS Modules, prefixo por
módulo, ou uma convenção documentada e verificada no CI.

## 10. Pontos menores

- **Nomes de arquivo com espaço** — **[herdado]**. `assets/images/Frame 2147223814.png`
  (e `-1`, `-2`) são importados com espaço no caminho. O Vite lida bem, mas
  renomear para `alice.png`, `caju.png`, `gympass.png` é barato e remove uma
  classe inteira de problema com ferramentas de workspace.
- **Sem dark mode** — **[herdado]**. `index.css` fixa `color-scheme: light` e não
  há `prefers-color-scheme` em lugar nenhum. Se o Squad tiver tema escuro, este
  módulo não acompanha.
- **`--color-accent-blue` é praticamente morto** — **[herdado]**. Um único uso em
  todo o módulo. Provavelmente sobra de uma versão anterior.
- **Peso do título da home**: o Figma usa SF Pro Semibold (590); usamos o token
  `--font-weight-semibold` (600) com Inter. São tipografias diferentes de
  qualquer forma, mas fica o registro de que o valor não é o do Figma ao pé da letra.

## Terceira cópia da casca de painel lateral no Pesquisa de Clima

`packages/modulo-pesquisa-clima/src/components/lista/PainelFiltros.module.css`
ainda traz a casca inteira do painel lateral — véu `rgba(227,230,230,0.4)`,
painel `428px` preso em `top: 20px / right: 24px`, `max-height: calc(100vh - 40px)`,
`gap: 40px`, rolagem com `padding-bottom: 169px`, transição `280ms ease-out` e o
mesmo truque do `translateX(calc(100% + 24px))`. O próprio comentário no topo do
arquivo diz "Mesma casca do FiltrosPanel do Gestão de Pessoas" — ela nasceu
duplicada na etapa 2, quando a decisão era duplicar componentes e unificar só a
camada de tokens.

Agora que `@squad/ui/PainelLateral` existe e tem dois consumidores (Gestão de
Pessoas e Fluxo de Caixa), esta é a terceira cópia. Migrar exige as mesmas duas
variáveis que o Fluxo de Caixa já usa:

    --painel-peso-titulo: var(--peso-medio);   /* 500, não os 510 do GP */

O botão de fechar também difere: o clima usa um botão próprio com fundo
`--cor-superficie`, enquanto o compartilhado recebe o ícone por prop e usa o
`IconButton`. É um `iconeFechar` mais um ajuste de fundo — não um componente
paralelo.

Não foi migrado nesta etapa porque ela pedia explicitamente a extração da casca,
a migração do Gestão de Pessoas a 0 px e a reconstrução dos cinco painéis do
Fluxo de Caixa; mexer no clima estaria fora do escopo. A migração é verificável
do mesmo jeito: diff de 0 px na Home do clima com o painel aberto.

## Busca de CNPJ na BrasilAPI não pôde ser exercitada ao vivo

`packages/modulo-fluxo-caixa/src/lib/receita.js` chama
`https://brasilapi.com.br/api/cnpj/v1/{cnpj}`. A rede desta máquina devolve
**403 Forbidden** para esse host, então a chamada real nunca completou aqui.

O que foi verificado, com a requisição interceptada no navegador:

- CNPJ válido e API respondendo → o nome vem preenchido no campo, fundo
  `#f4f5f5`, e o "Salvar" habilita.
- CNPJ inválido nos dígitos verificadores → **nenhuma** chamada sai.
- API respondendo 503 → campo vazio para digitar à mão, sem erro bloqueante,
  e o "Salvar" habilita assim que há nome.

Falta confirmar, quando houver rede: o formato exato do JSON da BrasilAPI
(hoje o código lê `nome_fantasia` e cai em `razao_social`), o tempo de resposta
típico e se vale um cache local por CNPJ.

Em desenvolvimento a chamada sai **duas vezes** por causa do `StrictMode` do
React 19, que roda o efeito duas vezes de propósito. O `AbortController` aborta
a primeira; em produção sai uma só.

## Dois campos de data diferentes entre Gestão de Pessoas e Fluxo de Caixa

O `DatePillInput` do `FiltrosPanel.jsx` do Gestão de Pessoas abre o seletor
nativo do navegador (`input[type=date]` + `showPicker()`); o campo de data do
painel de Filtros do Fluxo de Caixa abre um popover com o `Calendario` do
próprio módulo. Os dois desenham a mesma pílula — ícone `CalendarBlank` + data
formatada — mas o que acontece no clique é diferente, então continuam sendo
dois componentes.

Unificar significa escolher um dos dois mecanismos para os dois módulos:
levar o popover para o GP muda a experiência dele (e sai do 0 px), e levar o
seletor nativo para o FC contraria o Figma. Fica para quando alguém decidir
qual é o certo para o produto.

O formato do texto já é o mesmo nos dois (`formatDateDMonthYear` no GP,
`formatarCurta` no FC) — essas duas funções também estão duplicadas.

## "Agendada" no filtro de Tipo não é um tipo de transação

No dropdown da coluna Tipo do Fluxo de Caixa, as opções são Entrada, Saída e
**Agendada**. As duas primeiras são o campo `tipo` da transação; a terceira não
existe como dado: é qualquer transação com `data` maior que hoje, calculada na
hora em `lib/filtros.js`.

Isso significa que "Agendada" se cruza com as outras duas em vez de excluí-las
— uma entrada futura aparece marcando "Entrada" ou marcando "Agendada". O
filtro trata as três como uma lista de marcas e aceita a transação que casar
com qualquer uma delas.

Se algum dia "agendada" virar um estado de verdade no dado, esta regra sai do
filtro e vira campo.

## Colecao orfa `squad:gestao-pessoas:cargos`

A aba Cargo saiu do produto (upstream `f0a5d55`), mas quem ja usou o modulo
tem a colecao `squad:gestao-pessoas:cargos` gravada no navegador. O original
nao apaga a chave: so limpa as referencias a cargo dentro dos beneficiarios
(`cleanupCargoBeneficiarios`). Trouxemos a migration como esta.

Consequencia: os cargos que o usuario ja tinha criado deixam de alimentar as
sugestoes do campo Cargo do colaborador - o original semeia essas sugestoes de
uma lista fixa, nao da colecao. Decidido em 29 Set 2026 nao semear a partir da
colecao orfa, para nao divergir do original.

A decidir: apagar a chave numa migration futura ou deixar como lixo inerte.
