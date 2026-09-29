# squad-modulos

Monorepo dos módulos do produto Squad. Uma home lista os módulos em cards e
cada card leva ao fluxo daquele módulo.

## Módulos

| Módulo | Slug | Status |
|---|---|---|
| Gestão de Pessoas | `gestao-de-pessoas` | **pronto** |
| Pesquisa de Clima | `pesquisa-clima` | **pronto** |
| Fluxo de Caixa | `fluxo-caixa` | **pronto** |
| Calendário de Conteúdo | `calendario-de-conteudo` | em breve |
| Campanhas | `campanhas` | em breve |
| Comentários | `comentarios` | em breve |
| Vendas | `vendas` | em breve |
| Escalas | `escalas` | em breve |
| Contratos | `contratos` | em breve |
| Monitor de Concorrência | `monitor-de-concorrencia` | em breve |
| Proposta | `proposta` | em breve |
| Recrutamento | `recrutamento` | em breve |
| Wiki | `wiki` | em breve |
| Blog e IA | `blog-e-ia` | em breve |

Os "em breve" caem numa tela de placeholder. A lista viva está em
[`apps/web/src/modules.js`](apps/web/src/modules.js).

## Para quem vai mexer no código

- [`CLAUDE.md`](CLAUDE.md) — as regras do repositório, em uma página. É o que o
  Claude Code lê ao abrir o projeto.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — branches, pull requests e o passo a
  passo para criar um módulo novo.
- [`docs/divida-tecnica.md`](docs/divida-tecnica.md) — o que ficou pendente.

## Origem do módulo Gestão de Pessoas

O módulo veio do repositório `brunovasconcelos-maker/squad-gestao-pessoas`, que
era um projeto Vite separado.

> **A sincronização com esse repositório está encerrada.** A última importação
> trouxe o commit `6953ba6` e `packages/modulo-gestao-pessoas` passou a ser a
> **fonte da verdade**. O repositório antigo não deve mais ser consultado,
> clonado ou usado como referência, e a pasta local `~/Documents/gestao-de-pessoa`
> está aposentada.
>
> Daqui em diante o módulo evolui **apenas dentro deste monorepo**. Mudança
> visual é avaliada contra o Figma, não contra o projeto antigo. O histórico de
> como a paridade foi verificada enquanto ela existia está em
> [`docs/diferencas-gestao-de-pessoas.md`](docs/diferencas-gestao-de-pessoas.md).

## Requisitos

- Node **20+**
- npm (o repositório usa **npm workspaces** — não use pnpm nem yarn)

## Comandos

```bash
npm install     # na raiz: instala tudo e linka os pacotes internos
npm run dev     # sobe o Vite em http://localhost:5173
npm run build   # build de produção em apps/web/dist
npm run preview # serve o build
npm run lint    # oxlint em todo o repositório
```

Todos os scripts da raiz delegam para `apps/web` (`npm run <script> -w apps/web`),
exceto `lint`, que roda na raiz e cobre todos os pacotes.

Há **um único `package-lock.json`, na raiz**. Não crie lockfile dentro dos pacotes.

## Estrutura

```
squad-modulos/
├── apps/
│   └── web/                        Aplicação Vite + React 19. Único HashRouter.
│       ├── src/modules.js          Registro dos módulos (nome, slug, emoji, cor, status)
│       ├── src/router.jsx          Monta a home, o módulo e os placeholders
│       ├── src/pages/Home.jsx      Grid de cards (Tailwind)
│       ├── src/pages/ModulePlaceholder.jsx
│       ├── src/index.css           Tailwind sem preflight + tokens + reset global
│       └── vite.config.js          <- o `base` do deploy mora aqui
├── packages/
│   ├── ui/                         Design system compartilhado
│   │   ├── src/tokens.css          Tokens (cores, pesos, radius, sombras, paleta dos tiles)
│   │   ├── src/components/         IconButton, WizardShell, ModalOverlay,
│   │   │                           FieldModalShell, Checkbox, DiscardConfirmModal, ModuleCard
│   │   └── src/styles/             CSS compartilhado (buttons, SelectListModal, …)
│   ├── modulo-gestao-pessoas/      Cópia fiel do projeto original
│   │   └── src/                    components/, pages/, utils/, assets/
│   └── modulo-pesquisa-clima/      Segundo módulo; CSS Modules, tokens próprios
│       └── src/                    components/, pages/, lib/, styles/, assets/
├── docs/
│   ├── analise-gestao-de-pessoas.md    Engenharia reversa do projeto original
│   ├── diferencas-gestao-de-pessoas.md Comparação visual contra o original
│   ├── modulo-pesquisa-clima.md        Migração do 2º módulo: o que foi duplicado e por quê
│   └── divida-tecnica.md
└── package.json                    workspaces: apps/*, packages/*
```

Os pacotes internos (`@squad/ui`, `@squad/modulo-gestao-pessoas`) **exportam
código-fonte direto** — o campo `exports` aponta para os `.jsx`/`.js`. Não há
etapa de build própria; o Vite compila tudo. Eles são declarados com `"*"` nas
`dependencies` de `apps/web` para o npm linkar do próprio workspace.

## ⚠️ O `base` do Vite e o deploy no GitHub Pages

Em [`apps/web/vite.config.js`](apps/web/vite.config.js):

```js
const BASE = '/'
```

**Hoje é `'/'` porque o site ainda não foi publicado.** O GitHub Pages serve um
projeto em `https://<usuario>.github.io/<nome-do-repo>/`, então no dia em que
este repositório for publicado o valor precisa virar `'/<nome-do-repo>/'` — por
exemplo `'/squad-modulos/'`.

