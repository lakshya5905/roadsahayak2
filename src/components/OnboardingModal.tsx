import React, { useState } from 'react';
import { Phone, Car, Shield, ArrowRight, X } from 'lucide-react';
import { UserProfile } from '../types';
import { Button } from './ui/Button';

export interface OnboardingModalProps {
  userProfile: UserProfile;
  onSave: (phone: string, vehicleType: string) => Promise<void>;
  onSkip: () => void;
}

const VEHICLE_OPTIONS = [
  { id: 'Car', label: 'Car / Sedan', icon: '🚗' },
  { id: 'Two Wheeler', label: 'Motorcycle / Scooter', icon: '🏍️' },
  { id: 'SUV', label: 'SUV / 4x4', icon: '🚙' },
  { id: 'Commercial', label: 'Truck / Commercial', icon: '🚚' },
  { id: 'Auto', label: 'Auto Rickshaw / Taxi', icon: '🛺' },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  userProfile,
  onSave,
  onSkip
}) => {
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [vehicleType, setVehicleType] = useState(userProfile.vehicleType || 'Car');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(phone, vehicleType);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4 select-none">
      <div className="bg-[#141822] border border-[#262E40] rounded-3xl p-5 w-full max-w-sm shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2533]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Complete Sahayak Profile</h3>
              <p className="text-xs text-slate-400">Help community responders identify your vehicle</p>
            </div>
          </div>
          <button
            onClick={onSkip}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Phone Number Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-400" /> Phone Number (Optional)
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-11 bg-[#1C2230] border border-[#262E40] rounded-xl px-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-amber-500 outline-none transition-colors"
            />
            <p className="text-[10px] text-slate-400 mt-1">Shared strictly with helpers on an active SOS mission.</p>
          </div>

          {/* Vehicle Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-amber-400" /> Primary Highway Vehicle
            </label>
            <div className="grid grid-cols-2 gap-2">
              {VEHICLE_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setVehicleType(item.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                    vehicleType === item.id
                      ? 'bg-[#1C2230] border-amber-500 text-amber-400 ring-1 ring-amber-500/30'
                      : 'bg-[#141822] border-[#262E40] text-slate-300 hover:border-[#3B455E]'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onSkip}
              className="flex-1"
            >
              Skip
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="flex-1"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Get Started
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
