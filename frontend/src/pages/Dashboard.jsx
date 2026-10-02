import { Link } from "react-router-dom";
import {
  ClipboardList,
  Inbox,
  Loader2,
  PackageSearch,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useDashboard } from "../hooks/useDashboard";
import StatCard from "../components/StatCard";
import Badge from "../components/Badge";
import ChamadosPorStatusChart from "../components/charts/ChamadosPorStatusChart";
import ChamadosPorCategoriaChart from "../components/charts/ChamadosPorCategoriaChart";
import ChamadosPorPrioridadeChart from "../components/charts/ChamadosPorPrioridadeChart";
import ChamadosPorLocalChart from "../components/charts/ChamadosPorLocalChart";
import { EVENTO_CONFIG } from "../utils/eventoConfig";
import { formatarTempoRelativo } from "../utils/formatDate";

// Ícone e tom de cada indicador de status, na ordem do fluxo.
const INDICADORES_STATUS = [
  { chave: "NOVO", label: "Novos", icon: Inbox, tone: "accent" },
  { chave: "EM_ANDAMENTO", label: "Em andamento", icon: Loader2, tone: "primary" },
  { chave: "AGUARDANDO_PECAS", label: "Aguardando peças", icon: PackageSearch, tone: "urgent" },
  { chave: "CONCLUIDO", label: "Concluídos", icon: CheckCircle2, tone: "neutral" },
];

export default function Dashboard() {
  const { usuario } = useAuth();
  const { dados, carregando, erro } = useDashboard();

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h2 className="font-display text-lg font-bold text-neutral-900">
          Olá, {usuario?.nome?.split(" ")[0]} 👋
        </h2>
        <p className="text-sm text-neutral-500 mt-0.5">
          Aqui está um resumo dos chamados de manutenção do campus.
        </p>
      </div>

      {carregando && (
        <div className="flex items-center gap-2 text-sm text-neutral-500 py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando dashboard...
        </div>
      )}

      {!carregando && erro && (
        <div className="surface-card p-6 flex items-start gap-3 border-priority-urgente/30">
          <AlertTriangle className="w-5 h-5 text-priority-urgente shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-neutral-800">
              Não foi possível carregar os dados
            </p>
            <p className="text-sm text-neutral-500 mt-0.5">{erro}</p>
          </div>
        </div>
      )}

      {!carregando && dados && (
        <>
          {/* Indicadores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              icon={ClipboardList}
              label="Total de chamados"
              value={dados.indicadores.total}
              tone="primary"
            />
            {INDICADORES_STATUS.map(({ chave, label, icon, tone }) => (
              <StatCard
                key={chave}
                icon={icon}
                label={label}
                value={dados.porStatus[chave] ?? 0}
                tone={tone}
              />
            ))}
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="surface-card p-5">
              <h3 className="font-display font-semibold text-sm text-neutral-800 mb-4">
                Chamados por status
              </h3>
              <ChamadosPorStatusChart dados={dados.porStatus} />
            </div>

            <div className="surface-card p-5">
              <h3 className="font-display font-semibold text-sm text-neutral-800 mb-4">
                Chamados por categoria
              </h3>
              <ChamadosPorCategoriaChart dados={dados.porCategoria} />
            </div>
          </div>

          {/* Por local */}
          <div className="surface-card p-5">
            <h3 className="font-display font-semibold text-sm text-neutral-800 mb-4">
              Chamados por local
            </h3>
            <ChamadosPorLocalChart dados={dados.porLocal} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Prioridade */}
            <div className="surface-card p-5">
              <h3 className="font-display font-semibold text-sm text-neutral-800 mb-4">
                Chamados por prioridade
              </h3>
              <ChamadosPorPrioridadeChart dados={dados.porPrioridade} />
            </div>

            {/* Últimas atividades */}
            <div className="surface-card p-5">
              <h3 className="font-display font-semibold text-sm text-neutral-800 mb-4">
                Últimas atividades
              </h3>
              {dados.atividades.length === 0 ? (
                <p className="text-sm text-neutral-400 py-6 text-center">
                  Nenhuma atividade registrada ainda.
                </p>
              ) : (
                <ul className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                  {dados.atividades.map((evento) => {
                    const config = EVENTO_CONFIG[evento.tipo] || EVENTO_CONFIG.OBSERVACAO;
                    const Icon = config.icon;
                    return (
                      <li key={evento.id} className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-neutral-700 leading-snug">
                            {evento.descricao}{" "}
                            <Link
                              to={`/chamados/${evento.chamadoId}`}
                              className="text-primary-600 font-medium hover:underline"
                            >
                              #{evento.chamadoNumero}
                            </Link>
                          </p>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {evento.autor} · {formatarTempoRelativo(evento.createdAt)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Chamados recentes */}
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-sm text-neutral-800">
                Chamados recentes
              </h3>
              <Link
                to="/chamados"
                className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                Ver todos <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {dados.recentes.length === 0 ? (
              <p className="text-sm text-neutral-400 py-6 text-center">
                Nenhum chamado aberto ainda.
              </p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {dados.recentes.map((chamado) => (
                  <Link
                    key={chamado.id}
                    to={`/chamados/${chamado.id}`}
                    className="flex items-center gap-4 py-3 hover:bg-neutral-50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <span className="font-mono text-xs text-neutral-400 w-14 shrink-0">
                      #{String(chamado.numero).padStart(4, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-800 truncate">
                        {chamado.titulo}
                      </p>
                      <p className="text-xs text-neutral-400 truncate">
                        {chamado.local} · {chamado.solicitante}
                      </p>
                    </div>
                    <Badge tipo="prioridade" valor={chamado.prioridade} />
                    <Badge tipo="status" valor={chamado.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
