import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Car, 
  LogOut, 
  Award, 
  MapPin, 
  History, 
  ShieldCheck, 
  Edit3, 
  Save, 
  Radio, 
  CheckCircle2,
  Clock,
  Sparkles,
  Shield
} from 'lucide-react';
import { UserProfile, Incident } from '../types';
import { logOut, updateUserProfile } from '../lib/firebase';
import { INCIDENT_CONFIGS, formatTimeAgo } from '../lib/location';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { StatusBadge } from './ui/StatusBadge';

export interface ProfileViewProps {
  userProfile: UserProfile | null;
  myIncidents: Incident[];
  isBroadcastingLocation: boolean;
  onToggleLocationBroadcast: () => void;
  onSelectIncident: (incident: Incident) => void;
  onRefreshProfile: (updates?: Partial<UserProfile>) => void;
  onSignOut?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  myIncidents,
  isBroadcastingLocation,
  onToggleLocationBroadcast,
  onSelectIncident,
  onRefreshProfile,
  onSignOut
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [vehicleType, setVehicleType] = useState(userProfile?.vehicleType || 'Car');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'settings'>('history');

  const handleSaveProfile = async () => {
    if (!userProfile) return;
    setIsSaving(true);
    try {
      await updateUserProfile(userProfile.uid, {
        phone,
        vehicleType
      });
      setIsEditing(false);
      onRefreshProfile({ phone, vehicleType });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const activeReports = myIncidents.filter((i) => i.status === 'active');
  const resolvedReports = myIncidents.filter((i) => i.status === 'resolved');
  const karmaPoints = userProfile?.karmaPoints || 50;

  return (
    <div className="flex-1 bg-[#0B0E14] p-4 overflow-y-auto custom-scrollbar pb-8 flex flex-col select-none">
      {/* Top Sahayak Identity Card */}
      <Card variant="elevated" className="p-4 relative overflow-hidden">
        {/* Amber Ambient Glow */}
        <div 
          className="absolute top-0 right-0 w-40 h-40 pointer-events-none opacity-10"
          style={{
            background: 'radial-gradient(circle at 100% 0%, #F59E0B 0%, transparent 70%)'
          }}
        />

        <div className="flex items-center gap-3.5 relative">
          <div className="w-14 h-14 rounded-2xl bg-[#141822] border-2 border-amber-500/40 p-0.5 shadow-xl shrink-0">
            <div className="w-full h-full rounded-[14px] bg-[#1C2230] overflow-hidden flex items-center justify-center">
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt={userProfile.displayName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7 text-amber-400" />
              )}
            </div>
          </div>

          <div className="overflow-hidden flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-bold text-slate-100 truncate">
                {userProfile?.displayName || 'Sahayak Motorist'}
              </h2>
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" title="Verified Sahayak Member" />
            </div>
            <p className="text-xs text-slate-400 truncate">{userProfile?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> {karmaPoints} Karma Score
              </span>
            </div>
          </div>
        </div>

        {/* Tactical Stats Metrics */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#262E40] text-center">
          <div className="bg-[#141822] border border-[#262E40] rounded-xl p-2.5">
            <span className="text-sm font-bold text-slate-100 block font-mono">{myIncidents.length}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">SOS Logged</span>
          </div>
          <div className="bg-[#141822] border border-[#262E40] rounded-xl p-2.5">
            <span className="text-sm font-bold text-emerald-400 block font-mono">{resolvedReports.length}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">Resolved</span>
          </div>
          <div className="bg-[#141822] border border-[#262E40] rounded-xl p-2.5">
            <span className="text-sm font-bold text-amber-400 block font-mono">Tier 1</span>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">Guardian</span>
          </div>
        </div>
      </Card>

      {/* Live Location Radar Telemetry Sharing Bar */}
      <div className="mt-3.5 bg-[#141822] border border-[#262E40] rounded-2xl p-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isBroadcastingLocation
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-[#1C2230] text-slate-500 border-[#262E40]'
            }`}
          >
            <Radio className={`w-5 h-5 ${isBroadcastingLocation ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100">Live Radar Helper Broadcast</h3>
            <p className="text-[11px] text-slate-400">
              {isBroadcastingLocation ? 'Broadcasting live location to highway grid' : 'Location broadcast paused'}
            </p>
          </div>
        </div>

        <button
          onClick={onToggleLocationBroadcast}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isBroadcastingLocation
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
              : 'bg-[#1C2230] hover:bg-[#252D3D] text-slate-300 border border-[#262E40]'
          }`}
        >
          {isBroadcastingLocation ? 'ACTIVE' : 'PAUSED'}
        </button>
      </div>

      {/* Tab Switcher: Incident History vs Profile Config */}
      <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-[#141822] border border-[#262E40] rounded-xl shrink-0">
        <button
          onClick={() => setActiveTab('history')}
          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-[#1C2230] text-amber-400 shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>My SOS History ({myIncidents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-[#1C2230] text-amber-400 shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Profile Settings</span>
        </button>
      </div>

      {/* TAB CONTENT: SOS History */}
      {activeTab === 'history' && (
        <div className="mt-3 space-y-2.5 flex-1">
          {myIncidents.length === 0 ? (
            <div className="py-10 px-4 text-center bg-[#141822] border border-[#262E40] rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-2">
                <History className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-200">No SOS Reports Logged</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Incidents or assistance you report will appear here.
              </p>
            </div>
          ) : (
            myIncidents.map((incident) => {
              const config = INCIDENT_CONFIGS[incident.type] || INCIDENT_CONFIGS.other;
              const isResolved = incident.status === 'resolved';

              return (
                <Card
                  key={incident.id}
                  variant="default"
                  className="p-3 cursor-pointer hover:border-slate-500 transition-all"
                  onClick={() => onSelectIncident(incident)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base">
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
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-100 block truncate">
                          {config.label}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {incident.address || 'Highway Corridor'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <StatusBadge
                        status={isResolved ? 'resolved' : 'critical'}
                        label={isResolved ? 'Resolved' : 'Active SOS'}
                        size="sm"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatTimeAgo(incident.createdAt)}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* TAB CONTENT: Settings & Preferences */}
      {activeTab === 'settings' && (
        <div className="mt-3 space-y-3 flex-1">
          <Card variant="default" className="p-4 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Emergency Contact Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full h-11 bg-[#1C2230] border border-[#262E40] focus:border-amber-500 text-slate-100 rounded-xl px-3 text-xs outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Shared with Sahayak responders when an active mission is in progress.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Registered Highway Vehicle
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full h-11 bg-[#1C2230] border border-[#262E40] focus:border-amber-500 text-slate-100 rounded-xl px-3 text-xs outline-none"
              >
                <option value="Car">Car / Sedan</option>
                <option value="SUV">SUV / 4x4</option>
                <option value="Two Wheeler">Motorcycle / Scooter</option>
                <option value="Commercial">Truck / Commercial Vehicle</option>
                <option value="Auto">Auto Rickshaw / Taxi</option>
              </select>
            </div>

            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={handleSaveProfile}
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile Preferences
            </Button>
          </Card>

          {/* Sign Out Button */}
          <div className="pt-2">
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => (onSignOut ? onSignOut() : logOut())}
              leftIcon={<LogOut className="w-4 h-4 text-red-400" />}
            >
              Sign Out from Device
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
