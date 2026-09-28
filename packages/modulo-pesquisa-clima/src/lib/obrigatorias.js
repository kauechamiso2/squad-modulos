/*
 * Se uma pergunta é obrigatória.
 *
 * Depende só do interruptor da própria pergunta. Havia uma segunda camada —
 * "Tornar as perguntas obrigatórias por padrão", nas configurações avançadas
 * —, e a pergunta sem marcação seguia o que a pesquisa dizia. As avançadas
 * saíram do desenho, e com elas o padrão por pesquisa: quem decide agora é o
 * cartão, um a um.
 *
 * Pergunta nova já nasce marcada — é `bancoDePerguntas.js` quem escreve isso,
 * ao gerar e ao criar em branco —, então o campo existe desde o começo. O
 * `?? true` é para as perguntas guardadas antes disto, que não têm o campo e
 * eram obrigatórias pelo padrão que existia: lê-las como opcionais viraria
 * pesquisa no ar do avesso sem ninguém ter mexido em nada.
 */
export function ehObrigatoria(pergunta) {
  return pergunta?.obrigatoria ?? true
}

/* Marca ou desmarca uma pergunta, sempre gravando o valor — inclusive o
   `false`, que é o que distingue "desmarcada" de "nunca mexida". */
export function alternarObrigatoria(pesquisa, idPergunta) {
  return {
    ...pesquisa,
    perguntas: (pesquisa.perguntas || []).map((q) =>
      q.id === idPergunta ? { ...q, obrigatoria: !ehObrigatoria(q) } : q,
    ),
  }
}
