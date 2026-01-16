import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  labelClassName?: string; // ✅ Added optional prop
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ 
  label, 
  id, 
  error, 
  className = '', 
  labelClassName = '', // ✅ Destructure with default value
  ...props 
}, ref) => {
  
  // Define base classes that are always applied
  const baseClasses = `block w-full px-3 py-2 border rounded-md shadow-sm 
                       placeholder-gray-400 dark:placeholder-gray-500 
                       focus:outline-none focus:ring-dark-border focus:border-dark-border 
                       sm:text-sm bg-white dark:bg-dark-input text-gray-900 dark:text-gray-100`;
                       
  // Conditionally add error or default border classes
  const borderClasses = error 
    ? 'border-red-500' 
    : 'border-gray-300 dark:border-dark-surface';

  return (
    <div>
      <label 
        htmlFor={id} 
        // ✅ Apply the custom label class here
        className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${labelClassName}`}
      >
        {label}
      </label>
      <div className="mt-1">
        <input
          ref={ref}
          id={id}
          // Combine input classes
          className={`${baseClasses} ${borderClasses} ${className}`}
          {...props}
        />
        {/* If an error message is passed, display it below the input */}
        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    </div>
  );
});

export default Input;