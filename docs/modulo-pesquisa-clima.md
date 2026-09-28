# Módulo Pesquisa de Clima — migração para o monorepo

Origem: `brunovasconcelos-maker/squad-pesquisa-clima`, commit `4dd6631`.
Destino: `packages/modulo-pesquisa-clima`, montado em `/pesquisa-clima/*`.

~17.100 linhas em `src/` — o maior módulo do monorepo até agora.

---

## 1. O que mudou de stack

| Item | Antes (standalone) | Agora (monorepo) |
|---|---|---|
| React | 18.3.1 | **19.3.0** (do monorepo) |
| Vite | 5.4.8 | **8.3.0** (do monorepo) |
| react-router-dom | 6.26.2 | **7.18.4** (do monorepo) |
| Roteador | `HashRouter` próprio no `App.jsx` | `<Routes>` exportado; o `HashRouter` único vive em `apps/web` |
| Linter | nenhum | oxlint (herdado da raiz) |
| `base` do Vite | `'/squad-pesquisa-clima/'` | `'/'` (o do `apps/web`) |

A subida de React não exigiu nenhuma mudança de código: o módulo não usa
`defaultProps`, `propTypes`, `forwardRef`, `ReactDOM.render` nem `findDOMNode`.

## 2. Decisão: duplicar componentes, unificar tokens

### 2.1 O que foi duplicado, e por quê

Estes ficaram **dentro do módulo, em CSS Modules, exatamente como estavam**:

`FluxoLayout` · `CabecalhoFluxo` · `RodapeFluxo` · `ModalFluxo` · `ModalConfirmar` ·
`Botao` · `IconeBotao` · `Interruptor` · `LinhaResumo` · `useModal` · `Sidebar` ·
`BottomSearchBar` · `BarraSelecao`

O motivo não é que sejam diferentes do `@squad/ui` — vários são quase idênticos
(ver 2.2). É que portá-los agora significaria reescrever a casca das 7 telas do
fluxo contra uma API diferente (o `ui` usa slots; o clima tem botões embutidos e
larguras de coluna fixas), **sem um "original" contra o qual comparar pixel a
pixel**: o alvo visual é o Figma, não um app rodando em paralelo. Risco alto,
ganho zero para quem usa o produto.

A unificação fica registrada como dívida, com os pares já mapeados.

### 2.2 Pares candidatos a unificação (clima ↔ `@squad/ui`)

Medidos lendo o CSS dos dois lados, não por semelhança de nome.

| Clima | `@squad/ui` | Veredito | O que já é igual / o que diverge |
|---|---|---|---|
| `CabecalhoFluxo` + `RodapeFluxo` + `FluxoLayout` | `WizardShell` | **quase idêntico** | Cabeçalho **96px**, borda `#e3e6e6`, rodapé **80px**, trilha de progresso **8px** com fundo `#f4f5f5` e preenchimento `#000`, título 20px medium — **tudo igual**. Diverge só a API: slots vs. botões embutidos + coluna centrada (532/808px). |
| `ModalFluxo` | `ModalOverlay` + `FieldModalShell` | **quase idêntico** | Scrim `rgba(0,0,0,0.2)`, card **532px**, padding **24**, radius **16**, gap **40**, título **20px semibold** — todos iguais. Diverge: cor do título `#0c0d0d` vs `#000000`, e o clima tem slot de `erro`. |
| `Botao` variante `marca` | `.pill-button` | **parecido, diverge** | Altura 40, radius 360, fundo preto, texto branco, 14px — iguais. **Padding 12/16 vs 12/20**; texto desabilitado `#b2b9b9` vs `#798282`. |
| `Botao` variante `texto` | `.text-button` | **diverge** | 14px / padding 12-16 / altura 40 **vs** 16px / padding 8-4 / sem altura. |
| `Botao` variante `contorno` | — | **exclusivo do clima** | O `ui` não tem botão contornado. |
| `IconeBotao` | `IconButton` | **parecido, diverge** | 40px redondo transparente com ícone 24 — igual em repouso. `IconButton` tem `:hover` e modificador `--overlay`; `IconeBotao` não. |
| `ModalConfirmar` | `DiscardConfirmModal` | **clima é superset** | Mesmo desenho; o do clima é configurável (título, texto, rótulo, modo `soAviso`) e tem X. |
| `Sidebar` | — | **duplicado nos 2 módulos** | 5 quadrados cinza em ambos. O comentário do código do clima diz que é porte manual do GP. |
| `BottomSearchBar` | — | **duplicado nos 2 módulos** | Idem, porte manual declarado no código. |
| `BarraSelecao` | `BulkActionBar` (no módulo GP) | **duplicado nos 2 módulos** | Idem. |
| `useModal` (foco, Esc, clique fora, trava de scroll) | — | **exclusivo, e melhor** | O `ui` não tem equivalente: os modais do GP não prendem foco nem fecham no Esc. Candidato a subir *do* clima *para* o `ui`. |
| `Interruptor`, `Selo`, `Aviso`, `Rosca`, `GraficoBarras`, `CartaoPesquisa`, `PainelFiltros`, `ModalCapa`, `ListaDePerguntas`, `LeituraDeRespostas` | — | **exclusivos do módulo** | |

