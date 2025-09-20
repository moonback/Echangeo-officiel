import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className = '', id, ...props }, ref) => {
    const inputId = id || React.useId();
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full px-4 py-3 border rounded-3xl bg-white/80 backdrop-blur-xl placeholder:text-gray-400',
            'focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 focus:-translate-y-0.5 focus:shadow-2xl',
            'transition-all duration-500 ease-out',
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/40' : 'border-white/20',
            className,
          ].join(' ')}
          {...props}
        />
        {error ? (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        ) : hint ? (
          <p className="text-xs text-gray-500 mt-1">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;


