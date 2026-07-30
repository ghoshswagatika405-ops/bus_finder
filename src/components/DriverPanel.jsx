import React, { useState, useEffect, useRef } from 'react';
import { Bus, Navigation, Play, Pause, Radio, Gauge, Users, MapPin, ArrowRightLeft, Clock, Timer, Smartphone, Cpu, AlertTriangle, CheckCircle2, Lock, KeyRound, LogOut, ShieldCheck, UserCheck } from 'lucide-react';
import { BUSES_LIST, BUS_STOPS, REVERSE_BUS_STOPS } from '../data/busData';

// Valid driver PIN mapping
const DRIVER_PINS = {
  '1234': 'Master BEC Driver',
  '1080': 'Driver (Bus 108 - BEC Rider)',
  '2070': 'Driver (Bus 207 - Koustuv Rider)',
  '3050': 'Driver (Bus 305 - AIIMS Rider)'
};

// Haversine distance calculator between 2 GPS coordinates (in km)
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find nearest stop from a given lat/lng
function getNearestStop(lat, lng, stopsList) {
  let minDistance = Infinity;
  let closestIndex = 0;

  stopsList.forEach((stop, idx) => {
    const dist = getHaversineDistance(lat, lng, stop.lat, stop.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestIndex = idx;
    }
  });

  return { stop: stopsList[closestIndex], index: closestIndex };
}

