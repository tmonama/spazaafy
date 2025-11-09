// src/components/NotificationDot.tsx

import React from 'react';

interface NotificationDotProps {
  count: number;
  showCount?: boolean; // If true, shows number; if false, just shows a dot.
}

const NotificationDot: React.FC<NotificationDotProps> = ({ count, showCount = true }) => {
  if (count <= 0) {
    return null; // Don't render anything if there are no notifications
  }

  return (
    <span 
        className="
            absolute -top-1 -right-1 
            flex items-center justify-center 
            bg-red-500 text-white 
            text-[10px] font-bold 
            min-w-[1.25rem] h-5 px-1.5 rounded-full 
            border-2 border-white dark:border-gray-800
        "
    >
        {showCount ? count : ''}
    </span>
  );
};

export default NotificationDot;