import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import s from './Revisao.module.css'
import { CabecalhoFluxo, RodapeFluxo } from '@squad/ui'
import ListaDePerguntas from '../../components/perguntas/ListaDePerguntas.jsx'
import EditorPergunta from './EditorPergunta.jsx'
import EditorAbertura from './EditorAbertura.jsx'
import ModalConfirmarVoltar from './ModalConfirmarVoltar.jsx'
import ModalCapa from '../../components/ModalCapa.jsx'
import { estiloDaCapa } from '../../lib/capa.js'
import { usePesquisa } from './estado.jsx'
import { alternarObrigatoria, ehObrigatoria } from '../../lib/obrigatorias.js'

/*
 * Revisão das perguntas (Figma 8065:4915).
 *
 * A lista vem do estado do fluxo: cheia quando veio pelo carregamento de um
 * template, vazia quando veio do "Criar pesquisa em Branco". Os cards em si
 * moram em ListaDePerguntas, que a aba Perguntas do detalhe também usa.
 *
 * `emEdicao` guarda o que o editor de pergunta está mexendo: um objeto
 * quando é uma existente, null quando é nova (aí o editor começa pela escolha
 * do tipo). O `false` é "editor fechado" — precisa ser diferente de null.
 *
 * O nome da pesquisa é um dado só: o cabeçalho, o título da Abertura e o
 * campo da tela 1 leem e escrevem o mesmo pesquisa.nome.
 *
 * Passo 5 de 6 na trilha: depois daqui vêm as configurações. O caminho em
 * branco chega aqui vindo do passo 2 — o nome —, então a barra dá um salto:
 * é o que mostra que ele pulou o contador e o prompt.
 */
export default function TelaRevisao() {
  const navigate = useNavigate()
  const { pesquisa, definir, removerPergunta, salvarPergunta, sair } = usePesquisa()
  const [emEdicao, setEmEdicao] = useState(false)
  const [aberturaAberta, setAberturaAberta] = useState(false)
  const [confirmandoVoltar, setConfirmandoVoltar] = useState(false)
  const [capaAberta, setCapaAberta] = useState(false)

  const ehBranco = pesquisa.template === 'blank'
  /* O branco volta para o nome e não tem o que perder; o caminho com
     template volta para o prompt, de onde continuar gera as perguntas de
     novo por cima destas — daí a confirmação. */
  const voltar = () => navigate(ehBranco ? '../nome' : '../prompt')

  return (
    <div className={s.tela}>
      <CabecalhoFluxo
        titulo={pesquisa.nome || 'Nova Pesquisa'}
        onFechar={sair}
      />

      {/* A faixa é a capa: o que for escolhido aqui é o que a pesquisa leva
          para o localStorage quando o fluxo terminar. */}
      <div className={s.faixa} style={estiloDaCapa(pesquisa.capa)}>
        <button
          type="button"
          className={s.editarCapa}
          onClick={() => setCapaAberta(true)}
        >
          Editar Capa
        </button>
      </div>

      <div className={s.coluna}>
        <ListaDePerguntas
          nome={pesquisa.nome}
          abertura={pesquisa.abertura}
          perguntas={pesquisa.perguntas}
          ehObrigatoria={ehObrigatoria}
          onEditarAbertura={() => setAberturaAberta(true)}
          onEditarPergunta={(pergunta) => setEmEdicao(pergunta)}
          onRemoverPergunta={(pergunta) => removerPergunta(pergunta.id)}
          onAlternarObrigatoria={(pergunta) =>
            definir({ perguntas: alternarObrigatoria(pesquisa, pergunta.id).perguntas })
          }
          onAdicionar={() => setEmEdicao(null)}
        />
      </div>

      <RodapeFluxo
        progresso={5 / 6}
        onVoltar={() => (ehBranco ? voltar() : setConfirmandoVoltar(true))}
        onContinuar={() => navigate('../configuracao')}
      />

      {capaAberta ? (
        <ModalCapa
          valor={pesquisa.capa}
          onSalvar={(capa) => {
            definir({ capa })
            setCapaAberta(false)
          }}
          onFechar={() => setCapaAberta(false)}
        />
      ) : null}

      {confirmandoVoltar ? (
        <ModalConfirmarVoltar
          onConfirmar={voltar}
          onCancelar={() => setConfirmandoVoltar(false)}
        />
      ) : null}

      {aberturaAberta ? (
        <EditorAbertura
          nome={pesquisa.nome}
          abertura={pesquisa.abertura}
          definir={definir}
          onFechar={() => setAberturaAberta(false)}
        />
      ) : null}

      {emEdicao !== false ? (
        <EditorPergunta
          pergunta={emEdicao}
          /* Editando, é a posição em que ela já está; criando, é o fim da
             lista — onde `salvarPergunta` a acrescenta. */
          numero={
            emEdicao
              ? pesquisa.perguntas.findIndex((q) => q.id === emEdicao.id) + 1
              : pesquisa.perguntas.length + 1
          }
          onSalvar={(pergunta) => {
            salvarPergunta(pergunta)
            setEmEdicao(false)
          }}
          onFechar={() => setEmEdicao(false)}
        />
      ) : null}
    </div>
  )
}
