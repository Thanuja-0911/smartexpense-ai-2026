import React from 'react';

export const Input = React.forwardRef(
  ({ label, error, helperText, icon: Icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-slate-900/80 border ${
              error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-brand-500 focus:ring-brand-500'
            } rounded-xl ${
              Icon ? 'pl-10' : 'px-3.5'
            } py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);