### 2.3 Tokens: 12 aliases para o `@squad/ui`

Os tokens em português do clima que tinham **exatamente o mesmo valor** de um
token do `ui` passaram a apontar para ele. Valor computado idêntico — conferido
em runtime, os 12 pares batem:

```
--cor-fundo            -> var(--color-bg)              #ffffff
--cor-superficie       -> var(--color-overlay)         #f4f5f5
--cor-texto            -> var(--color-text)            #000000
--cor-texto-invertido  -> var(--color-bg)              #ffffff
--cor-marca            -> var(--color-text)            #000000
--cor-borda-acao       -> var(--color-border)          #e3e6e6
--cor-texto-apoio      -> var(--color-icon-muted)      #525b5b
--cor-aba-ativa        -> var(--color-accent-blue)     #0f71b0
--raio-card            -> var(--radius-card)           16px
--raio-pilula          -> var(--radius-pill)           360px
--peso-regular         -> var(--font-weight-regular)   400
--peso-semibold        -> var(--font-weight-semibold)  600
```

Os outros 53 tokens continuam com valor próprio em
`packages/modulo-pesquisa-clima/src/styles/tokens.css`.

**Duas divergências mantidas de propósito** (ver `docs/divida-tecnica.md`):
`--peso-medio: 500` (o GP usa 510) e a paleta escurecida para WCAG AA.

## 3. As 25 navegações absolutas corrigidas

Todas passaram a usar `MODULE_BASE` (`'/pesquisa-clima'`), de
`packages/modulo-pesquisa-clima/src/routes.js`.

| Arquivo | Antes | Depois |
|---|---|---|
| `pages/Home.jsx` | `navigate('/pesquisas/nova')` | `` navigate(`${MODULE_BASE}/pesquisas/nova`) `` |
| `pages/Home.jsx` | `` navigate(`/pesquisas/${p.id}`) `` | `` navigate(`${MODULE_BASE}/pesquisas/${p.id}`) `` |
| `pages/Home.jsx` | `` navigate(`/rascunhos/${p.id}${passo}`) `` | `` navigate(`${MODULE_BASE}/rascunhos/${p.id}${passo}`) `` |
| `pages/detalhe/AbaCiclos.jsx` | `` navigate(`/pesquisas/${id}/ciclos/${n}`) `` | prefixado |
| `pages/detalhe/TelaCiclo.jsx` | `` navigate(`/pesquisas/${id}`) `` ×2 | prefixado |
| `pages/detalhe/TelaCiclo.jsx` | `navigate('/', {replace})` ×3 | `navigate(MODULE_BASE, {replace})` |
| `pages/detalhe/TelaDetalhe.jsx` | `navigate('/')` ×1 + `navigate('/', {replace})` ×3 | `navigate(MODULE_BASE, …)` |
| `pages/nova-pesquisa/estado.jsx` | `navigate('/')` ×3 | `navigate(MODULE_BASE)` |
| `pages/nova-pesquisa/TelaConfiguracao.jsx` | `navigate('/')` | `navigate(MODULE_BASE)` |
| `pages/nova-pesquisa/TelaRascunhoSumido.jsx` | `navigate('/', {replace})` | `navigate(MODULE_BASE, {replace})` |
| `components/TelaDadosIlegiveis.jsx` | `navigate('/', {replace})` | `navigate(MODULE_BASE, {replace})` |
| `pages/responder/RespostaProvider.jsx` | `` navigate(`/responder/${id}/fim`) `` | prefixado |
| `pages/responder/TelaAbertura.jsx` | `` navigate(`/responder/${id}/pergunta/1`) `` | prefixado |
| `pages/responder/TelaPergunta.jsx` | `` navigate(`/responder/${id}${destino}`) `` + `<Navigate to>` | prefixados |
| `pages/responder/TelaFim.jsx` | `` <Navigate to={`/responder/${id}`}> `` | prefixado |
| `App.jsx` | `<Navigate to="/" replace />` | virou `<Navigate to={MODULE_BASE} replace />` no `PesquisaClimaRoutes.jsx` |

