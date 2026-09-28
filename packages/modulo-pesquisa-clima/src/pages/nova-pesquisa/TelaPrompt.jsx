import { useNavigate } from 'react-router-dom'
import s from './Prompt.module.css'
import { FluxoLayout } from '@squad/ui'
import { usePesquisa } from './estado.jsx'

/*
 * O que a pesquisa quer coletar (Figma 8195:1750).
 *
 * O texto já vem montado no estado desde a escolha do template, então aqui a
 * textarea só lê e escreve — sem efeito de preenchimento no mount, que
 * atropelaria o que o usuário digitou ao ir e voltar.
 *
 * Só o caminho com template passa por aqui, então o campo sempre chega
 * preenchido e o Continuar fica sempre liberado.
 */
const EXEMPLO =
  'Medir satisfação, carga de trabalho e clima do time de design, incluindo percepção sobre prazos, colaboração e reconhecimento.'

export default function TelaPrompt() {
  const navigate = useNavigate()
  const { pesquisa, definir, sair } = usePesquisa()

  return (
    <FluxoLayout
      titulo={pesquisa.nome || 'Nova Pesquisa'}
      progresso={4 / 6}
      centrada
      onFechar={sair}
      onVoltar={() => navigate('../perguntas')}
      onContinuar={() => navigate('../carregando')}
    >
      <div className={s.conteudo}>
        <p className={s.rotulo}>O que você quer coletar com essa pesquisa?</p>
        <textarea
          className={s.campo}
          placeholder={EXEMPLO}
          value={pesquisa.prompt}
          onChange={(e) => definir({ prompt: e.target.value })}
          aria-label="O que você quer coletar com essa pesquisa?"
        />
      </div>
    </FluxoLayout>
  )
}
