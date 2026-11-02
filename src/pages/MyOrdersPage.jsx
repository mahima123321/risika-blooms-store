import React, { useState, useMemo, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  Package, Search, Clock, CheckCircle2, Truck, Send, Smartphone, MessageSquare,
  MapPin, Printer, ArrowRight, ShieldCheck, AlertCircle, XCircle,
  Phone, MessageCircle, Calendar, Sparkles, Copy, Check, Lock, Unlock,
  KeyRound, Eye, EyeOff, Navigation, Heart, ExternalLink, RefreshCw,
  Settings, LogOut, Camera, Star, ShoppingBag, ChevronDown, ChevronUp
} from 'lucide-react';
import { 
  createWhatsAppUrl, 
  buildDeliveryConfirmationWhatsAppMessage,
  buildCustomerDeliveryOtpWhatsAppMessage
} from '../config/whatsapp';
import confetti from 'canvas-confetti';
import { playDeliverySuccessChime } from '../utils/audioAlerts';

export default function MyOrdersPage() {
  const { 
    orders, 
    customerOrders,
    products,
    currentView, 
    navigateTo, 
    showToast,
    isOwnerAuthenticated,
    loginAsOwner,
    logoutOwner,
    ownerPin,
    verifyDeliveryOtp,
    updateOrderStatus,
    openOwnerSettingsModal,
    triggerIncomingSmsNotification,
    openWriteReviewModal,
    brandConfig
  } = useShop();

  // Mode switcher: 'owner' vs 'customer'
  // Defaults to 'owner' ONLY if explicitly passed in params (e.g. from owner menu),
  // otherwise defaults to 'customer' so user always sees their own placed bouquet orders!
  const [deliveredCelebrationOrder, setDeliveredCelebrationOrder] = useState(null);
  const [activeMode, setActiveMode] = useState(() => {
    if (currentView?.params?.mode === 'owner') return 'owner';
    if (currentView?.params?.mode === 'customer') return 'customer';
    return 'customer';
  });

  useEffect(() => {
    if (currentView?.params?.mode === 'owner') {
      setActiveMode('owner');
    } else if (currentView?.params?.mode === 'customer') {
      setActiveMode('customer');
    }
  }, [currentView?.params?.mode]);

  // Owner PIN login state (for when unauthenticated owner switches to owner mode)
  const [enteredPin, setEnteredPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');

  // Owner Filter States
  const [ownerDateFilter, setOwnerDateFilter] = useState('all'); // 'all' | 'today' | 'upcoming' | 'delivered'
  const [ownerSlotFilter, setOwnerSlotFilter] = useState('all'); // 'all' | 'morning' | 'afternoon' | 'evening' | 'midnight'
  const [ownerSearch, setOwnerSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // OTP Verification state on order cards
  const [otpInputs, setOtpInputs] = useState({});
  const [verifyingId, setVerifyingId] = useState(null);
  const [otpErrors, setOtpErrors] = useState({});

  // Customer Tracking States
  const initialCustomerSearch = currentView?.params?.orderId || currentView?.params?.phone || '';
  const [customerSearch, setCustomerSearch] = useState(initialCustomerSearch);
  const [selectedCustomerOrder, setSelectedCustomerOrder] = useState(null);

  // Today ISO string for date comparisons (YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, []);

  // Slot helper
  const getSlotMeta = (slotName) => {
    const s = String(slotName || '').toLowerCase();
    if (s.includes('morning') || s.includes('8 am') || s.includes('11 am')) {
      return {
        key: 'morning',
        label: 'Morning Slot (8 AM - 11 AM)',
        short: 'Morning',
        icon: '🌅',
        color: '#D97706',
        bg: 'rgba(217, 119, 6, 0.12)',
        border: 'rgba(217, 119, 6, 0.4)'
      };
    }
    if (s.includes('midnight') || s.includes('11:15') || s.includes('12:00') || s.includes('surprise')) {
      return {
        key: 'midnight',
        label: 'Midnight Surprise (11:30 PM - 12:30 AM)',
        short: 'Midnight Surprise',
        icon: '🌙',
        color: '#EF4444',
        bg: 'rgba(239, 68, 68, 0.15)',
        border: 'rgba(239, 68, 68, 0.45)'
      };
    }
    if (s.includes('evening') || s.includes('6 pm') || s.includes('9 pm')) {
      return {
        key: 'evening',
        label: 'Evening Romantic Slot (6 PM - 9 PM)',
        short: 'Evening',
        icon: '🌇',
        color: '#8B5CF6',
        bg: 'rgba(139, 92, 246, 0.12)',
        border: 'rgba(139, 92, 246, 0.4)'
      };
    }
    return {
      key: 'afternoon',
      label: 'Standard / Afternoon Slot (12 PM - 5 PM)',
      short: 'Afternoon',
      icon: '☀️',
      color: '#2563EB',
      bg: 'rgba(37, 99, 235, 0.12)',
      border: 'rgba(37, 99, 235, 0.4)'
    };
  };

  // Status Styling
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Delivered':
        return { background: 'rgba(22, 163, 74, 0.14)', color: '#16A34A', border: '1px solid #16A34A' };
      case 'Out for Delivery':
      case 'Shipped':
        return { background: 'rgba(59, 130, 246, 0.14)', color: '#2563EB', border: '1px solid #3B82F6' };
      case 'Packed':
      case 'Preparing Flowers':
      case 'Confirmed':
        return { background: 'rgba(217, 119, 6, 0.14)', color: '#D97706', border: '1px solid #D97706' };
      case 'Cancelled':
        return { background: 'rgba(239, 68, 68, 0.14)', color: '#DC2626', border: '1px solid #EF4444' };
      default:
        return { background: 'rgba(212, 175, 55, 0.14)', color: '#D4AF37', border: '1px solid #D4AF37' };
    }
  };

  // Owner Filter Logic
  const allOrders = orders || [];
  const activeOrdersCount = allOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const todayOrdersCount = allOrders.filter(o => (o.deliveryDate === todayStr || !o.deliveryDate) && o.status !== 'Delivered').length;
  const upcomingOrdersCount = allOrders.filter(o => o.deliveryDate && o.deliveryDate > todayStr && o.status !== 'Delivered').length;
  const deliveredOrdersCount = allOrders.filter(o => o.status === 'Delivered').length;
  const midnightCount = allOrders.filter(o => getSlotMeta(o.deliverySlot).key === 'midnight' && o.status !== 'Delivered').length;

  const filteredOwnerOrders = useMemo(() => {
    return allOrders.filter(ord => {
      // 1. Date filter
      if (ownerDateFilter === 'today') {
        const isToday = ord.deliveryDate === todayStr || (!ord.deliveryDate && ord.status !== 'Delivered');
        if (!isToday || ord.status === 'Delivered') return false;
      } else if (ownerDateFilter === 'upcoming') {
        const isUpcoming = ord.deliveryDate && ord.deliveryDate > todayStr;
        if (!isUpcoming || ord.status === 'Delivered') return false;
      } else if (ownerDateFilter === 'delivered') {
        if (ord.status !== 'Delivered') return false;
      }

      // 2. Slot filter
      if (ownerSlotFilter !== 'all') {
        const meta = getSlotMeta(ord.deliverySlot);
        if (meta.key !== ownerSlotFilter) return false;
      }

      // 3. Search query
      if (ownerSearch.trim()) {
        const q = ownerSearch.toLowerCase().trim();
        const matchId = String(ord.orderId || '').toLowerCase().includes(q);
        const matchName = String(ord.customerName || ord.recipientName || '').toLowerCase().includes(q);
        const matchPhone = String(ord.customerPhone || ord.recipientPhone || '').includes(q);
        const matchAddress = String(ord.deliveryAddress || '').toLowerCase().includes(q);
        const matchItem = (ord.items || []).some(i => String(i.name || '').toLowerCase().includes(q));
        if (!matchId && !matchName && !matchPhone && !matchAddress && !matchItem) return false;
      }

      return true;
    });
  }, [allOrders, ownerDateFilter, ownerSlotFilter, ownerSearch, todayStr]);

  // Customer's personal orders placed on this device (merged with any live updates)
  const myDeviceOrders = useMemo(() => {
    const list = [...(customerOrders || [])];
    const seenIds = new Set(list.map(o => String(o.orderId || o.order_id)));

    const lastOrderId = typeof window !== 'undefined' ? localStorage.getItem('rb_last_order_id') : null;
    (orders || []).forEach(o => {
      const id = String(o.orderId || o.order_id);
      if (seenIds.has(id)) {
        const idx = list.findIndex(x => String(x.orderId || x.order_id) === id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...o };
        }
      } else if (lastOrderId && id === String(lastOrderId)) {
        list.push(o);
        seenIds.add(id);
      }
    });

    return list;
  }, [customerOrders, orders]);

  // Customer Filter Logic
  const cleanCustomerQuery = customerSearch.trim().toLowerCase();
  const filteredCustomerOrders = useMemo(() => {
    if (cleanCustomerQuery) {
      // Search across ALL orders (device orders + all store/cloud orders)
      const allPool = [...myDeviceOrders];
      const seen = new Set(allPool.map(o => String(o.orderId || o.order_id)));
      (orders || []).forEach(o => {
        const id = String(o.orderId || o.order_id);
        if (!seen.has(id)) {
          allPool.push(o);
          seen.add(id);
        }
      });

      return allPool.filter((o) => {
        const matchId = String(o.orderId || o.order_id || '').toLowerCase().includes(cleanCustomerQuery);
        const matchPhone = String(o.customerPhone || o.recipientPhone || '').includes(cleanCustomerQuery);
        const matchName = String(o.customerName || o.recipientName || '').toLowerCase().includes(cleanCustomerQuery);
        return matchId || matchPhone || matchName;
      });
    }

    // When NO search query is typed:
    // If the customer has placed orders on this device, show those orders!
    if (myDeviceOrders.length > 0) {
      return myDeviceOrders;
    }

    // If no personal orders on this device, return empty list so empty state is displayed
    return [];
  }, [cleanCustomerQuery, myDeviceOrders, orders]);

  const activeCustomerOrder = selectedCustomerOrder || filteredCustomerOrders[0] || myDeviceOrders[0] || null;

  // Helper to resolve bouquet thumbnail image
  const getItemImage = (item) => {
    if (item?.image) return item.image;
    const matched = (products || []).find(p => p.id === item?.id || p.id === item?.productId || p.title === item?.name);
    if (matched?.images?.[0]) return matched.images[0];
    if (matched?.image) return matched.image;
    return '/images/bday_royal_blue_tulip_lily_card.jpg';
  };

  // Owner PIN submit
  const handleOwnerPinSubmit = (e) => {
    e.preventDefault();
    if (!enteredPin.trim()) {
      setPinError('Please enter Security PIN');
      return;
    }
    const res = loginAsOwner(enteredPin);
    if (res && res.success) {
      setPinError('');
      setEnteredPin('');
      setActiveMode('owner');
    } else {
      setPinError(res?.error || 'Incorrect Security PIN. Default is risika2026');
    }
  };

  // OTP Verify Handler for Owner Card
  const handleOtpVerify = async (orderId, manualOtp) => {
    const val = manualOtp || otpInputs[orderId] || '';
    if (!val || val.length < 4) {
      setOtpErrors(prev => ({ ...prev, [orderId]: 'Enter 4-digit OTP from customer' }));
      return;
    }

    setVerifyingId(orderId);
    try {
      const res = await verifyDeliveryOtp(orderId, val);
      if (res && res.success) {
        try { playDeliverySuccessChime(); } catch (e) {}
        try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); } catch (e) {}
        showToast(`🎉 Order #${orderId} marked Delivered & Paid!`, 'success');
        
        // In-App Flipkart/Meesho delivery celebration modal (No external WhatsApp redirect)
        const target = res.order || allOrders.find(o => o.orderId === orderId);
        if (target) {
          setDeliveredCelebrationOrder(target);
        }
      } else {
        setOtpErrors(prev => ({ ...prev, [orderId]: res?.message || 'Incorrect OTP code.' }));
        showToast('❌ Incorrect OTP code. Check with customer.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error verifying OTP', 'error');
    } finally {
      setVerifyingId(null);
    }
  };

  
  // Owner Marks Out for Delivery (100% In-App like Flipkart / Meesho - No WhatsApp Redirect)
  const handleDispatch = (ord) => {
    // 1. Update order status to 'Out for Delivery'
    updateOrderStatus(ord.orderId, 'Out for Delivery');

    // 2. Trigger native in-app message simulation on device
    if (triggerIncomingSmsNotification) {
      triggerIncomingSmsNotification({
        orderId: ord.orderId,
        deliveryOtp: ord.deliveryOtp || '4892',
        phone: ord.customerPhone || ord.recipientPhone,
        customerName: ord.recipientName || ord.customerName,
        autoLaunchNative: false
      });
    }

    showToast(`🚚 Order #${ord.orderId} marked Out for Delivery! Handover OTP: ${ord.deliveryOtp || '4892'}`, 'success');
  };

  // Quick Copy Helper
  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="my-orders-page animate-fade-in" style={{ padding: '1.5rem 0 6rem 0', backgroundColor: 'var(--bg-primary)', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: '1180px' }}>
        
        {/* Top Segmented Portal Switcher */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1.75rem'
        }}>
          <div style={{
            display: 'inline-flex',
            background: 'var(--bg-surface)',
            padding: '4px',
            borderRadius: 'var(--radius-full)',
            border: '1.5px solid var(--border-gold)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }}>
            <button
              type="button"
              onClick={() => setActiveMode('customer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: activeMode === 'customer' ? 'var(--text-gold)' : 'transparent',
                color: activeMode === 'customer' ? '#000000' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Package size={16} />
              <span>🛍️ My Placed Orders</span>
              {myDeviceOrders.length > 0 && (
                <span style={{
                  background: activeMode === 'customer' ? '#000000' : 'var(--text-gold)',
                  color: activeMode === 'customer' ? '#FFFFFF' : '#000000',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  padding: '2px 7px',
                  borderRadius: '10px',
                  marginLeft: '2px'
                }}>
                  {myDeviceOrders.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('owner')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: activeMode === 'owner' ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)' : 'transparent',
                color: activeMode === 'owner' ? '#000000' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Truck size={16} />
              <span>👑 Store Dispatch Hub</span>
              {activeOrdersCount > 0 && (
                <span style={{
                  background: activeMode === 'owner' ? '#000000' : '#D4AF37',
                  color: activeMode === 'owner' ? '#FFFFFF' : '#000000',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  padding: '2px 7px',
                  borderRadius: '10px',
                  marginLeft: '2px'
                }}>
                  {activeOrdersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* =========================================================================
            VIEW 1: STORE OWNER & DISPATCH SCHEDULE HUB
            ========================================================================= */}
        {activeMode === 'owner' && (
          <div>
            {!isOwnerAuthenticated ? (
              /* Owner Login Box if not authenticated on this phone */
              <div style={{ maxWidth: '460px', margin: '2rem auto', textAlign: 'center' }}>
                <div className="glass-panel" style={{ padding: '2.5rem 1.75rem', borderRadius: 'var(--radius-lg)', border: '2px solid var(--border-gold)' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(212, 175, 55, 0.15)',
                    border: '2px solid #D4AF37',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem auto'
                  }}>
                    <KeyRound size={30} color="#D4AF37" />
                  </div>

                  <span className="section-pretitle" style={{ color: '#D4AF37' }}>Store Administrator</span>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Store Owner & Dispatch Access
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.45 }}>
                    Enter your 4-digit PIN to access live incoming orders, delivery dates, dispatch schedule & recipient details on this smartphone.
                  </p>

                  <form onSubmit={handleOwnerPinSubmit}>
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                      <input
                        type={showPin ? 'text' : 'password'}
                        value={enteredPin}
                        onChange={(e) => { setEnteredPin(e.target.value); setPinError(''); }}
                        placeholder="Enter PIN (Default: risika2026)"
                        style={{
                          width: '100%',
                          padding: '0.85rem 2.8rem 0.85rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          border: pinError ? '2px solid #EF4444' : '1.5px solid var(--border-subtle)',
                          background: 'var(--bg-alt)',
                          fontSize: '1rem',
                          textAlign: 'center',
                          letterSpacing: showPin ? 'normal' : '4px',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {pinError && (
                      <div style={{ color: '#EF4444', fontSize: '0.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                        <AlertCircle size={14} />
                        <span>{pinError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="btn btn-gold"
                      style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 800, justifyContent: 'center', marginBottom: '0.75rem' }}
                    >
                      <span>Unlock Dispatch Schedule</span>
                      <ArrowRight size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setEnteredPin('risika2026')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-gold)',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Auto-fill Default PIN (risika2026)
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              /* Authenticated Owner Dispatch Hub */
              <div>
                {/* Header Strip with Controls */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                  padding: '1rem 1.25rem',
                  background: 'rgba(212, 175, 55, 0.08)',
                  border: '1.5px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '1.1rem' }}>👑</span>
                      <strong style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                        Store Owner Dispatch & Delivery Hub
                      </strong>
                      <span style={{ background: '#10B981', color: '#FFF', fontSize: '0.65rem', fontWeight: 800, padding: '2px 7px', borderRadius: '4px' }}>
                        LIVE
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Today: <strong>{todayFormatted}</strong> • Full visibility of orders, schedule & customer contacts
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => openOwnerSettingsModal('payment')}
                      style={{ fontSize: '0.8rem', background: 'var(--bg-surface)' }}
                    >
                      <Settings size={14} />
                      <span>Payment QR & Settings</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={logoutOwner}
                      style={{ fontSize: '0.8rem', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)', background: 'var(--bg-surface)' }}
                    >
                      <LogOut size={14} />
                      <span>Lock Studio</span>
                    </button>
                  </div>
                </div>

                {/* 4 Summary Stat Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.85rem',
                  marginBottom: '1.75rem'
                }}>
                  {/* Today Dispatch */}
                  <div
                    onClick={() => { setOwnerDateFilter('today'); setOwnerSlotFilter('all'); }}
                    className="glass-panel"
                    style={{
                      padding: '1.1rem',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      border: ownerDateFilter === 'today' ? '2px solid #EF4444' : '1px solid var(--border-subtle)',
                      background: ownerDateFilter === 'today' ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-surface)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#EF4444', textTransform: 'uppercase' }}>
                        🚨 Deliver Today
                      </span>
                      <Clock size={16} color="#EF4444" />
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                      {todayOrdersCount}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Requires today's fulfillment
                    </div>
                  </div>

                  {/* Upcoming Dispatch */}
                  <div
                    onClick={() => { setOwnerDateFilter('upcoming'); setOwnerSlotFilter('all'); }}
                    className="glass-panel"
                    style={{
                      padding: '1.1rem',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      border: ownerDateFilter === 'upcoming' ? '2px solid #3B82F6' : '1px solid var(--border-subtle)',
                      background: ownerDateFilter === 'upcoming' ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-surface)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>
                        📅 Upcoming Dates
                      </span>
                      <Calendar size={16} color="#2563EB" />
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                      {upcomingOrdersCount}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Advance scheduled orders
                    </div>
                  </div>

                  {/* Midnight Surprises */}
                  <div
                    onClick={() => { setOwnerDateFilter('all'); setOwnerSlotFilter('midnight'); }}
                    className="glass-panel"
                    style={{
                      padding: '1.1rem',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      border: ownerSlotFilter === 'midnight' ? '2px solid #8B5CF6' : '1px solid var(--border-subtle)',
                      background: ownerSlotFilter === 'midnight' ? 'rgba(139, 92, 246, 0.08)' : 'var(--bg-surface)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#8B5CF6', textTransform: 'uppercase' }}>
                        🌙 Midnight Surprise
                      </span>
                      <Sparkles size={16} color="#8B5CF6" />
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                      {midnightCount}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      11:30 PM - 12:30 AM deliveries
                    </div>
                  </div>

                  {/* Delivered History */}
                  <div
                    onClick={() => { setOwnerDateFilter('delivered'); setOwnerSlotFilter('all'); }}
                    className="glass-panel"
                    style={{
                      padding: '1.1rem',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      border: ownerDateFilter === 'delivered' ? '2px solid #10B981' : '1px solid var(--border-subtle)',
                      background: ownerDateFilter === 'delivered' ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                        ✅ Delivered
                      </span>
                      <CheckCircle2 size={16} color="#059669" />
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                      {deliveredOrdersCount}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Handed over successfully
                    </div>
                  </div>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="glass-panel" style={{ padding: '1.1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                    
                    {/* Date filter pills */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {[
                        { key: 'all', label: `All (${allOrders.length})` },
                        { key: 'today', label: `🚨 Today (${todayOrdersCount})` },
                        { key: 'upcoming', label: `📅 Upcoming (${upcomingOrdersCount})` },
                        { key: 'delivered', label: `✅ Delivered (${deliveredOrdersCount})` }
                      ].map(tab => (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setOwnerDateFilter(tab.key)}
                          style={{
                            padding: '0.45rem 0.85rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            border: ownerDateFilter === tab.key ? '1.5px solid var(--text-gold)' : '1px solid var(--border-subtle)',
                            background: ownerDateFilter === tab.key ? 'var(--bg-accent-soft)' : 'var(--bg-alt)',
                            color: ownerDateFilter === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
                            cursor: 'pointer'
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Time slot pills */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {[
                        { key: 'all', label: 'All Slots' },
                        { key: 'morning', label: '🌅 Morning' },
                        { key: 'afternoon', label: '☀️ Afternoon' },
                        { key: 'evening', label: '🌇 Evening' },
                        { key: 'midnight', label: '🌙 Midnight' }
                      ].map(slot => (
                        <button
                          key={slot.key}
                          type="button"
                          onClick={() => setOwnerSlotFilter(slot.key)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            border: ownerSlotFilter === slot.key ? '1px solid #3B82F6' : '1px solid var(--border-subtle)',
                            background: ownerSlotFilter === slot.key ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                            color: ownerSlotFilter === slot.key ? '#2563EB' : 'var(--text-muted)',
                            cursor: 'pointer'
                          }}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>

                    {/* Search box */}
                    <div style={{ minWidth: '240px', flex: 1, display: 'flex', alignItems: 'center', background: 'var(--bg-alt)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0 10px' }}>
                      <Search size={15} color="var(--text-muted)" />
                      <input
                        type="text"
                        placeholder="Search name, phone, order ID, address..."
                        value={ownerSearch}
                        onChange={(e) => setOwnerSearch(e.target.value)}
                        style={{ width: '100%', padding: '0.55rem', background: 'transparent', border: 'none', fontSize: '0.85rem', outline: 'none' }}
                      />
                      {ownerSearch && (
                        <button
                          type="button"
                          onClick={() => setOwnerSearch('')}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Orders List */}
                {filteredOwnerOrders.length === 0 ? (
                  <div className="glass-panel" style={{ padding: '3.5rem 1rem', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
                    <Truck size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                      No Orders in this View
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Try selecting "All" or clearing the search box to view orders.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {filteredOwnerOrders.map((ord) => {
                      const slotMeta = getSlotMeta(ord.deliverySlot);
                      const isToday = ord.deliveryDate === todayStr || (!ord.deliveryDate && ord.status !== 'Delivered');
                      const isDelivered = ord.status === 'Delivered';
                      const fullAddress = ord.deliveryAddress || [ord.houseNo, ord.streetAddress, ord.landmark, ord.city, ord.state, ord.pincode].filter(Boolean).join(', ');
                      const targetPhone = ord.recipientPhone || ord.customerPhone;
                      const cleanPhone = String(targetPhone || '').replace(/\D/g, '');
                      const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress || 'Rishika Blooms')}`;

                      return (
                        <div
                          key={ord.orderId}
                          className="glass-panel"
                          style={{
                            padding: '1.35rem',
                            borderRadius: 'var(--radius-md)',
                            border: isToday && !isDelivered ? '2px solid #EF4444' : isDelivered ? '1px solid rgba(16, 185, 129, 0.4)' : '1.5px solid var(--border-gold)',
                            background: isToday && !isDelivered ? 'rgba(239, 68, 68, 0.03)' : 'var(--bg-surface)',
                            boxShadow: isToday && !isDelivered ? '0 4px 20px rgba(239, 68, 68, 0.08)' : '0 2px 10px rgba(0,0,0,0.03)',
                            position: 'relative'
                          }}
                        >
                          {/* Top Row: Order ID, Time, Status */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                                  #{ord.orderId}
                                </strong>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(ord.orderId, `id-${ord.orderId}`)}
                                  title="Copy Order ID"
                                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                                >
                                  {copiedId === `id-${ord.orderId}` ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                                </button>
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                Placed on: {ord.createdAt ? new Date(ord.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                ...getStatusBadgeStyle(ord.status),
                                padding: '4px 12px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.78rem',
                                fontWeight: 800
                              }}>
                                ● {ord.status || 'Order Placed'}
                              </span>

                              <strong style={{ fontSize: '1.25rem', color: 'var(--text-accent)' }}>
                                ₹{ord.total}
                              </strong>
                            </div>
                          </div>

                          {/* 📅 PROMINENT DISPATCH SCHEDULE BANNER ("Kab Delivery Karna Hai") */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '0.65rem',
                            padding: '0.85rem 1rem',
                            borderRadius: 'var(--radius-sm)',
                            background: isToday ? 'rgba(239, 68, 68, 0.12)' : 'rgba(59, 130, 246, 0.09)',
                            border: isToday ? '1.5px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(59, 130, 246, 0.25)',
                            marginBottom: '1rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Calendar size={18} color={isToday ? '#EF4444' : '#2563EB'} />
                              <div>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: isToday ? '#EF4444' : '#2563EB' }}>
                                  {isToday ? '🚨 DELIVER TODAY' : '📅 SCHEDULED DELIVERY DATE'}
                                </span>
                                <div style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                  {ord.deliveryDate ? new Date(ord.deliveryDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Today'}
                                </div>
                              </div>
                            </div>

                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '0.4rem 0.85rem',
                              borderRadius: 'var(--radius-full)',
                              background: slotMeta.bg,
                              border: `1px solid ${slotMeta.border}`,
                              color: slotMeta.color,
                              fontSize: '0.82rem',
                              fontWeight: 800
                            }}>
                              <span>{slotMeta.icon}</span>
                              <span>{slotMeta.label}</span>
                            </div>
                          </div>

                          {/* Recipient & Customer Contacts with 1-tap Actions */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '1rem',
                            marginBottom: '1rem',
                            background: 'var(--bg-alt)',
                            padding: '1rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)'
                          }}>
                            {/* Customer & Phone */}
                            <div>
                              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Recipient / Customer
                              </div>
                              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                                {ord.recipientName || ord.customerName || 'Valued Customer'}
                              </div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Phone size={13} color="var(--text-gold)" />
                                <strong>{targetPhone || 'Phone Not Provided'}</strong>
                              </div>

                              {/* 1-tap Call and WhatsApp buttons */}
                              {targetPhone && (
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.65rem' }}>
                                  <a
                                    href={`tel:${cleanPhone}`}
                                    className="btn btn-outline btn-sm"
                                    style={{
                                      padding: '0.35rem 0.75rem',
                                      fontSize: '0.78rem',
                                      fontWeight: 700,
                                      color: '#2563EB',
                                      borderColor: 'rgba(37, 99, 235, 0.4)',
                                      textDecoration: 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <Phone size={13} />
                                    <span>Call</span>
                                  </a>

                                  <a
                                    href={createWhatsAppUrl(`Hello ${ord.recipientName || ord.customerName}! This is Rishika Blooms regarding your fresh flower order #${ord.orderId}.`, waPhone)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm"
                                    style={{
                                      padding: '0.35rem 0.75rem',
                                      fontSize: '0.78rem',
                                      fontWeight: 800,
                                      background: '#25D366',
                                      color: '#FFFFFF',
                                      textDecoration: 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      border: 'none'
                                    }}
                                  >
                                    <MessageCircle size={13} />
                                    <span>WhatsApp</span>
                                  </a>
                                </div>
                              )}
                            </div>

                            {/* Full Address & Landmark */}
                            <div>
                              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Delivery Address & Landmark
                              </div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '3px', lineHeight: 1.4 }}>
                                {fullAddress || 'Address details in order confirmation'}
                              </div>

                              <div style={{ marginTop: '0.65rem' }}>
                                <a
                                  href={googleMapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-outline btn-sm"
                                  style={{
                                    padding: '0.35rem 0.75rem',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    color: 'var(--text-gold)',
                                    borderColor: 'var(--border-gold)'
                                  }}
                                >
                                  <MapPin size={13} />
                                  <span>Open in Google Maps</span>
                                  <ExternalLink size={11} />
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* 💌 Personalized Greeting Card Note (if present) */}
                          {ord.giftMessage && (
                            <div style={{
                              background: 'rgba(212, 175, 55, 0.08)',
                              border: '1.5px dashed #D4AF37',
                              borderRadius: 'var(--radius-sm)',
                              padding: '0.85rem 1rem',
                              marginBottom: '1rem',
                              position: 'relative'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#D4AF37', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Heart size={12} color="#D4AF37" fill="#D4AF37" />
                                  <span>Card Note (Write on physical gift card):</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(ord.giftMessage, `note-${ord.orderId}`)}
                                  style={{ background: 'transparent', border: 'none', color: '#D4AF37', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}
                                >
                                  {copiedId === `note-${ord.orderId}` ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                                  <span>Copy Note</span>
                                </button>
                              </div>
                              <p style={{ fontSize: '0.88rem', fontStyle: 'italic', color: 'var(--text-primary)', margin: 0, lineHeight: 1.45 }}>
                                "{ord.giftMessage}"
                              </p>
                            </div>
                          )}

                          {/* Ordered Bouquets List */}
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                              Bouquets Ordered ({(ord.items || []).length} items)
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                              {(ord.items || []).map((item, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.5rem 0.75rem',
                                    background: 'var(--bg-alt)',
                                    borderRadius: 'var(--radius-sm)'
                                  }}
                                >
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                                    />
                                  )}
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                      {item.name}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                      Qty: <strong>{item.quantity || 1}</strong> • Unit: ₹{item.price}
                                      {item.selectedColor && <span> • Color: {item.selectedColor}</span>}
                                    </div>
                                  </div>
                                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                    ₹{(item.price || 0) * (item.quantity || 1)}
                                  </strong>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Payment Method Details */}
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong>Payment:</strong> {ord.paymentMethod || 'Cash on Delivery'}
                            </div>
                            <div>
                              Status: <strong style={{ color: ord.paymentStatus === 'Paid' ? '#10B981' : '#D97706' }}>{ord.paymentStatus || 'Pending'}</strong>
                            </div>
                          </div>

                          {/* 🔑 Secret Handover OTP & Dispatch Actions */}
                          <div style={{
                            background: isDelivered ? 'rgba(16, 185, 129, 0.08)' : 'rgba(212, 175, 55, 0.07)',
                            border: isDelivered ? '1.5px solid #10B981' : '1.5px dashed #D4AF37',
                            borderRadius: 'var(--radius-sm)',
                            padding: '1.15rem',
                            marginBottom: '1rem'
                          }}>
                            {/* STEP 1: DISPATCH / OUT FOR DELIVERY (Flipkart / Meesho Style) */}
                            {!isDelivered && (
                              <div style={{
                                background: 'var(--bg-alt)',
                                border: '1px solid rgba(16, 185, 129, 0.35)',
                                padding: '0.9rem',
                                borderRadius: 'var(--radius-sm)',
                                marginBottom: '1rem'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Truck size={16} color="#10B981" />
                                    <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                                      Step 1: Dispatch Status (Flipkart / Meesho Style)
                                    </strong>
                                  </div>

                                  {ord.status === 'Out for Delivery' ? (
                                    <span style={{ fontSize: '0.74rem', background: '#10B981', color: '#FFF', padding: '3px 10px', borderRadius: '4px', fontWeight: 800 }}>
                                      ● Out for Delivery (Rider Dispatched)
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '0.74rem', background: '#D97706', color: '#FFF', padding: '3px 10px', borderRadius: '4px', fontWeight: 800 }}>
                                      ● Ready for Dispatch
                                    </span>
                                  )}
                                </div>

                                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem 0', lineHeight: 1.4 }}>
                                  When rider leaves to deliver, tap below to mark Out for Delivery. Customer's doorstep verification OTP is: <strong style={{ color: '#10B981', fontFamily: 'monospace', letterSpacing: '1px' }}>{ord.deliveryOtp || '4892'}</strong>.
                                </p>

                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleDispatch(ord)}
                                    className="btn btn-sm"
                                    style={{
                                      flex: 1,
                                      minWidth: '220px',
                                      padding: '0.65rem 1rem',
                                      fontWeight: 800,
                                      fontSize: '0.84rem',
                                      background: ord.status === 'Out for Delivery'
                                        ? 'var(--bg-surface)'
                                        : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                      color: ord.status === 'Out for Delivery' ? '#10B981' : '#FFFFFF',
                                      border: ord.status === 'Out for Delivery' ? '1.5px solid #10B981' : 'none',
                                      borderRadius: '6px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '6px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Truck size={15} />
                                    <span>
                                      {ord.status === 'Out for Delivery'
                                        ? '✓ Order is Out for Delivery'
                                        : '🚚 Mark Out for Delivery (Dispatch Rider)'}
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleCopy(ord.deliveryOtp || '4892', `otp-${ord.orderId}`)}
                                    className="btn btn-outline btn-sm"
                                    style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.65rem 0.85rem' }}
                                  >
                                    <Copy size={13} />
                                    <span>{copiedId === `otp-${ord.orderId}` ? 'Copied OTP' : `Copy OTP (${ord.deliveryOtp || '4892'})`}</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* STEP 2: DOORSTEP OTP HANDOVER & VERIFICATION */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <div>
                                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: isDelivered ? '#059669' : '#D4AF37', textTransform: 'uppercase' }}>
                                  {isDelivered ? '✅ Order Handover Complete & Verified' : 'Step 2: Reached Doorstep? Ask Customer for OTP & Enter Code:'}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                  {isDelivered
                                    ? `Handover verified with OTP: ${ord.deliveryOtp || '4892'} • Congratulations wishes sent to customer.`
                                    : "Enter customer's 4-digit code. Order will be marked Delivered & Paid automatically:"
                                  }
                                </div>
                              </div>

                              {/* Customer's expected OTP code (always visible to owner for reference) */}
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Customer's Code:</span>
                                <span style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'monospace', color: '#10B981', letterSpacing: '2px' }}>
                                  {ord.deliveryOtp || '4892'}
                                </span>
                              </div>
                            </div>

                            {/* OTP Input for Unfinished Delivery */}
                            {!isDelivered && (
                              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <input
                                  type="text"
                                  maxLength={4}
                                  placeholder="4-digit OTP"
                                  value={otpInputs[ord.orderId] || ''}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                    setOtpInputs(prev => ({ ...prev, [ord.orderId]: val }));
                                    if (val.length === 4) {
                                      handleOtpVerify(ord.orderId, val);
                                    }
                                  }}
                                  style={{
                                    width: '130px',
                                    padding: '0.65rem',
                                    textAlign: 'center',
                                    fontFamily: 'monospace',
                                    fontSize: '1.15rem',
                                    fontWeight: 900,
                                    letterSpacing: '3px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: otpErrors[ord.orderId] ? '2px solid #EF4444' : '1.5px solid var(--border-gold)',
                                    background: 'var(--bg-alt)',
                                    outline: 'none'
                                  }}
                                />

                                <button
                                  type="button"
                                  disabled={verifyingId === ord.orderId}
                                  onClick={() => handleOtpVerify(ord.orderId)}
                                  className="btn btn-gold btn-sm"
                                  style={{ padding: '0.7rem 1.25rem', fontWeight: 800, fontSize: '0.88rem', background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)', color: '#000000' }}
                                >
                                  {verifyingId === ord.orderId ? (
                                    <span>Verifying...</span>
                                  ) : (
                                    <>
                                      <CheckCircle2 size={16} />
                                      <span>Verify & Mark Delivered</span>
                                    </>
                                  )}
                                </button>

                                {otpErrors[ord.orderId] && (
                                  <div style={{ color: '#EF4444', fontSize: '0.75rem', width: '100%', marginTop: '3px' }}>
                                    {otpErrors[ord.orderId]}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Order Status Updater & Actions */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status:</span>
                              {['Order Placed', 'Preparing Flowers', 'Out for Delivery', 'Delivered'].map(st => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => {
                                    updateOrderStatus(ord.orderId, st);
                                    showToast(`Order #${ord.orderId} status updated to "${st}"`, 'info');
                                  }}
                                  style={{
                                    padding: '0.25rem 0.6rem',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: '0.72rem',
                                    fontWeight: ord.status === st ? 800 : 500,
                                    border: ord.status === st ? '1.5px solid var(--text-gold)' : '1px solid var(--border-subtle)',
                                    background: ord.status === st ? 'var(--bg-accent-soft)' : 'transparent',
                                    color: ord.status === st ? 'var(--text-primary)' : 'var(--text-muted)',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>

                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => window.print()}
                              style={{ fontSize: '0.75rem' }}
                            >
                              <Printer size={13} />
                              <span>Print Slip</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            VIEW 2: CUSTOMER ORDER TRACKING (Flipkart & Meesho Experience)
            ========================================================================= */}
        {activeMode === 'customer' && (
          <div>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <span className="section-pretitle">Customer Orders & Live Tracking</span>
              <h1 className="font-serif-editorial" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                My Bouquet Orders
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto' }}>
                Track live status, secret doorstep delivery OTP, express courier dispatch, and print tax invoices.
              </p>
            </div>

            {/* Quick Lookup Box */}
            <div className="glass-panel" style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', maxWidth: '640px', margin: '0 auto 1.5rem auto' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', background: 'var(--bg-alt)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0 12px' }}>
                  <Search size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  <input 
                    type="text" 
                    placeholder="Search by Order ID (RB-XXXXXX) or Mobile..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.5rem', background: 'transparent', border: 'none', fontSize: '0.88rem', outline: 'none', color: 'var(--text-primary)' }}
                  />
                </div>
                {customerSearch && (
                  <button 
                    type="button" 
                    className="btn btn-outline btn-sm"
                    onClick={() => setCustomerSearch('')}
                    style={{ fontSize: '0.78rem', padding: '0.5rem 0.85rem' }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* If No Orders Matched */}
            {filteredCustomerOrders.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center', borderRadius: 'var(--radius-md)', maxWidth: '560px', margin: '0 auto' }}>
                <div style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: 'rgba(212, 175, 55, 0.12)',
                  border: '1.5px solid var(--border-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto'
                }}>
                  <ShoppingBag size={32} color="var(--text-gold)" />
                </div>

                {customerSearch.trim() ? (
                  <>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                      No Orders Matching "{customerSearch}"
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                      Please verify your order reference number or 10-digit mobile number, or clear your search to see your bouquets.
                    </p>
                    <button 
                      type="button" 
                      className="btn btn-outline btn-sm"
                      onClick={() => setCustomerSearch('')}
                    >
                      Clear Search Filter
                    </button>
                  </>
                ) : (
                  <>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.45rem', color: 'var(--text-primary)' }}>
                      No Orders Placed Yet
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
                      You haven't placed any flower bouquet orders on this device yet. Browse our handcrafted luxury collections and make any occasion memorable!
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                      <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={() => navigateTo('shop')}
                        style={{ padding: '0.75rem 1.75rem', fontWeight: 700 }}
                      >
                        <span>🌸 Explore Bouquets & Shop Now</span>
                        <ArrowRight size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setCustomerSearch('RB-784291')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-gold)',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          marginTop: '0.5rem'
                        }}
                      >
                        Preview Demo Order Tracking (RB-784291)
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* List of Customer Order Cards (Flipkart & Meesho Mobile Style) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '780px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Showing {filteredCustomerOrders.length} {filteredCustomerOrders.length === 1 ? 'Order' : 'Orders'}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Live Doorstep Delivery Tracking Active
                  </span>
                </div>

                {filteredCustomerOrders.map((ord) => {
                  const targetPhone = ord.recipientPhone || ord.customerPhone || '';
                  const cleanPhone = String(targetPhone).replace(/\D/g, '');
                  const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                  const slotMeta = getSlotMeta(ord.deliverySlot);
                  const fullAddress = ord.deliveryAddress || `${ord.houseNo || ''} ${ord.streetAddress || ''} ${ord.landmark ? 'Near ' + ord.landmark : ''} ${ord.city || ''} ${ord.pincode || ''}`.trim();
                  const googleMapsUrl = ord.locationUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress || 'New Delhi')}`;
                  
                  // Primary bouquet product for reviews
                  const firstItem = ord.items?.[0];
                  const primaryProduct = (products || []).find(p => p.id === (firstItem?.productId || firstItem?.id) || p.title === firstItem?.name) || (products || [])[0];

                  return (
                    <div 
                      key={ord.orderId}
                      className="glass-panel"
                      style={{
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border-gold)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                        background: 'var(--bg-surface)'
                      }}
                    >
                      {/* 1. Order Header: ID, Date, Status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                              #{ord.orderId}
                            </strong>
                            <button
                              type="button"
                              onClick={() => handleCopy(ord.orderId, `id-${ord.orderId}`)}
                              title="Copy Order ID"
                              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'inline-flex' }}
                            >
                              {copiedId === `id-${ord.orderId}` ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                            </button>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Placed on {new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        <span style={{
                          ...getStatusBadgeStyle(ord.status),
                          padding: '4px 12px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'currentColor', display: 'inline-block' }}></span>
                          <span>{ord.status || 'Order Placed'}</span>
                        </span>
                      </div>

                      {/* 2. Official Doorstep Delivery Handover OTP Protocol */}
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.95) 0%, rgba(6, 95, 70, 0.95) 100%)',
                        border: '1.5px solid rgba(16, 185, 129, 0.6)',
                        borderRadius: '10px',
                        padding: '1rem 1.25rem',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.85rem',
                        boxShadow: '0 4px 18px rgba(6, 78, 59, 0.25)',
                        color: '#FFFFFF'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#A7F3D0', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <ShieldCheck size={14} color="#34D399" />
                            <span>Official Doorstep Handover Verification Code</span>
                          </div>
                          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#FFFFFF', fontFamily: 'monospace', letterSpacing: '4px', margin: '2px 0 0 0' }}>
                            {ord.deliveryOtp || '4892'}
                          </div>
                        </div>
                        <div style={{ maxWidth: '280px', fontSize: '0.76rem', color: '#D1FAE5', lineHeight: 1.45 }}>
                          🔒 <strong>Zero-Contact Verification Protocol:</strong> Share this 4-digit code with our delivery partner only after receiving and verifying your bouquet in person.
                        </div>
                      </div>

                      {/* 3. Dedicated Cold-Chain Courier Logistics & Transit Card */}
                      <div style={{
                        background: 'var(--bg-alt)',
                        padding: '0.85rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        marginBottom: '1rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Truck size={16} color="var(--text-gold)" />
                            <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                              Rishika Blooms Dedicated Express Courier Fleet
                            </strong>
                          </div>
                          <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(37, 99, 235, 0.12)', color: '#2563EB', fontWeight: 800 }}>
                            Air-Conditioned Cold-Chain Transit
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.45rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          <div>• <strong>Courier Partner:</strong> Express Priority Fleet</div>
                          <div>• <strong>Hydration Lock:</strong> Pre-hydrated bio-gel stems</div>
                          <div>• <strong>Tracking Ref:</strong> TRK-{(ord.orderId || '984210').replace(/\D/g, '')}</div>
                          <div>• <strong>Transit Target:</strong> {slotMeta.label}</div>
                        </div>
                      </div>

                      {/* 4. Visual Progress Stepper (BlueDart / Flipkart Logistics Timeline) */}
                      <div style={{ marginBottom: '1.25rem', background: 'var(--bg-alt)', padding: '0.95rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Live Delivery Progress Tracker
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>
                            ● Active Milestone Verified
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.15rem', textAlign: 'center' }}>
                          {[
                            { title: 'Placed', sub: 'Logged', done: true },
                            { title: 'Confirmed', sub: 'Assigned', done: ord.status !== 'Order Placed' },
                            { title: 'Packed', sub: 'Inspected', done: ['Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(ord.status) },
                            { title: 'Out for Delivery', sub: 'With Rider', done: ['Out for Delivery', 'Delivered'].includes(ord.status) },
                            { title: 'Delivered', sub: 'Handed Over', done: ord.status === 'Delivered' }
                          ].map((st, i) => (
                            <div key={st.title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: st.done ? '#10B981' : 'var(--bg-surface)',
                                color: st.done ? '#FFF' : 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                marginBottom: '4px',
                                border: st.done ? '1.5px solid #10B981' : '1px solid var(--border-subtle)',
                                boxShadow: st.done ? '0 0 10px rgba(16, 185, 129, 0.35)' : 'none'
                              }}>
                                {st.done ? '✓' : i + 1}
                              </div>
                              <span style={{ fontSize: '0.68rem', fontWeight: st.done ? 800 : 500, color: st.done ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: 1.2 }}>
                                {st.title}
                              </span>
                              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                                {st.sub}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 4. Products in this Order (with Bouquet Images) */}
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                          Ordered Bouquets ({ord.items?.length || 1})
                        </div>

                        {(ord.items && ord.items.length > 0 ? ord.items : [
                          { name: 'Luxury Handcrafted Velvet Bouquet', price: ord.total || 1399, quantity: 1 }
                        ]).map((item, idx) => {
                          const itemImg = getItemImage(item);
                          return (
                            <div 
                              key={idx}
                              style={{
                                display: 'flex',
                                gap: '0.85rem',
                                alignItems: 'center',
                                padding: '0.65rem 0',
                                borderBottom: idx < (ord.items?.length || 1) - 1 ? '1px solid var(--border-subtle)' : 'none'
                              }}
                            >
                              <img 
                                src={itemImg} 
                                alt={item.name}
                                style={{
                                  width: '60px',
                                  height: '60px',
                                  borderRadius: '8px',
                                  objectFit: 'cover',
                                  border: '1.5px solid var(--border-subtle)',
                                  flexShrink: 0
                                }}
                                onError={(e) => { e.target.src = '/images/bday_royal_blue_tulip_lily_card.jpg'; }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 2px 0', color: 'var(--text-primary)' }}>
                                  {item.name}
                                </h4>
                                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                                  {item.selectedColor && <span>Color: <strong>{item.selectedColor}</strong> • </span>}
                                  <span>Qty: <strong>{item.quantity || 1}</strong></span>
                                </div>
                                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-accent)', marginTop: '2px' }}>
                                  ₹{item.price * (item.quantity || 1)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* 5. Schedule & Delivery Info */}
                      <div style={{
                        background: 'var(--bg-alt)',
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        marginBottom: '1rem',
                        fontSize: '0.82rem',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '0.75rem'
                      }}>
                        <div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                            Delivery Slot & Date
                          </div>
                          <div style={{ fontWeight: 800, color: slotMeta.color, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span>{slotMeta.icon}</span>
                            <span>{slotMeta.label}</span>
                          </div>
                          <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '0.78rem' }}>
                            Scheduled for: <strong>{ord.deliveryDate ? new Date(ord.deliveryDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Today'}</strong>
                          </div>
                        </div>

                        <div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                            Recipient & Destination
                          </div>
                          <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                            {ord.recipientName || ord.customerName || 'Valued Recipient'}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '0.78rem', lineHeight: 1.35 }}>
                            {fullAddress || 'Address in confirmation'}
                          </div>
                          {fullAddress && (
                            <a
                              href={googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--text-gold)', fontSize: '0.75rem', fontWeight: 700, marginTop: '4px', textDecoration: 'none' }}
                            >
                              <MapPin size={12} />
                              <span>View Destination on Map</span>
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* 6. Personalized Greeting Card (if present) */}
                      {ord.giftMessage && (
                        <div style={{
                          background: 'rgba(212, 175, 55, 0.08)',
                          border: '1.5px dashed var(--border-gold)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.75rem 1rem',
                          marginBottom: '1rem',
                          fontSize: '0.82rem'
                        }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-gold)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                            <Heart size={12} color="var(--text-gold)" fill="var(--text-gold)" />
                            <span>Complimentary Gift Card Message:</span>
                          </div>
                          <div style={{ fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                            "{ord.giftMessage}"
                          </div>
                        </div>
                      )}

                      {/* 7. Total & Payment */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginBottom: '1rem' }}>
                        <div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Payment Mode: </span>
                          <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{ord.paymentMethod || 'Cash on Delivery'}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginRight: '6px' }}>Total Amount:</span>
                          <strong style={{ fontSize: '1.25rem', color: 'var(--text-accent)' }}>₹{ord.total}</strong>
                        </div>
                      </div>

                      {/* 8. Action Buttons (Invoice, Review with Photos, WhatsApp Concierge) */}
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button 
                          type="button" 
                          className="btn btn-outline btn-sm"
                          onClick={() => window.print()}
                          style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
                        >
                          <Printer size={13} />
                          <span>Print Slip / Invoice</span>
                        </button>

                        <button 
                          type="button" 
                          className="btn btn-gold btn-sm"
                          onClick={() => {
                            if (openWriteReviewModal) {
                              openWriteReviewModal(primaryProduct);
                            }
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            border: 'none',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            padding: '0.45rem 0.85rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
                          }}
                        >
                          <Camera size={13} />
                          <span>⭐ Rate & Review with Photos</span>
                        </button>

                        {cleanPhone && (
                          <a
                            href={`tel:${cleanPhone}`}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Phone size={13} />
                            <span>Call Concierge</span>
                          </a>
                        )}

                        <a
                          href={createWhatsAppUrl(`Hello! I need an update regarding my Rishika Blooms Order #${ord.orderId}.`, waPhone || brandConfig?.whatsappNumber)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm"
                          style={{
                            fontSize: '0.78rem',
                            padding: '0.45rem 0.85rem',
                            background: '#25D366',
                            color: '#FFFFFF',
                            border: 'none',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 700
                          }}
                        >
                          <MessageCircle size={13} />
                          <span>WhatsApp Update</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      {/* Flipkart / Meesho In-App Delivery Success Celebration Modal */}
      {deliveredCelebrationOrder && (
        <div 
          className="drawer-backdrop open" 
          style={{ zIndex: 100060, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setDeliveredCelebrationOrder(null)}
        >
          <div 
            className="glass-panel animate-scale-up" 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '460px',
              width: '100%',
              padding: '2rem 1.75rem',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid #10B981',
              background: 'var(--bg-surface)',
              textAlign: 'center',
              boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 30px rgba(16, 185, 129, 0.25)'
            }}
          >
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2.5px solid #10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              <CheckCircle2 size={40} color="#10B981" />
            </div>

            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Flipkart / Meesho Verified Handover
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0.5rem 0' }}>
              Order Delivered Successfully! 🎉
            </h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontFamily: 'monospace', marginBottom: '1.25rem' }}>
              #{deliveredCelebrationOrder.orderId}
            </div>

            <div style={{
              background: 'var(--bg-alt)',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'left',
              fontSize: '0.84rem',
              marginBottom: '1.25rem',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Recipient:</span>
                <strong>{deliveredCelebrationOrder.recipientName || deliveredCelebrationOrder.customerName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Doorstep Handover OTP:</span>
                <strong style={{ color: '#10B981', fontFamily: 'monospace' }}>✓ {deliveredCelebrationOrder.deliveryOtp || '4892'} Verified</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Status:</span>
                <strong style={{ color: '#10B981' }}>✓ Paid in Full</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Delivered Status:</span>
                <strong style={{ color: '#10B981' }}>● Delivered (Just Now)</strong>
              </div>
            </div>

            <div style={{
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1.5px dashed #D4AF37',
              borderRadius: 'var(--radius-sm)',
              padding: '0.85rem',
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              lineHeight: 1.45,
              marginBottom: '1.5rem',
              fontStyle: 'italic'
            }}>
              "💐 Congratulations {deliveredCelebrationOrder.recipientName || deliveredCelebrationOrder.customerName}! Your fresh luxury floral bouquet has been handed over successfully. We hope it brings boundless joy, smiles, and fragrance to your celebration! ✨"
            </div>

            <button
              type="button"
              onClick={() => setDeliveredCelebrationOrder(null)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontWeight: 800, fontSize: '0.95rem', background: '#10B981', border: 'none', justifyContent: 'center' }}
            >
              <span>Done & Return to Orders</span>
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
