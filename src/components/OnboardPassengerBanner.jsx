import React, { useState, useEffect, useRef } from 'react';
import { Bus, Users, Navigation, Radio, ShieldCheck, CheckCircle2, X, AlertCircle, UserCheck } from 'lucide-react';

export default function OnboardPassengerBanner({ buses = [], onCrowdLocationPing }) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedBusId, setSelectedBusId] = useState(buses[0]?.id || 'bus_108');
  const [userRole, setUserRole] = useState('Student'); // 'Student' or 'Staff'
  const [isSharing, setIsSharing] = useState(false);
  const [pingCount, setPingCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [gpsError, setGpsError] = useState('');

  const watchIdRef = useRef(null);

  const selectedBus = buses.find((b) => b.id === selectedBusId || b.busId === selectedBusId) || buses[0];

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const handleStartSharing = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsError('');
    setIsSharing(true);
    setStatusMessage(`Acquiring satellite GPS lock for ${userRole}...`);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed } = pos.coords;
        setPingCount((prev) => prev + 1);
        setStatusMessage(`Live GPS broadcast active (${userRole} - Accuracy: ${Math.round(pos.coords.accuracy)}m)`);

        // Send to parent & Express backend
        if (onCrowdLocationPing) {
          onCrowdLocationPing(selectedBusId, {
            lat: latitude,
            lng: longitude,
            role: userRole,
            speed: speed ? Math.round(speed * 3.6) : null
          });
        }
      },
      (err) => {
        setGpsError(`GPS Error: ${err.message}. Please allow location permission.`);
        setIsSharing(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000
      }
    );
  };

  const handleStopSharing = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsSharing(false);
    setStatusMessage('');
    if (onCrowdLocationPing) {
      onCrowdLocationPing(selectedBusId, { action: 'stop', role: userRole });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        borderRadius: '20px',
        padding: '18px 20px',
        marginBottom: '20px',
        color: '#0F172A',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
        position: 'relative'
      }}
    >
      {/* Top Banner Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: isSharing ? 'rgba(34, 197, 94, 0.15)' : '#E0F2FE',
              border: isSharing ? '1px solid #22C55E' : '1px solid #7DD3FC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {isSharing ? (
              <Radio size={24} color="#16A34A" className="pulse-icon" />
            ) : (
              <Users size={24} color="#0284C7" />
            )}
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', letterSpacing: 0.6 }}>
              👥 Student & Staff Onboard GPS Sharing
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
              Sitting inside a bus right now?
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            padding: 4
          }}
        >
          <X size={18} />
        </button>
      </div>

      <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: 8, lineHeight: '1.4' }}>
        Student ya College Staff agar bus pe bethe hain, toh live GPS ON karke baki students ko bus ki real location dikha sakte hain!
      </p>

      {/* Role Selection & Select Bus Dropdown */}
      <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, background: '#F1F5F9', padding: 3, borderRadius: 10, border: '1px solid #E2E8F0' }}>
          <button
            onClick={() => setUserRole('Student')}
            disabled={isSharing}
            style={{
              background: userRole === 'Student' ? '#1A5CE5' : 'transparent',
              color: userRole === 'Student' ? '#FFFFFF' : '#64748B',
              border: 'none',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            🎓 Student
          </button>
          <button
            onClick={() => setUserRole('Staff')}
            disabled={isSharing}
            style={{
              background: userRole === 'Staff' ? '#1A5CE5' : 'transparent',
              color: userRole === 'Staff' ? '#FFFFFF' : '#64748B',
              border: 'none',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            👔 Staff
          </button>
        </div>

        <select
          value={selectedBusId}
          onChange={(e) => setSelectedBusId(e.target.value)}
          disabled={isSharing}
          style={{
            flex: 1,
            minWidth: '180px',
            background: '#F8FAFC',
            color: '#0F172A',
            border: '1px solid #CBD5E1',
            borderRadius: '12px',
            padding: '8px 12px',
            fontSize: '0.84rem',
            fontWeight: 700,
            outline: 'none'
          }}
        >
          {buses.map((b) => (
            <option key={b.id || b.busId} value={b.id || b.busId}>
              🚌 {b.name} ({b.number})
            </option>
          ))}
        </select>

        {!isSharing ? (
          <button
            onClick={handleStartSharing}
            style={{
              background: 'linear-gradient(135deg, #1A5CE5 0%, #1D4ED8 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 16px',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 12px rgba(26, 92, 229, 0.3)'
            }}
          >
            <Navigation size={15} />
            <span>Turn ON Live GPS</span>
          </button>
        ) : (
          <button
            onClick={handleStopSharing}
            style={{
              background: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 16px',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <X size={15} />
            <span>Stop GPS Sharing</span>
          </button>
        )}
      </div>

      {/* Active Sharing Status */}
      {isSharing && (
        <div
          style={{
            marginTop: 14,
            background: '#F0FDF4',
            border: '1px solid #86EFAC',
            borderRadius: '12px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.78rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
            <span style={{ color: '#15803D', fontWeight: 800 }}>{statusMessage}</span>
          </div>
          <span style={{ color: '#475569', fontWeight: 700 }}>{pingCount} pings sent</span>
        </div>
      )}

      {gpsError && (
        <div style={{ marginTop: 10, color: '#DC2626', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertCircle size={14} color="#DC2626" />
          <span>{gpsError}</span>
        </div>
      )}
    </div>
  );
}
