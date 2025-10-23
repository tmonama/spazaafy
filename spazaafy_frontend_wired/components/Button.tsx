// src/components/Button.tsx
import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  type = 'button', // ✅ CHANGE THIS LINE FROM 'submit' to 'button'
  disabled,
  ...rest
}) => {
  const baseClasses =
    'font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ' +
    'dark:focus:ring-offset-gray-800 transition-all duration-200 flex items-center justify-center';

  const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-primary hover:bg-primary-dark focus:ring-primary-dark text-white',
    secondary: 'bg-secondary hover:bg-secondary-dark focus:ring-secondary-dark text-white',
    danger: 'bg-danger hover:bg-danger-dark focus:ring-danger-dark text-white',
    neutral:
      'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 ' +
      'dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
  };

  const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'py-2 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',
  };

  const disabledClasses =
    'disabled:bg-gray-300 disabled:dark:bg-gray-600 disabled:text-gray-500 ' +
    'disabled:dark:text-gray-400 disabled:cursor-not-allowed';

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      disabled={isLoading || disabled}
      {...rest}
    >
      {isLoading && (
        // ✅ fix xmlns (w3.org) so the SVG renders without errors
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 
               3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
