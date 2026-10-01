// Modelo de status do colaborador (contexto, "Data model > Status"). O
// status nunca e escolhido a mao: sai do checklist gravado.
//
// Formato gravado no colaborador:
//   tipo:      'CLT' | 'PJ'
//   admissao:  { feitos: [idDoItem, ...] }
//   rescisao:  null | {
//                tipo: id de TIPOS_RESCISAO_CLT ou TIPOS_RESCISAO_PJ,
//                data: 'aaaa-mm-dd' (data do desligamento),
//                avisoPrevio: id de AVISOS_PREVIOS ou null (so CLT),
//                motivo: texto ou null,
//                multa: valor ou null (so PJ),
//                envio: { tipo, valor } ou null (Enviar para do termo),
//                termoGerado: boolean,
//                feitos: [idDoItem, ...],
//              }
//   ausencia:  null | { tipo: idTipoAusencia, inicio: 'aaaa-mm-dd', fim: 'aaaa-mm-dd' }

export const TIPOS = ['CLT', 'PJ']

export const STATUS = {
  PENDENTE: 'pendente',
  EM_ATIVIDADE: 'em_atividade',
  EM_DESLIGAMENTO: 'em_desligamento',
  DESLIGADO: 'desligado',
  FIM_DE_CONTRATO: 'fim_de_contrato',
}

export const STATUS_ROTULOS = {
  [STATUS.PENDENTE]: 'Pendente',
  [STATUS.EM_ATIVIDADE]: 'Em atividade',
  [STATUS.EM_DESLIGAMENTO]: 'Em desligamento',
  [STATUS.DESLIGADO]: 'Desligado',
  [STATUS.FIM_DE_CONTRATO]: 'Fim de contrato',
}

// Ordem das opcoes nos filtros.
export const STATUS_OPCOES = Object.values(STATUS_ROTULOS)

const ITENS_ADMISSAO = {
  CLT: [
    { id: 'contrato_assinado', rotulo: 'Contrato assinado' },
    { id: 'documentos_enviados', rotulo: 'Documentos enviados' },
    { id: 'exame_medico', rotulo: 'Exame médico feito' },
  ],
  PJ: [{ id: 'contrato_assinado', rotulo: 'Contrato assinado' }],
}

// Rotulos do Figma 10355:3986 (CLT) e 10355:7067 (PJ), sem o "recisão" do
// mock. Provisorios ate a revisao trabalhista.
const ITENS_RESCISAO_CLT = [
  { id: 'assinar_termo', rotulo: 'Assinar termo de rescisão' },
  { id: 'guia_saque_fgts', rotulo: 'Enviar guia para saque do FGTS' },
  { id: 'extrato_fgts', rotulo: 'Enviar extrato atualizado do FGTS' },
  { id: 'exame_demissional', rotulo: 'Exame demissional realizado' },
  { id: 'termo_devolvido', rotulo: 'Termo de rescisão assinado e devolvido' },
]

const ITENS_RESCISAO_PJ = [
  { id: 'assinar_termo', rotulo: 'Assinar termo de encerramento' },
  { id: 'pagamentos_pendentes', rotulo: 'Pagamentos pendentes' },
  { id: 'termo_devolvido', rotulo: 'Termo assinado e devolvido' },
]

// Tipos de rescisao, na ordem dos cards (Figma 10355:4796 e 10355:7761).
// `fora`: itens do checklist CLT que nao valem para o tipo (premissa do
// contexto: sem a guia de saque do FGTS em Pedido de demissao e Com justa
// causa). Todo tipo PJ usa os mesmos 3 itens.
const SEM_GUIA = ['guia_saque_fgts']

export const TIPOS_RESCISAO_CLT = {
  sem_justa_causa: { rotulo: 'Sem justa causa', fora: [] },
  com_justa_causa: { rotulo: 'Com justa causa', fora: SEM_GUIA },
  pedido_demissao: { rotulo: 'Pedido de demissão', fora: SEM_GUIA },
  acordo: { rotulo: 'Acordo entre partes', fora: [] },
  fim_contrato_experiencia: { rotulo: 'Fim de contrato de experiência', fora: [] },
}

export const TIPOS_RESCISAO_PJ = {
  fim_contrato: { rotulo: 'Fim de contrato' },
  antecipada_empresa: { rotulo: 'Antecipada pela empresa' },
  antecipada_prestador: { rotulo: 'Antecipada pelo prestador' },
  acordo: { rotulo: 'Acordo entre partes' },
}

// Aviso previo (CLT). Com justa causa nao tem a linha.
export const AVISOS_PREVIOS = {
  trabalhado: 'Trabalhado',
  indenizado: 'Indenizado',
  nao_se_aplica: 'Não se aplica',
}

export function tiposDeRescisao(tipoContrato) {
  if (tipoContrato === 'CLT') return TIPOS_RESCISAO_CLT
  if (tipoContrato === 'PJ') return TIPOS_RESCISAO_PJ
  throw new Error(`Tipo de contrato desconhecido "${tipoContrato}"`)
}

