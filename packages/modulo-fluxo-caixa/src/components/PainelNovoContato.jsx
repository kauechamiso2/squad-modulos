import { useEffect, useState } from 'react'
import { PencilSimpleLine, UserCircle, X } from '@phosphor-icons/react'
import { PainelLateral } from '@squad/ui'
import * as Contatos from '../lib/contatos.js'
import { buscarPorCnpj } from '../lib/receita.js'
import { detectarTipo, formatarDocumento, cnpjValido } from '../lib/documentos.js'
import useFocoInicial from './useFocoInicial.js'
import s from './Painel.module.css'

/*
 * Painel "Novo contato" (Figma 2279:95361 pelo nome, 2279:95577 pelo CNPJ).
 *
 * Os dois estados tem a mesma estrutura: em cima o UserCircle de 64px com o
 * que a pessoa ja digitou na busca, embaixo o campo que falta.
 *   - digitou um nome   -> embaixo vem o documento, opcional
 *   - digitou documento -> embaixo vem o nome, obrigatorio
 *
 * Quando o documento e um CNPJ valido, o nome ja vem preenchido da base
 * publica da Receita (anotacao 2279:96450). A busca nunca bloqueia: se a rede
 * cair ou o CNPJ nao existir, o campo fica vazio para digitar a mao.
 */
function PainelNovoContato({
  aberto,
  valorInicial = '', onSalvar, onFechar }) {
  const tipo = detectarTipo(valorInicial)
  const ehDocumento = Boolean(tipo)

  const [nome, setNome] = useState(ehDocumento ? '' : valorInicial)
  const [documento, setDocumento] = useState(ehDocumento ? valorInicial : '')
  /* Ja nasce buscando quando ha CNPJ valido, para o campo nao piscar vazio
     antes do efeito rodar. */
  const [buscando, setBuscando] = useState(() => tipo === 'cnpj' && cnpjValido(valorInicial))
  const campoNome = useFocoInicial()
  const campoDocumento = useFocoInicial()

  useEffect(() => {
    if (tipo !== 'cnpj' || !cnpjValido(valorInicial)) return
    const controle = new AbortController()
    buscarPorCnpj(valorInicial, { sinal: controle.signal })
      .then((achado) => { if (achado) setNome(achado.nome) })
      .catch(() => {})            // rede fora: segue com o campo vazio
      .finally(() => { if (!controle.signal.aborted) setBuscando(false) })
    return () => controle.abort()
  }, [tipo, valorInicial])

  const cabecalho = ehDocumento ? formatarDocumento(valorInicial, tipo) : valorInicial
  const nomeFinal = (ehDocumento ? nome : valorInicial).trim()
  const docFinal = ehDocumento ? valorInicial : documento.trim()

  return (
    <PainelLateral
      aberto={aberto}
      titulo="Novo contato"
      iconeFechar={<X size={24} color="var(--cor-texto-secundario)" />}
      onFechar={onFechar}
      rotuloConfirmar="Salvar"
      confirmarDesabilitado={nomeFinal.length === 0}
      onConfirmar={() =>
        onSalvar(Contatos.criar({ nome: nomeFinal, documento: docFinal || null }))
      }
      prenderFoco
    >
      <div className={s.blocoContato}>
        <div className={s.identificacao}>
          <UserCircle size={64} />
          <span className={s.identificador}>{cabecalho}</span>
        </div>

        {ehDocumento ? (
          <div className={`${s.campoContato} ${s.campoContatoPreenchido}`}>
            <input
              {...campoNome}
              className={s.entradaContato}
              value={buscando ? '' : nome}
              placeholder={buscando ? 'Buscando na Receita...' : 'Nome do contato'}
              aria-label="Nome do contato"
              disabled={buscando}
              onChange={(e) => setNome(e.target.value)}
            />
            <button
              type="button"
              className={s.botaoLapis}
              aria-label="Editar nome"
              onClick={() => campoNome.ref.current?.focus()}
            >
              <PencilSimpleLine size={24} />
            </button>
          </div>
        ) : (
          <div className={s.blocoOpcional}>
            <span className={s.rotuloOpcional}>Opcional</span>
            {/* Preenchido (2279:95424): fundo #f4f5f5, borda #e3e6e6, texto
                #798282 e o lapis num botao de 24px com icone de 14.4px. */}
            <div className={`${s.campoContato} ${documento ? s.campoContatoOpcionalCheio : ''}`}>
              <input
                className={s.entradaContato}
                value={documento}
                placeholder="Adicione um número, CPF ou CNPJ..."
                aria-label="Documento ou telefone"
                {...campoDocumento}
                onChange={(e) => setDocumento(e.target.value)}
                onBlur={(e) => {
                  const t = detectarTipo(e.target.value)
                  if (t) setDocumento(formatarDocumento(e.target.value, t))
                }}
              />
              {documento ? (
                <span className={s.lapisPequeno}><PencilSimpleLine size={14.4} /></span>
              ) : (
                <PencilSimpleLine size={24} />
              )}
            </div>
          </div>
        )}
      </div>
    </PainelLateral>
  )
}

export default PainelNovoContato
