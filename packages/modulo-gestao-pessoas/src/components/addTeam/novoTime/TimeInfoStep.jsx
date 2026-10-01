import { useState } from 'react'
import CltShell from '../../addCollaborator/clt/CltShell.jsx'
import { LinhaFluxo } from '../../campos/CamposFluxo.jsx'
import { DescricaoPanel, LiderPanel } from './TimePaineis.jsx'
import '../../campos/Botoes.css'
import '../../addCollaborator/clt/CltShell.css'
import './NovoTimeSteps.css'

const LIMITE_DESCRICAO = 40

/*
 * Passo 4 - Figma 10342:12977 (linhas 10342:12985). O Figma nao mostra o
 * lider nem a descricao salvos: a linha mostra o nome do lider ou o comeco da
 * descricao no lugar de "Adicionar", e o clique reabre o painel.
 */
function TimeInfoStep({
  leaderId,
  onLeaderChange,
  memberOrder,
  candidatos,
  colaboradores,
  descricao,
  onDescricaoChange,
  progress,
  onBack,
  onClose,
  onCreate,
}) {
  const [painel, setPainel] = useState(null)
  // Os paineis ficam montados para animar a saida; a chave nova a cada
  // abertura zera o rascunho deles.
  const [aberturas, setAberturas] = useState(0)
  const abrir = (qual) => {
    setAberturas((total) => total + 1)
    setPainel(qual)
  }
  const fechar = () => setPainel(null)
  const porId = new Map(colaboradores.map((colaborador) => [colaborador.id, colaborador]))
  const membros = memberOrder.map((id) => porId.get(id)).filter(Boolean)
  const lider = leaderId ? porId.get(leaderId) ?? null : null
  const resumo =
    descricao.length > LIMITE_DESCRICAO ? `${descricao.slice(0, LIMITE_DESCRICAO)}…` : descricao

  return (
    <>
      <CltShell
        title="Novo time"
        onClose={onClose}
        progress={progress}
        footerLeft={
          <button type="button" className="gp-botao-texto" onClick={onBack}>
            Voltar
          </button>
        }
        footerRight={
          <button type="button" className="gp-botao" onClick={onCreate}>
            Criar time
          </button>
        }
      >
        <div className="clt-shell__content">
          <h1 className="clt-shell__title">
            Finalize com algumas
            <br />
            informações adicionais.
          </h1>
          <div>
            <LinhaFluxo rotulo="Líder do time">
              <button type="button" className="linha-fluxo__botao" onClick={() => abrir('lider')}>
                {lider ? lider.name : 'Adicionar'}
              </button>
            </LinhaFluxo>
            <LinhaFluxo rotulo="Descrição">
              <button type="button" className="linha-fluxo__botao" onClick={() => abrir('descricao')}>
                {descricao ? resumo : 'Adicionar'}
              </button>
            </LinhaFluxo>
          </div>
        </div>
      </CltShell>

      {aberturas > 0 && (
        <LiderPanel
          key={`lider-${aberturas}`}
          aberto={painel === 'lider'}
          valor={leaderId}
          membros={membros}
          candidatos={candidatos}
          onFechar={fechar}
          onSalvar={(id) => {
            onLeaderChange(id)
            fechar()
          }}
        />
      )}
      {aberturas > 0 && (
        <DescricaoPanel
          key={`descricao-${aberturas}`}
          aberto={painel === 'descricao'}
          valor={descricao}
          onFechar={fechar}
          onSalvar={(texto) => {
            onDescricaoChange(texto)
            fechar()
          }}
        />
      )}
    </>
  )
}

export default TimeInfoStep
