import React from 'react';
import { 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  Radio, 
  ShieldCheck, 
  Info, 
  Wrench, 
  Fuel, 
  Clock 
} from 'lucide-react';
import { SemanticState } from '../../lib/designTokens';

export interface StatusBadgeProps {
  status: SemanticState | 'critical' | 'breakdown' | 'fuel' | 'flat_tire' | 'lockout';
  label?: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'sm',
  pulse = false,
  className = ''
}) => {
  let defaultLabel = '';
  let colorClasses = '';
  let IconComponent = Info;

  switch (status) {
    case 'emergency':
    case 'critical':
      defaultLabel = 'Emergency';
      colorClasses = 'bg-red-500/15 text-red-400 border-red-500/30';
      IconComponent = Flame;
      break;
    case 'assistance':
      defaultLabel = 'Assistance';
      colorClasses = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      IconComponent = Wrench;
      break;
    case 'breakdown':
      defaultLabel = 'Breakdown';
      colorClasses = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      IconComponent = Wrench;
      break;
    case 'flat_tire':
      defaultLabel = 'Flat Tire';
      colorClasses = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      IconComponent = Wrench;
      break;
    case 'fuel':
      defaultLabel = 'Out of Fuel';
      colorClasses = 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      IconComponent = Fuel;
      break;
    case 'hazard':
    case 'warning':
      defaultLabel = 'Hazard';
      colorClasses = 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      IconComponent = AlertTriangle;
      break;
    case 'live':
      defaultLabel = 'Live';
      colorClasses = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      IconComponent = Radio;
      break;
    case 'verified':
      defaultLabel = 'Verified';
      colorClasses = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      IconComponent = ShieldCheck;
      break;
    case 'resolved':
      defaultLabel = 'Resolved';
      colorClasses = 'bg-slate-500/15 text-slate-400 border-slate-500/30';
      IconComponent = CheckCircle2;
      break;
    case 'normal':
    default:
      defaultLabel = 'Info';
      colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
      IconComponent = Info;
      break;
  }

  const displayLabel = label || defaultLabel;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px] gap-1 rounded-md' : 'px-2.5 py-1 text-xs gap-1.5 rounded-lg';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center font-medium border tracking-wide select-none ${colorClasses} ${sizeClasses} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2 mr-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      <IconComponent className={`${iconSize} shrink-0`} />
      <span className="leading-none whitespace-nowrap">{displayLabel}</span>
    </span>
  );
};
