import React, { useState, useEffect, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { auth, db, logOut, updateLiveLocation, updateUserProfile } from './lib/firebase';
import { UserProfile, Incident, LiveLocation, TabType, ActiveMission } from './types';
import { reverseGeocode, calculateDistanceKm } from './lib/location';
import { getSampleIncidents, getSampleLiveHelpers } from './lib/mockData';

// Components
import { PhoneFrame } from './components/PhoneFrame';
import { BottomNav } from './components/BottomNav';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingModal } from './components/OnboardingModal';
import { TopLocationBar } from './components/TopLocationBar';
import { ActiveMissionHud } from './components/ActiveMissionHud';
import { MapView } from './components/MapView';
import { SosForm } from './components/SosForm';
import { AlertsView } from './components/AlertsView';
import { ProfileView } from './components/ProfileView';
import { IncidentDetailSheet } from './components/IncidentDetailSheet';
import { NotificationToast } from './components/NotificationToast';

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<TabType>('map');

  // Location state (Default: 16.494759, 80.499159)
  const [userLat, setUserLat] = useState<number | null>(16.494759);
  const [userLng, setUserLng] = useState<number | null>(80.499159);
  const [userAddress, setUserAddress] = useState<string>('Amaravati Highway Corridor (16.4948, 80.4992)');
  const [locationStatus, setLocationStatus] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isBroadcastingLocation, setIsBroadcastingLocation] = useState(true);

  // Incidents & Helpers Realtime state
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [localIncidents, setLocalIncidents] = useState<Incident[]>([]);
  const [liveHelpers, setLiveHelpers] = useState<LiveLocation[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Active Rescue Mission State (Persisted)
  const [activeMission, setActiveMission] = useState<ActiveMission | null>(() => {
    try {
      const saved = localStorage.getItem('road_sahayak_active_mission');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Toast Notification state
  const [toastIncident, setToastIncident] = useState<Incident | null>(null);
  const prevIncidentIdsRef = useRef<Set<string>>(new Set());

  // Location watcher ref
  const watchIdRef = useRef<number | null>(null);

  // Save active mission to localStorage
  useEffect(() => {
    try {
      if (activeMission) {
        localStorage.setItem('road_sahayak_active_mission', JSON.stringify(activeMission));
      } else {
        localStorage.removeItem('road_sahayak_active_mission');
      }
    } catch (e) {
      console.warn('Could not persist active mission:', e);
    }
  }, [activeMission]);

  // 1. Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u);
      if (u) {
        setIsDemoUser(false);
        // Fetch or create user profile
        try {
          const userRef = doc(db, 'users', u.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const profile = snap.data() as UserProfile;
            setUserProfile(profile);
            // Prompt onboarding if phone is missing
            if (!profile.phone && !profile.vehicleType) {
              setShowOnboarding(true);
            }
          } else {
            const newProf: UserProfile = {
              uid: u.uid,
              displayName: u.displayName || 'Sahayak User',
              email: u.email || '',
              photoURL: u.photoURL || '',
              createdAt: new Date().toISOString(),
              karmaPoints: 50
            };
            setUserProfile(newProf);
            setShowOnboarding(true);
          }
        } catch (err) {
          console.warn('Could not fetch Firestore user profile, setting fallback session profile:', err);
          const fallbackProf: UserProfile = {
            uid: u.uid,
            displayName: u.displayName || 'Sahayak User',
            email: u.email || '',
            photoURL: u.photoURL || '',
            createdAt: new Date().toISOString(),
            karmaPoints: 50
          };
          setUserProfile(fallbackProf);
        }
      } else {
        if (!isDemoUser) {
          setUserProfile(null);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoUser]);

  // Demo Sign In fallback
  const handleDemoSignIn = () => {
    const demoProf: UserProfile = {
      uid: 'demo-user-123',
      displayName: 'Sahayak First Responder',
      email: 'helper.demo@roadsahayak.org',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      phone: '+91 98765 00000',
      vehicleType: 'Car',
      createdAt: new Date().toISOString(),
      karmaPoints: 120
    };
    setUserProfile(demoProf);
    setIsDemoUser(true);
    setAuthLoading(false);
  };

  // 2. Continuous Location Watcher (watchPosition)
  const startLocationWatcher = () => {
    if (!('geolocation' in navigator)) {
      setLocationStatus('denied');
      setLocationError('Geolocation API is not supported in this browser.');
      return;
    }

    setLocationStatus('pending');

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const heading = pos.coords.heading || 0;
        const speed = pos.coords.speed || 0;

        setUserLat(lat);
        setUserLng(lng);
        setLocationStatus('granted');
        setLocationError(null);

        // Reverse geocode
        const addr = await reverseGeocode(lat, lng);
        setUserAddress(addr);

        // Update live location in Firestore if authenticated & broadcasting enabled
        if (userProfile && isBroadcastingLocation && !isDemoUser) {
          updateLiveLocation(
            userProfile.uid,
            userProfile.displayName,
            userProfile.photoURL,
            lat,
            lng,
            heading,
            speed
          );
        }
      },
      (err) => {
        console.warn('Geolocation watch position error:', err);
        setLocationStatus('denied');
        setLocationError(err.message || 'Location permission denied or unavailable.');
        
        // Fallback default coordinates (16.494759, 80.499159) if denied
        if (userLat === null) {
          setUserLat(16.494759);
          setUserLng(80.499159);
          setUserAddress('Amaravati Highway Corridor (16.4948, 80.4992)');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000
      }
    );
  };

  useEffect(() => {
    if (userProfile) {
      startLocationWatcher();
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [userProfile, isBroadcastingLocation]);

  // 3. Realtime Snapshot Listeners for Incidents & Helpers
  useEffect(() => {
    const lat = userLat ?? 16.494759;
    const lng = userLng ?? 80.499159;

    // Load initial seed sample data so map is instantly populated
    const sampleIncs = getSampleIncidents(lat, lng);
    const sampleHelpers = getSampleLiveHelpers(lat, lng);

    const mergeWithLocalAndSample = (firestoreIncs: Incident[]) => {
      const combinedMap = new Map<string, Incident>();
      sampleIncs.forEach((i) => combinedMap.set(i.id, i));
      localIncidents.forEach((i) => combinedMap.set(i.id, i));
      firestoreIncs.forEach((i) => combinedMap.set(i.id, i));
      return Array.from(combinedMap.values());
    };

    // Only attach Firestore listeners when authenticated with Firebase Auth
    if (!firebaseUser) {
      setIncidents(mergeWithLocalAndSample([]));
      setLiveHelpers(sampleHelpers);
      return;
    }

    let unsubIncidents: (() => void) | null = null;
    let unsubHelpers: (() => void) | null = null;

    try {
      // Listener for Incidents collection
      const qIncidents = collection(db, 'incidents');
      unsubIncidents = onSnapshot(
        qIncidents,
        (snapshot) => {
          const firestoreIncs: Incident[] = [];
          snapshot.forEach((docSnap) => {
            firestoreIncs.push({ id: docSnap.id, ...docSnap.data() } as Incident);
          });

          const mergedIncidents = mergeWithLocalAndSample(firestoreIncs);
          setIncidents(mergedIncidents);

          // Detect new nearby incident for Toast Notification
          const currentIds = new Set(mergedIncidents.map((i) => i.id));
          if (prevIncidentIdsRef.current.size > 0) {
            const newlyAdded = mergedIncidents.find(
              (i) => !prevIncidentIdsRef.current.has(i.id) && i.status === 'active'
            );
            if (newlyAdded) {
              setToastIncident(newlyAdded);
            }
          }
          prevIncidentIdsRef.current = currentIds;
        },
        (err) => {
          console.warn('Incidents snapshot fallback to local dataset:', err);
          setIncidents(mergeWithLocalAndSample([]));
        }
      );

      // Listener for Live Locations collection
      const qHelpers = collection(db, 'liveLocations');
      unsubHelpers = onSnapshot(
        qHelpers,
        (snapshot) => {
          const helpersList: LiveLocation[] = [];
          snapshot.forEach((docSnap) => {
            helpersList.push(docSnap.data() as LiveLocation);
          });

          const combinedHelpersMap = new Map<string, LiveLocation>();
          sampleHelpers.forEach((h) => combinedHelpersMap.set(h.uid, h));
          helpersList.forEach((h) => combinedHelpersMap.set(h.uid, h));

          setLiveHelpers(Array.from(combinedHelpersMap.values()));
        },
        (err) => {
          console.warn('Helpers snapshot fallback:', err);
          setLiveHelpers(sampleHelpers);
        }
      );
    } catch (err) {
      console.warn('Firestore snapshot setup fallback:', err);
      setIncidents(mergeWithLocalAndSample([]));
      setLiveHelpers(sampleHelpers);
    }

    return () => {
      if (unsubIncidents) unsubIncidents();
      if (unsubHelpers) unsubHelpers();
    };
  }, [userLat, userLng, firebaseUser, localIncidents]);

  // Onboarding Save handler
  const handleSaveOnboarding = async (phone: string, vehicleType: string) => {
    if (userProfile) {
      const updated = { ...userProfile, phone, vehicleType };
      setUserProfile(updated);
      if (!isDemoUser) {
        await updateUserProfile(userProfile.uid, { phone, vehicleType });
      }
    }
    setShowOnboarding(false);
  };

  // Active Mission Handlers
  const handleCommitMission = (incident: Incident) => {
    const dist = userLat && userLng && incident.location
      ? calculateDistanceKm(userLat, userLng, incident.location.lat, incident.location.lng)
      : 1.0;

    const mission: ActiveMission = {
      incidentId: incident.id,
      incidentTitle: `${incident.type.toUpperCase()} Assistance`,
      category: incident.type,
      severity: incident.severity || 'medium',
      targetLat: incident.location.lat,
      targetLng: incident.location.lng,
      targetAddress: incident.address || 'Highway Corridor Location',
      victimName: incident.reporterName,
      victimPhone: incident.reporterPhone,
      status: 'committed',
      startTime: new Date().toISOString(),
      distanceKm: dist
    };

    setActiveMission(mission);
    setSelectedIncident(null);
  };

  const handleNavigateMission = () => {
    if (!activeMission) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${activeMission.targetLat},${activeMission.targetLng}`;
    window.open(url, '_blank');
  };

  const handleArrivedMission = () => {
    if (!activeMission) return;
    setActiveMission({ ...activeMission, status: 'arrived' });
  };

  const handleResolveMission = () => {
    if (!activeMission) return;
    if (userProfile) {
      const currentKarma = userProfile.karmaPoints || 50;
      const currentAssists = userProfile.assistsCompleted || 0;
      setUserProfile({
        ...userProfile,
        karmaPoints: currentKarma + 50,
        assistsCompleted: currentAssists + 1
      });
    }
    setActiveMission(null);
  };

  const handleCancelMission = () => {
    setActiveMission(null);
  };

  // SOS Creation Success Handler
  const handleSosCreated = (createdIncident?: Incident) => {
    if (createdIncident) {
      setLocalIncidents((prev) => [createdIncident, ...prev.filter((i) => i.id !== createdIncident.id)]);
      setIncidents((prev) => [createdIncident, ...prev.filter((i) => i.id !== createdIncident.id)]);
    }
    setActiveTab('map');
  };

  // Incident Status Update Handler
  const handleIncidentStatusChange = (incidentId: string, status: 'resolved' | 'cancelled') => {
    setLocalIncidents((prev) =>
      prev.map((i) => (i.id === incidentId ? { ...i, status } : i))
    );
    setIncidents((prev) =>
      prev.map((i) => (i.id === incidentId ? { ...i, status } : i))
    );
  };

  // Sign out handler (supports both Firebase Auth and Demo Preview)
  const handleSignOut = async () => {
    await logOut();
    setIsDemoUser(false);
    setUserProfile(null);
    setActiveTab('map');
  };

  // Filter user's reported incidents for profile tab
  const myIncidents = incidents.filter((i) => i.reporterUid === userProfile?.uid);

  // Active alerts count for bottom nav badge
  const activeAlertsCount = incidents.filter((i) => i.status === 'active').length;

  return (
    <PhoneFrame>
      {/* Auth Check */}
      {authLoading ? (
        <div className="flex-1 bg-[#0B0E14] flex flex-col items-center justify-center p-6 text-slate-300">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4 shadow-xl" />
          <p className="text-xs font-bold tracking-wider uppercase text-slate-400">
            Connecting Road Sahayak...
          </p>
        </div>
      ) : !userProfile ? (
        <AuthScreen onDemoSignIn={handleDemoSignIn} />
      ) : (
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[#0B0E14]">
          {/* Tactical Top Location & Radar Zone Header */}
          <TopLocationBar
            address={userAddress}
            locationStatus={locationStatus}
            nearbyCount={liveHelpers.length}
            onRetryLocation={startLocationWatcher}
          />

          {/* In-App Toast Notification */}
          {toastIncident && (
            <NotificationToast
              incident={toastIncident}
              userLat={userLat}
              userLng={userLng}
              onView={() => {
                setSelectedIncident(toastIncident);
                setToastIncident(null);
              }}
              onDismiss={() => setToastIncident(null)}
            />
          )}

          {/* Core Tab Views */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {activeTab === 'map' && (
              <MapView
                userLat={userLat}
                userLng={userLng}
                incidents={incidents}
                liveHelpers={liveHelpers}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
                onOpenSosForm={() => setActiveTab('sos')}
              />
            )}

            {activeTab === 'sos' && (
              <SosForm
                currentUser={userProfile}
                userLat={userLat}
                userLng={userLng}
                userAddress={userAddress}
                onSuccess={handleSosCreated}
                onCancel={() => setActiveTab('map')}
              />
            )}

            {activeTab === 'alerts' && (
              <AlertsView
                incidents={incidents}
                userLat={userLat}
                userLng={userLng}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
                onOpenSos={() => setActiveTab('sos')}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                userProfile={userProfile}
                myIncidents={myIncidents}
                isBroadcastingLocation={isBroadcastingLocation}
                onToggleLocationBroadcast={() => setIsBroadcastingLocation((prev) => !prev)}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
                onRefreshProfile={(updates) => {
                  if (updates && userProfile) {
                    setUserProfile({ ...userProfile, ...updates });
                  }
                }}
                onSignOut={handleSignOut}
              />
            )}
          </div>

          {/* Persistent Active Mission HUD (Rendered when responder commits) */}
          {activeMission && (
            <ActiveMissionHud
              mission={activeMission}
              onNavigate={handleNavigateMission}
              onArrived={handleArrivedMission}
              onResolve={handleResolveMission}
              onCancel={handleCancelMission}
              onCallVictim={
                activeMission.victimPhone
                  ? () => window.open(`tel:${activeMission.victimPhone}`)
                  : undefined
              }
            />
          )}

          {/* Bottom Sheet Incident Detail Modal */}
          {selectedIncident && (
            <IncidentDetailSheet
              incident={selectedIncident}
              currentUser={userProfile}
              userLat={userLat}
              userLng={userLng}
              onClose={() => setSelectedIncident(null)}
              onCommitMission={handleCommitMission}
              onStatusChange={handleIncidentStatusChange}
            />
          )}

          {/* Post-Login Onboarding Modal */}
          {showOnboarding && userProfile && (
            <OnboardingModal
              userProfile={userProfile}
              onSave={handleSaveOnboarding}
              onSkip={() => setShowOnboarding(false)}
            />
          )}

          {/* Bottom Nav Bar */}
          <BottomNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeAlertsCount={activeAlertsCount}
            hasActiveMission={!!activeMission}
          />
        </div>
      )}
    </PhoneFrame>
  );
}
