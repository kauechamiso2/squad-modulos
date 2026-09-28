import { X } from '@phosphor-icons/react'
import { useState } from 'react'
import { PainelLateral } from '@squad/ui'
import * as Categorias from '../lib/categorias.js'
import s from './Painel.module.css'

/*
 * Painel "Todas as categorias" (Figma 2279:94424).
 *
 * O Figma nao desenha estado de linha selecionada - so a lista. Como o painel
 * confirma com Salvar, inventei o selecionado como borda 1px preta. Registrado
 * no relatorio e em docs/modulo-fluxo-caixa.md.
 */
function PainelCategorias({
  aberto,
  tipo, onSalvar, onFechar }) {
  const [lista] = useState(() => Categorias.listar(tipo))
  const [escolhida, setEscolhida] = useState(null)

  return (
    <PainelLateral
      aberto={aberto}
      titulo="Todas as categorias"
      iconeFechar={<X size={24} color="var(--cor-texto-secundario)" />}
      onFechar={onFechar}
      rotuloConfirmar="Salvar"
      confirmarDesabilitado={!escolhida}
      onConfirmar={() => onSalvar(escolhida)}
      prenderFoco
    >
      <div className={s.listaCategorias}>
        {lista.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`${s.linhaCategoria} ${escolhida === c.id ? s.linhaCategoriaSelecionada : ''}`}
            onClick={() => setEscolhida(c.id)}
          >
            <span className={s.tileCategoria}>{c.emoji}</span>
            <span className={s.nomeCategoria}>{c.nome}</span>
          </button>
        ))}
      </div>
    </PainelLateral>
  )
}

export default PainelCategorias
