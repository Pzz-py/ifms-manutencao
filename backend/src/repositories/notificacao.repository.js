const prisma = require("../config/database");

const notificacaoRepository = {
  async criar(dados) {
    return prisma.notificacao.create({ data: dados });
  },

  async listarPorUsuario(usuarioId, { apenasNaoLidas = false, take = 20 } = {}) {
    return prisma.notificacao.findMany({
      where: {
        destinatarioId: usuarioId,
        ...(apenasNaoLidas ? { lida: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take,
      include: {
        chamado: { select: { id: true, numero: true } },
      },
    });
  },

  async contarNaoLidas(usuarioId) {
    return prisma.notificacao.count({
      where: { destinatarioId: usuarioId, lida: false },
    });
  },

  async buscarPorId(id) {
    return prisma.notificacao.findUnique({ where: { id } });
  },

  async marcarComoLida(id) {
    return prisma.notificacao.update({ where: { id }, data: { lida: true } });
  },

  async marcarTodasComoLidas(usuarioId) {
    return prisma.notificacao.updateMany({
      where: { destinatarioId: usuarioId, lida: false },
      data: { lida: true },
    });
  },
};

module.exports = notificacaoRepository;
