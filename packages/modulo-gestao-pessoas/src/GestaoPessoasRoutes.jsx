import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import CargaCenarioVertice from './pages/CargaCenarioVertice.jsx'
import { ToastProvider } from './components/toast/ToastContext.jsx'
import './tokens.css'

// O modulo nao cria roteador proprio - o apps/web tem o unico HashRouter.
// Home continua sendo a tela unica que le a URL por conta propria
// (useMatch/useSearchParams), exatamente como no projeto original.
//
// backTo: para onde a seta de voltar do cabecalho leva. Quem monta o modulo
// decide, para que o modulo nunca precise conhecer a aplicacao que o hospeda.
// Sem backTo a seta fica inerte, como era no projeto original.
//
// O ToastProvider fica aqui, e nao no apps/web: o sistema de toast veio do
// original junto com os fluxos e por enquanto e so deste modulo. Unificar com
// o do Fluxo de Caixa esta na divida tecnica.
function GestaoPessoasRoutes({ backTo }) {
  return (
    <ToastProvider>
      <div className="gp-modulo">
        <Routes>
          {/* Cenario de teste com usuarios (contexto, "Seed and reset"). */}
          <Route path="/teste-vertice-consultoria" element={<CargaCenarioVertice />} />
          <Route path="/*" element={<Home backTo={backTo} />} />
        </Routes>
      </div>
    </ToastProvider>
  )
}

export default GestaoPessoasRoutes
