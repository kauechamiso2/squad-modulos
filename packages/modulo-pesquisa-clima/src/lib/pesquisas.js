import { paraData, fimDoCiclo, proximoCiclo, formatarCurto } from './datas.js'
import { cicloCheio, taxaDe, totalDeParticipantes } from './participacao.js'
import { crescer, materializar } from './respostas.js'
import { avisarValorDesconhecido, daTabela } from './desconhecido.js'
import { MODULE_BASE } from '../routes.js'

/*
 * Guarda e faz evoluir as pesquisas.
 *
 * Não há backend nem processo em segundo plano: tudo vive no localStorage e o
 * status só avança quando a página está aberta. Por isso `avaliar` não é um
 * relógio, e sim uma função que compara o que está guardado com o horário de
 * agora — chamada na carga e de tempos em tempos. Uma pesquisa que deveria ter
 * trocado de status ontem troca no próximo carregamento, de uma vez.
 *
 * A participação de um ciclo é a lista de respostas guardada, e a taxa é a
 * conta que sai dela (lib/participacao.js). O motor faz a simulação crescer
 * acrescentando gente à lista; não existe mais uma porcentagem à parte para a
 * lista ter de alcançar.
 */

const CHAVE = 'squad:pesquisa-clima:pesquisas'

/*
 * Chave usada pela versao standalone do projeto, antes do monorepo. Ficou com
 * hifen onde as chaves do monorepo usam dois-pontos.
 */
const CHAVE_LEGADA = 'squad-pesquisa-clima:pesquisas'

/*
 * Migracao unica: copia o que estava na chave antiga para a nova e remove a
 * antiga. Idempotente - num navegador que nunca rodou a versao antiga, ou que
 * ja migrou, nao faz nada. So copia quando a chave nova ainda nao existe, para
 * nunca sobrescrever dados mais recentes com os legados. Roda em
 * initPesquisaClima(), antes do primeiro render.
 */
export function migrarChaveLegada() {
  let legado
  try {
    legado = localStorage.getItem(CHAVE_LEGADA)
  } catch {
    // Modo privado, cookies bloqueados, storage desativado.
    return
  }
  if (legado === null) return

  try {
    if (localStorage.getItem(CHAVE) === null) {
      localStorage.setItem(CHAVE, legado)
    }
    localStorage.removeItem(CHAVE_LEGADA)
  } catch {
    // Cota cheia: melhor deixar o legado onde esta do que perder os dois.
  }
}

export const INTERVALO_MS = 30000

/* Quanto da participação entra a cada checagem, enquanto o ciclo roda, em
   pontos percentuais do público. Vira gente logo abaixo: é assim que o passo
   acompanha o tamanho do público em vez de valer o mesmo para 5 pessoas e
   para 500. */
const PASSO_MIN = 1
const PASSO_MAX = 5

export const STATUS = {
  rascunho: { texto: 'Rascunho', tom: 'padrao' },
  agendada: { texto: 'Agendada', tom: 'destaque' },
  rodando: { texto: 'Ativa | Rodando', tom: 'positivo' },
  aguardando: { texto: 'Ativa | Aguardando', tom: 'acao' },
  naoAtiva: { texto: 'Não ativa', tom: 'negativo' },
  encerrada: { texto: 'Encerrada', tom: 'padrao' },
}

/*
 * O selo de uma pesquisa cujo status não é nenhum dos seis.
 *
 * Não é um sétimo estado: é o aviso de que o dado daquela linha está errado.
 * Por isso não se parece com os outros — fundo neutro, mas em vermelho e com
 * borda tracejada. Um cinza discreto passaria por "mais um estado normal", e
 * o problema ficaria invisível justamente para quem precisa vê-lo.
 */
export const STATUS_DESCONHECIDO = {
  texto: 'Status desconhecido',
  tom: 'desconhecido',
  desconhecido: true,
}

/*
 * O selo de uma pesquisa, sem confiar no que está guardado.
 *
 * Uma pesquisa com status estranho — armazenamento corrompido, dado editado
 * à mão, migração futura — derrubava a lista inteira: `STATUS[p.status]` dava
 * `undefined` e o `Selo` estourava em `status.tom`. Agora aquela linha aparece
 * marcada e as outras continuam desenhando. `valor` leva o que estava lá, para
 * a tela poder dizer qual é o valor estranho em vez de só que existe um.
 */
export function statusDe(p) {
  const conhecido = daTabela(STATUS, p?.status, 'status da pesquisa')
  return conhecido ?? { ...STATUS_DESCONHECIDO, valor: p?.status }
}

