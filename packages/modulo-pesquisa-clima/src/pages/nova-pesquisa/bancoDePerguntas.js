import { daTabela, avisarValorDesconhecido } from '../../lib/desconhecido.js'

/*
 * Bancos de perguntas de exemplo, um por template.
 *
 * Nada aqui é gerado de verdade: são textos fixos, no tom do exemplo do
 * "Feedback time de Design" que veio do Figma. O {p} é trocado pela seleção
 * de participantes, do mesmo jeito que o prompt da tela 6 faz.
 *
 * A ordem importa: as seis primeiras de cada banco cobrem os seis tipos, uma
 * de cada. Assim qualquer quantidade pequena já sai com variedade, e nenhuma
 * lógica precisa escolher tipos na hora. Cada banco tem 20 entradas, que é o
 * teto do contador da tela 5.
 */

const clima = [
  { tipo: 'nota', topico: 'Recomendação da empresa', enunciado: 'De 0 a 5, o quanto você recomendaria {p} como um bom lugar pra trabalhar?', pontaEsquerda: 'Não recomendaria', pontaDireita: 'Recomendaria' },
  { tipo: 'escolhaUnica', enunciado: 'Você se sente confortável dando feedback para sua liderança?', opcoes: ['Muito confortável', 'Pouco confortável', 'Não dou feedback'] },
  { tipo: 'escolhaMultipla', enunciado: 'O que mais pesa no seu dia a dia hoje?', opcoes: ['Volume de trabalho', 'Prazos', 'Reuniões', 'Falta de clareza', 'Ferramentas'] },
  { tipo: 'respostaCurta', enunciado: 'Existe algo específico dificultando seu trabalho hoje?' },
  { tipo: 'respostaLonga', enunciado: 'O que mais tem impactado positivamente seu trabalho ultimamente?' },
  { tipo: 'estrelas', enunciado: 'Qual sua avaliação final de {p} como um todo?' },
  { tipo: 'nota', topico: 'Colaboração entre times', enunciado: 'Como você avalia a colaboração entre as pessoas de {p}?', pontaEsquerda: 'Pouco colaborativo', pontaDireita: 'Muito colaborativo' },
  { tipo: 'escolhaUnica', enunciado: 'Como você avalia sua carga de trabalho atual?', opcoes: ['Muito leve', 'Leve', 'Equilibrada', 'Pesada', 'Muito pesada'] },
  { tipo: 'nota', topico: 'Prazos realistas', enunciado: 'Você sente que os prazos dos projetos são realistas?', pontaEsquerda: 'Irrealistas', pontaDireita: 'Realistas' },
  { tipo: 'escolhaUnica', enunciado: 'Você sente que seu trabalho é reconhecido?', opcoes: ['Sempre', 'Às vezes', 'Raramente', 'Nunca'] },
  { tipo: 'respostaLonga', enunciado: 'O que você mudaria em {p} se pudesse mudar uma coisa só?' },
  { tipo: 'escolhaUnica', enunciado: 'Você tem tido tempo suficiente para desenvolvimento e aprendizado?', opcoes: ['Sempre', 'Às vezes', 'Raramente', 'Nunca'] },
  { tipo: 'nota', topico: 'Participação nas decisões', enunciado: 'O quanto você se sente parte das decisões que afetam seu trabalho?', pontaEsquerda: 'De fora', pontaDireita: 'Parte das decisões' },
  { tipo: 'escolhaMultipla', enunciado: 'O que ajudaria você a trabalhar melhor?', opcoes: ['Prioridades mais claras', 'Menos reuniões', 'Mais autonomia', 'Mais gente no time', 'Melhores ferramentas'] },
  { tipo: 'respostaCurta', enunciado: 'Em uma palavra, como está seu ânimo com o trabalho?' },
  { tipo: 'estrelas', enunciado: 'Como você avalia a comunicação dentro de {p}?' },
  { tipo: 'nota', topico: 'Clareza dos objetivos', enunciado: 'O quanto você entende como seu trabalho contribui para os objetivos da empresa?', pontaEsquerda: 'Não entendo', pontaDireita: 'Entendo bem' },
  { tipo: 'escolhaUnica', enunciado: 'Com que frequência você consegue desconectar fora do horário de trabalho?', opcoes: ['Sempre', 'Quase sempre', 'Às vezes', 'Quase nunca'] },
  { tipo: 'respostaLonga', enunciado: 'Que tipo de apoio da liderança faria diferença para você nos próximos meses?' },
  { tipo: 'nota', topico: 'Equilíbrio com a vida pessoal', enunciado: 'Como você avalia seu equilíbrio entre vida pessoal e trabalho?', pontaEsquerda: 'Desequilibrado', pontaDireita: 'Equilibrado' },
]

