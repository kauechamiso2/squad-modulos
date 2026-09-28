import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'

// O modulo nao cria roteador proprio - o apps/web tem o unico HashRouter.
// Home continua sendo a tela unica que le a URL por conta propria
// (useMatch/useSearchParams), exatamente como no projeto original.
//
// backTo: para onde a seta de voltar do cabecalho leva. Quem monta o modulo
// decide, para que o modulo nunca precise conhecer a aplicacao que o hospeda.
// Sem backTo a seta fica inerte, como era no projeto original.
function GestaoPessoasRoutes({ backTo }) {
  return (
    <Routes>
      <Route path="/*" element={<Home backTo={backTo} />} />
    </Routes>
  )
}

export default GestaoPessoasRoutes
