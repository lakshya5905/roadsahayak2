import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, Radio, Shield } from 'lucide-react';

export interface PhoneFrameProps {
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 selection:bg-amber-500 selection:text-slate-950 font-sans antialiased relative overflow-hidden">
      {/* Desktop Background Ambient Accent */}
      <div 
        className="hidden md:block absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.04) 0%, transparent 60%), linear-gradient(#141822 1px, transparent 1px), linear-gradient(to right, #141822 1px, transparent 1px)',
          backgroundSize: '100% 100%, 32px 32px, 32px 32px'
        }}
      />

      {/* Desktop Top Brand Badge */}
      <div className="hidden lg:flex items-center gap-2 mb-3 text-xs text-slate-400 font-semibold tracking-wider uppercase select-none z-10">
        <Shield className="w-4 h-4 text-amber-500" />
        <span>Road Sahayak &bull; Citizen Highway Emergency Network</span>
        <span className="px-2 py-0.5 bg-[#141822] border border-[#262E40] rounded-full text-[10px] text-emerald-400 font-mono">
          RADAR ACTIVE
        </span>
      </div>

      {/* Phone Viewport Frame Container */}
      <div 
        className="w-full max-w-[425px] h-[100dvh] sm:h-[860px] bg-[#0B0E14] sm:rounded-[44px] shadow-2xl shadow-black/90 border-0 sm:border-[8px] border-[#1C2230] sm:ring-1 sm:ring-[#262E40] flex flex-col overflow-hidden relative z-20"
      >
        {/* Phone Notch & Status Bar */}
        <header className="bg-[#0B0E14]/95 backdrop-blur-md text-slate-300 px-6 pt-3 pb-2 flex items-center justify-between text-xs font-semibold select-none z-50 shrink-0 border-b border-[#1E2533]">
          {/* System Time */}
          <span className="tracking-tight text-slate-200 font-mono text-[11px] font-bold">
            {timeStr || '12:00'}
          </span>
          
          {/* Dynamic Island / Hardware notch badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#141822] rounded-full border border-[#262E40] shadow-inner">
            <Radio className="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
            <span className="text-[10px] text-slate-200 uppercase tracking-widest font-black">
              SAHAYAK 5G
            </span>
          </div>

          {/* Network & Battery Telemetry */}
          <div className="flex items-center gap-2">
            <Signal className="w-3.5 h-3.5 text-slate-300" />
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-400 font-mono">98%</span>
              <Battery className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </header>

        {/* Main App Screen Canvas */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-[#0B0E14]">
          {children}
        </main>

        {/* Bottom Home Indicator Bar */}
        <footer className="bg-[#0B0E14] pt-1.5 pb-2 flex justify-center shrink-0 border-t border-[#141822] select-none z-50">
          <div className="w-28 h-1 bg-slate-600/70 rounded-full" />
        </footer>
      </div>

      {/* Desktop Footer Notice */}
      <div className="hidden lg:block text-center mt-3 text-[11px] text-slate-400 select-none z-10">
        Road Sahayak Web Cockpit &bull; GPS Radar Connected &bull; Emergency Hotline 112 Ready
      </div>
    </div>
  );
};