/*
 * O que deu errado na última leitura, ou `null` se não deu.
 *
 * `ler` não pode lançar — a home inteira depende dela —, mas devolver uma
 * lista vazia e calar era pior do que travar: a tela dizia que nunca houve
 * pesquisa nenhuma, e quem tinha vinte não tinha como saber que os dados
 * estavam ilegíveis, e não apagados. Quem desenha lê isto e avisa.
 *
 * Guardado ausente não é erro: quem nunca criou uma pesquisa tem a lista
 * vazia de verdade, e as duas situações não podem falar a mesma coisa.
 */
let erroAoLer = null
export const erroDeLeitura = () => erroAoLer

export const TEXTO_DE_LEITURA = {
  bloqueado:
    'Não foi possível acessar suas pesquisas — o navegador está bloqueando o armazenamento local desta página.',
  formato:
    'Não foi possível carregar suas pesquisas — o que está guardado não tem o formato de uma lista de pesquisas.',
  ilegivel:
    'Não foi possível carregar suas pesquisas — os dados podem estar corrompidos.',
}

export function ler() {
  erroAoLer = null
  let cru
  try {
    cru = localStorage.getItem(CHAVE)
  } catch {
    // Modo privado, cookies bloqueados, storage desativado.
    erroAoLer = 'bloqueado'
    return []
  }

  if (!cru) return []

  try {
    const lista = JSON.parse(cru)
    if (!Array.isArray(lista)) {
      erroAoLer = 'formato'
      return []
    }
    return lista
  } catch {
    erroAoLer = 'ilegivel'
    return []
  }
}

export const ERRO_AO_GRAVAR =
  'Não foi possível salvar suas alterações. O espaço de armazenamento pode estar cheio.'

/*
 * Grava, e diz se conseguiu.
 *
 * Uma pesquisa recorrente com cinco ciclos e uma capa em imagem passa de
 * 150KB, e o localStorage tem poucos megabytes para tudo: estourar a cota é
 * plausível, não hipótese remota. Engolir a falha fazia cada edição parecer
 * salva e sumir no F5 seguinte — quem chama mostra o aviso com o `false`.
 */
export function gravar(lista) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lista))
    return true
  } catch {
    return false
  }
}

export const ERRO_AO_LER_ANTES_DE_GRAVAR =
  'Não é possível salvar agora — não foi possível ler os dados existentes com segurança. Recarregue a página antes de tentar de novo.'

/*
 * Muda o que está guardado. É por aqui que toda escrita passa.
 *
 * Duas coisas que gravar a lista de memória por cima não fazia:
 *
 * Relê antes de mudar. Cada tela carregava a lista inteira e regravava tudo,
 * então duas abas abertas se atropelavam: a aba A duplicava, a aba B gravava
 * qualquer outra coisa a partir do que tinha lido antes, e a cópia da A
 * sumia sem aviso. `mudar` recebe a lista de agora, e não a de quando a tela
 * montou — o que outra aba acrescentou continua lá.
 *
 * Recusa quando a leitura falhou. Com o armazenamento ilegível, `ler`
 * devolve lista vazia; gravar por cima trocava tudo o que existia por um
 * item só, calado. Não dá para mesclar com o que não se conseguiu ler, então
 * a escrita não acontece e quem chamou avisa.
 */
export function atualizarGuardadas(mudar) {
  const atual = ler()
  if (erroDeLeitura()) return { ok: false, erro: ERRO_AO_LER_ANTES_DE_GRAVAR }

  const proxima = mudar(atual)
  if (!gravar(proxima)) return { ok: false, erro: ERRO_AO_GRAVAR }
  return { ok: true, lista: proxima }
}

export const ERRO_PESQUISA_SUMIU =
  'Esta pesquisa não está mais guardada — ela pode ter sido apagada em outra aba. A alteração não foi salva.'

/* Os três atalhos que cobrem quase toda escrita da aplicação. */

/*
 * Muda uma pesquisa pelo id.
 *
 * Some da lista entre a tela abrir e a alteração acontecer — outra aba
 * apagou — e o `map` não achava ninguém para trocar: a lista voltava igual e
 * a escrita se dizia bem-sucedida. A alteração ia embora calada, e a tela
 * ainda mandava para a lista sem explicar. Agora a ausência é dita.
 */
export function trocarGuardada(id, transformar) {
  let achou = false
  const r = atualizarGuardadas((lista) =>
    lista.map((p) => {
      if (p.id !== id) return p
      achou = true
      return transformar(p)
    }),
  )
  if (r.ok && !achou) return { ok: false, sumiu: true, erro: ERRO_PESQUISA_SUMIU }
  return r
}

export const acrescentarGuardada = (pesquisa) =>
  atualizarGuardadas((lista) => [...lista, pesquisa])

