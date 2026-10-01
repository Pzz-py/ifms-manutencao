const express = require("express");
const cors = require("cors");
const path = require("path");

const routes = require("./routes");
const { errorHandler } = require("./middlewares/errorHandler");
const { notFound } = require("./middlewares/notFound");

const app = express();

// ---- Middlewares globais ----
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve os arquivos de anexo enviados (imagens dos chamados) de forma estática.
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", process.env.UPLOADS_DIR || "uploads"))
);

// ---- Rotas ----
app.use("/api", routes);

// ---- Tratamento de erros ----
app.use(notFound);
app.use(errorHandler);

module.exports = app;
