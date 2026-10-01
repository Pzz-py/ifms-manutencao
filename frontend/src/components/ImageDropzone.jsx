import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const TAMANHO_MAXIMO_MB = 5;

/**
 * Campo de anexo de imagem (opcional) do formulário de novo chamado.
 * Valida tipo e tamanho no cliente antes de enviar, para dar feedback
 * imediato — a validação "de verdade" continua acontecendo no backend.
 */
export default function ImageDropzone({ value, onChange, error }) {
  const inputRef = useRef(null);
  const [arrastando, setArrastando] = useState(false);
  const [erroLocal, setErroLocal] = useState("");

  function validarEDefinir(arquivo) {
    if (!arquivo) return;

    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      setErroLocal("Formato não suportado. Envie JPG, PNG, WEBP ou GIF.");
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_MB * 1024 * 1024) {
      setErroLocal(`A imagem deve ter no máximo ${TAMANHO_MAXIMO_MB}MB.`);
      return;
    }

    setErroLocal("");
    onChange(arquivo);
  }

  function handleDrop(e) {
    e.preventDefault();
    setArrastando(false);
    validarEDefinir(e.dataTransfer.files?.[0]);
  }

  const mensagemErro = error || erroLocal;

  if (value) {
    return (
      <div className="relative w-full">
        <div className="rounded-lg border border-neutral-200 overflow-hidden bg-neutral-50">
          <img
            src={URL.createObjectURL(value)}
            alt="Pré-visualização do anexo"
            className="w-full h-40 object-cover"
          />
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-neutral-900/70 text-white flex items-center justify-center hover:bg-neutral-900 transition-colors"
          title="Remover imagem"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={handleDrop}
        className={`w-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 transition-colors
          ${arrastando ? "border-primary-400 bg-primary-50" : "border-neutral-300 hover:border-neutral-400 bg-neutral-50"}`}
      >
        <ImagePlus className="w-5 h-5 text-neutral-400" />
        <p className="text-sm text-neutral-500">
          Arraste uma imagem ou <span className="text-primary-600 font-medium">clique para selecionar</span>
        </p>
        <p className="text-xs text-neutral-400">JPG, PNG, WEBP ou GIF · até {TAMANHO_MAXIMO_MB}MB</p>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={TIPOS_ACEITOS.join(",")}
        className="hidden"
        onChange={(e) => validarEDefinir(e.target.files?.[0])}
      />

      {mensagemErro && <p className="mt-1.5 text-xs text-priority-urgente">{mensagemErro}</p>}
    </div>
  );
}
