// Regras do "Completar cadastro" e do que a pagina do colaborador lista
// (contexto, "Data model" e secao 5).

import { STATUS, getStatus } from './colaboradorStatus.js'
import { emailValido } from './mascaras.js'
import { pessoasDoRecurso } from './recursos.js'

// Dados bancarios completos: conta inteira (banco, agencia, numero e
// titular) ou uma chave PIX.
export function dadosBancariosCompletos(dados) {
  if (!dados) return false
  const conta = [dados.banco, dados.agencia, dados.numeroConta, dados.titular].every(
    (campo) => String(campo ?? '').trim() !== '',
  )
  return conta || String(dados.chavePix ?? '').trim() !== ''
}

// Recursos que chegam ate a pessoa, cada um uma vez.
export function recursosDoColaborador(colaborador, recursos, colaboradores, hoje) {
  return recursos.filter((recurso) =>
    pessoasDoRecurso(recurso, colaboradores, hoje).some((pessoa) => pessoa.id === colaborador.id),
  )
}

// O que falta do "Completar cadastro". CLT: e-mail, time, reporta para,
// recursos e dados bancarios. PJ: o mesmo, sem recursos.
export function pendenciasDoCadastro(colaborador, recursos, colaboradores, hoje) {
  const faltando = []
  if (!emailValido(colaborador.email)) faltando.push('email')
  if (!colaborador.times?.length) faltando.push('time')
  if (!colaborador.reportaPara) faltando.push('reportaPara')
  if (
    colaborador.tipo === 'CLT' &&
    recursosDoColaborador(colaborador, recursos, colaboradores, hoje).length === 0
  ) {
    faltando.push('recursos')
  }
  if (!dadosBancariosCompletos(colaborador.dadosBancarios)) faltando.push('dadosBancarios')
  return faltando
}

// O alerta da home so aparece para quem esta Em atividade.
export function mostraAlertaDeCadastro(colaborador, recursos, colaboradores, hoje) {
  if (getStatus(colaborador).id !== STATUS.EM_ATIVIDADE) return false
  return pendenciasDoCadastro(colaborador, recursos, colaboradores, hoje).length > 0
}

// Documentos ligados aos itens concluidos do checklist de admissao. O
// documento enviado guarda o nome do arquivo (por exemplo "CNH.png").
export function documentosDoColaborador(colaborador) {
  const feitos = new Set(colaborador.admissao?.feitos ?? [])
  const documentos = []
  if (feitos.has('contrato_assinado')) {
    documentos.push({ nome: colaborador.tipo === 'PJ' ? 'Contrato_PJ' : 'Contrato_CLT', formato: 'pdf' })
  }
  if (feitos.has('documentos_enviados')) {
    const nome = colaborador.documentoEnviado
    if (!nome) throw new Error(`Colaborador ${colaborador.id} com documentos enviados sem o nome do arquivo`)
    documentos.push({ nome, formato: nome.split('.').pop().toLowerCase() })
  }
  if (feitos.has('exame_medico')) documentos.push({ nome: 'Exames_Medico', formato: 'pdf' })
  return documentos
}

// Campos do perfil travam em Em desligamento, Desligado e Fim de contrato.
export function perfilTravado(colaborador) {
  const status = getStatus(colaborador).id
  return status !== STATUS.PENDENTE && status !== STATUS.EM_ATIVIDADE
}
