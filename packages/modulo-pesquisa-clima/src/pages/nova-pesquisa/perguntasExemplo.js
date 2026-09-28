/* Textos de abertura da tela de revisão. O do template veio do Figma
   (8065:4915); o do branco é o placeholder combinado.
 *
 * O "pode variar um pouco" no do template é o que passou a valer com a
 * pergunta extra condicional (lib/perguntaExtra.js): uma resposta negativa
 * acrescenta um passo a mais no meio do caminho, então os "12 minutos" já
 * não são uma promessa fixa como eram antes dela existir. */

export const ABERTURA_TEMPLATE =
  'Essa pesquisa quer entender como está o clima do time de design. Leva cerca de 12 minutos, podendo variar um pouco dependendo das suas respostas. Suas respostas ajudam a melhorar o dia a dia do time.'

export const ABERTURA_BRANCO =
  'Escreva aqui um texto de introdução explicando o objetivo da pesquisa e como as respostas serão usadas. Isso ajuda a aumentar a taxa de resposta.'
