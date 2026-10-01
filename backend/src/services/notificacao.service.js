const notificacaoRepository = require("../repositories/notificacao.repository");
const { AppError } = require("../middlewares/errorHandler");

function serializarNotificacao(notificacao) {
  return {
    id: notificacao.id,
    tipo: notificacao.tipo,
    titulo: notificacao.titulo,
    mensagem: notificacao.mensagem,
    lida: notificacao.lida,
    chamadoId: notificacao.chamado?.id || notificacao.chamadoId || null,
    chamadoNumero: notificacao.chamado?.numero || null,
    createdAt: notificacao.createdAt,
  };
}

const notificacaoService = {
  async listar(usuarioId, opts) {
    const notificacoes = await notificacaoRepository.listarPorUsuario(usuarioId, opts);
    return notificacoes.map(serializarNotificacao);
  },

  async contarNaoLidas(usuarioId) {
    return notificacaoRepository.contarNaoLidas(usuarioId);
  },

  async marcarComoLida(id, usuarioId) {
    const notificacao = await notificacaoRepository.buscarPorId(id);
    if (!notificacao) {
      throw new AppError("Notificação não encontrada.", 404);
    }
    if (notificacao.destinatarioId !== usuarioId) {
      throw new AppError("Você não tem permissão para essa notificação.", 403);
    }
    await notificacaoRepository.marcarComoLida(id);
  },

  async marcarTodasComoLidas(usuarioId) {
    await notificacaoRepository.marcarTodasComoLidas(usuarioId);
  },
};

module.exports = notificacaoService;
