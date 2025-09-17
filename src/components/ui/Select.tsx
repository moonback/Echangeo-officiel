import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options?: Array<{ value: string; label: string }>; // convenience
}

export const Select: React.FC<SelectProps> = ({ label, hint, error, className = '', id, children, options, ...props }) => {
  const selectId = id || React.useId();
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={[
          'w-full px-3 py-2 border rounded-xl bg-white',
          'focus:ring-2 focus:ring-brand-500 focus:border-transparent',
          error ? 'border-red-300' : 'border-gray-300',
          className,
        ].join(' ')}
        {...props}
      >
        {options ? options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        )) : children}
      </select>
      {error ? (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      ) : hint ? (
        <p className="text-xs text-gray-500 mt-1">{hint}</p>
      ) : null}
    </div>
  );
};

export default Select;


