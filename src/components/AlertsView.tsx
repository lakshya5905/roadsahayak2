import React, { useState } from 'react';
import { 
  Bell, 
  MapPin, 
  Clock, 
  Navigation, 
  ShieldAlert, 
  Users, 
  Filter,
  CheckCircle2,
  ChevronRight,
  Flame,
  Wrench,
  Radio
} from 'lucide-react';
import { Incident } from '../types';
import { INCIDENT_CONFIGS, calculateDistanceKm, formatDistance, formatTimeAgo } from '../lib/location';
import { Card } from './ui/Card';
import { StatusBadge } from './ui/StatusBadge';
import { Button } from './ui/Button';

export interface AlertsViewProps {
  incidents: Incident[];
  userLat: number | null;
  userLng: number | null;
  onSelectIncident: (incident: Incident) => void;
  onOpenSos: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  incidents,
  userLat,
  userLng,
  onSelectIncident,
  onOpenSos
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'recency'>('distance');

  // Active incidents
  const activeIncidents = incidents.filter((i) => i.status === 'active');

  // Attach calculated distance
  const incidentsWithDistance = activeIncidents.map((inc) => {
    const dist =
      userLat && userLng && inc.location
        ? calculateDistanceKm(userLat, userLng, inc.location.lat, inc.location.lng)
        : 0;
    return { ...inc, calculatedDist: dist };
  });

  // Filter
  const filtered = incidentsWithDistance.filter((inc) => {
    if (filterType !== 'all' && inc.type !== filterType) return false;
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'distance') {
      return a.calculatedDist - b.calculatedDist;
    } else {
      const timeA = new Date(a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt || 0).getTime();
      return timeB - timeA;
    }
  });

  return (
    <div className="flex-1 bg-[#0B0E14] p-4 overflow-y-auto custom-scrollbar pb-8 flex flex-col select-none">
      {/* Top Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#262E40] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Nearby Road Radar Alerts</h2>
            <p className="text-xs text-slate-400">
              {sorted.length} active incidents on your highway corridor
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSos}
          className="h-9 px-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Report SOS</span>
        </button>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="mt-3 flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-sm'
                : 'bg-[#141822] text-slate-400 border-[#262E40] hover:text-slate-200'
            }`}
          >
            All ({activeIncidents.length})
          </button>
          <button
            onClick={() => setFilterType('accident')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              filterType === 'accident'
                ? 'bg-red-600 text-white border-red-500 font-bold'
                : 'bg-[#141822] text-slate-400 border-[#262E40] hover:text-slate-200'
            }`}
          >
            🚨 Emergency
          </button>
          <button
            onClick={() => setFilterType('breakdown')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              filterType === 'breakdown'
                ? 'bg-[#1C2230] text-amber-400 border-amber-500 font-bold'
                : 'bg-[#141822] text-slate-400 border-[#262E40] hover:text-slate-200'
            }`}
          >
            🔧 Breakdowns
          </button>
        </div>

        {/* Sorting buttons */}
        <div className="flex items-center gap-1 bg-[#141822] border border-[#262E40] rounded-lg p-1 text-[11px] shrink-0">
          <button
            onClick={() => setSortBy('distance')}
            className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
              sortBy === 'distance' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Nearest
          </button>
          <button
            onClick={() => setSortBy('recency')}
            className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
              sortBy === 'recency' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Recent
          </button>
        </div>
      </div>

      {/* Alert Feed List */}
      <div className="mt-3 space-y-2.5 flex-1">
        {sorted.length === 0 ? (
          <div className="py-12 px-4 text-center bg-[#141822] border border-[#262E40] rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Highway Corridor Clear</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              No active SOS or breakdown requests reported within your current radar perimeter.
            </p>
          </div>
        ) : (
          sorted.map((incident) => {
            const config = INCIDENT_CONFIGS[incident.type] || INCIDENT_CONFIGS.other;
            const isCritical = incident.severity === 'critical' || incident.type === 'accident' || incident.type === 'medical';

            return (
              <Card
                key={incident.id}
                variant={isCritical ? 'emergency' : 'amber'}
                className="p-3.5 cursor-pointer hover:border-slate-500 transition-all active:scale-[0.99]"
                onClick={() => onSelectIncident(incident)}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Incident Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                        isCritical
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      <span className="text-lg">
                        {incident.type === 'accident'
                          ? '🚨'
                          : incident.type === 'breakdown'
                          ? '🔧'
                          : incident.type === 'fuel'
                          ? '⛽'
                          : incident.type === 'medical'
                          ? '🚑'
                          : incident.type === 'flat_tire'
                          ? '🛞'
                          : '⚠️'}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge
                          status={isCritical ? 'critical' : 'assistance'}
                          label={config.label}
                          size="sm"
                          pulse={isCritical}
                        />
                        <span className="text-[11px] font-bold text-slate-300 bg-[#1C2230] border border-[#262E40] px-2 py-0.5 rounded-md">
                          {formatDistance(incident.calculatedDist)}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-100 mt-1 truncate">
                        {incident.address || 'Highway Corridor Location'}
                      </p>

                      {incident.description && (
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {incident.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {formatTimeAgo(incident.createdAt)}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      <Users className="w-3 h-3" />
                      <span>{incident.respondersCount} assisting</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Hint */}
                <div className="mt-3 pt-2.5 border-t border-[#1E2533] flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="text-[11px] text-slate-400">
                    Reported by {incident.reporterName || 'Citizen Motorist'}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform">
                    <span>Respond / View Route</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
