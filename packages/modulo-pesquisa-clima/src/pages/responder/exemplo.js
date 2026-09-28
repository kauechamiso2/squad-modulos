/*
 * O que sobrou do exemplo do Figma na vista de quem responde.
 *
 * Havia aqui uma pesquisa inteira — "Feedback time de Design", do Figma
 * (8073:7375 e 8073:7467) —, que a vista montava quando o id da URL não
 * existia no localStorage. Servia para ver as telas sem criar uma pesquisa
 * antes, mas para quem abria um link errado era indistinguível de uma
 * pesquisa de verdade: dava para responder até o fim e receber o
 * agradecimento, sem que nada fosse guardado. Link sem pesquisa agora cai em
 * TelaNaoEncontrada, e o exemplo saiu junto.
 */

/* O e-mail é do Figma e é decorativo: não há login nesta vista. */
export const EMAIL_EXEMPLO = 'ana.ribeiro@exemplo.com'
