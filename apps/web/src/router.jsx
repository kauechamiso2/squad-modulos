import { HashRouter, Route, Routes } from 'react-router-dom'
import { GestaoPessoasRoutes, MODULE_BASE as GESTAO_PESSOAS_BASE } from '@squad/modulo-gestao-pessoas'
import { PesquisaClimaRoutes, MODULE_BASE as PESQUISA_CLIMA_BASE } from '@squad/modulo-pesquisa-clima'
import { FluxoCaixaRoutes, MODULE_BASE as FLUXO_CAIXA_BASE } from '@squad/modulo-fluxo-caixa'
import Home from './pages/Home.jsx'
import ModulePlaceholder from './pages/ModulePlaceholder.jsx'
import { MODULES } from './modules.js'

// Unico HashRouter da aplicacao. Os modulos exportam suas rotas e sao
// montados aqui com "/*" para que possam ter navegacao interna propria.
function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* backTo: a seta de voltar do cabecalho do modulo leva a home do monorepo.
            O modulo nao conhece esta aplicacao - o destino e injetado aqui. */}
        <Route
          path={`${GESTAO_PESSOAS_BASE}/*`}
          element={<GestaoPessoasRoutes backTo="/" />}
        />

        <Route
          path={`${PESQUISA_CLIMA_BASE}/*`}
          element={<PesquisaClimaRoutes backTo="/" />}
        />

        <Route
          path={`${FLUXO_CAIXA_BASE}/*`}
          element={<FluxoCaixaRoutes backTo="/" />}
        />

        {MODULES.filter((module) => module.status === 'placeholder').map((module) => (
          <Route
            key={module.slug}
            path={`/${module.slug}`}
            element={<ModulePlaceholder module={module} />}
          />
        ))}
      </Routes>
    </HashRouter>
  )
}

export default Router
