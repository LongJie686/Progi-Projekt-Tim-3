import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
  padding = 'md',
  hoverable = false,
  onClick,
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hoverable ? 'hover:shadow-md transition-shadow cursor-pointer' : '';

  return (
    <div
      className={`bg-white rounded-xl shadow-card ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      <div className={title || subtitle ? '' : paddingStyles[padding]}>{children}</div>
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">{footer}</div>
      )}
    </div>
  );
};

export default Card;