O detalhe que morde: **um valor errado não quebra o `npm run dev`.** Em
desenvolvimento o Vite serve na raiz e tudo funciona normalmente. A quebra só
aparece depois do deploy, como 404 em todos os JS, CSS e imagens — e aí parece
um problema do Pages, não do config. Confira este valor no mesmo PR que criar o
workflow de deploy.

(O projeto original tinha `'/squad-gestao-pessoas/'` fixo aqui, pelo mesmo motivo.)

## Como adicionar um módulo

1. Crie `packages/modulo-<slug>/` com um `package.json`:

   ```json
   {
     "name": "@squad/modulo-<slug>",
     "private": true,
     "version": "0.0.0",
     "type": "module",
     "exports": { ".": "./src/index.js", "./*": "./src/*" },
     "dependencies": { "@squad/ui": "*" },
     "peerDependencies": {
       "react": "^19.2.8",
       "react-dom": "^19.2.8",
       "react-router-dom": "^7.18.3"
     }
   }
   ```

2. Exporte o componente de rotas em `src/index.js`:

   ```js
   export { default as MeuModuloRoutes } from './MeuModuloRoutes.jsx'
   export { MODULE_BASE } from './routes.js'   // ex.: '/meu-modulo'
   ```

   O módulo **não** cria roteador próprio — o único `HashRouter` está em
   `apps/web`. Use `<Routes>` / `<Route>` e nada mais.

   Se o módulo tiver um botão de voltar no cabeçalho, receba o destino por prop
   (como `backTo` em `GestaoPessoasRoutes`) em vez de escrever `'/'` dentro do
   módulo. Assim o módulo não presume onde está montado.

3. Declare a dependência em `apps/web/package.json`:

   ```json
   "@squad/modulo-<slug>": "*"
   ```

4. Mude o `status` do módulo para `'ativo'` em
   [`apps/web/src/modules.js`](apps/web/src/modules.js) e monte a rota em
   [`apps/web/src/router.jsx`](apps/web/src/router.jsx):

   ```jsx
   <Route path={`${MEU_MODULO_BASE}/*`} element={<MeuModuloRoutes />} />
   ```

5. Rode `npm install` na raiz para linkar o pacote novo.

Módulos com `status: 'placeholder'` ganham a tela genérica automaticamente — não
precisam de pacote nem de rota.

### Convenções para o módulo novo

- **Chaves de `localStorage` sempre prefixadas** com `squad:<slug>:`. Sem prefixo
  elas colidem com as dos outros módulos, que dividem a mesma origem.
- **Reaproveite `@squad/ui`** em vez de recriar botões, modais e wizards.
- Cores novas entram em `packages/ui/src/tokens.css`, não hardcoded no componente.

## Migration do `localStorage` — como testar manualmente

O módulo Gestão de Pessoas guardava dados em chaves sem prefixo (`colaboradores`,
`times`, `cargos`, `beneficios`). Agora usa `squad:gestao-pessoas:<nome>`. A
função `migrateLegacyKeys()` em
[`packages/modulo-gestao-pessoas/src/utils/storage.js`](packages/modulo-gestao-pessoas/src/utils/storage.js)
copia as chaves antigas para as novas e remove as antigas. Ela roda uma vez por
carregamento de página, dentro de `initGestaoPessoas()`, **antes do primeiro render**.

Para testar:

1. `npm run dev` e abra `http://localhost:5173/#/gestao-de-pessoas`.
2. No console do navegador, simule o storage da versão antiga:

   ```js
   localStorage.clear()
   localStorage.setItem('colaboradores', JSON.stringify([{
     id: 'legado1', name: 'Pessoa Legada', contractType: 'Fixo', email: '',
     cargos: [], times: [], reportaPara: null,
     dataAdmissao: '2023-01-10', salario: 5000
   }]))
   localStorage.setItem('times', JSON.stringify([{ id: 'tl', name: 'Time Legado', pending: true }]))
   ```

3. **Recarregue a página** (F5). A migration só roda em carregamento de página —
   navegar pelo hash não a dispara, porque não reavalia o `main.jsx`.
4. Confira no console:

   ```js
   Object.keys(localStorage)
   // esperado: só chaves com prefixo squad:gestao-pessoas:
   //           nenhuma chave "colaboradores"/"times" solta
   ```

5. "Pessoa Legada" deve aparecer na tabela de colaboradores.

Comportamentos garantidos:

- **Idempotente** — recarregar de novo não duplica nem quebra nada.
- **Não sobrescreve dados novos.** Se já existir `squad:gestao-pessoas:colaboradores`,
  a chave antiga é apenas removida; o dado novo vence.
- **Segura em navegador limpo** — sem chave antiga, não faz nada.

## Notas de stack

- **JavaScript puro**, sem TypeScript (igual aos projetos de origem).
- **Dois paradigmas de CSS convivem:** o Gestão de Pessoas usa BEM global, o
  Pesquisa de Clima usa CSS Modules. Foi decisão consciente — cada módulo entrou
  fiel ao original. Os dois compartilham só a camada de tokens.
- **Tailwind v4 apenas para código novo** (home e placeholder), com o
  **preflight desligado** — ver o comentário no topo de
  [`apps/web/src/index.css`](apps/web/src/index.css). O preflight zeraria o CSS
  do módulo, que é BEM escrito à mão e precisa continuar idêntico ao original.
- O CSS do módulo Gestão de Pessoas **não foi convertido para Tailwind** e não deve ser.
- `--font-weight-medium` é **510** (não 500), de propósito. Ver `docs/divida-tecnica.md`.
