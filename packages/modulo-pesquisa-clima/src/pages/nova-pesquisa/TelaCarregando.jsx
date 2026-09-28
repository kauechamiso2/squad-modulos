import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import s from './Carregando.module.css'
import { usePesquisa } from './estado.jsx'
import { Botao } from '@squad/ui'

import pipoLoading from '../../assets/images/Pipo-Loading.png'

const ESPERA_MS = 3000

/*
 * Tela de carregamento do caminho com template. Sem Figma ainda; vira vídeo
 * mais para a frente.
 *
 * O palco existe para a troca por vídeo mais para a frente: é só substituir
 * o <img> por um <video> aqui dentro, sem mexer no resto.
 *
 * As perguntas são montadas no fim da espera, junto com a navegação: fazer
 * antes deixaria estado escrito à toa se a pessoa fechasse a tela no meio.
 *
 * Geração que não produz pergunta nenhuma para aqui e diz o que houve. Antes
 * ela seguia para a revisão de uma pesquisa vazia, como se zero perguntas
 * fosse o resultado esperado do template escolhido — e só na revisão, sem
 * explicação, é que dava para notar.
 */
export default function TelaCarregando() {
  const navigate = useNavigate()
  const { pesquisa, gerar } = usePesquisa()
  const [falhou, setFalhou] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => {
      if (gerar() > 0) navigate('../revisao', { replace: true })
      else setFalhou(true)
    }, ESPERA_MS)
    return () => clearTimeout(id)
    // Só na montagem: recriar o timer a cada render reiniciaria a contagem.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (falhou) {
    return (
      <div className={s.tela}>
        <div className={s.falha} role="alert">
          <p className={s.falhaTitulo}>Não foi possível gerar as perguntas</p>
          <p className={s.falhaTexto}>
            Não há banco de perguntas para o template
            {' '}
            <strong>{String(pesquisa.template)}</strong>. Volte e escolha outro
            template, ou monte as perguntas à mão a partir de uma pesquisa em
            branco.
          </p>
          <Botao onClick={() => navigate('..', { replace: true })}>
            Escolher outro template
          </Botao>
        </div>
      </div>
    )
  }

  return (
    <div className={s.tela}>
      <div className={s.palco}>
        <img
          className={s.ilustracao}
          src={pipoLoading}
          alt=""
          width={670}
          height={374}
        />
      </div>
    </div>
  )
}
