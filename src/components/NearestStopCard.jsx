import React, { useState } from 'react';
import { Bus, Footprints, MapPin } from 'lucide-react';
import { BUS_STOPS } from '../data/busData';

export default function NearestStopCard({
  stopName = 'Baramunda BSABT',
  walkTime = '2 min',
  buses = [],
  onTrackBus,
  onSeeAllStops
}) {
  const [selectedStopName, setSelectedStopName] = useState(stopName);
  const currentStopObj = BUS_STOPS.find((s) => s.name === selectedStopName) || BUS_STOPS[0];

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

        {/* Bus List */}
        <div className="bus-list">
          {buses.map((bus) => (
            <div key={bus.id || bus.busId} className="bus-item" onClick={() => onTrackBus(bus)}>
              <div className="bus-item-left">
                <div className="bus-icon-circle">
                  <Bus size={20} />
                </div>
                <div className="bus-details">
                  <div className="bus-number">Bus {bus.number} - {bus.name}</div>
                  <div className="bus-destination">{bus.destination}</div>
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
          ))}

          {buses.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#64748B', fontSize: '0.9rem' }}>
              No buses found matching your search.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
