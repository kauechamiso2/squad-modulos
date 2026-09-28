import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import { initGestaoPessoas } from '@squad/modulo-gestao-pessoas'
import { initPesquisaClima } from '@squad/modulo-pesquisa-clima'
import './index.css'
import Router from './router.jsx'

// Seeds e migrations de cada modulo rodam antes do primeiro render, na mesma
// ordem em que o projeto original rodava no seu proprio main.jsx.
initGestaoPessoas()
initPesquisaClima()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router />
  </StrictMode>,
)
