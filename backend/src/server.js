require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 3333;

const {
  categoriaChamadoService,
  categoriaMaterialService,
} = require("./services/categoria.service");

// Cria as categorias iniciais apenas se as tabelas estiverem vazias.
// Não apaga nem altera nada existente.
Promise.all([categoriaChamadoService.garantirPadroes(), categoriaMaterialService.garantirPadroes()])
  .then(([c, m]) => {
    if (c) console.log("✔ Categorias de chamado iniciais criadas.");
    if (m) console.log("✔ Categorias de material iniciais criadas.");
  })
  .catch((err) =>
    console.error(
      "⚠ Não foi possível preparar as categorias. Rode `npx prisma db push` (ou migrate) para criar as novas tabelas.\n",
      err.message
    )
  );

app.listen(PORT, () => {
  console.log(`\n🚀 API rodando em http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
