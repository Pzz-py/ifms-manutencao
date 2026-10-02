import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <Compass className="w-10 h-10 text-neutral-300 mb-4" />
      <h1 className="font-display text-xl font-bold text-neutral-900 mb-1.5">
        Página não encontrada
      </h1>
      <p className="text-sm text-neutral-500 mb-6 max-w-xs">
        O endereço acessado não existe ou foi movido.
      </p>
      <Link
        to="/dashboard"
        className="text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        Voltar para o Dashboard
      </Link>
    </div>
  );
}
