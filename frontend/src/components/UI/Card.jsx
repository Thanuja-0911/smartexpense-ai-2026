import React from 'react';

export const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div
      className={`bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl shadow-slate-950/20 backdrop-blur-md transition-all duration-200 ${
        hover ? 'hover:border-slate-700 hover:shadow-slate-900/40' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