export function rotuloTipoRescisao(colaborador) {
  const tipo = tiposDeRescisao(colaborador.tipo)[colaborador.rescisao?.tipo]
  if (!tipo) {
    throw new Error(`Tipo de rescisão desconhecido "${colaborador.rescisao?.tipo}" no colaborador ${colaborador.id}`)
  }
  return tipo.rotulo
}

export const TIPOS_AUSENCIA = {
  ferias: 'Férias',
  licenca_medica: 'Licença médica',
  licenca_maternidade: 'Licença maternidade',
  licenca_paternidade: 'Licença paternidade',
}

function itensDaRescisao(colaborador) {
  rotuloTipoRescisao(colaborador)
  if (colaborador.tipo === 'PJ') return ITENS_RESCISAO_PJ
  const { fora } = TIPOS_RESCISAO_CLT[colaborador.rescisao.tipo]
  return ITENS_RESCISAO_CLT.filter((item) => !fora.includes(item.id))
}

function marcarFeitos(itens, feitos = []) {
  const feitosSet = new Set(feitos)
  return itens.map((item) => ({ ...item, feito: feitosSet.has(item.id) }))
}

// Itens do checklist que esta valendo agora: o de rescisao, se ela comecou,
// senao o de admissao. Cada item vem com `feito`.
export function getChecklist(colaborador) {
  if (colaborador.rescisao) {
    return marcarFeitos(itensDaRescisao(colaborador), colaborador.rescisao.feitos)
  }
  const itens = ITENS_ADMISSAO[colaborador.tipo]
  if (!itens) {
    throw new Error(`Tipo de contrato desconhecido "${colaborador.tipo}" no colaborador ${colaborador.id}`)
  }
  return marcarFeitos(itens, colaborador.admissao?.feitos)
}

// { id, rotulo, texto, checklist }. `texto` e o que o pill mostra: os dois
// checklists abertos aparecem como "Pendente X/Y" na tabela, no grid e no
// card (Figma 10355:3884); o rotulo "Em desligamento" fica no cabecalho da
// pagina e no filtro. `checklist` so vem com o checklist aberto.
export function getStatus(colaborador) {
  const checklist = getChecklist(colaborador)
  const faltam = checklist.filter((item) => !item.feito).length

  let id
  if (colaborador.rescisao) {
    if (faltam > 0) id = STATUS.EM_DESLIGAMENTO
    else id = colaborador.tipo === 'PJ' ? STATUS.FIM_DE_CONTRATO : STATUS.DESLIGADO
  } else {
    id = faltam > 0 ? STATUS.PENDENTE : STATUS.EM_ATIVIDADE
  }

  const rotulo = STATUS_ROTULOS[id]
  const pendente = faltam > 0
  return {
    id,
    rotulo,
    texto: pendente ? `${STATUS_ROTULOS[STATUS.PENDENTE]} ${faltam}/${checklist.length}` : rotulo,
    checklist: pendente ? checklist : null,
  }
}

export function isEncerrado(status) {
  return status.id === STATUS.DESLIGADO || status.id === STATUS.FIM_DE_CONTRATO
}

export function isPendente(status) {
  return status.id === STATUS.PENDENTE || status.id === STATUS.EM_DESLIGAMENTO
}

// Desligar so existe para quem ainda nao comecou o desligamento.
export function podeDesligar(colaborador) {
  const status = getStatus(colaborador).id
  return status === STATUS.PENDENTE || status === STATUS.EM_ATIVIDADE
}

// "Marcar como feito" de um item do checklist de desligamento. Devolve o
// colaborador novo; no ultimo item ele vira Desligado ou Fim de contrato.
export function marcarItemDaRescisao(colaborador, itemId) {
  if (!colaborador.rescisao) throw new Error(`Colaborador ${colaborador.id} sem desligamento`)
  if (!itensDaRescisao(colaborador).some((item) => item.id === itemId)) {
    throw new Error(`Item "${itemId}" fora do checklist de desligamento de ${colaborador.id}`)
  }
  const feitos = new Set(colaborador.rescisao.feitos)
  feitos.add(itemId)
  return { ...colaborador, rescisao: { ...colaborador.rescisao, feitos: [...feitos] } }
}

// A ausencia so vale enquanto inicio <= hoje <= fim. Datas ISO comparam
// como texto.
export function getAusenciaAtiva(colaborador, hoje) {
  const ausencia = colaborador.ausencia
  if (!ausencia) return null
  if (ausencia.inicio > hoje || ausencia.fim < hoje) return null
  return ausencia
}

// "Férias até 12/10"
export function textoAusencia(ausencia) {
  if (!TIPOS_AUSENCIA[ausencia.tipo]) {
    throw new Error(`Tipo de ausência desconhecido "${ausencia.tipo}"`)
  }
  const [, mes, dia] = ausencia.fim.split('-')
  return `${TIPOS_AUSENCIA[ausencia.tipo]} até ${dia}/${mes}`
}
