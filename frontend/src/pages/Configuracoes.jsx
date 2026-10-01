import { Link } from "react-router-dom";
import { UserCircle, MapPin, ArrowRight, Info, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Configuracoes() {
  const { usuario, logout } = useAuth();
  const ehAdministrador = usuario?.role === "ADMINISTRADOR";

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h2 className="font-display text-lg font-bold text-neutral-900">Configurações</h2>
        <p className="text-sm text-neutral-500 mt-0.5">
          Atalhos e informações gerais do sistema.
        </p>
      </div>

      {/* Conta */}
      <div className="surface-card p-5">
        <h3 className="flex items-center gap-1.5 font-display font-semibold text-sm text-neutral-800 mb-4">
          <UserCircle className="w-4 h-4" /> Conta
        </h3>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-neutral-800">{usuario?.nome}</p>
            <p className="text-xs text-neutral-500">{usuario?.email}</p>
          </div>
          <Link
            to="/perfil"
            className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Editar perfil <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex items-center justify-between py-2 border-t border-neutral-100 mt-2">
          <div>
            <p className="text-sm font-medium text-neutral-800">Sair da conta</p>
            <p className="text-xs text-neutral-500">Encerra sua sessão neste dispositivo.</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm font-medium text-priority-urgente hover:opacity-80"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
      </div>

      {/* Administração (só admin) */}
      {ehAdministrador && (
        <div className="surface-card p-5">
          <h3 className="flex items-center gap-1.5 font-display font-semibold text-sm text-neutral-800 mb-4">
            <MapPin className="w-4 h-4" /> Administração
          </h3>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-neutral-800">Locais e QR Codes</p>
              <p className="text-xs text-neutral-500">
                Cadastre ambientes do campus e gere os QR Codes de abertura de chamado.
              </p>
            </div>
            <Link
              to="/locais"
              className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 shrink-0 ml-3"
            >
              Abrir <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Sobre */}
      <div className="surface-card p-5">
        <h3 className="flex items-center gap-1.5 font-display font-semibold text-sm text-neutral-800 mb-4">
          <Info className="w-4 h-4" /> Sobre o sistema
        </h3>
        <dl className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500">Sistema</dt>
            <dd className="text-neutral-700 font-medium">Manutenção IFMS — Campus Jardim</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Versão</dt>
            <dd className="text-neutral-700 font-medium">1.0.0 (protótipo)</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Stack</dt>
            <dd className="text-neutral-700 font-medium">React + Node.js + Prisma</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
