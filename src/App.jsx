import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import QuickActions from './components/QuickActions';
import NearbyBanner from './components/NearbyBanner';
import NearestStopCard from './components/NearestStopCard';
import MapView from './components/MapView';
import RoutesView from './components/RoutesView';
import ScheduleView from './components/ScheduleView';
import AllBusesView from './components/AllBusesView';
import BottomNav from './components/BottomNav';
import DriverPanel from './components/DriverPanel';
import { BUSES_LIST } from './data/busData';
import { Smartphone, Monitor, UserCheck, SplitSquareVertical, Database } from 'lucide-react';

export default function App() {
  const [buses, setBuses] = useState(BUSES_LIST);
  const [panelMode, setPanelMode] = useState('dual'); // 'passenger', 'driver', 'dual'
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBus, setSelectedBus] = useState(null);
  const [currentTime, setCurrentTime] = useState('1:41');
  const [isMongoConnected, setIsMongoConnected] = useState(false);

  // Fetch initial bus data from Express MongoDB Backend API
  useEffect(() => {
    const fetchMongoDBData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/buses');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setBuses(data);
            setIsMongoConnected(true);
          }
        }
      } catch (err) {
        console.log('MongoDB Backend API offline. Using local dataset.');
      }
    };
    fetchMongoDBData();
  }, []);

  // Live Time clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Sync Live GPS Location from Driver Panel to Passenger App and MongoDB Backend
  const handleUpdateBusLocation = async (busId, newCoords) => {
    setBuses((prevBuses) =>
      prevBuses.map((b) => {
        if (b.id === busId || b.busId === busId) {
          return { ...b, ...newCoords };
        }
        return b;
      })
    );

    // Save location update to MongoDB Database
    try {
      await fetch(`http://localhost:5000/api/buses/${busId}/location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoords)
      });
    } catch (err) {
      // Quiet fallback if offline
    }
  };

  // Sync Bus Status & Capacity from Driver Panel
  const handleUpdateBusDetails = (busId, newDetails) => {
    setBuses((prevBuses) =>
      prevBuses.map((b) => {
        if (b.id === busId || b.busId === busId) {
          return { ...b, ...newDetails };
        }
        return b;
      })
    );
  };

  // Track bus trigger from Home tab or All Buses tab -> automatically switches to Map view with target bus selected
  const handleTrackBus = (bus) => {
    setSelectedBus(bus);
    setActiveTab('map');
  };

  // Filter bus list based on search query (Bus number, name, destination, or origin)
  const filteredBuses = buses.filter((bus) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = (bus.name || '').toLowerCase();
    const num = (bus.number || '').toLowerCase();
    const dest = (bus.destination || '').toLowerCase();
    const orig = (bus.origin || '').toLowerCase();
    return name.includes(q) || num.includes(q) || dest.includes(q) || orig.includes(q);
  });

  return (
    <div className="app-container">
      {/* Panel View Selector Header */}
      <div className="mode-bar" style={{ maxWidth: '1000px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src="/bec-logo.svg"
            alt="Bhubaneswar Engineering College Logo"
            style={{ width: 44, height: 44, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}
          />
          <div>
            <h1>🚌 Bhubaneswar Engineering College (BEC) Bus Tracker</h1>
            <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, color: isMongoConnected ? '#4ADE80' : '#CBD5E1' }}>
              <Database size={14} />
              <span>MongoDB Database: {isMongoConnected ? 'CONNECTED (Live MongoDB API)' : 'ACTIVE (MongoDB Express Ready)'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className={`toggle-btn ${panelMode === 'passenger' ? 'active-mode' : ''}`}
            onClick={() => setPanelMode('passenger')}
          >
            <Smartphone size={14} /> Passenger App
          </button>
          <button
            className={`toggle-btn ${panelMode === 'driver' ? 'active-mode' : ''}`}
            onClick={() => setPanelMode('driver')}
          >
            <UserCheck size={14} /> Driver Console
          </button>
          <button
            className={`toggle-btn ${panelMode === 'dual' ? 'active-mode' : ''}`}
            onClick={() => setPanelMode('dual')}
          >
            <SplitSquareVertical size={14} /> Dual Side-by-Side Panel
          </button>
        </div>
      </div>

      {/* Main Dual or Single Panel Layout */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          gap: '24px',
          justifyContent: 'center',
          alignItems: 'flex-start',
          maxWidth: panelMode === 'dual' ? '1000px' : '430px'
        }}
      >
        {/* DRIVER PANEL VIEW */}
        {(panelMode === 'driver' || panelMode === 'dual') && (
          <div style={{ flex: 1, minWidth: '320px', maxWidth: panelMode === 'dual' ? '460px' : '100%' }}>
            <DriverPanel
              activeBus={selectedBus}
              onUpdateBusLocation={handleUpdateBusLocation}
              onUpdateBusDetails={handleUpdateBusDetails}
            />
          </div>
        )}

        {/* PUBLIC PASSENGER APP VIEW */}
        {(panelMode === 'passenger' || panelMode === 'dual') && (
          <div className="phone-frame" style={{ flex: 1, margin: 0 }}>
            {/* Header matching exact photo specifications */}
            <Header
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              currentTime={currentTime}
            />

            {/* Dynamic Scrollable Content Area */}
            <main className="app-content">
              {activeTab === 'home' && (
                <>
                  {/* 2x2 Quick Actions Cards Grid */}
                  <QuickActions activeTab={activeTab} setActiveTab={setActiveTab} />

                  {/* Nearby Banner */}
                  <NearbyBanner onSeeAll={() => setActiveTab('map')} />

                  {/* Nearest Bus Stop Section for Patia to Pitapalli Route */}
                  <NearestStopCard
                    stopName="Patia Square (KIIT)"
                    walkTime="2 min"
                    buses={filteredBuses}
                    onTrackBus={handleTrackBus}
                    onSeeAllStops={() => setActiveTab('all_buses')}
                  />
                </>
              )}

              {activeTab === 'all_buses' && (
                <AllBusesView
                  buses={buses}
                  onTrackBus={handleTrackBus}
                />
              )}

              {activeTab === 'map' && (
                <MapView
                  selectedBus={selectedBus}
                  setSelectedBus={setSelectedBus}
                />
              )}

              {activeTab === 'routes' && (
                <RoutesView
                  onSelectRouteTrack={(route) => {
                    const bus = buses.find((b) => b.routeId === route.id) || buses[0];
                    handleTrackBus(bus);
                  }}
                />
              )}

              {activeTab === 'schedule' && (
                <ScheduleView />
              )}
            </main>

            {/* Fixed Bottom Navigation Bar */}
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        )}
      </div>
    </div>
  );
}
