import React from 'react';
import { Radio, AlertTriangle, Bell, User } from 'lucide-react';
import { TabType } from '../types';

export interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  activeAlertsCount: number;
  hasActiveMission?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  activeAlertsCount,
  hasActiveMission = false
}) => {
  return (
    <nav 
      aria-label="Application Navigation"
      className="bg-[#141822] border-t border-[#262E40] px-4 py-2 flex items-center justify-around z-40 relative shadow-2xl shrink-0 select-none"
    >
      {/* Live Radar Tab */}
      <button
        onClick={() => setActiveTab('map')}
        aria-label="Live Radar Map"
        className={`flex-1 py-1 flex flex-col items-center gap-1 transition-all duration-150 cursor-pointer ${
          activeTab === 'map' ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Radio className={`w-5 h-5 ${activeTab === 'map' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
        <span className="text-[11px] tracking-tight">Radar</span>
      </button>

      {/* SOS / Report Tab (Prominent central emergency beacon) */}
      <div className="relative -top-4 px-2">
        <button
          onClick={() => setActiveTab('sos')}
          aria-label="Urgent SOS Emergency and Road Assistance"
          className={`w-13 h-13 rounded-2xl flex flex-col items-center justify-center shadow-xl transition-all duration-150 active:scale-95 border-2 cursor-pointer ${
            activeTab === 'sos'
              ? 'bg-red-600 border-amber-400 text-white shadow-red-600/50 ring-4 ring-red-600/20 scale-105'
              : 'bg-red-600 hover:bg-red-500 border-[#141822] text-white shadow-red-600/30'
          }`}
        >
          <AlertTriangle className="w-5 h-5 drop-shadow-md stroke-[2.5]" />
          <span className="text-[10px] font-black tracking-wider uppercase drop-shadow-md">SOS</span>
        </button>
      </div>

      {/* Alerts Feed Tab */}
      <button
        onClick={() => setActiveTab('alerts')}
        aria-label={`Nearby Alerts, ${activeAlertsCount} active alerts`}
        className={`flex-1 py-1 flex flex-col items-center gap-1 transition-all duration-150 relative cursor-pointer ${
          activeTab === 'alerts' ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <Bell className={`w-5 h-5 ${activeTab === 'alerts' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          {activeAlertsCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-extrabold px-1 min-w-[16px] h-4 rounded-full flex items-center justify-center border border-[#141822] shadow-sm">
              {activeAlertsCount > 9 ? '9+' : activeAlertsCount}
            </span>
          )}
        </div>
        <span className="text-[11px] tracking-tight">Alerts</span>
      </button>

      {/* Profile & Trust Tab */}
      <button
        onClick={() => setActiveTab('profile')}
        aria-label="Sahayak Profile & Trust"
        className={`flex-1 py-1 flex flex-col items-center gap-1 transition-all duration-150 relative cursor-pointer ${
          activeTab === 'profile' ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <User className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          {hasActiveMission && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </div>
        <span className="text-[11px] tracking-tight">Profile</span>
      </button>
    </nav>
  );
};
