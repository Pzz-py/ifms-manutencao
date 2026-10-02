import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ paginacao, onMudarPagina }) {
  if (!paginacao || paginacao.totalPaginas <= 1) return null;

  const { paginaAtual, totalPaginas, totalItens } = paginacao;

  return (
    <div className="flex items-center justify-between pt-4 mt-2 border-t border-neutral-100">
      <p className="text-xs text-neutral-500">
        {totalItens} {totalItens === 1 ? "chamado" : "chamados"} · página {paginaAtual} de {totalPaginas}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onMudarPagina(paginaAtual - 1)}
          disabled={paginaAtual <= 1}
          className="p-1.5 rounded-md text-neutral-500 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onMudarPagina(paginaAtual + 1)}
          disabled={paginaAtual >= totalPaginas}
          className="p-1.5 rounded-md text-neutral-500 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