export const removerGuardada = (id) =>
  atualizarGuardadas((lista) => lista.filter((p) => p.id !== id))

const novoId = () =>
  `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`

export const ehRecorrente = (p) => p.configuracao?.recorrencia === 'Recorrente'

/* Os limites do número de ciclos. Um é a menor repetição que ainda é uma
   repetição; cem voltas é mais do que qualquer pesquisa precisa e segura o
   campo contra um número digitado sem querer. */
export const CICLOS_MIN = 1
export const CICLOS_MAX = 100

/*
 * Até quando a pesquisa existe, quando alguém estipulou uma data.
 *
 * É o limite de vida dela, e não o de um ciclo: o "Prazo pra respostas" diz
 * quanto tempo cada volta fica aberta, este diz quando não há mais voltas.
 * `null` é "sem data" — a recorrente repete indefinidamente, como sempre fez.
 *
 * Só vale para recorrente. Uma Única já acaba sozinha quando o prazo do seu
 * único ciclo vence, e por isso a linha nem aparece para ela.
 */
export function fimDaPesquisa(p) {
  if (!ehRecorrente(p)) return null
  const marcado = p.configuracao?.encerramento
  if (!marcado || marcado.semData) return null
  return paraData(marcado.data, marcado.hora)
}

/*
 * Quantas voltas a pesquisa dá, quando alguém estipulou um número.
 *
 * É o irmão de `fimDaPesquisa`: um marca o fim por data, este por contagem.
 * `null` é "sem teto" — indefinido, que é o padrão, e o que uma Única sempre
 * foi (ela tem um ciclo só, e o fim dela vem do prazo, não daqui).
 *
 * Número que não se lê também é `null`, e sai anunciado: um teto ilegível não
 * pode encerrar pesquisa nenhuma calado.
 */
export function tetoDeCiclos(p) {
  if (!ehRecorrente(p)) return null
  const ciclos = p.configuracao?.ciclos
  if (!ciclos || ciclos.tipo !== 'definido') return null
  const n = Math.round(Number(ciclos.quantidade))
  if (!Number.isInteger(n) || n < CICLOS_MIN || n > CICLOS_MAX) {
    avisarValorDesconhecido('número de ciclos', ciclos.quantidade)
    return null
  }
  return n
}

/* Início do ciclo: a data de envio, ou agora quando marcado "imediatamente". */
function inicioAgendado(configuracao, agora) {
  if (configuracao?.envio?.imediato) return agora
  return paraData(configuracao?.envio?.data, configuracao?.envio?.hora)
}

/*
 * Monta a pesquisa a partir do estado do fluxo. Uma pesquisa nasce agendada
 * quando dá para saber quando ela começa, e rascunho quando não dá.
 */
export function criarDoFluxo(pesquisa, agora = new Date()) {
  const inicio = inicioAgendado(pesquisa.configuracao, agora)
  const base = {
    id: novoId(),
    criadoEm: agora.toISOString(),
    atualizadoEm: agora.toISOString(),
    nome: pesquisa.nome || 'Nova Pesquisa',
    participantes: pesquisa.participantes,
    template: pesquisa.template,
    abertura: pesquisa.abertura,
    capa: pesquisa.capa,
    prompt: pesquisa.prompt,
    quantidade: pesquisa.quantidade,
    perguntas: pesquisa.perguntas,
    configuracao: pesquisa.configuracao,
    ciclos: 0,
    respostas: [],
    cicloInicio: inicio ? inicio.toISOString() : null,
    cicloFim: null,
    status: inicio ? 'agendada' : 'rascunho',
  }
  // Já passou da hora de enviar? Entra rodando direto.
  return avaliar(base, agora)
}

/*
 * Guarda o fluxo pela metade como rascunho.
 *
 * Não passa pelo motor: um rascunho não tem ciclo, data nem status a avançar
 * — é o que foi preenchido até aqui, esperando alguém voltar. O nome cai num
 * padrão quando ainda não foi escrito, senão a linha da lista ficaria vazia.
 */
export function criarRascunho(pesquisa, agora = new Date(), passo = '') {
  return {
    /* Em que tela o X foi clicado. É o que faz retomar cair no mesmo lugar
       em vez de recomeçar do primeiro passo. */
    passo,
    id: novoId(),
    criadoEm: agora.toISOString(),
    atualizadoEm: agora.toISOString(),
    nome: pesquisa.nome?.trim() || 'Pesquisa sem nome',
    participantes: pesquisa.participantes,
    template: pesquisa.template,
    abertura: pesquisa.abertura,
    capa: pesquisa.capa,
    prompt: pesquisa.prompt,
    quantidade: pesquisa.quantidade,
    perguntas: pesquisa.perguntas,
    configuracao: pesquisa.configuracao,
    ciclos: 0,
    respostas: [],
    cicloInicio: null,
    cicloFim: null,
    status: 'rascunho',
  }
}

