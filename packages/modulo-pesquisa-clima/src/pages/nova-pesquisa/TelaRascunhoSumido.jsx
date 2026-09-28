import { useNavigate } from 'react-router-dom'
import s from './Carregando.module.css'
import { Botao } from '@squad/ui'
import { MODULE_BASE } from '../../routes.js'

/*
 * O rascunho que a rota pede não existe mais: apagado, link velho, id
 * digitado errado.
 *
 * Antes daqui, o fluxo abria em branco. Parecia uma pesquisa nova, e era:
 * salvar no fim criava uma segunda linha na lista, sem que ninguém tivesse
 * pedido uma pesquisa nova — quem clicou queria continuar uma que já
 * existia, e o que ela tinha preenchido não estava ali.
 *
 * Uma tela, e não um aviso passageiro na home: sumir em 2,5s é pouco para
 * explicar por que o que se clicou não abriu.
 */
export default function TelaRascunhoSumido() {
  const navigate = useNavigate()

  return (
    <div className={s.tela}>
      <div className={s.falha} role="alert">
        <p className={s.falhaTitulo}>Rascunho não encontrado</p>
        <p className={s.falhaTexto}>
          Este rascunho não está mais guardado — ele pode ter sido apagado, ou o
          endereço pode estar errado. Nada foi criado no lugar dele.
        </p>
        <Botao variante="marca" onClick={() => navigate(MODULE_BASE, { replace: true })}>
          Voltar para as pesquisas
        </Botao>
      </div>
    </div>
  )
}
