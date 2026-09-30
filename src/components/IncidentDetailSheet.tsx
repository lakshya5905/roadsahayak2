import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Navigation, 
  Phone, 
  ShieldAlert, 
  CheckCircle, 
  Users, 
  Radio, 
  HandHeart, 
  ShieldCheck,
  AlertTriangle,
  Flame,
  Wrench,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { Incident, UserProfile, Responder } from '../types';
import { INCIDENT_CONFIGS, calculateDistanceKm, formatDistance, formatTimeAgo } from '../lib/location';
import { respondToIncident, resolveIncident, cancelIncident, auth, db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Card } from './ui/Card';
import { StatusBadge } from './ui/StatusBadge';
import { Button } from './ui/Button';

export interface IncidentDetailSheetProps {
  incident: Incident;
  currentUser: UserProfile | null;
  userLat: number | null;
  userLng: number | null;
  onClose: () => void;
  onCommitMission?: (incident: Incident) => void;
  onStatusChange?: (incidentId: string, status: 'resolved' | 'cancelled') => void;
}

export const IncidentDetailSheet: React.FC<IncidentDetailSheetProps> = ({
  incident,
  currentUser,
  userLat,
  userLng,
  onClose,
  onCommitMission,
  onStatusChange
}) => {
  const [responders, setResponders] = useState<Responder[]>([]);
  const [etaInput, setEtaInput] = useState('10 mins');
  const [messageInput, setMessageInput] = useState('');
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [isSubmittingHelp, setIsSubmittingHelp] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const isReporter = currentUser?.uid === incident.reporterUid;
  const isCritical = incident.severity === 'critical' || incident.type === 'accident' || incident.type === 'medical';
  const config = INCIDENT_CONFIGS[incident.type] || INCIDENT_CONFIGS.other;

  // Real-time listener for responders
  useEffect(() => {
    if (
      !auth.currentUser ||
      !incident.id ||
      incident.id.startsWith('mock_') ||
      incident.id.startsWith('local_')
    ) {
      return;
    }

    const respondersRef = collection(db, 'incidents', incident.id, 'responders');
    const unsubscribe = onSnapshot(
      respondersRef,
      (snapshot) => {
        const respList: Responder[] = [];
        snapshot.forEach((doc) => {
          respList.push({ id: doc.id, ...(doc.data() as any) } as Responder & { id: string });
        });
        setResponders(respList);
      },
      (err) => {
        console.warn('Responders snapshot listener fallback:', err);
      }
    );

    return () => unsubscribe();
  }, [incident.id]);

  const hasAlreadyResponded = currentUser
    ? responders.some((r) => r.uid === currentUser.uid)
    : false;

  const distanceKm =
    userLat && userLng && incident.location
      ? calculateDistanceKm(userLat, userLng, incident.location.lat, incident.location.lng)
      : null;

  // Commit assistance & start rescue mission
  const handleCommitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmittingHelp(true);

    const responderData = {
      uid: currentUser.uid,
      displayName: currentUser.displayName || 'Sahayak Helper',
      photoURL: currentUser.photoURL || '',
      phone: currentUser.phone || '',
      vehicleType: currentUser.vehicleType || 'Car',
      status: 'en_route',
      message: messageInput.trim(),
      eta: etaInput
    };

    try {
      await respondToIncident(incident.id, responderData);
      setResponders((prev) => [
        ...prev.filter((r) => r.uid !== currentUser.uid),
        { ...responderData, timestamp: new Date().toISOString() }
      ]);
      setShowRespondModal(false);
      if (onCommitMission) {
        onCommitMission(incident);
      }
    } catch (err) {
      console.error(err);
      if (onCommitMission) {
        onCommitMission(incident);
      }
    } finally {
      setIsSubmittingHelp(false);
    }
  };

  const handleResolve = async () => {
    setActionLoading(true);
    try {
      await resolveIncident(incident.id);
      if (onStatusChange) {
        onStatusChange(incident.id, 'resolved');
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await cancelIncident(incident.id);
      if (onStatusChange) {
        onStatusChange(incident.id, 'cancelled');
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenNavigation = () => {
    if (!incident.location) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${incident.location.lat},${incident.location.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end overflow-hidden">
      {/* Dark backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Bottom Sheet Container */}
      <div className="relative w-full bg-[#141822] border-t border-[#262E40] rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col z-10 select-none">
        {/* Grab Handle */}
        <div className="w-full flex items-center justify-center pt-3 pb-1 cursor-grab">
          <div className="w-10 h-1 rounded-full bg-[#3B455E]" />
        </div>

        {/* Header Title */}
        <div className="px-5 py-3 border-b border-[#1E2533] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <StatusBadge
              status={isCritical ? 'critical' : 'assistance'}
              label={config.label}
              size="md"
              pulse={isCritical}
            />
            {distanceKm !== null && (
              <span className="text-xs font-bold text-slate-200 bg-[#1C2230] border border-[#262E40] px-2 py-0.5 rounded-lg">
                {formatDistance(distanceKm)} away
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1C2230] border border-[#262E40] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sheet Content Scrollable Area */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {/* Location & Time telemetry card */}
          <Card variant="default" className="p-3.5 space-y-2">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Incident Location
                </span>
                <p className="text-xs font-bold text-slate-100 leading-snug">
                  {incident.address || 'Highway Corridor Coordinates'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#262E40] text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Reported {formatTimeAgo(incident.createdAt)}
              </span>
              <span className="text-emerald-400 font-bold">
                {responders.length} Responders En Route
              </span>
            </div>
          </Card>

          {/* Description & Vehicle Details */}
          {incident.description && (
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Situation Notes
              </span>
              <div className="p-3 bg-[#1C2230] border border-[#262E40] rounded-xl text-xs text-slate-200 leading-relaxed">
                {incident.description}
              </div>
            </div>
          )}

          {/* Scene Photo if available */}
          {incident.photoURL && (
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Scene Photo
              </span>
              <div className="rounded-xl overflow-hidden border border-[#262E40] h-40 bg-[#0B0E14]">
                <img
                  src={incident.photoURL}
                  alt="Incident Scene"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Reporter Identity & Contact */}
          <Card variant="default" className="p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                {incident.reporterName ? incident.reporterName.charAt(0) : 'M'}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  Motorist in Need
                </span>
                <span className="text-xs font-bold text-slate-100 truncate block">
                  {incident.reporterName || 'Citizen Motorist'}
                </span>
              </div>
            </div>

            {incident.reporterPhone && (
              <a
                href={`tel:${incident.reporterPhone}`}
                className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-colors shrink-0"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
            )}
          </Card>

          {/* Active Responders List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                COMMUNITY SAHAYAK RESPONDERS ({responders.length})
              </span>
            </div>

            {responders.length === 0 ? (
              <div className="p-3 bg-[#1C2230] border border-[#262E40] rounded-xl text-center text-xs text-slate-400">
                No responders have committed yet. You can be the first to help!
              </div>
            ) : (
              <div className="space-y-2">
                {responders.map((resp) => (
                  <div
                    key={resp.id || resp.uid}
                    className="p-3 bg-[#1C2230] border border-[#262E40] rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                        ⚡
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-100 block truncate">
                          {resp.displayName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ETA: {resp.eta || '10 mins'} &bull; {resp.vehicleType || 'Vehicle'}
                        </span>
                      </div>
                    </div>

                    {resp.phone && (
                      <a
                        href={`tel:${resp.phone}`}
                        className="p-1.5 text-emerald-400 hover:text-white bg-[#141822] border border-[#262E40] rounded-lg transition-colors"
                        title="Call Responder"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions Suite */}
        <div className="p-4 border-t border-[#1E2533] bg-[#141822] space-y-2 shrink-0">
          {/* Navigation CTA */}
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={handleOpenNavigation}
            leftIcon={<Navigation className="w-4 h-4 text-blue-400" />}
          >
            Open GPS Navigation Route
          </Button>

          {/* Responder / Reporter Actions */}
          {isReporter ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={handleCancel}
                isLoading={actionLoading}
              >
                Cancel SOS
              </Button>
              <Button
                variant="live"
                size="md"
                onClick={handleResolve}
                isLoading={actionLoading}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Mark Resolved
              </Button>
            </div>
          ) : (
            <div>
              {hasAlreadyResponded ? (
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => onCommitMission && onCommitMission(incident)}
                  leftIcon={<ShieldAlert className="w-4 h-4" />}
                >
                  Resume Active Rescue Mission
                </Button>
              ) : (
                <Button
                  variant={isCritical ? 'emergency' : 'primary'}
                  size="lg"
                  fullWidth
                  onClick={() => setShowRespondModal(true)}
                  leftIcon={<HandHeart className="w-4 h-4" />}
                >
                  I Can Help — Respond Now
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Respond Commitment Sub-Modal */}
      {showRespondModal && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#141822] border border-[#262E40] rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#262E40]">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Commit to Assistance</h3>
                <p className="text-xs text-slate-400">Share your estimated arrival time</p>
              </div>
              <button
                onClick={() => setShowRespondModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCommitResponse} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Estimated Arrival Time (ETA)
                </label>
                <select
                  value={etaInput}
                  onChange={(e) => setEtaInput(e.target.value)}
                  className="w-full h-11 bg-[#1C2230] border border-[#262E40] text-slate-100 rounded-xl px-3 text-xs outline-none focus:border-amber-500"
                >
                  <option value="5 mins">5 minutes</option>
                  <option value="10 mins">10 minutes</option>
                  <option value="15 mins">15 minutes</option>
                  <option value="25 mins">25 minutes</option>
                  <option value="30+ mins">30+ minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Message for Motorist (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Carrying tow strap & tire pump..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="w-full h-11 bg-[#1C2230] border border-[#262E40] text-slate-100 rounded-xl px-3 text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  isLoading={isSubmittingHelp}
                >
                  Confirm & Start Rescue Mission
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
