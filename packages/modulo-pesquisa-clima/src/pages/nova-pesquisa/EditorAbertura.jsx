import { useState } from 'react'
import s from './Editor.module.css'
import { Botao, IconeBotao, useModal } from '@squad/ui'

import { LIMITE_NOME } from './bancoDePerguntas.js'

import close from '../../assets/icons/Close.svg'

/*
 * Editor do card de Abertura. Mesmo desenho do editor de pergunta — modal,
 * campos rotulados, Cancelar e Salvar.
 *
 * Aqui os campos escrevem direto no estado do fluxo, sem rascunho. É o que
 * faz o nome no topo e o card atrás do modal acompanharem a digitação, que é
 * o comportamento pedido: o título da Abertura e o do cabeçalho são o mesmo
 * dado, não duas cópias.
 *
 * O preço disso é o Cancelar precisar desfazer, então o valor de abertura
 * fica guardado na montagem e volta se a pessoa desistir.
 */
export default function EditorAbertura({ nome, abertura, definir, onFechar }) {
  const [original] = useState({ nome, abertura })

  const cancelar = () => {
    definir(original)
    onFechar()
  }

  /* Esc desfaz como o X e o Cancelar: aqui os campos escrevem direto no
     estado do fluxo, então sair sem desfazer deixaria a edição valendo. */
  const caixa = useModal(cancelar)

  return (
    <div className={s.scrim}>
      <div className={s.modal} ref={caixa} role="dialog" aria-label="Editar abertura">
        <div className={s.cabecalho}>
          <p className={s.titulo}>Abertura</p>
          <IconeBotao src={close} rotulo="Fechar" onClick={cancelar} />
        </div>

        <div className={s.corpo}>
          <label className={s.campo}>
            <span className={s.rotulo}>Título</span>
            <input
              className={s.entrada}
              type="text"
              maxLength={LIMITE_NOME}
              value={nome}
              placeholder="Nome da pesquisa"
              onChange={(e) => definir({ nome: e.target.value })}
            />
          </label>

          <label className={s.campo}>
            <span className={s.rotulo}>Texto de introdução</span>
            <textarea
              className={s.entrada}
              rows={5}
              value={abertura}
              placeholder="Explique o objetivo da pesquisa e como as respostas serão usadas."
              onChange={(e) => definir({ abertura: e.target.value })}
            />
          </label>
        </div>

        <div className={s.rodape}>
          <Botao onClick={cancelar}>Cancelar</Botao>
          <Botao variante="marca" onClick={onFechar}>
            Salvar
          </Botao>
        </div>
      </div>
    </div>
  )
}
