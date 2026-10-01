import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import NotificacoesDropdown from "../components/NotificacoesDropdown";

const TITULOS_POR_ROTA = {
  "/dashboard": "Dashboard",
  "/chamados/novo": "Novo chamado",
  "/chamados": "Chamados",
  "/locais": "Locais",
  "/relatorios": "Relatórios",
  "/categorias-chamado": "Categorias de chamados",
  "/categorias-material": "Categorias de materiais",
  "/perfil": "Perfil",
  "/configuracoes": "Configurações",
};

function tituloDaRota(pathname) {
  if (TITULOS_POR_ROTA[pathname]) return TITULOS_POR_ROTA[pathname];
  // Fluxo do QR Code: /chamados/novo/:codigo
  if (pathname.startsWith("/chamados/novo/")) return "Novo chamado";
  // Rotas com parâmetro, ex: /chamados/:id
  if (pathname.startsWith("/chamados/")) return "Detalhes do chamado";
  return "";
}

export default function Topbar({ aoAbrirMenu = () => {} }) {
  const location = useLocation();

  return (
    <header className="h-16 sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-neutral-200 flex items-center justify-between px-4 sm:px-6 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={aoAbrirMenu}
          className="lg:hidden p-1.5 -ml-1 rounded-md text-neutral-500 hover:bg-neutral-100 shrink-0"
          title="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-display font-semibold text-neutral-900 truncate">
          {tituloDaRota(location.pathname)}
        </h1>
      </div>

      <NotificacoesDropdown />
    </header>
  );
}
