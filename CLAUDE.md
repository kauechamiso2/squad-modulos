# Regras do repositório

Monorepo dos módulos do produto Squad. Uma home lista os módulos; cada card
leva ao fluxo daquele módulo.

## Stack e comandos

- **npm workspaces** (não use pnpm nem yarn), **Node 20+** (ver `.nvmrc`).
- React 19, Vite 8, react-router-dom 7. **JavaScript puro — não introduza TypeScript.**
- `npm install` · `npm run dev` · `npm run build` · `npm run lint` · `npm test`
- Um único `package-lock.json`, na raiz.

## Estrutura

```
apps/web/              home, router e registro dos módulos
packages/ui/           componentes e tokens compartilhados (@squad/ui)
packages/modulo-<slug>/ um pacote por módulo
docs/                  análises, decisões e dívida técnica
```

- **Um `HashRouter` só**, em `apps/web`. Cada módulo exporta um `<Routes>` e uma
  constante `MODULE_BASE`; o app monta em `/<slug>/*`.
- O prefixo de rota vive numa constante do módulo (`routes.js`). **Nunca**
  `navigate('/')` absoluto para fora do módulo — use `MODULE_BASE` ou a prop
  `backTo`.
- Módulo novo entra em `apps/web/src/modules.js` com `status`.

## localStorage

Sempre com prefixo `squad:<slug>:`. Quem muda o formato do que está gravado
escreve uma migração idempotente que não sobrescreve dado mais novo.

## Figma primeiro

Para cada tela: `get_design_context` **e** `get_screenshot` do node antes de
codar, implementar, comparar no navegador em **1440** de largura e zerar a lista
de diferenças. **O Figma manda.**

Leia a **seção inteira** do Figma, não só a linha principal de telas: as regras
de negócio costumam estar em textos soltos ao lado dos frames. Contradição entre
frames que você não consiga resolver: pergunte, não escolha em silêncio.

## Inventário antes de codar

Antes de criar qualquer componente, procure equivalente em `packages/ui` e nos
outros módulos:

- **Igual** → reutilize.
- **Diferença visível** → prop ou custom property no componente compartilhado,
  com **default igual ao comportamento de hoje**. Nunca um componente paralelo.
- **Novo de verdade** → nasce dentro do módulo.

Suba para `packages/ui` **só quando um segundo módulo precisar**. Nome genérico,
texto por prop, sem regra de negócio dentro.

## 0 px

Qualquer mudança em `packages/ui` exige provar que os outros módulos não
mudaram **um pixel**: screenshots antes e depois, comparados. Se mudou, ou o
default está errado, ou a mudança não devia estar no compartilhado.

## Estilo

- Ícones: **Phosphor** (`@phosphor-icons/react`), peso regular, cor de cada
  instância vinda do design context.
- **Sem `outline` do navegador** em botão, chip ou campo. Foco por
  `:focus-visible`, com o mesmo fundo do hover.
- Cores novas entram em `packages/ui/src/tokens.css` ou nos tokens do módulo,
  nunca hardcoded no componente.
- Dinheiro é **inteiro em centavos**, nunca float.

## Componentes do `@squad/ui`

| Componente | Para quê |
|---|---|
| `PainelLateral` | painel lateral à direita, com animação de entrada e saída |
| `ModalFluxo`, `ModalConfirmar` | modais centralizados |
| `FluxoLayout`, `CabecalhoFluxo`, `RodapeFluxo` | casca dos fluxos de várias etapas |
| `Botao`, `IconeBotao`, `IconButton` | botões |
| `Tabela`, `CabecalhoTabela`, `CelulaCabecalho`, `LinhaTabela` | tabela |
| `Toolbar`, `TotalItens`, `AcoesToolbar`, `ChipFiltro`, `BotaoFiltros` | barra acima da tabela |
| `DropdownColuna` | lista suspensa de coluna, com busca e contagem opcionais |
| `PilulaFiltro` | pílula de filtro, selecionável com `X` |
| `Checkbox`, `OpcaoRadio` | controles de seleção |
| `AvatarIniciais` | avatar circular com duas iniciais |
| `LinhaInfo`, `CampoInline` | linha rótulo/valor e edição inline |
| `BottomSearchBar`, `BarraSelecao` | barras flutuantes do rodapé |
| `ModuleCard` | card da home e das listas de escolha |
| `useModal` | Esc, foco preso e clique fora, para modais e painéis |

Tokens de movimento: `--movimento-entrada` (280ms ease-out) e
`--movimento-saida` (200ms ease-in). Respeite `prefers-reduced-motion`.

## Gestão de Pessoas: sincronização encerrada

O módulo veio de `brunovasconcelos-maker/squad-gestao-pessoas`. A última
importação trouxe o commit `6953ba6`; a partir dela `packages/modulo-gestao-pessoas`
é a **fonte da verdade** e o repositório antigo não deve ser consultado nem
clonado. Mudança visual passa a ser avaliada contra o Figma.

A especificação do módulo, transcrita do Figma 2.0 com os node ids, é
[`docs/contexto-gestao-de-pessoas.md`](docs/contexto-gestao-de-pessoas.md):
tipos CLT e PJ, status calculado por checklist, cargo como texto livre, vários
times por pessoa e recursos (Benefício, Verba, Licença). Ela vale sobre os
documentos antigos do módulo (`analise-` e `diferencas-gestao-de-pessoas.md`),
que ficam só como histórico.

## Onde ler mais

- [`README.md`](README.md) — o que é, como rodar, estrutura.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — branches, PRs, módulo novo.
- [`docs/divida-tecnica.md`](docs/divida-tecnica.md) — o que ficou pendente e por quê.
- [`docs/contexto-gestao-de-pessoas.md`](docs/contexto-gestao-de-pessoas.md) — especificação do Gestão de Pessoas.
- `docs/modulo-*.md` e `docs/analise-*.md` — decisões de cada módulo.