const feedback = [
  { tipo: 'nota', topico: 'Recomendação da edição', enunciado: 'De 0 a 5, o quanto você recomendaria esta edição para outras pessoas de {p}?', pontaEsquerda: 'Não recomendaria', pontaDireita: 'Recomendaria' },
  { tipo: 'escolhaUnica', enunciado: 'Como você avalia a duração do encontro?', opcoes: ['Curta demais', 'Boa', 'Longa demais'] },
  { tipo: 'escolhaMultipla', enunciado: 'Quais partes foram mais úteis para você?', opcoes: ['Abertura', 'Apresentações', 'Dinâmicas em grupo', 'Espaço para perguntas', 'Encerramento'] },
  { tipo: 'respostaCurta', enunciado: 'O que você mudaria na próxima edição?' },
  { tipo: 'respostaLonga', enunciado: 'Conte o que mais te marcou nesse período e por quê.' },
  { tipo: 'estrelas', enunciado: 'Qual sua avaliação geral da experiência?' },
  { tipo: 'nota', topico: 'Conteúdo apresentado', enunciado: 'O conteúdo apresentado atendeu suas expectativas?', pontaEsquerda: 'Ficou abaixo', pontaDireita: 'Superou' },
  { tipo: 'escolhaUnica', enunciado: 'Como você avalia a organização e a logística?', opcoes: ['Muito boa', 'Boa', 'Regular', 'Ruim'] },
  { tipo: 'nota', topico: 'Aplicabilidade no dia a dia', enunciado: 'O quanto o que você viu é aplicável no seu dia a dia?', pontaEsquerda: 'Nada aplicável', pontaDireita: 'Muito aplicável' },
  { tipo: 'escolhaUnica', enunciado: 'O horário escolhido funcionou para você?', opcoes: ['Sim, funcionou bem', 'Funcionou com esforço', 'Não funcionou'] },
  { tipo: 'respostaLonga', enunciado: 'Que tema você gostaria de ver na próxima vez?' },
  { tipo: 'escolhaMultipla', enunciado: 'Que formatos você prefere para os próximos encontros?', opcoes: ['Presencial', 'Remoto', 'Híbrido', 'Gravado para assistir depois'] },
  { tipo: 'estrelas', enunciado: 'Como você avalia quem conduziu o encontro?' },
  { tipo: 'respostaCurta', enunciado: 'Em uma frase, qual foi seu principal aprendizado?' },
  { tipo: 'nota', topico: 'Espaço para participar', enunciado: 'O quanto você se sentiu à vontade para participar?', pontaEsquerda: 'Nada à vontade', pontaDireita: 'Muito à vontade' },
  { tipo: 'escolhaUnica', enunciado: 'A comunicação antes do encontro foi suficiente?', opcoes: ['Sim', 'Em parte', 'Não'] },
  { tipo: 'escolhaMultipla', enunciado: 'O que atrapalhou sua participação?', opcoes: ['Conflito de agenda', 'Problemas técnicos', 'Ritmo da apresentação', 'Nada atrapalhou'] },
  { tipo: 'nota', topico: 'Tempo para perguntas', enunciado: 'O quanto o tempo para perguntas foi adequado?', pontaEsquerda: 'Insuficiente', pontaDireita: 'Adequado' },
  { tipo: 'respostaLonga', enunciado: 'Tem algo que você gostaria de dizer a quem organizou e não coube nas perguntas acima?' },
  { tipo: 'estrelas', enunciado: 'Como você avalia o material de apoio distribuído?' },
]

