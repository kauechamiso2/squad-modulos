import { addDaysIso } from './formatters.js'
import { generateId } from './storage.js'

// Nota do seed com data relativa ao dia em que o seed roda.
export function notaDoSeed(hoje, dias, texto) {
  return { text: texto, timestamp: `${addDaysIso(hoje, dias)}T12:00:00.000Z` }
}

// Times do seed. Design e completo, para a pagina do time (Figma 10355:3214)
// abrir com dados: cor verde, icone Palette, lider, descricao e notas.
// Marketing e Vendas continuam pendentes.
export function buildSeedTimes(colaboradores, hoje) {
  const lider = colaboradores.find((pessoa) => pessoa.name === 'Bruno Vasconcelos')
  if (!lider) throw new Error('Seed de times: Bruno Vasconcelos não existe no seed')
  return [
    {
      id: generateId(),
      name: 'Design',
      pending: false,
      color: 'verde-3',
      icon: 'Palette',
      leaderId: lider.id,
      descricao:
        'Responsável pela experiência visual e de produto do Squad, do discovery ao pixel final. O time cuida de UI, UX, pesquisa com usuários e do design system, trabalhando lado a lado com produto e engenharia em cada lançamento.',
      notas: [
        notaDoSeed(hoje, -195, 'Time reestruturado com a entrada de dois novos designers. Ajustada a distribuição de projetos entre squads.'),
        notaDoSeed(hoje, -109, 'Início do processo de criação do novo design system. Previsão de conclusão em 3 meses.'),
        notaDoSeed(hoje, -26, 'Pesquisa de clima do time mostrou alta satisfação com autonomia, mas apontou sobrecarga em períodos de fechamento de sprint.'),
      ],
    },
  ]
}
