import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const borderSizeClasses = {
    sm: 'border-2',
    md: 'border-4',
    lg: 'border-4'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-lg'
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50'
    : 'flex flex-col items-center justify-center';

  return (
    <div className={containerClasses}>
      <div className={`${sizeClasses[size]} ${borderSizeClasses[size]} border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin`}></div>
      {message && (
        <p className={`mt-2 ${textSizeClasses[size]} text-gray-600 dark:text-gray-300`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
