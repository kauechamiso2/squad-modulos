# Gestão de Pessoas — histórico de paridade com o repositório de origem

> **Status: sincronização encerrada.** `packages/modulo-gestao-pessoas` é a
> fonte da verdade. O repositório `brunovasconcelos-maker/squad-gestao-pessoas`
> não é mais consultado, e a pasta local `~/Documents/gestao-de-pessoa` está
> aposentada. Daqui em diante o módulo evolui só dentro do monorepo.

Este documento fica como registro de como a paridade foi verificada enquanto
ela ainda fazia sentido.

---

## 1. Migração inicial (base: commit `ef20e86`)

Quando o módulo foi trazido para o monorepo, comparei as duas versões rodando
ao mesmo tempo, em portas diferentes, com os mesmos dados em `localStorage`
(3 colaboradores e 2 times, cobrindo Fixo/Consultor/Freelancer e time
pendente/completo). Viewport 1440×928, Chromium headless, tolerância de 8/255
por canal.

**Resultado: nenhuma diferença visual. As 10 telas eram pixel-idênticas.**

| # | Tela | Diferença |
|---|---|---|
| 01 | Colaboradores — tabela | 0 px |
| 02 | Colaboradores — grade | 0 px |
| 03 | Times | 0 px |
| 04 | Cargos | 0 px |
| 05 | Benefícios | 0 px |
| 06 | Modal "Novo" | 0 px |
| 07 | Wizard Novo Colaborador — passo 1 | 0 px |
| 08 | Painel de Filtros | 0 px |
| 09 | Detalhe do colaborador (gaveta) | 0 px |
| 10 | Wizard Novo Benefício — passo 1 | 0 px |

Três fatos sustentaram isso, verificados e não presumidos:

1. **Nenhum seletor CSS é definido em mais de um arquivo** — checado nos 47
   `.css` do módulo. Sem seletor repetido, a ordem de injeção do CSS não altera
   a cascata, então mover arquivos para `packages/ui` não podia mudar a aparência.
2. **Os arquivos foram movidos, não reescritos.** Markup e nomes de classe
   idênticos; só mudaram caminhos de import.
3. **O preflight do Tailwind está desligado.** Confirmado em runtime: um `<div>`
   novo tem `border-style: none` e um `<h1>` tem `font-size: 32px` — defaults do
   navegador. Com preflight ligado seriam `solid` e `16px`.

Também confirmado em runtime que os tokens sobrevivem ao Tailwind:
`--font-weight-medium` continua **510** no `:root` e o peso computado de
`.page-header__title` acompanha. A camada `theme` do Tailwind v4 define esse
mesmo token como 500, mas `tokens.css` é importado **fora** de qualquer
`@layer`, e estilos sem layer vencem os que estão em layer.

## 2. Sincronização final (`ef20e86` → `c8b28e3`)

Última importação do repositório de origem. Seis commits, todos de tipografia e
espaçamento de tabela. **13 arquivos trazidos**, nenhum deles pertencente ao
`packages/ui`:

| Arquivo | O que veio |
|---|---|
| `components/PageHeader.jsx` | botão "Novo": texto antes do ícone (era ícone antes do texto) |
| `components/PageHeader.css` | título e botão "Novo" com `font-weight: 500` e `letter-spacing: 0` |
| `components/Tabs.css` | aba inativa fica cinza e regular; a ativa é que ganha preto + medium |
| `components/CollaboratorsTable.css` | header com `height: 48px` e `padding: 0 16px`; célula de header 12px/regular; nova regra `--nome` em 500 |
| `components/CargosTable.css` | mesmo tratamento; `--cargo` em 500 |
| `components/CollaboratorsTable.jsx` | ícone de limpar filtro passa a usar `CloseGray.svg` |
| `components/CargosTable.jsx` | idem |
| `components/{Colaboradores,Cargos,Times,Beneficios}Toolbar.css` | `letter-spacing: 0` no total; botão de filtros em `font-weight: 500` |
| `assets/icons/ArrowsDownUp.svg` | seta inferior passa de `#B2B9B9` para `#798282` |
| `assets/icons/CloseGray.svg` | **arquivo novo** |

`CloseGray.svg` ficou no módulo, não no `packages/ui`: é usado só por
`CargosTable` e `CollaboratorsTable`, dois componentes do próprio módulo. O
critério do design system é "importado de fora da própria pasta de feature" —
um ícone consumido por duas tabelas do mesmo módulo não se qualifica.
`packages/ui` só carrega `Close.svg` e `Square.svg` porque os componentes de lá
(`WizardShell`, `FieldModalShell`, `Checkbox`) dependem deles.

### Adaptações do monorepo preservadas

