import { useCallback, useEffect, useRef, useState } from 'react'
import { PorPergunta, Individual } from '../../components/respostas/LeituraDeRespostas.jsx'
import { ModalConfirmar } from '@squad/ui'
import Aviso from '../../components/Aviso.jsx'
import {
  removerResposta,
  limparRespostas,
  paraCsv,
  nomeDeArquivo,
  gerarEBaixar,
} from '../../lib/respostas.js'
import s from './AbaRespostas.module.css'

import more from '../../assets/icons/More.svg'

/*
 * Aba Respostas (Figma 8032:1809 e 8036:2383).
 *
 * As respostas vêm guardadas na pesquisa e são simuladas — quem as cria e
 * mantém em dia é lib/respostas.js. As duas leituras moram em
 * LeituraDeRespostas, que a tela do ciclo também usa; aqui ficam o total, o
 * menu do topo e o que deletar e baixar fazem.
 *
 * Deletar mexe na lista e na taxa ao mesmo tempo, senão a rosca do Geral
 * passaria a contar diferente da contagem daqui.
 */
const SUBABAS = ['Por pergunta', 'Individual']

export default function AbaRespostas({ pesquisa, onAlterar }) {
  const [subaba, setSubaba] = useState(SUBABAS[0])
  const [menuAberto, setMenuAberto] = useState(false)
  const [aviso, setAviso] = useState('')
  const limparAviso = useCallback(() => setAviso(''), [])
  const [confirmacao, setConfirmacao] = useState(null)
  const envoltorioMenu = useRef(null)

  const perguntas = pesquisa.perguntas || []
  const respostas = pesquisa.respostas || []
  const total = respostas.length

  useEffect(() => {
    if (!menuAberto) return undefined
    const aoClicar = (e) => {
      if (!envoltorioMenu.current?.contains(e.target)) setMenuAberto(false)
    }
    document.addEventListener('mousedown', aoClicar)
    return () => document.removeEventListener('mousedown', aoClicar)
  }, [menuAberto])

  /* Sem o aviso, uma falha na geração fechava o menu e não baixava nada,
     sem dizer por quê. */
  const baixarUma = (pessoa, indice) => {
    const deu = gerarEBaixar(
      nomeDeArquivo(pesquisa, `resposta-${indice + 1}`),
      () => paraCsv(pesquisa, [pessoa]),
    )
    if (!deu) setAviso('Não foi possível gerar o arquivo')
  }

  const baixarTudo = () => {
    setMenuAberto(false)
    const deu = gerarEBaixar(nomeDeArquivo(pesquisa, 'respostas'), () =>
      paraCsv(pesquisa, respostas),
    )
    if (!deu) setAviso('Não foi possível gerar o arquivo')
  }

  const pedirExclusaoDeUma = (pessoa, indice) =>
    setConfirmacao({
      titulo: 'Deletar esta resposta?',
      texto: `A resposta ${indice + 1} sai da pesquisa e o total cai para ${total - 1}. Não dá para desfazer.`,
      rotulo: 'Deletar',
      aoConfirmar: () => onAlterar((p) => removerResposta(p, pessoa.id)),
    })

  const pedirExclusaoDeTudo = () => {
    setMenuAberto(false)
    setConfirmacao({
      titulo: 'Deletar todas as respostas?',
      texto: `As ${total} respostas desta pesquisa são apagadas e a taxa volta a zero. Não dá para desfazer.`,
      rotulo: 'Deletar tudo',
      aoConfirmar: () => onAlterar((p) => limparRespostas(p)),
    })
  }

  return (
    <div className={s.coluna}>
      <section className={s.cartao}>
        <div className={s.topoCartao}>
          <p className={s.total}>
            Total: {total} {total === 1 ? 'Resposta' : 'Respostas'}
          </p>
          <div className={s.envoltorioMenu} ref={envoltorioMenu}>
            <button
              type="button"
              className={s.maisOpcoes}
              aria-label="Mais opções"
              aria-expanded={menuAberto}
              onClick={() => setMenuAberto((aberto) => !aberto)}
            >
              <img src={more} alt="" width={24} height={24} />
            </button>
            {menuAberto ? (
              <div className={s.suspenso} role="menu">
                <button
                  type="button"
                  className={s.itemSuspenso}
                  role="menuitem"
                  disabled={!total}
                  onClick={baixarTudo}
                >
                  Baixar tudo
                </button>
                <button
                  type="button"
                  className={`${s.itemSuspenso} ${s.destrutivo}`}
                  role="menuitem"
                  disabled={!total}
                  onClick={pedirExclusaoDeTudo}
                >
                  Deletar
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className={s.subabas} role="tablist" aria-label="Modo de leitura">
          {SUBABAS.map((nome) => (
            <button
              type="button"
              key={nome}
              className={`${s.subaba} ${nome === subaba ? s.ativa : ''}`}
              role="tab"
              aria-selected={nome === subaba}
              onClick={() => setSubaba(nome)}
            >
              {nome}
            </button>
          ))}
        </div>
      </section>

      {!total ? (
        <section className={s.cartao}>
          <p className={s.vazio}>
            Nenhuma resposta ainda. Elas aparecem aqui conforme as pessoas
            respondem.
          </p>
        </section>
      ) : subaba === 'Por pergunta' ? (
        <PorPergunta perguntas={perguntas} respostas={respostas} />
      ) : (
        <Individual
          perguntas={perguntas}
          respostas={respostas}
          onBaixar={baixarUma}
          onDeletar={pedirExclusaoDeUma}
        />
      )}

      {confirmacao ? (
        <ModalConfirmar
          titulo={confirmacao.titulo}
          texto={confirmacao.texto}
          rotuloConfirmar={confirmacao.rotulo}
          onConfirmar={() => {
            confirmacao.aoConfirmar()
            setConfirmacao(null)
          }}
          onCancelar={() => setConfirmacao(null)}
        />
      ) : null}

      <Aviso texto={aviso} onSumir={limparAviso} />
    </div>
  )
}
