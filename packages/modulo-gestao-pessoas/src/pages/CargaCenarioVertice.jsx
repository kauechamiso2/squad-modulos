import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/toast/ToastContext.jsx'
import { gravarCenarioVertice } from '../utils/storage.js'
import { MODULE_BASE } from '../routes.js'

/*
 * Rota de carga do cenario de teste (#/gestao-de-pessoas/teste-vertice-consultoria),
 * sem botao na interface: grava o cenario por cima dos dados atuais do
 * modulo, mostra o toast e vai para a home do modulo, que monta ja lendo os
 * dados novos. O ref evita gravar duas vezes no StrictMode.
 */
function CargaCenarioVertice() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const feito = useRef(false)

  useEffect(() => {
    if (feito.current) return
    feito.current = true
    gravarCenarioVertice()
    showToast('success', 'Cenário Vértice Consultoria carregado')
    navigate(MODULE_BASE, { replace: true })
  }, [navigate, showToast])

  return null
}

export default CargaCenarioVertice
