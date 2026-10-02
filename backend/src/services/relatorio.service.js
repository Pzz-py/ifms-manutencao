const prisma = require("../config/database");
const {
  STATUS_CHAMADO,
  CATEGORIAS,
  PRIORIDADES,
} = require("../utils/constants");

/**
 * Relatório consolidado da manutenção, para a administração/gestão.
 *
 * Diferente do relatório individual (tela de detalhes de um chamado),
 * este agrega TODOS os chamados de um período e responde às perguntas
 * de gestão: que tipo de problema mais aparece, onde acontece, quanto
 * material foi gasto e quanto tempo levamos para resolver.
 */

function montarFiltroPeriodo(dataInicio, dataFim) {
  const where = {};
  if (dataInicio || dataFim) {
    where.createdAt = {};
    if (dataInicio) where.createdAt.gte = new Date(`${dataInicio}T00:00:00`);
    if (dataFim) where.createdAt.lte = new Date(`${dataFim}T23:59:59`);
  }
  return where;
}

function completarContagem(enumObjeto, resultadoGroupBy, campo) {
  const contagem = Object.fromEntries(Object.values(enumObjeto).map((c) => [c, 0]));
  for (const item of resultadoGroupBy) {
    contagem[item[campo]] = item._count;
  }
  return contagem;
}

const relatorioService = {
  async consolidado({ dataInicio, dataFim }) {
    const where = montarFiltroPeriodo(dataInicio, dataFim);

    const [chamados, locais] = await Promise.all([
      prisma.chamado.findMany({
        where,
        include: {
          local: { select: { id: true, nome: true, bloco: true } },
          materiais: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.local.findMany({ select: { id: true, nome: true } }),
    ]);

    // ---- Distribuições ----
    const contarPor = (campo) => {
      const mapa = {};
      for (const c of chamados) {
        mapa[c[campo]] = (mapa[c[campo]] || 0) + 1;
      }
      return Object.entries(mapa).map(([chave, total]) => ({ [campo]: chave, _count: total }));
    };

    const porCategoria = completarContagem(CATEGORIAS, contarPor("categoria"), "categoria");
    const porStatus = completarContagem(STATUS_CHAMADO, contarPor("status"), "status");
    const porPrioridade = completarContagem(PRIORIDADES, contarPor("prioridade"), "prioridade");

    // ---- Por localização ----
    const contagemLocal = {};
    for (const c of chamados) {
      const chave = c.local.nome;
      if (!contagemLocal[chave]) {
        contagemLocal[chave] = { local: chave, bloco: c.local.bloco, quantidade: 0, concluidos: 0 };
      }
      contagemLocal[chave].quantidade += 1;
      if (c.status === STATUS_CHAMADO.CONCLUIDO) contagemLocal[chave].concluidos += 1;
    }
    const porLocal = Object.values(contagemLocal).sort((a, b) => b.quantidade - a.quantidade);

    // ---- Materiais gastos ----
    // Consolidamos por nome do material, somando as quantidades. Separamos
    // o que foi efetivamente utilizado do que só foi solicitado, porque
    // são informações de gestão diferentes (consumo real x previsão).
    const consolidadoMateriais = {};
    for (const c of chamados) {
      for (const m of c.materiais) {
        const chave = m.nome.trim().toLowerCase();
        if (!consolidadoMateriais[chave]) {
          consolidadoMateriais[chave] = {
            nome: m.nome.trim(),
            quantidadeSolicitada: 0,
            quantidadeUtilizada: 0,
            chamados: 0,
          };
        }
        consolidadoMateriais[chave].quantidadeSolicitada += m.quantidade;
        if (m.utilizado) consolidadoMateriais[chave].quantidadeUtilizada += m.quantidade;
        consolidadoMateriais[chave].chamados += 1;
      }
    }
    const materiais = Object.values(consolidadoMateriais).sort(
      (a, b) => b.quantidadeUtilizada - a.quantidadeUtilizada || b.quantidadeSolicitada - a.quantidadeSolicitada
    );

    // ---- Indicadores ----
    const total = chamados.length;
    const concluidos = chamados.filter((c) => c.status === STATUS_CHAMADO.CONCLUIDO).length;
    const abertos = total - concluidos;

    // Tempo médio de resolução (em dias), considerando só os concluídos
    // que têm data de conclusão registrada.
    const resolvidos = chamados.filter((c) => c.status === STATUS_CHAMADO.CONCLUIDO && c.dataConclusao);
    const tempoMedioDias = resolvidos.length
      ? Number(
          (
            resolvidos.reduce(
              (soma, c) => soma + (new Date(c.dataConclusao) - new Date(c.createdAt)),
              0
            ) /
            resolvidos.length /
            (1000 * 60 * 60 * 24)
          ).toFixed(1)
        )
      : null;

    const abertosSemLogin = chamados.filter((c) => !c.solicitanteId).length;

    return {
      periodo: {
        dataInicio: dataInicio || null,
        dataFim: dataFim || null,
      },
      indicadores: {
        total,
        abertos,
        concluidos,
        taxaConclusao: total ? Math.round((concluidos / total) * 100) : 0,
        tempoMedioDias,
        abertosSemLogin,
        totalLocaisCadastrados: locais.length,
        locaisComChamado: porLocal.length,
      },
      porCategoria,
      porStatus,
      porPrioridade,
      porLocal,
      materiais,
    };
  },
};

module.exports = relatorioService;
