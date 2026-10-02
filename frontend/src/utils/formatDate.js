/**
 * Formata uma data em texto relativo simples, em português.
 * Suficiente para o dashboard (não precisa de uma lib externa como date-fns
 * só para isso, o que manteria o bundle mais enxuto).
 */
export function formatarTempoRelativo(data) {
  const agora = new Date();
  const alvo = new Date(data);
  const diffMs = agora - alvo;
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "agora mesmo";
  if (diffMin < 60) return `há ${diffMin} min`;

  const diffHoras = Math.round(diffMin / 60);
  if (diffHoras < 24) return `há ${diffHoras}h`;

  const diffDias = Math.round(diffHoras / 24);
  if (diffDias === 1) return "ontem";
  if (diffDias < 30) return `há ${diffDias} dias`;

  return alvo.toLocaleDateString("pt-BR");
}

export function formatarDataCompleta(data) {
  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
