import { useMemo, useState } from 'react'
import CartoesStep from './CartoesStep.jsx'
import NomeStep from './NomeStep.jsx'
import FornecedorStep from './FornecedorStep.jsx'
import BeneficiariosStep from './BeneficiariosStep.jsx'
import ValorStep from './ValorStep.jsx'
import InfoStep from './InfoStep.jsx'
import { BadgeAmarelo, BadgeLogo } from './Marcas.jsx'
import { ICONES_CATEGORIA, ICONES_TIPO } from './icones.js'
import DiscardConfirmModal from '../addCollaborator/DiscardConfirmModal.jsx'
import { useToast } from '../toast/ToastContext.jsx'
import { COLLECTIONS, addItem, generateId, getCollection } from '../../utils/storage.js'
import { STATUS, getStatus, isEncerrado } from '../../utils/colaboradorStatus.js'
import { centsToAmount, todayIso } from '../../utils/formatters.js'
import {
  CATEGORIAS_BENEFICIO,
  FORNECEDORES,
  OUTRO,
  SERVICOS_LICENCA,
  TIPOS_RECURSO,
  camposLegados,
  pessoasDoRecurso,
} from '../../utils/recursos.js'

// Passos de cada caminho, para a barra de progresso (contexto, secao 7).
const PASSOS = {
  beneficio: ['tipo', 'categoria', 'fornecedor', 'beneficiarios', 'valor', 'info'],
  verba: ['tipo', 'nome', 'beneficiarios', 'valor'],
  licenca: ['tipo', 'servico', 'beneficiarios', 'valor', 'info'],
}
// "Outro" troca o fornecedor (Beneficio) ou fica junto do servico (Licenca).
const PASSO_DO_NOME = { beneficio: 'fornecedor', licenca: 'servico', verba: 'nome' }

const ARTIGO = { beneficio: 'do', verba: 'da', licenca: 'da' }
const ROTULO_CRIAR = { beneficio: 'Criar benefício', verba: 'Criar verba', licenca: 'Criar licença' }

const novaVariante = () => ({ id: generateId(), digitos: '', colaboradorIds: [] })

const destaque = (texto) => <span className="clt-shell__destaque">{texto}</span>

/*
 * Criar recurso - Figma 10343:13283. Tres caminhos: Beneficio (6 passos),
 * Verba (4, sem Informacoes) e Licenca (5).
 */
