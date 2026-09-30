import React, { useState } from 'react';
import { ShieldAlert, Navigation, ShieldCheck, ArrowRight, Radio, AlertCircle } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export interface AuthScreenProps {
  onDemoSignIn: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onDemoSignIn }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Sign in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in window closed. You can retry or explore via Preview Mode.');
      } else {
        setError(err.message || 'Unable to sign in with Google. You can proceed using Preview Mode.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#0B0E14] p-5 flex flex-col justify-between overflow-y-auto custom-scrollbar relative select-none">
      {/* Tactical Ambient Glow Accent */}
      <div 
        className="absolute top-0 inset-x-0 h-64 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle at 50% 0%, #F59E0B 0%, transparent 70%)'
        }}
      />

      {/* Hero Header */}
      <div className="mt-4 text-center relative z-10">
        {/* Brand Emblem */}
        <div className="w-18 h-18 rounded-3xl bg-[#141822] border-2 border-amber-500/40 p-1 mx-auto shadow-2xl shadow-amber-500/10 flex items-center justify-center">
          <div className="w-full h-full rounded-[18px] bg-[#1C2230] flex items-center justify-center">
            <ShieldAlert className="w-9 h-9 text-amber-500" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase font-mono">
            CITIZEN HIGHWAY RADAR
          </span>
        </div>

        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-100 uppercase">
          ROAD <span className="text-amber-500">SAHAYAK</span>
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1 max-w-xs mx-auto leading-relaxed">
          Community-powered roadside assistance, real-time emergency radar, and verified citizen responder network.
        </p>
      </div>

      {/* Value Pillars Cards (Tactical Surface System) */}
      <div className="space-y-2.5 my-4 relative z-10">
        <Card variant="emergency" className="p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-slate-100">1-Tap Emergency Broadcast</h3>
            <p className="text-[11px] text-slate-400 truncate">Alert motorists & 112 services in critical seconds</p>
          </div>
        </Card>

        <Card variant="amber" className="p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Navigation className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-slate-100">Live Sahayak Helper Radar</h3>
            <p className="text-[11px] text-slate-400 truncate">Locate active verified helpers along your highway corridor</p>
          </div>
        </Card>

        <Card variant="live" className="p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-slate-100">Karma-Verified Assistance</h3>
            <p className="text-[11px] text-slate-400 truncate">Breakdowns, punctures, fuel, medical & towing aid</p>
          </div>
        </Card>
      </div>

      {error && (
        <div className="p-3 bg-red-950/80 border border-red-800/60 rounded-xl text-xs text-red-200 flex items-center gap-2 relative z-10 mb-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* Action Suite */}
      <div className="space-y-2.5 relative z-10 pb-2">
        {/* Google Sign-In Primary CTA */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full h-12 px-4 rounded-xl bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-950 font-bold text-xs shadow-xl flex items-center justify-center gap-2.5 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.23v3.15C3.25 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.23C.44 8.15 0 9.98 0 12s.44 3.85 1.23 5.42l4.05-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.23 6.58l4.05 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{loading ? 'Connecting Google...' : 'Sign in with Google'}</span>
        </button>

        {/* Demo Mode Button */}
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={onDemoSignIn}
          rightIcon={<ArrowRight className="w-3.5 h-3.5 text-amber-400" />}
        >
          Explore in Sahayak Radar Preview
        </Button>

        <p className="text-[10px] text-slate-400 text-center leading-normal px-2">
          By connecting, location services will be used to pinpoint emergency coordinates and dispatch community Sahayaks.
        </p>
      </div>
    </div>
  );
};
