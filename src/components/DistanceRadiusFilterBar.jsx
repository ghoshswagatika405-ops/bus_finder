import React from 'react';
import { Navigation, Compass, MapPin, Locate } from 'lucide-react';
import { RADIUS_OPTIONS, BUS_STOPS } from '../data/busData';

export default function DistanceRadiusFilterBar({
  userLocation,
  setUserLocation,
  radiusFilter,
  setRadiusFilter,
  totalMatchingCount,
  totalActiveCount,
  compact = false
}) {
  const handleGetLiveGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: 'My Live Location (GPS)',
          isLiveGps: true
        });
      },
      (err) => {
        alert('Could not access your live location. Defaulting to nearest stop.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleStopSelect = (stopName) => {
    const stopObj = BUS_STOPS.find((s) => s.name === stopName);
    if (stopObj) {
      setUserLocation({
        lat: stopObj.lat,
        lng: stopObj.lng,
        name: stopObj.name,
        isLiveGps: false
      });
    }
  };

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: compact ? '14px' : '18px',
        padding: compact ? '8px 12px' : '14px 16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        marginBottom: compact ? 10 : 16
      }}
    >
      {/* Location Source Selector Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Navigation size={16} color="#1A5CE5" />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1E293B' }}>
            Reference Point:
          </span>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              color: userLocation?.isLiveGps ? '#15803D' : '#1A5CE5',
              background: userLocation?.isLiveGps ? '#DCFCE7' : '#EBF2FF',
              padding: '2px 8px',
              borderRadius: 8,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            {userLocation?.isLiveGps ? '⚡ GPS Live Location' : `📍 ${userLocation?.name || 'Baramunda'}`}
          </span>
        </div>

        {/* Action button to switch stop / trigger live GPS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={handleGetLiveGPS}
            style={{
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              padding: '3px 8px',
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Locate size={12} color="#1A5CE5" /> Live GPS
          </button>

          <select
            value={userLocation?.isLiveGps ? 'GPS' : (userLocation?.name || 'Baramunda BSABT')}
            onChange={(e) => {
              if (e.target.value === 'GPS') handleGetLiveGPS();
              else handleStopSelect(e.target.value);
            }}
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              padding: '3px 6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#1E293B',
              maxWidth: '130px',
              cursor: 'pointer'
            }}
          >
            <option value="GPS">📍 My Live GPS</option>
            {BUS_STOPS.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Proximity Distance Radius Filter Buttons (Google Maps Style) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', whiteSpace: 'nowrap' }}>
          Shows buses within:
        </span>
        {RADIUS_OPTIONS.map((chip) => {
          const isActive = radiusFilter === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => setRadiusFilter(chip.id)}
              style={{
                background: isActive ? '#1A5CE5' : '#F8FAFC',
                color: isActive ? '#FFFFFF' : '#475569',
                border: `1.5px solid ${isActive ? '#1A5CE5' : '#CBD5E1'}`,
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? '0 2px 8px rgba(26, 92, 229, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Status Summary Banner */}
      {typeof totalMatchingCount === 'number' && (
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            Showing <strong style={{ color: '#1A5CE5' }}>{totalMatchingCount}</strong> bus(es) within{' '}
            <strong style={{ color: '#1E293B' }}>{radiusFilter === 'ALL' ? 'all distances' : radiusFilter}</strong> from {userLocation?.name || 'location'}.
          </span>
        </div>
      )}
    </div>
  );
}
