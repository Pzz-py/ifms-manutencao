import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm",
  secondary:
    "bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50",
  ghost: "text-neutral-600 hover:bg-neutral-100",
  danger: "bg-priority-urgente text-white hover:opacity-90",
};

/**
 * Botão padrão da aplicação.
 * Sempre usar este componente ao invés de <button> cru, para manter
 * consistência visual e comportamento de loading/disabled em um só lugar.
 */
export default function Button({
  children,
  variant = "primary",
  loading = false,
  disabled = false,
  type = "button",
  className = "",
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium
        transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
