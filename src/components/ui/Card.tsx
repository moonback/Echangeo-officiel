import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: keyof JSX.IntrinsicElements;
}

export const Card: React.FC<CardProps> = ({ as = 'div', className = '', children, ...props }) => {
  const Element: any = as;
  return (
    <Element
      className={[
        'bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 ease-out',
        className,
      ].join(' ')}
      style={{
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
      }}
      {...props}
    >
      {children}
    </Element>
  );
};

export default Card;


