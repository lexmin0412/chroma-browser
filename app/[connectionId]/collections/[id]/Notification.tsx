import React from 'react';

interface NotificationProps {
  type: 'error' | 'success';
  message: string;
}

const Notification: React.FC<NotificationProps> = ({ type, message }) => {
  if (!message) return null;

  const baseClasses = "px-4 py-3 rounded-lg mb-6 shadow-sm";
  const typeClasses = type === 'error' 
    ? "bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
    : "bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300";

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <strong className="font-bold">{type === 'error' ? 'Error: ' : 'Success: '}</strong>
      <span>{message}</span>
    </div>
  );
};

export default Notification;