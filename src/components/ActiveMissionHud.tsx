import React from 'react';
import { Navigation, CheckCircle, X, ShieldAlert, Phone, AlertCircle } from 'lucide-react';
import { ActiveMission } from '../types';

export interface ActiveMissionHudProps {
  mission: ActiveMission;
  onNavigate: () => void;
  onArrived: () => void;
  onResolve: () => void;
  onCancel: () => void;
  onCallVictim?: () => void;
}

export const ActiveMissionHud: React.FC<ActiveMissionHudProps> = ({
  mission,
  onNavigate,
  onArrived,
  onResolve,
  onCancel,
  onCallVictim
}) => {
  const isArrived = mission.status === 'arrived';

  return (
    <aside 
      aria-label="Active Rescue Mission"
      className="w-full bg-[#141822] border-t-2 border-t-amber-500 border-x border-b border-[#262E40] shadow-2xl rounded-t-2xl px-4 py-3 z-40 shrink-0 transition-all duration-200"
    >
      {/* Header Line */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#1E2533]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-extrabold text-amber-400 tracking-wider">
              {isArrived ? 'ON SCENE WITH MOTORIST' : 'ACTIVE RESCUE MISSION'}
            </span>
            <h4 className="text-xs font-bold text-slate-100 truncate">
              {mission.incidentTitle || 'Road Assistance in Progress'}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {mission.distanceKm !== undefined && (
            <span className="px-2 py-0.5 bg-[#1C2230] border border-[#262E40] rounded-md text-[11px] font-bold text-slate-200">
              {mission.distanceKm < 1 ? `${Math.round(mission.distanceKm * 1000)}m` : `${mission.distanceKm.toFixed(1)}km`}
            </span>
          )}
          <button
            onClick={onCancel}
            title="Cancel Mission"
            aria-label="Cancel Mission"
            className="w-6 h-6 rounded-md bg-[#1C2230] border border-[#262E40] flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Address line */}
      <p className="text-[11px] text-slate-300 truncate py-1.5 font-medium">
        📍 {mission.targetAddress || 'Highway Location'}
      </p>

      {/* Actions Row */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onNavigate}
          className="flex-1 h-9 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" />
          Navigate Route
        </button>

        {onCallVictim && mission.victimPhone && (
          <button
            onClick={onCallVictim}
            className="h-9 px-3 bg-[#1C2230] hover:bg-[#252D3D] text-emerald-400 border border-[#262E40] font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            Call
          </button>
        )}

        {!isArrived ? (
          <button
            onClick={onArrived}
            className="flex-1 h-9 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            I Have Arrived
          </button>
        ) : (
          <button
            onClick={onResolve}
            className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Mark Resolved
          </button>
        )}
      </div>
    </aside>
  );
};
