import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:from-brand-700 hover:to-brand-800 shadow-lg shadow-brand-500/25 disabled:from-brand-300 disabled:to-brand-300 disabled:shadow-none',
  secondary: 'bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-900 hover:to-gray-800 shadow-lg shadow-gray-500/20 disabled:from-gray-300 disabled:to-gray-300',
  ghost: 'bg-white/60 backdrop-blur-sm border border-gray-200/60 text-gray-700 hover:bg-white/80 hover:border-gray-300/60 hover:shadow-md disabled:text-gray-400 disabled:bg-gray-100/60',
  danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-500/25 disabled:from-red-300 disabled:to-red-300',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm rounded-xl',
  md: 'h-11 px-6 text-sm rounded-2xl',
  lg: 'h-12 px-8 text-base rounded-2xl',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  leftIcon,
  rightIcon,
  children,
  ...props
}) => {
  return (
    <button
      className={[
        'inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 transform-gpu',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {leftIcon && <span className="mr-2 inline-flex items-center">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="ml-2 inline-flex items-center">{rightIcon}</span>}
    </button>
  );
};

export default Button;


