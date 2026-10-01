const prisma = require("../config/database");

const materialRepository = {
  async criar(dados) {
    return prisma.material.create({ data: dados });
  },

  async buscarPorId(id) {
    return prisma.material.findUnique({ where: { id } });
  },

  async atualizar(id, dados) {
    return prisma.material.update({ where: { id }, data: dados });
  },

  async remover(id) {
    return prisma.material.delete({ where: { id } });
  },
};

module.exports = materialRepository;
