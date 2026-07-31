import React from 'react';
import { Bus, MapPin, Network, Calendar, Package, ShieldAlert } from 'lucide-react';

export default function QuickActions({ activeTab, setActiveTab, onOpenComplaintModal }) {
  const actions = [
    { id: 'all_buses', label: 'All Buses', icon: Bus, action: () => setActiveTab('all_buses'), tab: 'all_buses' },
    { id: 'live_tracking', label: 'Live Tracking', icon: MapPin, action: () => setActiveTab('map'), tab: 'map' },
    { id: 'routes', label: 'Routes', icon: Network, action: () => setActiveTab('routes'), tab: 'routes' },
    { id: 'schedules', label: 'Schedules', icon: Calendar, action: () => setActiveTab('schedule'), tab: 'schedule' },
    { id: 'lost_found', label: 'Lost & Found', icon: Package, action: () => setActiveTab('lost_found'), tab: 'lost_found' },
    { id: 'complain_box', label: 'Complain Box', icon: ShieldAlert, action: onOpenComplaintModal, isHighlight: true }
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
            onClick={item.action}
            style={
              item.isHighlight
                ? {
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #FEF2F2 100%)'
                  }
                : {}
            }
          >
            <div
              className="quick-action-icon"
              style={
                item.isHighlight
                  ? { background: 'rgba(239, 68, 68, 0.15)', color: '#DC2626' }
                  : {}
              }
            >
              <IconComponent size={26} />
            </div>
            <span
              className="quick-action-label"
              style={item.isHighlight ? { color: '#991B1B' } : {}}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
