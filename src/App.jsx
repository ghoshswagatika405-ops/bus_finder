import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import QuickActions from './components/QuickActions';
import NearbyBanner from './components/NearbyBanner';
import NearestStopCard from './components/NearestStopCard';
import MapView from './components/MapView';
import RoutesView from './components/RoutesView';
import ScheduleView from './components/ScheduleView';
import AllBusesView from './components/AllBusesView';
import LostAndFoundView from './components/LostAndFoundView';
import VoiceAssistantModal from './components/VoiceAssistantModal';
import BottomNav from './components/BottomNav';
import DriverPanel from './components/DriverPanel';
import ShareLocationModal from './components/ShareLocationModal';
import ComplaintModal from './components/ComplaintModal';
import OnboardPassengerBanner from './components/OnboardPassengerBanner';
import { BUSES_LIST } from './data/busData';
import { Smartphone, Monitor, UserCheck, SplitSquareVertical, Database, Menu, X, ShieldAlert } from 'lucide-react';
import './firebase';


export default function App() {
  const [buses, setBuses] = useState(BUSES_LIST);
  const [panelMode, setPanelMode] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 'passenger' : 'dual'));
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBus, setSelectedBus] = useState(null);
  const [currentTime, setCurrentTime] = useState('1:41');
  const [isMongoConnected, setIsMongoConnected] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareModalBus, setShareModalBus] = useState(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Proximity Distance & User Location State (Google Maps Style 500m, 1km, 2km radius search)
  const [userLocation, setUserLocation] = useState({
    lat: 20.2785,
    lng: 85.7892,
    name: 'Baramunda BSABT',
    isLiveGps: false
  });
  const [radiusFilter, setRadiusFilter] = useState('ALL');

  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Fetch initial bus data and poll Express Backend API every 3 seconds for live sync
  useEffect(() => {
    let isMounted = true;

    const fetchBackendData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/buses');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && data.length > 0) {
            setBuses((prev) => {
              // Merge server updates into state
              return data.map((serverBus) => {
                const local = prev.find((b) => b.id === serverBus.id || b.busId === serverBus.busId);
                return local ? { ...local, ...serverBus } : serverBus;
              });
            });
            setIsBackendConnected(true);
          }
        }
      } catch (err) {
        if (isMounted) setIsBackendConnected(false);
      }
    };

    fetchBackendData();
    const interval = setInterval(fetchBackendData, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
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

    setSelectedBus((prevSelected) => {
      if (prevSelected && (prevSelected.id === busId || prevSelected.busId === busId)) {
        return { ...prevSelected, ...newCoords };
      }
      return prevSelected;
    });

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

    setSelectedBus((prevSelected) => {
      if (prevSelected && (prevSelected.id === busId || prevSelected.busId === busId)) {
        return { ...prevSelected, ...newDetails };
      }
      return prevSelected;
    });
  };

  // Sync Student & Staff Crowdsourced Location Ping ("Where Is My Bus")
  const handleCrowdLocationPing = async (busId, crowdData) => {
    try {
      await fetch(`http://localhost:5000/api/buses/${busId}/crowd-location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crowdData)
      });
    } catch (err) {}
  };

  // Track bus trigger from Home tab or All Buses tab -> automatically switches to Map view with target bus selected
  const handleTrackBus = (bus) => {
    setSelectedBus(bus);
    setActiveTab('map');
  };

  const handleShareBus = (bus) => {
    setShareModalBus(bus || selectedBus || buses[0]);
    setIsShareModalOpen(true);
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
      {/* Panel View Selector Header with 3-Bar Hamburger Menu */}
      <div className="mode-bar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="/bec-logo.svg"
              alt="Bhubaneswar Engineering College Logo"
              style={{ width: 36, height: 36, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}
            />
            <div>
              <h1 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#FFFFFF', letterSpacing: '-0.2px' }}>
                🚌 BEC Bus Tracker
              </h1>
              <div style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, color: isBackendConnected ? '#4ADE80' : '#FBBF24' }}>
                <Database size={12} />
                <span>Backend API: {isBackendConnected ? '🟢 ONLINE & LIVE SYNC' : '🟡 ACTIVE (Express Mode)'}</span>
              </div>
            </div>
          </div>

          {/* Desktop Mode Toggle Buttons */}
          <div className="desktop-mode-btns" style={{ display: 'flex', gap: 8 }}>
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
              <SplitSquareVertical size={14} /> Dual View
            </button>
          </div>

          {/* Mobile 3-Bar (Hamburger) Menu Button */}
          <button
            className="mobile-hamburger-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: isMobileMenuOpen ? '#1A5CE5' : 'rgba(255, 255, 255, 0.14)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              borderRadius: 14,
              padding: '8px 12px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
            title="3-Bar Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            <span style={{ fontSize: '0.78rem' }}>Menu</span>
          </button>
        </div>

        {/* Mobile 3-Bar Hamburger Dropdown Menu */}
        {isMobileMenuOpen && (
          <div
            className="mobile-dropdown-menu"
            style={{
              width: '100%',
              marginTop: 12,
              paddingTop: 12,
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Select Display Mode:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              <button
                className={`toggle-btn ${panelMode === 'passenger' ? 'active-mode' : ''}`}
                onClick={() => {
                  setPanelMode('passenger');
                  setIsMobileMenuOpen(false);
                }}
                style={{ justifyContent: 'center', padding: '8px 6px', fontSize: '0.76rem' }}
              >
                <Smartphone size={13} /> Passenger
              </button>
              <button
                className={`toggle-btn ${panelMode === 'driver' ? 'active-mode' : ''}`}
                onClick={() => {
                  setPanelMode('driver');
                  setIsMobileMenuOpen(false);
                }}
                style={{ justifyContent: 'center', padding: '8px 6px', fontSize: '0.76rem' }}
              >
                <UserCheck size={13} /> Driver
              </button>
              <button
                className={`toggle-btn ${panelMode === 'dual' ? 'active-mode' : ''}`}
                onClick={() => {
                  setPanelMode('dual');
                  setIsMobileMenuOpen(false);
                }}
                style={{ justifyContent: 'center', padding: '8px 6px', fontSize: '0.76rem' }}
              >
                <SplitSquareVertical size={13} /> Dual
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Dual or Single Panel Layout */}
      <div className="main-layout-container">
        {/* DRIVER PANEL VIEW */}
        {(panelMode === 'driver' || panelMode === 'dual') && (
          <div className="driver-panel-wrapper" style={{ flex: panelMode === 'dual' ? '0 0 460px' : '1', maxWidth: panelMode === 'driver' ? '1000px' : '460px' }}>
            <DriverPanel
              activeBus={selectedBus}
              onUpdateBusLocation={handleUpdateBusLocation}
              onUpdateBusDetails={handleUpdateBusDetails}
              onShareBus={handleShareBus}
            />
          </div>
        )}

        {/* PUBLIC PASSENGER APP VIEW */}
        {(panelMode === 'passenger' || panelMode === 'dual') && (
          <div className="phone-frame">
            {/* Header matching exact photo specifications */}
            <Header
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              currentTime={currentTime}
              onOpenShareModal={() => handleShareBus(selectedBus || buses[0])}
              userLocation={userLocation}
              setUserLocation={setUserLocation}
              onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              onOpenComplaintModal={() => setIsComplaintModalOpen(true)}
            />

            {/* Dynamic Scrollable Content Area */}
            <main className="app-content">
              {activeTab === 'home' && (
                <>
                  {/* 2x3 Quick Actions Cards Grid */}
                  <QuickActions
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onOpenComplaintModal={() => setIsComplaintModalOpen(true)}
                  />

                  {/* Student & Staff Crowdsourced "Where Is My Bus" Banner */}
                  <OnboardPassengerBanner
                    buses={buses}
                    onCrowdLocationPing={handleCrowdLocationPing}
                  />

                  {/* Lost & Found Quick Report Banner for Wallet, Phone, Bag, ID Card */}
                  <div
                    onClick={() => setActiveTab('lost_found')}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      borderRadius: '20px',
                      padding: '16px 18px',
                      margin: '0 0 20px 0',
                      color: '#0F172A',
                      cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                        📦 Lost & Found Desk
                      </div>
                      <div style={{ fontSize: '0.96rem', fontWeight: 800, marginTop: 2, color: '#0F172A' }}>
                        Lost a Wallet, Phone, Bag, or ID Card?
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: 2 }}>
                        Report missing items or claim found belongings ➔
                      </div>
                    </div>
                    <div style={{ background: '#1A5CE5', color: '#FFFFFF', padding: '9px 14px', borderRadius: 14, fontSize: '0.78rem', fontWeight: 800, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(26, 92, 229, 0.4)' }}>
                      Report Now
                    </div>
                  </div>

                  {/* Nearby Banner */}
                  <NearbyBanner onSeeAll={() => setActiveTab('map')} />

                  {/* Nearest Bus Stop Section for Patia to Pitapalli Route */}
                  <NearestStopCard
                    stopName="Baramunda BSABT"
                    walkTime="2 min"
                    buses={filteredBuses}
                    onTrackBus={handleTrackBus}
                    onSeeAllStops={() => setActiveTab('all_buses')}
                    onShareBus={handleShareBus}
                    userLocation={userLocation}
                    setUserLocation={setUserLocation}
                    radiusFilter={radiusFilter}
                    setRadiusFilter={setRadiusFilter}
                  />
                </>
              )}

              {activeTab === 'all_buses' && (
                <AllBusesView
                  buses={buses}
                  onTrackBus={handleTrackBus}
                  onShareBus={handleShareBus}
                  userLocation={userLocation}
                  setUserLocation={setUserLocation}
                  radiusFilter={radiusFilter}
                  setRadiusFilter={setRadiusFilter}
                />
              )}

              {activeTab === 'map' && (
                <MapView
                  buses={buses}
                  selectedBus={selectedBus}
                  setSelectedBus={setSelectedBus}
                  onShareBus={handleShareBus}
                  userLocation={userLocation}
                  setUserLocation={setUserLocation}
                  radiusFilter={radiusFilter}
                  setRadiusFilter={setRadiusFilter}
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

              {activeTab === 'lost_found' && (
                <LostAndFoundView onTrackBus={handleTrackBus} />
              )}
            </main>

            {/* Fixed Bottom Navigation Bar */}
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        )}
      </div>

      {/* Share Location Modal Dialog */}
      <ShareLocationModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        bus={shareModalBus || selectedBus || buses[0]}
      />

      {/* BEC AI Voice Assistant Modal Dialog */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        buses={buses}
        userLocation={userLocation}
        onTrackBus={handleTrackBus}
      />

      {/* BEC Head Office Direct Confidential Complain Box Modal */}
      <ComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        buses={buses}
      />
    </div>
  );
}
