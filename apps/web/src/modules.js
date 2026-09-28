/*
 * Registro unico dos modulos do Squad.
 * Para adicionar um modulo: crie packages/modulo-<slug>, acrescente uma
 * entrada aqui e monte a rota em src/router.jsx.
 *
 * status: 'ativo'       -> tem rota real, montada em router.jsx
 *         'placeholder' -> cai na tela generica "em construcao"
 *
 * tile: nome da cor na paleta de tokens (--tile-<nome>), definida em
 *       packages/ui/src/tokens.css. Nao usar hex aqui.
 *
 * Nomes, ordem e emojis vem do Figma "Product 2.0" (node 313:1261).
 * O titulo no Figma tem o typo "Sqaud"; na home usamos "Squad".
 */
export const MODULES = [
  { slug: 'pesquisa-clima', name: 'Pesquisa de Clima', emoji: '🌤️', tile: 'amarelo', status: 'ativo' },
  { slug: 'gestao-de-pessoas', name: 'Gestão de Pessoas', emoji: '👥', tile: 'amarelo', status: 'ativo' },
  { slug: 'calendario-de-conteudo', name: 'Calendário de Conteudo', emoji: '🗓️', tile: 'rosa', status: 'placeholder' },
  { slug: 'campanhas', name: 'Campanhas', emoji: '📣', tile: 'rosa', status: 'placeholder' },
  { slug: 'comentarios', name: 'Comentários', emoji: '💬', tile: 'rosa', status: 'placeholder' },
  { slug: 'fluxo-caixa', name: 'Fluxo de caixa', emoji: '💰', tile: 'azul', status: 'ativo' },
  { slug: 'vendas', name: 'Vendas', emoji: '📈', tile: 'verde', status: 'placeholder' },
  { slug: 'escalas', name: 'Escalas', emoji: '⏰', tile: 'verde-agua', status: 'placeholder' },
  { slug: 'contratos', name: 'Contratos', emoji: '📝', tile: 'lilas', status: 'placeholder' },
  { slug: 'monitor-de-concorrencia', name: 'Monitor de Concorrencia', emoji: '🔍', tile: 'rosa', status: 'placeholder' },
  { slug: 'proposta', name: 'Proposta', emoji: '🤝', tile: 'lilas', status: 'placeholder' },
  { slug: 'recrutamento', name: 'Recrutamento', emoji: '🎯', tile: 'amarelo', status: 'placeholder' },
  { slug: 'wiki', name: 'Wiki', emoji: '📚', tile: 'amarelo', status: 'placeholder' },
  { slug: 'blog-e-ia', name: 'Blog e IA', emoji: '🤖', tile: 'rosa', status: 'placeholder' },
]
