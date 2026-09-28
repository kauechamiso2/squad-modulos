import { createContext, useContext, useMemo, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { X } from '@phosphor-icons/react'
import { ModalConfirmar } from '@squad/ui'
import * as Transacoes from '../../lib/transacoes.js'
import * as Categorias from '../../lib/categorias.js'
import { hojeIso } from '../../lib/datas.js'
import { MODULE_BASE } from '../../routes.js'

/*
 * Provider do fluxo de nova transacao, parametrizado por tipo.
 *
 * E a rota-mae: o estado nasce ao entrar em /nova-entrada ou /nova-saida e
 * morre ao sair, sem virar estado global - mesmo padrao do estado.jsx do
 * Pesquisa de Clima.
 *
 * `tipo` decide toda a copy da secao: o Figma tem duas secoes espelhadas
 * (2279:94236 Entrada e 2279:97361 Saida) com os mesmos passos.
 */
const Contexto = createContext(null)

export const useFluxo = () => {
  const ctx = useContext(Contexto)
  if (!ctx) throw new Error('useFluxo fora do provider')
  return ctx
}

/* Copy das duas secoes, lida dos frames. */
export const COPY = {
  entrada: {
    /* Usado em texto corrido ("Nova entrada em Vendas B2B", "vincular
       entrada"). Nao da para usar o `tipo` cru: ele e 'saida' sem acento,
       porque e valor de dado, e apareceria assim na tela. */
    substantivo: 'entrada',
    tituloFluxo: 'Nova entrada',
    tituloCategoria: 'Qual categoria você gostaria\nde adicionar uma nova entrada?',
    tituloValor: 'Coloque o valor da entrada',
    comunsEm: 'Entradas comuns em',
    primeiraVez: 'Faça sua primeira entrada em',
    papelContato: 'pagador',
    tituloContato: 'Insira os dados de quem será o pagador:',
    tituloInformacoes: 'Adicione algumas informações dessa entrada:',
    status: Transacoes.STATUS_ENTRADA,
    rotuloData: 'Data de recebimento',
    tituloResumo: 'Resumo de entrada',
    rotuloPapel: 'Pagador',
    toast: { titulo: 'Nova entrada', descricao: 'adicionada com sucesso' },
  },
  saida: {
    substantivo: 'saída',
    tituloFluxo: 'Nova saída',
    tituloCategoria: 'Qual categoria você gostaria\nde adicionar uma nova saída?',
    tituloValor: 'Coloque o valor da saída',
    comunsEm: 'Saídas comuns em',
    primeiraVez: 'Faça sua primeira saída em',
    papelContato: 'recebedor',
    tituloContato: 'Insira os dados de quem será o recebedor:',
    tituloInformacoes: 'Adicione algumas informações dessa saída:',
    status: Transacoes.STATUS_SAIDA,
    rotuloData: 'Data de pagamento',
    tituloResumo: 'Resumo de saída',
    rotuloPapel: 'Recebedor',
    toast: { titulo: 'Nova saída', descricao: 'adicionada com sucesso' },
  },
}

function PesquisaProvider({ tipo, onFinalizar }) {
  const navigate = useNavigate()
  const [transacoesIniciais] = useState(() => Transacoes.listar())
  const [categoriaId, setCategoriaId] = useState(null)
  const [valorCentavos, setValorCentavos] = useState(0)
  const [nome, setNome] = useState('')
  const [contatoId, setContatoId] = useState(null)
  /* Valor escolhido direto do resultado da busca, sem virar contato salvo. */
  const [pagadorAvulso, setPagadorAvulso] = useState(null)
  const [status, setStatus] = useState(tipo === 'entrada' ? 'recebido' : 'pago')
  const [data, setData] = useState(() => hojeIso())
  const [repete, setRepete] = useState('nao')
  const [regraMensal, setRegraMensal] = useState('dia_fixo')
  const [observacao, setObservacao] = useState('')
  const [confirmarSaida, setConfirmarSaida] = useState(false)

  const copy = COPY[tipo]

  /*
   * O status depende da data (Figma 2279:96596): com data futura o segmentado
   * inverte a ordem, "A receber"/"A pagar" fica selecionado e o concluido fica
   * desabilitado - nao da para ter recebido algo que ainda vai acontecer.
   * Voltar para hoje restaura a ordem e a selecao originais.
   */
  const [concluido, pendente] = copy.status.map((st) => st.id)
  const dataFutura = data > hojeIso()
  const statusVisiveis = dataFutura ? [...copy.status].reverse() : copy.status

  const escolherData = (nova) => {
    setData(nova)
    if (nova > hojeIso()) setStatus(pendente)
    else if (status === pendente) setStatus(concluido)
  }

  /*
   * Nome padrao da transacao: "Nova entrada em {Categoria}". E o que o titulo
   * do passo 3 ja mostrava, e e o nome de verdade da transacao - quem nao
   * edita esta aceitando esse nome, nao deixando a transacao sem nome.
   */
  const categoriaEscolhida = categoriaId ? Categorias.porId(categoriaId) : null
  const nomePadrao = `Nova ${copy.substantivo} em ${categoriaEscolhida?.nome ?? ''}`.trim()
  const nomeFinal = nome.trim() || nomePadrao

  const sair = () => {
    // So pergunta se ha algo a perder.
    const sujo = categoriaId || valorCentavos > 0 || nome.trim()
    if (sujo) setConfirmarSaida(true)
    else navigate(MODULE_BASE)
  }

  const finalizar = () => {
    const { criada } = Transacoes.criar({
      tipo, nome: nomeFinal, valorCentavos, categoriaId, contatoId,
      /* Vinculo sem cadastro: guarda o texto formatado, porque a coluna
         Contato mostra exatamente o que foi vinculado quando nao ha contato
         salvo (Figma, linha y=9936). */
      contatoAvulso: contatoId ? null : pagadorAvulso,
      status, data, repete, regraMensal, observacao: observacao.trim(),
    })
    onFinalizar?.(copy.toast)
    navigate(MODULE_BASE)
    return criada
  }

  const valor = useMemo(() => ({
    tipo, copy, transacoesIniciais,
    categoriaId, setCategoriaId,
    valorCentavos, setValorCentavos,
    nome, setNome, nomePadrao, nomeFinal,
    contatoId, setContatoId,
    pagadorAvulso, setPagadorAvulso,
    status, setStatus, statusVisiveis, dataFutura,
    data, setData, escolherData,
    repete, setRepete,
    regraMensal, setRegraMensal,
    observacao, setObservacao,
    sair, finalizar,
  }), [tipo, copy, transacoesIniciais, categoriaId, valorCentavos, nome, contatoId, pagadorAvulso, status, data, repete, regraMensal, observacao])

  return (
    <Contexto.Provider value={valor}>
      <div className="fluxo-caixa-casca">
        <Outlet />
      </div>
      {confirmarSaida ? (
        <ModalConfirmar
          titulo="Sair sem salvar?"
          iconeFechar={<X size={24} />}
          texto="Ao sair, o que você preencheu nesta transação será perdido."
          rotuloConfirmar="Sair"
          onConfirmar={() => navigate(MODULE_BASE)}
          onCancelar={() => setConfirmarSaida(false)}
        />
      ) : null}
    </Contexto.Provider>
  )
}

export default PesquisaProvider
