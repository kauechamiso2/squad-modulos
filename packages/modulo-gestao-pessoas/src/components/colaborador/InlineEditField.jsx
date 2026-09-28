import { CampoInline } from '@squad/ui'
import closeIcon from '../../assets/icons/Close.svg'

/*
 * A casca virou @squad/ui/CampoInline quando o Fluxo de Caixa passou a usar o
 * mesmo campo no resumo de transacao. Aqui fica so o icone local.
 *
 * `salvarAoSair` fica desligado: aqui clicar fora sempre descartou.
 */
function InlineEditField(props) {
  return (
    <CampoInline
      {...props}
      iconeLimpar={<img src={closeIcon} alt="Cancelar" width={16} height={16} />}
    />
  )
}

export default InlineEditField
