import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Camera, 
  X, 
  ShieldAlert, 
  PhoneCall, 
  Send, 
  Radio, 
  CheckCircle2, 
  AlertCircle,
  Wrench,
  Fuel,
  Activity,
  Car
} from 'lucide-react';
import { Incident, IncidentType, UserProfile } from '../types';
import { INCIDENT_CONFIGS } from '../lib/location';
import { createIncident } from '../lib/firebase';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { StatusBadge } from './ui/StatusBadge';

export interface SosFormProps {
  currentUser: UserProfile | null;
  userLat: number | null;
  userLng: number | null;
  userAddress: string;
  onSuccess: (createdIncident?: Incident) => void;
  onCancel: () => void;
}

type HelpMode = 'emergency' | 'assistance';

export const SosForm: React.FC<SosFormProps> = ({
  currentUser,
  userLat,
  userLng,
  userAddress,
  onSuccess,
  onCancel
}) => {
  // Distinction: Critical Emergency vs Non-Urgent Road Assistance
  const [helpMode, setHelpMode] = useState<HelpMode>('emergency');
  const [selectedType, setSelectedType] = useState<IncidentType>('accident');
  const [description, setDescription] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('critical');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1-Tap Emergency SOS Trigger with 5-second accidental activation cancellation guard
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  // Synchronize default severity with help mode
  const handleModeChange = (mode: HelpMode) => {
    setHelpMode(mode);
    if (mode === 'emergency') {
      setSelectedType('accident');
      setSeverity('critical');
    } else {
      setSelectedType('breakdown');
      setSeverity('medium');
    }
  };

  // Cancel any active emergency countdown
  const cancelCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
  };

  // Immediate 1-Tap Instant Emergency SOS Broadcast
  const triggerInstantEmergency = () => {
    if (!currentUser) {
      setErrorMsg('Please sign in to broadcast emergency SOS.');
      return;
    }
    if (!userLat || !userLng) {
      setErrorMsg('Location coordinates are required for GPS radar dispatch.');
      return;
    }

    setCountdown(5);
    countdownIntervalRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          executeSubmission('accident', 'critical', 'URGENT 1-TAP EMERGENCY SOS BROADCAST');
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Photo size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUrl(reader.result as string);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const executeSubmission = async (
    typeToSubmit: IncidentType,
    sevToSubmit: 'low' | 'medium' | 'high' | 'critical',
    descToSubmit: string
  ) => {
    if (!currentUser || !userLat || !userLng) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const incidentPayload = {
        reporterUid: currentUser.uid,
        reporterName: currentUser.displayName || 'Highway Motorist',
        reporterPhoto: currentUser.photoURL || '',
        reporterPhone: currentUser.phone || '',
        type: typeToSubmit,
        description: descToSubmit.trim(),
        photoURL: photoDataUrl || '',
        location: {
          lat: userLat,
          lng: userLng
        },
        address: userAddress || 'Highway Corridor Coordinates',
        status: 'active' as const,
        severity: sevToSubmit
      };

      const docId = await createIncident(incidentPayload);

      onSuccess({
        id: docId,
        ...incidentPayload,
        createdAt: new Date().toISOString(),
        respondersCount: 0
      });
    } catch (err: any) {
      console.error('Error broadcasting SOS:', err);
      setErrorMsg(err.message || 'Failed to dispatch SOS. Please check connectivity.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAssistance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMsg('You must be signed in to request assistance.');
      return;
    }
    if (!userLat || !userLng) {
      setErrorMsg('Location access is required to attach incident coordinates.');
      return;
    }

    await executeSubmission(selectedType, severity, description);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="flex-1 bg-[#0B0E14] p-4 overflow-y-auto custom-scrollbar pb-8 flex flex-col select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#262E40] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Highway Help Dispatch</h2>
            <p className="text-xs text-slate-400">Broadcast to nearby Sahayak community & responders</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          aria-label="Close form"
          className="text-slate-400 hover:text-white p-2 rounded-xl bg-[#141822] border border-[#262E40] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Switcher: Emergency vs Road Assistance */}
      <div className="grid grid-cols-2 gap-2 mt-3.5 p-1 bg-[#141822] border border-[#262E40] rounded-xl shrink-0">
        <button
          type="button"
          onClick={() => handleModeChange('emergency')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            helpMode === 'emergency'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Critical Emergency</span>
        </button>

        <button
          type="button"
          onClick={() => handleModeChange('assistance')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            helpMode === 'assistance'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Road Assistance</span>
        </button>
      </div>

      {errorMsg && (
        <div className="mt-3 p-3 bg-red-950/80 border border-red-800/80 rounded-xl text-xs text-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="flex-1">{errorMsg}</span>
        </div>
      )}

      {/* Emergency Hotline Quick Bar */}
      <div className="mt-3 px-3 py-2 bg-[#141822] border border-[#262E40] rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          <PhoneCall className="w-3.5 h-3.5 text-red-400" />
          <span className="text-[11px]">Direct Helplines:</span>
        </div>
        <div className="flex items-center gap-1.5">
          <a
            href="tel:112"
            className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded-md font-bold text-[11px] transition-colors"
          >
            112 All-India
          </a>
          <a
            href="tel:1033"
            className="px-2 py-0.5 bg-[#1C2230] hover:bg-[#252D3D] border border-[#262E40] text-amber-400 rounded-md font-bold text-[11px] transition-colors"
          >
            1033 NHAI
          </a>
        </div>
      </div>

      {/* MODE 1: CRITICAL EMERGENCY FLOW */}
      {helpMode === 'emergency' && (
        <div className="mt-4 space-y-4 flex-1 flex flex-col justify-between">
          <Card variant="emergency" className="p-4 text-center">
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-wide">
              High-Priority Emergency Broadcast
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Use for life-threatening collisions, severe injuries, or hazardous fire situations. Dispatches sirens to all Sahayaks within 25km.
            </p>

            {countdown !== null ? (
              <div className="mt-4 p-4 bg-red-950/90 border border-red-500 rounded-2xl animate-pulse">
                <p className="text-xs font-bold text-red-300 uppercase">Broadcasting SOS in...</p>
                <div className="text-4xl font-black text-white my-2">{countdown}s</div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={cancelCountdown}
                  className="w-full text-xs font-bold"
                >
                  Cancel Accidental Trigger
                </Button>
              </div>
            ) : (
              <div className="mt-5">
                <button
                  onClick={triggerInstantEmergency}
                  disabled={isSubmitting}
                  className="w-full h-16 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black text-base rounded-2xl shadow-xl shadow-red-600/40 flex items-center justify-center gap-2.5 transition-all duration-150 active:scale-[0.98] cursor-pointer"
                >
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                  <span>{isSubmitting ? 'DISPATCHING...' : 'TRIGGER 1-TAP EMERGENCY SOS'}</span>
                </button>
                <p className="text-[10px] text-slate-400 mt-2">
                  5-second cancellation grace period included against accidental taps.
                </p>
              </div>
            )}
          </Card>

          {/* Quick Location Badge */}
          <div className="p-3 bg-[#141822] border border-[#262E40] rounded-xl flex items-center gap-2 text-xs text-slate-300">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate font-medium">GPS: {userAddress || 'Locating Highway...'}</span>
          </div>
        </div>
      )}

      {/* MODE 2: ROAD ASSISTANCE FLOW */}
      {helpMode === 'assistance' && (
        <form onSubmit={handleSubmitAssistance} className="mt-4 space-y-4">
          {/* Incident Type Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Assistance Type Needed
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(INCIDENT_CONFIGS).map((item) => {
                const isSelected = selectedType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedType(item.id)}
                    className={`p-3 rounded-xl border text-left transition-all duration-150 flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#1C2230] border-amber-500 text-amber-400 ring-1 ring-amber-500/30'
                        : 'bg-[#141822] border-[#262E40] text-slate-300 hover:border-[#3B455E]'
                    }`}
                  >
                    <span className="text-xl">
                      {item.id === 'accident'
                        ? '🚨'
                        : item.id === 'breakdown'
                        ? '🔧'
                        : item.id === 'fuel'
                        ? '⛽'
                        : item.id === 'medical'
                        ? '🚑'
                        : item.id === 'flat_tire'
                        ? '🛞'
                        : '⚠️'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold block truncate">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location details */}
          <div className="p-3 bg-[#141822] border border-[#262E40] rounded-xl flex items-center gap-2 text-xs text-slate-300">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Assistance Location</span>
              <span className="font-semibold text-slate-100 truncate block">
                {userAddress || 'Highway Corridor Coordinates'}
              </span>
            </div>
          </div>

          {/* Description Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Details (Vehicle Model, Spare Parts, Lane)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. White Creta, left shoulder lane near toll gate, need 5L diesel..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1C2230] border border-[#262E40] focus:border-amber-500 text-slate-100 placeholder:text-slate-500 rounded-xl p-3 text-xs outline-none transition-colors"
            />
          </div>

          {/* Photo attachment (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Scene Photo (Optional)
            </label>
            {photoDataUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-[#262E40] h-28 bg-[#141822]">
                <img src={photoDataUrl} alt="Scene preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotoDataUrl(null)}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg shadow-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="border border-dashed border-[#262E40] hover:border-amber-500/60 rounded-xl p-3 flex items-center justify-center gap-2 bg-[#141822] text-slate-400 hover:text-slate-200 cursor-pointer transition-colors text-xs font-medium">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Take Photo / Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Broadcast Assistance Request
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
