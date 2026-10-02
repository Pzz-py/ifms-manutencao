const prisma = require("../config/database");

const historicoRepository = {
  async listarRecentes(quantidade = 8) {
    return prisma.historicoChamado.findMany({
      orderBy: { createdAt: "desc" },
      take: quantidade,
      include: {
        autor: { select: { nome: true } },
        chamado: { select: { id: true, numero: true, titulo: true } },
      },
    });
  },
};

module.exports = historicoRepository;
