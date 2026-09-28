import { ListBullets, Plus } from '@phosphor-icons/react'
import s from './EstadoVazio.module.css'

/*
 * Empty state da home (Figma 2279:101042).
 *
 * A ilustracao do Figma e uma grade pontilhada com um cartao branco girado
 * 5.73deg por cima, com tres linhas de lista dentro. Reproduzida em CSS:
 * o fundo e um repeating-linear-gradient e o cartao e uma div girada.
 */
function EstadoVazio({ onNovo, onCarregarExemplo }) {
  return (
    <div className={s.envolucro}>
      <div className={s.ilustracao} aria-hidden="true">
        <div className={s.grade} />
        <div className={s.cartao}>
          <ListBullets size={34} weight="bold" />
        </div>
      </div>

      <div className={s.textos}>
        <p className={s.titulo}>Nenhuma entrada ou saída registrada</p>
        <p className={s.subtitulo}>Você pode começar a adicionar no botão a baixo</p>
      </div>

      <button type="button" className={s.botaoNovo} onClick={onNovo}>
        Novo
        <Plus size={24} />
      </button>

      {/*
        Fora do Figma: o modulo nasce vazio de proposito (sem seed automatico),
        e sem uma forma de popular nao da para ver a tela cheia. Discreto.
      */}
      <button type="button" className={s.exemplo} onClick={onCarregarExemplo}>
        Carregar exemplo
      </button>
    </div>
  )
}

export default EstadoVazio
