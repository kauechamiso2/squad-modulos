import s from './Selo.module.css'
import { STATUS_DESCONHECIDO } from '../lib/pesquisas.js'
import { daTabela } from '../lib/desconhecido.js'

/* Pílula de status. Nasceu na linha da lista e agora o cartão do detalhe usa
   a mesma, então mora aqui em vez de num dos dois. */
const TONS = {
  positivo: s.positivo,
  destaque: s.destaque,
  acao: s.acao,
  negativo: s.negativo,
  padrao: s.padrao,
  desconhecido: s.desconhecido,
}

/*
 * Um selo sem tom conhecido — ou sem selo nenhum — não derruba a tela em
 * volta: vira o aviso de status desconhecido. É a segunda trava, depois de
 * `statusDe`; quem chega aqui por outro caminho também não estoura.
 *
 * Quando dá para saber qual era o valor guardado, ele vai no `title` e no
 * nome acessível: quem for consertar o dado precisa saber o que está lá, e
 * "Status desconhecido" sozinho não diz.
 */
export default function Selo({ status }) {
  const tom = daTabela(TONS, status?.tom, 'tom do selo')
  const seguro = tom ? status : STATUS_DESCONHECIDO
  const classe = tom ?? s.desconhecido

  /* `valor` vem de `statusDe`, com o status que estava guardado. Sem ele,
     o que há de estranho é o próprio tom — é esse que vale nomear. */
  const valor = status?.valor ?? status?.tom
  const detalhe =
    seguro.desconhecido && valor !== undefined && valor !== null
      ? `${seguro.texto}: ${JSON.stringify(valor)}`
      : undefined

  return (
    <span className={`${s.selo} ${classe}`} title={detalhe} aria-label={detalhe}>
      {seguro.texto}
    </span>
  )
}
