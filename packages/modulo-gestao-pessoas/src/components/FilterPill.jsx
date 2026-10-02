import { PilulaFiltro } from '@squad/ui'
import closeIconWhite from '../assets/icons/CloseWhite.svg'

/*
 * Pilula dos paineis de Filtros (Shared patterns, Filter pills): #f4f5f5,
 * 40px; selecionada em preto com o X. A casca e o @squad/ui/PilulaFiltro, a
 * mesma dos filtros de Colaboradores; aqui fica so o icone local. Vale para
 * toda opcao e para o "Ver mais...".
 */
function FilterPill({ selected = false, onClick, children }) {
  return (
    <PilulaFiltro
      selecionada={selected}
      iconeLimpar={<img src={closeIconWhite} width={20} height={20} alt="" />}
      onClick={onClick}
    >
      {children}
    </PilulaFiltro>
  )
}

export default FilterPill
