import React from 'react';
import { Bus, MapPin, Network, Calendar, Package } from 'lucide-react';

export default function QuickActions({ activeTab, setActiveTab }) {
  const actions = [
    { id: 'all_buses', label: 'All Buses', icon: Bus, tab: 'all_buses' },
    { id: 'live_tracking', label: 'Live Tracking', icon: MapPin, tab: 'map' },
    { id: 'routes', label: 'Routes', icon: Network, tab: 'routes' },
    { id: 'schedules', label: 'Schedules', icon: Calendar, tab: 'schedule' },
    { id: 'lost_found', label: 'Lost & Found', icon: Package, tab: 'lost_found' }
  ];

  return (
    <div className="quick-actions-grid">
      {actions.map((item) => {
        const IconComponent = item.icon;
        const isActive = activeTab === item.tab;
        return (
          <div
            key={item.id}
            className={`quick-action-card ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(item.tab)}
          >
            <div className="quick-action-icon">
              <IconComponent size={26} />
            </div>
            <span className="quick-action-label">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