export default function DriverPanel({ activeBus, onUpdateBusLocation, onUpdateBusDetails }) {
  // Driver Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('bec_driver_authenticated') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [driverTitle, setDriverTitle] = useState(() => {
    return localStorage.getItem('bec_driver_title') || 'BEC Verified Driver';
  });

  const [selectedBusId, setSelectedBusId] = useState(activeBus ? activeBus.id : BUSES_LIST[0].id);
  const [direction, setDirection] = useState('FORWARD');
  const [trackingMode, setTrackingMode] = useState('REAL_GPS'); // 'REAL_GPS' (Phone in Bus) vs 'SIMULATED' (Demo)
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [speed, setSpeed] = useState(45);
  const [capacity, setCapacity] = useState('58% Full');
  const [status, setStatus] = useState('Location OFF');
  const [currentStopIndex, setCurrentStopIndex] = useState(0);

  // Real GPS Phone Location States
  const [realCoords, setRealCoords] = useState(null); // { lat, lng }
  const [gpsAccuracy, setGpsAccuracy] = useState(null); // in meters
  const [gpsError, setGpsError] = useState(null);
  const prevPositionRef = useRef(null);

  // Live Trip Timing States
  const [tripStartTime, setTripStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const activeStopsList = direction === 'FORWARD' ? BUS_STOPS : REVERSE_BUS_STOPS;
  const originName = direction === 'FORWARD' ? 'Baramunda BSABT' : 'BEC Campus (Pitapalli)';
  const destinationName = direction === 'FORWARD' ? 'BEC Campus (Pitapalli)' : 'Baramunda BSABT';

  // Driver Login Verification
  const handleLogin = (e) => {
    e.preventDefault();
    const cleanPin = pinInput.trim();
    if (DRIVER_PINS[cleanPin]) {
      const title = DRIVER_PINS[cleanPin];
      setIsAuthenticated(true);
      setDriverTitle(title);
      setAuthError('');
      localStorage.setItem('bec_driver_authenticated', 'true');
      localStorage.setItem('bec_driver_title', title);
    } else {
      setAuthError('❌ Invalid Passcode! (Default Security PIN is 1234)');
    }
  };

  // Driver Logout
  const handleLogout = () => {
    if (isTransmitting) {
      toggleLocationBroadcast();
    }
    setIsAuthenticated(false);
    setPinInput('');
    setAuthError('');
    localStorage.removeItem('bec_driver_authenticated');
    localStorage.removeItem('bec_driver_title');
  };

  // Live Elapsed Seconds Timer when Ride is ON
  useEffect(() => {
    let timer = null;
    if (isTransmitting) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTransmitting]);

  // Format Elapsed Time string (MM:SS)
  const formatElapsedTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    const secs = (totalSecs % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // 1. REAL DEVICE GPS TRACKING EFFECT (Phone in Bus)
  useEffect(() => {
    if (!isTransmitting || trackingMode !== 'REAL_GPS') return;

    if (!('geolocation' in navigator)) {
      setGpsError('Web Geolocation is not supported by your mobile browser.');
      return;
    }

    setGpsError(null);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed: rawSpeed, accuracy } = position.coords;
        const currentCoords = { lat: latitude, lng: longitude };
        setRealCoords(currentCoords);
        setGpsAccuracy(Math.round(accuracy));
        setGpsError(null);

        // Compute Speed in km/h
        let currentSpeed = speed;
        if (rawSpeed !== null && rawSpeed !== undefined && rawSpeed >= 0) {
          currentSpeed = Math.round(rawSpeed * 3.6);
        } else if (prevPositionRef.current) {
          const timeDiffSec = (position.timestamp - prevPositionRef.current.timestamp) / 1000;
          if (timeDiffSec > 0) {
            const distKm = getHaversineDistance(
              prevPositionRef.current.lat,
              prevPositionRef.current.lng,
              latitude,
              longitude
            );
            currentSpeed = Math.round((distKm / timeDiffSec) * 3600);
          }
        }
        prevPositionRef.current = { lat: latitude, lng: longitude, timestamp: position.timestamp };
        if (currentSpeed >= 0) setSpeed(currentSpeed);

        // Determine Nearest Bus Stop along route
        const { stop, index } = getNearestStop(latitude, longitude, activeStopsList);
        setCurrentStopIndex(index);

        const newStatus = 'Live Phone GPS Broadcast';
        setStatus(newStatus);

        if (onUpdateBusLocation) {
          onUpdateBusLocation(selectedBusId, {
            isLocationActive: true,
            isRealGps: true,
            direction,
            origin: originName,
            destination: destinationName,
            lat: latitude,
            lng: longitude,
            speed: `${currentSpeed} km/h`,
            capacity,
            status: newStatus,
            currentStopName: stop?.name || 'In Transit',
            gpsAccuracy: Math.round(accuracy),
            tripStartTime: tripStartTime || formatCurrentTime(),
            elapsedTime: formatElapsedTime(elapsedSeconds)
          });
        }
      },
      (err) => {
        console.warn('GPS Location Error:', err);
        let errorMsg = 'GPS Error: ' + err.message;
        if (err.code === 1) {
          errorMsg = '⚠️ Location permission denied! Please allow GPS access on your phone to track bus live.';
        } else if (err.code === 2) {
          errorMsg = '⚠️ Phone GPS position unavailable. Waiting for satellite lock...';
        } else if (err.code === 3) {
          errorMsg = '⚠️ GPS request timed out. Retrying satellite connection...';
        }
        setGpsError(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isTransmitting, trackingMode, selectedBusId, capacity, direction, activeStopsList, tripStartTime, elapsedSeconds, onUpdateBusLocation]);

  // Helper for current time format
  const formatCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  // 2. ROUTE SIMULATION LOOP (Demo Mode)
  useEffect(() => {
    if (!isTransmitting || trackingMode !== 'SIMULATED') return;

    const interval = setInterval(() => {
      setCurrentStopIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % activeStopsList.length;
        const targetStop = activeStopsList[nextIndex];

        setTimeout(() => {
          if (onUpdateBusLocation) {
            onUpdateBusLocation(selectedBusId, {
              isLocationActive: true,
              isRealGps: false,
              direction,
              origin: originName,
              destination: destinationName,
              lat: targetStop.lat,
              lng: targetStop.lng,
              speed: `${speed} km/h`,
              capacity,
              status: 'Simulated Route Demo',
              currentStopName: targetStop.name,
              tripStartTime,
              elapsedTime: formatElapsedTime(elapsedSeconds)
            });
          }
        }, 0);

        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isTransmitting, trackingMode, selectedBusId, speed, capacity, direction, activeStopsList, tripStartTime, elapsedSeconds, onUpdateBusLocation]);

  // Toggle Driver Location ON / OFF (Start Ride)
  const toggleLocationBroadcast = () => {
    const nextState = !isTransmitting;
    setIsTransmitting(nextState);

    const formattedStartTime = formatCurrentTime();

    if (nextState) {
      setTripStartTime(formattedStartTime);
      setElapsedSeconds(0);
    } else {
      setTripStartTime(null);
    }

    const newStatus = nextState
      ? trackingMode === 'REAL_GPS'
        ? 'Live Phone GPS'
        : 'Live Simulated Moving'
      : 'Driver Location OFF';
    setStatus(newStatus);

    const targetCoord = realCoords && trackingMode === 'REAL_GPS'
      ? [realCoords.lat, realCoords.lng]
      : [activeStopsList[currentStopIndex].lat, activeStopsList[currentStopIndex].lng];

    if (onUpdateBusLocation) {
      onUpdateBusLocation(selectedBusId, {
        isLocationActive: nextState,
        isRealGps: trackingMode === 'REAL_GPS',
        direction,
        origin: originName,
        destination: destinationName,
        lat: targetCoord[0],
        lng: targetCoord[1],
        speed: nextState ? `${speed} km/h` : '0 km/h',
        capacity,
        status: newStatus,
        currentStopName: activeStopsList[currentStopIndex]?.name,
        tripStartTime: nextState ? formattedStartTime : null,
        elapsedTime: nextState ? '00:00' : null
      });
    }
  };

  // Switch Journey Direction (Forward vs Reverse Return)
  const handleDirectionSwitch = (newDir) => {
    setDirection(newDir);
    setCurrentStopIndex(0);
    const stops = newDir === 'FORWARD' ? BUS_STOPS : REVERSE_BUS_STOPS;
    const targetCoord = [stops[0].lat, stops[0].lng];

    if (onUpdateBusLocation) {
      onUpdateBusLocation(selectedBusId, {
        direction: newDir,
        origin: newDir === 'FORWARD' ? 'Baramunda BSABT' : 'BEC Campus (Pitapalli)',
        destination: newDir === 'FORWARD' ? 'BEC Campus (Pitapalli)' : 'Baramunda BSABT',
        lat: targetCoord[0],
        lng: targetCoord[1],
        currentStopName: stops[0].name
      });
    }
  };

  // -------------------------------------------------------------
  // RENDER: DRIVER AUTHENTICATION LOCK SCREEN (If not logged in)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '30px 24px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
          border: '1px solid #E2E8F0',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center'
        }}
      >
        {/* BEC Logo Watermark */}
        <img
          src="/bec-logo.svg"
          alt="BEC Logo Watermark"
          style={{
            position: 'absolute',
            bottom: '-40px',
            right: '-40px',
            width: '260px',
            height: '260px',
            opacity: 0.1,
            pointerEvents: 'none'
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#EBF2FF', color: '#1A5CE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', border: '2px solid #BFDBFE' }}>
            <Lock size={32} />
          </div>

          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1A5CE5', background: '#EBF2FF', padding: '4px 12px', borderRadius: 12, textTransform: 'uppercase', letterSpacing: 0.6 }}>
            BEC Driver Access Portal
          </span>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111827', marginTop: 8, marginBottom: 6 }}>
            Driver Authentication Required
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: '340px', margin: '0 auto 24px auto', lineHeight: 1.4 }}>
            Enter your driver security passcode to access the vehicle control console & broadcast live GPS location.
          </p>

          <form onSubmit={handleLogin} style={{ maxWidth: '320px', margin: '0 auto' }}>
            <div style={{ marginBottom: 16, textAlign: 'left' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                Security PIN Passcode:
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={18} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  placeholder="Enter 4-Digit Security PIN"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  maxLength={6}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '14px',
                    border: '2px solid #CBD5E1',
                    fontSize: '1rem',
                    fontWeight: 700,
                    outline: 'none',
                    letterSpacing: 2,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {authError && (
              <div style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', padding: '10px 14px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 700, marginBottom: 16, textAlign: 'left' }}>
                {authError}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                background: '#1A5CE5',
                color: '#FFFFFF',
                border: 'none',
                padding: '14px',
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: '0 4px 14px rgba(26, 92, 229, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              <ShieldCheck size={20} />
              AUTHENTICATE & LOGIN
            </button>
          </form>

          {/* QUICK PIN DEMO HINT */}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px dashed #E2E8F0', fontSize: '0.78rem', color: '#64748B' }}>
            <span style={{ fontWeight: 700, color: '#334155' }}>💡 Authorized Driver Passcode:</span>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => setPinInput('1234')}
                style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#1E293B', padding: '4px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Use PIN: 1234
              </button>
              <button
                onClick={() => setPinInput('1080')}
                style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#1E293B', padding: '4px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Bus 108 PIN: 1080
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: AUTHENTICATED DRIVER CONSOLE (Full Controls)
  // -------------------------------------------------------------
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        border: '1px solid #E2E8F0',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* WATERMARK BEC LOGO */}
      <img
        src="/bec-logo.svg"
        alt="BEC Logo Watermark"
        style={{
          position: 'absolute',
          bottom: '-30px',
          right: '-30px',
          width: '260px',
          height: '260px',
          opacity: 0.14,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Header with BEC Logo Crest & Authenticated Session Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src="/bec-logo.svg"
            alt="BEC College Crest"
            style={{ width: 44, height: 44, borderRadius: '50%', background: '#F8FAFC', padding: 2, border: '1px solid #CBD5E1', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534', background: '#DCFCE7', padding: '3px 8px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: 0.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <UserCheck size={12} /> {driverTitle}
              </span>
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', marginTop: 3 }}>
              Bhubaneswar Engineering College
            </h2>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Logout Driver Session"
          style={{
            background: '#F1F5F9',
            border: '1px solid #CBD5E1',
            color: '#64748B',
            padding: '6px 10px',
            borderRadius: 12,
            fontSize: '0.75rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <LogOut size={14} /> Exit
        </button>
      </div>

      {/* GPS TRACKING SOURCE SELECTOR (REAL PHONE GPS vs SIMULATION DEMO) */}
      <div style={{ background: '#F0F9FF', border: '1.5px solid #BAE6FD', padding: '14px', borderRadius: '16px', marginBottom: 20, position: 'relative', zIndex: 1 }}>
        <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0369A1', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Navigation size={16} color="#0284C7" /> Select Location Tracking Source:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          <button
            onClick={() => setTrackingMode('REAL_GPS')}
            style={{
              padding: '12px 10px',
              borderRadius: 12,
              border: `2px solid ${trackingMode === 'REAL_GPS' ? '#0284C7' : '#CBD5E1'}`,
              background: trackingMode === 'REAL_GPS' ? '#0284C7' : '#FFFFFF',
              color: trackingMode === 'REAL_GPS' ? '#FFFFFF' : '#334155',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Smartphone size={16} /> 📱 Real Mobile GPS
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, opacity: 0.9 }}>
              Phone in Moving Bus
            </span>
          </button>

          <button
            onClick={() => setTrackingMode('SIMULATED')}
            style={{
              padding: '12px 10px',
              borderRadius: 12,
              border: `2px solid ${trackingMode === 'SIMULATED' ? '#4F46E5' : '#CBD5E1'}`,
              background: trackingMode === 'SIMULATED' ? '#4F46E5' : '#FFFFFF',
              color: trackingMode === 'SIMULATED' ? '#FFFFFF' : '#334155',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Cpu size={16} /> 🤖 Route Simulation
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, opacity: 0.9 }}>
              Auto-walk Route (Demo)
            </span>
          </button>
        </div>
      </div>

      {/* GPS PERMISSION / ERROR BANNER */}
      {gpsError && isTransmitting && (
        <div style={{ background: '#FEF2F2', border: '1.5px solid #FCA5A5', padding: '12px 16px', borderRadius: '14px', marginBottom: 20, color: '#991B1B', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
          <AlertTriangle size={20} color="#DC2626" style={{ flexShrink: 0 }} />
          <div>
            <div>{gpsError}</div>
            <button
              onClick={() => setTrackingMode('SIMULATED')}
              style={{ marginTop: 6, background: '#DC2626', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
            >
              Switch to Simulated Route Demo
            </button>
          </div>
        </div>
      )}

      {/* LIVE RIDE START TIME & ELAPSED TIMER BOX */}
      {isTransmitting && (
        <div style={{ background: '#ECFDF5', border: '1.5px solid #A7F3D0', padding: '14px 18px', borderRadius: '16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={14} /> Live Ride Departure Time
            </span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#065F46', marginTop: 2 }}>
              🚀 Started at {tripStartTime}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
              <Timer size={14} /> Elapsed Time
            </span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10B981', marginTop: 2 }}>
              ⏱️ {formatElapsedTime(elapsedSeconds)}
            </div>
          </div>
        </div>
      )}

      {/* JOURNEY DIRECTION SELECTOR */}
      <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 16, border: '1px solid #E2E8F0', marginBottom: 20, position: 'relative', zIndex: 1 }}>
        <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <ArrowRightLeft size={16} color="#1A5CE5" /> Select Bus Journey Direction:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          <button
            onClick={() => handleDirectionSwitch('FORWARD')}
            style={{
              padding: '10px 8px',
              borderRadius: 12,
              border: `2px solid ${direction === 'FORWARD' ? '#1A5CE5' : '#E2E8F0'}`,
              background: direction === 'FORWARD' ? '#1A5CE5' : '#FFFFFF',
              color: direction === 'FORWARD' ? '#FFFFFF' : '#475569',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            ➡️ Forward Route
            <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, opacity: 0.9, marginTop: 2 }}>
              Baramunda ➔ BEC
            </span>
          </button>

          <button
            onClick={() => handleDirectionSwitch('REVERSE')}
            style={{
              padding: '10px 8px',
              borderRadius: 12,
              border: `2px solid ${direction === 'REVERSE' ? '#7C3AED' : '#E2E8F0'}`,
              background: direction === 'REVERSE' ? '#7C3AED' : '#FFFFFF',
              color: direction === 'REVERSE' ? '#FFFFFF' : '#475569',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            ⬅️ Reverse Return
            <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, opacity: 0.9, marginTop: 2 }}>
              BEC ➔ Baramunda
            </span>
          </button>
        </div>
      </div>

      {/* Current Location Stop Display Box */}
      <div style={{ background: isTransmitting ? (trackingMode === 'REAL_GPS' ? 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)' : direction === 'FORWARD' ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)') : 'linear-gradient(135deg, #64748B 0%, #334155 100%)', color: '#FFFFFF', padding: '18px', borderRadius: '18px', marginBottom: 20, boxShadow: '0 6px 20px rgba(0,0,0,0.15)', transition: 'all 0.3s ease', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.8, opacity: 0.85, fontWeight: 800 }}>
            {isTransmitting
              ? trackingMode === 'REAL_GPS'
                ? `📱 REAL PHONE GPS ACTIVE (${direction})`
                : `Stop ${currentStopIndex + 1} of ${activeStopsList.length} (${direction})`
              : 'GPS Location Broadcast Disabled'}
          </span>
          <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: 10 }}>
            {isTransmitting ? '● RIDE ACTIVE' : '○ RIDE NOT STARTED'}
          </span>
        </div>

        <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
          <MapPin size={22} color="#FFFFFF" style={{ flexShrink: 0 }} />
          <span>{isTransmitting ? activeStopsList[currentStopIndex]?.name : 'Start Ride to Broadcast Location'}</span>
        </div>

        {/* Real Coordinates & GPS Accuracy display */}
        {isTransmitting && trackingMode === 'REAL_GPS' && realCoords && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem' }}>
            <div>
              📍 Lat: {realCoords.lat.toFixed(5)}°, Lng: {realCoords.lng.toFixed(5)}°
            </div>
            {gpsAccuracy && (
              <span style={{ background: 'rgba(255,255,255,0.25)', padding: '2px 8px', borderRadius: 8, fontWeight: 800 }}>
                🎯 Satellite Fix: ±{gpsAccuracy}m
              </span>
            )}
          </div>
        )}

        <div style={{ fontSize: '0.78rem', opacity: 0.88, marginTop: 6, fontWeight: 600 }}>
          Journey: {originName} ➔ {destinationName}
        </div>
      </div>

      {/* Bus Vehicle Selector */}
      <div style={{ marginBottom: 20, position: 'relative', zIndex: 1 }}>
        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 8 }}>
          Select Operating Bus Vehicle:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {BUSES_LIST.map((b) => (
            <button
              key={b.id || b.busId}
              onClick={() => {
                setSelectedBusId(b.id || b.busId);
                setIsTransmitting(false);
              }}
              style={{
                background: selectedBusId === (b.id || b.busId) ? '#1A5CE5' : '#F8FAFC',
                color: selectedBusId === (b.id || b.busId) ? '#FFFFFF' : '#334155',
                border: `2px solid ${selectedBusId === (b.id || b.busId) ? '#1A5CE5' : '#E2E8F0'}`,
                padding: '12px 8px',
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              Bus {b.number}
              <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, opacity: 0.85, marginTop: 2 }}>
                {b.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* START BUS RIDE & GPS TRANSMISSION TOGGLE BUTTON */}
      <button
        onClick={toggleLocationBroadcast}
        style={{
          width: '100%',
          background: isTransmitting ? '#EF4444' : trackingMode === 'REAL_GPS' ? '#0284C7' : '#10B981',
          color: '#FFFFFF',
          border: 'none',
          padding: '14px',
          borderRadius: '16px',
          fontWeight: 800,
          fontSize: '0.95rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          boxShadow: isTransmitting ? '0 4px 14px rgba(239, 68, 68, 0.3)' : '0 4px 14px rgba(2, 132, 199, 0.3)',
          marginBottom: 24,
          transition: 'all 0.2s ease',
          position: 'relative',
          zIndex: 1
        }}
      >
        {isTransmitting ? <Pause size={20} /> : <Play size={20} />}
        {isTransmitting
          ? 'END RIDE & PAUSE BROADCAST'
          : trackingMode === 'REAL_GPS'
            ? '📱 START REAL BUS PHONE GPS TRACKING'
            : '🚀 START SIMULATED ROUTE DEMO'}
      </button>

      {/* Speed & Seats Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 20, position: 'relative', zIndex: 1 }}>
        {/* Speed Slider / Display */}
        <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 16, border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Gauge size={16} color="#1A5CE5" /> Speed
            </span>
            <strong style={{ fontSize: '0.9rem', color: '#1A5CE5', fontWeight: 800 }}>{isTransmitting ? `${speed} km/h` : '0 km/h'}</strong>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            value={speed}
            disabled={!isTransmitting || trackingMode === 'REAL_GPS'}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#1A5CE5', cursor: (isTransmitting && trackingMode !== 'REAL_GPS') ? 'pointer' : 'not-allowed' }}
          />
          {trackingMode === 'REAL_GPS' && isTransmitting && (
            <div style={{ fontSize: '0.68rem', color: '#0284C7', fontWeight: 700, marginTop: 4 }}>
              ⚡ Speed calculated live from GPS sensor
            </div>
          )}
        </div>

        {/* Occupancy Selector */}
        <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 16, border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Users size={16} color="#10B981" /> Seats Occupancy
          </span>
          <select
            value={capacity}
            disabled={!isTransmitting}
            onChange={(e) => setCapacity(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontWeight: 700, fontSize: '0.8rem' }}
          >
            <option value="25% Full">25% Seats Filled</option>
            <option value="45% Full">45% Seats Filled</option>
            <option value="58% Full">58% Seats Filled</option>
            <option value="75% Full">75% Seats Filled</option>
            <option value="90% Full (Crowded)">90% Seats Filled</option>
          </select>
        </div>
      </div>
    </div>
  );
}