/*
 * Grava no lugar do rascunho que originou o fluxo, ou no fim da lista quando
 * a pesquisa é nova.
 *
 * O id e o `criadoEm` do rascunho sobrevivem: é a mesma linha da home, que
 * saiu de rascunho e virou pesquisa — duplicá-la deixaria as duas lá.
 */
export function guardar(lista, pesquisa, idAnterior) {
  if (!idAnterior) return [...lista, pesquisa]
  const anterior = lista.find((p) => p.id === idAnterior)
  const mesma = {
    ...pesquisa,
    id: idAnterior,
    criadoEm: anterior?.criadoEm ?? pesquisa.criadoEm,
  }
  return anterior
    ? lista.map((p) => (p.id === idAnterior ? mesma : p))
    : [...lista, mesma]
}

/*
 * Uma cópia é uma pesquisa nova com o mesmo questionário: leva o que descreve
 * a pesquisa e nada do que ela viveu. Respostas, histórico de ciclos e o
 * registro de alterações ficam com o original — sem isso a cópia nascia
 * mostrando participação que nunca coletou.
 */
export function duplicar(p, agora = new Date()) {
  return {
    ...p,
    id: novoId(),
    nome: `${p.nome} (cópia)`,
    criadoEm: agora.toISOString(),
    atualizadoEm: agora.toISOString(),
    status: 'rascunho',
    ciclos: 0,
    simuladoEm: undefined,
    // `taxa` e `anterior` não são mais escritos; seguem limpos aqui por causa
    // das pesquisas guardadas antes de eles serem aposentados.
    taxa: undefined,
    taxaEm: undefined,
    anterior: undefined,
    respostas: [],
    historico: undefined,
    alteracoes: undefined,
    passo: undefined,
    cicloInicio: null,
    cicloFim: null,
  }
}

/*
 * Começa um ciclo agora mesmo — usado pelo Play e pela virada de recorrência.
 *
 * A virada guardava o ciclo que acabou num campo `anterior`, para o detalhe
 * ter o que comparar. Não guarda mais: quem mostra o ciclo passado é o
 * cartão "Taxa de resposta anterior", e ele lê o histórico guardado
 * (`taxasAnteriores`), que tem todos os ciclos fechados e não só o último.
 */
function iniciarCiclo(p, quando) {
  return {
    ...p,
    status: 'rodando',
    /* Ciclo novo, participação do zero: a lista do ciclo que acabou fica com
       ele, no histórico. Vazia de propósito, e não ausente — ausente é o que
       marca uma pesquisa guardada antes de a lista existir. */
    respostas: [],
    simuladoEm: quando.toISOString(),
    cicloInicio: quando.toISOString(),
    cicloFim: fimDoCiclo(quando, p.configuracao?.prazo)?.toISOString() ?? null,
    atualizadoEm: quando.toISOString(),
  }
}

/*
 * Fecha o ciclo em curso, e é aqui — e só aqui — que `ciclos` anda.
 *
 * Contar na abertura fazia uma pesquisa agendada e esquecida acordar com
 * ciclos que ninguém pôde responder: bastava a data de envio ter passado. Um
 * ciclo conta quando cumpre o percurso dele — vence o prazo, enche, ou alguém
 * o encerra —, nunca por ter começado.
 */
/*
 * O retrato do ciclo que acabou de fechar, do jeito que ele foi.
 *
 * A aba Ciclos inventava cada linha quando ela aparecia: sorteava uma taxa por
 * hash e gerava respostas próprias, sem relação com o que o motor tinha
 * medido. O mesmo ciclo aparecia com um número no Geral e outro na tabela, e
 * as datas eram recalculadas para trás a cada passada — dois ciclos chegavam
 * a mostrar o mesmo dia.
 *
 * Agora o registro nasce aqui, no instante em que o ciclo fecha, com o que
 * ele de fato colheu: as respostas guardadas, o público que ele tinha, as
 * perguntas como estavam, e as datas de verdade. Depois de escrito ninguém
 * mexe — é um retrato, não uma conta a refazer.
 */
