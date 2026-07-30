import React from 'react';
import { Search, Wifi, Battery, Signal, MapPin, Locate, Mic } from 'lucide-react';

export default function Header({
  searchQuery,
  setSearchQuery,
  currentTime,
  onOpenShareModal,
  userLocation,
  setUserLocation,
  onOpenVoiceModal
}) {
  const handleGetLiveGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (setUserLocation) {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            name: 'My Live Location (GPS)',
            isLiveGps: true
          });
        }
      },
      (err) => {
        alert('Could not access your live location.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <header>
      {/* Top Status Bar matching design */}
      <div className="status-bar">
        <span>{currentTime || '1:41'}</span>
        <div className="status-bar-icons">
          <Signal size={14} />
          <Wifi size={14} />
          <Battery size={16} />
        </div>
      </div>

      {/* Blue Curved Header with BEC College Logo & Location Badge */}
      <div className="curved-header">
        {/* College Header Banner inside Screen */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="/bec-logo.svg"
              alt="Bhubaneswar Engineering College Logo"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#FFFFFF',
                padding: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            />
            <div>
              <div style={{ fontSize: '0.68rem', color: '#EBF2FF', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 800 }}>
                Bhubaneswar Engineering College
              </div>
              <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.2px' }}>
                BEC Bus Tracker
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* AI Voice Assistant Trigger Button */}
            <button
              onClick={onOpenVoiceModal}
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                color: '#FFFFFF',
                borderRadius: 14,
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.4)'
              }}
              title="Ask AI Voice Assistant where your bus is!"
            >
              <Mic size={13} />
              <span>AI Voice</span>
            </button>

            {/* Location Badge & Locate Me Button */}
            <button
              onClick={handleGetLiveGPS}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                color: '#FFFFFF',
                borderRadius: 14,
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                backdropFilter: 'blur(6px)'
              }}
              title="Click to detect your live location via browser GPS"
            >
              <Locate size={13} />
              <span>{userLocation?.isLiveGps ? 'GPS Live' : 'Locate Me'}</span>
            </button>
          </div>
        </div>

        {/* Floating White Search Bar with Mic Icon inside */}
        <div className="search-box-wrapper" style={{ position: 'relative' }}>
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search or ask 'Where is Bus 108?'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingRight: '40px' }}
          />
          <button
            onClick={onOpenVoiceModal}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#EBF2FF',
              border: 'none',
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Speak query"
          >
            <Mic size={16} color="#1A5CE5" />
          </button>
        </div>
      </div>
    </header>
  );
}
