import { CampoInline } from '@squad/ui'
import xIcon from '../../assets/icons/X.svg'

/*
 * A casca virou @squad/ui/CampoInline quando o Fluxo de Caixa passou a usar o
 * mesmo campo no resumo de transacao. Aqui fica so o icone local.
 *
 * `salvarAoSair` ligado: clicar fora salva, igual ao Enter, e o valor
 * invalido e descartado. Por isso so um campo fica em edicao: abrir outro
 * tira o foco deste, que salva ou descarta (Shared patterns, Inline edit
 * input). O X de 24px cancela (`limparCancela`); a caixa de 290px vem das
 * --campo-inline-* da .gp-modulo.
 */
function InlineEditField(props) {
  return (
    <CampoInline
      salvarAoSair
      limparCancela
      {...props}
      iconeLimpar={<img src={xIcon} alt="" width={24} height={24} />}
    />
  )
}

export default InlineEditField
