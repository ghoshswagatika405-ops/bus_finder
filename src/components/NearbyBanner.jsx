import React from 'react';
import { MapPin } from 'lucide-react';

export default function NearbyBanner({ onSeeAll }) {
  return (
    <div className="nearby-banner">
      <div className="nearby-left">
        <div className="nearby-icon-wrap">
          <MapPin size={20} />
        </div>
        <div>
          <div className="nearby-title">Find buses near you</div>
          <div className="nearby-sub">Track buses in real-time</div>
        </div>
      </div>
      <button className="see-all-link" onClick={onSeeAll}>
        See All
      </button>
    </div>
  );
}
