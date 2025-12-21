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
    md: 'text-sm',
    lg: 'text-base'
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-50'
    : 'flex flex-col items-center justify-center';

  return (
    <div className={containerClasses}>
      <div className={`${sizeClasses[size]} ${borderSizeClasses[size]} border-indigo-600 dark:border-indigo-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin`}></div>
      {message && (
        <p className={`mt-3 ${textSizeClasses[size]} text-slate-600 dark:text-slate-300 font-medium`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
