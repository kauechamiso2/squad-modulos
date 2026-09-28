import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import s from './Configuracao.module.css'
import { CabecalhoFluxo, Interruptor, LinhaResumo, RodapeFluxo } from '@squad/ui'
import Aviso from '../../components/Aviso.jsx'
import ModalParticipantes from './ModalParticipantes.jsx'
import { usePesquisa, rotuloParticipantes } from './estado.jsx'
import {
  guardar,
  criarDoFluxo,
  atualizarGuardadas,
} from '../../lib/pesquisas.js'
import {
  ModalCiclos,
  textoDeCiclos,
  ModalDataEnvio,
  ModalRecorrencia,
  ModalFrequencia,
  ModalPrazo,
  ModalMensagemFinal,
} from './ModaisConfiguracao.jsx'
import { diasDoPrazo, textoDeDataHora } from '../../lib/datas.js'
import { MODULE_BASE } from '../../routes.js'

/*
 * Último passo do fluxo (Figma 8195:1786).
 *
 * Os rótulos são os do Figma, com uma exceção: "Frequencia" ganhou o acento
 * que falta no arquivo.
 *
 * O modal de configurações avançadas saiu daqui, e o que ele controlava
 * deixou de ser escolha: a barra de progresso aparece sempre, as perguntas
 * saem na ordem em que foram montadas e cada uma diz por si se é
 * obrigatória. A "Data de Encerramento" saiu junto; o campo dela continua
 * guardado porque o motor de status ainda o lê.
 *
 * Os modais abrem por estado local, não por rota: são passos dentro desta
 * tela, e voltar de um não deveria mexer no histórico do navegador.
 *
 * Data e hora vêm dos campos nativos de data e hora; o valor mostrado na
 * lista é montado a partir do que foi escolhido.
 */
function textoDeEnvio({ imediato, data, hora }) {
  return imediato ? 'Imediatamente' : textoDeDataHora(data, hora)
}

function textoDePrazo(prazo) {
  const { tipo, periodo, data, hora } = prazo
  if (tipo === 'data') return textoDeDataHora(data, hora)
  if (tipo === 'dias') {
    /* Os dias que o ciclo vai durar, os mesmos que o motor usa. */
    const dias = diasDoPrazo(prazo)
    if (dias === null) return 'Dias'
    return `${dias} ${dias === 1 ? 'dia' : 'dias'}`
  }
  return periodo
}

export default function TelaConfiguracao() {
  const navigate = useNavigate()
  const { pesquisa, definir, definirConfiguracao, idDoRascunho, sair } = usePesquisa()
  const [modal, setModal] = useState(null)
  const [aviso, setAviso] = useState('')
  const limparAviso = useCallback(() => setAviso(''), [])

  const c = pesquisa.configuracao
  const fechar = () => setModal(null)
  /* Todo modal salva do mesmo jeito: grava o campo e fecha. */
  const salvar = (campo) => (valor) => {
    definirConfiguracao({ [campo]: valor })
    fechar()
  }

  return (
    <div className={s.tela}>
      {/* Do nome em diante o cabeçalho é o nome da pesquisa. Sem nome
          guardado — um rascunho antigo retomado direto aqui — sobra o
          título do fluxo. */}
      <CabecalhoFluxo titulo={pesquisa.nome || 'Nova Pesquisa'} onFechar={sair} />

      <div className={s.miolo}>
        <div className={s.coluna}>
          <div className={s.lista}>
            <p className={s.secao}>Configurações</p>

            <LinhaResumo
              rotulo="Participantes"
              valor={rotuloParticipantes(pesquisa.participantes)}
              onAbrir={() => setModal('participantes')}
            />
            <LinhaResumo
              rotulo="Respostas anônimas"
              controle={
                <Interruptor
                  ligado={c.respostasAnonimas}
                  rotulo="Respostas anônimas"
                  onAlternar={() =>
                    definirConfiguracao({
                      respostasAnonimas: !c.respostasAnonimas,
                    })
                  }
                />
              }
            />
            <LinhaResumo
              rotulo="Data e hora de envio"
              valor={textoDeEnvio(c.envio)}
              onAbrir={() => setModal('envio')}
            />
            <LinhaResumo
              rotulo="Tipo"
              valor={c.recorrencia}
              onAbrir={() => setModal('recorrencia')}
            />
            {/* Sem recorrência não há frequência nem ciclos que façam
                sentido: a Única roda uma vez e acaba. */}
            {c.recorrencia === 'Recorrente' ? (
              <>
                <LinhaResumo
                  rotulo="Frequência"
                  valor={c.frequencia}
                  onAbrir={() => setModal('frequencia')}
                />
                {/* Quantas voltas a recorrente dá antes de parar. */}
                <LinhaResumo
                  rotulo="Número de ciclos"
                  valor={textoDeCiclos(c.ciclos)}
                  onAbrir={() => setModal('ciclos')}
                />
              </>
            ) : null}
            <LinhaResumo
              rotulo="Prazo pra respostas"
              valor={textoDePrazo(c.prazo)}
              onAbrir={() => setModal('prazo')}
            />
            <LinhaResumo
              rotulo="Mensagem final"
              valor={c.mensagemFinal}
              cortar
              onAbrir={() => setModal('mensagem')}
            />
          </div>
        </div>
      </div>

      <RodapeFluxo
        progresso={6 / 6}
        rotuloContinuar="Salvar Pesquisa"
        onVoltar={() => navigate('../revisao')}
        onContinuar={() => {
          // Grava antes de sair: a home lê o localStorage ao montar, então a
          // pesquisa nova já aparece na lista sem recarregar a página.
          // Retomando um rascunho, entra no lugar dele: a linha é a mesma,
          // agora com status de verdade.
          //
          // Sem conseguir gravar, o fluxo não sai: mandar para a home diria
          // que a pesquisa foi criada, e ela não estaria lá.
          const r = atualizarGuardadas((lista) =>
            guardar(lista, criarDoFluxo(pesquisa), idDoRascunho),
          )
          if (r.ok) navigate(MODULE_BASE)
          else setAviso(r.erro)
        }}
      />

      {modal === 'participantes' ? (
        <ModalParticipantes
          selecao={pesquisa.participantes}
          onSalvar={(participantes) => {
            definir({ participantes })
            fechar()
          }}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'envio' ? (
        <ModalDataEnvio
          valor={c.envio}
          onSalvar={salvar('envio')}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'recorrencia' ? (
        <ModalRecorrencia
          valor={c.recorrencia}
          onSalvar={salvar('recorrencia')}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'frequencia' ? (
        <ModalFrequencia
          valor={c.frequencia}
          onSalvar={salvar('frequencia')}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'ciclos' ? (
        <ModalCiclos
          valor={c.ciclos}
          envio={c.envio}
          frequencia={c.frequencia}
          onSalvar={salvar('ciclos')}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'prazo' ? (
        <ModalPrazo
          valor={c.prazo}
          onSalvar={salvar('prazo')}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'mensagem' ? (
        <ModalMensagemFinal
          valor={c.mensagemFinal}
          onSalvar={salvar('mensagemFinal')}
          onFechar={fechar}
        />
      ) : null}

      <Aviso texto={aviso} onSumir={limparAviso} />
    </div>
  )
}
