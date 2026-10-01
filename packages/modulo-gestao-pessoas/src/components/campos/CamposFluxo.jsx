import { useEffect, useRef, useState } from 'react'
import calendarPlusIcon from '../../assets/icons/CalendarPlus.svg'
import squareIcon from '../../assets/icons/Square.svg'
import checkSquareIcon from '../../assets/icons/CheckSquare.svg'
import InlineEditField from '../colaborador/InlineEditField.jsx'
import Calendar from '../colaborador/Calendar.jsx'
import SeletorSegmentado from './SeletorSegmentado.jsx'
import { useDropdownPosition } from '../../utils/useDropdownPosition.js'
import { centsToAmount, formatAmountFromDigits, proximaSegundaIso } from '../../utils/formatters.js'
import {
  OPCOES_CONTATO,
  contatoValido,
  formatarContato,
  formatarDataBr,
  mascaraTelefone,
  soDigitos,
} from '../../utils/mascaras.js'
import '../colaborador/ColaboradorDetail.css'
import './CamposFluxo.css'

/*
 * Linhas do passo Informações dos fluxos de criar colaborador - Figma
 * 10338:10668: 72px, divisoria, rotulo a esquerda e valor ou "Adicionar" a
 * direita. O Figma nao tem o estado de edicao: segue o padrao de linha da
 * pagina do colaborador, clique para editar e Enter salva.
 */
export function LinhaFluxo({ rotulo, children }) {
  return (
    <div className="linha-fluxo">
      <span className="linha-fluxo__rotulo">{rotulo}</span>
      <div className="linha-fluxo__valor">{children}</div>
    </div>
  )
}

function textoVazio(texto) {
  return <span className="linha-fluxo__vazio">{texto}</span>
}

// Campo com mascara: grava so os digitos. `vazio` e o texto quando nao ha
// valor ("Adicionar" ou "DD/MM/AAAA").
export function CampoMascarado({ valor, onSalvar, mascara, limite, validar, vazio, vazioCinza = false, disabled = false }) {
  return (
    <InlineEditField
      value={valor ?? ''}
      disabled={disabled}
      displayValue={valor ? mascara(valor) : vazioCinza ? textoVazio(vazio) : vazio}
      formatForInput={(digitos) => mascara(digitos)}
      parseInput={(texto) => soDigitos(texto, limite)}
      validate={(digitos) => digitos === '' || validar(digitos)}
      onSave={(digitos) => onSalvar(digitos || null)}
    />
  )
}

// Valor em reais. Vazio mostra "0,00" (Figma 10338:10707).
export function CampoMoeda({ valor, onSalvar }) {
  const digitos = Math.round((valor ?? 0) * 100).toString().padStart(3, '0')
  return (
    <InlineEditField
      value={digitos}
      displayValue={formatAmountFromDigits(digitos)}
      formatForInput={(texto) => (texto ? formatAmountFromDigits(texto) : '')}
      parseInput={(texto) => texto.replace(/\D/g, '')}
      onSave={(texto) => onSalvar(centsToAmount(texto) || null)}
    />
  )
}

// Contato: Telefone ou Email com o mesmo seletor da folha "Enviar para".
// Grava { tipo, valor }; telefone so com digitos.
export function CampoContato({ valor, onSalvar, vazio = 'Adicionar', disabled = false }) {
  const [editando, setEditando] = useState(false)
  const [rascunho, setRascunho] = useState(valor ?? { tipo: 'telefone', valor: '' })
  const caixaRef = useRef(null)
  const entradaRef = useRef(null)

  useEffect(() => {
    if (editando) entradaRef.current?.focus()
  }, [editando, rascunho.tipo])

  const abrir = () => {
    setRascunho(valor ?? { tipo: 'telefone', valor: '' })
    setEditando(true)
  }

  const salvar = () => {
    if (rascunho.valor === '') onSalvar(null)
    else if (contatoValido(rascunho)) onSalvar(rascunho)
    else return
    setEditando(false)
  }

  if (!editando) {
    return (
      <button type="button" className="linha-fluxo__botao" disabled={disabled} onClick={abrir}>
        {formatarContato(valor) ?? vazio}
      </button>
    )
  }

  return (
    <div
      className="campo-contato"
      ref={caixaRef}
      onBlur={(event) => {
        if (!caixaRef.current.contains(event.relatedTarget)) setEditando(false)
      }}
    >
      <SeletorSegmentado
        rotulo="Tipo de contato"
        opcoes={OPCOES_CONTATO}
        valor={rascunho.tipo}
        onChange={(tipo) => setRascunho({ tipo, valor: '' })}
      />
      <input
        ref={entradaRef}
        className="campo-contato__entrada"
        type={rascunho.tipo === 'email' ? 'email' : 'text'}
        inputMode={rascunho.tipo === 'email' ? 'email' : 'numeric'}
        placeholder={rascunho.tipo === 'email' ? 'nome@email.com' : '00 00000 0000'}
        value={rascunho.tipo === 'email' ? rascunho.valor : mascaraTelefone(rascunho.valor)}
        onChange={(event) =>
          setRascunho({
            tipo: rascunho.tipo,
            valor: rascunho.tipo === 'email' ? event.target.value.trim() : soDigitos(event.target.value, 11),
          })
        }
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            salvar()
          }
          if (event.key === 'Escape') {
            event.stopPropagation()
            setEditando(false)
          }
        }}
      />
    </div>
  )
}

