import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  User,
  Settings,
  Wrench,
  LogOut,
  MapPin,
  FileBarChart,
  Tags,
  Boxes,
  X,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chamados/novo", label: "Novo chamado", icon: PlusCircle },
  { to: "/chamados", label: "Chamados", icon: ClipboardList },
  { to: "/perfil", label: "Perfil", icon: User },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];

// Seção administrativa: só aparece para ADMINISTRADOR (as rotas da API
// também são protegidas no backend).
const NAV_ITEMS_ADMIN = [
  { to: "/locais", label: "Locais e QR Codes", icon: MapPin },
  { to: "/categorias-chamado", label: "Categorias de chamados", icon: Tags },
  { to: "/categorias-material", label: "Categorias de materiais", icon: Boxes },
  { to: "/relatorios", label: "Relatórios", icon: FileBarChart },
];

/**
 * Menu lateral. Em telas `lg+` fica sempre visível e fixa na lateral.
 * Em telas menores vira um drawer: escondida por padrão (fora da tela
 * à esquerda) e deslizando para dentro quando `aberta` é true — o
 * estado mora no AppLayout, que também renderiza o botão de menu no Topbar.
 */
export default function Sidebar({ aberta = false, aoFechar = () => {} }) {
  const { usuario, logout } = useAuth();

  const ehAdministrador = usuario?.role === "ADMINISTRADOR";

  const renderItem = ({ to, label, icon: Icon }) => (
    <NavLink
      key={to}
      to={to}
      end={to === "/chamados"}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
          isActive ? "bg-primary-50 text-primary-700" : "text-neutral-600 hover:bg-neutral-100"
        }`
      }
    >
      <Icon className="w-4 h-4" />
      {label}
    </NavLink>
  );

  return (
    <>
      {/* Overlay escuro atrás do drawer, só em mobile e só quando aberto */}
      {aberta && (
        <div
          onClick={aoFechar}
          className="fixed inset-0 bg-neutral-900/40 z-30 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-64 shrink-0 h-screen bg-white border-r border-neutral-200 flex flex-col
          fixed inset-y-0 left-0 z-40 transition-transform duration-200
          lg:sticky lg:top-0 lg:translate-x-0
          ${aberta ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Marca */}
        <div className="h-16 flex items-center justify-between gap-2.5 px-5 border-b border-neutral-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div className="leading-tight min-w-0">
              <p className="font-display font-bold text-sm text-neutral-900 truncate">Manutenção</p>
              <p className="text-xs text-neutral-500 truncate">IFMS Campus Jardim</p>
            </div>
          </div>
          <button
            onClick={aoFechar}
            className="lg:hidden p-1.5 rounded-md text-neutral-400 hover:bg-neutral-100 shrink-0"
            title="Fechar menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(renderItem)}

          {ehAdministrador && (
            <>
              <p className="px-3 pt-4 pb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">
                Administração
              </p>
              {NAV_ITEMS_ADMIN.map(renderItem)}
            </>
          )}
        </nav>

        {/* Usuário logado */}
        <div className="p-3 border-t border-neutral-200">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-xs font-semibold shrink-0">
              {usuario?.nome?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-neutral-800 truncate">
                {usuario?.nome}
              </p>
              <p className="text-xs text-neutral-500 truncate">
                {usuario?.role === "ADMINISTRADOR" ? "Administrador" : "Usuário"}
              </p>
            </div>
            <button
              onClick={logout}
              title="Sair"
              className="p-1.5 rounded-md text-neutral-400 hover:text-priority-urgente hover:bg-neutral-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
