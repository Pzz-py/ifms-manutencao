import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { useNotificacoes } from "../hooks/useNotificacoes";
import { NOTIFICACAO_CONFIG } from "../utils/notificacaoConfig";
import { formatarTempoRelativo } from "../utils/formatDate";

export default function NotificacoesDropdown() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [aberto, setAberto] = useState(false);

  const { notificacoes, naoLidas, carregando, buscarLista, marcarComoLida, marcarTodasComoLidas } =
    useNotificacoes();

  useEffect(() => {
    if (aberto) buscarLista();
  }, [aberto, buscarLista]);

  // Fecha o dropdown ao clicar fora.
  useEffect(() => {
    function aoClicarFora(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, []);

  function handleClickNotificacao(notificacao) {
    if (!notificacao.lida) marcarComoLida(notificacao.id);
    setAberto(false);
    if (notificacao.chamadoId) navigate(`/chamados/${notificacao.chamadoId}`);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setAberto((atual) => !atual)}
        title="Notificações"
        className="relative p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {naoLidas > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-priority-urgente" />
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 mt-2 w-80 surface-card p-0 overflow-hidden animate-fade-in z-20">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
            <p className="text-sm font-semibold text-neutral-800">Notificações</p>
            {naoLidas > 0 && (
              <button
                onClick={marcarTodasComoLidas}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {carregando && (
              <p className="text-sm text-neutral-400 text-center py-8">Carregando...</p>
            )}

            {!carregando && notificacoes.length === 0 && (
              <div className="flex flex-col items-center py-8 text-center px-4">
                <Inbox className="w-6 h-6 text-neutral-300 mb-2" />
                <p className="text-sm text-neutral-400">Nenhuma notificação por aqui.</p>
              </div>
            )}

            {!carregando &&
              notificacoes.map((notificacao) => {
                const config = NOTIFICACAO_CONFIG[notificacao.tipo] || NOTIFICACAO_CONFIG.STATUS_ALTERADO;
                const Icon = config.icon;
                return (
                  <button
                    key={notificacao.id}
                    onClick={() => handleClickNotificacao(notificacao)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-neutral-50 transition-colors border-b border-neutral-50 last:border-0 ${
                      !notificacao.lida ? "bg-primary-50/40" : ""
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-800 truncate">
                        {notificacao.titulo}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
                        {notificacao.mensagem}
                      </p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {formatarTempoRelativo(notificacao.createdAt)}
                      </p>
                    </div>
                    {!notificacao.lida && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0 mt-1.5" />
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
