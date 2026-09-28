import { CHAVES, ler, gravar } from './armazenamento.js'
import { intervaloDoPeriodo, hojeIso } from './datas.js'

/*
 * Filtro ativo. Ao abrir o modulo o padrao e "Este mes" (enunciado), e o que
 * estiver salvo vence sobre ele.
 */
export const PADRAO = {
  periodo: 'este-mes',
  inicio: null,
  fim: null,
  categorias: [],
  contatos: [],
  tipos: [],
  busca: '',
}

/*
 * A home sempre tem um periodo (Figma 2279:100344: o dropdown do cabecalho e o
 * chip da toolbar sempre mostram um). Sem periodo, a tabela listaria todos os
 * meses, inclusive as ocorrencias futuras de cada repeticao.
 *
 * Por isso um `periodo` nulo ou desconhecido vindo do storage - de versoes em
 * que limpar o chip apagava o periodo - volta para o padrao. O intervalo
 * personalizado (inicio + fim) continua valendo e nao mexe no periodo.
 */
/*
 * O filtro nao persiste entre visitas: ao abrir o modulo e sempre "Este mes"
 * e nenhuma coluna filtrada. Abrir a home com um filtro antigo escondendo
 * linhas, sem a pessoa lembrar por que, confunde mais do que ajuda.
 */
export function carregar() {
  return { ...PADRAO }
}

/* Mantido para quem ja tinha filtros gravados: limpa o registro antigo. */
export function salvar() {
  return gravar(CHAVES.FILTROS, null)
}

export function intervalo(filtros, hoje = hojeIso()) {
  if (filtros.inicio && filtros.fim) return { inicio: filtros.inicio, fim: filtros.fim }
  return intervaloDoPeriodo(filtros.periodo, hoje) ?? { inicio: '0000-01-01', fim: '9999-12-31' }
}

/* Os filtros se combinam: periodo E categorias E contatos E tipo E busca. */
export function aplicar(transacoes, filtros, hoje = hojeIso()) {
  const { inicio, fim } = intervalo(filtros, hoje)
  const termo = String(filtros.busca ?? '').trim().toLowerCase()
  return transacoes.filter((t) => {
    if (t.data < inicio || t.data > fim) return false
    if (filtros.categorias.length && !filtros.categorias.includes(t.categoriaId)) return false
    /* A chave do contato e o id quando ha cadastro, e o proprio texto
       vinculado quando nao ha - a mesma que o dropdown lista. */
    if (filtros.contatos.length) {
      const chave = t.contatoId ?? t.contatoAvulso
      if (!chave || !filtros.contatos.includes(chave)) return false
    }
    if (filtros.tipos.length) {
      /* "Agendada" nao e um tipo de transacao: e qualquer uma com data futura. */
      const marcas = [t.tipo, ...(t.data > hoje ? ['agendada'] : [])]
      if (!marcas.some((m) => filtros.tipos.includes(m))) return false
    }
    if (termo && !t.nome.toLowerCase().includes(termo)) return false
    return true
  })
}

export function rotuloDoPeriodo(filtros, periodos) {
  if (filtros.inicio && filtros.fim) return 'Data personalizada'
  return periodos.find((p) => p.id === filtros.periodo)?.rotulo ?? null
}
