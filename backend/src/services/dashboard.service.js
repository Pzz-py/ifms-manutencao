const chamadoRepository = require("../repositories/chamado.repository");
const historicoRepository = require("../repositories/historico.repository");
const localRepository = require("../repositories/local.repository");
const {
  STATUS_CHAMADO,
  CATEGORIAS,
  PRIORIDADES,
} = require("../utils/constants");

/**
 * Transforma o resultado de um groupBy do Prisma (que só traz as
 * combinações que existem no banco) em um objeto com todas as chaves
 * do "enum" de aplicação, preenchendo com 0 as que não têm nenhum
 * chamado ainda. Isso evita que o gráfico no frontend "pule" uma
 * categoria só porque ainda não há registros dela.
 */
function completarContagem(enumObjeto, resultadoGroupBy, campo) {
  const contagem = Object.fromEntries(
    Object.values(enumObjeto).map((chave) => [chave, 0])
  );

  for (const item of resultadoGroupBy) {
    contagem[item[campo]] = item._count;
  }

  return contagem;
}

const dashboardService = {
  async obterResumo() {
    const [
      total,
      porStatusBruto,
      porCategoriaBruto,
      porPrioridadeBruto,
      porLocalBruto,
      urgentesAbertos,
      recentes,
      atividades,
      locais,
    ] = await Promise.all([
      chamadoRepository.contarTotal(),
      chamadoRepository.contarPorCampo("status"),
      chamadoRepository.contarPorCampo("categoria"),
      chamadoRepository.contarPorCampo("prioridade"),
      chamadoRepository.contarPorCampo("localId"),
      chamadoRepository.contarComFiltro({
        prioridade: PRIORIDADES.URGENTE,
        status: { not: STATUS_CHAMADO.CONCLUIDO },
      }),
      chamadoRepository.listarRecentes(5),
      historicoRepository.listarRecentes(8),
      localRepository.listarTodos(),
    ]);

    const porStatus = completarContagem(STATUS_CHAMADO, porStatusBruto, "status");
    const porCategoria = completarContagem(CATEGORIAS, porCategoriaBruto, "categoria");
    const porPrioridade = completarContagem(PRIORIDADES, porPrioridadeBruto, "prioridade");

    // "Por local" não é um enum fixo (locais são cadastrados livremente),
    // então vira uma lista ordenada da maior para a menor quantidade,
    // em vez do formato de objeto usado pelos outros gráficos.
    const nomePorLocalId = Object.fromEntries(locais.map((l) => [l.id, l.nome]));
    const porLocal = porLocalBruto
      .map((item) => ({
        local: nomePorLocalId[item.localId] || "Local removido",
        quantidade: item._count,
      }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 8);

    const concluidos = porStatus[STATUS_CHAMADO.CONCLUIDO];
    const abertos = total - concluidos;

    return {
      indicadores: {
        total,
        abertos,
        concluidos,
        urgentesAbertos,
      },
      porStatus,
      porCategoria,
      porPrioridade,
      porLocal,
      recentes: recentes.map((chamado) => ({
        id: chamado.id,
        numero: chamado.numero,
        titulo: chamado.titulo,
        status: chamado.status,
        prioridade: chamado.prioridade,
        categoria: chamado.categoria,
        local: chamado.local.nome,
        solicitante: chamado.solicitante?.nome || chamado.solicitanteNome || "Solicitante anônimo",
        responsavel: chamado.responsavel?.nome || null,
        createdAt: chamado.createdAt,
      })),
      atividades: atividades.map((evento) => ({
        id: evento.id,
        tipo: evento.tipo,
        descricao: evento.descricao,
        autor: evento.autor?.nome || "Solicitante",
        chamadoNumero: evento.chamado.numero,
        chamadoTitulo: evento.chamado.titulo,
        chamadoId: evento.chamado.id,
        createdAt: evento.createdAt,
      })),
    };
  },
};

module.exports = dashboardService;
