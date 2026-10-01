import { STATUS_CONFIG } from "../utils/statusConfig";
import { PRIORIDADE_CONFIG } from "../utils/prioridadeConfig";

const CONFIG_POR_TIPO = {
  status: STATUS_CONFIG,
  prioridade: PRIORIDADE_CONFIG,
};

/**
 * Badge de status ou prioridade.
 * Uso: <Badge tipo="status" valor={chamado.status} />
 */
export default function Badge({ tipo, valor, className = "" }) {
  const config = CONFIG_POR_TIPO[tipo]?.[valor];

  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${config.badgeClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}
