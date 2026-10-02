import circleDashedIcon from '../../assets/icons/CircleDashed.svg'
import checkCircleIcon from '../../assets/icons/CheckCircle.svg'

/*
 * Checklist so leitura do pill de status (Figma 10331:3927 e 10331:4551).
 * Recebe os itens prontos - { id, rotulo, feito } - para servir tanto a
 * admissao quanto a rescisao. Clicar num item nao faz nada, nem abre o
 * colaborador pela linha.
 */
function ChecklistPopover({ itens }) {
  return (
    <span className="checklist-popover" onClick={(event) => event.stopPropagation()}>
      <span className="checklist-popover__caixa" role="list">
        {itens.map((item) => (
          <span className="checklist-popover__item" role="listitem" key={item.id}>
            <img
              src={item.feito ? checkCircleIcon : circleDashedIcon}
              width={20}
              height={20}
              alt={item.feito ? 'Feito' : 'Pendente'}
            />
            <span className="checklist-popover__rotulo">{item.rotulo}</span>
          </span>
        ))}
      </span>
    </span>
  )
}

export default ChecklistPopover
