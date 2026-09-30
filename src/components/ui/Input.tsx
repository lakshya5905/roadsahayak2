import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  leftIcon,
  rightElement,
  helperText,
  className = '',
  id,
  disabled,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-300 tracking-wide select-none"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`
            w-full h-11 bg-[#1C2230] border text-slate-100 placeholder:text-slate-500 rounded-xl text-sm
            transition-colors duration-150 outline-none
            ${leftIcon ? 'pl-10' : 'pl-3.5'}
            ${rightElement ? 'pr-11' : 'pr-3.5'}
            ${error 
              ? 'border-red-500/80 focus:border-red-500' 
              : 'border-[#262E40] focus:border-amber-500/80 focus:bg-[#202737]'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3 flex items-center text-slate-400">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-red-400 font-medium pl-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-400 pl-0.5">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
