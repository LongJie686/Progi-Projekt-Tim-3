import React from 'react';
import { getInitials } from '../../utils/formatUtils';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
  onClick,
}) => {
  const sizeStyles = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  const initials = getInitials(name);

  const baseStyles = `inline-flex items-center justify-center rounded-full font-medium ${sizeStyles[size]} ${onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${baseStyles} object-cover`}
        onClick={onClick}
      />
    );
  }

  return (
    <div
      className={`${baseStyles} bg-primary-100 text-primary-600`}
      onClick={onClick}
      title={name}
    >
      {initials}
    </div>
  );
};

export default Avatar;