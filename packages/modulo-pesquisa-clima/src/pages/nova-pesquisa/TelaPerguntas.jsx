import { useNavigate } from 'react-router-dom'
import s from './Perguntas.module.css'
import { FluxoLayout } from '@squad/ui'
import {
  usePesquisa,
  minutosEstimados,
  PERGUNTAS_MIN,
  PERGUNTAS_MAX,
} from './estado.jsx'

import minus from '../../assets/icons/Minus.svg'
import plus from '../../assets/icons/Plus.svg'

/*
 * Quantas perguntas gerar (Figma 8195:1726).
 *
 * Os minutos estimados acompanham o contador: 45 segundos por pergunta.
 *
 * Só o caminho com template passa por aqui — o branco vai do nome direto
 * para a lista de perguntas.
 *
 * Daqui em diante o cabeçalho mostra o nome da pesquisa, e não mais "Nova
 * Pesquisa": o nome já foi escolhido no passo anterior.
 */
export default function TelaPerguntas() {
  const navigate = useNavigate()
  const { pesquisa, definir, sair } = usePesquisa()

  const minutos = minutosEstimados(pesquisa.quantidade)
  const somar = (passo) =>
    definir({
      quantidade: Math.min(
        PERGUNTAS_MAX,
        Math.max(PERGUNTAS_MIN, pesquisa.quantidade + passo),
      ),
    })

  return (
    <FluxoLayout
      titulo={pesquisa.nome || 'Nova Pesquisa'}
      progresso={3 / 6}
      centrada
      onFechar={sair}
      onVoltar={() => navigate('../nome')}
      onContinuar={() => navigate('../prompt')}
    >
      <div className={s.conteudo}>
        <p className={s.rotulo}>Quantas perguntas serão feitas?</p>

        <div className={s.contador}>
          <button
            type="button"
            className={s.passo}
            aria-label="Menos uma pergunta"
            disabled={pesquisa.quantidade <= PERGUNTAS_MIN}
            onClick={() => somar(-1)}
          >
            <img className={s.icone} src={minus} alt="" width={24} height={24} />
          </button>
          <p className={s.numero}>{pesquisa.quantidade}</p>
          <button
            type="button"
            className={s.passo}
            aria-label="Mais uma pergunta"
            disabled={pesquisa.quantidade >= PERGUNTAS_MAX}
            onClick={() => somar(1)}
          >
            <img className={s.icone} src={plus} alt="" width={24} height={24} />
          </button>
        </div>

        <div className={s.estimativaBloco}>
          <div className={s.estimativa}>
            <p className={s.estimativaTexto}>Em média</p>
            <p className={s.estimativaValor}>
              {minutos} {minutos === 1 ? 'minuto' : 'minutos'}
            </p>
            <p className={s.estimativaTexto}>para responder</p>
          </div>
          {/* Com a pergunta extra condicional, o total de passos de quem
              responde pode crescer — a média continua valendo, mas não é
              mais garantida como era antes dela existir. */}
          <p className={s.estimativaNota}>
            Pode variar um pouco dependendo das suas respostas.
          </p>
        </div>
      </div>
    </FluxoLayout>
  )
}