const solicitacao = [
  { tipo: 'nota', topico: 'Processos internos', enunciado: 'De 0 a 5, o quanto os processos internos hoje atendem as necessidades de {p}?', pontaEsquerda: 'Não atendem', pontaDireita: 'Atendem bem' },
  { tipo: 'escolhaUnica', enunciado: 'Qual área concentra a maior parte das suas solicitações?', opcoes: ['Tecnologia', 'Pessoas', 'Financeiro', 'Facilities', 'Jurídico'] },
  { tipo: 'escolhaMultipla', enunciado: 'Que recursos faltam para o seu trabalho hoje?', opcoes: ['Equipamento', 'Licenças de software', 'Treinamento', 'Documentação', 'Apoio de outras áreas'] },
  { tipo: 'respostaCurta', enunciado: 'Qual solicitação você abriria agora, se pudesse abrir uma só?' },
  { tipo: 'respostaLonga', enunciado: 'Descreva um processo interno que atrapalha o seu dia a dia e o que você faria diferente.' },
  { tipo: 'estrelas', enunciado: 'Como você avalia o atendimento às solicitações internas hoje?' },
  { tipo: 'nota', topico: 'Clareza dos canais', enunciado: 'O quanto é claro para você por onde abrir cada tipo de pedido?', pontaEsquerda: 'Nada claro', pontaDireita: 'Muito claro' },
  { tipo: 'escolhaUnica', enunciado: 'Quanto tempo costuma levar até sua solicitação ser respondida?', opcoes: ['Menos de um dia', 'Alguns dias', 'Mais de uma semana', 'Costuma ficar sem resposta'] },
  { tipo: 'escolhaUnica', enunciado: 'Com que frequência você precisa reabrir um pedido já resolvido?', opcoes: ['Nunca', 'Raramente', 'Às vezes', 'Com frequência'] },
  { tipo: 'nota', topico: 'Documentação interna', enunciado: 'O quanto a documentação interna te ajuda a resolver as coisas sozinho?', pontaEsquerda: 'Não ajuda', pontaDireita: 'Ajuda muito' },
  { tipo: 'respostaLonga', enunciado: 'Que necessidade de {p} você acha que ainda não está no radar da empresa?' },
  { tipo: 'escolhaMultipla', enunciado: 'Que tipos de pedido você mais abre?', opcoes: ['Acesso a sistemas', 'Compra ou reposição', 'Dúvida sobre política interna', 'Suporte técnico', 'Ajuste de cadastro'] },
  { tipo: 'escolhaUnica', enunciado: 'Você sabe quem procurar quando um pedido trava?', opcoes: ['Sempre sei', 'Às vezes', 'Quase nunca'] },
  { tipo: 'respostaCurta', enunciado: 'Qual ferramenta interna mais te faz perder tempo?' },
  { tipo: 'nota', topico: 'Cumprimento de prazos', enunciado: 'O quanto os prazos combinados para as solicitações são cumpridos?', pontaEsquerda: 'Raramente', pontaDireita: 'Quase sempre' },
  { tipo: 'estrelas', enunciado: 'Como você avalia a clareza das respostas que recebe?' },
  { tipo: 'escolhaMultipla', enunciado: 'O que melhoraria mais o processo hoje?', opcoes: ['Um canal único', 'Prazos visíveis', 'Acompanhamento do status', 'Mais autonomia para resolver sozinho'] },
  { tipo: 'escolhaUnica', enunciado: 'Você já deixou de abrir um pedido por achar o processo trabalhoso demais?', opcoes: ['Sim, várias vezes', 'Sim, uma ou outra vez', 'Nunca'] },
  { tipo: 'respostaLonga', enunciado: 'Que recurso, se existisse, faria a maior diferença no seu trabalho no próximo trimestre?' },
  { tipo: 'nota', topico: 'Apoio das áreas de suporte', enunciado: 'O quanto você se sente apoiado pelas áreas de suporte?', pontaEsquerda: 'Desamparado', pontaDireita: 'Bem apoiado' },
]

