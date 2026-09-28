import { useMemo, useState } from 'react'
import { CaretDown, CaretRight, MagnifyingGlass, PencilSimpleLine, Smiley, X } from '@phosphor-icons/react'
import { PainelLateral } from '@squad/ui'
import { buscarEmojis, nomeDoEmoji } from './SeletorEmoji.jsx'
import * as Categorias from '../lib/categorias.js'
import useFocoInicial from './useFocoInicial.js'
import s from './Painel.module.css'

/* Painel "Nova categoria" (Figma 2279:94479 / 94620 / 94710). */
function PainelNovaCategoria({
  aberto,
  tipo, onSalvar, onFechar }) {
  const [nome, setNome] = useState('')
  const [emoji, setEmoji] = useState(null)
  /* O painel abre com a secao de icone ja expandida (Figma 2279:94479). */
  const [aberta, setAberta] = useState(true)
  const [termo, setTermo] = useState('')
  const campoNome = useFocoInicial()

  const emojis = useMemo(() => buscarEmojis(termo), [termo])

  const podeSalvar = nome.trim().length > 0 && Boolean(emoji)

  return (
    <PainelLateral
      aberto={aberto}
      titulo="Nova categoria"
      iconeFechar={<X size={24} color="var(--cor-texto-secundario)" />}
      onFechar={onFechar}
      rotuloConfirmar="Salvar"
      confirmarDesabilitado={!podeSalvar}
      onConfirmar={() => onSalvar(Categorias.criar({ nome, emoji, tipo }))}
      prenderFoco
    >
      <div className={s.secaoPainel}>
        <div className={s.campoCinza}>
          <input
            className={s.entradaPainel}
            value={nome}
            placeholder="Nome da categoria"
            aria-label="Nome da categoria"
            {...campoNome}
            onChange={(e) => setNome(e.target.value)}
          />
          <PencilSimpleLine size={24} />
        </div>

        <div className={s.secaoIcone}>
          {/* Escolhido (2279:94710): a secao recolhe e o cabecalho troca
              "ícone" pelo nome do emoji. */}
          <button type="button" className={s.cabecalhoIcone} onClick={() => setAberta((v) => !v)}>
            <span>
              <span className={s.emojiEscolhido}>
                {emoji ?? <Smiley size={24} />}
              </span>
              {emoji ? nomeDoEmoji(emoji) ?? 'ícone' : 'ícone'}
            </span>
            {/* Aberta: CaretDown. Recolhida com emoji escolhido: CaretRight
                (Figma 2279:94620 e 2279:94710). */}
            {aberta ? <CaretDown size={24} /> : <CaretRight size={24} />}
          </button>

          {aberta ? (
            <>
              <div className={`${s.buscaEmoji} ${termo ? s.buscaEmojiAtiva : ''}`}>
                <MagnifyingGlass size={24} color="var(--cor-texto-secundario)" />
                <input
                  className={s.entradaBuscaEmoji}
                  value={termo}
                  placeholder="Pesquisar"
                  aria-label="Pesquisar ícone"
                  onChange={(ev) => setTermo(ev.target.value)}
                />
                {termo ? (
                  <button
                    type="button"
                    className={s.limparBuscaEmoji}
                    aria-label="Limpar busca"
                    onClick={() => setTermo('')}
                  >
                    <X size={24} color="var(--cor-texto-secundario)" />
                  </button>
                ) : null}
              </div>

              <div className={s.gradeEmojis}>
                {emojis.map((item) => (
                  <button
                    key={item.emoji}
                    type="button"
                    className={`${s.botaoEmoji} ${emoji === item.emoji ? s.botaoEmojiAtivo : ''}`}
                    aria-label={`Emoji ${item.emoji}`}
                    title={item.nome}
                    onClick={() => { setEmoji(item.emoji); setAberta(false) }}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </PainelLateral>
  )
}

export default PainelNovaCategoria
