import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from '@phosphor-icons/react'
import { FluxoLayout, ModuleCard } from '@squad/ui'
import { useFluxo } from './estado.jsx'
import PainelCategorias from '../../components/PainelCategorias.jsx'
import PainelNovaCategoria from '../../components/PainelNovaCategoria.jsx'
import * as Categorias from '../../lib/categorias.js'
import s from './Passos.module.css'

/*
 * Passo 1 - categoria (Figma 2279:94275; sem categorias 2279:94333).
 *
 * Grade de 2 colunas com as 3 categorias mais usadas do tipo e um card
 * "Ver todos". Abaixo, a linha "Criar categoria +".
 */
function TelaCategoria() {
  const navigate = useNavigate()
  const fluxo = useFluxo()
  const [painel, setPainel] = useState(null)
  const [versao, setVersao] = useState(0)

  const maisUsadas = useMemo(
    () => Categorias.maisUsadas(fluxo.tipo, fluxo.transacoesIniciais, 3),
    [fluxo.tipo, fluxo.transacoesIniciais, versao],
  )

  const escolher = (id) => {
    fluxo.setCategoriaId(id)
    navigate('valor')
  }

  return (
    <>
      <FluxoLayout
        titulo={fluxo.copy.tituloFluxo}
        fixarBordas
        mostrarRodape={false}
        onFechar={fluxo.sair}
      >
        <div className={s.bloco}>
          <h1 className={s.tituloPasso}>{fluxo.copy.tituloCategoria}</h1>

          <div className={s.gradeCategorias}>
            {maisUsadas.map((c) => (
              <ModuleCard key={c.id} name={c.nome} emoji={c.emoji} corTile="var(--fc-tile-categoria)" onClick={() => escolher(c.id)} />
            ))}

            <ModuleCard name="Ver todos" emoji="📋" corTile="var(--fc-tile-categoria)" onClick={() => setPainel('todas')} />
          </div>

          <button type="button" className={s.linhaCriar} onClick={() => setPainel('nova')}>
            <span className={s.linhaCriarTexto}>Criar categoria</span>
            <span className={s.linhaCriarIcone}><Plus size={24} /></span>
          </button>
        </div>
      </FluxoLayout>

      <PainelCategorias
          aberto={painel === 'todas'}
          tipo={fluxo.tipo}
          onSalvar={(id) => { setPainel(null); escolher(id) }}
          onFechar={() => setPainel(null)}
        />

      <PainelNovaCategoria
          aberto={painel === 'nova'}
          tipo={fluxo.tipo}
          onSalvar={(nova) => { setPainel(null); setVersao((v) => v + 1); escolher(nova.id) }}
          onFechar={() => setPainel(null)}
        />
    </>
  )
}

export default TelaCategoria
