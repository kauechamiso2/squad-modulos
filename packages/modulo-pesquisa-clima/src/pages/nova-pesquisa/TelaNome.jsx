import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import s from './Nome.module.css'
import { FluxoLayout, IconeBotao } from '@squad/ui'
import ModalParticipantes from './ModalParticipantes.jsx'
import { usePesquisa, rotuloParticipantes, temParticipantes } from './estado.jsx'
import { LIMITE_NOME } from './bancoDePerguntas.js'

import caretRight from '../../assets/icons/CaretRight.svg'

/*
 * Nome e participantes (Figma 8195:1430), segundo passo do fluxo — depois da
 * escolha do template.
 *
 * É aqui que o fluxo passa a ter o que perder: o passo anterior só escolhe um
 * template, e sair dele não descarta nada. Por isso é desta tela em diante
 * que o X pergunta se é para guardar rascunho.
 *
 * O modal de participantes abre por estado local, não por rota: ele é um
 * passo dentro desta tela, e voltar dele não deveria mexer no histórico.
 *
 * O cabeçalho ainda diz "Nova Pesquisa": o nome só passa a ser o título
 * depois daqui, quando já existe um nome para mostrar.
 */
export default function TelaNome() {
  const navigate = useNavigate()
  const { pesquisa, definir, definirParticipantes, sair } = usePesquisa()
  const [modalAberto, setModalAberto] = useState(false)

  const podeContinuar =
    pesquisa.nome.trim() !== '' && temParticipantes(pesquisa.participantes)

  /* Onde os dois caminhos se separam: com template há quantidade e prompt a
     escolher antes de gerar; em branco não há o que gerar, e a lista de
     perguntas — vazia, com só a Abertura — vem logo. */
  const ehBranco = pesquisa.template === 'blank'

  return (
    <>
      <FluxoLayout
        titulo="Nova Pesquisa"
        progresso={2 / 6}
        continuarDesabilitado={!podeContinuar}
        onFechar={sair}
        /* O Voltar recua um passo, para a escolha do template — não sai do
           fluxo. Quem sai é o X. */
        onVoltar={() => navigate('..')}
        onContinuar={() => navigate(ehBranco ? '../revisao' : '../perguntas')}
      >
        <div className={s.conteudo}>
          <input
            className={s.campoGrande}
            type="text"
            maxLength={LIMITE_NOME}
            placeholder="Nome da Pesquisa"
            value={pesquisa.nome}
            onChange={(e) => definir({ nome: e.target.value })}
            aria-label="Nome da Pesquisa"
          />

          <div className={s.bloco}>
            <p className={s.rotulo}>Para quem é essa Pesquisa?</p>
            <div className={s.linha}>
              <button
                type="button"
                className={s.linhaTexto}
                onClick={() => setModalAberto(true)}
              >
                <span className={s.linhaChave}>Participantes</span>
                <span className={s.linhaValor}>
                  {rotuloParticipantes(pesquisa.participantes)}
                </span>
              </button>
              <IconeBotao
                src={caretRight}
                rotulo="Escolher participantes"
                onClick={() => setModalAberto(true)}
              />
            </div>
          </div>
        </div>
      </FluxoLayout>

      {modalAberto ? (
        <ModalParticipantes
          selecao={pesquisa.participantes}
          onSalvar={(selecao) => {
            definirParticipantes(selecao)
            setModalAberto(false)
          }}
          onFechar={() => setModalAberto(false)}
        />
      ) : null}
    </>
  )
}
