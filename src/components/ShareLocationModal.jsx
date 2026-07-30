import React, { useState } from 'react';
import { ShieldCheck, Share2, Copy, Check, MessageSquare, Send, X, Bus, MapPin } from 'lucide-react';
import { getCrowdIndicator } from '../data/busData';

export default function ShareLocationModal({ isOpen, onClose, bus }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetBus = bus || {
    number: '108',
    name: 'BEC Rider',
    destination: 'BEC Campus Terminal',
    currentStopName: 'Khandagiri Square',
    speed: '45 km/h',
    capacity: '58% Full',
    crowdLevel: 'Medium'
  };

  const crowd = getCrowdIndicator(targetBus);
  const liveUrl = window.location.origin || 'http://localhost:5173';

  const shareText = `🛡️ SAFE RIDE LIVE TRACKING (BEC Bus Tracker)
Hi Mom/Dad! I am currently traveling safely on Bus ${targetBus.number} (${targetBus.name}).

📍 Current Location: ${targetBus.currentStopName || targetBus.origin || 'In Transit'}
🎯 Destination: ${targetBus.destination}
⚡ Live Speed: ${targetBus.speed || '45 km/h'}
👥 Crowd Level: ${crowd.badgeText} (${targetBus.capacity || 'Seats Filled'})
💡 Status: ${crowd.recommendation}

Track my bus live on map here:
${liveUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleSmsShare = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`sms:?body=${encoded}`, '_self');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Safe Ride: Bus ${targetBus.number}`,
          text: shareText,
          url: liveUrl
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '24px',
          maxWidth: '420px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#DCFCE7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #86EFAC' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#166534', background: '#F0FDF4', padding: '2px 8px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Parent Safety Tracking
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', marginTop: 2 }}>
                Share Live Bus with Parents
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Bus Summary Badge Card */}
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: 12, borderRadius: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1E293B' }}>
              🚌 Bus {targetBus.number} - {targetBus.name}
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: crowd.color, background: crowd.bg, border: `1px solid ${crowd.border}`, padding: '2px 8px', borderRadius: 8 }}>
              {crowd.badgeText}
            </span>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={14} color="#1A5CE5" />
            <span>Location: {targetBus.currentStopName || targetBus.origin || 'In Transit'}</span>
          </div>
        </div>

        {/* Message Preview Box */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
            📱 Message Sent to Parents:
          </label>
          <div
            style={{
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '14px',
              padding: '12px',
              fontSize: '0.78rem',
              color: '#1E293B',
              fontWeight: 600,
              lineHeight: 1.45,
              whiteSpace: 'pre-wrap',
              maxHeight: '130px',
              overflowY: 'auto'
            }}
          >
            {shareText}
          </div>
        </div>

        {/* Action Share Buttons Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 12 }}>
          {/* WhatsApp Direct Share Button */}
          <button
            onClick={handleWhatsAppShare}
            style={{
              background: '#25D366',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
            }}
          >
            <Send size={18} /> WhatsApp
          </button>

          {/* Mobile SMS Share Button */}
          <button
            onClick={handleSmsShare}
            style={{
              background: '#1A5CE5',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(26, 92, 229, 0.3)'
            }}
          >
            <MessageSquare size={18} /> SMS Alert
          </button>
        </div>

        {/* Copy Link & Mobile Native Share */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          <button
            onClick={handleCopy}
            style={{
              background: copied ? '#DCFCE7' : '#F8FAFC',
              color: copied ? '#15803D' : '#334155',
              border: `1.5px solid ${copied ? '#86EFAC' : '#CBD5E1'}`,
              padding: '10px',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            {copied ? <Check size={16} color="#15803D" /> : <Copy size={16} />}
            {copied ? 'Copied to Clipboard!' : 'Copy Text & Link'}
          </button>

          <button
            onClick={handleNativeShare}
            style={{
              background: '#F8FAFC',
              color: '#334155',
              border: '1.5px solid #CBD5E1',
              padding: '10px',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <Share2 size={16} /> More Options
          </button>
        </div>
      </div>
    </div>
  );
}
