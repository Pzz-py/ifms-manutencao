const service = require("../services/materialCatalogo.service");

const responder = (fn, status = 200) => async (req, res, next) => {
  try {
    res.status(status).json({ success: true, data: await fn(req) });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listar: responder(() => service.listar()),
  criar: responder((req) => service.criar(req.body || {}), 201),
  atualizar: responder((req) => service.atualizar(req.params.id, req.body || {})),
  remover: responder(async (req) => {
    await service.remover(req.params.id);
    return null;
  }),
};
