import React from 'react';

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  pulse?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-gray-100/80 text-gray-800 border border-gray-200/50',
  success: 'bg-emerald-100/80 text-emerald-800 border border-emerald-200/50',
  warning: 'bg-amber-100/80 text-amber-800 border border-amber-200/50',
  danger: 'bg-red-100/80 text-red-800 border border-red-200/50',
  info: 'bg-blue-100/80 text-blue-800 border border-blue-200/50',
  brand: 'bg-brand-100/80 text-brand-800 border border-brand-200/50',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs sm:px-2 sm:py-0.5 sm:text-xs',
  md: 'px-2.5 py-1 text-xs sm:px-3 sm:py-1 sm:text-xs',
  lg: 'px-3 py-1.5 text-sm sm:px-4 sm:py-1.5 sm:text-sm',
};

export const Badge: React.FC<BadgeProps> = ({ 
  variant = 'neutral', 
  size = 'md',
  pulse = false,
  className = '', 
  children, 
  ...props 
}) => {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full font-semibold backdrop-blur-xl transition-all duration-300 hover:scale-105 sm:duration-500',
        variantClasses[variant],
        sizeClasses[size],
        pulse ? 'animate-pulse' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;


