import { useNavigate } from 'react-router-dom'
import { TEXTO_DE_LEITURA } from '../lib/pesquisas.js'
import { Botao } from '@squad/ui'
import s from './TelaDadosIlegiveis.module.css'
import { MODULE_BASE } from '../routes.js'

/*
 * O que aparece quando não deu para ler o que estava guardado.
 *
 * Não é a mesma coisa que "não encontrado", e por isso é uma tela própria:
 * dizer que a pesquisa não existe quando o que houve foi um armazenamento
 * ilegível manda a pessoa procurar um problema que não é o dela, e sugere
 * que algo foi apagado quando nada foi.
 *
 * A tela também diz o que não fazer: criar ou salvar qualquer coisa agora é
 * o que sobrescreveria o que está lá. O aplicativo recusa essas escritas por
 * conta própria, mas quem está olhando merece saber por quê.
 */
export default function TelaDadosIlegiveis({ motivo }) {
  const navigate = useNavigate()

  return (
    <div className={s.tela}>
      <div className={s.cartao} role="alert">
        <p className={s.titulo}>Não foi possível carregar os dados</p>
        <p className={s.texto}>
          {TEXTO_DE_LEITURA[motivo] ?? TEXTO_DE_LEITURA.ilegivel}
        </p>
        <p className={s.texto}>
          Nada foi apagado. Enquanto isso não se resolver, o aplicativo não
          grava nada por cima do que está guardado.
        </p>
        <Botao variante="marca" onClick={() => navigate(MODULE_BASE, { replace: true })}>
          Ir para as pesquisas
        </Botao>
      </div>
    </div>
  )
}
