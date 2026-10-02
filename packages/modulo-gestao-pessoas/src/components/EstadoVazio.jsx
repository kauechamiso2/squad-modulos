import plusIcon from '../assets/icons/Plus.svg'
import colaboradoresIlustracao from '../assets/illustrations/colaboradores.svg'
import timesIlustracao from '../assets/illustrations/times.svg'
import recursosIlustracao from '../assets/illustrations/recursos.svg'
import './PageHeader.css'
import './EstadoVazio.css'

const ABAS = {
  colaboradores: { ilustracao: colaboradoresIlustracao, titulo: 'Nenhum colaborador adicionado' },
  times: { ilustracao: timesIlustracao, titulo: 'Nenhum time adicionado' },
  recursos: { ilustracao: recursosIlustracao, titulo: 'Nenhum recurso adicionado' },
}

/*
 * Empty state das abas - Figma 10379:2546 (Colaboradores 10379:2547, Times
 * 10379:2755, Recursos 10379:2955). So quando a aba nao tem nenhum item;
 * busca ou filtro sem resultado nao usa este bloco. Bloco de 428px: a
 * ilustracao de 428x200, o titulo, o subtitulo e o "Novo" do cabecalho, que
 * abre o modal Novo.
 */
function EstadoVazio({ aba, onNovo }) {
  const { ilustracao, titulo } = ABAS[aba]
  return (
    <div className="estado-vazio">
      <img className="estado-vazio__ilustracao" src={ilustracao} width={428} height={200} alt="" />
      <div className="estado-vazio__textos">
        <p className="estado-vazio__titulo">{titulo}</p>
        <p className="estado-vazio__subtitulo">Você pode começar a adicionar no botão abaixo</p>
      </div>
      <button type="button" className="page-header__new-button" onClick={onNovo}>
        Novo
        <img src={plusIcon} width={24} height={24} alt="" />
      </button>
    </div>
  )
}

export default EstadoVazio
