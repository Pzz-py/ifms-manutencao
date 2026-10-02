-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USUARIO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "avatarUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "locais" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "bloco" TEXT,
    "descricao" TEXT,
    "codigo" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "chamados" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "prioridade" TEXT NOT NULL DEFAULT 'MEDIA',
    "status" TEXT NOT NULL DEFAULT 'NOVO',
    "localId" TEXT NOT NULL,
    "solicitanteId" TEXT,
    "solicitanteNome" TEXT,
    "solicitanteContato" TEXT,
    "ipAbertura" TEXT,
    "responsavelId" TEXT,
    "dataConclusao" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "chamados_localId_fkey" FOREIGN KEY ("localId") REFERENCES "locais" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "chamados_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "chamados_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "observacoes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "texto" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chamadoId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    CONSTRAINT "observacoes_chamadoId_fkey" FOREIGN KEY ("chamadoId") REFERENCES "chamados" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "observacoes_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "historico_chamados" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valorAnterior" TEXT,
    "valorNovo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chamadoId" TEXT NOT NULL,
    "autorId" TEXT,
    CONSTRAINT "historico_chamados_chamadoId_fkey" FOREIGN KEY ("chamadoId") REFERENCES "chamados" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "historico_chamados_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "anexos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomeArquivo" TEXT NOT NULL,
    "caminho" TEXT NOT NULL,
    "tipoArquivo" TEXT NOT NULL,
    "tamanhoBytes" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chamadoId" TEXT NOT NULL,
    "enviadoPorId" TEXT,
    CONSTRAINT "anexos_chamadoId_fkey" FOREIGN KEY ("chamadoId") REFERENCES "chamados" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "anexos_enviadoPorId_fkey" FOREIGN KEY ("enviadoPorId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "destinatarioId" TEXT NOT NULL,
    "chamadoId" TEXT,
    CONSTRAINT "notificacoes_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "notificacoes_chamadoId_fkey" FOREIGN KEY ("chamadoId") REFERENCES "chamados" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "materiais" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "observacao" TEXT,
    "necessario" BOOLEAN NOT NULL DEFAULT true,
    "utilizado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chamadoId" TEXT NOT NULL,
    "catalogoId" TEXT,
    CONSTRAINT "materiais_chamadoId_fkey" FOREIGN KEY ("chamadoId") REFERENCES "chamados" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "materiais_catalogoId_fkey" FOREIGN KEY ("catalogoId") REFERENCES "materiais_catalogo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "categorias_chamado" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "materiais_catalogo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "unidade" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "locais_nome_key" ON "locais"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "locais_codigo_key" ON "locais"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "chamados_numero_key" ON "chamados"("numero");

-- CreateIndex
CREATE INDEX "chamados_status_idx" ON "chamados"("status");

-- CreateIndex
CREATE INDEX "chamados_prioridade_idx" ON "chamados"("prioridade");

-- CreateIndex
CREATE INDEX "chamados_categoria_idx" ON "chamados"("categoria");

-- CreateIndex
CREATE INDEX "chamados_solicitanteId_idx" ON "chamados"("solicitanteId");

-- CreateIndex
CREATE INDEX "chamados_responsavelId_idx" ON "chamados"("responsavelId");

-- CreateIndex
CREATE INDEX "observacoes_chamadoId_idx" ON "observacoes"("chamadoId");

-- CreateIndex
CREATE INDEX "historico_chamados_chamadoId_idx" ON "historico_chamados"("chamadoId");

-- CreateIndex
CREATE INDEX "anexos_chamadoId_idx" ON "anexos"("chamadoId");

-- CreateIndex
CREATE INDEX "notificacoes_destinatarioId_idx" ON "notificacoes"("destinatarioId");

-- CreateIndex
CREATE INDEX "notificacoes_lida_idx" ON "notificacoes"("lida");

-- CreateIndex
CREATE INDEX "materiais_chamadoId_idx" ON "materiais"("chamadoId");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_chamado_nome_key" ON "categorias_chamado"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_chamado_codigo_key" ON "categorias_chamado"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "materiais_catalogo_nome_key" ON "materiais_catalogo"("nome");
