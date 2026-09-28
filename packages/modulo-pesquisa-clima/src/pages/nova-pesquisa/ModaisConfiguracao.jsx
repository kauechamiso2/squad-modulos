import { useState } from 'react'
import s from './Configuracao.module.css'
import { ModalFluxo } from '@squad/ui'
import {
  DIAS_MAX,
  DIAS_MIN,
  REGRAS,
  REGRA_PADRAO,
  deCampoDeData,
  diasValidos,
  formatarCampoCurto,
  frequenciaTemRegra,
  paraCampoDeData,
  paraData,
  textoDaRegra,
} from '../../lib/datas.js'
import { CICLOS_MAX, CICLOS_MIN } from '../../lib/pesquisas.js'

import calendarBlank from '../../assets/icons/CalendarBlank.svg'
import caretDown from '../../assets/icons/CaretDown.svg'
import caretUpDown from '../../assets/icons/CaretUpDown.svg'
import circle from '../../assets/icons/Circle.svg'
import clock from '../../assets/icons/Clock.svg'
import radioButton from '../../assets/icons/RadioButton.svg'
import square from '../../assets/icons/Square.svg'
import checkSquare from '../../assets/icons/CheckSquare.svg'

/*
 * Os modais da tela de Configuração.
 *
 * Todos seguem a mesma regra: editam uma cópia e só o "Salvar" devolve o
 * valor. "Voltar" e o X descartam — é o que faz o rascunho não vazar para a
 * lista da tela.
 *
 * São duas artes de rádio, como no Figma: Circle para a opção solta e
 * RadioButton para a marcada.
 */

function Opcao({ texto, marcada = false, rotulo, onEscolher }) {
  return (
    <button
      type="button"
      className={s.opcao}
      role="radio"
      aria-checked={marcada}
      aria-label={rotulo}
      onClick={onEscolher}
    >
      <img
        className={s.icone}
        src={marcada ? radioButton : circle}
        alt=""
        width={24}
        height={24}
      />
      {texto ? <span className={s.textoOpcao}>{texto}</span> : null}
    </button>
  )
}

function ListaDeOpcoes({ opcoes, marcada, onEscolher }) {
  return (
    <div className={s.opcoes} role="radiogroup">
      {opcoes.map((texto) => (
        <Opcao
          key={texto}
          texto={texto}
          marcada={texto === marcada}
          onEscolher={() => onEscolher(texto)}
        />
      ))}
    </div>
  )
}

/*
 * Data e hora pelos seletores do próprio navegador: `type="date"` abre o
 * calendário e `type="time"` o relógio, com teclado e idioma de graça e sem
 * biblioteca nenhuma no pacote. O projeto já usa o mesmo caminho no seletor
 * de cor da capa.
 *
 * O campo fala ISO curto; o que fica guardado continua no formato longo que
 * `paraData` lê. A conversão mora em lib/datas.js.
 *
 * O que se vê é a máscara do Figma (8200:7444): "14 Ago 26" e "10:30", com o
 * ícone à direita. O <input> nativo continua ali por baixo, transparente e do
 * tamanho do campo — é ele que tem o foco, o teclado e o seletor. Clicar em
 * qualquer ponto do campo abre o seletor, e não só no ícone: `showPicker` é o
 * que o Chrome expõe para isso, e onde ele não existe o clique cai no
 * comportamento nativo do próprio input.
 *
 * O ícone é decorativo: quem abre o seletor é a caixa inteira, e não ele.
 */
function abrirSeletor(e) {
  const campo = e.currentTarget.querySelector('input')
  if (!campo || campo.disabled) return
  campo.focus()
  if (typeof campo.showPicker === 'function') {
    /* Chrome recusa showPicker fora de um gesto do usuário e em alguns
       estados do campo; o clique já está no input por baixo, então não há o
       que fazer além de deixar o nativo seguir. */
    try {
      campo.showPicker()
    } catch {
      /* segue o clique nativo */
    }
  }
}

function Campo({ tipo, valor, rotulo, desabilitado, mascara, icone, onMudar }) {
  return (
    <div
      className={`${s.campo} ${desabilitado ? s.campoDesligado : ''}`}
      onClick={abrirSeletor}
      role="presentation"
    >
      <span className={s.campoTexto}>{mascara}</span>
      <img
        className={s.campoIcone}
        src={icone}
        alt=""
        width={24}
        height={24}
      />
      <input
        className={s.campoNativo}
        type={tipo}
        value={valor}
        disabled={desabilitado}
        aria-label={rotulo}
        onChange={onMudar}
      />
    </div>
  )
}

