import React from 'react';

interface RatingProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
  className?: string;
}

const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  onChange,
  size = 'md',
  readonly = false,
  showValue = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const renderStar = (index: number) => {
    const filled = index < value;
    const halfFilled = !filled && index + 0.5 === value;

    return (
      <button
        key={index}
        type="button"
        className={`${sizeStyles[size]} ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        onClick={() => handleClick(index + 1)}
        disabled={readonly}
        aria-label={`Rate ${index + 1} out of ${max}`}
      >
        <svg
          fill={filled || halfFilled ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          className={`${filled ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      </button>
    );
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: max }, (_, i) => renderStar(i))}
      {showValue && (
        <span className="ml-1 text-sm text-gray-600">{value.toFixed(1)}</span>
      )}
    </div>
  );
};

export default Rating;