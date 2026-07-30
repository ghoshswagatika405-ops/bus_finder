import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, CheckCircle2, AlertCircle, Phone, MessageSquare, Tag, Calendar, MapPin, Bus, ShieldCheck, Wallet, Smartphone, Briefcase, CreditCard, Package } from 'lucide-react';
import { BUSES_LIST, BUS_STOPS } from '../data/busData';

// Category Definitions with Icons
const CATEGORIES = [
  { id: 'wallet', name: 'Wallet', icon: Wallet, color: '#D97706', bg: '#FEF3C7' },
  { id: 'phone', name: 'Phone', icon: Smartphone, color: '#2563EB', bg: '#DBEAFE' },
  { id: 'bag', name: 'Bag', icon: Briefcase, color: '#7C3AED', bg: '#EDE9FE' },
  { id: 'id_card', name: 'ID Card', icon: CreditCard, color: '#059669', bg: '#D1FAE5' },
  { id: 'others', name: 'Others', icon: Package, color: '#475569', bg: '#F1F5F9' }
];

// Seed dataset for initial demonstration
const SEED_ITEMS = [
  {
    id: 'item_1',
    type: 'LOST', // 'LOST' or 'FOUND'
    category: 'id_card',
    title: 'BEC Student ID Card (Roll: 2024-CSE-089)',
    busNumber: '108',
    busName: 'BEC Rider',
    location: 'Near Baramunda BSABT Stop',
    date: '2026-07-29',
    reporterName: 'Aman Sharma',
    contactNumber: '+91 98765 43210',
    description: 'Computer Science student ID card in a blue lanyard. Lost on seat #14.',
    status: 'LOST', // 'LOST', 'FOUND', 'CLAIMED'
    createdAt: '2026-07-29T14:30:00Z'
  },
  {
    id: 'item_2',
    type: 'FOUND',
    category: 'wallet',
    title: 'Brown Leather Wallet (Contains Cash & Driving License)',
    busNumber: '207',
    busName: 'Koustuv Rider',
    location: 'Driver Console Desk / Handed to Driver Rajesh',
    date: '2026-07-30',
    reporterName: 'Driver Rajesh Kumar',
    contactNumber: '+91 94370 55555',
    description: 'Found brown leather wallet under row 4 seats. Please claim with valid identity proof.',
    status: 'FOUND',
    createdAt: '2026-07-30T10:15:00Z'
  },
  {
    id: 'item_3',
    type: 'LOST',
    category: 'phone',
    title: 'Black Samsung Galaxy Phone with Blue Back Case',
    busNumber: '305',
    busName: 'AIIMS Rider',
    location: 'Patrapada Stop / AIIMS Route',
    date: '2026-07-30',
    reporterName: 'Priya Das',
    contactNumber: '+91 91234 56789',
    description: 'Left on window seat. Lock screen has a sunset wallpaper. Urgent call back.',
    status: 'LOST',
    createdAt: '2026-07-30T12:00:00Z'
  }
];