// Botao de calendario com o Calendar ancorado embaixo.
export function BotaoCalendario({ valor, onEscolher, rotulo, minDate, rodape, children }) {
  const [aberto, setAberto] = useState(false)
  const ancoraRef = useRef(null)
  const rect = useDropdownPosition(aberto, ancoraRef)

  useEffect(() => {
    if (!aberto) return
    function fecharFora(event) {
      if (ancoraRef.current && !ancoraRef.current.contains(event.target)) setAberto(false)
    }
    document.addEventListener('mousedown', fecharFora)
    return () => document.removeEventListener('mousedown', fecharFora)
  }, [aberto])

  return (
    <div className="botao-calendario" ref={ancoraRef}>
      {children ? (
        children(() => setAberto((prev) => !prev))
      ) : (
        <button
          type="button"
          className="linha-fluxo__pilula linha-fluxo__pilula--icone"
          aria-label={rotulo}
          onClick={() => setAberto((prev) => !prev)}
        >
          <img src={calendarPlusIcon} width={24} height={24} alt="" />
        </button>
      )}
      {aberto && rect && (
        <div
          className="colaborador-field__dropdown"
          style={{ top: rect.top, right: rect.right, left: 'auto' }}
        >
          <Calendar
            value={valor}
            minDate={minDate}
            onSelect={(data) => {
              onEscolher(data)
              setAberto(false)
            }}
          />
          {rodape?.(() => setAberto(false))}
        </div>
      )}
    </div>
  )
}

// Data de admissao: a pilula "Proxima segunda" e o botao de calendario;
// depois de escolhida, a data em DD/MM/AAAA, que reabre o calendario.
export function CampoDataAdmissao({ valor, onSalvar }) {
  if (valor) {
    return (
      <BotaoCalendario valor={valor} onEscolher={onSalvar} rotulo="Escolher data de admissão">
        {(alternar) => (
          <button type="button" className="linha-fluxo__botao" onClick={alternar}>
            {formatarDataBr(valor)}
          </button>
        )}
      </BotaoCalendario>
    )
  }
  return (
    <div className="linha-fluxo__pilulas">
      <button type="button" className="linha-fluxo__pilula" onClick={() => onSalvar(proximaSegundaIso())}>
        Próxima segunda
      </button>
      <BotaoCalendario valor={valor} onEscolher={onSalvar} rotulo="Escolher data de admissão" />
    </div>
  )
}

// Data de fim do contrato (PJ): a pilula "Nao especificar", que comeca sem
// selecao, e o botao de calendario. Escolher uma data troca a pilula pela
// data; reabrir o calendario deixa trocar a data ou marcar "Nao especificar
// data de fim". Dias antes da admissao ficam desabilitados.
export function CampoDataFim({ valor, semData, minDate, onSalvar }) {
  const rodape = (fechar) => (
    <button
      type="button"
      role="checkbox"
      aria-checked={!valor && semData}
      className="campo-data-fim__sem-data"
      onClick={() => {
        onSalvar({ data: null, semData: true })
        fechar()
      }}
    >
      <img src={!valor && semData ? checkSquareIcon : squareIcon} width={20} height={20} alt="" />
      Não especificar data de fim
    </button>
  )
  const escolher = (data) => onSalvar({ data, semData: false })

  if (valor) {
    return (
      <BotaoCalendario valor={valor} minDate={minDate} onEscolher={escolher} rodape={rodape} rotulo="Escolher data de fim">
        {(alternar) => (
          <button type="button" className="linha-fluxo__botao" onClick={alternar}>
            {formatarDataBr(valor)}
          </button>
        )}
      </BotaoCalendario>
    )
  }
  return (
    <div className="linha-fluxo__pilulas">
      <button
        type="button"
        className={semData ? 'linha-fluxo__pilula linha-fluxo__pilula--selecionada' : 'linha-fluxo__pilula'}
        aria-pressed={semData}
        onClick={() => onSalvar({ data: null, semData: !semData })}
      >
        Não especificar
      </button>
      <BotaoCalendario valor={valor} minDate={minDate} onEscolher={escolher} rotulo="Escolher data de fim" />
    </div>
  )
}

// Pagamento (PJ): Mensal (padrao, em preto), Anual e Valor fixo.
export function CampoPagamento({ valor, opcoes, onSalvar }) {
  return (
    <div className="linha-fluxo__pilulas linha-fluxo__pilulas--largas" role="radiogroup" aria-label="Pagamento">
      {opcoes.map((opcao) => (
        <button
          type="button"
          role="radio"
          aria-checked={valor === opcao}
          key={opcao}
          className={valor === opcao ? 'linha-fluxo__pilula linha-fluxo__pilula--selecionada' : 'linha-fluxo__pilula'}
          onClick={() => onSalvar(opcao)}
        >
          {opcao}
        </button>
      ))}
    </div>
  )
}
