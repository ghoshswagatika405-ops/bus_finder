import React from 'react';
import { Search, Wifi, Battery, Signal } from 'lucide-react';

export default function Header({ searchQuery, setSearchQuery, currentTime }) {
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

      {/* Blue Curved Header with BEC College Logo */}
      <div className="curved-header">
        {/* College Header Banner inside Screen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <img
            src="/bec-logo.svg"
            alt="Bhubaneswar Engineering College Logo"
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: '#FFFFFF',
              padding: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          />
          <div>
            <div style={{ fontSize: '0.72rem', color: '#EBF2FF', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 800 }}>
              Bhubaneswar Engineering College
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.2px' }}>
              BEC Bus Tracker
            </div>
          </div>
        </div>

        {/* Floating White Search Bar */}
        <div className="search-box-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Enter destination or route number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </header>
  );
}
