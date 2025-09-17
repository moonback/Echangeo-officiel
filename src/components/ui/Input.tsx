import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, hint, error, className = '', id, ...props }) => {
  const inputId = id || React.useId();
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          'w-full px-3 py-2 border rounded-xl bg-white placeholder:text-gray-400',
          'focus:ring-2 focus:ring-brand-500 focus:border-transparent',
          error ? 'border-red-300' : 'border-gray-300',
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
};

export default Input;


