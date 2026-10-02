const chamadoRepository = require("../repositories/chamado.repository");
const localRepository = require("../repositories/local.repository");
const usuarioRepository = require("../repositories/usuario.repository");
const notificacaoRepository = require("../repositories/notificacao.repository");
const materialRepository = require("../repositories/material.repository");
const { categoriaChamadoRepository } = require("../repositories/categoria.repository");
const materialCatalogoRepository = require("../repositories/materialCatalogo.repository");
const prisma = require("../config/database");
const { AppError } = require("../middlewares/errorHandler");
const {
  ROLES,
  PRIORIDADES,
  STATUS_CHAMADO,
  TIPOS_EVENTO,
  TIPOS_NOTIFICACAO,
  ehValorValido,
} = require("../utils/constants");

const CAMPOS_ORDENACAO_PERMITIDOS = ["createdAt", "numero", "prioridade", "status"];
const TAMANHO_PAGINA_PADRAO = 10;
const TAMANHO_PAGINA_MAXIMO = 50;

function nomeSolicitante(chamado) {
  return chamado.solicitante?.nome || chamado.solicitanteNome || "Solicitante anônimo";
}

function serializarChamado(chamado) {
  return {
    id: chamado.id,
    numero: chamado.numero,
    titulo: chamado.titulo,
    descricao: chamado.descricao,
    categoria: chamado.categoria,
    prioridade: chamado.prioridade,
    status: chamado.status,
    local: chamado.local?.nome,
    solicitante: nomeSolicitante(chamado),
    responsavel: chamado.responsavel?.nome || null,
    temAnexo: (chamado.anexos?.length || 0) > 0,
    createdAt: chamado.createdAt,
    updatedAt: chamado.updatedAt,
  };
}

/**
 * Serialização completa, usada na tela de Detalhes/Relatório do chamado —
 * inclui anexos, observações, materiais e histórico (a listagem usa
 * `serializarChamado`, mais enxuta, para não pesar a resposta da tabela).
 */
function serializarChamadoDetalhado(chamado) {
  return {
    id: chamado.id,
    numero: chamado.numero,
    titulo: chamado.titulo,
    descricao: chamado.descricao,
    categoria: chamado.categoria,
    prioridade: chamado.prioridade,
    status: chamado.status,
    local: {
      id: chamado.local.id,
      nome: chamado.local.nome,
      bloco: chamado.local.bloco,
      descricao: chamado.local.descricao,
    },
    solicitante: chamado.solicitante || null,
    solicitanteNome: nomeSolicitante(chamado),
    solicitanteContato: chamado.solicitanteContato || null,
    responsavel: chamado.responsavel,
    anexos: chamado.anexos.map((anexo) => ({
      id: anexo.id,
      nomeArquivo: anexo.nomeArquivo,
      url: `/uploads/${anexo.caminho}`,
      tipoArquivo: anexo.tipoArquivo,
      createdAt: anexo.createdAt,
    })),
    materiais: chamado.materiais.map((material) => ({
      id: material.id,
      nome: material.nome,
      quantidade: material.quantidade,
      observacao: material.observacao,
      necessario: material.necessario,
      utilizado: material.utilizado,
      catalogoId: material.catalogoId || null,
      createdAt: material.createdAt,
    })),
    observacoes: chamado.observacoes.map((obs) => ({
      id: obs.id,
      texto: obs.texto,
      autor: obs.autor.nome,
      createdAt: obs.createdAt,
    })),
    historico: chamado.historico.map((evento) => ({
      id: evento.id,
      tipo: evento.tipo,
      descricao: evento.descricao,
      valorAnterior: evento.valorAnterior,
      valorNovo: evento.valorNovo,
      autor: evento.autor?.nome || "Solicitante",
      createdAt: evento.createdAt,
    })),
    dataConclusao: chamado.dataConclusao,
    createdAt: chamado.createdAt,
    updatedAt: chamado.updatedAt,
  };
}

/**
 * Monta um título automático quando quem abre o chamado não informa um
 * (é o caso do fluxo público/QR Code, que só pede categoria + descrição).
 */
