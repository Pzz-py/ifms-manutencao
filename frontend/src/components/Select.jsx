import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

const Select = forwardRef(function Select(
  { label, error, id, children, className = "", ...rest },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={`w-full appearance-none rounded-lg border bg-white text-sm text-neutral-800
            py-2.5 pl-3 pr-9 transition-colors duration-150
            ${error ? "border-priority-urgente" : "border-neutral-300 hover:border-neutral-400"}
            focus:border-primary-500 ${className}`}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {error && <p className="mt-1.5 text-xs text-priority-urgente">{error}</p>}
    </div>
  );
});

export default Select;
