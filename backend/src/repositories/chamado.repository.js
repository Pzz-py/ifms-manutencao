const prisma = require("../config/database");

/**
 * Repositório de chamados.
 *
 * Concentra todo o acesso via Prisma para o model Chamado — services
 * nunca importam o Prisma diretamente, o que facilita trocar a fonte
 * de dados no futuro sem tocar em regra de negócio.
 */
const chamadoRepository = {
  async contarTotal() {
    return prisma.chamado.count();
  },

  async contarPorCampo(campo) {
    // Ex: campo = "status" -> [{ status: "NOVO", _count: 3 }, ...]
    return prisma.chamado.groupBy({
      by: [campo],
      _count: true,
    });
  },

  async contarComFiltro(where) {
    return prisma.chamado.count({ where });
  },

  async listarRecentes(quantidade = 5) {
    return prisma.chamado.findMany({
      orderBy: { createdAt: "desc" },
      take: quantidade,
      include: {
        local: { select: { nome: true } },
        solicitante: { select: { nome: true } },
        responsavel: { select: { nome: true } },
      },
    });
  },

  async obterMaiorNumero() {
    const resultado = await prisma.chamado.aggregate({ _max: { numero: true } });
    return resultado._max.numero || 0;
  },

  async criar(dados) {
    return prisma.chamado.create({
      data: dados,
      include: {
        local: { select: { nome: true } },
        solicitante: { select: { nome: true } },
        responsavel: { select: { nome: true } },
        anexos: true,
      },
    });
  },

  async listar({ where, orderBy, skip, take }) {
    const [itens, total] = await Promise.all([
      prisma.chamado.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          local: { select: { nome: true } },
          solicitante: { select: { nome: true } },
          responsavel: { select: { nome: true } },
        },
      }),
      prisma.chamado.count({ where }),
    ]);

    return { itens, total };
  },

  async buscarPorId(id) {
    return prisma.chamado.findUnique({
      where: { id },
      include: {
        local: true,
        solicitante: { select: { id: true, nome: true, email: true } },
        responsavel: { select: { id: true, nome: true, email: true } },
        anexos: true,
        materiais: { orderBy: { createdAt: "asc" } },
        observacoes: {
          orderBy: { createdAt: "asc" },
          include: { autor: { select: { nome: true } } },
        },
        historico: {
          orderBy: { createdAt: "asc" },
          include: { autor: { select: { nome: true } } },
        },
      },
    });
  },

  async atualizar(id, dados) {
    return prisma.chamado.update({ where: { id }, data: dados });
  },
};

module.exports = chamadoRepository;
