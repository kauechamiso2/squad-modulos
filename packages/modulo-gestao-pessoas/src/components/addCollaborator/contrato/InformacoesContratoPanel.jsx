import { PainelLateral } from '@squad/ui'
import closeIcon from '../../../assets/icons/Close.svg'
import pencilIcon from '../../../assets/icons/PencilSimpleLine.svg'
import '../../campos/Botoes.css'
import './Contrato.css'

const VAZIO = '—'

/*
 * Painel "Informações para contrato" - Figma 10338:10720. Abre por cima do
 * fluxo. `linhas`: [{ rotulo, valor, sufixo, sufixoPerto }] na ordem do Figma; vazio
 * mostra "—". O X volta para Informações sem perder nada. O desligamento usa o
 * mesmo painel para o termo de rescisao (10355:4938), com outros textos.
 */
function InformacoesContratoPanel({
  titulo = 'Informações para contrato',
  rotuloSalvarSem = 'Salvar sem contrato',
  rotuloGerar = 'Gerar contrato',
  aberto,
  linhas,
  enviarPara,
  onEditarEnviarPara,
  podeGerar,
  gerando,
  onFechar,
  onSalvarSemContrato,
  onGerarContrato,
}) {
  return (
    <PainelLateral
      className="gp-painel"
      classNameVeu="gp-painel"
      aberto={aberto}
      titulo={titulo}
      iconeFechar={closeIcon}
      onFechar={gerando ? () => {} : onFechar}
      rodape={
        <>
          <button type="button" className="gp-botao-texto" disabled={gerando} onClick={onSalvarSemContrato}>
            {rotuloSalvarSem}
          </button>
          <button type="button" className="gp-botao" disabled={!podeGerar || gerando} onClick={onGerarContrato}>
            {rotuloGerar}
          </button>
        </>
      }
    >
      <div className="contrato-painel__linhas">
        {linhas.map((linha) => (
          <div className="contrato-painel__linha" key={linha.rotulo}>
            <span className="contrato-painel__rotulo">{linha.rotulo}</span>
            <span className={linha.sufixoPerto ? 'contrato-painel__valor contrato-painel__valor--perto' : 'contrato-painel__valor'}>
              {linha.valor ?? VAZIO}
              {linha.valor && linha.sufixo && <span className="contrato-painel__sufixo">{linha.sufixo}</span>}
            </span>
          </div>
        ))}
        <div className="contrato-painel__linha contrato-painel__linha--editavel">
          <span className="contrato-painel__rotulo">Enviar para</span>
          <span className="contrato-painel__valor">{enviarPara ?? VAZIO}</span>
          <button
            type="button"
            className="contrato-painel__editar"
            aria-label="Editar para onde enviar"
            disabled={gerando}
            onClick={onEditarEnviarPara}
          >
            <img src={pencilIcon} width={20} height={20} alt="" />
          </button>
        </div>
      </div>
    </PainelLateral>
  )
}

export default InformacoesContratoPanel