57 arquivos diferem do repositório de origem apenas por adaptação intencional, e
nenhum deles foi tocado pelos commits do upstream — logo não havia nada a trazer
neles. As adaptações seguem intactas, verificadas depois da sincronização:

- 51 arquivos com imports do `@squad/ui`
- `MODULE_BASE` / prefixo de rota `/gestao-de-pessoas` (7 usos em `Home.jsx`)
- chaves de `localStorage` com `squad:gestao-pessoas:` e `migrateLegacyKeys()`
- `onBack` no `PageHeader` (a seta de voltar levando à home do monorepo)

Dois arquivos precisaram de merge manual, porque o upstream e o monorepo mexeram
no mesmo arquivo: `PageHeader.jsx` (upstream reordenou o botão; o monorepo tinha
adicionado `onBack`) e `CargosTable.jsx` (upstream trocou o ícone; o monorepo
tinha trocado o import do `IconButton`). Nos dois, apliquei só o hunk do upstream.

### Verificação pós-sincronização

Conferido no DOM, com o app rodando:

```
header da tabela   48px de altura · célula 12px/400
célula de nome     500            · título do header 500, letter-spacing normal
aba inativa        #798282 / 400  · aba ativa #000 / 510
botão "Novo"       TEXTO -> IMG   · toolbar: total 400, filtros 500
Cargos             header 48px, célula 12px
```

Home com 14 cards, seta de voltar levando a `/`, detalhe do colaborador e os 4
wizards abrindo — sem nenhum erro de console. `npm run build` e `npm run lint`
passam (8 advertências herdadas, as mesmas de sempre).

**A comparação pixel a pixel não se aplica mais**: o módulo agora está à frente
da pasta local aposentada, de propósito. A partir daqui, mudança visual no
módulo é avaliada pelo próprio Figma, não contra o projeto antigo.

## 3. Sincronização reaberta e encerrada (`c8b28e3` → `6953ba6`)

A sincronização foi reaberta uma vez para trazer o que o repositório de origem
produziu depois de `c8b28e3`: a remoção da aba Cargo, três fluxos de criação
reconstruídos em etapas, os painéis de detalhe de Time e Benefício, um sistema
de toast e um `ConfirmModal` próprio. Tudo aplicado **por diff**, em quatro PRs
empilhados, nenhum arquivo copiado por cima.

| PR | O que trouxe |
|---|---|
| 1 | as mudanças de `packages/ui` que os outros três precisavam |
| 2 | remoção da aba Cargo e as mudanças de `utils` |
| 3 | toast, `ConfirmModal` e os três fluxos novos |
| 4 | os três painéis de detalhe |

Depois de `6953ba6` a sincronização está **encerrada de novo, e para valer**:
`packages/modulo-gestao-pessoas` é a fonte da verdade e mudança visual é
avaliada contra o Figma.

### O que ficou diferente do original, de propósito

- **Uma animação só para os painéis.** O original ganhou, em cada painel de
  detalhe, um estado `closing` e um `setTimeout` de 280ms no `Home` para
  segurar o painel até a transição de saída acabar. O `@squad/ui/PainelLateral`
  já faz exatamente isso. O `closing` foi descartado e os três painéis passaram
  a usar o `PainelLateral`, como o detalhe do colaborador já usava.
- **Consequência:** os painéis ficam montados durante a saída, em vez de o
  `Home` os desmontar. O estado local de cada um (modais abertos, valores
  escondidos, nota em edição) e as coleções lidas do `localStorage` passaram a
  ser zerados e relidos na subida de `aberto`, que é o momento equivalente ao
  da montagem antiga.
- **O véu entra com transição.** No original o véu aparece opaco de uma vez e
  só a saída tem transição; o `PainelLateral` faz os dois lados.
- **Componentes compartilhados.** `IconButton`, `ModalOverlay`, `Checkbox`,
  `FieldModalShell` e os estilos `buttons`/`SelectListModal`/`LargeFieldInput`
  vêm do `@squad/ui`; os arquivos novos do original tiveram só os imports
  repontados.
- **`DiscardConfirmModal` voltou para o módulo.** Upstream ele virou uma casca
  sobre o `ConfirmModal`, que é componente do módulo, e não tinha nenhum
  consumidor fora do Gestão de Pessoas.

### Divergências visuais que ficaram registradas

Três diferenças entre o Gestão de Pessoas e o Fluxo de Caixa foram resolvidas
por variável, com o default do `@squad/ui` inalterado: hover da linha da
tabela, opacidade do véu e desenho do checkbox marcado. Estão em
[`divida-tecnica.md`](divida-tecnica.md) à espera de um padrão único.