function retratoDoCiclo(p, numero, quando) {
  const inicio = p.cicloInicio ? new Date(p.cicloInicio) : quando
  const prazo = fimDoCiclo(inicio, p.configuracao?.prazo)
  return {
    id: `${p.id}_c${numero}`,
    numero,
    inicio: inicio.toISOString(),
    fim: quando.toISOString(),
    /* Fechou antes do prazo que ele teria: foi pausado no meio. É o que a
       coluna Atividade marca. */
    cedo: Boolean(prazo && quando < prazo),
    convidados: totalDeParticipantes(p.participantes),
    /* Cópias, não referências: editar a pesquisa depois não pode mudar o que
       foi perguntado nem o que foi respondido neste ciclo. */
    perguntas: (p.perguntas || []).map((q) => ({ ...q })),
    respostas: (p.respostas || []).map((r) => ({ ...r })),
  }
}

function fecharCiclo(p, quando, status) {
  const contados = (p.ciclos ?? 0) + 1
  /* Uma Única tem um ciclo e só. Pausar fecha, retomar reabre, o prazo fecha
     de novo — e nada disso pode virar dois. O teto está aqui, no único ponto
     que conta, para valer por qualquer caminho. */
  const ciclos = ehRecorrente(p) ? contados : Math.min(1, contados)
  /* Retomar desconta o ciclo para ele contar de novo ao fechar; então o
     retrato que já existe com este número é o mesmo ciclo, e o novo o
     substitui — o que vale é como ele terminou. */
  const anteriores = (p.historico || []).filter((c) => c.numero !== ciclos)
  return {
    ...p,
    status,
    ciclos,
    historico: [...anteriores, retratoDoCiclo(p, ciclos, quando)],
    cicloFim: quando.toISOString(),
    atualizadoEm: quando.toISOString(),
  }
}

/*
 * Volta a receber respostas sem abrir nada: o mesmo ciclo, com o prazo que
 * ele sempre teve e as respostas que já tinha.
 *
 * É o que o Play faz numa Única pausada. Ela tem um ciclo só, então "iniciar"
 * ali não pode significar um segundo período — significa destravar o que
 * ficou pela metade. Se o prazo original já passou enquanto estava pausada, o
 * motor fecha o ciclo na volta seguinte, que é a resposta honesta: a janela
 * dela acabou.
 */
function retomarCiclo(p, agora) {
  const inicio = p.cicloInicio ? new Date(p.cicloInicio) : agora
  return {
    ...p,
    status: 'rodando',
    /* Devolve o que o fechamento contou: este ciclo voltou a correr, então
       ainda não cumpriu o percurso. Ele conta de novo quando fechar — uma
       vez, não duas. */
    ciclos: Math.max(0, (p.ciclos ?? 0) - 1),
    simuladoEm: agora.toISOString(),
    cicloInicio: inicio.toISOString(),
    cicloFim: fimDoCiclo(inicio, p.configuracao?.prazo)?.toISOString() ?? null,
    atualizadoEm: agora.toISOString(),
  }
}

/*
 * O Play da home e o "Aceitando respostas" ligado.
 *
 * Numa recorrente é sempre um ciclo novo. Numa Única entre ciclos não existe
 * ciclo novo: ela retoma o único que tem.
 */
export function forcarInicio(p, agora = new Date()) {
  if (!ehRecorrente(p) && p.status === 'aguardando') return retomarCiclo(p, agora)
  return iniciarCiclo(p, agora)
}

/*
 * Tira a pesquisa do ar — o interruptor "Publicar formulário" desligado, e
 * só ele. Pausar não passa por aqui: quem pausa fecha o ciclo e continua no
 * ar, o que é `encerrarCiclo`.
 */
export function despublicar(p, agora = new Date()) {
  return { ...p, status: 'naoAtiva', atualizadoEm: agora.toISOString() }
}

/* No ar (o interruptor "Publicar formulário") e recebendo respostas (o
   "Aceitando respostas"). São dois estados derivados do mesmo status: o
   formulário publicado é o que tem ciclo, com ou sem ele correndo agora. */
const PUBLICADAS = ['agendada', 'rodando', 'aguardando']

export const estaPublicada = (p) => PUBLICADAS.includes(p.status)

export const aceitandoRespostas = (p) => p.status === 'rodando'

/*
 * "Encerrada" é o fim, e agora vale para os dois tipos: a Única que já saiu
 * a sua vez, e a recorrente que chegou à data de encerramento. Reabrir
 * qualquer uma das duas contrariaria o que a tela diz. Quem quer mandar de
 * novo duplica, que é o caminho que a lista já oferece.
 */
export const ehFinal = (p) => p.status === 'encerrada'

/*
 * Quem abre o link de resposta consegue responder?
 *
 * Só com o ciclo correndo. Estar no ar não basta: agendada ainda não saiu,
 * aguardando está entre ciclos e não guarda o que chegar, e fora do ar é fora
 * do ar. Antes o portão era "publicada", e por isso quem abria o link de uma
 * pausada respondia normalmente, e quem abria o de uma agendada respondia
 * para o nada — a resposta entrava e a próxima poda a tirava.
 *
 * A outra metade é ter quem responda: com a lista do tamanho do público,
 * todo mundo já respondeu e não há mais o que coletar neste ciclo.
 */
