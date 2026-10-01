import { AlertTriangle } from "lucide-react";
import Button from "./Button";

/** Diálogo simples de confirmação para ações importantes. */
export default function ConfirmDialog({
  aberto,
  titulo,
  mensagem,
  confirmarLabel = "Confirmar",
  perigo = false,
  carregando = false,
  onConfirmar,
  onCancelar,
}) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/40" onClick={carregando ? undefined : onCancelar} />
      <div className="relative surface-card w-full max-w-sm p-5 animate-fade-in">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              perigo ? "bg-priority-urgente/10 text-priority-urgente" : "bg-accent-50 text-accent-600"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-neutral-900">{titulo}</h3>
            <p className="text-sm text-neutral-500 mt-1">{mensagem}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="secondary" onClick={onCancelar} disabled={carregando}>
            Cancelar
          </Button>
          <Button variant={perigo ? "danger" : "primary"} onClick={onConfirmar} loading={carregando}>
            {confirmarLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