export default function LostAndFoundView({ onTrackBus }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('bec_lost_found_items');
      return saved ? JSON.parse(saved) : SEED_ITEMS;
    } catch (e) {
      return SEED_ITEMS;
    }
  });

  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeTab, setActiveTypeTab] = useState('ALL'); // 'ALL', 'LOST', 'FOUND'
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for reporting new item
  const [formData, setFormData] = useState({
    type: 'LOST',
    category: 'wallet',
    title: '',
    busNumber: '108',
    location: '',
    date: new Date().toISOString().split('T')[0],
    reporterName: '',
    contactNumber: '',
    description: ''
  });

  // Persist to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem('bec_lost_found_items', JSON.stringify(items));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }, [items]);

  // Submit New Item Handler
  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.reporterName.trim() || !formData.contactNumber.trim()) {
      alert('Please fill in Item Name, Reporter Name, and Contact Number!');
      return;
    }

    const busObj = BUSES_LIST.find((b) => b.number === formData.busNumber) || BUSES_LIST[0];

    const newItem = {
      id: 'item_' + Date.now(),
      type: formData.type,
      category: formData.category,
      title: formData.title.trim(),
      busNumber: formData.busNumber,
      busName: busObj.name,
      location: formData.location.trim() || 'BEC Corridor',
      date: formData.date,
      reporterName: formData.reporterName.trim(),
      contactNumber: formData.contactNumber.trim(),
      description: formData.description.trim() || 'No additional notes provided.',
      status: formData.type === 'LOST' ? 'LOST' : 'FOUND',
      createdAt: new Date().toISOString()
    };

    setItems([newItem, ...items]);
    setIsModalOpen(false);

    // Reset Form
    setFormData({
      type: 'LOST',
      category: 'wallet',
      title: '',
      busNumber: '108',
      location: '',
      date: new Date().toISOString().split('T')[0],
      reporterName: '',
      contactNumber: '',
      description: ''
    });

    alert('✅ Report Submitted Successfully! Item is now listed for claim.');
  };

  // Toggle Claim Status
  const handleMarkAsClaimed = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'CLAIMED' } : item))
    );
  };

  // Filter items based on Category, Type, and Search Query
  const filteredItems = items.filter((item) => {
    if (activeTypeTab !== 'ALL' && item.type !== activeTypeTab) return false;
    if (activeCategory !== 'ALL' && item.category !== activeCategory) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const title = (item.title || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    const loc = (item.location || '').toLowerCase();
    const bus = (item.busNumber || '').toLowerCase();
    const reporter = (item.reporterName || '').toLowerCase();
    return title.includes(q) || desc.includes(q) || loc.includes(q) || bus.includes(q) || reporter.includes(q);
  });

  return (
    <div style={{ paddingBottom: '30px' }}>
      {/* Title Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">📦 Lost & Found Desk</h2>
          <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 2, fontWeight: 600 }}>
            Report missing belongings or claim items found on BEC Buses
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            background: '#1A5CE5',
            color: '#FFFFFF',
            border: 'none',
            padding: '8px 14px',
            borderRadius: '14px',
            fontWeight: 800,
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 4px 12px rgba(26, 92, 229, 0.3)'
          }}
        >
          <PlusCircle size={16} /> Report Item
        </button>
      </div>

      {/* Main Filter Tabs (All vs Lost vs Found) */}
      <div style={{ display: 'flex', background: '#E2E8F0', padding: 4, borderRadius: 14, margin: '12px 0 14px 0' }}>
        {[
          { id: 'ALL', label: `All Reports (${items.length})` },
          { id: 'LOST', label: `🔴 Lost Items (${items.filter((i) => i.type === 'LOST' && i.status !== 'CLAIMED').length})` },
          { id: 'FOUND', label: `🟢 Found Items (${items.filter((i) => i.type === 'FOUND' && i.status !== 'CLAIMED').length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTypeTab(tab.id)}
            style={{
              flex: 1,
              background: activeTypeTab === tab.id ? '#FFFFFF' : 'transparent',
              color: activeTypeTab === tab.id ? '#1E293B' : '#64748B',
              border: 'none',
              padding: '8px',
              borderRadius: 10,
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: activeTypeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category Pills Bar (Wallet, Phone, Bag, ID Card, Others) */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 14 }}>
        <button
          onClick={() => setActiveCategory('ALL')}
          style={{
            background: activeCategory === 'ALL' ? '#1A5CE5' : '#FFFFFF',
            color: activeCategory === 'ALL' ? '#FFFFFF' : '#475569',
            border: `1px solid ${activeCategory === 'ALL' ? '#1A5CE5' : '#CBD5E1'}`,
            padding: '4px 12px',
            borderRadius: 14,
            fontSize: '0.75rem',
            fontWeight: 800,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          All Categories
        </button>

        {CATEGORIES.map((cat) => {
          const IconComp = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                background: isActive ? cat.color : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#334155',
                border: `1px solid ${isActive ? cat.color : '#CBD5E1'}`,
                padding: '4px 12px',
                borderRadius: 14,
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <IconComp size={14} color={isActive ? '#FFFFFF' : cat.color} />
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Search Input Bar */}
      <div
        style={{
          background: '#FFFFFF',
          padding: '10px 14px',
          borderRadius: 14,
          border: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        <Search size={18} color="#94A3B8" />
        <input
          type="text"
          placeholder="Search items by keyword, bus number, or owner name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.86rem', fontWeight: 600, fontFamily: 'inherit' }}
        />
      </div>

      {/* Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filteredItems.map((item) => {
          const catConfig = CATEGORIES.find((c) => c.id === item.category) || CATEGORIES[4];
          const IconComp = catConfig.icon;
          const isClaimed = item.status === 'CLAIMED';

          const cleanPhone = (item.contactNumber || '').replace(/[^0-9]/g, '');
          const waLink = `https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(item.reporterName)},%20I%20am%20contacting%20you%20regarding%20the%20Lost%20%26%20Found%20item:%20${encodeURIComponent(item.title)}`;

          return (
            <div
              key={item.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '18px',
                border: `1.5px solid ${isClaimed ? '#CBD5E1' : item.type === 'LOST' ? '#FCA5A5' : '#86EFAC'}`,
                boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                opacity: isClaimed ? 0.75 : 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              {/* Card Header: Category Icon, Title, Status Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: catConfig.bg,
                      color: catConfig.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <IconComp size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                      {item.title}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ background: '#E0F2FE', color: '#0369A1', padding: '2px 8px', borderRadius: 6, fontWeight: 800 }}>
                        🚌 Bus {item.busNumber}
                      </span>
                      <span>📍 {item.location}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  {isClaimed ? (
                    <span style={{ background: '#F1F5F9', color: '#475569', fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: 10, border: '1px solid #CBD5E1' }}>
                      ✅ CLAIMED
                    </span>
                  ) : item.type === 'LOST' ? (
                    <span style={{ background: '#FEE2E2', color: '#991B1B', fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: 10, border: '1px solid #FCA5A5' }}>
                      🔴 LOST (Searching)
                    </span>
                  ) : (
                    <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: 10, border: '1px solid #86EFAC' }}>
                      🟢 FOUND (Claimable)
                    </span>
                  )}
                </div>
              </div>

              {/* Description Body */}
              <p style={{ fontSize: '0.84rem', color: '#334155', background: '#F8FAFC', padding: '10px 12px', borderRadius: 12, lineHeight: 1.45, margin: 0 }}>
                {item.description}
              </p>

              {/* Reporter Info & Action Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, paddingTop: 4 }}>
                <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 700 }}>
                  Reported by: <strong style={{ color: '#1E293B' }}>{item.reporterName}</strong> on {item.date}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {!isClaimed && (
                    <button
                      onClick={() => handleMarkAsClaimed(item.id)}
                      style={{
                        background: '#F1F5F9',
                        border: '1px solid #CBD5E1',
                        color: '#334155',
                        padding: '6px 10px',
                        borderRadius: 10,
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      Mark as Claimed
                    </button>
                  )}

                  <a
                    href={`tel:${item.contactNumber}`}
                    style={{
                      background: '#1A5CE5',
                      color: '#FFFFFF',
                      padding: '6px 12px',
                      borderRadius: 10,
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Phone size={13} /> Call
                  </a>

                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: '#25D366',
                      color: '#FFFFFF',
                      padding: '6px 12px',
                      borderRadius: 10,
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <MessageSquare size={13} /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '36px', background: '#FFFFFF', borderRadius: 20, color: '#64748B' }}>
            <Package size={36} color="#94A3B8" style={{ marginBottom: 8 }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>No Lost & Found Items Listed</h4>
            <p style={{ fontSize: '0.82rem', marginTop: 4 }}>Be the first to report a missing or found item!</p>
          </div>
        )}
      </div>

      {/* REPORT NEW ITEM MODAL DIALOG */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '24px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                📝 Report Lost / Found Item
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 30, height: 30, fontWeight: 800, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Type Selection (Lost vs Found) */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Report Type:
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'LOST' })}
                    style={{
                      flex: 1,
                      background: formData.type === 'LOST' ? '#DC2626' : '#F1F5F9',
                      color: formData.type === 'LOST' ? '#FFFFFF' : '#475569',
                      border: 'none',
                      padding: '10px',
                      borderRadius: 12,
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    🔴 I Lost an Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'FOUND' })}
                    style={{
                      flex: 1,
                      background: formData.type === 'FOUND' ? '#16A34A' : '#F1F5F9',
                      color: formData.type === 'FOUND' ? '#FFFFFF' : '#475569',
                      border: 'none',
                      padding: '10px',
                      borderRadius: 12,
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    🟢 I Found an Item
                  </button>
                </div>
              </div>

              {/* Category Select */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Item Category:
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1px solid #CBD5E1', fontWeight: 700 }}
                >
                  <option value="wallet">👛 Wallet / Purse</option>
                  <option value="phone">📱 Mobile Phone / Device</option>
                  <option value="bag">🎒 Bag / Backpack</option>
                  <option value="id_card">🆔 Student ID Card / License</option>
                  <option value="others">📦 Others / Accessories</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Item Title / Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Black Leather Wallet with BEC Card"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1px solid #CBD5E1', fontWeight: 700 }}
                  required
                />
              </div>

              {/* Bus Number & Location */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: 6 }}>
                    Bus Number:
                  </label>
                  <select
                    value={formData.busNumber}
                    onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1px solid #CBD5E1', fontWeight: 700 }}
                  >
                    {BUSES_LIST.map((b) => (
                      <option key={b.id} value={b.number}>
                        Bus {b.number} - {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: 6 }}>
                    Stop / Location:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Baramunda"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1px solid #CBD5E1', fontWeight: 700 }}
                  />
                </div>
              </div>

              {/* Reporter Name & Contact Number */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: 6 }}>
                    Your Name:
                  </label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.reporterName}
                    onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1px solid #CBD5E1', fontWeight: 700 }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: 6 }}>
                    Phone Number:
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1px solid #CBD5E1', fontWeight: 700 }}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Item Description & Proof Details:
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe color, seat number, identification marks..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1px solid #CBD5E1', fontWeight: 600, fontFamily: 'inherit' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: '#1A5CE5',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '12px',
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginTop: 6
                }}
              >
                Submit Report
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
