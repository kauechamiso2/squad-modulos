# Módulo Fluxo de Caixa

Figma: seções **Entrada** (`2279:94236`), **Saída** (`2279:97361`),
**Filtros** (`2279:105667`) e **resumo-transações** (`2279:101266`).

Este arquivo guarda as decisões tomadas onde o Figma não fechava. O que ficou
pendente está em [`divida-tecnica.md`](divida-tecnica.md).

## Dados

- Dinheiro é **inteiro em centavos**. Nada de float.
- Datas em `'YYYY-MM-DD'`, convertidas com `paraData()` — `new Date('2026-09-16')`
  vira dia 15 em fuso negativo e a tabela mostraria a data errada.
- localStorage sob `squad:fluxo-caixa:`.
- O filtro **não persiste** entre visitas: abrir o módulo é sempre "Este mês" e
  nenhuma coluna filtrada.

## Repetição

Uma repetição sem fim geraria linhas infinitas, então o módulo materializa uma
janela: **30** ocorrências diárias, **12** semanais, **12** mensais. Todas com o
mesmo `serieId`.

- **Semanal** cai sempre no mesmo dia da semana da data escolhida.
- **Mensal** segue a `regraMensal` guardada na série:
  - `dia_fixo` — sempre o mesmo dia do mês;
  - `dia_util` — o mesmo dia, ou o dia útil mais próximo quando cai em fim de
    semana ou feriado nacional (sábado → sexta anterior, domingo → segunda
    seguinte, feriado → o mais próximo, preferindo o anterior no empate).
- Mês sem o dia escolhido (31 em abril) usa o último dia do mês.

Os feriados nacionais, incluindo os móveis (Carnaval, Sexta-feira Santa, Corpus
Christi), são calculados em `lib/datas.js` a partir do Domingo de Páscoa, com
testes em `lib/datas.test.js`.

Editar data ou repetição de uma ocorrência que repete pergunta o escopo:
**"Essa entrada"** ou **"Todas as próximas"**. As regras vivem em `lib/series.js`,
em funções puras sobre a lista, com testes em `lib/series.test.js`.

## Contatos

- **CNPJ** válido nos dígitos verificadores busca o nome na base pública da
  Receita via BrasilAPI e preenche o campo (anotação `2279:96450` do Figma).
  Falha de rede ou CNPJ inexistente não bloqueia: o campo fica vazio para
  digitar à mão.
- **CPF e nome não têm preenchimento automático** — a anotação `2279:96452`
  explica: nome ligado a CPF é dado pessoal protegido pela LGPD.
- MEI sem nome fantasia cai na razão social, que no MEI é o nome do titular.
- A coluna **Contato** mostra uma linha só: o **nome** quando o contato foi
  salvo, e o que foi vinculado (CPF, CNPJ, telefone ou nome digitado) quando não
  foi. O formato de duas linhas que aparece em `2279:96320` e `2279:97011` é
  variação do mock, não regra.

## Valores e estados

- Entrada recebida: verde `#60c60c`. Saída paga: preto.
- **Futura** (data depois de hoje): ícone `Clock`, valor laranja `#ff9500`, fora
  dos totais. A anotação `2279:96453` explica: "como é pagamento futuro não faz
  sentido entrar no verde".
- **Data chegou e ainda não confirmada**: continua laranja e ganha um `Info` ao
  lado do valor. Clicar abre o modal de confirmação (`2279:97240`). A notificação
  pelo Fin que a anotação `2279:96454` imagina não existe ainda.

## Contradições do Figma

| Onde | O que | O que fizemos |
|---|---|---|
| Home | `6.340,12 − 1.924,56 = 4.415,56`, mas o card de Lucro desenha `4.020,44`; as saídas da tabela somam `8.611,03` contra `1.924,56` do card | fiéis às **linhas**; os cards somam o que somam |
| `2279:94367` × `2279:94275` | cards de categoria em dois desenhos (164×174 cinza × 256×180 branco) | seguimos `2279:94275` |
| `2279:94479` | mostra rodapé no passo de categoria, que `2279:94275` não tem | sem rodapé |
| `2279:96395` | node chamado `ArrowsDownUp` desenha dois triângulos sólidos | `CaretUpDown` com `weight="fill"` |
| `2279:107378` | mostra um botão "Este mês ⌄" além do chip | não implementado; o período vive só no chip |
| `2279:108508` | pílula "Hoje" com as datas ainda em 1–16 Set | escolher pílula preenche as datas |
| `2279:102165` | nome salvo mas título do painel antigo | o título atualiza |
| `2279:103192` | toast "Entrada removida" depois de mudar repetição | "Entrada atualizada" |
| linhas do painel | Figma escreve "Observaçao" sem til | "Observação" |
| `2279:107604` × `2279:108243` | painel a 17 e a 20 da direita | 20 |

## Inventado por falta de desenho

- Linha de categoria **selecionada** no painel "Todas as categorias" (borda preta).
- Dropdown de **Tipo** (Entrada / Saída / **Agendada**) — o Figma não o desenha.
- Menu `⋮` da linha: "Ver detalhes" e "Remover".
- **Hover** no gráfico do card expandido, que move ponto, tracejado e balão.
- **Entradas expandido** — o Figma só desenha Lucro e Saídas.
- Balão do gráfico **virando para baixo** quando não cabe acima do ponto.

## Dados de teste

Três conjuntos, carregados pelo console do navegador:

```js
window.__fluxoCaixaDadosDeTeste()   // filtros: 5 meses, contatos salvos e não salvos
window.__fluxoCaixaSerieMensal()    // o mesmo + 12 ocorrências mensais
window.__fluxoCaixaDadosDoResumo()  // painel de detalhe: avulsa, mensal, saída mensal, futura
```

Depois de chamar, recarregue a página.
