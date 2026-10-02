import { gravarDadosDeExemplo, limparDadosDoModulo } from './storage.js'

// Atalhos de dados, sem botao na interface (contexto, "Seed and reset"),
// lidos dos parametros depois da rota do hash, por exemplo
// #/gestao-de-pessoas?seed=exemplo:
//   ?seed=exemplo  grava os dados de exemplo por cima dos atuais;
//   ?reset=1       apaga os dados do modulo.
// O parametro sai da URL depois de aplicado, para nao rodar de novo num
// refresh. Devolve true quando aplicou algum.
export function aplicarAtalhoDeDados() {
  const hash = window.location.hash
  const inicioQuery = hash.indexOf('?')
  if (inicioQuery === -1) return false
  const rota = hash.slice(0, inicioQuery)
  const parametros = new URLSearchParams(hash.slice(inicioQuery + 1))

  let aplicou = false
  if (parametros.get('reset') === '1') {
    limparDadosDoModulo()
    parametros.delete('reset')
    aplicou = true
  }
  if (parametros.get('seed') === 'exemplo') {
    gravarDadosDeExemplo()
    parametros.delete('seed')
    aplicou = true
  }
  if (!aplicou) return false

  const resto = parametros.toString()
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${rota}${resto ? `?${resto}` : ''}`)
  return true
}
