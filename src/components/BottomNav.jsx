import React from 'react';
import { Home, Map, Calendar, User, Package } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  const navs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'map', label: 'Map', icon: Map },
    { id: 'schedule', label: 'Schedules', icon: Calendar },
    { id: 'routes', label: 'Routes', icon: User },
    { id: 'lost_found', label: 'Lost & Found', icon: Package }
  ];

  return (
    <nav className="bottom-nav">
      {navs.map((item) => {
        const IconComponent = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <IconComponent size={22} color={isActive ? '#1A5CE5' : '#94A3B8'} />
            <span style={{ color: isActive ? '#1A5CE5' : '#64748B' }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
