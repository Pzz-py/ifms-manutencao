import { RefreshCcw, UserCog, MessageSquare, CheckCircle2 } from "lucide-react";

export const NOTIFICACAO_CONFIG = {
  STATUS_ALTERADO: { icon: RefreshCcw, color: "text-primary-600 bg-primary-50" },
  CHAMADO_ATRIBUIDO: { icon: UserCog, color: "text-accent-600 bg-accent-50" },
  NOVA_OBSERVACAO: { icon: MessageSquare, color: "text-accent-600 bg-accent-50" },
  CHAMADO_CONCLUIDO: { icon: CheckCircle2, color: "text-status-concluido bg-status-concluido/10" },
};
