const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const { AppError } = require("./errorHandler");

const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const TAMANHO_MAXIMO_MB = 5;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "..", process.env.UPLOADS_DIR || "uploads"));
  },
  filename: (req, file, cb) => {
    const sufixo = crypto.randomBytes(8).toString("hex");
    const extensao = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${sufixo}${extensao}`);
  },
});

function filtroDeArquivo(req, file, cb) {
  if (!TIPOS_ACEITOS.includes(file.mimetype)) {
    return cb(new Error("Formato de imagem não suportado. Envie JPG, PNG, WEBP ou GIF."));
  }
  cb(null, true);
}

const uploadImagem = multer({
  storage,
  fileFilter: filtroDeArquivo,
  limits: { fileSize: TAMANHO_MAXIMO_MB * 1024 * 1024 },
});

/**
 * Middleware pronto para usar nas rotas: aceita um único arquivo no
 * campo "imagem" (opcional) e converte qualquer erro do multer
 * (tipo inválido, arquivo grande demais) em um AppError com mensagem
 * amigável, em vez de deixar o errorHandler devolver um 500 genérico.
 */
function receberImagemOpcional(req, res, next) {
  uploadImagem.single("imagem")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new AppError(`A imagem deve ter no máximo ${TAMANHO_MAXIMO_MB}MB.`, 400));
      }
      return next(new AppError(err.message, 400));
    }
    if (err) {
      return next(new AppError(err.message, 400));
    }
    next();
  });
}

module.exports = { uploadImagem, receberImagemOpcional };
