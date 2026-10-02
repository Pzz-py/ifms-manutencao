import {
  PlusCircle,
  RefreshCcw,
  ArrowUpDown,
  UserCog,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  PackageSearch,
} from "lucide-react";

export const EVENTO_CONFIG = {
  ABERTURA: { icon: PlusCircle, color: "text-accent-600 bg-accent-50" },
  MUDANCA_STATUS: { icon: RefreshCcw, color: "text-primary-600 bg-primary-50" },
  MUDANCA_PRIORIDADE: { icon: ArrowUpDown, color: "text-priority-alta bg-priority-alta/10" },
  MUDANCA_RESPONSAVEL: { icon: UserCog, color: "text-neutral-600 bg-neutral-100" },
  OBSERVACAO: { icon: MessageSquare, color: "text-accent-600 bg-accent-50" },
  ANEXO_ADICIONADO: { icon: Paperclip, color: "text-neutral-600 bg-neutral-100" },
  MATERIAL_REGISTRADO: { icon: PackageSearch, color: "text-status-aguardandoPecas bg-status-aguardandoPecas/10" },
  CONCLUSAO: { icon: CheckCircle2, color: "text-status-concluido bg-status-concluido/10" },
};
