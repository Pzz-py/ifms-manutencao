require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 3333;

const { categoriaChamadoService } = require("./services/categoria.service");

// Cria as categorias iniciais apenas se as tabelas estiverem vazias.
// Não apaga nem altera nada existente.
categoriaChamadoService
  .garantirPadroes()
  .then((criou) => {
    if (criou) console.log("✔ Categorias de chamado iniciais criadas.");
  })
  .catch((err) =>
    console.error(
      "⚠ Não foi possível preparar as categorias. Rode `npx prisma db push` (ou migrate) para criar as novas tabelas.\n",
      err.message
    )
  );

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 API rodando na porta ${PORT}`);
  console.log(`   Health check: /api/health\n`);
});
