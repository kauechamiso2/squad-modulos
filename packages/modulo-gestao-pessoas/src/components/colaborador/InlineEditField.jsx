import { CampoInline } from '@squad/ui'
import closeIcon from '../../assets/icons/Close.svg'

/*
 * A casca virou @squad/ui/CampoInline quando o Fluxo de Caixa passou a usar o
 * mesmo campo no resumo de transacao. Aqui fica so o icone local.
 *
 * `salvarAoSair` ligado: o original passou a salvar ao clicar fora, igual ao
 * Enter. So o X descarta - o botao tem preventDefault no mousedown, entao o
 * blur nunca chega antes dele.
 */
function InlineEditField(props) {
  return (
    <CampoInline
      salvarAoSair
      {...props}
      iconeLimpar={<img src={closeIcon} alt="Cancelar" width={16} height={16} />}
    />
  )
}

export default InlineEditField
