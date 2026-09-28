import { apenasDigitos, cnpjValido, caixaDeNomeEmpresarial } from './documentos.js'

/*
 * Busca o nome da empresa por CNPJ na BrasilAPI, que espelha a base publica da
 * Receita Federal e nao pede chave.
 *
 * Existe por causa da anotacao 2279:96450 do Figma: "Ao digitar o CNPJ, o
 * sistema busca a razao social e o nome fantasia na base publica da Receita
 * Federal e ja preenche o nome da empresa. Assim, o usuario pula a etapa de
 * digitar o nome."
 *
 * Vale so para CNPJ. Nome e CPF nao tem preenchimento automatico - a anotacao
 * 2279:96452 explica por que: "o nome ligado a um CPF e dado pessoal,
 * protegido pela LGPD, e nao existe uma base publica para consultar".
 *
 * Preferimos o nome fantasia; quando ele vem vazio cai na razao social, que e
 * tambem o caso do MEI que a anotacao cita ("nesse caso, mostramos o nome do
 * titular" - no MEI a razao social e o nome da pessoa).
 *
 * A base devolve tudo em caixa alta ("PETROBRAS - EDISE"); o Figma escreve em
 * caixa normal, entao o nome passa por caixaDeNomeEmpresarial.
 *
 * Falhar aqui nunca bloqueia o fluxo: quem chama trata o null abrindo o campo
 * de nome vazio para digitar a mao.
 */

export const URL_BASE = 'https://brasilapi.com.br/api/cnpj/v1'

export async function buscarPorCnpj(cnpj, { sinal } = {}) {
  if (!cnpjValido(cnpj)) return null
  const resposta = await fetch(`${URL_BASE}/${apenasDigitos(cnpj)}`, { signal: sinal })
  if (!resposta.ok) return null
  const dados = await resposta.json()
  const nome = caixaDeNomeEmpresarial(dados?.nome_fantasia || dados?.razao_social || '')
  return nome ? { nome, razaoSocial: dados?.razao_social ?? null } : null
}
