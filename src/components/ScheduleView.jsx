import React, { useState } from 'react';
import { BUS_SCHEDULES } from '../data/busData';
import { Calendar, Clock, Bus, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ScheduleView() {
  const [selectedRoute, setSelectedRoute] = useState(BUS_SCHEDULES[0]);

  return (
    <div style={{ paddingBottom: '20px' }}>
      <div className="section-header">
        <h2 className="section-title">Bus Schedules</h2>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1A5CE5', background: '#EBF2FF', padding: '4px 10px', borderRadius: 12 }}>
          Daily Timetables
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
        {BUS_SCHEDULES.map((sched) => {
          const isSelected = selectedRoute.routeNumber === sched.routeNumber;
          return (
            <div
              key={sched.routeNumber}
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '18px',
                border: `2px solid ${isSelected ? '#1A5CE5' : 'rgba(229, 231, 235, 0.7)'}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedRoute(sched)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      backgroundColor: '#1A5CE5',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      padding: '4px 12px',
                      borderRadius: '10px'
                    }}
                  >
                    Bus {sched.routeNumber}
                  </span>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827' }}>{sched.name}</h3>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, background: '#F8FAFC', padding: 10, borderRadius: 12, marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, display: 'block' }}>Frequency</span>
                  <strong style={{ fontSize: '0.85rem', color: '#10B981' }}>{sched.frequency}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, display: 'block' }}>First Bus</span>
                  <strong style={{ fontSize: '0.85rem', color: '#334155' }}>{sched.firstBus}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, display: 'block' }}>Last Bus</span>
                  <strong style={{ fontSize: '0.85rem', color: '#334155' }}>{sched.lastBus}</strong>
                </div>
              </div>

              {/* Timings Pills */}
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={14} color="#1A5CE5" /> Departure Timings:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {sched.timings.map((time, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#1E293B',
                      background: '#F1F5F9',
                      padding: '4px 10px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    {time}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
