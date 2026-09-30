import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Locate, ShieldAlert, Radio, AlertTriangle, Layers, Crosshair } from 'lucide-react';
import { Incident, LiveLocation } from '../types';
import { INCIDENT_CONFIGS, calculateDistanceKm, formatDistance } from '../lib/location';

export interface MapViewProps {
  userLat: number | null;
  userLng: number | null;
  incidents: Incident[];
  liveHelpers: LiveLocation[];
  onSelectIncident: (incident: Incident) => void;
  onOpenSosForm: () => void;
}

export const MapView: React.FC<MapViewProps> = ({
  userLat,
  userLng,
  incidents,
  liveHelpers,
  onSelectIncident,
  onOpenSosForm
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [selectedType, setSelectedType] = useState<string>('all');
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [mapReady, setMapReady] = useState(false);

  // Default fallback center (16.494759, 80.499159)
  const defaultLat = userLat ?? 16.494759;
  const defaultLng = userLng ?? 80.499159;

  // 1. Initialize Map with free OpenStreetMap basemap (no API key required)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 14,
      zoomControl: false
    });

    // Free OpenStreetMap standard tile layer - works reliably without any API key
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;
    setMapReady(true);

    // Ensure Leaflet recalculates container dimensions inside the phone frame
    const resizeTimer = window.setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      window.clearTimeout(resizeTimer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Update center when user location updates
  useEffect(() => {
    if (mapInstanceRef.current && userLat && userLng) {
      mapInstanceRef.current.setView([userLat, userLng], mapInstanceRef.current.getZoom() || 14);
    }
  }, [userLat, userLng]);

  // 3. Render Tactical Markers on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current || !mapReady) return;

    const group = markersGroupRef.current;
    group.clearLayers();

    // A. Render User Location Marker (Amber/Emerald Tactical Pulse)
    const userHtml = `
      <div class="relative flex items-center justify-center w-8 h-8">
        <div class="absolute w-8 h-8 bg-amber-500/20 rounded-full animate-ping"></div>
        <div class="w-5 h-5 bg-[#0B0E14] border-2 border-amber-400 rounded-full shadow-lg flex items-center justify-center">
          <div class="w-2 h-2 bg-amber-400 rounded-full"></div>
        </div>
      </div>
    `;
    const userIcon = L.divIcon({
      html: userHtml,
      className: 'custom-user-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const userMarker = L.marker([defaultLat, defaultLng], { icon: userIcon }).addTo(group);
    userMarker.bindTooltip('Your Live Position', { permanent: false, direction: 'top' });

    // B. Render Live Sahayak Helpers (Emerald Radar Beacon)
    liveHelpers.forEach((helper) => {
      if (!helper.lat || !helper.lng) return;
      const helperHtml = `
        <div class="relative flex items-center justify-center w-7 h-7 cursor-pointer">
          <div class="w-6 h-6 bg-[#141822] text-emerald-400 border border-emerald-500/80 rounded-full shadow-lg flex items-center justify-center text-[10px] font-bold">
            ⚡
          </div>
          <span class="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        </div>
      `;
      const helperIcon = L.divIcon({
        html: helperHtml,
        className: 'custom-helper-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const helperMarker = L.marker([helper.lat, helper.lng], { icon: helperIcon }).addTo(group);
      helperMarker.bindTooltip(`Sahayak: ${helper.displayName || 'Active Helper'}`, {
        permanent: false,
        direction: 'top'
      });
    });

    // C. Render Incident Markers
    const activeIncidents = incidents.filter((inc) => inc.status === 'active');

    activeIncidents.forEach((inc) => {
      if (!inc.location?.lat || !inc.location?.lng) return;

      // Filter by type
      if (selectedType !== 'all' && inc.type !== selectedType) return;

      // Filter by radius if user position is available
      if (userLat && userLng) {
        const dist = calculateDistanceKm(userLat, userLng, inc.location.lat, inc.location.lng);
        if (dist > radiusKm) return;
      }

      const isCritical = inc.severity === 'critical' || inc.type === 'accident' || inc.type === 'medical';
      const bgColor = isCritical ? '#EF4444' : '#F59E0B';
      const textColor = isCritical ? '#FFFFFF' : '#0B0E14';

      const iconEmoji =
        inc.type === 'accident'
          ? '🚨'
          : inc.type === 'breakdown'
          ? '🔧'
          : inc.type === 'fuel'
          ? '⛽'
          : inc.type === 'medical'
          ? '🚑'
          : inc.type === 'flat_tire'
          ? '🛞'
          : '⚠️';

      const incidentHtml = `
        <div class="relative group cursor-pointer flex items-center justify-center">
          ${
            isCritical
              ? `<div class="absolute w-10 h-10 bg-red-500/40 rounded-full animate-ping"></div>`
              : `<div class="absolute w-8 h-8 bg-amber-500/20 rounded-full animate-pulse"></div>`
          }
          <div 
            class="w-9 h-9 rounded-2xl flex items-center justify-center font-bold shadow-xl border-2 transition-transform duration-150 group-hover:scale-110 active:scale-95" 
            style="background-color: ${bgColor}; border-color: #0B0E14; color: ${textColor};"
          >
            <span style="font-size: 15px;">${iconEmoji}</span>
          </div>
          ${
            inc.respondersCount > 0
              ? `<span class="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#0B0E14] shadow-sm">${inc.respondersCount}</span>`
              : ''
          }
        </div>
      `;

      const incidentIcon = L.divIcon({
        html: incidentHtml,
        className: 'custom-incident-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([inc.location.lat, inc.location.lng], {
        icon: incidentIcon
      }).addTo(group);

      marker.on('click', () => {
        onSelectIncident(inc);
      });
    });
  }, [incidents, liveHelpers, userLat, userLng, selectedType, radiusKm, mapReady, onSelectIncident]);

  // Recenter button
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([defaultLat, defaultLng], 15, { duration: 1 });
    }
  };

  const activeCount = incidents.filter((i) => i.status === 'active').length;

  return (
    <div className="relative flex-1 w-full h-full flex flex-col overflow-hidden bg-[#0B0E14]">
      {/* Top Floating Filter & Radar Telemetry Bar */}
      <div className="absolute top-3 inset-x-3 z-20 flex flex-col gap-2 pointer-events-none">
        {/* Incident Type Filter Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none px-0.5 pointer-events-auto">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shadow-lg border transition-all cursor-pointer ${
              selectedType === 'all'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-amber-500/20'
                : 'bg-[#141822]/90 text-slate-300 border-[#262E40] backdrop-blur-md hover:bg-[#1C2230]'
            }`}
          >
            All Alerts ({activeCount})
          </button>

          {Object.values(INCIDENT_CONFIGS).map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedType(item.id)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shadow-md border flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedType === item.id
                  ? 'bg-slate-100 text-slate-950 border-white font-bold'
                  : 'bg-[#141822]/90 text-slate-300 border-[#262E40] backdrop-blur-md hover:bg-[#1C2230]'
              }`}
            >
              <span>{item.id === 'accident' ? '🚨' : item.id === 'breakdown' ? '🔧' : item.id === 'fuel' ? '⛽' : item.id === 'medical' ? '🚑' : '⚠️'}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Sub Header telemetry info bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-300 px-3.5 py-2 bg-[#141822]/95 backdrop-blur-md border border-[#262E40] rounded-xl shadow-xl pointer-events-auto">
          <div className="flex items-center gap-2 font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-slate-100">Live Highway Radar</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-semibold">{liveHelpers.length} Sahayaks active</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Radius:</span>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              aria-label="Filter radar radius"
              className="bg-[#1C2230] text-amber-400 text-xs font-bold border border-[#262E40] rounded-lg px-2 py-0.5 focus:outline-none cursor-pointer"
            >
              <option value={2}>2 km</option>
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={25}>25 km</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leaflet Map Canvas Container */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full z-10" />

      {/* Floating Tactical Controls on Map */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2.5">
        {/* Recenter button */}
        <button
          onClick={handleRecenter}
          className="w-11 h-11 bg-[#141822]/95 backdrop-blur-md hover:bg-[#1C2230] active:scale-95 text-slate-100 rounded-xl shadow-xl border border-[#262E40] flex items-center justify-center transition-all cursor-pointer"
          title="Recenter on my position"
          aria-label="Recenter on my position"
        >
          <Crosshair className="w-5 h-5 text-amber-400" />
        </button>

        {/* Quick Report SOS Button */}
        <button
          onClick={onOpenSosForm}
          className="h-11 px-4 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold rounded-xl shadow-xl shadow-red-600/30 border border-red-500 flex items-center gap-2 active:scale-95 transition-all cursor-pointer text-xs uppercase tracking-wider"
        >
          <ShieldAlert className="w-4 h-4 animate-pulse" />
          <span>REPORT SOS</span>
        </button>
      </div>
    </div>
  );
};