export const aceitaResposta = (p) => aceitandoRespostas(p) && !cicloCheio(p)

/*
 * Republica uma pesquisa que estava fora do ar. Volta a existir, mas sem
 * receber respostas: quem quiser isso liga o outro interruptor.
 *
 * O relógio do ciclo é reancorado em `agora`. Com a âncora velha, o motor
 * veria o próximo ciclo já vencido e começaria a receber respostas sozinho —
 * exatamente o que republicar não deve fazer.
 */
export function publicar(p, agora = new Date()) {
  return {
    ...p,
    status: 'aguardando',
    cicloInicio: agora.toISOString(),
    cicloFim: null,
    atualizadoEm: agora.toISOString(),
  }
}

/*
 * Fecha o ciclo em curso sem tirar a pesquisa do ar — a mesma virada que o
 * motor faz quando o prazo vence, só que agora. O fim vai para `cicloFim`
 * porque é ele que diz quando o ciclo acabou de verdade, e não o prazo que
 * não chegou a vencer.
 *
 * É o que pausar faz, em todos os lugares onde pausar existe: o botão da
 * home, o portão da aba Perguntas e o "Aceitando respostas" desligado. Uma
 * pesquisa pausada continua ativa — está entre ciclos, não fora do ar —, e
 * por isso vai para "Ativa | Aguardando" e não para "Não ativa".
 */
export function encerrarCiclo(p, agora = new Date()) {
  return fecharCiclo(p, agora, 'aguardando')
}

/*
 * O link que a pessoa recebe para responder — a vista de quem responde, não o
 * detalhe interno.
 *
 * Com o # no meio: sem ele o GitHub Pages procura um arquivo em
 * /<repo>/responder/x, que não existe, e devolve 404. A rota mora depois do
 * #, que o servidor nem chega a ver.
 *
 * BASE_URL é o caminho da publicação (hoje '/', '/<repo>/' quando for para o
 * Pages) e MODULE_BASE é o ponto de montagem do módulo dentro do app. Os dois
 * são necessários: sem BASE_URL o link quebra no Pages, sem MODULE_BASE ele
 * cai na home do monorepo em vez da vista de responder.
 */
export const linkDaPesquisa = (p) =>
  `${window.location.origin}${import.meta.env.BASE_URL}#${MODULE_BASE}/responder/${p.id}`

/*
 * Quantas pessoas entram numa passada da simulação: um passo de 1 a 5 pontos
 * do público, convertido em gente, nunca menos de uma. `crescer` corta no
 * que ainda cabe, então isto não precisa olhar quantas já responderam.
 */
function quantasEntram(p) {
  const passo = PASSO_MIN + Math.floor(Math.random() * (PASSO_MAX - PASSO_MIN + 1))
  const total = totalDeParticipantes(p.participantes)
  return Math.max(1, Math.round((passo / 100) * total))
}

/*
 * Uma pesquisa por vez, comparando o guardado com `agora`. Roda em laço porque
 * a página pode ter ficado fechada tempo suficiente para vencer mais de um
 * ciclo — sem isso, uma recorrente mensal esquecida por um trimestre voltaria
 * atrasada em vez de acertar o ciclo atual.
 */
