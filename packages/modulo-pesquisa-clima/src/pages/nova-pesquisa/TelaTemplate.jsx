import { useNavigate } from 'react-router-dom'
import s from './Template.module.css'
import { FluxoLayout } from '@squad/ui'
import { usePesquisa } from './estado.jsx'

import thermometerSimple from '../../assets/icons/ThermometerSimple.svg'
import starHalf from '../../assets/icons/StarHalf.svg'
import trayArrowDown from '../../assets/icons/TrayArrowDown.svg'
import userMinus from '../../assets/icons/UserMinus.svg'
import arrowUpRight from '../../assets/icons/ArrowUpRight.svg'
import plus from '../../assets/icons/Plus.svg'

/*
 * Escolha do template (Figma 8195:1460), agora o primeiro passo do fluxo.
 * Coluna larga: 808px em vez dos 532 das demais.
 *
 * O "Continuar" existe no Figma mas está com opacity 0 — some, sem deixar
 * buraco no rodapé. Aqui a moldura recebe mostrarContinuar={false}: mesmo
 * resultado, sem um botão invisível clicável.
 *
 * As quebras de linha dos nomes vêm do Figma: "Pesquisa / de Clima" e
 * "Solicitação / Interna" são duas linhas; "Feedback" é uma linha alinhada
 * embaixo, e "Pesquisa de Desligamento" quebra sozinha na largura do cartão.
 */
const TEMPLATES = [
  { id: 'clima', icone: thermometerSimple, nome: 'Pesquisa\nde Clima' },
  { id: 'feedback', icone: starHalf, nome: 'Feedback' },
  { id: 'solicitacao', icone: trayArrowDown, nome: 'Solicitação\nInterna' },
  { id: 'desligamento', icone: userMinus, nome: 'Pesquisa de Desligamento' },
]

export default function TelaTemplate() {
  const navigate = useNavigate()
  const { escolherTemplate, sair } = usePesquisa()

  /* Os dois caminhos seguem para a mesma tela: nome e participantes vêm
     logo depois da escolha, com template ou em branco. Onde eles se separam
     é no Continuar de lá — com template segue para o contador de perguntas,
     em branco vai direto para a lista. */
  const escolher = (id) => {
    escolherTemplate(id)
    navigate('nome')
  }

  return (
    <FluxoLayout
      titulo="Nova Pesquisa"
      progresso={1 / 6}
      larga
      mostrarContinuar={false}
      /*
       * Primeiro passo: daqui o Voltar e o X saem do fluxo, e não recuam
       * para outra tela.
       *
       * `sair` é o mesmo dos outros passos, e num fluxo recém-aberto — que é
       * o caso desta tela — ele vai direto para a home, sem perguntar nada e
       * sem guardar rascunho: não há o que perder. Só pergunta se a pessoa
       * tiver voltado até aqui com algo já preenchido, e aí perguntar é o
       * certo: sem isso, o Voltar apagaria em silêncio o que ela escreveu.
       */
      onFechar={sair}
      onVoltar={sair}
    >
      <div className={s.conteudo}>
        <p className={s.rotulo}>Para que vai servir essa Pesquisa?</p>

        <div className={s.cartoes}>
          {TEMPLATES.map(({ id, icone, nome }) => (
            <button
              key={id}
              type="button"
              className={s.cartao}
              onClick={() => escolher(id)}
            >
              <span className={s.topoCartao}>
                <span className={s.selo}>
                  <img
                    className={s.icone}
                    src={icone}
                    alt=""
                    width={24}
                    height={24}
                  />
                </span>
                <img
                  className={s.icone}
                  src={arrowUpRight}
                  alt=""
                  width={24}
                  height={24}
                />
              </span>
              <span className={s.nomeCartao} style={{ whiteSpace: 'pre-line' }}>
                {nome}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className={s.branco}
          onClick={() => escolher('blank')}
        >
          <span className={s.nomeBranco}>Criar pesquisa em Branco</span>
          <img className={s.icone} src={plus} alt="" width={24} height={24} />
        </button>
      </div>
    </FluxoLayout>
  )
}