const desligamento = [
  { tipo: 'nota', topico: 'Recomendação da empresa', enunciado: 'De 0 a 5, o quanto você recomendaria a empresa para alguém de {p}?', pontaEsquerda: 'Não recomendaria', pontaDireita: 'Recomendaria' },
  { tipo: 'escolhaUnica', enunciado: 'Qual foi o principal motivo da sua saída?', opcoes: ['Nova oportunidade', 'Remuneração', 'Liderança', 'Falta de crescimento', 'Motivos pessoais'] },
  { tipo: 'escolhaMultipla', enunciado: 'O que pesou na sua decisão?', opcoes: ['Carga de trabalho', 'Reconhecimento', 'Clima do time', 'Perspectiva de carreira', 'Flexibilidade'] },
  { tipo: 'respostaCurta', enunciado: 'O que teria feito você ficar?' },
  { tipo: 'respostaLonga', enunciado: 'Como foi sua experiência ao longo da sua passagem pela empresa?' },
  { tipo: 'estrelas', enunciado: 'Qual sua avaliação geral do tempo em que esteve aqui?' },
  { tipo: 'nota', topico: 'Apoio da liderança direta', enunciado: 'O quanto você se sentiu apoiado pela sua liderança direta?', pontaEsquerda: 'Sem apoio', pontaDireita: 'Muito apoiado' },
  { tipo: 'escolhaUnica', enunciado: 'Como foi seu processo de integração quando entrou?', opcoes: ['Muito bom', 'Bom', 'Regular', 'Ruim'] },
  { tipo: 'nota', topico: 'Atividades combinadas', enunciado: 'O quanto suas atividades correspondiam ao que foi combinado na contratação?', pontaEsquerda: 'Nada parecido', pontaDireita: 'Exatamente' },
  { tipo: 'escolhaUnica', enunciado: 'Você sentiu que tinha clareza sobre seu caminho de carreira?', opcoes: ['Sim', 'Em parte', 'Não'] },
  { tipo: 'respostaLonga', enunciado: 'O que a empresa deveria mudar para segurar boas pessoas em {p}?' },
  { tipo: 'escolhaUnica', enunciado: 'Você chegou a conversar sobre sua insatisfação antes de decidir sair?', opcoes: ['Sim, e fui ouvido', 'Sim, mas não mudou nada', 'Não cheguei a conversar'] },
  { tipo: 'escolhaMultipla', enunciado: 'O que você levaria daqui para o próximo lugar?', opcoes: ['Aprendizados técnicos', 'Relações que construí', 'Jeito de trabalhar', 'Experiência de liderança'] },
  { tipo: 'nota', topico: 'Remuneração x entrega', enunciado: 'O quanto sua remuneração correspondia à sua entrega?', pontaEsquerda: 'Muito abaixo', pontaDireita: 'Compatível' },
  { tipo: 'respostaCurta', enunciado: 'Em uma palavra, como você descreveria o clima do seu time?' },
  { tipo: 'escolhaUnica', enunciado: 'Você voltaria a trabalhar na empresa no futuro?', opcoes: ['Sim, com certeza', 'Talvez', 'Provavelmente não', 'Não'] },
  { tipo: 'estrelas', enunciado: 'Como você avalia o processo de desligamento em si?' },
  { tipo: 'nota', topico: 'Oportunidades de crescer', enunciado: 'O quanto você teve oportunidades de aprender e crescer aqui?', pontaEsquerda: 'Nenhuma', pontaDireita: 'Muitas' },
  { tipo: 'respostaLonga', enunciado: 'Tem algo que você gostaria de dizer e que não coube nas perguntas acima?' },
  { tipo: 'escolhaMultipla', enunciado: 'Que áreas você acha que mais precisam de atenção?', opcoes: ['Liderança', 'Processos', 'Remuneração', 'Carreira', 'Comunicação'] },
]

const BANCOS = { clima, feedback, solicitacao, desligamento }

let sequencia = 0
const proximoId = () => {
  sequencia += 1
  return `p${sequencia}`
}

/* Monta a lista final: pega as `quantidade` primeiras do banco do template e
   troca o {p} pela seleção de participantes. */
/* A faixa de quantas perguntas uma pesquisa pode gerar. Mora aqui, junto de
   quem gera, e `estado.jsx` reexporta: as duas telas que mexem nisso já
   importavam de lá. */
export const PERGUNTAS_MIN = 1
export const PERGUNTAS_MAX = 20

/*
 * Quantas perguntas tirar do banco.
 *
 * Os botões da tela de quantidade não deixam sair da faixa, mas um valor
 * guardado antes disso — ou mexido por fora — passava direto para o `slice`:
 * negativo cortava do fim ("as 10 primeiras" viravam "todas menos 3"),
 * e zero gerava lista vazia. O número volta para a faixa aqui, e o valor
 * estranho é anunciado em vez de aparado calado.
 */
function quantasGerar(quantidade) {
  const n = Math.round(Number(quantidade))
  if (!Number.isFinite(n)) {
    avisarValorDesconhecido('quantidade de perguntas', quantidade)
    return PERGUNTAS_MAX
  }
  const dentro = Math.min(PERGUNTAS_MAX, Math.max(PERGUNTAS_MIN, n))
  if (dentro !== n) avisarValorDesconhecido('quantidade de perguntas', quantidade)
  return dentro
}

