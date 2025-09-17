import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, hint, error, className = '', id, rows = 3, ...props }, ref) => {
    const textAreaId = id || React.useId();
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textAreaId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textAreaId}
          rows={rows}
          className={[
            'w-full px-4 py-3 border rounded-2xl bg-white/60 backdrop-blur-sm placeholder:text-gray-400 resize-none',
            'focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 focus:-translate-y-0.5 focus:shadow-lg',
            'transition-all duration-200 ease-out',
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/40' : 'border-gray-300/60',
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

TextArea.displayName = 'TextArea';

export default TextArea;