function NovoRecursoFlow({ onExit }) {
  const { showToast } = useToast()
  const [colaboradores] = useState(() => getCollection(COLLECTIONS.COLABORADORES))
  const [timesSalvos] = useState(() => getCollection(COLLECTIONS.TIMES))
  const [passo, setPasso] = useState('tipo')
  const [tipo, setTipo] = useState(null)
  const [categoria, setCategoria] = useState(null)
  const [servico, setServico] = useState(null)
  const [fornecedor, setFornecedor] = useState(null)
  const [nome, setNome] = useState('')
  const [beneficiarios, setBeneficiarios] = useState({ todaEmpresa: false, teamNames: [], colaboradorIds: [] })
  const [variantes, setVariantes] = useState(() => [novaVariante()])
  const [info, setInfo] = useState({ link: '', contato: '', email: '' })
  const [descartar, setDescartar] = useState(false)

  const hoje = todayIso()
  // So Pendente e Em atividade entram como beneficiario.
  const pessoas = useMemo(
    () =>
      colaboradores.filter((colaborador) =>
        [STATUS.PENDENTE, STATUS.EM_ATIVIDADE].includes(getStatus(colaborador).id),
      ),
    [colaboradores],
  )
  const times = useMemo(() => {
    const ativos = colaboradores.filter((colaborador) => !isEncerrado(getStatus(colaborador)))
    return timesSalvos.map((time) => ({
      ...time,
      contagem: ativos.filter((colaborador) => colaborador.times.includes(time.name)).length,
    }))
  }, [colaboradores, timesSalvos])
  const totalEmpresa = pessoasDoRecurso(
    { beneficiarios: { todaEmpresa: true, teamNames: [], colaboradorIds: [] } },
    colaboradores,
    hoje,
  ).length
  const quemRecebe = pessoasDoRecurso({ beneficiarios }, colaboradores, hoje)

  const ehOutro = (tipo === 'beneficio' && categoria === OUTRO) || (tipo === 'licenca' && servico === OUTRO)
  const nomeDoRecurso =
    tipo === 'verba' || ehOutro ? nome.trim() : tipo === 'licenca' ? servico : categoria

  const progresso = (atual) => {
    const lista = PASSOS[tipo]
    const indice = lista.indexOf(atual === 'nome' ? PASSO_DO_NOME[tipo] : atual)
    return ((indice + 1) / lista.length) * 100
  }

  const abrirDescartar = () => setDescartar(true)

  const salvar = () => {
    const comVariantes = variantes.length > 1
    const recurso = {
      tipoRecurso: tipo,
      beneficiarios,
      valores: variantes.map((variante) => ({
        id: variante.id,
        valor: centsToAmount(variante.digitos),
        aplicaATodos: !comVariantes,
        colaboradorIds: comVariantes ? variante.colaboradorIds : [],
      })),
      linkBeneficio: info.link.trim() || null,
      contatoFornecedor: info.contato.trim() || null,
      emailFornecedor: info.email.trim() || null,
      notas: [],
    }
    if (tipo === 'beneficio') {
      recurso.categoria = categoria
      if (categoria === OUTRO) recurso.nome = nome.trim()
      else recurso.fornecedor = fornecedor
    }
    // Verba criada no fluxo ganha o icone Coin (contexto, Assumptions).
    if (tipo === 'verba') Object.assign(recurso, { nome: nome.trim(), icone: 'Coin' })
    if (tipo === 'licenca') {
      recurso.servico = servico
      if (servico === OUTRO) recurso.nome = nome.trim()
    }
    addItem(COLLECTIONS.BENEFICIOS, { ...recurso, ...camposLegados(recurso) })
    showToast('success', 'Recurso criado com sucesso')
    onExit({ criado: true })
  }

  const depoisDoValor = () => (tipo === 'verba' ? salvar() : setPasso('info'))

  const tituloBeneficiarios =
    tipo === 'beneficio' ? (
      <>
        Quem vai receber
        <br />
        esse benefício?
      </>
    ) : tipo === 'verba' ? (
      <>
        Quem vai receber
        <br />o {destaque(`${nomeDoRecurso}?`)}
      </>
    ) : (
      <>
        Quem vai receber
        <br />a licença do {nomeDoRecurso}?
      </>
    )

  return (
    <>
      {passo === 'tipo' && (
        <CartoesStep
          titulo={
            <>
              Qual o tipo de recurso
              <br />
              irá criar agora?
            </>
          }
          cartoes={Object.entries(TIPOS_RECURSO).map(([id, rotulo]) => ({
            id,
            rotulo,
            marca: <BadgeAmarelo Icone={ICONES_TIPO[id]} />,
          }))}
          onEscolher={(id) => {
            setTipo(id)
            setPasso(id === 'beneficio' ? 'categoria' : id === 'verba' ? 'nome' : 'servico')
          }}
          onClose={abrirDescartar}
        />
      )}

      {passo === 'categoria' && (
        <CartoesStep
          titulo={
            <>
              Qual o {destaque('benefício')} que
              <br />
              irá criar agora?
            </>
          }
          cartoes={CATEGORIAS_BENEFICIO.map((id) => ({
            id,
            rotulo: id,
            marca: <BadgeAmarelo Icone={ICONES_CATEGORIA[id]} />,
          }))}
          comOutro
          onEscolher={(id) => {
            setCategoria(id)
            setPasso(id === OUTRO ? 'nome' : 'fornecedor')
          }}
          onClose={abrirDescartar}
        />
      )}

      {passo === 'servico' && (
        <CartoesStep
          titulo={
            <>
              Qual a {destaque('licença')} que
              <br />
              irá criar agora?
            </>
          }
          cartoes={SERVICOS_LICENCA.map((id) => ({ id, rotulo: id, marca: <BadgeLogo nome={id} /> }))}
          comOutro
          onEscolher={(id) => {
            setServico(id)
            setPasso(id === OUTRO ? 'nome' : 'beneficiarios')
          }}
          onClose={abrirDescartar}
        />
      )}

      {passo === 'fornecedor' && (
        <FornecedorStep
          categoria={categoria}
          sugestoes={FORNECEDORES[categoria]}
          valor={fornecedor}
          onChange={setFornecedor}
          progress={progresso('fornecedor')}
          onBack={() => setPasso('categoria')}
          onClose={abrirDescartar}
          onContinue={() => setPasso('beneficiarios')}
        />
      )}

      {passo === 'nome' && (
        <NomeStep
          titulo={
            tipo === 'verba' ? (
              <>
                Para que será
                <br />
                essa {destaque('verba?')}
              </>
            ) : (
              <>
                Qual o nome
                <br />
                {ARTIGO[tipo]} {destaque(tipo === 'beneficio' ? 'benefício?' : 'licença?')}
              </>
            )
          }
          placeholder={tipo === 'verba' ? 'Nome da verba' : tipo === 'beneficio' ? 'Nome do benefício' : 'Nome da licença'}
          valor={nome}
          onChange={setNome}
          progress={progresso('nome')}
          onBack={() => setPasso(tipo === 'beneficio' ? 'categoria' : tipo === 'licenca' ? 'servico' : 'tipo')}
          onClose={abrirDescartar}
          onContinue={() => setPasso('beneficiarios')}
        />
      )}

      {passo === 'beneficiarios' && (
        <BeneficiariosStep
          titulo={tituloBeneficiarios}
          valor={beneficiarios}
          onChange={setBeneficiarios}
          pessoas={pessoas}
          times={times}
          totalEmpresa={totalEmpresa}
          progress={progresso('beneficiarios')}
          onBack={() =>
            setPasso(
              ehOutro || tipo === 'verba' ? 'nome' : tipo === 'beneficio' ? 'fornecedor' : 'servico',
            )
          }
          onClose={abrirDescartar}
          onContinue={() => setPasso('valor')}
        />
      )}

      {passo === 'valor' && (
        <ValorStep
          titulo={
            <>
              Qual o valor
              <br />
              {ARTIGO[tipo]} {TIPOS_RECURSO[tipo].toLowerCase()} (por pessoa)?
            </>
          }
          variantes={variantes}
          onChange={setVariantes}
          pessoas={quemRecebe}
          novaVariante={novaVariante}
          rotuloContinuar={tipo === 'verba' ? ROTULO_CRIAR.verba : 'Continuar'}
          progress={progresso('valor')}
          onBack={() => setPasso('beneficiarios')}
          onClose={abrirDescartar}
          onContinue={depoisDoValor}
        />
      )}

      {passo === 'info' && (
        <InfoStep
          rotuloLink={tipo === 'licenca' ? 'Link da licença' : 'Link do benefício'}
          valor={info}
          onChange={setInfo}
          rotuloCriar={ROTULO_CRIAR[tipo]}
          progress={progresso('info')}
          onBack={() => setPasso('valor')}
          onClose={abrirDescartar}
          onCriar={salvar}
        />
      )}

      {descartar && <DiscardConfirmModal onCancel={() => setDescartar(false)} onConfirm={onExit} />}
    </>
  )
}

export default NovoRecursoFlow
