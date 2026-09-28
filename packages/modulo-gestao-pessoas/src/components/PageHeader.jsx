import plusIcon from '../assets/icons/Plus.svg'
import caretLeftIcon from '../assets/icons/CaretLeft.svg'
import graduationCapIcon from '../assets/icons/GraduationCap.svg'
import { IconButton } from '@squad/ui'
import './PageHeader.css'

function PageHeader({ title, onNovoClick, onBack }) {
  return (
    <div className="page-header">
      <div className="page-header__left">
        <IconButton
          icon={caretLeftIcon}
          alt="Voltar"
          className="icon-button--overlay"
          onClick={onBack}
        />
        <h1 className="page-header__title">{title}</h1>
      </div>
      <div className="page-header__right">
        <IconButton
          icon={graduationCapIcon}
          alt="Tutorial"
          className="icon-button--overlay"
        />
        <button
          type="button"
          className="page-header__new-button"
          onClick={onNovoClick}
        >
          Novo
          <img src={plusIcon} width={24} height={24} alt="" />
        </button>
      </div>
    </div>
  )
}

export default PageHeader
