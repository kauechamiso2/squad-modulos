import { X } from '@phosphor-icons/react'
import { useState } from 'react'
import { PainelLateral } from '@squad/ui'
import useFocoInicial from './useFocoInicial.js'
import s from './Painel.module.css'

/* Painel "Observação" (Figma 2279:95228). */
function PainelObservacao({
  aberto,
  valorInicial = '', onSalvar, onFechar }) {
  const [texto, setTexto] = useState(valorInicial)
  const campo = useFocoInicial()

  return (
    <PainelLateral
      aberto={aberto}
      titulo="Observação"
      iconeFechar={<X size={24} color="var(--cor-texto-secundario)" />}
      onFechar={onFechar}
      rotuloConfirmar="Salvar"
      onConfirmar={() => onSalvar(texto)}
      prenderFoco
    >
      <textarea
        className={s.areaObservacao}
        value={texto}
        placeholder="Escreva uma observação"
        aria-label="Observação"
        {...campo}
        onChange={(e) => setTexto(e.target.value)}
      />
    </PainelLateral>
  )
}

export default PainelObservacao
