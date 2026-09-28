# Etapa 0 — extração para `@squad/ui`

Feita quando o Fluxo de Caixa virou o **segundo consumidor** da casca de fluxo e
o **terceiro** das barras flutuantes. Nada de novo foi desenhado aqui: o que
existia em dois lugares passou a existir em um.

## O que subiu

### Casca de fluxo — de `modulo-pesquisa-clima/src/components/fluxo/`

`FluxoLayout` · `CabecalhoFluxo` · `RodapeFluxo` · `Botao` · `IconeBotao` ·
`ModalFluxo` · `ModalConfirmar` · `Interruptor` · `LinhaResumo` · `useModal`

Movidos com seus `.module.css`, sem reescrita. Consumidor único até então (o
clima), então a troca foi mecânica: 26 arquivos do clima passaram a importar de
`@squad/ui`.

### Barras flutuantes — parametrizadas

`BottomSearchBar` e `BarraSelecao` existiam **duas vezes**, com implementações
diferentes. Subiu a versão do clima (mais nova, em CSS Modules), com props para
tudo que divergia:

| Prop | Por que existe | GP passa | Clima passa |
|---|---|---|---|
| `icones` | Os SVGs não são os mesmos arquivos (`Close.svg` tem md5 diferente) e o clima usa componentes Phosphor onde o GP usa `<img>` | 5 `<img>` locais | 5 componentes Phosphor |
| `placeholder` | O GP troca por aba | `PLACEHOLDERS[activeTab]` | `"Buscar uma pesquisa..."` |
| `acao` (slot) | A ação principal é **funcionalidade diferente**, não estilo | botão "Add em time" | `Botao` "Duplicar" |
| `iconeDeletar` / `iconeFechar` | idem `icones` | `<img>` locais | `<img>` locais |

**Duas props existem só para o Gestão de Pessoas**, ambas consequência dos
tokens bifurcados que já estão na dívida:

- **`corPlaceholder`** — o compartilhado usa `--cor-texto-secundario` (#6a7272,
  escurecido para WCAG AA, do clima). O GP passa `--color-text-secondary`
  (#798282) para não mudar um pixel. Some quando a paleta WCAG for propagada.
- **`pesoContagem`** — o compartilhado usa `--peso-medio` (500). O GP passa
  `--font-weight-medium` (510) pelo mesmo motivo. Some quando os dois "medium"
  forem unificados.

As duas são implementadas como custom properties com default
(`--busca-cor-placeholder`, `--barra-selecao-peso`), então quem não passa nada
recebe o valor do clima.

### Tokens — 29 no total

A casca e as barras dependiam de tokens que viviam só no `tokens.css` do clima.
Enquanto ficassem lá, um componente "compartilhado" só renderizaria certo com o
clima montado. Foram para `packages/ui/src/tokens.css`:

- **18 da casca de fluxo:** `--altura-cabecalho-fluxo`, `--altura-rodape-fluxo`,
  `--cor-fundo-desabilitado`, `--cor-preto-suave`, `--cor-scrim`,
  `--cor-texto-desabilitado`, `--cor-texto-secundario`, `--cor-verde-ativo`,
  `--cor-vermelho`, `--espaco-8/12/16/24/40`, `--interruptor-desligado`,
  `--largura-miolo`, `--largura-miolo-largo`, `--peso-medio`
- **11 aliases e medidas:** `--cor-fundo`, `--cor-superficie`, `--cor-texto`,
  `--cor-texto-invertido`, `--cor-marca`, `--cor-borda-acao`, `--raio-card`,
  `--raio-pilula`, `--peso-regular`, `--peso-semibold`, `--largura-sidebar`

Conferido programaticamente: os 45 tokens usados por qualquer CSS do `ui` estão
definidos em `ui/tokens.css`. O pacote é autossuficiente.

### `ModalConfirmar` ganhou CSS próprio

Ele importava 7 classes de `pages/nova-pesquisa/Editor.module.css`, que fica no
clima porque as telas de editor usam outras classes do mesmo arquivo. As 7
regras foram copiadas na letra para `ui/components/fluxo/ModalConfirmar.module.css`.
É duplicação de CSS — registrada na dívida.

## O que **não** subiu

**`Sidebar` fica com três cópias** (GP, clima, e o Fluxo de Caixa usa a do
clima). Decisão consciente: o GP tem a sidebar em fluxo normal
(`width` + `min-width: 76px`, o `.home` reserva o espaço) e o clima tem
`position: fixed` com `--deslocamento-conteudo: 80px` compensando. Unificar
exigiria uma prop de layout num componente que é **5 divs cinzas de
placeholder**, destinado a ser substituído pela navegação real do produto.
Registrado na dívida.

## Prova de que nada mudou

### Gestão de Pessoas — 0 px nas 8 telas

Capturado antes e depois da etapa 0 completa, 1440×928, tolerância 8/255:

| Tela | Diferença |
|---|---|
| Colaboradores (tabela) | 0 px |
| Colaboradores (grade) | 0 px |
| Times | 0 px |
| Cargos | 0 px |
| Benefícios | 0 px |
| Modal "Novo" | 0 px |
| Painel de Filtros | 0 px |
| Detalhe do colaborador | 0 px |

As 8 telas não exercitam as barras em todos os estados, então medi os estados
que faltavam **em runtime**:

```
GP  busca padrão   468px · left 524 · gap 8 · padding 12/16 · placeholder #798282
GP  busca ativa    idem
GP  modo Pipo      fundo #fdf6e8
GP  seleção        gap 21 · padding 12/24 · peso da contagem 510
```

Todos batem com o CSS que o GP tinha antes. Funcionalmente: a barra mostra
"1 selecionados / Add em time", o modal de Add em time abre, e a busca filtra.

### Pesquisa de Clima

```
clima  busca padrão  468px · left 524 · gap 8 · padding 12/16 · placeholder #6a7272
clima  modo Pipo     fundo #fdf6e8
clima  seleção       gap 21 · padding 12/24 · peso da contagem 500
clima  cabeçalho do fluxo  96px · borda #e3e6e6
clima  rodapé do fluxo     80px · trilha 8px #f4f5f5
clima  ModalFluxo          532px · padding 24 · radius 16
clima  Botao               40px · radius 360 · 14px/500
```

E os **32 tokens** conferidos um a um resolvem exatamente para o valor de antes
da extração. Fluxo completo de nova pesquisa roda até salvar, sem erro de console.

## Um bug encontrado pela verificação

Ao medir a casca movida, o `Botao` renderizava **16px/400** quando seu CSS diz
**14px/500**. A causa não era a extração — era a regra que eu tinha escrito ao
escopar o reset do clima no turno anterior:

```
original (standalone):         button                        → (0,0,1)
.botao do Botao.module.css                                   → (0,1,0)  vence
o wrapper que eu escrevi:      .modulo-pesquisa-clima button  → (0,1,1)  vencia indevidamente
```

Ou seja, **desde aquele turno todo botão do Pesquisa de Clima estava com tamanho
e peso errados**. Corrigido com `:where(.modulo-pesquisa-clima) button`, que
devolve a especificidade (0,0,1) do seletor global original.

O Gestão de Pessoas foi verificado quanto ao mesmo problema: **não tem wrapper de
escopo nem seletor de elemento no seu próprio CSS** — `GestaoPessoasRoutes`
renderiza `<Routes>` sem div, e todo o CSS é BEM por classe. Os únicos seletores
de elemento estão em `apps/web/src/index.css` (`button { font-family: inherit }`,
especificidade 0,0,1), que perde para qualquer classe, como no projeto original.
Nada a corrigir lá.
