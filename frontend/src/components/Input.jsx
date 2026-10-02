import { forwardRef } from "react";

/**
 * Input padrão com rótulo, ícone opcional à esquerda e mensagem de erro.
 * Usar forwardRef para permitir integração com formulários/refs quando necessário.
 */
const Input = forwardRef(function Input(
  { label, icon: Icon, error, id, className = "", ...rest },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-neutral-700 mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full rounded-lg border bg-white text-sm text-neutral-800 placeholder:text-neutral-400
            py-2.5 ${Icon ? "pl-9" : "pl-3"} pr-3
            transition-colors duration-150
            ${error ? "border-priority-urgente" : "border-neutral-300 hover:border-neutral-400"}
            focus:border-primary-500 ${className}`}
          {...rest}
        />
      </div>

      {error && <p className="mt-1.5 text-xs text-priority-urgente">{error}</p>}
    </div>
  );
});

export default Input;