### Navegação relativa: funcionou sem mudança

Os 9 `navigate('..')` / `navigate('../passo')` do fluxo eram o maior risco
(`v7_relativeSplatPath` é o padrão no router 7). **Testados clicando no
navegador, resolveram certo** — os passos são filhos de uma rota de layout
(`pesquisas/nova`), não de uma rota splat, então a mudança do v7 não os afeta:

```
template -> nome -> perguntas -> prompt -> carregando -> revisao -> configuracao
navigate('nome') · navigate('../perguntas') · navigate('../prompt')
navigate('../carregando') · navigate('../revisao') · navigate('../configuracao')
```

Todos resolveram para `/pesquisa-clima/pesquisas/nova/<passo>`. Nenhuma mudança
foi necessária.

## 4. Link compartilhável

Era:

```js
`${window.location.origin}${import.meta.env.BASE_URL}#/responder/${p.id}`
```

Sob o monorepo isso geraria `http://host/#/responder/x` — sem o prefixo do
módulo, caindo na home do monorepo. Agora:

```js
`${window.location.origin}${import.meta.env.BASE_URL}#${MODULE_BASE}/responder/${p.id}`
```

Os dois pedaços são necessários e fazem coisas diferentes: `BASE_URL` é o caminho
da publicação (hoje `/`, `'/<repo>/'` quando for para o Pages) e `MODULE_BASE` é
o ponto de montagem do módulo dentro do app.

Testado copiando o link pelo app e abrindo: gera
`http://localhost:5173/#/pesquisa-clima/responder/<id>`, abre a vista de
responder **sem sidebar**, e o percurso vai até a tela final.

## 5. Outras adaptações

- **`index.css` desmontado.** O reset (`*`, `body`, `button`) já existia em
  `apps/web`. O que era regra de `<body>` no clima — `line-height: 1.2`,
  `-webkit-font-smoothing: antialiased`, `font: inherit` nos botões — foi para
  `src/styles/modulo.css`, **escopado em `.modulo-pesquisa-clima`**, um wrapper
  no `PesquisaClimaRoutes`. Global, essas três regras mudariam a renderização da
  home e do Gestão de Pessoas. O módulo não usa portal, então herdar pelo
  wrapper cobre tudo, inclusive as telas `position: fixed` do fluxo.
- **`localStorage`:** `squad-pesquisa-clima:pesquisas` → `squad:pesquisa-clima:pesquisas`,
  com `migrarChaveLegada()` rodando em `initPesquisaClima()` antes do primeiro
  render. Testado nos quatro cenários: migra, é idempotente, não deixa o dado
  legado vencer o novo, e é inerte em navegador limpo.
- **Botão de voltar:** na home do módulo leva para `/#/`, pelo mesmo mecanismo do
  GP (prop `backTo` injetada em `apps/web/src/router.jsx`). Nas telas internas e
  no fluxo nada mudou — lá o X e o Voltar já navegavam dentro do módulo.
- **`modules.js`:** o card passou a `status: 'ativo'` e o slug virou
  `pesquisa-clima` (batendo com `MODULE_BASE`). O vocabulário do campo é
  `'ativo'` / `'placeholder'`, que já era o usado pelos outros 13 cards.

## 6. Verificação

```
npm install      ok, 54 pacotes, 0 vulnerabilidades
npm run build    ✓ built in 763ms   (Vite 8 compilando CSS Modules pela 1a vez)
npm run lint     exit 0 — 8 warnings no GP (as mesmas de sempre) + 27 no clima,
                 todas herdadas de um projeto que não tinha linter

no navegador:
  home -> card Pesquisa de Clima -> /pesquisa-clima          ok
  fluxo com template, 7 passos, salva                        ok
  caminho em branco (pula perguntas/prompt -> revisao)       ok
  voltar relativo configuracao -> revisao -> configuracao    ok
  detalhe + 5 abas (Geral/Perguntas/Respostas/Ciclos/Config) ok
  tela de ciclo (aba Ciclos -> /ciclos/1)                    ok
  responder pelo link copiado, 10 perguntas até /fim         ok
  Gestão de Pessoas intacto e navegando                      ok
  sem erro de console, exceção ou request falho em nenhuma tela
```

**Isolamento de estilo, medido:** capturei as 8 telas do Gestão de Pessoas com o
módulo clima no bundle e com ele fora do bundle. **0 px de diferença nas 8** —
nenhum estilo do clima alcança o GP. E o `<body>` continua com
`line-height: normal` e `font-smoothing: auto` na home e no GP, enquanto o
wrapper do clima tem `19.2px` e `antialiased` só dentro do módulo.