export function avaliar(p, agora = new Date()) {
  if (p.status === 'rascunho' || p.status === 'encerrada' || p.status === 'naoAtiva') {
    return p
  }

  let atual = p
  for (let volta = 0; volta < 240; volta += 1) {
    const inicio = atual.cicloInicio ? new Date(atual.cicloInicio) : null
    const fim = atual.cicloFim ? new Date(atual.cicloFim) : null

    if (atual.status === 'agendada') {
      if (!inicio || agora < inicio) return atual
      /* Começa agora, e não na data marcada que já passou. A página pode ter
         ficado meses fechada, e ancorar no passado abria um ciclo com o prazo
         já vencido — que fechava na mesma passada, e a recorrente ainda
         emendava os seguintes. Ninguém pôde responder a nenhum deles: a
         pesquisa não estava no ar. O que houve foi um envio atrasado, e é
         daqui que ele conta. */
      atual = iniciarCiclo(atual, agora)
      continue
    }

    if (atual.status === 'rodando') {
      /* Três formas de o ciclo acabar: o prazo vencer, todo o público já ter
         respondido, ou a pesquisa chegar à data de encerramento. A segunda
         costuma chegar antes, e sem ela o selo dizia "Ativa | Rodando"
         enquanto o link de resposta já dizia que a pesquisa tinha encerrado.
         A terceira acaba com a pesquisa, e não só com o ciclo. */
      const acaba = fimDaPesquisa(atual)
      const cheio = cicloCheio(atual)
      const prazoVenceu = fim && agora >= fim
      const chegouAoFim = acaba && agora >= acaba
      if (!cheio && !prazoVenceu && !chegouAoFim) return atual

      /* Quando o ciclo acabou de verdade: o mais cedo entre os motivos que
         valeram. Encher acontece agora; os outros dois têm hora marcada. */
      const motivos = []
      if (cheio) motivos.push(agora)
      if (prazoVenceu) motivos.push(fim)
      if (chegouAoFim) motivos.push(acaba)
      const quando = new Date(Math.min(...motivos.map(Number)))

      /* Acabou a pesquisa, e não só o ciclo, quando ela não se repete, quando
         a data de encerramento já tinha chegado nesse momento, ou quando esta
         volta é a última das estipuladas — `fecharCiclo` conta esta, então o
         teto é comparado já com ela somada. */
      const teto = tetoDeCiclos(atual)
      const ultima = teto !== null && (atual.ciclos ?? 0) + 1 >= teto
      const final = !ehRecorrente(atual) || (acaba && quando >= acaba) || ultima
      atual = fecharCiclo(atual, quando, final ? 'encerrada' : 'aguardando')
      continue
    }

    if (atual.status === 'aguardando') {
      /* Só recorrente volta a rodar sozinha. O motor nunca põe uma Única em
         "aguardando" — ela vai de rodando para encerrada —, mas o
         interruptor "Aceitando respostas" põe, e aí ela não pode reabrir um
         ciclo sozinha um mês depois. */
      if (!inicio || !ehRecorrente(atual)) return atual
      /* Passou da data de encerramento: não há próximo ciclo a abrir, e a
         pesquisa acabou. O ciclo anterior já fechou e já foi contado, então
         aqui só o selo muda — `cicloFim` continua sendo quando ele acabou. */
      const acaba = fimDaPesquisa(atual)
      /* Ou o número de voltas estipulado já foi cumprido. O ciclo anterior
         pode ter fechado como "aguardando" antes de o teto existir — baixar o
         número no meio é o caso —, e é aqui que ele encontra o fim. */
      const teto = tetoDeCiclos(atual)
      const cumpriu = teto !== null && (atual.ciclos ?? 0) >= teto
      if ((acaba && agora >= acaba) || cumpriu) {
        return { ...atual, status: 'encerrada', atualizadoEm: agora.toISOString() }
      }
      const proximo = proximoCiclo(
        inicio,
        atual.configuracao?.frequencia,
        atual.configuracao,
      )
      /* Sem frequência conhecida o motor não sabe quando a próxima volta
         começa, e não vai adivinhar: a pesquisa fica onde está. */
      if (!proximo || agora < proximo) return atual
      /* O ciclo que venceria agora já teria acabado? Então a página ficou
         fechada por mais de um período inteiro, e nenhum deles esteve no ar:
         o selo nunca virou "Rodando" e o link nunca abriu. Replicá-los daria
         ciclos de 0% que ninguém pôde responder e linhas de histórico
         inventadas. Em vez disso, um só recomeço, a partir de agora. */
      const fimDoProximo = fimDoCiclo(proximo, atual.configuracao?.prazo)
      const perdido = fimDoProximo && agora >= fimDoProximo
      atual = iniciarCiclo(atual, perdido ? agora : proximo)
      continue
    }

    return atual
  }
  return atual
}

/*
 * Passa a lista pelo motor e faz a simulação de quem está rodando crescer.
 *
 * Crescer é acrescentar respostas ao fim da lista da pesquisa — nunca mexer
 * em quem já está lá. É isso que faz uma exclusão durar: o que foi apagado
 * não volta, e a simulação continua a partir do tamanho que a lista tem
 * agora, não do que uma porcentagem guardada dizia.
 *
 * O crescimento é preso ao relógio, não à quantidade de vezes que alguém
 * chamou: `simuladoEm` guarda quando entrou gente pela última vez e só passa
 * de novo depois de um intervalo cheio. Sem isso a simulação andaria a cada
 * montagem, e ir e voltar entre a lista e o detalhe — que rodam o mesmo
 * motor — a inflaria a cada clique.
 *
 * Aqui também é onde as pesquisas guardadas antes de a lista virar a verdade
 * ganham a lista delas, uma vez só: `materializar` converte a taxa velha e o
 * `mudou` faz quem chamou gravar o resultado.
 */
