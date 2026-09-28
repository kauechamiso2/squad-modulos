# Como contribuir

## Antes de começar

```bash
git checkout main && git pull
npm install
```

## Branches

Uma branch por trabalho, a partir da `main` atualizada:

| Tipo | Padrão | Exemplo |
|---|---|---|
| Módulo novo | `modulo/<slug>` | `modulo/vendas` |
| Correção ou ajuste | `fix/<slug>-<assunto>` | `fix/fluxo-caixa-hover-tabela` |
| Mudança no compartilhado | `ui/<componente>` | `ui/painel-lateral` |

**Nada vai direto na `main`** — sempre por pull request.

## Módulo novo, passo a passo

1. `packages/modulo-<slug>/package.json`

   ```json
   {
     "name": "@squad/modulo-<slug>",
     "private": true,
     "version": "0.0.0",
     "type": "module",
     "exports": { ".": "./src/index.js", "./*": "./src/*" },
     "dependencies": { "@phosphor-icons/react": "^2.1.10", "@squad/ui": "*" },
     "peerDependencies": {
       "react": "^19.2.8",
       "react-dom": "^19.2.8",
       "react-router-dom": "^7.18.3"
     }
   }
   ```

2. `src/routes.js` — o prefixo numa constante:

   ```js
   export const MODULE_BASE = '/<slug>'
   ```

3. `src/<Slug>Routes.jsx` — exporta um `<Routes>` com as telas do módulo.
4. `src/index.js` — barril: `export { default as <Slug>Routes } from './<Slug>Routes.jsx'`.
5. `apps/web/src/modules.js` — troque o `status` do slug para `'ativo'`
   (ou acrescente a entrada, se o módulo ainda não estiver na lista).
6. `apps/web/src/router.jsx` — monte a rota em `/<slug>/*`.
7. `npm install` na raiz, para o workspace ser reconhecido.

Guarde o que estiver gravado no localStorage com o prefixo `squad:<slug>:`.

## Mudança em `packages/ui`

**Vai em PR separado do módulo.** No PR, a prova de que os outros módulos não
mudaram um pixel: screenshots antes e depois das telas afetadas.

A regra: só sobe para o `ui` o que um **segundo** módulo precisar, e a prop ou
variável nova tem default igual ao comportamento de hoje.

## Antes de abrir o PR

```bash
npm run build
npm run lint
npm test
```

Os três precisam passar. O CI roda os mesmos comandos.

## Commits

Curtos e no presente. Prefixo com o módulo quando fizer sentido:

```
fluxo-caixa: adiciona filtro de período
ui: extrai PilulaFiltro do painel de filtros
gestao-pessoas: corrige hover da tabela
docs: registra dívida do campo de data
```

## Conflito no `package-lock.json`

Não edite à mão. Atualize a branch e deixe o npm resolver:

```bash
git checkout main && git pull
git checkout sua-branch && git merge main
git checkout --theirs package-lock.json   # ou --ours, tanto faz
npm install
git add package-lock.json
```
