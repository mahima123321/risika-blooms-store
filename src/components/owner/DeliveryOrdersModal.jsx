import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { 
  X, Truck, CheckCircle2, ShieldCheck, MapPin, Navigation, 
  ExternalLink, MessageCircle, MessageSquare, Phone, Clock, Calendar, 
  Sparkles, AlertCircle, Volume2, Search, Filter, Compass, Check
} from 'lucide-react';
import { 
  createWhatsAppUrl, 
  buildDeliveryConfirmationWhatsAppMessage,
  buildCustomerDeliveryOtpWhatsAppMessage
} from '../../config/whatsapp';
import confetti from 'canvas-confetti';
import { playDeliverySuccessChime } from '../../utils/audioAlerts';

export default function DeliveryOrdersModal() {
  const { 
    orders, 
    verifyDeliveryOtp, 
    updateOrderStatus,
    isDeliveryOrdersModalOpen, 
    closeDeliveryOrdersModal, 
    showToast 
  } = useShop();

  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'upcoming' | 'active' | 'history'
  const [selectedSlotFilter, setSelectedSlotFilter] = useState('all'); // 'all' | 'morning' | 'standard' | 'evening' | 'midnight'
  const [searchQuery, setSearchQuery] = useState('');
  const [otpInputs, setOtpInputs] = useState({});
  const [verifyingOrderId, setVerifyingOrderId] = useState(null);
  const [errorMessages, setErrorMessages] = useState({});

  if (!isDeliveryOrdersModalOpen) return null;

  // Date parsing & today's local comparison
  const todayDateObj = new Date();
  const todayStr = todayDateObj.toISOString().split('T')[0];
  const todayFormatted = todayDateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const isOrderScheduledForToday = (order) => {
    if (!order.deliveryDate) return true; // Default to today if unassigned
    return order.deliveryDate === todayStr;
  };

  const isOrderScheduledUpcoming = (order) => {
    if (!order.deliveryDate) return false;
    return order.deliveryDate > todayStr;
  };

  const getSlotDetails = (slotName) => {
    const s = String(slotName || '').toLowerCase();
    if (s.includes('morning') || s.includes('8 am') || s.includes('11 am')) {
      return {
        key: 'morning',
        label: 'Morning Slot',
        deadline: '11:00 AM',
        icon: '🌅',
        color: '#D97706',
        bg: 'rgba(217, 119, 6, 0.1)',
        border: 'rgba(217, 119, 6, 0.35)'
      };
    }
    if (s.includes('midnight') || s.includes('11:15') || s.includes('12:00')) {
      return {
        key: 'midnight',
        label: 'Midnight Surprise',
        deadline: '12:00 AM Midnight',
        icon: '🌙',
        color: '#EF4444',
        bg: 'rgba(239, 68, 68, 0.14)',
        border: 'rgba(239, 68, 68, 0.45)'
      };
    }
    if (s.includes('evening') || s.includes('6 pm') || s.includes('9 pm')) {
      return {
        key: 'evening',
        label: 'Evening Slot',
        deadline: '9:00 PM',
        icon: '🌇',
        color: '#8B5CF6',
        bg: 'rgba(139, 92, 246, 0.1)',
        border: 'rgba(139, 92, 246, 0.35)'
      };
    }
    return {
      key: 'standard',
      label: 'Afternoon / Standard',
      deadline: '5:00 PM',
      icon: '☀️',
      color: '#3B82F6',
      bg: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.35)'
    };
  };

  // Filter orders
  const allActiveOrders = orders.filter(o => o.status !== 'Delivered');
  const allDeliveredOrders = orders.filter(o => o.status === 'Delivered');

  const todayOrders = allActiveOrders.filter(isOrderScheduledForToday);
  const upcomingOrders = allActiveOrders.filter(isOrderScheduledUpcoming);

  // Today slot breakdowns
  const todayMorningCount = todayOrders.filter(o => getSlotDetails(o.deliverySlot).key === 'morning').length;
  const todayStandardCount = todayOrders.filter(o => getSlotDetails(o.deliverySlot).key === 'standard').length;
  const todayEveningCount = todayOrders.filter(o => getSlotDetails(o.deliverySlot).key === 'evening').length;
  const todayMidnightCount = todayOrders.filter(o => getSlotDetails(o.deliverySlot).key === 'midnight').length;

  const handleOtpChange = (orderId, val) => {
    const cleanVal = val.replace(/[^0-9]/g, '').slice(0, 4);
    setOtpInputs(prev => ({ ...prev, [orderId]: cleanVal }));
    if (errorMessages[orderId]) {
      setErrorMessages(prev => ({ ...prev, [orderId]: null }));
    }
    // Auto-verify as soon as 4 digits are typed!
    if (cleanVal.length === 4) {
      setTimeout(() => {
        handleVerifyOtp(orderId, cleanVal);
      }, 150);
    }
  };

  const handleVerifyOtp = (orderId, overrideEntered) => {
    const entered = overrideEntered || otpInputs[orderId] || '';
    if (!entered || entered.length < 4) {
      setErrorMessages(prev => ({ ...prev, [orderId]: 'Please enter the complete 4-digit OTP provided by customer.' }));
      return;
    }

    setVerifyingOrderId(orderId);
    const result = verifyDeliveryOtp(orderId, entered);

    if (result.success) {
      // 🔔 Play celebratory delivery sound, vibration & voice announcement on owner device
      playDeliverySuccessChime('Congratulations! Bouquet successfully received. Thank you for choosing Rishika Blooms!');

      showToast(`🎉 Order #${orderId} verified and marked as Delivered! (Voice: Bouquet successfully received)`, 'success');
      try {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } catch {}

      // Automatically offer WhatsApp celebration wish trigger
      const confirmMsg = buildDeliveryConfirmationWhatsAppMessage({ order: result.order });
      const customerPhone = result.order.recipientPhone || result.order.customerPhone;
      if (customerPhone) {
        const waUrl = createWhatsAppUrl(confirmMsg, customerPhone);
        window.open(waUrl, '_blank');
      }
    } else {
      setErrorMessages(prev => ({ ...prev, [orderId]: result.message || 'Incorrect OTP code.' }));
      showToast('❌ OTP Verification Failed. Please re-check code.', 'error');
    }
    setVerifyingOrderId(null);
  };

  const handleSendWhatsAppWishes = (order) => {
    const confirmMsg = buildDeliveryConfirmationWhatsAppMessage({ order });
    const targetPhone = order.recipientPhone || order.customerPhone;
    if (!targetPhone) {
      showToast('No customer phone number recorded for this order.', 'warning');
      return;
    }
    const waUrl = createWhatsAppUrl(confirmMsg, targetPhone);
    window.open(waUrl, '_blank');
  };

  const handleSendOtpToCustomer = (order) => {
    const targetPhone = order.recipientPhone || order.customerPhone;
    if (!targetPhone) {
      showToast('No customer phone number recorded for this order.', 'warning');
      return;
    }
    const otpMsg = buildCustomerDeliveryOtpWhatsAppMessage({ order });
    const waUrl = createWhatsAppUrl(otpMsg, targetPhone);
    window.open(waUrl, '_blank');
    showToast(`📲 Handover OTP message dispatched to ${order.recipientName || order.customerName || 'customer'}!`, 'success');
  };

  const getMapsNavigationUrl = (order) => {
    if (order.locationCoords && order.locationCoords.lat && order.locationCoords.lng) {
      return `https://www.google.com/maps/dir/?api=1&destination=${order.locationCoords.lat},${order.locationCoords.lng}`;
    }
    if (order.locationUrl && order.locationUrl.includes('google.com/maps?q=')) {
      const coords = order.locationUrl.split('q=')[1];
      if (coords) return `https://www.google.com/maps/dir/?api=1&destination=${coords}`;
    }
    const dest = `${order.deliveryAddress || ''} ${order.pincode || ''}`.trim();
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
  };

  // Base list depending on active tab
  let baseList = [];
  if (activeTab === 'today') {
    baseList = todayOrders;
    if (selectedSlotFilter !== 'all') {
      baseList = baseList.filter(o => getSlotDetails(o.deliverySlot).key === selectedSlotFilter);
    }
  } else if (activeTab === 'upcoming') {
    baseList = upcomingOrders;
  } else if (activeTab === 'active') {
    baseList = allActiveOrders;
  } else if (activeTab === 'history') {
    baseList = allDeliveredOrders;
  }

  // Filter with search query
  const displayedOrders = baseList.filter(order => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      String(order.orderId || order.id || '').toLowerCase().includes(q) ||
      String(order.recipientName || '').toLowerCase().includes(q) ||
      String(order.customerName || '').toLowerCase().includes(q) ||
      String(order.recipientPhone || '').includes(q) ||
      String(order.deliveryAddress || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="drawer-backdrop open" style={{ zIndex: 100015 }} onClick={closeDeliveryOrdersModal}>
      <div 
        className="glass-panel animate-scale-up" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '720px',
          width: 'calc(100% - 20px)',
          maxHeight: '92dvh',
          display: 'flex',
          flexDirection: 'column',
          margin: 'auto',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border-gold)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          background: 'var(--bg-alt)',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: '1 1 240px', minWidth: 0 }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid var(--border-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-gold)',
              flexShrink: 0
            }}>
              <Truck size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Delivery & Dispatch Hub
                </h3>
                <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontWeight: 800 }}>
                  LIVE
                </span>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
                Today's Target Deadlines • Google Maps Route • 4-Digit Customer OTP
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <button
              type="button"
              onClick={playDeliverySuccessChime}
              className="btn btn-outline btn-sm"
              style={{
                fontSize: '0.74rem',
                padding: '4px 9px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                borderColor: 'var(--border-gold)',
                color: 'var(--text-gold)',
                background: 'rgba(212, 175, 55, 0.08)'
              }}
              title="Click to test celebratory delivery sound on your phone"
            >
              <Volume2 size={13} />
              <span>🔊 Test Voice</span>
            </button>

            <button 
              type="button" 
              onClick={closeDeliveryOrdersModal}
              className="drawer-close-btn"
              style={{ margin: 0 }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Executive Summary Cards: Today Deliveries vs Upcoming vs History */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          {/* Today's Due Stat Card */}
          <div 
            onClick={() => setActiveTab('today')}
            style={{
              padding: '0.6rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'today' ? 'rgba(212, 175, 55, 0.15)' : 'var(--bg-alt)',
              border: activeTab === 'today' ? '1.5px solid var(--border-gold)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>🚨 Today's Due</span>
              <Clock size={12} color="var(--text-gold)" />
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {todayOrders.length} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>bouquets</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: todayOrders.length > 0 ? '#D97706' : '#10B981', fontWeight: 700 }}>
              {todayOrders.length > 0 ? 'Deliver before deadline' : 'All clear for today!'}
            </div>
          </div>

          {/* Upcoming Stat Card */}
          <div 
            onClick={() => setActiveTab('upcoming')}
            style={{
              padding: '0.6rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'upcoming' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-alt)',
              border: activeTab === 'upcoming' ? '1.5px solid #3B82F6' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>📆 Upcoming</span>
              <Calendar size={12} color="#3B82F6" />
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {upcomingOrders.length} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>orders</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#3B82F6', fontWeight: 600 }}>
              Advance pre-orders
            </div>
          </div>

          {/* Delivered Archive Stat Card */}
          <div 
            onClick={() => setActiveTab('history')}
            style={{
              padding: '0.6rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'history' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-alt)',
              border: activeTab === 'history' ? '1.5px solid #10B981' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>✅ Delivered</span>
              <CheckCircle2 size={12} color="#10B981" />
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {allDeliveredOrders.length} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>verified</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#10B981', fontWeight: 600 }}>
              Handover archive
            </div>
          </div>
        </div>

        {/* Four Primary Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-alt)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('today'); setSelectedSlotFilter('all'); }}
            style={{
              flex: '1 0 auto',
              padding: '0.75rem 1rem',
              background: activeTab === 'today' ? 'var(--bg-surface)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'today' ? '3px solid var(--border-gold)' : '3px solid transparent',
              color: activeTab === 'today' ? 'var(--text-gold)' : 'var(--text-muted)',
              fontWeight: 800,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <Clock size={15} />
            <span>🚨 Today's Due ({todayOrders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            style={{
              flex: '1 0 auto',
              padding: '0.75rem 1rem',
              background: activeTab === 'upcoming' ? 'var(--bg-surface)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'upcoming' ? '3px solid #3B82F6' : '3px solid transparent',
              color: activeTab === 'upcoming' ? '#3B82F6' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <Calendar size={15} />
            <span>📆 Upcoming ({upcomingOrders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('active')}
            style={{
              flex: '1 0 auto',
              padding: '0.75rem 1rem',
              background: activeTab === 'active' ? 'var(--bg-surface)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'active' ? '3px solid var(--border-gold)' : '3px solid transparent',
              color: activeTab === 'active' ? 'var(--text-gold)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <Truck size={15} />
            <span>🚚 All Active ({allActiveOrders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            style={{
              flex: '1 0 auto',
              padding: '0.75rem 1rem',
              background: activeTab === 'history' ? 'var(--bg-surface)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'history' ? '3px solid #10B981' : '3px solid transparent',
              color: activeTab === 'history' ? '#10B981' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <CheckCircle2 size={15} />
            <span>✅ Delivered History ({allDeliveredOrders.length})</span>
          </button>
        </div>

        {/* Sub-Bar: Today's Slot Breakdown Filter Pills & Search */}
        <div style={{
          padding: '0.65rem 1rem',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {activeTab === 'today' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: '2px'
            }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                <Filter size={12} /> Target:
              </span>

              <button
                type="button"
                onClick={() => setSelectedSlotFilter('all')}
                style={{
                  fontSize: '0.74rem',
                  padding: '3px 9px',
                  borderRadius: '12px',
                  border: selectedSlotFilter === 'all' ? '1.5px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                  background: selectedSlotFilter === 'all' ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                  color: selectedSlotFilter === 'all' ? 'var(--text-gold)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                All Today ({todayOrders.length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedSlotFilter('morning')}
                style={{
                  fontSize: '0.74rem',
                  padding: '3px 9px',
                  borderRadius: '12px',
                  border: selectedSlotFilter === 'morning' ? '1.5px solid #D97706' : '1px solid var(--border-subtle)',
                  background: selectedSlotFilter === 'morning' ? 'rgba(217, 119, 6, 0.15)' : 'transparent',
                  color: selectedSlotFilter === 'morning' ? '#D97706' : 'var(--text-secondary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                🌅 Morning by 11 AM ({todayMorningCount})
              </button>

              <button
                type="button"
                onClick={() => setSelectedSlotFilter('standard')}
                style={{
                  fontSize: '0.74rem',
                  padding: '3px 9px',
                  borderRadius: '12px',
                  border: selectedSlotFilter === 'standard' ? '1.5px solid #3B82F6' : '1px solid var(--border-subtle)',
                  background: selectedSlotFilter === 'standard' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: selectedSlotFilter === 'standard' ? '#3B82F6' : 'var(--text-secondary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                ☀️ Afternoon by 5 PM ({todayStandardCount})
              </button>

              <button
                type="button"
                onClick={() => setSelectedSlotFilter('evening')}
                style={{
                  fontSize: '0.74rem',
                  padding: '3px 9px',
                  borderRadius: '12px',
                  border: selectedSlotFilter === 'evening' ? '1.5px solid #8B5CF6' : '1px solid var(--border-subtle)',
                  background: selectedSlotFilter === 'evening' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                  color: selectedSlotFilter === 'evening' ? '#8B5CF6' : 'var(--text-secondary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                🌇 Evening by 9 PM ({todayEveningCount})
              </button>

              <button
                type="button"
                onClick={() => setSelectedSlotFilter('midnight')}
                style={{
                  fontSize: '0.74rem',
                  padding: '3px 9px',
                  borderRadius: '12px',
                  border: selectedSlotFilter === 'midnight' ? '1.5px solid #EF4444' : '1px solid var(--border-subtle)',
                  background: selectedSlotFilter === 'midnight' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                  color: selectedSlotFilter === 'midnight' ? '#EF4444' : 'var(--text-secondary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                🌙 Midnight Surprise by 12 AM ({todayMidnightCount})
              </button>
            </div>
          )}

          {/* Quick Search */}
          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder="Search by recipient name, phone (+91), address, or Order #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-alt)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Orders List Container */}
        <div style={{
          padding: '1rem',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          overscrollBehavior: 'contain',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {displayedOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
                {activeTab === 'today' ? '🎉' : activeTab === 'upcoming' ? '📆' : activeTab === 'history' ? '🌸' : '🚚'}
              </div>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                {activeTab === 'today' 
                  ? 'No pending deliveries due for today!' 
                  : activeTab === 'upcoming'
                  ? 'No future upcoming pre-orders scheduled.'
                  : activeTab === 'history'
                  ? 'No completed delivery history records yet.'
                  : 'No active orders in this view.'}
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto' }}>
                {activeTab === 'today' 
                  ? `All orders for today (${todayFormatted}) have been successfully fulfilled or are not yet scheduled for today.`
                  : 'As customers place orders online or via WhatsApp, their delivery deadlines and exact Google Maps pins appear here automatically.'}
              </p>
            </div>
          ) : (
            displayedOrders.map((order) => {
              const isDelivered = order.status === 'Delivered';
              const slotInfo = getSlotDetails(order.deliverySlot);
              const isToday = isOrderScheduledForToday(order);
              const navigationUrl = getMapsNavigationUrl(order);

              return (
                <div 
                  key={order.orderId || order.id}
                  style={{
                    background: 'var(--bg-alt)',
                    border: isDelivered 
                      ? '1px solid rgba(16, 185, 129, 0.35)' 
                      : slotInfo.key === 'midnight'
                      ? '2px solid #EF4444'
                      : isToday
                      ? '1.5px solid var(--border-gold)'
                      : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.15rem',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                    position: 'relative'
                  }}
                >
                  {/* CRITICAL DEADLINE BANNER: KISKO KITNE BJE TAK CHAHIYE BOUQUET */}
                  <div style={{
                    background: isDelivered 
                      ? 'rgba(16, 185, 129, 0.1)' 
                      : slotInfo.bg,
                    border: isDelivered 
                      ? '1px solid rgba(16, 185, 129, 0.3)' 
                      : `1px solid ${slotInfo.border}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 0.85rem',
                    marginBottom: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <span style={{ fontSize: '1.3rem' }}>{slotInfo.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: isDelivered ? '#10B981' : slotInfo.color }}>
                          {isDelivered 
                            ? `✓ Successfully Delivered (${order.deliveredAt ? new Date(order.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Verified'})`
                            : isToday
                            ? `🚨 TARGET: DELIVER TODAY BEFORE ${slotInfo.deadline}!`
                            : `📆 TARGET ON ${order.deliveryDate || 'Scheduled Date'}: Deliver by ${slotInfo.deadline}`}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          Time Slot: <strong>{order.deliverySlot}</strong> • Date: <strong>{order.deliveryDate || todayStr}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: isDelivered ? 'rgba(16, 185, 129, 0.2)' : 'rgba(212, 175, 55, 0.2)',
                        color: isDelivered ? '#10B981' : 'var(--text-gold)',
                        border: isDelivered ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-gold)'
                      }}>
                        {isDelivered ? '✓ Hand-Delivered' : isToday ? '⏰ DUE TODAY' : '📆 UPCOMING'}
                      </span>
                    </div>
                  </div>

                  {/* Top Bar: Order ID, Timestamp & Amount */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '1.02rem', color: 'var(--text-gold)' }}>
                        #{order.orderId || order.id}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        • Booked {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total:</span>
                      <strong style={{ fontSize: '1.08rem', color: 'var(--text-primary)' }}>₹{order.total}</strong>
                      <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                        {order.paymentMethod || 'Online'}
                      </span>
                    </div>
                  </div>

                  {/* Customer, Recipient & Contact Row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '0.75rem',
                    marginBottom: '0.85rem',
                    background: 'var(--bg-surface)',
                    padding: '0.75rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.84rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Recipient Name:</span>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                        {order.recipientName || order.customerName || 'Valued Recipient'}
                      </div>
                      {order.customerName && order.customerName !== order.recipientName && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Sent by: {order.customerName}
                        </div>
                      )}
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Customer Mobile:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <a 
                          href={`tel:${order.recipientPhone || order.customerPhone}`}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.75rem', padding: '3px 8px', borderColor: 'var(--border-gold)', color: 'var(--text-gold)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Phone size={12} />
                          <span>Call {order.recipientPhone || order.customerPhone}</span>
                        </a>

                        <a 
                          href={`https://wa.me/${String(order.recipientPhone || order.customerPhone).replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-whatsapp btn-sm"
                          style={{ fontSize: '0.75rem', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <MessageCircle size={12} />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Bouquets Ordered Details */}
                  <div style={{
                    background: 'var(--bg-surface)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '0.85rem',
                    fontSize: '0.82rem',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Bouquets & Flower Items</span>
                      <span>Quantity</span>
                    </div>
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)', fontWeight: 600, padding: '3px 0', borderBottom: idx < order.items.length - 1 ? '1px dashed var(--border-subtle)' : 'none' }}>
                          <span>• {item.name} {item.selectedColor ? `(${item.selectedColor})` : ''}</span>
                          <span style={{ color: 'var(--text-gold)', fontWeight: 700 }}>×{item.quantity} (₹{item.price * item.quantity})</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{order.productName || 'Bespoke Fresh Flower Bouquet'}</div>
                    )}

                    {order.giftMessage && (
                      <div style={{ marginTop: '0.45rem', paddingTop: '0.45rem', borderTop: '1px dashed var(--border-subtle)', fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                        💌 Card Message: "{order.giftMessage}"
                      </div>
                    )}
                  </div>

                  {/* EXACT GOOGLE MAPS GPS TURN-BY-TURN NAVIGATION STRIP */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    background: 'var(--bg-surface)',
                    padding: '0.75rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1rem',
                    border: '1.5px solid rgba(16, 185, 129, 0.4)'
                  }}>
                    <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                        <MapPin size={14} color="#10B981" />
                        <strong style={{ color: 'var(--text-primary)' }}>Delivery Destination:</strong>
                        {order.locationCoords ? (
                          <span style={{ color: '#10B981', fontWeight: 800, fontSize: '0.72rem' }}>
                            • [Live Satellite Pin]
                          </span>
                        ) : order.locationUrl ? (
                          <span style={{ color: '#10B981', fontWeight: 800, fontSize: '0.72rem' }}>
                            • [Attached GPS Pin]
                          </span>
                        ) : null}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.35, fontWeight: 500 }}>
                        {order.deliveryAddress || 'Address on file'} {order.pincode ? `(${order.pincode})` : ''}
                      </div>
                    </div>

                    <a 
                      href={navigationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-gold btn-sm"
                      style={{
                        fontSize: '0.8rem',
                        padding: '0.5rem 0.9rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        fontWeight: 700,
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                        flexShrink: 0
                      }}
                    >
                      <Navigation size={14} />
                      <span>🧭 Start Google Maps Navigation</span>
                    </a>
                  </div>

                  {/* BOTTOM ACTIONS: 4-DIGIT OTP VERIFICATION vs DELIVERED SUMMARY */}
                  {!isDelivered ? (
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0.02) 100%)',
                      border: '1px solid rgba(212, 175, 55, 0.35)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1rem',
                      boxSizing: 'border-box'
                    }}>
                      {/* Step 1: Dispatch OTP to Customer */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        paddingBottom: '0.65rem',
                        marginBottom: '0.65rem',
                        borderBottom: '1px dashed var(--border-subtle)'
                      }}>
                        <div style={{ minWidth: '150px', flex: '1 1 auto' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-gold)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <Phone size={13} />
                            <span>1. Customer Doorstep Arrival & OTP Dispatch</span>
                          </span>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                            Send 4-digit PIN to customer phone upon calling / doorstep arrival:
                          </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn btn-whatsapp btn-sm"
                            onClick={() => handleSendOtpToCustomer(order)}
                            style={{ fontSize: '0.76rem', padding: '0.4rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                            title="Send secret 4-digit OTP directly to customer via WhatsApp"
                          >
                            <MessageCircle size={14} />
                            <span>Send OTP (WhatsApp)</span>
                          </button>

                          {(order.recipientPhone || order.customerPhone) && (
                            <a
                              href={`sms:${order.recipientPhone || order.customerPhone}?body=${encodeURIComponent(
                                `Rishika Blooms: Your Secret Delivery Handover OTP for Order #${order.orderId || order.id} is: ${order.deliveryOtp}. Please share this code with our rider only after collecting your bouquet at your doorstep.`
                              )}`}
                              className="btn btn-outline btn-sm"
                              style={{ fontSize: '0.76rem', padding: '0.4rem 0.7rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              title="Send OTP via direct SMS"
                            >
                              <MessageSquare size={13} />
                              <span>SMS</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Step 2: Verify Handover PIN */}
                      <div style={{ marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px', marginBottom: '0.4rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-gold)', fontWeight: 700, fontSize: '0.8rem' }}>
                            <ShieldCheck size={15} />
                            <span>2. Enter 4-Digit PIN Told by Customer:</span>
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            (Auto-completes and plays voice on 4th digit)
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <input 
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            placeholder="4-digit OTP"
                            value={otpInputs[order.orderId || order.id] || ''}
                            onChange={(e) => handleOtpChange(order.orderId || order.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleVerifyOtp(order.orderId || order.id);
                              }
                            }}
                            style={{
                              flex: '1 1 120px',
                              minWidth: '100px',
                              padding: '0.55rem 0.75rem',
                              letterSpacing: '3px',
                              fontSize: '1rem',
                              fontWeight: 800,
                              fontFamily: 'monospace',
                              textAlign: 'center',
                              borderRadius: 'var(--radius-sm)',
                              border: errorMessages[order.orderId || order.id] ? '1.5px solid #EF4444' : '1px solid var(--border-gold)',
                              background: 'var(--bg-surface)',
                              color: 'var(--text-primary)',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />

                          <button
                            type="button"
                            className="btn btn-gold btn-sm"
                            disabled={verifyingOrderId === (order.orderId || order.id)}
                            onClick={() => handleVerifyOtp(order.orderId || order.id)}
                            style={{
                              flex: '2 1 170px',
                              padding: '0.6rem 0.9rem',
                              justifyContent: 'center',
                              boxSizing: 'border-box',
                              fontWeight: 700
                            }}
                          >
                            <CheckCircle2 size={16} />
                            <span>Verify Handover 🔔</span>
                          </button>
                        </div>
                      </div>

                      {errorMessages[order.orderId || order.id] && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#EF4444', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                          <AlertCircle size={12} />
                          <span>{errorMessages[order.orderId || order.id]}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* DELIVERED ARCHIVE CARD: 1-CLICK WHATSAPP CELEBRATION WISHES BUTTON */
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.65rem',
                      padding: '0.75rem 0.9rem',
                      background: 'rgba(16, 185, 129, 0.08)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(16, 185, 129, 0.35)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontSize: '0.8rem', fontWeight: 600 }}>
                        <CheckCircle2 size={16} />
                        <span>Handover Verified • OTP: {order.deliveryOtp} ({order.deliveredAt ? new Date(order.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Verified'})</span>
                      </div>

                      <button
                        type="button"
                        className="btn btn-whatsapp btn-sm"
                        onClick={() => handleSendWhatsAppWishes(order)}
                        style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem' }}
                        title="Send celebration wishes, care tips, and review link to customer WhatsApp"
                      >
                        <MessageCircle size={14} />
                        <span>Send WhatsApp Wishes & Receipt</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
