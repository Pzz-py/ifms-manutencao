function criarControllerCategoria(service) {
  const responder = (fn, status = 200) => async (req, res, next) => {
    try {
      const data = await fn(req);
      res.status(status).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  return {
    listar: responder(() => service.listar()),
    listarGestao: responder(() => service.listarGestao()),
    criar: responder((req) => service.criar(req.body || {}), 201),
    atualizar: responder((req) => service.atualizar(req.params.id, req.body || {})),
    remover: responder(async (req) => {
      await service.remover(req.params.id);
      return null;
    }),
  };
}

module.exports = { criarControllerCategoria };
