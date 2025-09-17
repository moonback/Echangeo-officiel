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
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;