export function avaliarLista(lista, agora = new Date()) {
  let mudou = false
  const nova = lista.map((p) => {
    let atualizada = avaliar(materializar(p, agora), agora)
    if (atualizada.status === 'rodando' && !cicloCheio(atualizada)) {
      const ultima = atualizada.simuladoEm ? new Date(atualizada.simuladoEm) : null
      if (!ultima || agora - ultima >= INTERVALO_MS) {
        atualizada = {
          ...crescer(atualizada, quantasEntram(atualizada), agora),
          simuladoEm: agora.toISOString(),
        }
        /* A entrada pode ter completado o público. Passa pelo motor outra vez
           para o ciclo fechar agora, e não daqui a meio minuto. */
        atualizada = avaliar(atualizada, agora)
      }
    }
    if (atualizada !== p) mudou = true
    return atualizada
  })
  return { lista: nova, mudou }
}

/*
 * O que a confirmação do Play — e do "Aceitando respostas" ligado — precisa
 * dizer. Mora aqui, junto da ação, porque as duas telas que a fazem têm de
 * prometer a mesma coisa, e porque o que ela promete depende do que a ação
 * vai fazer: numa Única entre ciclos, isso não é abrir um período novo.
 */
export function avisoDeInicio(p) {
  if (!ehRecorrente(p) && p.status === 'aguardando') {
    return {
      titulo: 'Voltar a receber respostas?',
      texto: `"${p.nome}" volta a aceitar respostas agora, no mesmo ciclo em que parou e com o prazo que ele já tinha. Como ela não se repete, nenhum ciclo novo é criado e o que já foi respondido continua valendo.`,
      rotulo: 'Voltar a receber',
    }
  }
  return {
    titulo: 'Iniciar agora?',
    texto: `"${p.nome}" começa imediatamente e passa a receber respostas, ignorando a data de envio agendada. Um novo ciclo é iniciado a partir de agora.`,
    rotulo: 'Iniciar',
  }
}

/* ---- o que a linha da tabela mostra ---- */

export function botaoDe(p) {
  /* Status que o motor não conhece não ganha botão: oferecer o Play numa
     linha cujo dado já está errado é convidar a rodar o motor em cima dela. */
  if (!daTabela(STATUS, p.status, 'status da pesquisa')) return null
  if (p.status === 'rascunho' || p.status === 'encerrada') return null
  if (p.status === 'rodando') return ehRecorrente(p) ? 'pausar' : null
  return 'iniciar'
}

/*
 * A data por trás da coluna Evento, para quem precisa da data de verdade e
 * não do texto formatado — o filtro de Período, por exemplo. `null` é a
 * mesma coisa que o "—" da coluna: não há data para anunciar.
 */
export function dataDoEvento(p) {
  if (p.status === 'agendada') return p.cicloInicio ? new Date(p.cicloInicio) : null
  if (p.status === 'rodando') return p.cicloFim ? new Date(p.cicloFim) : null
  if (p.status === 'encerrada') return p.cicloFim ? new Date(p.cicloFim) : null
  if (p.status === 'aguardando') {
    /* Uma Única não tem próxima: ela está entre o ciclo que pausou e o fim.
       A coluna Status já diz "Ativa | Aguardando", então aqui não há evento
       nenhum a anunciar — anunciar uma data de repetição seria inventá-la. */
    if (!ehRecorrente(p) || !p.cicloInicio) return null
    return proximoCiclo(new Date(p.cicloInicio), p.configuracao?.frequencia, p.configuracao)
  }
  return null
}

function eventoDe(p) {
  const data = dataDoEvento(p)
  if (!data) return '—'
  if (p.status === 'agendada') return `Começa: ${formatarCurto(data.toISOString())}`
  if (p.status === 'rodando') return `Encerra: ${formatarCurto(data.toISOString())}`
  if (p.status === 'encerrada') return `Encerrada: ${formatarCurto(data.toISOString())}`
  if (p.status === 'aguardando') return `Próxima: ${formatarCurto(data.toISOString())}`
  return '—'
}

export function paraLinha(p, rotuloDoPublico) {
  const rascunho = p.status === 'rascunho'
  return {
    id: p.id,
    nome: p.nome,
    publico: rascunho ? '—' : rotuloDoPublico(p.participantes) || '—',
    tipo: rascunho ? '—' : ehRecorrente(p) ? 'Recorrente' : 'Única',
    status: statusDe(p),
    evento: eventoDe(p),
    taxa: rascunho || p.status === 'agendada' ? '—' : `${taxaDe(p)}%`,
    ciclos: rascunho ? '—' : String(p.ciclos),
    transporte: botaoDe(p),
  }
}
