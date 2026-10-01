// Modelo de status do colaborador (contexto, Topico 1 "Status model" e
// Topico 12). O status nunca e escolhido a mao: sai do checklist gravado.
//
// Formato gravado no colaborador:
//   tipo:      'CLT' | 'PJ'
//   admissao:  { feitos: [idDoItem, ...] }
//   rescisao:  null | { tipo: idTipoRescisao (so CLT), data: 'aaaa-mm-dd', feitos: [...] }
//   ausencia:  null | { tipo: idTipoAusencia, inicio: 'aaaa-mm-dd', fim: 'aaaa-mm-dd' }

export const TIPOS = ['CLT', 'PJ']

export const STATUS = {
  PENDENTE: 'pendente',
  EM_ATIVIDADE: 'em_atividade',
  RESCISAO_PENDENTE: 'rescisao_pendente',
  DESLIGADO: 'desligado',
  FIM_DE_CONTRATO: 'fim_de_contrato',
}

export const STATUS_ROTULOS = {
  [STATUS.PENDENTE]: 'Pendente',
  [STATUS.EM_ATIVIDADE]: 'Em atividade',
  [STATUS.RESCISAO_PENDENTE]: 'Rescisão pendente',
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

// Rotulos provisorios (contexto, Topico 1): ainda sem Figma.
const ITENS_RESCISAO_CLT = [
  { id: 'trct', rotulo: 'TRCT' },
  { id: 'guia_saque_fgts', rotulo: 'Guia de saque do FGTS' },
  { id: 'seguro_desemprego', rotulo: 'Requerimento do seguro-desemprego' },
  { id: 'extrato_fgts', rotulo: 'Extrato do FGTS' },
  { id: 'exame_demissional', rotulo: 'Exame demissional' },
  { id: 'rescisao_assinada', rotulo: 'Rescisão assinada' },
]

const ITENS_RESCISAO_PJ = [
  { id: 'termo_enviado', rotulo: 'Termo de encerramento enviado' },
  { id: 'termo_devolvido', rotulo: 'Termo assinado devolvido' },
  { id: 'ultima_nota_fiscal', rotulo: 'Última nota fiscal' },
]

// Topico 12: quais itens da rescisao CLT valem para cada tipo de rescisao.
const SEM_SEGURO = ['seguro_desemprego']
const SEM_SEGURO_E_GUIA = ['seguro_desemprego', 'guia_saque_fgts']

export const TIPOS_RESCISAO_CLT = {
  sem_justa_causa: { rotulo: 'Sem justa causa', fora: [] },
  com_justa_causa: { rotulo: 'Com justa causa', fora: SEM_SEGURO_E_GUIA },
  pedido_demissao: { rotulo: 'Pedido de demissão', fora: SEM_SEGURO_E_GUIA },
  acordo: { rotulo: 'Acordo entre as partes', fora: SEM_SEGURO },
  fim_contrato_experiencia: { rotulo: 'Fim de contrato de experiência', fora: [] },
}

export const TIPOS_AUSENCIA = {
  ferias: 'Férias',
  licenca_medica: 'Licença médica',
  licenca_maternidade: 'Licença maternidade',
  licenca_paternidade: 'Licença paternidade',
}

function itensDaRescisao(colaborador) {
  if (colaborador.tipo === 'PJ') return ITENS_RESCISAO_PJ
  const tipoRescisao = TIPOS_RESCISAO_CLT[colaborador.rescisao.tipo]
  if (!tipoRescisao) {
    throw new Error(
      `Tipo de rescisão desconhecido "${colaborador.rescisao.tipo}" no colaborador ${colaborador.id}`,
    )
  }
  return ITENS_RESCISAO_CLT.filter((item) => !tipoRescisao.fora.includes(item.id))
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

// { id, rotulo, texto, checklist }. `texto` e o que o pill mostra
// ("Pendente 2/3"); `checklist` so vem nos dois status pendentes.
export function getStatus(colaborador) {
  const checklist = getChecklist(colaborador)
  const faltam = checklist.filter((item) => !item.feito).length

  let id
  if (colaborador.rescisao) {
    if (faltam > 0) id = STATUS.RESCISAO_PENDENTE
    else id = colaborador.tipo === 'PJ' ? STATUS.FIM_DE_CONTRATO : STATUS.DESLIGADO
  } else {
    id = faltam > 0 ? STATUS.PENDENTE : STATUS.EM_ATIVIDADE
  }

  const rotulo = STATUS_ROTULOS[id]
  const pendente = faltam > 0
  return {
    id,
    rotulo,
    texto: pendente ? `${rotulo} ${faltam}/${checklist.length}` : rotulo,
    checklist: pendente ? checklist : null,
  }
}

export function isEncerrado(status) {
  return status.id === STATUS.DESLIGADO || status.id === STATUS.FIM_DE_CONTRATO
}

export function isPendente(status) {
  return status.id === STATUS.PENDENTE || status.id === STATUS.RESCISAO_PENDENTE
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
