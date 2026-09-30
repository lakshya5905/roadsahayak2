import React, { useEffect } from 'react';
import { ChevronRight, X, Flame } from 'lucide-react';
import { Incident } from '../types';
import { INCIDENT_CONFIGS, formatDistance, calculateDistanceKm } from '../lib/location';

export interface NotificationToastProps {
  incident: Incident;
  userLat: number | null;
  userLng: number | null;
  onView: () => void;
  onDismiss: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  incident,
  userLat,
  userLng,
  onView,
  onDismiss
}) => {
  const config = INCIDENT_CONFIGS[incident.type] || INCIDENT_CONFIGS.other;
  const isEmergency = incident.severity === 'critical' || incident.type === 'accident' || incident.type === 'medical';

  const distanceKm =
    userLat && userLng && incident.location
      ? calculateDistanceKm(userLat, userLng, incident.location.lat, incident.location.lng)
      : null;

  // Auto dismiss after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 8000);
    return () => clearTimeout(timer);
  }, [incident, onDismiss]);

  return (
    <div 
      role="alert"
      aria-live="assertive"
      className="absolute top-2 inset-x-3 z-50 transition-all duration-200"
    >
      <div 
        className={`
          bg-[#141822] border rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 text-slate-100
          ${isEmergency 
            ? 'border-red-500/80 shadow-red-500/20' 
            : 'border-amber-500/80 shadow-amber-500/20'
          }
        `}
      >
        <div
          onClick={onView}
          className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer group select-none"
        >
          <div 
            className={`
              w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md font-bold
              ${isEmergency ? 'bg-red-600 text-white' : 'bg-amber-500 text-slate-950'}
            `}
          >
            <Flame className="w-5 h-5 animate-pulse" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isEmergency ? 'text-red-400' : 'text-amber-400'}`}>
                {isEmergency ? 'URGENT HIGHWAY SOS' : 'ROAD ALERT'}
              </span>
              {distanceKm !== null && (
                <span className="text-[10px] font-bold text-slate-200 bg-[#1C2230] border border-[#262E40] px-1.5 py-0.5 rounded">
                  {formatDistance(distanceKm)}
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-100 truncate group-hover:text-amber-400 transition-colors mt-0.5">
              {config.label}: {incident.address || 'Reported on your corridor'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onView}
            className={`
              px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer
              ${isEmergency 
                ? 'bg-red-600 hover:bg-red-500 text-white' 
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }
            `}
          >
            <span>View</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onDismiss}
            aria-label="Dismiss alert"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1C2230] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
