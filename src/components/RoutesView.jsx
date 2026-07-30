import React, { useState } from 'react';
import { BUS_ROUTES } from '../data/busData';
import { Network, MapPin, Clock, ArrowRight, Bus } from 'lucide-react';

export default function RoutesView({ onSelectRouteTrack }) {
  const [selectedRoute, setSelectedRoute] = useState(BUS_ROUTES[0]);

  return (
    <div style={{ paddingBottom: '20px' }}>
      <div className="section-header">
        <h2 className="section-title">Bus Roads & Routes</h2>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1A5CE5', background: '#EBF2FF', padding: '4px 10px', borderRadius: 12 }}>
          {BUS_ROUTES.length} Active Corridors
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
        {BUS_ROUTES.map((route) => (
          <div
            key={route.id}
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '18px',
              border: `2px solid ${selectedRoute.id === route.id ? '#1A5CE5' : 'rgba(229, 231, 235, 0.7)'}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setSelectedRoute(route)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    backgroundColor: route.color,
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    padding: '4px 12px',
                    borderRadius: '10px'
                  }}
                >
                  Route {route.number}
                </span>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827' }}>{route.name}</h3>
              </div>
            </div>

            <div style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={14} color={route.color} />
              <span>Corridor: {route.roadName}</span>
            </div>

            <div style={{ display: 'flex', gap: 16, background: '#F8FAFC', padding: 10, borderRadius: 12, marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, display: 'block' }}>Distance</span>
                <strong style={{ fontSize: '0.85rem', color: '#334155' }}>{route.distance}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, display: 'block' }}>Travel Time</span>
                <strong style={{ fontSize: '0.85rem', color: '#334155' }}>{route.duration}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, display: 'block' }}>Key Stops</span>
                <strong style={{ fontSize: '0.85rem', color: '#334155' }}>{route.stops.length} Stops</strong>
              </div>
            </div>

            {/* Stop Sequence preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
              {route.stops.map((stop, idx) => (
                <React.Fragment key={idx}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', background: '#EEF2F6', padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap' }}>
                    {stop}
                  </span>
                  {idx < route.stops.length - 1 && <ArrowRight size={12} color="#CBD5E1" />}
                </React.Fragment>
              ))}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectRouteTrack) onSelectRouteTrack(route);
              }}
              style={{
                marginTop: 14,
                width: '100%',
                background: '#1A5CE5',
                color: 'white',
                border: 'none',
                padding: '10px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <Bus size={16} /> Track Route {route.number} Buses Live
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