function tituloAutomatico(nomeCategoria, nomeLocal) {
  return `${nomeCategoria || "Chamado"} — ${nomeLocal}`;
}

/**
 * Categorias agora vêm do banco (gestão pela administração). Novos
 * chamados só aceitam categorias ATIVAS; chamados antigos continuam
 * válidos mesmo se a categoria for desativada depois.
 */
async function buscarCategoriaAtiva(codigo) {
  const todas = await categoriaChamadoRepository.listar();
  const categoria = todas.find((c) => c.codigo === codigo && c.ativo);
  if (!categoria) throw new AppError("Categoria inválida ou desativada.", 400);
  return categoria;
}

const chamadoService = {
  /**
   * Abertura autenticada (usuário logado abrindo em nome da própria conta).
   */
  async criar({ titulo, descricao, categoria, prioridade, localId, arquivo }, solicitanteId) {
    if (!titulo?.trim() || !descricao?.trim()) {
      throw new AppError("Título e descrição são obrigatórios.", 400);
    }
    await buscarCategoriaAtiva(categoria);
    if (prioridade && !ehValorValido(PRIORIDADES, prioridade)) {
      throw new AppError("Prioridade inválida.", 400);
    }

    const local = await localRepository.buscarPorId(localId);
    if (!local) {
      throw new AppError("Local informado não existe.", 400);
    }

    const chamado = await this._criarRegistro({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      categoria,
      prioridade: prioridade || PRIORIDADES.MEDIA,
      localId,
      solicitanteId,
      arquivo,
    });

    return serializarChamado(chamado);
  },

  /**
   * Abertura pública, sem login (fluxo do QR Code). O usuário comum NÃO
   * define prioridade — ela nasce em PRIORIDADES.MEDIA e só a
   * administração pode alterá-la depois (via `atualizar`). Título é
   * gerado automaticamente a partir da categoria + local.
   */
  async criarPublico({ descricao, categoria, localCodigo, nome, contato, arquivo }, ip) {
    if (!descricao?.trim()) {
      throw new AppError("Descreva o problema encontrado.", 400);
    }
    const categoriaDb = await buscarCategoriaAtiva(categoria);

    const local = await localRepository.buscarPorCodigo(localCodigo);
    if (!local || !local.ativo) {
      throw new AppError("Local não encontrado. Verifique o QR Code utilizado.", 400);
    }

    const chamado = await this._criarRegistro({
      titulo: tituloAutomatico(categoriaDb.nome, local.nome),
      descricao: descricao.trim(),
      categoria,
      prioridade: PRIORIDADES.MEDIA,
      localId: local.id,
      solicitanteId: null,
      solicitanteNome: nome?.trim() || null,
      solicitanteContato: contato?.trim() || null,
      ipAbertura: ip || null,
      arquivo,
    });

    return serializarChamado(chamado);
  },

  /**
   * Núcleo compartilhado pelas duas formas de abertura (autenticada e
   * pública): gera o número sequencial, cria o registro, o evento de
   * abertura no histórico e o anexo (se houver).
   */
  async _criarRegistro({
    titulo,
    descricao,
    categoria,
    prioridade,
    localId,
    solicitanteId = null,
    solicitanteNome = null,
    solicitanteContato = null,
    ipAbertura = null,
    arquivo,
  }) {
    const maiorNumeroAtual = await chamadoRepository.obterMaiorNumero();

    const chamado = await chamadoRepository.criar({
      numero: maiorNumeroAtual + 1,
      titulo,
      descricao,
      categoria,
      prioridade,
      status: STATUS_CHAMADO.NOVO,
      localId,
      solicitanteId,
      solicitanteNome,
      solicitanteContato,
      ipAbertura,
    });

    await prisma.historicoChamado.create({
      data: {
        chamadoId: chamado.id,
        autorId: solicitanteId,
        tipo: TIPOS_EVENTO.ABERTURA,
        descricao: "Chamado aberto.",
      },
    });

    if (arquivo) {
      await prisma.anexo.create({
        data: {
          chamadoId: chamado.id,
          enviadoPorId: solicitanteId,
          nomeArquivo: arquivo.originalname,
          caminho: arquivo.filename,
          tipoArquivo: arquivo.mimetype,
          tamanhoBytes: arquivo.size,
        },
      });

      await prisma.historicoChamado.create({
        data: {
          chamadoId: chamado.id,
          autorId: solicitanteId,
          tipo: TIPOS_EVENTO.ANEXO_ADICIONADO,
          descricao: "Imagem anexada ao chamado.",
        },
      });
    }

    return chamadoRepository.buscarPorId(chamado.id);
  },

  async listar(filtros, usuarioLogado) {
    const {
      status,
      categoria,
      prioridade,
      localId,
      responsavelId,
      busca,
      page = 1,
      pageSize = TAMANHO_PAGINA_PADRAO,
      ordenarPor = "createdAt",
      ordem = "desc",
    } = filtros;

    const where = {};

    // Regra de perfil: usuário comum só vê os próprios chamados;
    // administrador vê todos.
    if (usuarioLogado.role !== ROLES.ADMINISTRADOR) {
      where.solicitanteId = usuarioLogado.id;
    }

    if (status && ehValorValido(STATUS_CHAMADO, status)) where.status = status;
    if (categoria) where.categoria = categoria;
    if (prioridade && ehValorValido(PRIORIDADES, prioridade)) where.prioridade = prioridade;
    if (localId) where.localId = localId;
    if (responsavelId) where.responsavelId = responsavelId;

    if (busca?.trim()) {
      where.OR = [
        { titulo: { contains: busca.trim() } },
        { descricao: { contains: busca.trim() } },
      ];
    }

    const campoOrdenacao = CAMPOS_ORDENACAO_PERMITIDOS.includes(ordenarPor)
      ? ordenarPor
      : "createdAt";
    const direcaoOrdenacao = ordem === "asc" ? "asc" : "desc";

    const tamanhoPagina = Math.min(Number(pageSize) || TAMANHO_PAGINA_PADRAO, TAMANHO_PAGINA_MAXIMO);
    const paginaAtual = Math.max(Number(page) || 1, 1);

    const { itens, total } = await chamadoRepository.listar({
      where,
      orderBy: { [campoOrdenacao]: direcaoOrdenacao },
      skip: (paginaAtual - 1) * tamanhoPagina,
      take: tamanhoPagina,
    });

    return {
      itens: itens.map(serializarChamado),
      paginacao: {
        paginaAtual,
        pageSize: tamanhoPagina,
        totalItens: total,
        totalPaginas: Math.max(Math.ceil(total / tamanhoPagina), 1),
      },
    };
  },

  async buscarPorId(id, usuarioLogado) {
    const chamado = await chamadoRepository.buscarPorId(id);
    if (!chamado) {
      throw new AppError("Chamado não encontrado.", 404);
    }

    // Regra de perfil: usuário comum só pode ver o próprio chamado
    // (chamados anônimos só ficam visíveis para a administração).
    if (usuarioLogado.role !== ROLES.ADMINISTRADOR && chamado.solicitanteId !== usuarioLogado.id) {
      throw new AppError("Você não tem permissão para ver este chamado.", 403);
    }

    return serializarChamadoDetalhado(chamado);
  },

  /**
   * Atualização parcial feita pelo administrador: aceita qualquer
   * combinação de status, prioridade e responsavelId. Cada mudança
   * gera um evento no histórico e, quando faz sentido, uma notificação
   * interna para a pessoa afetada (nunca para quem fez a própria ação,
   * e nunca para um chamado anônimo, que não tem usuário para notificar).
   */
  async atualizar(id, dados, adminId) {
    const chamado = await chamadoRepository.buscarPorId(id);
    if (!chamado) {
      throw new AppError("Chamado não encontrado.", 404);
    }

    const dataUpdate = {};
    const eventos = [];
    const notificacoes = [];

    if (dados.status !== undefined && dados.status !== chamado.status) {
      if (!ehValorValido(STATUS_CHAMADO, dados.status)) {
        throw new AppError("Status inválido.", 400);
      }

      dataUpdate.status = dados.status;
      dataUpdate.dataConclusao = dados.status === STATUS_CHAMADO.CONCLUIDO ? new Date() : null;

      eventos.push({
        tipo: TIPOS_EVENTO.MUDANCA_STATUS,
        descricao: "Status alterado.",
        valorAnterior: chamado.status,
        valorNovo: dados.status,
      });

      if (dados.status === STATUS_CHAMADO.CONCLUIDO) {
        eventos.push({ tipo: TIPOS_EVENTO.CONCLUSAO, descricao: "Chamado concluído." });
        if (chamado.solicitanteId) {
          notificacoes.push({
            destinatarioId: chamado.solicitanteId,
            tipo: TIPOS_NOTIFICACAO.CHAMADO_CONCLUIDO,
            titulo: "Chamado concluído",
            mensagem: `Seu chamado #${chamado.numero} foi concluído.`,
            chamadoId: chamado.id,
          });
        }
      } else if (chamado.solicitanteId) {
        notificacoes.push({
          destinatarioId: chamado.solicitanteId,
          tipo: TIPOS_NOTIFICACAO.STATUS_ALTERADO,
          titulo: "Status do chamado atualizado",
          mensagem: `O chamado #${chamado.numero} mudou de status.`,
          chamadoId: chamado.id,
        });
      }
    }

    if (dados.prioridade !== undefined && dados.prioridade !== chamado.prioridade) {
      if (!ehValorValido(PRIORIDADES, dados.prioridade)) {
        throw new AppError("Prioridade inválida.", 400);
      }

      dataUpdate.prioridade = dados.prioridade;
      eventos.push({
        tipo: TIPOS_EVENTO.MUDANCA_PRIORIDADE,
        descricao: "Prioridade definida pela administração.",
        valorAnterior: chamado.prioridade,
        valorNovo: dados.prioridade,
      });
    }

    if (dados.responsavelId !== undefined && dados.responsavelId !== chamado.responsavelId) {
      let novoResponsavel = null;

      if (dados.responsavelId) {
        novoResponsavel = await usuarioRepository.buscarPorId(dados.responsavelId);
        if (!novoResponsavel || novoResponsavel.role !== ROLES.ADMINISTRADOR) {
          throw new AppError("Responsável inválido.", 400);
        }
      }

      dataUpdate.responsavelId = dados.responsavelId || null;
      eventos.push({
        tipo: TIPOS_EVENTO.MUDANCA_RESPONSAVEL,
        descricao: "Responsável alterado.",
        valorAnterior: chamado.responsavel?.nome || "Ninguém",
        valorNovo: novoResponsavel?.nome || "Ninguém",
      });

      if (novoResponsavel) {
        notificacoes.push({
          destinatarioId: novoResponsavel.id,
          tipo: TIPOS_NOTIFICACAO.CHAMADO_ATRIBUIDO,
          titulo: "Chamado atribuído a você",
          mensagem: `O chamado #${chamado.numero} foi atribuído a você.`,
          chamadoId: chamado.id,
        });
      }
    }

    if (Object.keys(dataUpdate).length === 0) {
      throw new AppError("Nenhuma alteração foi informada.", 400);
    }

    await chamadoRepository.atualizar(id, dataUpdate);

    for (const evento of eventos) {
      await prisma.historicoChamado.create({
        data: { chamadoId: id, autorId: adminId, ...evento },
      });
    }

    // Nunca notifica a própria pessoa que fez a alteração.
    for (const notificacao of notificacoes) {
      if (notificacao.destinatarioId !== adminId) {
        await notificacaoRepository.criar(notificacao);
      }
    }

    const chamadoAtualizado = await chamadoRepository.buscarPorId(id);
    return serializarChamadoDetalhado(chamadoAtualizado);
  },

  async adicionarObservacao(id, texto, autorId) {
    if (!texto?.trim()) {
      throw new AppError("Escreva uma observação antes de enviar.", 400);
    }

    const chamado = await chamadoRepository.buscarPorId(id);
    if (!chamado) {
      throw new AppError("Chamado não encontrado.", 404);
    }

    await prisma.observacao.create({
      data: { chamadoId: id, autorId, texto: texto.trim() },
    });

    await prisma.historicoChamado.create({
      data: {
        chamadoId: id,
        autorId,
        tipo: TIPOS_EVENTO.OBSERVACAO,
        descricao: "Observação adicionada.",
      },
    });

    if (chamado.solicitanteId && chamado.solicitanteId !== autorId) {
      await notificacaoRepository.criar({
        destinatarioId: chamado.solicitanteId,
        tipo: TIPOS_NOTIFICACAO.NOVA_OBSERVACAO,
        titulo: "Nova observação no seu chamado",
        mensagem: `Uma nova observação foi adicionada ao chamado #${chamado.numero}.`,
        chamadoId: id,
      });
    }

    const chamadoAtualizado = await chamadoRepository.buscarPorId(id);
    return serializarChamadoDetalhado(chamadoAtualizado);
  },

  /**
   * Materiais necessários/utilizados na manutenção. Não é um sistema de
   * estoque — só um registro simples para o relatório final do chamado.
   */
  async adicionarMaterial(id, dados, autorId) {
    // Material escolhido do catálogo: o nome vem dele. Sem catálogo
    // (opção "outro"), usa o nome digitado.
    let nomeMaterial = dados.nome?.trim();
    let catalogoId = null;
    if (dados.catalogoId) {
      const item = await materialCatalogoRepository.buscarPorId(dados.catalogoId);
      if (!item) throw new AppError("Material do catálogo não encontrado.", 400);
      nomeMaterial = item.nome;
      catalogoId = item.id;
    }
    if (!nomeMaterial) {
      throw new AppError("Informe o nome do material.", 400);
    }

    const chamado = await chamadoRepository.buscarPorId(id);
    if (!chamado) {
      throw new AppError("Chamado não encontrado.", 404);
    }

    const quantidade = Number(dados.quantidade) || 1;
    if (quantidade < 1) {
      throw new AppError("A quantidade deve ser pelo menos 1.", 400);
    }

    await materialRepository.criar({
      chamadoId: id,
      catalogoId,
      nome: nomeMaterial,
      quantidade,
      observacao: dados.observacao?.trim() || null,
      necessario: dados.necessario !== false,
      utilizado: Boolean(dados.utilizado),
    });

    await prisma.historicoChamado.create({
      data: {
        chamadoId: id,
        autorId,
        tipo: TIPOS_EVENTO.MATERIAL_REGISTRADO,
        descricao: `Material registrado: ${nomeMaterial} (qtd. ${quantidade}).`,
      },
    });

    const chamadoAtualizado = await chamadoRepository.buscarPorId(id);
    return serializarChamadoDetalhado(chamadoAtualizado);
  },

  async atualizarMaterial(chamadoId, materialId, dados) {
    const material = await materialRepository.buscarPorId(materialId);
    if (!material || material.chamadoId !== chamadoId) {
      throw new AppError("Material não encontrado.", 404);
    }

    const dataUpdate = {};
    if (dados.nome !== undefined) dataUpdate.nome = dados.nome.trim();
    if (dados.quantidade !== undefined) dataUpdate.quantidade = Math.max(Number(dados.quantidade) || 1, 1);
    if (dados.observacao !== undefined) dataUpdate.observacao = dados.observacao?.trim() || null;
    if (dados.necessario !== undefined) dataUpdate.necessario = Boolean(dados.necessario);
    if (dados.utilizado !== undefined) dataUpdate.utilizado = Boolean(dados.utilizado);

    await materialRepository.atualizar(materialId, dataUpdate);

    const chamadoAtualizado = await chamadoRepository.buscarPorId(chamadoId);
    return serializarChamadoDetalhado(chamadoAtualizado);
  },

  async removerMaterial(chamadoId, materialId) {
    const material = await materialRepository.buscarPorId(materialId);
    if (!material || material.chamadoId !== chamadoId) {
      throw new AppError("Material não encontrado.", 404);
    }

    await materialRepository.remover(materialId);

    const chamadoAtualizado = await chamadoRepository.buscarPorId(chamadoId);
    return serializarChamadoDetalhado(chamadoAtualizado);
  },
};

module.exports = chamadoService;