function ParDeCampos({ data, hora, onMudar, desabilitado = false }) {
  return (
    <div className={s.parDeCampos}>
      <Campo
        tipo="date"
        rotulo="Data"
        valor={paraCampoDeData(data)}
        mascara={formatarCampoCurto(data)}
        icone={calendarBlank}
        desabilitado={desabilitado}
        onMudar={(e) => onMudar({ data: deCampoDeData(e.target.value) })}
      />
      <Campo
        tipo="time"
        rotulo="Hora"
        valor={hora}
        mascara={hora}
        icone={clock}
        desabilitado={desabilitado}
        onMudar={(e) => onMudar({ hora: e.target.value })}
      />
    </div>
  )
}

/* Um passo no número, sem sair da faixa. Campo vazio ou ilegível começa do
   mínimo: é o primeiro valor que vale, e não um palpite. */
function somar(quantidade, passo) {
  const n = Math.round(Number(quantidade))
  if (!Number.isFinite(n)) return CICLOS_MIN
  return Math.min(CICLOS_MAX, Math.max(CICLOS_MIN, n + passo))
}

/* Mesma ideia do prazo em dias: o campo não deixa salvar fora da faixa que o
   motor sabe usar. */
const quantidadeValida = (n) => {
  const numero = Number(n)
  return Number.isInteger(numero) && numero >= CICLOS_MIN && numero <= CICLOS_MAX
}

/* Fecha e devolve, ou fecha e descarta — o par que todo modal daqui usa. */
function useRascunho(valor, onSalvar) {
  const [rascunho, setRascunho] = useState(valor)
  const alterar = (campos) => setRascunho((r) => ({ ...r, ...campos }))
  return [rascunho, setRascunho, alterar, () => onSalvar(rascunho)]
}

export function ModalDataEnvio({ valor, onSalvar, onFechar }) {
  const [rascunho, , alterar, salvar] = useRascunho(valor, onSalvar)

  return (
    <ModalFluxo
      titulo="Data e hora de envio"
      onVoltar={onFechar}
      onFechar={onFechar}
      onSalvar={salvar}
    >
      <div className={s.blocoEnvio}>
        {/* Marcar "enviar imediatamente" desliga os campos: a data deixa de
            valer, e deixá-los editáveis sugeriria o contrário. */}
        <ParDeCampos
          data={rascunho.data}
          hora={rascunho.hora}
          desabilitado={rascunho.imediato}
          onMudar={alterar}
        />
        <button
          type="button"
          className={s.linhaCheck}
          role="checkbox"
          aria-checked={rascunho.imediato}
          onClick={() => alterar({ imediato: !rascunho.imediato })}
        >
          <img
            className={s.icone}
            src={rascunho.imediato ? checkSquare : square}
            alt=""
            width={24}
            height={24}
          />
          <span className={s.textoCheck}>Enviar imediatamente quando finalizar</span>
        </button>
      </div>
    </ModalFluxo>
  )
}

/* "Tipo" é como a linha e o modal se chamam desde o desenho novo (Figma
   8201:7543); o valor guardado continua sendo `recorrencia`. */
export function ModalRecorrencia({ valor, onSalvar, onFechar }) {
  const [rascunho, setRascunho] = useState(valor)
  return (
    <ModalFluxo
      titulo="Tipo"
      onVoltar={onFechar}
      onFechar={onFechar}
      onSalvar={() => onSalvar(rascunho)}
    >
      <ListaDeOpcoes
        opcoes={['Recorrente', 'Única']}
        marcada={rascunho}
        onEscolher={setRascunho}
      />
    </ModalFluxo>
  )
}

export function ModalFrequencia({ valor, onSalvar, onFechar }) {
  const [rascunho, setRascunho] = useState(valor)
  return (
    <ModalFluxo
      titulo="Frequência"
      onVoltar={onFechar}
      onFechar={onFechar}
      onSalvar={() => onSalvar(rascunho)}
    >
      <ListaDeOpcoes
        opcoes={[
          'Semanal',
          'Mensal',
          'A cada três meses',
          'A cada seis meses',
          'Anual',
        ]}
        marcada={rascunho}
        onEscolher={setRascunho}
      />
    </ModalFluxo>
  )
}

const PERIODOS = ['1 dia', '1 semana', '1 mês']

