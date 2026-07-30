import React, { useState } from 'react';
import { Bus, Footprints, MapPin, Users, AlertCircle, CheckCircle2, Navigation } from 'lucide-react';
import { BUS_STOPS, getCrowdIndicator, calculateDistanceKm, formatDistanceText, isWithinRadius, RADIUS_OPTIONS } from '../data/busData';

export default function NearestStopCard({
  stopName = 'Baramunda BSABT',
  walkTime = '2 min',
  buses = [],
  onTrackBus,
  onSeeAllStops,
  onShareBus,
  userLocation,
  setUserLocation,
  radiusFilter: parentRadiusFilter,
  setRadiusFilter: setParentRadiusFilter
}) {
  const [selectedStopName, setSelectedStopName] = useState(stopName);
  const [localRadiusFilter, setLocalRadiusFilter] = useState('ALL');

  const radiusFilter = parentRadiusFilter || localRadiusFilter;
  const setRadiusFilter = setParentRadiusFilter || setLocalRadiusFilter;

  const currentStopObj = BUS_STOPS.find((s) => s.name === selectedStopName) || BUS_STOPS[0];
  const refLat = userLocation?.isLiveGps ? userLocation.lat : currentStopObj.lat;
  const refLng = userLocation?.isLiveGps ? userLocation.lng : currentStopObj.lng;

  // Filter buses based on Google Maps style proximity distance from chosen stop or GPS
  const filteredByRadius = buses.filter((bus) => {
    return isWithinRadius(bus.lat, bus.lng, refLat, refLng, radiusFilter);
  });

  // Find if any upcoming bus is Full vs Low for Smart Recommendation Banner
  const fullBus = buses.find((b) => getCrowdIndicator(b).level === 'Full');
  const lowBus = buses.find((b) => getCrowdIndicator(b).level === 'Low');

  return (
    <section style={{ marginBottom: '24px' }}>
      <div className="section-header">
        <h2 className="section-title">Nearest bus stop</h2>
        <button className="see-all-link" onClick={onSeeAllStops}>
          See All ({BUS_STOPS.length} Stops)
        </button>
      </div>

      {/* Stop Dropdown Selector for All 22 Locations */}
      <div style={{ marginBottom: 10 }}>
        <select
          value={selectedStopName}
          onChange={(e) => setSelectedStopName(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '12px',
            border: '1px solid #CBD5E1',
            fontWeight: 700,
            fontSize: '0.82rem',
            color: '#1E293B',
            background: '#FFFFFF',
            cursor: 'pointer'
          }}
        >
          {BUS_STOPS.map((s, idx) => (
            <option key={s.id} value={s.name}>
              Stop {idx + 1}: {s.name} ({s.subtitle})
            </option>
          ))}
        </select>
      </div>

      <div className="nearest-stop-card">
        {/* Top Row in Card */}
        <div className="stop-card-top">
          <div className="stop-info-left">
            <div className="stop-avatar">
              <Bus size={22} />
            </div>
            <div>
              <div className="stop-name">{currentStopObj.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                {currentStopObj.subtitle}
              </div>
            </div>
          </div>
          <div className="walk-badge">
            <Footprints size={16} />
            <span>{currentStopObj.walkTime}</span>
          </div>
        </div>

        {/* Subheading Pill */}
        <div className="next-buses-pill">Next Buses (Baramunda ➔ BEC Corridor)</div>

        {/* Google Maps Style Proximity Radius Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', overflowX: 'auto' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
            <Navigation size={12} color="#1A5CE5" /> Radius:
          </span>
          {RADIUS_OPTIONS.map((chip) => (
            <button
              key={chip.id}
              onClick={() => setRadiusFilter(chip.id)}
              style={{
                background: radiusFilter === chip.id ? '#1A5CE5' : '#FFFFFF',
                color: radiusFilter === chip.id ? '#FFFFFF' : '#475569',
                border: `1px solid ${radiusFilter === chip.id ? '#1A5CE5' : '#CBD5E1'}`,
                padding: '3px 10px',
                borderRadius: 12,
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Smart Crowd Recommendation Banner for Passengers */}
        {fullBus && (
          <div
            style={{
              background: '#FFFBEB',
              border: '1px solid #FCD34D',
              borderRadius: '12px',
              padding: '10px 12px',
              margin: '10px 14px 4px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#92400E',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <AlertCircle size={18} color="#D97706" style={{ flexShrink: 0 }} />
            <div>
              <strong>💡 Smart Crowd Recommendation:</strong> Bus {fullBus.number} ({fullBus.name}) is 🔴 Full.
              {lowBus ? ` Next Bus ${lowBus.number} has 🟢 Low crowd — consider waiting for the next bus!` : ' High rush expected, plan accordingly!'}
            </div>
          </div>
        )}

        {/* Bus List */}
        <div className="bus-list">
          {filteredByRadius.map((bus) => {
            const crowd = getCrowdIndicator(bus);
            const distKm = calculateDistanceKm(currentStopObj.lat, currentStopObj.lng, bus.lat, bus.lng);
            const distText = formatDistanceText(distKm);

            return (
              <div key={bus.id || bus.busId} className="bus-item" onClick={() => onTrackBus(bus)}>
                <div className="bus-item-left">
                  <div className="bus-icon-circle">
                    <Bus size={20} />
                  </div>
                  <div className="bus-details">
                    <div className="bus-number" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span>Bus {bus.number} - {bus.name}</span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          color: '#0284C7',
                          background: '#E0F2FE',
                          border: '1px solid #7DD3FC',
                          padding: '2px 6px',
                          borderRadius: 6,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 2
                        }}
                      >
                        📍 {distText}
                      </span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          color: crowd.color,
                          background: crowd.bg,
                          border: `1px solid ${crowd.border}`,
                          padding: '2px 6px',
                          borderRadius: 6,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 2
                        }}
                      >
                        {crowd.badgeText}
                      </span>
                    </div>
                    <div className="bus-destination" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <span>{bus.destination}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: crowd.waitColor, marginTop: 2 }}>
                      👉 Advice: {crowd.waitDecision} ({crowd.waitAdvice})
                    </div>
                  </div>
                </div>

                <div className="bus-item-right">
                  <span className="bus-time">{bus.time}</span>
                  <button
                    className="track-now-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTrackBus(bus);
                    }}
                  >
                    Live Track
                  </button>
                </div>
              </div>
            );
          })}

          {filteredByRadius.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#64748B', fontSize: '0.9rem' }}>
              No buses found within {radiusFilter} from {currentStopObj.name}.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

