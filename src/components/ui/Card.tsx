import React from 'react';

export type CardVariant = 'default' | 'elevated' | 'emergency' | 'amber' | 'live' | 'interactive';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  leftStripeColor?: 'emergency' | 'amber' | 'live' | 'info' | 'none';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  leftStripeColor = 'none',
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'relative rounded-2xl transition-all duration-150 overflow-hidden';

  const variantClasses: Record<CardVariant, string> = {
    default: 'bg-[#141822] border border-[#262E40] text-slate-100 shadow-md',
    elevated: 'bg-[#1C2230] border border-[#262E40] text-slate-100 shadow-lg',
    emergency: 'bg-[#141822] border border-red-500/30 text-slate-100 shadow-lg shadow-red-500/10',
    amber: 'bg-[#141822] border border-amber-500/30 text-slate-100 shadow-md shadow-amber-500/10',
    live: 'bg-[#141822] border border-emerald-500/30 text-slate-100 shadow-md shadow-emerald-500/10',
    interactive: 'bg-[#141822] border border-[#262E40] hover:border-[#3B455E] hover:bg-[#181D29] active:scale-[0.99] text-slate-100 cursor-pointer shadow-md'
  };

  const stripeClasses: Record<string, string> = {
    emergency: 'border-l-4 border-l-red-500',
    amber: 'border-l-4 border-l-amber-500',
    live: 'border-l-4 border-l-emerald-500',
    info: 'border-l-4 border-l-blue-500',
    none: ''
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${stripeClasses[leftStripeColor]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
