import { Fragment, useState } from "react";
import { CalendarBlank, X } from "@phosphor-icons/react";
import { PainelLateral, PilulaFiltro } from "@squad/ui";
import CalendarioPopover from "./CalendarioPopover.jsx";
import {
  PERIODOS,
  intervaloDoPeriodo,
  formatarCurta,
  hojeIso,
} from "../lib/datas.js";
import * as Filtros from "../lib/filtros.js";
import s from "./PainelFiltros.module.css";

/*
 * Painel "Filtros" (Figma 2279:107491).
 *
 * Trabalha sobre um rascunho: Salvar aplica, e Cancelar / X / Esc / clique no
 * veu descartam. Periodo e datas sao a mesma informacao vista de dois jeitos -
 * escolher uma pilula preenche as datas, e escolher datas na mao tira a
 * selecao das pilulas.
 */
function PainelFiltros({
  aberto,
  filtros, onSalvar, onFechar }) {
  const [rascunho, setRascunho] = useState(() => ({
    periodo: filtros.periodo,
    ...(filtros.inicio && filtros.fim
      ? { inicio: filtros.inicio, fim: filtros.fim }
      : intervaloDoPeriodo(filtros.periodo, hojeIso())),
  }));
  /* Qual campo de data esta com o calendario aberto: 'inicio', 'fim' ou null. */
  const [campoAberto, setCampoAberto] = useState(null);

  const escolherPeriodo = (id) => {
    const faixa = intervaloDoPeriodo(id, hojeIso());
    setRascunho({ periodo: id, inicio: faixa.inicio, fim: faixa.fim });
    setCampoAberto(null);
  };

  const escolherData = (iso) => {
    setRascunho((atual) => {
      if (campoAberto === "inicio")
        return { periodo: null, inicio: iso, fim: atual.fim };
      /* Fim antes do inicio: troca as duas, em vez de recusar. */
      if (iso < atual.inicio)
        return { periodo: null, inicio: iso, fim: atual.inicio };
      return { periodo: null, inicio: atual.inicio, fim: iso };
    });
    setCampoAberto(campoAberto === "inicio" ? "fim" : null);
  };

  const semPeriodo = !rascunho.periodo;

  return (
    <PainelLateral
      aberto={aberto}
      titulo="Filtros"
      iconeFechar={<X size={24} color="var(--cor-texto-secundario)" />}
      onFechar={onFechar}
      rotuloConfirmar="Salvar Filtro"
      onConfirmar={() =>
        onSalvar(
          rascunho.periodo
            ? { periodo: rascunho.periodo, inicio: null, fim: null }
            : { periodo: null, inicio: rascunho.inicio, fim: rascunho.fim },
        )
      }
      prenderFoco
    >
      <div className={s.bloco}>
        <div className={s.secao}>
          <p className={s.rotulo}>Período:</p>
          <div className={s.pilulas}>
            {PERIODOS.map((periodo) => (
              <PilulaFiltro
                key={periodo.id}
                selecionada={rascunho.periodo === periodo.id}
                iconeLimpar={<X size={20} color="#ffffff" />}
                onClick={() => escolherPeriodo(periodo.id)}
                onLimpar={() => escolherPeriodo(Filtros.PADRAO.periodo)}
              >
                {periodo.rotulo}
              </PilulaFiltro>
            ))}
          </div>
        </div>

        <div className={`${s.secao} ${s.secaoData}`}>
          <p className={s.rotulo}>Data:</p>
          <div className={s.campos}>
            {["inicio", "fim"].map((qual, i) => (
              /* O "a" e irmao dos dois campos, nao filho do segundo: dentro do
               envolucro ele roubaria largura e os campos ficariam desiguais. */
              <Fragment key={qual}>
                {i === 1 ? <span className={s.conector}>a</span> : null}
                <div className={s.envolucroCampo}>
                  <button
                    type="button"
                    className={`${s.campoData} ${campoAberto === qual ? s.campoAberto : ""} ${semPeriodo ? s.campoEscolhido : ""}`}
                    onClick={() =>
                      setCampoAberto(campoAberto === qual ? null : qual)
                    }
                  >
                    <CalendarBlank size={20} />
                    {formatarCurta(rascunho[qual])}
                  </button>
                  {campoAberto === qual ? (
                    <CalendarioPopover
                      aDireita={qual === "fim"}
                      valor={rascunho[qual]}
                      onEscolher={escolherData}
                      onFechar={() => setCampoAberto(null)}
                    />
                  ) : null}
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </PainelLateral>
  );
}

export default PainelFiltros;