export function ModalPrazo({ valor, onSalvar, onFechar }) {
  const [rascunho, , alterar, salvar] = useRascunho(valor, onSalvar)
  const porData = rascunho.tipo === 'data'
  /* Só vale enquanto a opção de dias está escolhida: o campo fica lá, com o
     que a pessoa digitou por último, mesmo depois de ela mudar para período
     ou data, e travar o Salvar por causa dele seria travar por nada. */
  const erroDosDias =
    rascunho.tipo === 'dias' && !diasValidos(rascunho.dias)
      ? `Escolha de ${DIAS_MIN} a ${DIAS_MAX} dias.`
      : ''
  const porDias = rascunho.tipo === 'dias'

  return (
    <ModalFluxo
      titulo="Prazo pra respostas"
      salvarDesabilitado={Boolean(erroDosDias)}
      erro={erroDosDias}
      onVoltar={onFechar}
      onFechar={onFechar}
      onSalvar={salvar}
    >
      <div className={s.opcoes} role="radiogroup">
        {PERIODOS.map((periodo) => (
          <Opcao
            key={periodo}
            texto={periodo}
            marcada={rascunho.tipo === 'periodo' && rascunho.periodo === periodo}
            onEscolher={() => alterar({ tipo: 'periodo', periodo })}
          />
        ))}

        {/* Quarta opção: um número de dias qualquer. Escolher o rádio ou
            digitar no campo é a mesma coisa — quem digita está escolhendo. */}
        <div className={s.opcaoComCampos}>
          <Opcao
            rotulo="Prazo em dias"
            marcada={porDias}
            onEscolher={() => alterar({ tipo: 'dias' })}
          />
          <div className={s.parDeCampos}>
            <input
              className={`${s.campoData} ${erroDosDias ? s.campoInvalido : ''}`}
              type="number"
              min={DIAS_MIN}
              max={DIAS_MAX}
              step="1"
              value={rascunho.dias ?? ''}
              placeholder="15"
              aria-label="Número de dias"
              aria-invalid={Boolean(erroDosDias)}
              onChange={(e) => alterar({ tipo: 'dias', dias: e.target.value })}
            />
            <span className={s.unidadeCampo}>Dias</span>
          </div>
        </div>

        <div className={s.divisor}>
          <span className={s.divisorLinha} />
          <p className={s.divisorTexto}>ou</p>
          <span className={s.divisorLinha} />
        </div>

        {/* Os campos só ficam editáveis com a opção de data escolhida. */}
        <div className={s.opcaoComCampos}>
          <Opcao
            rotulo="Data específica"
            marcada={porData}
            onEscolher={() => alterar({ tipo: 'data' })}
          />
          <ParDeCampos
            data={rascunho.data}
            hora={rascunho.hora}
            desabilitado={!porData}
            onMudar={alterar}
          />
        </div>
      </div>
    </ModalFluxo>
  )
}

/* O que a linha "Número de ciclos" mostra nas duas telas. Sem número
   estipulado ela diz "Indefinido", que é o que a pesquisa é: repete até
   alguém parar. */
export function textoDeCiclos(ciclos) {
  if (ciclos?.tipo !== 'definido') return 'Indefinido'
  const n = Math.round(Number(ciclos.quantidade))
  if (!Number.isFinite(n)) return 'Indefinido'
  return `${n} ${n === 1 ? 'ciclo' : 'ciclos'}`
}

/*
 * Número de ciclos (Figma 8201:7912 fechado, 8201:8053 aberto).
 *
 * Duas escolhas: repetir sem fim marcado, ou parar depois de um número de
 * voltas. O número não é enfeite — `tetoDeCiclos` no motor encerra a pesquisa
 * quando a última volta fecha.
 *
 * "Configurações avançadas" mora dentro deste modal, e não tem parentesco com
 * o modal de mesmo nome que saiu do projeto: aquele guardava quatro chaves
 * soltas, este diz de que jeito a data da próxima volta é calculada.
 *
 * A seção só aparece de mês para cima. No semanal a volta cai sempre no mesmo
 * dia da semana e as três opções diriam a mesma coisa — mostrá-las seria
 * oferecer uma escolha sem consequência.
 */
