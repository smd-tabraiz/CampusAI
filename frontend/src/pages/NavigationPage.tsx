import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Compass,
  Navigation,
  MapPin,
  Search,
  Clock,
  Layers,
  Accessibility,
  ArrowRight,
  Info,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { campusApi } from '../services/api';
import { CampusLocation } from '../types';

// Custom Map Marker Icons using Leaflet divIcon
const createCustomIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div style="
        background-color: ${color};
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 700;
        font-family: Poppins, sans-serif;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 2px solid white;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 4px;
      ">
        <span>📍</span> ${label}
      </div>
    `,
    iconSize: [80, 30],
    iconAnchor: [40, 15]
  });
};

// Component to dynamically re-center map when route or location changes
const MapRecenter: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom = 16 }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
};

export const NavigationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Navigation Route Planning
  const [originId, setOriginId] = useState<string>('');
  const [destinationId, setDestinationId] = useState<string>('');
  const [accessibleMode, setAccessibleMode] = useState<boolean>(false);
  const [activeRoute, setActiveRoute] = useState<any | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Default campus center (Apex Institute / IISc Bangalore campus coordinate benchmark)
  const [mapCenter, setMapCenter] = useState<[number, number]>([12.9718, 77.5942]);
  const [selectedLocation, setSelectedLocation] = useState<CampusLocation | null>(null);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const res = await campusApi.getLocations();
        const locs = res.data.locations || [];
        setLocations(locs);

        if (locs.length >= 2) {
          // Default origin: Kaveri Hostel or first location
          setOriginId(locs[0].id);

          // Check if URL specifies destination
          const destCode = searchParams.get('dest');
          const searchParam = searchParams.get('search');

          if (destCode) {
            const found = locs.find((l: any) => l.code === destCode || l.id === destCode);
            if (found) {
              setDestinationId(found.id);
              setSelectedLocation(found);
              setMapCenter([found.lat, found.lng]);
            } else {
              setDestinationId(locs[1].id);
            }
          } else if (searchParam) {
            setSearchQuery(searchParam);
            const found = locs.find((l: any) => l.name.toLowerCase().includes(searchParam.toLowerCase()));
            if (found) {
              setSelectedLocation(found);
              setDestinationId(found.id);
              setMapCenter([found.lat, found.lng]);
            }
          } else {
            setDestinationId(locs[1].id);
          }
        }
      } catch (err) {
        console.error('Failed to load campus locations:', err);
      }
    };

    loadLocations();
  }, [searchParams]);

  // Compute Route
  const handleCalculateRoute = async () => {
    if (!originId || !destinationId) return;
    setIsCalculatingRoute(true);
    try {
      const res = await campusApi.getRoute(originId, destinationId, accessibleMode);
      setActiveRoute(res.data.route);
      if (res.data.route?.waypoints?.length > 0) {
        setMapCenter(res.data.route.waypoints[0]);
      }
    } catch (err) {
      console.error('Route calculation error:', err);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'LIBRARY': return '#4f46e5';
      case 'LAB': return '#0284c7';
      case 'CAFETERIA': return '#10b981';
      case 'HOSTEL': return '#8b5cf6';
      case 'SPORTS': return '#f59e0b';
      case 'MEDICAL': return '#ef4444';
      case 'ADMIN': return '#475569';
      default: return '#6366f1';
    }
  };

  const categories = [
    { label: 'All Places', value: 'ALL' },
    { label: 'Academic & Labs', value: 'LAB' },
    { label: 'Library', value: 'LIBRARY' },
    { label: 'Cafeterias', value: 'CAFETERIA' },
    { label: 'Hostels', value: 'HOSTEL' },
    { label: 'Sports', value: 'SPORTS' },
    { label: 'Medical 24/7', value: 'MEDICAL' }
  ];

  const filteredLocations = locations.filter((loc) => {
    const matchesCategory = selectedCategory === 'ALL' || loc.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Compass className="w-6 h-6 text-brand-600" />
            Campus Navigation AI
          </h1>
          <p className="text-xs text-slate-500">
            High-precision indoor and outdoor GIS mapping with accessible pathways
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat.value
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT COLUMN: Route Planner & Directory */}
        <div className="space-y-4">
          {/* Route Planning Widget */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-brand-600" />
                Find Walking Route
              </span>

              {/* Accessible Mode Toggle */}
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={accessibleMode}
                  onChange={(e) => setAccessibleMode(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
                />
                <Accessibility className="w-3.5 h-3.5 text-emerald-600" />
                Ramps Only
              </label>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Starting Point (Origin)
                </label>
                <select
                  value={originId}
                  onChange={(e) => setOriginId(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Destination
                </label>
                <select
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleCalculateRoute}
                disabled={isCalculatingRoute || originId === destinationId}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isCalculatingRoute ? 'Calculating shortest path...' : 'Calculate Walking Route'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Active Route Summary Card */}
            {activeRoute && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-indigo-300 font-semibold uppercase">Route Summary</div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    Fastest Walking Route
                  </span>
                </div>

                <div className="flex items-center justify-around py-2.5 px-3 bg-white/10 rounded-xl mb-3">
                  <div className="text-center">
                    <div className="text-[10px] text-slate-300 uppercase">Distance</div>
                    <div className="text-base font-bold">{activeRoute.distanceFormatted}</div>
                  </div>
                  <div className="h-6 w-px bg-white/15" />
                  <div className="text-center">
                    <div className="text-[10px] text-slate-300 uppercase">Est. Walk</div>
                    <div className="text-base font-bold text-indigo-300">
                      {activeRoute.walkingMinutes} mins
                    </div>
                  </div>
                </div>

                {/* Turn-by-Turn Steps */}
                <div className="text-xs font-semibold text-slate-200 mb-2">Turn-by-Turn Waypoints:</div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {activeRoute.instructions?.map((step: any, sIdx: number) => (
                    <div key={sIdx} className="flex items-start gap-2 text-[11px] text-slate-300">
                      <span className="w-4 h-4 rounded-full bg-brand-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5">
                        {sIdx + 1}
                      </span>
                      <span>{step.instruction}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Locations Directory List */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs max-h-[380px] overflow-y-auto">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Campus Locations ({filteredLocations.length})</span>
            </div>

            <div className="space-y-2">
              {filteredLocations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => {
                    setSelectedLocation(loc);
                    setDestinationId(loc.id);
                    setMapCenter([loc.lat, loc.lng]);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedLocation?.id === loc.id
                      ? 'border-brand-500 bg-brand-50/60'
                      : 'border-slate-100 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">{loc.name}</span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: getCategoryColor(loc.category) }}
                    >
                      {loc.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mb-1.5">{loc.description}</p>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" /> {loc.openingHours}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT 2 COLUMNS: Leaflet Interactive Campus Map */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[600px] relative">
          <MapContainer
            center={mapCenter}
            zoom={16}
            style={{ width: '100%', height: '100%' }}
            scrollWheelZoom={true}
          >
            <MapRecenter center={mapCenter} />

            {/* OpenStreetMap Base Layer */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Campus Markers */}
            {locations.map((loc) => (
              <Marker
                key={loc.id}
                position={[loc.lat, loc.lng]}
                icon={createCustomIcon(getCategoryColor(loc.category), loc.name.split(' ')[0])}
                eventHandlers={{
                  click: () => {
                    setSelectedLocation(loc);
                    setDestinationId(loc.id);
                  }
                }}
              >
                <Popup>
                  <div className="p-1 font-sans">
                    <div className="font-bold text-slate-900 text-xs mb-1">{loc.name}</div>
                    <div className="text-[11px] text-slate-600 mb-1">{loc.description}</div>
                    <div className="text-[10px] text-indigo-600 font-semibold mb-2">
                      🕒 {loc.openingHours}
                    </div>
                    <button
                      onClick={() => {
                        setDestinationId(loc.id);
                        handleCalculateRoute();
                      }}
                      className="w-full py-1 px-2 rounded-lg bg-indigo-600 text-white text-[10px] font-bold"
                    >
                      Navigate Here
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Active Walking Route Polyline */}
            {activeRoute && activeRoute.waypoints?.length > 0 && (
              <Polyline
                positions={activeRoute.waypoints}
                pathOptions={{
                  color: accessibleMode ? '#10b981' : '#4f46e5',
                  weight: 5,
                  dashArray: '8, 8',
                  opacity: 0.9
                }}
              />
            )}
          </MapContainer>

          {/* Map Floating HUD Overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-[1000] pointer-events-none flex justify-between items-end">
            <div className="pointer-events-auto p-3 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-200 text-xs text-slate-700 font-medium">
              <span className="font-bold text-indigo-700">Apex Campus Grid:</span> 12.9718° N, 77.5942° E
            </div>

            {selectedLocation && (
              <div className="pointer-events-auto p-4 rounded-xl bg-white/95 backdrop-blur-md shadow-xl border border-indigo-200 max-w-sm">
                <div className="text-xs font-bold text-slate-900 mb-1">{selectedLocation.name}</div>
                <div className="text-[11px] text-slate-500 mb-2">{selectedLocation.openingHours}</div>
                <button
                  onClick={() => {
                    setDestinationId(selectedLocation.id);
                    handleCalculateRoute();
                  }}
                  className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow transition-colors"
                >
                  Start Route to {selectedLocation.name.split(' ')[0]}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
