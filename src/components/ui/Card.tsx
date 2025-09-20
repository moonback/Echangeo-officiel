import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: keyof JSX.IntrinsicElements;
}

export const Card: React.FC<CardProps> = ({ as = 'div', className = '', children, ...props }) => {
  const Element: any = as;
  return (
    <Element
      className={[
        'bg-white/90 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-out sm:rounded-3xl sm:shadow-2xl sm:hover:shadow-3xl sm:duration-500',
        className,
      ].join(' ')}
      style={{
        boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
      }}
      {...props}
    >
      {children}
    </Element>
  );
};

export default Card;


