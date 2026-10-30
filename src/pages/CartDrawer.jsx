import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { BRAND_CONFIG } from '../config/brand';
import { createWhatsAppUrl, buildCartWhatsAppMessage } from '../config/whatsapp';
import { 
  X, Plus, Minus, Trash2, ShoppingBag, MessageCircle, 
  CreditCard, Sparkles, Tag, CheckCircle2, ChevronRight, 
  Clock, Truck, Calendar, MapPin, User, Gift, ShieldCheck,
  Navigation, LocateFixed, Smartphone, Copy, Check, QrCode, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sendOrderVerificationNotification, DEFAULT_VERIFICATION_EMAIL } from '../services/emailService';

export default function CartDrawer() {
  const { 
    isCartOpen, setIsCartOpen, 
    cart, updateQuantity, removeFromCart, clearCart, 
    cartSubtotal, deliveryFee, discountAmount, cartTotal, 
    couponCode, appliedCoupon, applyCoupon, removeCoupon, 
    t, navigateTo, showToast, brandConfig,
    createOrder, openOrderConfirmationModal,
    triggerIncomingSmsNotification
  } = useShop();

  const [inputCoupon, setInputCoupon] = useState('');
  const [showCheckoutForm, setShowCheckoutForm] = useState(true);
  const [paymentMode, setPaymentMode] = useState('otp'); // 'otp' | 'online'

  // Recipient & Delivery form state
  const [customerName, setCustomerName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('Standard Delivery (1 PM - 5 PM)');
  const [giftMessage, setGiftMessage] = useState('');

  // Live Location State with multi-tier fallback (Hardware GPS -> Network IP -> Street Address Pin)
  const [locationData, setLocationData] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Real Owner Direct UPI Instant Payment Modal State
  const [showUpiPaymentModal, setShowUpiPaymentModal] = useState(false);
  const [enteredUtr, setEnteredUtr] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmittingUpi, setIsSubmittingUpi] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    applyCoupon(inputCoupon);
  };

  const handleGetLiveLocation = async () => {
    setIsLocating(true);

    const onLocationSuccess = (lat, lng, accuracy, sourceName) => {
      const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      setLocationData({
        lat,
        lng,
        accuracy: Math.round(accuracy || 30),
        source: sourceName,
        mapsUrl
      });
      setIsLocating(false);
      showToast(`📍 Live GPS pin attached (${sourceName})! Concierge rider will navigate directly.`, 'success');
    };

    const runFallback = async () => {
      // 1. High-speed IP Geolocation over HTTPS (Works smoothly even on local HTTP LAN on mobile!)
      try {
        const response = await fetch('https://get.geojs.io/v1/ip/geo.json', { signal: AbortSignal.timeout(4500) });
        if (response.ok) {
          const geo = await response.json();
          if (geo.latitude && geo.longitude) {
            onLocationSuccess(
              parseFloat(geo.latitude),
              parseFloat(geo.longitude),
              50,
              `Network Pin: ${geo.city || 'Detected Area'}`
            );
            return;
          }
        }
      } catch (err) {
        console.warn('GeoJS IP lookup note:', err);
      }

      // 2. Secondary HTTPS IP API
      try {
        const response2 = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
        if (response2.ok) {
          const geo2 = await response2.json();
          if (geo2.latitude && geo2.longitude) {
            onLocationSuccess(
              parseFloat(geo2.latitude),
              parseFloat(geo2.longitude),
              65,
              `Network Pin: ${geo2.city || 'Local Area'}`
            );
            return;
          }
        }
      } catch (err) {}

      // 3. Fallback to entered Address & PIN
      if (deliveryAddress.trim() || pincode.trim()) {
        const query = `${deliveryAddress.trim()} ${pincode.trim()}`.trim();
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
        setLocationData({
          lat: null,
          lng: null,
          accuracy: null,
          source: 'Street Address Landmark Pin',
          mapsUrl
        });
        setIsLocating(false);
        showToast('📍 Verified Google Maps destination attached from your street address & PIN!', 'success');
      } else {
        setIsLocating(false);
        showToast('Please enter your delivery street address or PIN code so we can pin your destination for the rider!', 'warning');
      }
    };

    // If native geolocation is supported and browser allows it
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          onLocationSuccess(latitude, longitude, accuracy, 'Device GPS Satellite');
        },
        async (err) => {
          console.warn('Native GPS unavailable or insecure LAN origin, running network fallback:', err);
          await runFallback();
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      await runFallback();
    }
  };

  const validateDeliveryDetails = () => {
    const cleanPhone = String(recipientPhone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setShowCheckoutForm(true);
      showToast('📱 Please enter a valid 10-digit mobile number to receive your Delivery Handover OTP message!', 'error');
      setTimeout(() => {
        const el = document.getElementById('checkout-recipient-phone');
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return false;
    }

    if (!deliveryAddress.trim()) {
      setShowCheckoutForm(true);
      showToast('🏠 Please enter your full delivery address.', 'warning');
      setTimeout(() => {
        const el = document.getElementById('checkout-delivery-address');
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return false;
    }

    return true;
  };

  const handleConfirmDeliveryOrder = (actionType = 'sms', extraDetails = {}) => {
    if (cart.length === 0) return;
    if (!validateDeliveryDetails()) return;

    const orderId = `RB-${Math.floor(100000 + Math.random() * 900000)}`;
    const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));
    const targetEmail = brandConfig?.email || DEFAULT_VERIFICATION_EMAIL;
    const clean10 = String(recipientPhone).replace(/\D/g, '').slice(-10);

    let paymentMethodName = 'Pay on Handover (OTP Verified)';
    if (actionType === 'whatsapp') {
      paymentMethodName = 'WhatsApp Concierge Order';
    } else if (actionType === 'online_upi') {
      const activeUpi = extraDetails.upiId || brandConfig?.upiId || 'roshikablooms@upi';
      const utrSuffix = extraDetails.utrNumber ? ` (UTR: ${extraDetails.utrNumber})` : '';
      paymentMethodName = `Online UPI Paid to Owner [${activeUpi}]${utrSuffix}`;
    }

    // Create and record order with Delivery OTP & location
    const newOrder = createOrder({
      orderId,
      deliveryOtp,
      customerName: customerName || recipientName || 'Valued Patron',
      recipientName: recipientName || customerName || 'Recipient',
      recipientPhone: clean10,
      deliveryAddress,
      pincode,
      locationCoords: locationData ? { lat: locationData.lat, lng: locationData.lng } : null,
      locationUrl: locationData?.mapsUrl || '',
      deliveryDate: deliveryDate || new Date().toISOString().split('T')[0],
      deliverySlot,
      giftMessage,
      items: cart,
      subtotal: cartSubtotal,
      deliveryFee,
      total: cartTotal,
      paymentMethod: paymentMethodName,
      utrNumber: extraDetails.utrNumber || null
    });

    // Dispatch verified order notification to email
    sendOrderVerificationNotification({
      orderId,
      customerName: customerName || recipientName,
      recipientName,
      recipientPhone: clean10,
      deliveryAddress,
      pincode,
      deliveryDate: deliveryDate || new Date().toISOString().split('T')[0],
      deliverySlot,
      giftMessage,
      cartItems: cart,
      total: cartTotal,
      paymentMethod: paymentMethodName,
      targetEmail
    });

    // 📱 DISPATCH OTP MESSAGE DIRECTLY TO CUSTOMER'S MOBILE NUMBER (SMS / WhatsApp)
    triggerIncomingSmsNotification({
      orderId,
      deliveryOtp,
      phone: clean10,
      customerName: recipientName || customerName,
      autoLaunchNative: true
    });

    clearCart();
    setIsCartOpen(false);
    setShowUpiPaymentModal(false);
    openOrderConfirmationModal(newOrder);
    showToast(`🌸 Order #${orderId} confirmed! Handover OTP sent to +91 ${clean10}.`, 'success');

    
  };

  const freeDeliveryThreshold = BRAND_CONFIG.delivery.freeThreshold;
  const amountForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartSubtotal);

  return (
    <div className="drawer-backdrop open" onClick={() => setIsCartOpen(false)}>
      <div className="drawer-container" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={20} color="var(--text-gold)" />
            <h3 className="drawer-title">{t('cartTitle')}</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              ({cart.length} {cart.length === 1 ? 'item' : 'items'})
            </span>
          </div>
          <button className="drawer-close-btn" onClick={() => setIsCartOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Free Delivery Bar */}
        <div style={{ background: 'var(--bg-alt)', padding: '0.65rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
          {amountForFreeDelivery > 0 ? (
            <div style={{ color: 'var(--text-secondary)' }}>
              🚚 Add <strong style={{ color: 'var(--text-accent)' }}>₹{amountForFreeDelivery}</strong> more for <strong>FREE Delivery</strong>!
            </div>
          ) : (
            <div style={{ color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={14} /> You have unlocked FREE Delivery!
            </div>
          )}
        </div>

        {/* Drawer Body: Cart Items */}
        <div className="drawer-body">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🥀</div>
              <h4 className="font-serif-editorial" style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {t('emptyCart')}
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Explore our fresh floral collections and make someone smile today.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => { setIsCartOpen(false); navigateTo('shop'); }}
              >
                <span>Browse Flowers & Gifts</span>
              </button>
            </div>
          ) : (
            <div>
              {/* Item Rows */}
              {cart.map((item) => (
                <div key={item.cartItemId} className="cart-item-row">
                  <img src={item.image} alt={item.name} className="cart-item-thumb" />

                  <div>
                    <h4 className="cart-item-title">{item.name}</h4>
                    <div className="cart-item-variants">
                      {item.selectedColor && <span>Color: {item.selectedColor} • </span>}
                      {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                      {item.customDetails && <div style={{ fontSize: '0.72rem', color: 'var(--text-gold)' }}>{item.customDetails}</div>}
                    </div>

                    <div className="cart-item-price">
                      ₹{item.price * item.quantity}
                    </div>

                    {/* Quantity Stepper */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--bg-alt)', borderRadius: 'var(--radius-full)', padding: '0.1rem 0.4rem', marginTop: '0.4rem', border: '1px solid var(--border-subtle)' }}>
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Minus size={11} />
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0 0.5rem' }}>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Remove Item */}
                  <button 
                    onClick={() => removeFromCart(item.cartItemId)}
                    style={{ color: 'var(--text-muted)', padding: '0.5rem', background: 'none' }}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {/* Promo Coupon Box */}
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-alt)', borderRadius: 'var(--radius-md)' }}>
                {appliedCoupon ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#16A34A', fontSize: '0.85rem', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Tag size={15} />
                      <span>Code <strong>{appliedCoupon.code}</strong> Applied! (-₹{discountAmount})</span>
                    </div>
                    <button onClick={removeCoupon} style={{ color: '#DC2626', fontSize: '0.78rem', background: 'none' }}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text"
                      placeholder="Promo Code (e.g. BLOOM10)"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.5rem 0.8rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        fontSize: '0.82rem',
                        outline: 'none'
                      }}
                    />
                    <button type="submit" className="btn btn-gold btn-sm">
                      Apply
                    </button>
                  </form>
                )}
              </div>

              {/* 📍 STEP 1: DELIVERY & RECIPIENT DETAILS */}
              <div style={{ marginTop: '1.25rem' }}>
                <div style={{
                  padding: '1.1rem',
                  background: 'var(--bg-alt)',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-gold)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={17} color="var(--text-gold)" />
                      <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        Delivery & Recipient Details
                      </h4>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                      ● OTP Protected
                    </span>
                  </div>

                  {/* Recipient Mobile Phone Input - PRIMARY TARGET FOR DELIVERY OTP */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                      Mobile Number (For Handover OTP) <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-surface)', border: '1.5px solid var(--border-gold)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      <span style={{ padding: '0.55rem 0.75rem', background: 'rgba(212, 175, 55, 0.12)', color: 'var(--text-gold)', fontWeight: 800, fontSize: '0.88rem', borderRight: '1px solid var(--border-subtle)' }}>
                        🇮🇳 +91
                      </span>
                      <input 
                        id="checkout-recipient-phone"
                        type="tel"
                        placeholder="Enter 10-digit mobile number"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        maxLength={10}
                        style={{
                          flex: 1,
                          padding: '0.55rem 0.8rem',
                          border: 'none',
                          background: 'transparent',
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          letterSpacing: '1px',
                          color: 'var(--text-primary)',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                      Secret 4-digit handover OTP will be dispatched to this number upon order confirmation.
                    </div>
                  </div>

                  {/* Customer & Recipient Names */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        Recipient Name <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. Priya Sharma"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        Sender Name (Your Name)
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. Rahul Verma"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }}
                      />
                    </div>
                  </div>

                  {/* Full Address */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      Full Street Address <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input 
                      id="checkout-delivery-address"
                      type="text"
                      placeholder="House/Flat No, Apartment, Street name, Landmark"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }}
                    />
                  </div>

                  {/* PIN Code & Delivery Date */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        PIN Code
                      </label>
                      <input 
                        type="text"
                        placeholder="6-digit PIN"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.slice(0, 6))}
                        maxLength={6}
                        style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        Delivery Date
                      </label>
                      <input 
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }}
                      />
                    </div>
                  </div>

                  {/* Delivery Slot */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      Preferred Delivery Time Slot
                    </label>
                    <select
                      value={deliverySlot}
                      onChange={(e) => setDeliverySlot(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }}
                    >
                      <option value="Morning (8 AM - 11 AM)">🌅 Morning Delivery (8 AM - 11 AM)</option>
                      <option value="Standard Delivery (1 PM - 5 PM)">☀️ Standard Delivery (1 PM - 5 PM)</option>
                      <option value="Evening (6 PM - 9 PM)">🌇 Evening Delivery (6 PM - 9 PM)</option>
                      <option value="Midnight Surprise (11:15 PM - 12:00 AM)">🌙 Midnight Surprise (11:15 PM - 12:00 AM)</option>
                    </select>
                  </div>

                  {/* Live Location Sharing for Rider Navigation */}
                  <div style={{
                    padding: '0.85rem',
                    background: locationData ? 'rgba(16, 185, 129, 0.06)' : 'var(--bg-surface)',
                    border: locationData ? '1.5px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all 0.25s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <div style={{ minWidth: 0, flex: '1 1 180px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Navigation size={14} color={locationData ? '#10B981' : 'var(--text-gold)'} />
                          <span>Live Delivery GPS Location</span>
                          {locationData && (
                            <span style={{ fontSize: '0.66rem', padding: '1px 6px', borderRadius: '10px', background: '#10B981', color: '#fff', fontWeight: 800 }}>
                              ATTACHED
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3, display: 'block', marginTop: '2px' }}>
                          Rider gets 1-tap Google Maps turn-by-turn route directly to your exact doorstep.
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleGetLiveLocation}
                        disabled={isLocating}
                        className="btn btn-outline btn-sm"
                        style={{
                          fontSize: '0.76rem',
                          padding: '0.38rem 0.75rem',
                          borderColor: locationData ? '#10B981' : 'var(--border-gold)',
                          color: locationData ? '#10B981' : 'var(--text-gold)',
                          background: locationData ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          flexShrink: 0
                        }}
                      >
                        <MapPin size={13} />
                        <span>{isLocating ? 'Locating...' : locationData ? '✓ Pin Attached' : 'Attach GPS Pin'}</span>
                      </button>
                    </div>

                    {locationData && (
                      <div style={{
                        marginTop: '0.65rem',
                        padding: '0.55rem 0.75rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                        fontSize: '0.76rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block', flexShrink: 0, boxShadow: '0 0 8px #10B981' }} />
                          <span style={{ color: '#10B981', fontWeight: 700, wordBreak: 'break-all' }}>
                            {locationData.lat ? `GPS: ${locationData.lat.toFixed(4)}, ${locationData.lng.toFixed(4)} (±${locationData.accuracy}m)` : locationData.source}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                          <a 
                            href={locationData.mapsUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{ color: 'var(--text-gold)', fontWeight: 800, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                          >
                            <span>Preview Pin on Map</span>
                            <span>↗</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Greeting Card Message */}
                  <textarea 
                    rows={2}
                    placeholder="Complimentary Greeting Card Message (Optional)..."
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    style={{ padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.82rem', resize: 'none', outline: 'none' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer: Billing & Executive Checkout */}
        {cart.length > 0 && (
          <div className="drawer-footer">
            {/* STEP 2: CHOOSE CHECKOUT / PAYMENT MODE */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-gold)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} />
                <span>Select Order & Payment Method</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {/* Method 1: Handover OTP (Default & Recommended) */}
                <div 
                  onClick={() => setPaymentMode('otp')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: paymentMode === 'otp' ? '2px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                    background: paymentMode === 'otp' ? 'rgba(212, 175, 55, 0.08)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: paymentMode === 'otp' ? '5px solid var(--text-gold)' : '2px solid var(--border-subtle)',
                      background: 'var(--bg-surface)',
                      flexShrink: 0
                    }} />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Handover OTP on Delivery</span>
                        <span style={{ fontSize: '0.68rem', color: '#10B981', background: 'rgba(16, 185, 129, 0.12)', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>Recommended</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Secret 4-digit code sent to your phone. Pay cash/UPI to delivery rider.
                      </div>
                    </div>
                  </div>
                  <ShieldCheck size={18} color="var(--text-gold)" />
                </div>

                {/* Method 2: Online UPI / Card Payment */}
                <div 
                  onClick={() => setPaymentMode('online')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: paymentMode === 'online' ? '2px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                    background: paymentMode === 'online' ? 'rgba(212, 175, 55, 0.08)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: paymentMode === 'online' ? '5px solid var(--text-gold)' : '2px solid var(--border-subtle)',
                      background: 'var(--bg-surface)',
                      flexShrink: 0
                    }} />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Online Payment (Direct UPI to Owner / QR Code)
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Instant digital pay to atelier UPI ID via GPay, PhonePe, Paytm & get OTP.
                      </div>
                    </div>
                  </div>
                  <Smartphone size={18} color="var(--text-gold)" />
                </div>
              </div>
            </div>

            {/* STEP 3: PRICE BREAKDOWN CARD */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1.5px solid var(--border-gold)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1rem',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-gold)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Sparkles size={13} /> Price Breakdown ({cart.length} {cart.length === 1 ? 'Item' : 'Items'})
                </span>
                <span style={{ fontSize: '0.72rem', color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  ✓ Best Rate Guaranteed
                </span>
              </div>

              <div className="bill-row">
                <span>Total MRP ({cart.length} items):</span>
                <span>₹{cartSubtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="bill-row" style={{ color: '#16A34A', fontWeight: 700 }}>
                  <span>Discount on MRP:</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="bill-row">
                <span>Delivery Fee:</span>
                <span>{deliveryFee === 0 ? <strong style={{ color: '#16A34A' }}>FREE (Express)</strong> : `₹${deliveryFee}`}</span>
              </div>
              <div className="bill-total-row" style={{ marginTop: '0.5rem', paddingTop: '0.65rem', marginBottom: 0 }}>
                <span>Total Payable Amount:</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹{cartTotal}</span>
              </div>
            </div>

            {/* Savings Banner */}
            {discountAmount > 0 && (
              <div style={{ 
                background: 'rgba(22, 163, 74, 0.12)', 
                border: '1px dashed rgba(22, 163, 74, 0.4)', 
                color: '#16A34A', 
                padding: '0.5rem 0.75rem', 
                borderRadius: 'var(--radius-sm)', 
                fontSize: '0.78rem', 
                fontWeight: 700, 
                textAlign: 'center', 
                marginBottom: '0.85rem' 
              }}>
                🎉 You will save ₹{discountAmount} on this order!
              </div>
            )}

            {/* FLIPKART / MEESHO MASTER PROCEED BUTTON */}
            <button
              type="button"
              onClick={() => {
                setIsCartOpen(false);
                navigateTo('checkout');
              }}
              style={{
                width: '100%',
                padding: '0.9rem 1rem',
                background: '#FB641B',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.96rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(251, 100, 27, 0.4)',
                marginBottom: '0.75rem',
                textTransform: 'uppercase'
              }}
            >
              <span>PROCEED TO CHECKOUT • ₹{cartTotal}</span>
              <ArrowRight size={18} />
            </button>

            {/* STEP 4: SINGLE MASTER ACTION BUTTON */}
            <div>
              <button 
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => {
                  if (paymentMode === 'otp') {
                    handleConfirmDeliveryOrder('sms');
                  } else if (paymentMode === 'whatsapp') {
                    handleConfirmDeliveryOrder('whatsapp');
                  } else if (paymentMode === 'online') {
                    if (validateDeliveryDetails()) {
                      setShowUpiPaymentModal(true);
                    }
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.95rem 1rem',
                  background: paymentMode === 'whatsapp' 
                    ? 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' 
                    : paymentMode === 'online'
                    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #D4AF37 0%, #B8972E 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.96rem',
                  boxShadow: paymentMode === 'whatsapp'
                    ? '0 8px 24px rgba(37, 211, 102, 0.35)'
                    : paymentMode === 'online'
                    ? '0 8px 24px rgba(16, 185, 129, 0.35)'
                    : '0 8px 24px rgba(212, 175, 55, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '9px',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                {paymentMode === 'online' ? (
                  <>
                    <Smartphone size={20} />
                    <span>Proceed to Owner UPI Payment • ₹{cartTotal}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={20} />
                    <span>
                      {recipientPhone && recipientPhone.length >= 10 
                        ? `Place Order • Send OTP to +91 ${recipientPhone.slice(-10)}` 
                        : `Place Order & Send Handover OTP • ₹${cartTotal}`}
                    </span>
                  </>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.65rem' }}>
                <ShieldCheck size={13} color="var(--text-gold)" />
                <span>100% Fresh Flower Guarantee • Contactless Handover OTP Verified</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Real Owner UPI Instant Payment Modal */}
      {showUpiPaymentModal && (
        <div className="drawer-backdrop open" onClick={() => setShowUpiPaymentModal(false)} style={{ zIndex: 100020 }}>
          <div 
            className="glass-panel animate-scale-up" 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '480px',
              width: 'calc(100% - 24px)',
              margin: 'auto',
              maxHeight: '92dvh',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: '1.75rem 1.5rem',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--bg-surface)',
              border: '1.5px solid var(--border-gold)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
              textAlign: 'center',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="rose-badge" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                ⚡ Direct UPI to Florist Atelier
              </span>
              <button className="drawer-close-btn" onClick={() => setShowUpiPaymentModal(false)} style={{ margin: 0 }}>
                <X size={16} />
              </button>
            </div>

            <h3 className="font-serif-editorial" style={{ fontSize: '1.55rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Pay Directly to Atelier Owner
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Total Amount: <strong style={{ color: 'var(--text-gold)', fontSize: '1.25rem' }}>₹{cartTotal}</strong> (Zero convenience fees)
            </p>

            {/* 1. Owner UPI ID Box with 1-Tap Copy */}
            <div style={{
              background: 'var(--bg-alt)',
              border: '1px solid var(--border-gold)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1rem',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Owner Verified UPI ID</span>
                <span style={{ color: '#10B981', fontWeight: 700 }}>✓ Verified Florist</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {brandConfig?.upiId || 'roshikablooms@upi'}
                </span>
                <button
                  type="button"
                  className="btn btn-gold btn-sm"
                  onClick={() => {
                    const id = brandConfig?.upiId || 'roshikablooms@upi';
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(id);
                      setCopiedUpi(true);
                      showToast(`✓ Copied ${id} to clipboard!`, 'success');
                      setTimeout(() => setCopiedUpi(false), 2500);
                    }
                  }}
                  style={{ fontSize: '0.76rem', padding: '0.35rem 0.65rem', flexShrink: 0 }}
                >
                  {copiedUpi ? '✓ Copied' : 'Copy UPI'}
                </button>
              </div>
            </div>

            {/* 2. Live Scannable Dynamic QR Code */}
            <div style={{
              background: '#ffffff',
              padding: '1rem',
              borderRadius: 'var(--radius-lg)',
              display: 'inline-block',
              border: '2px solid var(--border-gold)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              marginBottom: '1rem'
            }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(
                  `upi://pay?pa=${brandConfig?.upiId || 'roshikablooms@upi'}&pn=Rishika%20Blooms&am=${cartTotal}&cu=INR`
                )}`}
                alt="UPI QR Code"
                style={{ width: '180px', height: '180px', display: 'block' }}
              />
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827', marginTop: '0.5rem' }}>
                Scan with GPay, PhonePe, Paytm (₹{cartTotal})
              </div>
            </div>

            {/* 3. 1-Tap Direct UPI App Mobile Deep Link */}
            <div style={{ marginBottom: '1.25rem' }}>
              <a 
                href={`upi://pay?pa=${encodeURIComponent(brandConfig?.upiId || 'roshikablooms@upi')}&pn=Rishika%20Blooms&am=${cartTotal}&cu=INR`}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <Smartphone size={18} />
                <span>Tap to Open in UPI App (GPay / PhonePe / Paytm)</span>
              </a>
            </div>

            {/* 4. Enter Transaction UTR / Ref Number */}
            <div style={{
              background: 'var(--bg-alt)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1rem',
              textAlign: 'left'
            }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Enter UPI UTR / Transaction ID (Optional):
              </label>
              <input 
                type="text"
                placeholder="e.g. 429182749102 (from payment receipt)"
                value={enteredUtr}
                onChange={(e) => setEnteredUtr(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-gold)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                Helps boutique concierge instantly verify your payment.
              </span>
            </div>

            {/* 5. Master Confirm UPI Order Button */}
            <button 
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setIsSubmittingUpi(true);
                handleConfirmDeliveryOrder('online_upi', {
                  utrNumber: enteredUtr.trim(),
                  upiId: brandConfig?.upiId || 'roshikablooms@upi'
                });
                setIsSubmittingUpi(false);
              }}
              disabled={isSubmittingUpi}
              style={{
                width: '100%',
                padding: '0.9rem 1rem',
                background: 'linear-gradient(135deg, #D4AF37 0%, #B8972E 100%)',
                color: '#000000',
                fontWeight: 800,
                fontSize: '0.95rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 8px 24px rgba(212, 175, 55, 0.35)'
              }}
            >
              {isSubmittingUpi ? 'Confirming Order...' : `✓ I Have Paid ₹${cartTotal} • Place Order & Receive OTP`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