export function ModalCiclos({ valor, envio, frequencia, onSalvar, onFechar }) {
  const [rascunho, , alterar, salvar] = useRascunho(
    { tipo: 'indefinido', quantidade: 5, regra: REGRA_PADRAO, ...valor },
    onSalvar,
  )
  const [avancadasAbertas, setAvancadasAbertas] = useState(false)
  const definido = rascunho.tipo === 'definido'

  /* Só trava enquanto a opção do número está escolhida: o campo guarda o que
     foi digitado por último mesmo com "Indefinido" marcado, e travar o Salvar
     por causa dele seria travar por nada. */
  const erroDaQuantidade =
    definido && !quantidadeValida(rascunho.quantidade)
      ? `Escolha de ${CICLOS_MIN} a ${CICLOS_MAX} ciclos.`
      : ''

  /* As frases das avançadas nomeiam a data de envio escolhida. Sem data
     legível não há o que escrever, e a seção inteira sai: escolher entre três
     regras sobre um dia que ninguém sabe qual é não decide nada. */
  const ancora = paraData(envio?.data, envio?.hora)
  const temAvancadas = frequenciaTemRegra(frequencia) && Boolean(ancora)

  return (
    <ModalFluxo
      titulo="Número de ciclos"
      salvarDesabilitado={Boolean(erroDaQuantidade)}
      erro={erroDaQuantidade}
      onVoltar={onFechar}
      onFechar={onFechar}
      onSalvar={salvar}
    >
      <div className={s.blocoCiclos}>
        <div className={s.opcoes} role="radiogroup" aria-label="Número de ciclos">
          <Opcao
            texto="Indefinido"
            marcada={!definido}
            onEscolher={() => alterar({ tipo: 'indefinido' })}
          />

          {/* Escolher o rádio ou mexer no número é a mesma coisa — quem
              digita está escolhendo. */}
          <div className={s.opcaoComCampos}>
            <Opcao
              texto="Quantidade definida"
              marcada={definido}
              onEscolher={() => alterar({ tipo: 'definido' })}
            />
            {/* O <input type="number"> já anda de 1 em 1 pelas setas do
                teclado e pelo esticador do navegador; o ícone do Figma é o
                mesmo par de setas, então ele fica clicável e move o número —
                senão seriam dois controles dizendo a mesma coisa e só um
                funcionando. */}
            <div
              className={`${s.campoNumero} ${erroDaQuantidade ? s.campoInvalido : ''}`}
            >
              <input
                className={s.campoNumeroEntrada}
                type="number"
                min={CICLOS_MIN}
                max={CICLOS_MAX}
                step="1"
                value={rascunho.quantidade ?? ''}
                aria-label="Quantidade de ciclos"
                aria-invalid={Boolean(erroDaQuantidade)}
                onChange={(e) =>
                  alterar({ tipo: 'definido', quantidade: e.target.value })
                }
              />
              <span className={s.esticador}>
                <button
                  type="button"
                  className={s.meiaSeta}
                  aria-label="Mais um ciclo"
                  onClick={() => alterar({ tipo: 'definido', quantidade: somar(rascunho.quantidade, 1) })}
                />
                <button
                  type="button"
                  className={s.meiaSeta}
                  aria-label="Menos um ciclo"
                  onClick={() => alterar({ tipo: 'definido', quantidade: somar(rascunho.quantidade, -1) })}
                />
                <img
                  className={s.campoIcone}
                  src={caretUpDown}
                  alt=""
                  width={24}
                  height={24}
                />
              </span>
            </div>
          </div>
        </div>

        {temAvancadas ? (
          <>
            <button
              type="button"
              className={s.linhaAvancadas}
              aria-expanded={avancadasAbertas}
              onClick={() => setAvancadasAbertas((aberta) => !aberta)}
            >
              <span className={s.rotuloAvancadas}>Configurações avançadas</span>
              <img
                className={`${s.icone} ${avancadasAbertas ? s.setaAberta : ''}`}
                src={caretDown}
                alt=""
                width={24}
                height={24}
              />
            </button>

            {avancadasAbertas ? (
              <div
                className={s.opcoes}
                role="radiogroup"
                aria-label="Como a data de cada ciclo é calculada"
              >
                {REGRAS.map((regra) => (
                  <Opcao
                    key={regra}
                    texto={textoDaRegra(regra, ancora, frequencia)}
                    marcada={(rascunho.regra ?? REGRA_PADRAO) === regra}
                    onEscolher={() => alterar({ regra })}
                  />
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </ModalFluxo>
  )
}

/*
 * A caixa já chega escrita: o que está em `valor` é a sugestão montada em
 * estado.jsx a partir do template e de quem responde — o mesmo caminho do
 * prompt, e a mesma sugestão de mentira, porque o projeto não chama modelo
 * nenhum. Daqui em diante o texto é de quem escreve: editado uma vez, ele
 * para de ser refeito quando o template ou o público mudam.
 */
export function ModalMensagemFinal({ valor, onSalvar, onFechar }) {
  const [rascunho, setRascunho] = useState(valor)
  return (
    <ModalFluxo
      titulo="Mensagem final"
      onVoltar={onFechar}
      onFechar={onFechar}
      onSalvar={() => onSalvar(rascunho)}
    >
      <textarea
        className={s.mensagem}
        value={rascunho}
        aria-label="Mensagem final"
        onChange={(e) => setRascunho(e.target.value)}
      />
    </ModalFluxo>
  )
}
