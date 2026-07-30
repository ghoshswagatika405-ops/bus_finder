import React, { useState } from 'react';
import { Bus, Navigation, Gauge, Users, ShieldCheck, MapPin, Search, Radio, AlertCircle } from 'lucide-react';

export default function AllBusesView({ buses = [], onTrackBus }) {
  const [filterQuery, setFilterQuery] = useState('');

  const filtered = buses.filter((b) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    const name = (b.name || '').toLowerCase();
    const num = (b.number || '').toLowerCase();
    const driver = (b.driver || '').toLowerCase();
    const vehicle = (b.vehicleNo || '').toLowerCase();
    const dest = (b.destination || '').toLowerCase();
    return name.includes(q) || num.includes(q) || driver.includes(q) || vehicle.includes(q) || dest.includes(q);
  });

  return (
    <div style={{ paddingBottom: '20px' }}>
      {/* Title Header */}
      <div className="section-header">
        <h2 className="section-title">All Operating Buses</h2>
        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1A5CE5', background: '#EBF2FF', padding: '4px 10px', borderRadius: 12 }}>
          {buses.length} Active Vehicles
        </span>
      </div>

      {/* Local Filter Bar inside All Buses View */}
      <div style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: 14, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0 16px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Search size={18} color="#94A3B8" />
        <input
          type="text"
          placeholder="Filter by Bus name (Koustuv, BEC, AIIMS...)"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.86rem', fontWeight: 600, fontFamily: 'inherit' }}
        />
      </div>

      {/* List of All Buses */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map((bus) => {
          const isLive = bus.isLocationActive === true;
          return (
            <div
              key={bus.id || bus.busId}
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '18px',
                border: `2px solid ${isLive ? '#10B981' : 'rgba(229, 231, 235, 0.8)'}`,
                boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              {/* Top Row: Bus Name & Live Status Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ background: '#1A5CE5', color: '#FFFFFF', fontWeight: 800, fontSize: '0.9rem', padding: '3px 10px', borderRadius: 8 }}>
                      Bus {bus.number}
                    </span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827' }}>
                      {bus.name || `Bus ${bus.number}`}
                    </h3>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Navigation size={14} color="#1A5CE5" />
                    <span>{bus.origin} ➔ {bus.destination}</span>
                  </div>
                </div>

                {/* DRIVER LOCATION STATUS BADGE */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: isLive ? '#DCFCE7' : '#FEE2E2', padding: '4px 10px', borderRadius: 12 }}>
                  <Radio size={14} color={isLive ? '#166534' : '#991B1B'} className={isLive ? 'pulse-icon' : ''} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isLive ? '#166534' : '#991B1B' }}>
                    {isLive ? 'LOCATION ON' : 'LOCATION OFF'}
                  </span>
                </div>
              </div>

              {/* Middle Grid Specs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, background: '#F8FAFC', padding: 10, borderRadius: 12 }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600, display: 'block' }}>Speed</span>
                  <strong style={{ fontSize: '0.85rem', color: isLive ? '#1A5CE5' : '#64748B', fontWeight: 800 }}>
                    {isLive ? (bus.speed || '45 km/h') : '0 km/h'}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600, display: 'block' }}>Occupancy</span>
                  <strong style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 800 }}>{bus.capacity || '58% Full'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600, display: 'block' }}>Vehicle No.</span>
                  <strong style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 800 }}>{bus.vehicleNo}</strong>
                </div>
              </div>

              {/* Track Button */}
              <button
                onClick={() => onTrackBus(bus)}
                disabled={!isLive}
                style={{
                  width: '100%',
                  background: isLive ? '#1A5CE5' : '#94A3B8',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '11px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: isLive ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: isLive ? '0 4px 12px rgba(26, 92, 229, 0.2)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <Bus size={18} /> {isLive ? `Track ${bus.name || `Bus ${bus.number}`} Live on Map` : 'Driver Location OFF (Turn ON in Driver Console)'}
              </button>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748B', fontSize: '0.9rem', fontWeight: 600 }}>
            No buses matching "{filterQuery}" found.
          </div>
        )}
      </div>
    </div>
  );
}
