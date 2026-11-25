import React from 'react';

export const ProgressBar = ({
  value = 0, // 0 to 100
  color = 'bg-brand-500', // bg-emerald-500 | bg-amber-500 | bg-rose-500 | bg-purple-500
  height = 'h-2',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full bg-slate-800 rounded-full overflow-hidden ${height} ${className}`}>
      <div
        className={`${height} ${color} rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
