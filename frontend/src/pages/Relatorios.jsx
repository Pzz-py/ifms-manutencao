import { useCallback, useEffect, useState } from "react";
import {
  FileBarChart,
  Loader2,
  AlertTriangle,
  Printer,
  ShieldAlert,
  Package,
  MapPin,
  Wrench,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Input from "../components/Input";
import Button from "../components/Button";
import StatCard from "../components/StatCard";
import relatorioService from "../services/relatorio.service";
import { getErrorMessage } from "../utils/getErrorMessage";
import { useCategoriasChamado } from "../hooks/useCategoriasChamado";
import { STATUS_CONFIG, ORDEM_STATUS } from "../utils/statusConfig";
import { PRIORIDADE_CONFIG, ORDEM_PRIORIDADE } from "../utils/prioridadeConfig";
import { formatarDataCompleta } from "../utils/formatDate";

/**
 * Relatório consolidado da manutenção (visão de gestão).
 *
 * Diferente do relatório individual (tela de detalhes de um chamado),
 * aqui a administração vê o agregado do período: que tipo de problema
 * mais aparece, em quais locais, quanto material foi gasto e quanto
 * tempo levamos para resolver. Também é exportável em PDF, usando a
 * mesma estratégia de impressão do relatório individual.
 */
export default function Relatorios() {
  const { usuario } = useAuth();
  const ehAdministrador = usuario?.role === "ADMINISTRADOR";
  const { info: infoCategoria } = useCategoriasChamado();

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const buscar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const resultado = await relatorioService.consolidado({ dataInicio, dataFim });
      setDados(resultado);
    } catch (err) {
      setErro(getErrorMessage(err, "Não foi possível gerar o relatório."));
    } finally {
      setCarregando(false);
    }
  }, [dataInicio, dataFim]);

  useEffect(() => {
    if (ehAdministrador) buscar();
  }, [ehAdministrador, buscar]);

  if (!ehAdministrador) {
    return (
      <div className="surface-card p-8 max-w-lg flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-priority-urgente/10 text-priority-urgente flex items-center justify-center shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-neutral-900 mb-1">Acesso restrito</h2>
          <p className="text-sm text-neutral-500">
            Somente administradores podem visualizar os relatórios de gestão.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3 no-print">
        <div>
          <h2 className="font-display text-lg font-bold text-neutral-900">Relatório consolidado</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            Visão geral da manutenção: tipos de problema, locais, materiais e prazos.
          </p>
        </div>
        <Button variant="secondary" onClick={() => window.print()} disabled={!dados}>
          <Printer className="w-4 h-4" /> Exportar PDF
        </Button>
      </div>

      {/* Cabeçalho institucional — só no papel/PDF */}
      <div className="hidden print:block border-b border-neutral-300 pb-3 mb-2">
        <p className="font-display font-bold text-neutral-900">
          Relatório Consolidado de Manutenção
        </p>
        <p className="text-xs text-neutral-500">
          IFMS — Campus Jardim · Emitido em {formatarDataCompleta(new Date())}
          {dados?.periodo?.dataInicio || dados?.periodo?.dataFim
            ? ` · Período: ${dados.periodo.dataInicio || "início"} a ${dados.periodo.dataFim || "hoje"}`
            : " · Período: todos os chamados"}
        </p>
      </div>

      {/* Filtro de período */}
      <div className="surface-card p-4 flex flex-wrap items-end gap-3 no-print">
        <div className="w-44">
          <Input
            id="dataInicio"
            type="date"
            label="De"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>
        <div className="w-44">
          <Input
            id="dataFim"
            type="date"
            label="Até"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>
        {(dataInicio || dataFim) && (
          <button
            onClick={() => {
              setDataInicio("");
              setDataFim("");
            }}
            className="text-sm text-neutral-500 hover:text-neutral-700 pb-2.5"
          >
            Limpar período
          </button>
        )}
      </div>

      {carregando && (
        <div className="flex items-center gap-2 text-sm text-neutral-500 py-16 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Gerando relatório...
        </div>
      )}

      {!carregando && erro && (
        <div className="surface-card p-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-priority-urgente shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-neutral-800">Não foi possível gerar</p>
            <p className="text-sm text-neutral-500 mt-0.5">{erro}</p>
          </div>
        </div>
      )}

      {!carregando && dados && (
        <>
          {/* Indicadores */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={FileBarChart}
              label="Chamados no período"
              value={dados.indicadores.total}
              tone="primary"
            />
            <StatCard
              icon={Wrench}
              label="Em aberto"
              value={dados.indicadores.abertos}
              tone="accent"
            />
            <StatCard
              icon={FileBarChart}
              label="Taxa de conclusão"
              value={`${dados.indicadores.taxaConclusao}%`}
              tone="neutral"
            />
            <StatCard
              icon={Loader2}
              label="Tempo médio de resolução"
              value={
                dados.indicadores.tempoMedioDias !== null
                  ? `${dados.indicadores.tempoMedioDias} d`
                  : "—"
              }
              tone="neutral"
            />
          </div>

          {dados.indicadores.total === 0 && (
            <div className="surface-card p-8 text-center">
              <p className="text-sm text-neutral-500">
                Nenhum chamado registrado no período selecionado.
              </p>
            </div>
          )}

          {dados.indicadores.total > 0 && (
            <>
              {/* Tipo de problema */}
              <div className="surface-card p-5">
                <h3 className="font-display font-semibold text-sm text-neutral-800 mb-4">
                  Tipos de problema
                </h3>
                <TabelaDistribuicao
                  linhas={Object.keys(dados.porCategoria)
                    .map((chave) => ({
                      rotulo: infoCategoria(chave).label,
                      cor: infoCategoria(chave).color,
                      quantidade: dados.porCategoria[chave] || 0,
                    }))
                    .sort((a, b) => b.quantidade - a.quantidade)}
                  total={dados.indicadores.total}
                />
              </div>

              {/* Localização */}
              <div className="surface-card p-5">
                <h3 className="flex items-center gap-1.5 font-display font-semibold text-sm text-neutral-800 mb-4">
                  <MapPin className="w-4 h-4" /> Chamados por localização
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-neutral-400 uppercase tracking-wide text-left">
                        <th className="pb-2 font-medium">Local</th>
                        <th className="pb-2 font-medium">Bloco</th>
                        <th className="pb-2 font-medium text-right">Chamados</th>
                        <th className="pb-2 font-medium text-right">Concluídos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {dados.porLocal.map((item) => (
                        <tr key={item.local}>
                          <td className="py-2 text-neutral-800 font-medium">{item.local}</td>
                          <td className="py-2 text-neutral-500">{item.bloco || "—"}</td>
                          <td className="py-2 text-neutral-700 text-right">{item.quantidade}</td>
                          <td className="py-2 text-neutral-500 text-right">{item.concluidos}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Materiais gastos */}
              <div className="surface-card p-5">
                <h3 className="flex items-center gap-1.5 font-display font-semibold text-sm text-neutral-800 mb-4">
                  <Package className="w-4 h-4" /> Materiais gastos
                </h3>
                {dados.materiais.length === 0 ? (
                  <p className="text-sm text-neutral-400">
                    Nenhum material registrado no período.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-neutral-400 uppercase tracking-wide text-left">
                          <th className="pb-2 font-medium">Material</th>
                          <th className="pb-2 font-medium text-right">Solicitado</th>
                          <th className="pb-2 font-medium text-right">Utilizado</th>
                          <th className="pb-2 font-medium text-right">Chamados</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {dados.materiais.map((m) => (
                          <tr key={m.nome}>
                            <td className="py-2 text-neutral-800 font-medium">{m.nome}</td>
                            <td className="py-2 text-neutral-500 text-right">
                              {m.quantidadeSolicitada}
                            </td>
                            <td className="py-2 text-neutral-800 text-right font-medium">
                              {m.quantidadeUtilizada}
                            </td>
                            <td className="py-2 text-neutral-500 text-right">{m.chamados}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Status e prioridade */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print-single-column">
                <div className="surface-card p-5">
                  <h3 className="font-display font-semibold text-sm text-neutral-800 mb-4">
                    Situação dos chamados
                  </h3>
                  <TabelaDistribuicao
                    linhas={ORDEM_STATUS.map((chave) => ({
                      rotulo: STATUS_CONFIG[chave].label,
                      cor: STATUS_CONFIG[chave].color,
                      quantidade: dados.porStatus[chave] || 0,
                    }))}
                    total={dados.indicadores.total}
                  />
                </div>

                <div className="surface-card p-5">
                  <h3 className="font-display font-semibold text-sm text-neutral-800 mb-4">
                    Prioridades
                  </h3>
                  <TabelaDistribuicao
                    linhas={ORDEM_PRIORIDADE.map((chave) => ({
                      rotulo: PRIORIDADE_CONFIG[chave].label,
                      cor: PRIORIDADE_CONFIG[chave].color,
                      quantidade: dados.porPrioridade[chave] || 0,
                    }))}
                    total={dados.indicadores.total}
                  />
                </div>
              </div>

              <p className="text-xs text-neutral-400">
                {dados.indicadores.abertosSemLogin} de {dados.indicadores.total} chamados foram
                abertos sem login (via QR Code ou formulário público).
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}

/** Lista com barra proporcional — mais legível no papel do que um gráfico. */
function TabelaDistribuicao({ linhas, total }) {
  return (
    <ul className="space-y-2.5">
      {linhas.map((linha) => {
        const percentual = total ? Math.round((linha.quantidade / total) * 100) : 0;
        return (
          <li key={linha.rotulo} className="flex items-center gap-3 text-sm">
            <span className="w-32 shrink-0 text-neutral-600 truncate">{linha.rotulo}</span>
            <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${percentual}%`, backgroundColor: linha.cor }}
              />
            </div>
            <span className="w-16 shrink-0 text-right text-neutral-800 font-medium">
              {linha.quantidade}
              <span className="text-neutral-400 font-normal text-xs"> ({percentual}%)</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
