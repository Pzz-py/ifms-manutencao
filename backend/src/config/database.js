const { PrismaClient } = require("@prisma/client");

/**
 * Instância única do Prisma Client.
 *
 * Centralizar aqui evita abrir múltiplas conexões com o banco
 * (comum quando cada arquivo faz "new PrismaClient()" separadamente)
 * e facilita trocar de banco no futuro (ex: SQLite -> PostgreSQL)
 * sem precisar alterar código de repositórios/serviços.
 */
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["warn", "error"]
      : ["error"],
});

module.exports = prisma;
