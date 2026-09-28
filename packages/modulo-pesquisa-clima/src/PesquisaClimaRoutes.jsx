import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import PesquisaProvider from './pages/nova-pesquisa/estado.jsx'
import TelaNome from './pages/nova-pesquisa/TelaNome.jsx'
import TelaTemplate from './pages/nova-pesquisa/TelaTemplate.jsx'
import TelaPerguntas from './pages/nova-pesquisa/TelaPerguntas.jsx'
import TelaPrompt from './pages/nova-pesquisa/TelaPrompt.jsx'
import TelaCarregando from './pages/nova-pesquisa/TelaCarregando.jsx'
import TelaRevisao from './pages/nova-pesquisa/TelaRevisao.jsx'
import TelaConfiguracao from './pages/nova-pesquisa/TelaConfiguracao.jsx'
import TelaDetalhe from './pages/detalhe/TelaDetalhe.jsx'
import TelaCiclo from './pages/detalhe/TelaCiclo.jsx'
import RespostaProvider from './pages/responder/RespostaProvider.jsx'
import TelaAbertura from './pages/responder/TelaAbertura.jsx'
import TelaPerguntaResposta from './pages/responder/TelaPergunta.jsx'
import TelaFim from './pages/responder/TelaFim.jsx'
import { MODULE_BASE } from './routes.js'
import './styles/tokens.css'
import './styles/modulo.css'

/*
 * O modulo nao cria roteador proprio - o HashRouter unico vive em apps/web.
 * O que era o App.jsx do projeto standalone virou este bloco de <Routes>,
 * montado em /pesquisa-clima/*.
 *
 * Os caminhos aqui sao RELATIVOS (sem barra inicial): dentro de um <Routes>
 * descendente eles casam contra o que sobra da URL depois do prefixo, entao
 * "pesquisas/:id" resolve para /pesquisa-clima/pesquisas/:id sozinho.
 *
 * "pesquisas/nova" vem antes de "pesquisas/:id" na leitura, mas a ordem no
 * JSX nao decide nada: o roteador ranqueia por especificidade e segmento
 * estatico ganha de dinamico. O projeto original ja dependia disso.
 *
 * O provider do fluxo continua sendo a rota-mae: o estado nasce ao entrar e
 * morre ao sair, sem virar estado global. Idem para o de responder.
 *
 * O wrapper .modulo-pesquisa-clima carrega o que antes era regra de <body>.
 */
const passosDoFluxo = (
  <>
    <Route index element={<TelaTemplate />} />
    <Route path="nome" element={<TelaNome />} />
    <Route path="perguntas" element={<TelaPerguntas />} />
    <Route path="prompt" element={<TelaPrompt />} />
    <Route path="carregando" element={<TelaCarregando />} />
    <Route path="revisao" element={<TelaRevisao />} />
    <Route path="configuracao" element={<TelaConfiguracao />} />
  </>
)

function PesquisaClimaRoutes({ backTo }) {
  return (
    <div className="modulo-pesquisa-clima">
      <Routes>
        <Route index element={<Home backTo={backTo} />} />
        <Route path="pesquisas/:id" element={<TelaDetalhe />} />
        <Route path="pesquisas/:id/ciclos/:cicloId" element={<TelaCiclo />} />
        <Route path="pesquisas/nova" element={<PesquisaProvider />}>
          {passosDoFluxo}
        </Route>

        {/* Retomar um rascunho e o mesmo fluxo, semeado com o que ja foi
            preenchido. Mesmos objetos de rota, navegacao relativa entre eles. */}
        <Route path="rascunhos/:id" element={<PesquisaProvider />}>
          {passosDoFluxo}
        </Route>

        {/* Vista de quem responde: fora do app interno, sem sidebar nem abas. */}
        <Route path="responder/:id" element={<RespostaProvider />}>
          <Route index element={<TelaAbertura />} />
          <Route path="pergunta/:numero" element={<TelaPerguntaResposta />} />
          <Route path="fim" element={<TelaFim />} />
        </Route>

        {/* Caminho que nao casa nada volta para a lista - sem isto a tela
            ficava em branco, sem caminho de volta. `replace` para o endereco
            quebrado nao ficar no historico. */}
        <Route path="*" element={<Navigate to={MODULE_BASE} replace />} />
      </Routes>
    </div>
  )
}

export default PesquisaClimaRoutes
