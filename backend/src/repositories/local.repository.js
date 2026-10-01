const prisma = require("../config/database");

const localRepository = {
  async listarAtivos() {
    return prisma.local.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    });
  },

  async listarTodos() {
    return prisma.local.findMany({
      orderBy: { nome: "asc" },
    });
  },

  async buscarPorId(id) {
    return prisma.local.findUnique({ where: { id } });
  },

  async buscarPorCodigo(codigo) {
    return prisma.local.findUnique({ where: { codigo } });
  },

  async buscarPorNome(nome) {
    return prisma.local.findUnique({ where: { nome } });
  },

  async criar(dados) {
    return prisma.local.create({ data: dados });
  },
};

module.exports = localRepository;
