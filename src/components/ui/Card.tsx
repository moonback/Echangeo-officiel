import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: keyof JSX.IntrinsicElements;
}

export const Card: React.FC<CardProps> = ({ as = 'div', className = '', children, ...props }) => {
  const Element: any = as;
  return (
    <Element
      className={[
        'bg-white border border-gray-200 rounded-2xl shadow-soft',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </Element>
  );
};

export default Card;


