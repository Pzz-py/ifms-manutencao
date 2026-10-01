import { forwardRef } from "react";

const Textarea = forwardRef(function Textarea(
  { label, error, id, className = "", ...rest },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1.5">
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={id}
        className={`w-full rounded-lg border bg-white text-sm text-neutral-800 placeholder:text-neutral-400
          py-2.5 px-3 transition-colors duration-150 resize-none
          ${error ? "border-priority-urgente" : "border-neutral-300 hover:border-neutral-400"}
          focus:border-primary-500 ${className}`}
        {...rest}
      />

      {error && <p className="mt-1.5 text-xs text-priority-urgente">{error}</p>}
    </div>
  );
});

export default Textarea;
