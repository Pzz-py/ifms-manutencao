const prisma = require("../config/database");
const { ROLES } = require("../utils/constants");

/**
 * Repositório de usuários.
 * Concentra todo o acesso via Prisma para o model Usuario, para que
 * services nunca importem o Prisma diretamente — isso facilita trocar
 * a fonte de dados no futuro sem tocar em regra de negócio.
 */
const usuarioRepository = {
  async buscarPorEmail(email) {
    return prisma.usuario.findUnique({ where: { email } });
  },

  async buscarPorId(id) {
    return prisma.usuario.findUnique({ where: { id } });
  },

  async listarAdministradores() {
    return prisma.usuario.findMany({
      where: { role: ROLES.ADMINISTRADOR, ativo: true },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    });
  },

  async atualizar(id, dados) {
    return prisma.usuario.update({ where: { id }, data: dados });
  },
};

module.exports = usuarioRepository;
