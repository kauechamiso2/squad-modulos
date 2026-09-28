import { ModalConfirmar } from '@squad/ui'

/*
 * Confirmação ao sair da revisão para trás, no caminho com template.
 *
 * Só aparece nesse caminho: voltar leva ao prompt, e mexer ali refaz a
 * geração — as perguntas revisadas até aqui se perdem. No caminho em branco
 * não há nada gerado, então o Voltar é direto.
 */
export default function ModalConfirmarVoltar({ onConfirmar, onCancelar }) {
  return (
    <ModalConfirmar
      titulo="Voltar para o prompt?"
      texto="As perguntas desta pesquisa já foram geradas. Se você mudar o prompt, o número de perguntas ou os participantes, elas são geradas de novo e as edições e exclusões feitas aqui se perdem."
      rotuloConfirmar="Voltar"
      onConfirmar={onConfirmar}
      onCancelar={onCancelar}
    />
  )
}
