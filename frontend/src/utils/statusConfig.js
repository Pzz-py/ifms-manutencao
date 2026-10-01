/**
 * Configuração visual dos status do chamado.
 *
 * Fluxo simplificado: NOVO -> EM_ANDAMENTO -> AGUARDANDO_PECAS -> CONCLUIDO.
 *
 * `badgeClass` usa classes Tailwind completas (não geradas dinamicamente)
 * para que o Tailwind consiga detectá-las durante o build.
 * `color` é o mesmo tom em hexadecimal, usado nos gráficos (Recharts),
 * que não conseguem interpretar classes CSS — precisam de uma cor real.
 *
 * As chaves são os valores literais gravados no banco (ver
 * backend/src/utils/constants.js -> STATUS_CHAMADO), então qualquer
 * chamada à API pode usar `STATUS_CONFIG[chamado.status]` diretamente.
 */
export const STATUS_CONFIG = {
  NOVO: {
    label: "Novo",
    color: "#3A7EAF",
    badgeClass: "bg-status-novo/10 text-status-novo",
    dotClass: "bg-status-novo",
  },
  EM_ANDAMENTO: {
    label: "Em andamento",
    color: "#F59E0B",
    badgeClass: "bg-status-emAndamento/10 text-status-emAndamento",
    dotClass: "bg-status-emAndamento",
  },
  AGUARDANDO_PECAS: {
    label: "Aguardando peças",
    color: "#F97316",
    badgeClass: "bg-status-aguardandoPecas/10 text-status-aguardandoPecas",
    dotClass: "bg-status-aguardandoPecas",
  },
  CONCLUIDO: {
    label: "Concluído",
    color: "#248C57",
    badgeClass: "bg-status-concluido/10 text-status-concluido",
    dotClass: "bg-status-concluido",
  },
};

// Ordem em que os status devem aparecer em gráficos e legendas,
// seguindo o fluxo natural do atendimento.
export const ORDEM_STATUS = ["NOVO", "EM_ANDAMENTO", "AGUARDANDO_PECAS", "CONCLUIDO"];

// Status pré-selecionado ao abrir a tela de Chamados pela primeira vez.
export const STATUS_CHAMADO_PADRAO_LISTA = "NOVO";
