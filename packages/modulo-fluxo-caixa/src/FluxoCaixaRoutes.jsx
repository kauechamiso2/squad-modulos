import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import PesquisaProvider from './pages/nova-transacao/estado.jsx'
import TelaCategoria from './pages/nova-transacao/TelaCategoria.jsx'
import TelaValor from './pages/nova-transacao/TelaValor.jsx'
import TelaNomeContato from './pages/nova-transacao/TelaNomeContato.jsx'
import TelaInformacoes from './pages/nova-transacao/TelaInformacoes.jsx'
import Toast from './components/Toast.jsx'
import * as Transacoes from './lib/transacoes.js'
import * as Categorias from './lib/categorias.js'
import { carregarDadosDeTeste, comSerieMensal, dadosDoResumo } from './lib/dadosDeTeste.js'
import { MODULE_BASE } from './routes.js'
import './styles/tokens.css'
import './styles/modulo.css'

/*
 * O modulo nao cria roteador proprio - o HashRouter unico vive em apps/web.
 *
 * Os quatro passos sao os mesmos objetos de rota nas duas entradas; o que muda
 * e o `tipo` do provider, que decide toda a copy (Figma: secao 2279:94236 para
 * Entrada e 2279:97361 para Saida, espelhadas).
 */
const passos = (
  <>
    <Route index element={<TelaCategoria />} />
    <Route path="valor" element={<TelaValor />} />
    <Route path="nome" element={<TelaNomeContato />} />
    <Route path="informacoes" element={<TelaInformacoes />} />
  </>
)

/*
 * Migracoes de uma vez so por carga. A flag de modulo evita repetir a leitura
 * a cada montagem do componente; as proprias migracoes sao idempotentes.
 */
let migrou = false
function migrarUmaVez() {
  if (migrou) return
  migrou = true
  Transacoes.migrarNomesPadrao((id) => Categorias.porId(id)?.nome ?? null)
}

/*
 * Ganchos de teste no console (secao 8 do enunciado). Ficam fora de qualquer
 * caminho da interface - so existem como funcao no window, para quem for
 * percorrer os cenarios recarregar os dados sem mexer no codigo.
 */
if (typeof window !== 'undefined') {
  window.__fluxoCaixaDadosDeTeste = carregarDadosDeTeste
  window.__fluxoCaixaSerieMensal = comSerieMensal
  window.__fluxoCaixaDadosDoResumo = dadosDoResumo
}

function FluxoCaixaRoutes({ backTo }) {
  const [toast, setToast] = useState(null)
  migrarUmaVez()

  return (
    <div className="modulo-fluxo-caixa">
      <Routes>
        <Route index element={<Home backTo={backTo} toast={toast} onFecharToast={() => setToast(null)} />} />
        <Route path="nova-entrada" element={<PesquisaProvider tipo="entrada" onFinalizar={setToast} />}>
          {passos}
        </Route>
        <Route path="nova-saida" element={<PesquisaProvider tipo="saida" onFinalizar={setToast} />}>
          {passos}
        </Route>
        <Route path="*" element={<Navigate to={MODULE_BASE} replace />} />
      </Routes>
      {toast ? (
        /* `key` pelo texto: um toast novo com outro na tela remonta o
           componente, entao o antigo sai e o novo entra em vez de empilhar. */
        <Toast
          key={`${toast.titulo}|${toast.descricao ?? ''}`}
          titulo={toast.titulo}
          descricao={toast.descricao}
          onFechar={() => setToast(null)}
        />
      ) : null}
    </div>
  )
}

export default FluxoCaixaRoutes