export function gerarPerguntas(template, fraseDeParticipantes, quantidade) {
  /* Sem banco para o template não há o que gerar. A lista vazia é a resposta
     honesta — inventar perguntas de outro tema seria pior —, mas quem chama
     precisa saber que foi isso, e não "o banco tinha zero": a tela de
     carregamento para e diz. */
  const banco = daTabela(BANCOS, template, 'template da pesquisa')
  if (!banco) return []

  return banco.slice(0, quantasGerar(quantidade)).map((base) => ({
    ...base,
    id: proximoId(),
    enunciado: base.enunciado.replaceAll('{p}', fraseDeParticipantes),
    obrigatoria: true,
    ...(base.tipo === 'nota' ? { maximo: 5 } : {}),
    ...(base.opcoes ? { opcoes: [...base.opcoes], temOutro: false } : {}),
  }))
}

/*
 * Pergunta nova nasce obrigatória — aqui e na geração acima.
 *
 * Era o que o padrão da pesquisa fazia enquanto as configurações avançadas
 * existiam. Sem elas, o padrão vira este: o caminho comum é querer resposta
 * em todas, e desmarcar as poucas que são opcionais dá menos trabalho do que
 * marcar todas as outras uma a uma.
 */
export function perguntaVazia(tipo) {
  const base = { id: proximoId(), tipo, enunciado: '', obrigatoria: true }
  if (tipo === 'nota') {
    return { ...base, maximo: 5, pontaEsquerda: '', pontaDireita: '' }
  }
  if (tipo === 'escolhaUnica' || tipo === 'escolhaMultipla') {
    return { ...base, opcoes: ['', ''], temOutro: false }
  }
  return base
}

/* Os seis tipos, com os nomes que aparecem para quem monta a pesquisa. Uma
   lista só: o seletor do editor, o título do modal e a grade da pergunta nova
   leem daqui, então o vocabulário é o mesmo nos três. */
export const TIPOS = [
  { id: 'respostaLonga', nome: 'Texto longo' },
  { id: 'respostaCurta', nome: 'Texto curto' },
  { id: 'escolhaMultipla', nome: 'Múltipla seleção' },
  { id: 'escolhaUnica', nome: 'Seleção única' },
  { id: 'nota', nome: 'Avaliação de 0 a X' },
  { id: 'estrelas', nome: 'Nota final' },
]

/*
 * Troca o tipo de uma pergunta guardando o que ainda faz sentido.
 *
 * O enunciado atravessa sempre. As opções atravessam entre seleção única e
 * múltipla, que guardam a mesma coisa; para qualquer outro tipo elas somem,
 * junto com o resto do que era só daquele tipo — deixar campos órfãos no
 * objeto faria o cartão desenhar coisa que a pergunta não tem mais.
 */
export function converterPergunta(pergunta, tipo) {
  if (pergunta.tipo === tipo) return pergunta

  const base = { id: pergunta.id, tipo, enunciado: pergunta.enunciado }
  /* A obrigatoriedade é da pergunta, não do tipo: sobrevive à troca. */
  if (pergunta.obrigatoria !== undefined) base.obrigatoria = pergunta.obrigatoria

  if (tipo === 'nota') {
    return {
      ...base,
      maximo: pergunta.maximo ?? 5,
      pontaEsquerda: pergunta.pontaEsquerda ?? '',
      pontaDireita: pergunta.pontaDireita ?? '',
    }
  }
  if (tipo === 'escolhaUnica' || tipo === 'escolhaMultipla') {
    return {
      ...base,
      opcoes: pergunta.opcoes ?? ['', ''],
      temOutro: pergunta.temOutro ?? false,
      /* Única e múltipla compartilham a mesma lista de opções, então os
         índices que "Marque as opções negativas" guardou continuam apontando
         para a opção certa — só muda quantas a pergunta deixa marcar. */
      ...(pergunta.perguntaExtra ? { perguntaExtra: pergunta.perguntaExtra } : {}),
    }
  }
  return base
}

/* O nome cabe no cabeçalho do detalhe e no cartão de quem responde sem
   empurrar o resto; passando disso o título vira o assunto da tela inteira. */
export const LIMITE_NOME = 80

export const LIMITE_CURTA = 200
export const LIMITE_LONGA = 1200
