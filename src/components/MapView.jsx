import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { BUS_STOPS, REVERSE_BUS_STOPS, BUS_ROUTES, BUSES_LIST } from '../data/busData';
import { Play, Pause, MapPin, Bus, ChevronUp, ChevronDown, Radio, AlertCircle, Clock, Timer } from 'lucide-react';

// Custom Bus Icon Creator (Green Circle with Bus Icon matching photo)
const createBusMarkerIcon = (busNumber, isSelected) => {
  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="
        background-color: ${isSelected ? '#10B981' : '#1A5CE5'};
        color: white;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        font-weight: 800;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.3);
        border: 3px solid white;
        transform: scale(${isSelected ? 1.2 : 1});
        transition: transform 0.2s ease;
      ">
        🚌
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19]
  });
};

// Custom Stop Icon Creator (White circle with dark border matching photo map)
const createStopMarkerIcon = () => {
  return L.divIcon({
    className: 'custom-stop-marker',
    html: `
      <div style="
        background-color: white;
        border: 3px solid #1E293B;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      "></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 12, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

export default function MapView({ selectedBus, setSelectedBus }) {
  const [buses, setBuses] = useState(BUSES_LIST);
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(true);
  const [mapStyle, setMapStyle] = useState('google_roadmap'); // 'google_roadmap', 'google_satellite', 'osm'

  // Filter ONLY buses whose driver location is turned ON
  const activeBusesOnMap = buses.filter((b) => b.isLocationActive === true);

  const activeBus = selectedBus && selectedBus.isLocationActive
    ? selectedBus
    : (activeBusesOnMap.length > 0 ? activeBusesOnMap[0] : null);

  const mapCenter = activeBus ? [activeBus.lat, activeBus.lng] : [20.2400, 85.7500];

  // Active stops list based on bus journey direction (Forward vs Reverse)
  const activeStops = (activeBus && activeBus.direction === 'REVERSE') ? REVERSE_BUS_STOPS : BUS_STOPS;

  // Find nearest stop index for active bus to position green bus icon on line timeline
  const getNearestStopIndex = () => {
    if (!activeBus) return 0;
    let minDistance = Infinity;
    let closestIndex = 0;

    activeStops.forEach((stop, idx) => {
      const dist = Math.hypot(stop.lat - activeBus.lat, stop.lng - activeBus.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });
    return closestIndex;
  };

  const currentBusStopIdx = getNearestStopIndex();
  const currentStopName = activeStops[currentBusStopIdx]?.name || 'Baramunda BSABT';

  // Tile layer URL & attributes configuration for Google Maps & OpenStreetMap
  const getTileLayerConfig = () => {
    if (mapStyle === 'google_satellite') {
      return {
        url: 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps Satellite'
      };
    } else if (mapStyle === 'google_roadmap') {
      return {
        url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps API'
      };
    }
    return {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      subdomains: ['a', 'b', 'c'],
      attribution: '&copy; OpenStreetMap contributors'
    };
  };

  const currentTileConfig = getTileLayerConfig();

  return (
    <div className="map-view-container">
      {/* GOOGLE MAPS / MAP STYLE SELECTOR OVERLAY */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          zIndex: 1000,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          borderRadius: '16px',
          padding: '4px',
          display: 'flex',
          gap: '4px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
        }}
      >
        <button
          onClick={() => setMapStyle('google_roadmap')}
          style={{
            background: mapStyle === 'google_roadmap' ? '#1A5CE5' : 'transparent',
            color: mapStyle === 'google_roadmap' ? '#FFFFFF' : '#334155',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '12px',
            fontSize: '0.72rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          🗺️ Google Maps
        </button>
        <button
          onClick={() => setMapStyle('google_satellite')}
          style={{
            background: mapStyle === 'google_satellite' ? '#1A5CE5' : 'transparent',
            color: mapStyle === 'google_satellite' ? '#FFFFFF' : '#334155',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '12px',
            fontSize: '0.72rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          🛰️ Satellite
        </button>
        <button
          onClick={() => setMapStyle('osm')}
          style={{
            background: mapStyle === 'osm' ? '#1A5CE5' : 'transparent',
            color: mapStyle === 'osm' ? '#FFFFFF' : '#334155',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '12px',
            fontSize: '0.72rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          🌍 OSM
        </button>
      </div>

      {/* Live Driver Controls Header Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          right: 14,
          zIndex: 1000,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          borderRadius: '20px',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          fontSize: '0.8rem',
          fontWeight: 700
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: activeBusesOnMap.length > 0 ? '#10B981' : '#EF4444' }}>
          <Radio size={14} className={activeBusesOnMap.length > 0 ? 'pulse-icon' : ''} />
          {activeBusesOnMap.length > 0
            ? `${activeBusesOnMap.length} Driver(s) Ride Live`
            : 'Driver Location OFF'}
        </div>
      </div>

      {/* Warning banner when no driver location is turned ON */}
      {activeBusesOnMap.length === 0 && (
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 14,
            right: 14,
            zIndex: 1000,
            background: 'rgba(239, 68, 68, 0.95)',
            color: '#FFFFFF',
            padding: '10px 16px',
            borderRadius: '14px',
            boxShadow: '0 6px 20px rgba(239, 68, 68, 0.25)',
            fontSize: '0.82rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>No driver has started ride. Click "START BUS RIDE" in Driver Console to view bus live on map.</span>
        </div>
      )}

      <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={true}>
        <ChangeView center={mapCenter} />
        <TileLayer
          key={mapStyle}
          attribution={currentTileConfig.attribution}
          url={currentTileConfig.url}
          subdomains={currentTileConfig.subdomains}
        />

        {/* Draw Black Thick Route Polyline Path matching photo */}
        {BUS_ROUTES.map((route) => (
          <Polyline
            key={route.id}
            positions={route.pathCoordinates}
            color={route.direction === 'REVERSE' ? '#7C3AED' : '#1E293B'}
            weight={6}
            opacity={0.9}
          />
        ))}

        {/* Draw All 22 Location White Circle Markers matching photo */}
        {BUS_STOPS.map((stop) => (
          <Marker
            key={stop.id}
            position={[stop.lat, stop.lng]}
            icon={createStopMarkerIcon()}
          >
            <Popup>
              <div style={{ padding: '4px' }}>
                <strong style={{ color: '#1A5CE5', fontSize: '0.9rem' }}>{stop.name}</strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748B' }}>{stop.subtitle}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Draw ONLY Buses whose Driver Location IS TURNED ON */}
        {activeBusesOnMap.map((bus) => {
          const isSelected = activeBus && (activeBus.id === bus.id || activeBus.busId === bus.busId);
          return (
            <Marker
              key={bus.id || bus.busId}
              position={[bus.lat, bus.lng]}
              icon={createBusMarkerIcon(bus.number, isSelected)}
              eventHandlers={{
                click: () => {
                  setActiveBus(bus);
                  if (setSelectedBus) setSelectedBus(bus);
                }
              }}
            >
              <Popup>
                <div style={{ padding: '4px' }}>
                  <strong style={{ fontSize: '0.95rem' }}>Bus {bus.number} - {bus.name}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 2 }}>
                    {bus.direction === 'REVERSE' ? '⬅️ Reverse Return: ' : '➡️ Forward: '}{bus.destination}
                  </div>
                  {bus.isRealGps ? (
                    <div style={{ background: '#E0F2FE', color: '#0369A1', border: '1px solid #7DD3FC', padding: '3px 8px', borderRadius: 6, fontSize: '0.73rem', fontWeight: 800, marginTop: 4, display: 'inline-block' }}>
                      📱 Live Phone GPS Tracker {bus.gpsAccuracy ? `(±${bus.gpsAccuracy}m)` : ''}
                    </div>
                  ) : (
                    <div style={{ background: '#F3E8FF', color: '#6B21A8', border: '1px solid #D8B4FE', padding: '3px 8px', borderRadius: 6, fontSize: '0.73rem', fontWeight: 800, marginTop: 4, display: 'inline-block' }}>
                      🤖 Route Simulation
                    </div>
                  )}
                  {bus.tripStartTime && (
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10B981', marginTop: 4 }}>
                      🚀 Departure Time: {bus.tripStartTime}
                    </div>
                  )}
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#3B82F6', marginTop: 2 }}>
                    📍 Location: {currentStopName}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1A5CE5', marginTop: 2 }}>
                    ⚡ Speed: {bus.speed || '45 km/h'}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* LINE-BY-LINE LOCATION TIMELINE DRAWER WITH LIVE TRIP DEPARTURE TIME */}
      {activeBus && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: '#FFFFFF',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            boxShadow: '0 -8px 30px rgba(0,0,0,0.18)',
            maxHeight: isDrawerExpanded ? '390px' : '90px',
            transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderTop: '1px solid #E2E8F0'
          }}
        >
          {/* Header layout: Bus Number, Live Start Time Badge, Destination */}
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              background: '#FFFFFF'
            }}
            onClick={() => setIsDrawerExpanded(!isDrawerExpanded)}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>
                  Bus {activeBus.number} - {activeBus.name}
                </span>

                {/* LIVE TRIP START TIME BADGE */}
                {activeBus.tripStartTime && (
                  <span style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#047857', fontSize: '0.74rem', fontWeight: 800, padding: '3px 8px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> Live Departure: {activeBus.tripStartTime}
                  </span>
                )}

                {activeBus.elapsedTime && (
                  <span style={{ background: '#E0F2FE', border: '1px solid #7DD3FC', color: '#0369A1', fontSize: '0.74rem', fontWeight: 800, padding: '3px 8px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Timer size={12} /> Ride Time: {activeBus.elapsedTime}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.88rem', color: '#475569', fontWeight: 600, marginTop: 4 }}>
                {activeBus.origin || 'Baramunda'} ➔ {activeBus.destination || 'BEC Campus'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {isDrawerExpanded ? <ChevronDown size={22} color="#64748B" /> : <ChevronUp size={22} color="#64748B" />}
            </div>
          </div>

          {/* VERTICAL LINE-BY-LINE TIMELINE CONTAINER */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', background: '#FFFFFF' }}>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* Continuous Vertical Timeline Line */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  bottom: '12px',
                  left: '11px',
                  width: '3px',
                  backgroundColor: '#CBD5E1',
                  zIndex: 1
                }}
              ></div>

              {/* Render 22 location stops in forward or reverse order */}
              {activeStops.map((stop, idx) => {
                const isBusHere = currentBusStopIdx === idx;
                const isPassed = idx < currentBusStopIdx;

                return (
                  <div
                    key={stop.id || `${stop.name}-${idx}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px 0',
                      position: 'relative',
                      zIndex: 2
                    }}
                  >
                    {/* Timeline Circle or Green Live Bus Icon */}
                    <div style={{ width: '25px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                      {isBusHere ? (
                        <div
                          style={{
                            background: activeBus.direction === 'REVERSE' ? '#7C3AED' : '#10B981',
                            color: 'white',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.25)',
                            transform: 'translateX(-1.5px)'
                          }}
                        >
                          <Bus size={15} />
                        </div>
                      ) : (
                        <div
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            background: isPassed ? (activeBus.direction === 'REVERSE' ? '#7C3AED' : '#10B981') : '#FFFFFF',
                            border: `3px solid ${isPassed ? (activeBus.direction === 'REVERSE' ? '#7C3AED' : '#10B981') : '#94A3B8'}`,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        ></div>
                      )}
                    </div>

                    {/* Location Name & Subtitle */}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: isBusHere ? 800 : 600,
                          color: isBusHere ? (activeBus.direction === 'REVERSE' ? '#7C3AED' : '#10B981') : isPassed ? '#334155' : '#1E293B'
                        }}
                      >
                        {stop.name}
                        {isBusHere && (
                          <span style={{ fontSize: '0.72rem', background: '#DCFCE7', color: '#166534', fontWeight: 800, padding: '2px 8px', borderRadius: 10, marginLeft: 8 }}>
                            ● BUS CURRENT LIVE LOCATION
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500, marginTop: 2 }}>
                        {stop.subtitle}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
