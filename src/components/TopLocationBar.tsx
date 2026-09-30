import React from 'react';
import { MapPin, Radio, AlertCircle, RefreshCw } from 'lucide-react';

export interface TopLocationBarProps {
  address: string;
  locationStatus: 'granted' | 'denied' | 'pending';
  nearbyCount?: number;
  onRetryLocation?: () => void;
  className?: string;
}

export const TopLocationBar: React.FC<TopLocationBarProps> = ({
  address,
  locationStatus,
  nearbyCount = 0,
  onRetryLocation,
  className = ''
}) => {
  if (locationStatus === 'denied') {
    return (
      <div className={`w-full bg-red-950/80 border-b border-red-800/40 px-3.5 py-2 text-red-200 flex items-center justify-between gap-2 text-xs shrink-0 ${className}`}>
        <div className="flex items-center gap-2 min-w-0">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="truncate font-medium">GPS Denied — Demo Coordinates Active</span>
        </div>
        {onRetryLocation && (
          <button
            onClick={onRetryLocation}
            className="flex items-center gap-1 px-2.5 py-1 bg-red-900/60 hover:bg-red-900 border border-red-700/50 rounded-lg text-[11px] font-semibold text-white transition-colors shrink-0"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <header className={`w-full bg-[#141822]/95 backdrop-blur-md border-b border-[#262E40] px-3.5 py-2.5 flex items-center justify-between gap-2.5 shrink-0 z-30 ${className}`}>
      {/* Current Address */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
          <MapPin className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">YOUR RADAR ZONE</span>
            {locationStatus === 'granted' ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Live GPS Connected" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" title="Detecting Location..." />
            )}
          </div>
          <p className="text-xs font-semibold text-slate-100 truncate leading-tight">
            {address || 'Detecting highway coordinates...'}
          </p>
        </div>
      </div>

      {/* Online Sahayaks Counter Pill */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1C2230] border border-[#262E40] rounded-lg shrink-0">
        <Radio className="w-3 h-3 text-emerald-400 animate-pulse shrink-0" />
        <span className="text-[11px] font-bold text-slate-200 whitespace-nowrap">
          {nearbyCount > 0 ? `${nearbyCount} Sahayaks` : 'Radar Active'}
        </span>
      </div>
    </header>
  );
};
