const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const {
  ROLES,
  CATEGORIAS,
  PRIORIDADES,
  STATUS_CHAMADO,
  TIPOS_EVENTO,
} = require("../src/utils/constants");
const { gerarCodigoBase } = require("../src/utils/codigo");

const prisma = new PrismaClient();

const LOCAIS = [
  { nome: "Biblioteca", bloco: "Bloco A" },
  { nome: "Laboratório 01", bloco: "Bloco B" },
  { nome: "Laboratório 02", bloco: "Bloco B" },
  { nome: "Sala A101", bloco: "Bloco A" },
  { nome: "Sala A102", bloco: "Bloco A" },
  { nome: "Coordenação", bloco: "Bloco C" },
  { nome: "Direção", bloco: "Bloco C" },
  { nome: "Banheiros", bloco: "Bloco A" },
  { nome: "Corredores", bloco: "Bloco A" },
  { nome: "Quadra", bloco: "Área externa" },
  { nome: "Auditório", bloco: "Bloco C" },
];

/** Retorna uma data `dias` atrás de agora, com um pequeno deslocamento em horas. */
function diasAtras(dias, horas = 0) {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  data.setHours(data.getHours() - horas);
  return data;
}

// Chamados de exemplo cobrindo todas as categorias, prioridades e os 4
// status do fluxo atual, para o Dashboard ter dados reais para exibir.
// Alguns são abertos por um usuário logado (solicitante: "usuario") e
// outros de forma anônima (solicitante: "anonimo"), para demonstrar os
// dois fluxos de abertura de chamado lado a lado.
const CHAMADOS_EXEMPLO = [
  {
    titulo: "Lâmpadas queimadas no Laboratório 01",
    descricao: "Três lâmpadas queimadas deixando o laboratório escuro no período noturno.",
    categoria: CATEGORIAS.ELETRICA,
    prioridade: PRIORIDADES.ALTA,
    status: STATUS_CHAMADO.EM_ANDAMENTO,
    local: "Laboratório 01",
    diasAtras: 1,
    responsavel: true,
    solicitante: "usuario",
    materiais: [
      { nome: "Lâmpada LED 9W", quantidade: 3, necessario: true, utilizado: false },
    ],
  },
  {
    titulo: "Vazamento na torneira do banheiro masculino",
    descricao: "Torneira pingando continuamente, gerando desperdício de água.",
    categoria: CATEGORIAS.HIDRAULICA,
    prioridade: PRIORIDADES.MEDIA,
    status: STATUS_CHAMADO.NOVO,
    local: "Banheiros",
    diasAtras: 2,
    responsavel: false,
    solicitante: "anonimo",
  },
  {
    titulo: "Computador não liga no Laboratório 02",
    descricao: "Computador da bancada 4 não liga, possivelmente fonte queimada.",
    categoria: CATEGORIAS.INFORMATICA,
    prioridade: PRIORIDADES.ALTA,
    status: STATUS_CHAMADO.AGUARDANDO_PECAS,
    local: "Laboratório 02",
    diasAtras: 5,
    responsavel: true,
    solicitante: "usuario",
    materiais: [
      { nome: "Fonte ATX 500W", quantidade: 1, necessario: true, utilizado: false, observacao: "Aguardando cotação" },
    ],
  },
  {
    titulo: "Cadeira quebrada na Sala A101",
    descricao: "Cadeira com o encosto solto, risco de queda para os alunos.",
    categoria: CATEGORIAS.MOBILIARIO,
    prioridade: PRIORIDADES.BAIXA,
    status: STATUS_CHAMADO.NOVO,
    local: "Sala A101",
    diasAtras: 0,
    responsavel: false,
    solicitante: "anonimo",
  },
  {
    titulo: "Ar-condicionado — Ambiente: Coordenação",
    descricao: "Ar-condicionado ligando normalmente, mas sem resfriar o ambiente.",
    categoria: CATEGORIAS.AR_CONDICIONADO,
    prioridade: PRIORIDADES.MEDIA,
    status: STATUS_CHAMADO.EM_ANDAMENTO,
    local: "Coordenação",
    diasAtras: 3,
    responsavel: true,
    solicitante: "usuario",
  },
  {
    titulo: "Rachadura na parede do Auditório",
    descricao: "Rachadura aparente próxima ao palco, necessita avaliação estrutural.",
    categoria: CATEGORIAS.ESTRUTURA,
    prioridade: PRIORIDADES.URGENTE,
    status: STATUS_CHAMADO.EM_ANDAMENTO,
    local: "Auditório",
    diasAtras: 1,
    responsavel: true,
    solicitante: "anonimo",
  },
  {
    titulo: "Pintura — Ambiente: Corredores",
    descricao: "Parede do corredor com pintura descascando em grande área.",
    categoria: CATEGORIAS.PINTURA,
    prioridade: PRIORIDADES.BAIXA,
    status: STATUS_CHAMADO.CONCLUIDO,
    local: "Corredores",
    diasAtras: 20,
    responsavel: true,
    solicitante: "usuario",
    materiais: [
      { nome: "Tinta látex branca 18L", quantidade: 1, necessario: true, utilizado: true },
      { nome: "Rolo de pintura", quantidade: 2, necessario: true, utilizado: true },
    ],
  },
  {
    titulo: "Acúmulo de lixo na quadra poliesportiva",
    descricao: "Lixeiras da quadra cheias há dias sem recolhimento.",
    categoria: CATEGORIAS.LIMPEZA,
    prioridade: PRIORIDADES.MEDIA,
    status: STATUS_CHAMADO.CONCLUIDO,
    local: "Quadra",
    diasAtras: 6,
    responsavel: true,
    solicitante: "anonimo",
  },
  {
    titulo: "Projetor com imagem distorcida na Sala A102",
    descricao: "Projetor apresentando imagem distorcida e com manchas coloridas.",
    categoria: CATEGORIAS.INFORMATICA,
    prioridade: PRIORIDADES.MEDIA,
    status: STATUS_CHAMADO.CONCLUIDO,
    local: "Sala A102",
    diasAtras: 9,
    responsavel: true,
    solicitante: "usuario",
  },
  {
    titulo: "Tomada solta na Biblioteca",
    descricao: "Tomada próxima ao balcão de atendimento está solta da parede.",
    categoria: CATEGORIAS.ELETRICA,
    prioridade: PRIORIDADES.URGENTE,
    status: STATUS_CHAMADO.NOVO,
    local: "Biblioteca",
    diasAtras: 0,
    responsavel: false,
    solicitante: "anonimo",
  },
  {
    titulo: "Porta emperrada na Direção",
    descricao: "Porta de entrada da sala da Direção está emperrando ao fechar.",
    categoria: CATEGORIAS.ESTRUTURA,
    prioridade: PRIORIDADES.BAIXA,
    status: STATUS_CHAMADO.NOVO,
    local: "Direção",
    diasAtras: 4,
    responsavel: false,
    solicitante: "usuario",
  },
  {
    titulo: "Vaso sanitário entupido no banheiro feminino",
    descricao: "Vaso sanitário entupido, indisponível para uso.",
    categoria: CATEGORIAS.HIDRAULICA,
    prioridade: PRIORIDADES.URGENTE,
    status: STATUS_CHAMADO.EM_ANDAMENTO,
    local: "Banheiros",
    diasAtras: 1,
    responsavel: true,
    solicitante: "anonimo",
  },
  {
    titulo: "Mesa danificada no Laboratório 01",
    descricao: "Tampo da mesa da bancada 2 está solto e balançando.",
    categoria: CATEGORIAS.MOBILIARIO,
    prioridade: PRIORIDADES.BAIXA,
    status: STATUS_CHAMADO.CONCLUIDO,
    local: "Laboratório 01",
    diasAtras: 12,
    responsavel: true,
    solicitante: "usuario",
  },
  {
    titulo: "Ar-condicionado — Ambiente: Sala A101",
    descricao: "Ar-condicionado fazendo ruído alto ao ligar, incomodando a aula.",
    categoria: CATEGORIAS.AR_CONDICIONADO,
    prioridade: PRIORIDADES.MEDIA,
    status: STATUS_CHAMADO.NOVO,
    local: "Sala A101",
    diasAtras: 2,
    responsavel: false,
    solicitante: "anonimo",
  },
];

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // ---- Locais ----
  for (const { nome, bloco } of LOCAIS) {
    await prisma.local.upsert({
      where: { nome },
      update: {},
      create: { nome, bloco, codigo: gerarCodigoBase(nome) },
    });
  }
  console.log(`✔ ${LOCAIS.length} locais cadastrados.`);

  // ---- Usuários de teste ----
  const senhaAdminHash = await bcrypt.hash("admin123", 10);
  const senhaUsuarioHash = await bcrypt.hash("usuario123", 10);

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@ifms.edu.br" },
    update: {},
    create: {
      nome: "Administrador da Manutenção",
      email: "admin@ifms.edu.br",
      senhaHash: senhaAdminHash,
      role: ROLES.ADMINISTRADOR,
    },
  });

  const usuario = await prisma.usuario.upsert({
    where: { email: "aluno@ifms.edu.br" },
    update: {},
    create: {
      nome: "Aluno Exemplo",
      email: "aluno@ifms.edu.br",
      senhaHash: senhaUsuarioHash,
      role: ROLES.USUARIO,
    },
  });

  console.log("✔ Usuários de teste criados:");
  console.log(`   Admin   -> email: ${admin.email}   | senha: admin123`);
  console.log(`   Usuário -> email: ${usuario.email} | senha: usuario123`);

  // ---- Chamados de exemplo (para o Dashboard ter dados reais) ----
  // Recriados a cada execução do seed, para manter os dados de exemplo
  // consistentes durante o desenvolvimento.
  await prisma.material.deleteMany({});
  await prisma.historicoChamado.deleteMany({});
  await prisma.observacao.deleteMany({});
  await prisma.chamado.deleteMany({});

  let numero = 1;
  for (const item of CHAMADOS_EXEMPLO) {
    const local = await prisma.local.findUnique({ where: { nome: item.local } });
    const criadoEm = diasAtras(item.diasAtras);
    const ehAnonimo = item.solicitante === "anonimo";

    const chamado = await prisma.chamado.create({
      data: {
        numero: numero++,
        titulo: item.titulo,
        descricao: item.descricao,
        categoria: item.categoria,
        prioridade: item.prioridade,
        status: item.status,
        localId: local.id,
        solicitanteId: ehAnonimo ? null : usuario.id,
        solicitanteNome: ehAnonimo ? "Comunicante do QR Code" : null,
        solicitanteContato: ehAnonimo ? null : null,
        ipAbertura: ehAnonimo ? "127.0.0.1" : null,
        responsavelId: item.responsavel ? admin.id : null,
        createdAt: criadoEm,
        updatedAt: criadoEm,
        dataConclusao: item.status === STATUS_CHAMADO.CONCLUIDO ? diasAtras(Math.max(item.diasAtras - 1, 0)) : null,
      },
    });

    // Evento de abertura — todo chamado tem um. Quando anônimo, não há
    // Usuario autor (autorId fica nulo, ver schema.prisma).
    await prisma.historicoChamado.create({
      data: {
        chamadoId: chamado.id,
        autorId: ehAnonimo ? null : usuario.id,
        tipo: TIPOS_EVENTO.ABERTURA,
        descricao: ehAnonimo ? "Chamado aberto sem login (QR Code)." : `Chamado aberto por ${usuario.nome}.`,
        createdAt: criadoEm,
      },
    });

    // Chamados que já saíram do status "NOVO" ganham um evento adicional
    // de mudança de status, para o feed de atividades recentes ter variedade.
    if (item.status !== STATUS_CHAMADO.NOVO) {
      await prisma.historicoChamado.create({
        data: {
          chamadoId: chamado.id,
          autorId: admin.id,
          tipo: TIPOS_EVENTO.MUDANCA_STATUS,
          descricao: `Status alterado para "${item.status}".`,
          valorAnterior: STATUS_CHAMADO.NOVO,
          valorNovo: item.status,
          createdAt: diasAtras(item.diasAtras, -2), // 2h "depois" da abertura
        },
      });
    }

    // Materiais de exemplo (quando o item define).
    for (const material of item.materiais || []) {
      await prisma.material.create({
        data: {
          chamadoId: chamado.id,
          nome: material.nome,
          quantidade: material.quantidade,
          observacao: material.observacao || null,
          necessario: material.necessario,
          utilizado: material.utilizado,
          createdAt: diasAtras(item.diasAtras, -3),
        },
      });

      await prisma.historicoChamado.create({
        data: {
          chamadoId: chamado.id,
          autorId: admin.id,
          tipo: TIPOS_EVENTO.MATERIAL_REGISTRADO,
          descricao: `Material registrado: ${material.nome} (qtd. ${material.quantidade}).`,
          createdAt: diasAtras(item.diasAtras, -3),
        },
      });
    }
  }
  console.log(`✔ ${CHAMADOS_EXEMPLO.length} chamados de exemplo criados.`);

  console.log("\n🌱 Seed finalizado com sucesso.");
}

main()
  .catch((err) => {
    console.error("Erro ao rodar o seed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
