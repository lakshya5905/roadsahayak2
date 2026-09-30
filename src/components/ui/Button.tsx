import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 
  | 'primary'      // Highway Amber
  | 'emergency'    // Critical Crimson
  | 'secondary'    // Slate Surface 2
  | 'outline'      // Border outline
  | 'ghost'        // Flat transparent
  | 'live';        // Emerald

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  // Base classes with accessible focus ring and smooth tactile transition
  const baseClasses = 'inline-flex items-center justify-center font-semibold select-none transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer';

  // Size styles
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
    md: 'h-11 px-4 text-sm rounded-xl gap-2',
    lg: 'h-13 px-5 text-base rounded-xl gap-2.5',
    xl: 'h-15 px-6 text-lg rounded-2xl gap-3 font-bold'
  };

  // Variant styles
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 font-bold',
    emergency: 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow-lg shadow-red-600/30 font-bold',
    secondary: 'bg-[#1C2230] hover:bg-[#252D3D] active:bg-[#141822] text-slate-100 border border-[#262E40]',
    outline: 'bg-transparent hover:bg-[#141822] active:bg-[#1C2230] text-slate-200 border border-[#262E40] hover:border-[#3B455E]',
    ghost: 'bg-transparent hover:bg-[#1C2230]/70 active:bg-[#1C2230] text-slate-300 hover:text-white',
    live: 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 font-bold'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
