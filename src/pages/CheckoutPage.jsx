import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  ArrowLeft, CheckCircle2, ShieldCheck, Truck, Clock, 
  Calendar, MapPin, User, Gift, Phone, Mail, CreditCard, 
  Smartphone, QrCode, AlertCircle, Sparkles, Lock, Check, 
  ChevronDown, ChevronUp, Home, Briefcase, RefreshCw, Trash2, 
  Plus, Minus, Tag, Zap, ChevronRight, Award, Shield
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sendOrderVerificationNotification, DEFAULT_VERIFICATION_EMAIL } from '../services/emailService';

// Indian States List for Indian E-Commerce
const INDIAN_STATES = [
  "Delhi NCR", "Maharashtra", "Karnataka", "Tamil Nadu", "Uttar Pradesh",
  "Gujarat", "West Bengal", "Telangana", "Rajasthan", "Madhya Pradesh",
  "Haryana", "Punjab", "Bihar", "Odisha", "Kerala", "Assam", "Goa",
  "Uttarakhand", "Himachal Pradesh", "Jammu & Kashmir", "Andhra Pradesh", "Jharkhand"
];

// Smart Indian Pincode Auto-Detection Dictionary
const lookupPincode = (pin) => {
  if (!pin || pin.length !== 6) return null;
  const p = String(pin);
  if (p.startsWith('11')) return { city: 'New Delhi', state: 'Delhi NCR' };
  if (p.startsWith('12')) return { city: 'Gurugram / Faridabad', state: 'Haryana' };
  if (p.startsWith('20')) return { city: 'Noida / Ghaziabad / Kanpur', state: 'Uttar Pradesh' };
  if (p.startsWith('22') || p.startsWith('24') || p.startsWith('26') || p.startsWith('27') || p.startsWith('28')) return { city: 'Lucknow / Agra / Varanasi', state: 'Uttar Pradesh' };
  if (p.startsWith('40') || p.startsWith('41') || p.startsWith('42') || p.startsWith('43') || p.startsWith('44')) return { city: 'Mumbai / Pune', state: 'Maharashtra' };
  if (p.startsWith('56') || p.startsWith('57') || p.startsWith('58') || p.startsWith('59')) return { city: 'Bengaluru', state: 'Karnataka' };
  if (p.startsWith('60') || p.startsWith('61') || p.startsWith('62') || p.startsWith('63') || p.startsWith('64')) return { city: 'Chennai / Coimbatore', state: 'Tamil Nadu' };
  if (p.startsWith('50') || p.startsWith('51') || p.startsWith('52') || p.startsWith('53')) return { city: 'Hyderabad', state: 'Telangana' };
  if (p.startsWith('70') || p.startsWith('71') || p.startsWith('72') || p.startsWith('73') || p.startsWith('74')) return { city: 'Kolkata', state: 'West Bengal' };
  if (p.startsWith('30') || p.startsWith('31') || p.startsWith('32') || p.startsWith('33') || p.startsWith('34')) return { city: 'Jaipur', state: 'Rajasthan' };
  if (p.startsWith('36') || p.startsWith('37') || p.startsWith('38') || p.startsWith('39')) return { city: 'Ahmedabad / Surat', state: 'Gujarat' };
  if (p.startsWith('45') || p.startsWith('46') || p.startsWith('47') || p.startsWith('48')) return { city: 'Indore / Bhopal', state: 'Madhya Pradesh' };
  if (p.startsWith('14') || p.startsWith('15') || p.startsWith('16')) return { city: 'Chandigarh / Ludhiana', state: 'Punjab' };
  if (p.startsWith('80') || p.startsWith('81') || p.startsWith('82') || p.startsWith('84') || p.startsWith('85')) return { city: 'Patna', state: 'Bihar' };
  return { city: 'City Center', state: 'Delhi NCR' };
};

export default function CheckoutPage() {
  const { 
    cart, 
    cartSubtotal, 
    deliveryFee, 
    discountAmount, 
    cartTotal, 
    appliedCoupon, 
    clearCart, 
    createOrder, 
    openOrderConfirmationModal, 
    navigateTo, 
    showToast, 
    brandConfig, 
    checkDeliveryPincode,
    updateQuantity,
    removeFromCart
  } = useShop();

  // Active Checkout Step: 1 = Address, 2 = Order Summary, 3 = Payment
  const [activeStep, setActiveStep] = useState(1);

  // Address Details (Persisted in localStorage like Flipkart)
  const [customerName, setCustomerName] = useState(() => localStorage.getItem('rb_last_cust_name') || '');
  const [customerPhone, setCustomerPhone] = useState(() => localStorage.getItem('rb_last_cust_phone') || '');
  const [pincode, setPincode] = useState(() => localStorage.getItem('rb_last_pincode') || '110001');
  const [houseNo, setHouseNo] = useState(() => localStorage.getItem('rb_last_house') || '');
  const [streetAddress, setStreetAddress] = useState(() => localStorage.getItem('rb_last_street') || '');
  const [landmark, setLandmark] = useState(() => localStorage.getItem('rb_last_landmark') || '');
  const [city, setCity] = useState(() => localStorage.getItem('rb_last_city') || 'New Delhi');
  const [state, setState] = useState(() => localStorage.getItem('rb_last_state') || 'Delhi NCR');
  const [addressType, setAddressType] = useState('Home'); // 'Home' | 'Work'
  const [pinServiceable, setPinServiceable] = useState(true);

  // Scheduled Delivery Slot
  const todayStr = new Date().toISOString().split('T')[0];
  const [deliveryDate, setDeliveryDate] = useState(todayStr);
  const [deliverySlot, setDeliverySlot] = useState('Standard Delivery (1 PM - 5 PM)');

  // Complimentary Gift Card
  const [giftMessage, setGiftMessage] = useState('');
  const [senderSign, setSenderSign] = useState('');

  // Payment Selection (Flipkart style)
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'upi' | 'card'
  const [utrNumber, setUtrNumber] = useState('');
  
  // Flipkart style COD 3-Digit Captcha
  const [captchaCode, setCaptchaCode] = useState(() => String(Math.floor(100 + Math.random() * 900)));
  const [enteredCaptcha, setEnteredCaptcha] = useState('');

  // Mobile Bottom Price Details Sheet Toggle
  const [showMobilePriceSheet, setShowMobilePriceSheet] = useState(false);

  // Submitting flag
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill city/state when pincode changes
  const handlePincodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(val);
    if (val.length === 6) {
      const match = lookupPincode(val);
      if (match) {
        setCity(match.city);
        setState(match.state);
      }
      setPinServiceable(true);
    }
  };

  const regenerateCaptcha = () => {
    setCaptchaCode(String(Math.floor(100 + Math.random() * 900)));
    setEnteredCaptcha('');
  };

  // Pricing calculations
  const totalMrp = useMemo(() => {
    return (cart || []).reduce((acc, item) => {
      const orig = item.originalPrice || (item.price + 400);
      return acc + (orig * item.quantity);
    }, 0);
  }, [cart]);

  const totalDiscount = Math.max(0, totalMrp - cartTotal);

  // If cart is empty
  if (!cart || cart.length === 0) {
    return (
      <div className="checkout-empty animate-fade-in" style={{ padding: '6rem 1rem', textAlign: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div className="container" style={{ maxWidth: '460px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <Truck size={38} color="var(--text-gold)" />
          </div>
          <h2 className="font-serif-editorial" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.65rem', color: 'var(--text-primary)' }}>
            Your Bag is Empty
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Add freshly arranged luxury flower bouquets or gift hampers to begin your express delivery order.
          </p>
          <button 
            type="button" 
            className="btn btn-gold btn-md" 
            onClick={() => navigateTo('shop')}
            style={{ padding: '0.75rem 2rem', fontWeight: 700 }}
          >
            Explore Bouquet Catalog
          </button>
        </div>
      </div>
    );
  }

  // Validate Step 1 (Address)
  const handleProceedFromAddress = (e) => {
    if (e) e.preventDefault();
    const cleanPhone = String(customerPhone).replace(/\D/g, '').slice(-10);
    if (!customerName.trim()) {
      showToast('⚠️ Please enter your full name', 'warning');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      showToast('📱 Please enter a valid 10-digit mobile number for delivery updates!', 'error');
      return;
    }
    if (!houseNo.trim() || !streetAddress.trim()) {
      showToast('🏠 Please enter your complete house no. and street/colony', 'warning');
      return;
    }
    if (!pincode || pincode.length !== 6) {
      showToast('📍 Please enter a valid 6-digit Indian PIN code', 'warning');
      return;
    }

    // Save to local storage for instant reuse
    try {
      localStorage.setItem('rb_last_cust_name', customerName.trim());
      localStorage.setItem('rb_last_cust_phone', cleanPhone);
      localStorage.setItem('rb_last_pincode', pincode);
      localStorage.setItem('rb_last_house', houseNo.trim());
      localStorage.setItem('rb_last_street', streetAddress.trim());
      localStorage.setItem('rb_last_landmark', landmark.trim());
      localStorage.setItem('rb_last_city', city);
      localStorage.setItem('rb_last_state', state);
    } catch (err) {
      console.warn('Storage save note:', err);
    }

    setActiveStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Final Order (Flipkart / Meesho Style)
  const handlePlaceOrder = async () => {
    if (isSubmitting) return;

    if (paymentMethod === 'cod') {
      if (enteredCaptcha.trim() !== captchaCode) {
        showToast(`❌ Captcha mismatch. Please enter the 3-digit code [${captchaCode}] to confirm.`, 'error');
        return;
      }
    }

    if (paymentMethod === 'upi' && !utrNumber.trim()) {
      showToast('⚠️ Please enter your 12-digit UPI Transaction / UTR Ref number after scanning.', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderNumber = Math.floor(100000 + Math.random() * 900000);
      const orderId = `RB-2026-${orderNumber}`;
      const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));
      const cleanPhone = String(customerPhone).replace(/\D/g, '').slice(-10);
      const fullDeliveryAddress = `${houseNo.trim()}, ${streetAddress.trim()}${landmark ? ', Near ' + landmark.trim() : ''}, ${city}, ${state} - ${pincode} (${addressType})`;

      let paymentLabel = 'Cash on Delivery (OTP Handover)';
      let paymentStatus = 'Pending';
      if (paymentMethod === 'upi') {
        paymentLabel = `Direct UPI QR Payment (UTR: ${utrNumber.trim() || 'Pending'})`;
        paymentStatus = 'Paid';
      } else if (paymentMethod === 'card') {
        paymentLabel = 'Credit/Debit Card (Verified)';
        paymentStatus = 'Paid';
      }

      const orderData = {
        orderId,
        deliveryOtp,
        createdAt: new Date().toISOString(),
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerEmail: 'concierge@rishikablooms.com',
        recipientName: customerName.trim(),
        recipientPhone: cleanPhone,
        deliveryAddress: fullDeliveryAddress,
        houseNo: houseNo.trim(),
        streetAddress: streetAddress.trim(),
        landmark: landmark.trim(),
        city,
        state,
        pincode,
        addressType,
        deliveryDate: deliveryDate || todayStr,
        deliverySlot,
        giftMessage: giftMessage.trim() ? `${giftMessage.trim()}${senderSign ? ' — ' + senderSign.trim() : ''}` : '',
        items: cart,
        subtotal: cartSubtotal,
        deliveryFee,
        discountAmount,
        couponCode: appliedCoupon?.code || '',
        total: cartTotal,
        paymentMethod: paymentLabel,
        paymentStatus,
        status: 'Order Placed',
        statusHistory: [
          {
            status: 'Order Placed',
            timestamp: new Date().toISOString(),
            note: 'Order placed via Flipkart-style secure checkout flow.',
            updatedBy: 'Customer Online'
          }
        ],
        courier: {
          provider: 'Risika Blooms Express Logistics',
          trackingNumber: `TRK-${orderNumber}`,
          trackingUrl: `#/order-tracking?orderId=${orderId}`
        }
      };

      const created = await createOrder(orderData);

      // Trigger Confetti Blast
      confetti({
        particleCount: 110,
        spread: 90,
        origin: { y: 0.55 }
      });

      // Clear Shopping Cart
      clearCart();

      // Open Modal and redirect to Confirmation
      if (openOrderConfirmationModal) {
        openOrderConfirmationModal(created);
      }
      navigateTo('order-confirmation', { orderId });
      showToast(`🎉 Order #${orderId} placed successfully!`, 'success');
    } catch (err) {
      console.error('Order creation error:', err);
      showToast('Failed to place order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flipkart-checkout-wrapper animate-fade-in" style={{ backgroundColor: '#F1F3F6', minHeight: '100vh', padding: '1rem 0 7rem 0' }}>
      <div className="container" style={{ maxWidth: '1180px' }}>
        
        {/* Flipkart / Meesho Top Stepper Bar */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '10px',
          padding: '0.9rem 1.25rem',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <button 
            type="button" 
            onClick={() => navigateTo('cart')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              background: 'transparent',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#2874F0',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Cart</span>
          </button>

          {/* Stepper Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem', fontWeight: 700 }}>
            <span style={{ color: activeStep >= 1 ? '#2874F0' : '#878787', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: activeStep >= 1 ? '#2874F0' : '#E0E0E0', color: '#FFF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                {activeStep > 1 ? '✓' : '1'}
              </span>
              <span>ADDRESS</span>
            </span>

            <span style={{ color: '#D0D0D0' }}>➔</span>

            <span style={{ color: activeStep >= 2 ? '#2874F0' : '#878787', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: activeStep >= 2 ? '#2874F0' : '#E0E0E0', color: '#FFF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                {activeStep > 2 ? '✓' : '2'}
              </span>
              <span>ORDER SUMMARY</span>
            </span>

            <span style={{ color: '#D0D0D0' }}>➔</span>

            <span style={{ color: activeStep === 3 ? '#2874F0' : '#878787', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: activeStep === 3 ? '#2874F0' : '#E0E0E0', color: '#FFF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                3
              </span>
              <span>PAYMENT</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#388E3C', fontWeight: 700 }}>
            <ShieldCheck size={16} />
            <span>100% Safe Payments</span>
          </div>
        </div>

        {/* Main Content Layout: 2 Columns on Desktop, Single Column on Mobile */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
          
          {/* Left Column: Flipkart Accordion Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            
            {/* STEP 1: DELIVERY ADDRESS CARD */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '8px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              border: activeStep === 1 ? '1.5px solid #2874F0' : '1px solid #E0E0E0'
            }}>
              {/* Card Header */}
              <div style={{
                padding: '0.85rem 1.25rem',
                background: activeStep === 1 ? '#2874F0' : '#FAFAFA',
                color: activeStep === 1 ? '#FFFFFF' : '#212121',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.92rem', textTransform: 'uppercase' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '4px', background: activeStep === 1 ? '#FFFFFF' : '#2874F0', color: activeStep === 1 ? '#2874F0' : '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900 }}>
                    1
                  </span>
                  <span>DELIVERY ADDRESS</span>
                  {activeStep > 1 && <span style={{ color: '#388E3C', fontSize: '1rem', marginLeft: '4px' }}>✓</span>}
                </div>

                {activeStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    style={{
                      background: '#FFFFFF',
                      color: '#2874F0',
                      border: '1px solid #2874F0',
                      borderRadius: '4px',
                      padding: '4px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    CHANGE
                  </button>
                )}
              </div>

              {/* Card Body */}
              {activeStep === 1 ? (
                <form onSubmit={handleProceedFromAddress} style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    
                    {/* Full Name */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#878787', marginBottom: '4px' }}>
                        FULL NAME *
                      </label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Rohini Malhotra"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '4px', border: '1px solid #C2C2C2', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>

                    {/* 10-Digit Mobile */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#878787', marginBottom: '4px' }}>
                        10-DIGIT MOBILE NUMBER (FOR OTP) *
                      </label>
                      <div style={{ display: 'flex', border: '1px solid #C2C2C2', borderRadius: '4px', overflow: 'hidden' }}>
                        <span style={{ background: '#F0F0F0', padding: '0.65rem 0.6rem', fontSize: '0.85rem', color: '#555', borderRight: '1px solid #C2C2C2' }}>+91</span>
                        <input 
                          type="tel" 
                          required 
                          maxLength={10}
                          placeholder="9876543210"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                          style={{ width: '100%', padding: '0.65rem 0.75rem', border: 'none', fontSize: '0.9rem', outline: 'none' }}
                        />
                      </div>
                    </div>

                    {/* 6-Digit PIN code */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#878787', marginBottom: '4px' }}>
                        PINCODE * (AUTO CITY LOOKUP)
                      </label>
                      <input 
                        type="text" 
                        required 
                        maxLength={6}
                        placeholder="e.g. 110001"
                        value={pincode}
                        onChange={handlePincodeChange}
                        style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '4px', border: '1px solid #C2C2C2', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                      {pinServiceable && (
                        <div style={{ fontSize: '0.72rem', color: '#388E3C', fontWeight: 600, marginTop: '3px' }}>
                          ✓ Serviceable for Express Bouquet Delivery
                        </div>
                      )}
                    </div>

                    {/* Landmark */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#878787', marginBottom: '4px' }}>
                        LANDMARK (OPTIONAL)
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. Near City Mall"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '4px', border: '1px solid #C2C2C2', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>

                    {/* House No / Flat / Tower */}
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#878787', marginBottom: '4px' }}>
                        FLAT, HOUSE NO., BUILDING, APARTMENT *
                      </label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Flat 402, Tower B, Lotus Residency"
                        value={houseNo}
                        onChange={(e) => setHouseNo(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '4px', border: '1px solid #C2C2C2', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>

                    {/* Street Address / Area */}
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#878787', marginBottom: '4px' }}>
                        AREA, STREET, SECTOR, VILLAGE *
                      </label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Sector 128, Green Valley Avenue"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '4px', border: '1px solid #C2C2C2', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#878787', marginBottom: '4px' }}>
                        CITY / DISTRICT *
                      </label>
                      <input 
                        type="text" 
                        required 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '4px', border: '1px solid #C2C2C2', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#878787', marginBottom: '4px' }}>
                        STATE *
                      </label>
                      <select 
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '4px', border: '1px solid #C2C2C2', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', background: '#FFF' }}
                      >
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Address Type Selector */}
                    <div style={{ gridColumn: 'span 2', marginTop: '0.35rem' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#878787', marginBottom: '6px' }}>
                        ADDRESS TYPE
                      </label>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input 
                            type="radio" 
                            name="addressType" 
                            checked={addressType === 'Home'} 
                            onChange={() => setAddressType('Home')} 
                          />
                          <span>🏠 Home (All day delivery)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input 
                            type="radio" 
                            name="addressType" 
                            checked={addressType === 'Work'} 
                            onChange={() => setAddressType('Work')} 
                          />
                          <span>🏢 Work (Delivery between 10 AM - 5 PM)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Flipkart Orange Deliver Here Button */}
                  <div style={{ marginTop: '1.25rem' }}>
                    <button
                      type="submit"
                      style={{
                        background: '#FB641B',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.85rem 2rem',
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(251, 100, 27, 0.4)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      DELIVER HERE
                    </button>
                  </div>
                </form>
              ) : (
                /* Collapsed Address View */
                <div style={{ padding: '0.85rem 1.25rem', fontSize: '0.88rem', color: '#212121' }}>
                  <div style={{ fontWeight: 800, marginBottom: '2px' }}>
                    {customerName} <span style={{ background: '#F0F0F0', padding: '1px 6px', borderRadius: '3px', fontSize: '0.7rem', color: '#666' }}>{addressType}</span> <span style={{ fontWeight: 600, marginLeft: '6px' }}>+91 {customerPhone}</span>
                  </div>
                  <div style={{ color: '#555', fontSize: '0.82rem' }}>
                    {houseNo}, {streetAddress}{landmark ? ', Near ' + landmark : ''}, {city}, {state} - <strong>{pincode}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: ORDER SUMMARY & SCHEDULE */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '8px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              border: activeStep === 2 ? '1.5px solid #2874F0' : '1px solid #E0E0E0'
            }}>
              {/* Header */}
              <div style={{
                padding: '0.85rem 1.25rem',
                background: activeStep === 2 ? '#2874F0' : '#FAFAFA',
                color: activeStep === 2 ? '#FFFFFF' : '#212121',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.92rem', textTransform: 'uppercase' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '4px', background: activeStep === 2 ? '#FFFFFF' : '#2874F0', color: activeStep === 2 ? '#2874F0' : '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900 }}>
                    2
                  </span>
                  <span>ORDER SUMMARY ({cart.reduce((a, c) => a + c.quantity, 0)} Items)</span>
                  {activeStep > 2 && <span style={{ color: '#388E3C', fontSize: '1rem', marginLeft: '4px' }}>✓</span>}
                </div>

                {activeStep > 2 && (
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    style={{
                      background: '#FFFFFF',
                      color: '#2874F0',
                      border: '1px solid #2874F0',
                      borderRadius: '4px',
                      padding: '4px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    CHANGE
                  </button>
                )}
              </div>

              {/* Body */}
              {activeStep === 2 && (
                <div style={{ padding: '1rem 1.25rem' }}>
                  {/* Items List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                    {cart.map((item) => (
                      <div key={item.cartItemId} style={{ display: 'flex', gap: '12px', paddingBottom: '1rem', borderBottom: '1px solid #EAEAEA', alignItems: 'flex-start' }}>
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          style={{ width: '74px', height: '74px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0, border: '1px solid #E0E0E0' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.92rem', fontWeight: 700, color: '#212121' }}>
                            {item.name}
                          </h4>
                          <div style={{ fontSize: '0.76rem', color: '#878787', marginBottom: '6px' }}>
                            {item.categoryName || 'Floral Boutique'} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                          </div>
                          
                          {/* Price Row with Savings */}
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#212121' }}>
                              ₹{item.price}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#878787', textDecoration: 'line-through' }}>
                              ₹{item.originalPrice || (item.price + 400)}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: '#388E3C', fontWeight: 700 }}>
                              24% Off
                            </span>
                          </div>

                          {/* Quantity Stepper & Remove */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #D0D0D0', borderRadius: '4px' }}>
                              <button 
                                type="button" 
                                onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                style={{ padding: '3px 8px', border: 'none', background: '#F5F5F5', cursor: 'pointer' }}
                              >
                                -
                              </button>
                              <span style={{ padding: '0 10px', fontSize: '0.85rem', fontWeight: 700 }}>{item.quantity}</span>
                              <button 
                                type="button" 
                                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                style={{ padding: '3px 8px', border: 'none', background: '#F5F5F5', cursor: 'pointer' }}
                              >
                                +
                              </button>
                            </div>

                            <button 
                              type="button" 
                              onClick={() => removeFromCart(item.cartItemId)}
                              style={{ border: 'none', background: 'transparent', color: '#878787', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              REMOVE
                            </button>
                          </div>
                        </div>

                        {/* Delivery badge */}
                        <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#388E3C', fontWeight: 600 }}>
                          Delivery by Tomorrow • FREE
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Scheduled Slot Selection */}
                  <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '6px', border: '1px solid #E5E7EB', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#212121', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={16} color="#2874F0" />
                      <span>Choose Delivery Date & Time Slot</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#666', marginBottom: '3px' }}>DELIVERY DATE</label>
                        <input 
                          type="date" 
                          min={todayStr}
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid #D1D5DB', fontSize: '0.85rem', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#666', marginBottom: '3px' }}>DELIVERY TIME SLOT</label>
                        <select
                          value={deliverySlot}
                          onChange={(e) => setDeliverySlot(e.target.value)}
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid #D1D5DB', fontSize: '0.85rem', boxSizing: 'border-box', background: '#FFF' }}
                        >
                          <option value="Morning Dew (8 AM - 11 AM)">🌅 Morning Dew (8:00 AM – 11:00 AM)</option>
                          <option value="Standard Delivery (1 PM - 5 PM)">☀️ Standard Afternoon (1:00 PM – 5:00 PM)</option>
                          <option value="Evening Sunset (6 PM - 9 PM)">🌇 Evening Sunset (6:00 PM – 9:00 PM)</option>
                          <option value="Midnight Surprise (11:15 PM - 12:00 AM)">🌙 Midnight Special (11:15 PM – 12:00 AM)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Free Complimentary Greeting Card */}
                  <div style={{ background: '#FFFBEB', padding: '1rem', borderRadius: '6px', border: '1px dashed #D97706', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#92400E', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Gift size={16} />
                      <span>Complimentary Luxury Gold-Embossed Card (Free)</span>
                    </div>
                    <textarea 
                      rows={2}
                      placeholder="Write your heartfelt message (e.g. Happy Birthday to the sweetest soul!). We will print this on keepsake card for free."
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #FCD34D', fontSize: '0.82rem', boxSizing: 'border-box', resize: 'vertical' }}
                    />
                  </div>

                  {/* Continue to Payment Button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveStep(3);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{
                        background: '#FB641B',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.85rem 2.2rem',
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(251, 100, 27, 0.4)',
                        textTransform: 'uppercase'
                      }}
                    >
                      CONTINUE TO PAYMENT
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 3: PAYMENT OPTIONS (Flipkart Accordion Style) */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '8px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              border: activeStep === 3 ? '1.5px solid #2874F0' : '1px solid #E0E0E0'
            }}>
              {/* Header */}
              <div style={{
                padding: '0.85rem 1.25rem',
                background: activeStep === 3 ? '#2874F0' : '#FAFAFA',
                color: activeStep === 3 ? '#FFFFFF' : '#212121',
                fontWeight: 800,
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textTransform: 'uppercase'
              }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '4px', background: activeStep === 3 ? '#FFFFFF' : '#2874F0', color: activeStep === 3 ? '#2874F0' : '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900 }}>
                  3
                </span>
                <span>PAYMENT OPTIONS</span>
              </div>

              {/* Body */}
              {activeStep === 3 && (
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    
                    {/* OPTION 1: CASH ON DELIVERY (With Flipkart Captcha) */}
                    <div style={{
                      border: paymentMethod === 'cod' ? '1.5px solid #2874F0' : '1px solid #E5E7EB',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      background: paymentMethod === 'cod' ? '#F4F8FD' : '#FFFFFF'
                    }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="payment" 
                          checked={paymentMethod === 'cod'} 
                          onChange={() => setPaymentMethod('cod')} 
                        />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#212121' }}>
                            Cash on Delivery (Pay upon arrival)
                          </span>
                          <span style={{ marginLeft: '8px', background: '#E8F5E9', color: '#2E7D32', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '3px' }}>
                            MOST POPULAR
                          </span>
                          <div style={{ fontSize: '0.78rem', color: '#666', marginTop: '2px' }}>
                            Pay via Cash or UPI to delivery rider after inspecting your fresh bouquet. Secret OTP protects your flowers.
                          </div>
                        </div>
                      </label>

                      {/* Flipkart Captcha Box for COD */}
                      {paymentMethod === 'cod' && (
                        <div style={{ padding: '0 1rem 1rem 2.5rem' }}>
                          <div style={{ background: '#FFFFFF', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid #D0D0D0', maxWidth: '340px' }}>
                            <div style={{ fontSize: '0.78rem', color: '#555', marginBottom: '6px' }}>
                              Enter the 3-digit verification code:
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                              <span style={{
                                background: '#FFF7ED',
                                border: '1.5px solid #FB923C',
                                color: '#C2410C',
                                fontWeight: 900,
                                fontSize: '1.3rem',
                                letterSpacing: '6px',
                                padding: '4px 14px',
                                borderRadius: '4px',
                                fontFamily: 'monospace'
                              }}>
                                {captchaCode}
                              </span>
                              <button 
                                type="button" 
                                onClick={regenerateCaptcha}
                                title="Change Code"
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#2874F0' }}
                              >
                                <RefreshCw size={15} />
                              </button>
                            </div>
                            <input 
                              type="text" 
                              maxLength={3}
                              placeholder="Enter 3-digit code"
                              value={enteredCaptcha}
                              onChange={(e) => setEnteredCaptcha(e.target.value.replace(/\D/g, ''))}
                              style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid #999', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                            />
                          </div>

                          <div style={{ marginTop: '1rem' }}>
                            <button
                              type="button"
                              onClick={handlePlaceOrder}
                              disabled={isSubmitting}
                              style={{
                                background: '#FB641B',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.9rem 2.5rem',
                                fontSize: '1rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                boxShadow: '0 3px 8px rgba(251, 100, 27, 0.4)',
                                textTransform: 'uppercase'
                              }}
                            >
                              {isSubmitting ? 'CONFIRMING ORDER...' : 'CONFIRM ORDER'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* OPTION 2: UPI (Google Pay, PhonePe, Paytm, QR) */}
                    <div style={{
                      border: paymentMethod === 'upi' ? '1.5px solid #2874F0' : '1px solid #E5E7EB',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      background: paymentMethod === 'upi' ? '#F4F8FD' : '#FFFFFF'
                    }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="payment" 
                          checked={paymentMethod === 'upi'} 
                          onChange={() => setPaymentMethod('upi')} 
                        />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#212121' }}>
                            UPI (Google Pay, PhonePe, Paytm, QR Code)
                          </span>
                          <span style={{ marginLeft: '8px', background: '#E3F2FD', color: '#1565C0', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '3px' }}>
                            INSTANT
                          </span>
                          <div style={{ fontSize: '0.78rem', color: '#666', marginTop: '2px' }}>
                            Pay with any UPI app on your phone with zero transaction fees.
                          </div>
                        </div>
                      </label>

                      {paymentMethod === 'upi' && (
                        <div style={{ padding: '0 1rem 1rem 2.5rem' }}>
                          <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '6px', border: '1px solid #D0D0D0', maxWidth: '360px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-block', padding: '8px', background: '#FFF', borderRadius: '8px', border: '1px solid #E0E0E0', marginBottom: '8px' }}>
                              <img 
                                src={brandConfig?.upiQrImage || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${brandConfig?.upiId || '9305371705@paytm'}&pn=RisikaBlooms&am=${cartTotal}&cu=INR`)}`} 
                                alt="UPI Payment Scanner" 
                                style={{ width: '150px', height: '150px', objectFit: 'contain', display: 'block', margin: '0 auto', borderRadius: '6px' }}
                              />
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#212121' }}>
                              UPI ID: <span style={{ color: '#2874F0' }}>{brandConfig?.upiId || 'roshikablooms@upi'}</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#666', marginBottom: '0.75rem' }}>
                              Payable: <strong style={{ color: '#FB641B', fontSize: '1.05rem' }}>₹{cartTotal}</strong>
                            </div>

                            <input 
                              type="text" 
                              placeholder="Enter 12-digit UPI UTR / Ref No. *"
                              value={utrNumber}
                              onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                              style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid #999', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', marginBottom: '8px' }}
                            />
                            
                            <button
                              type="button"
                              onClick={handlePlaceOrder}
                              disabled={isSubmitting}
                              style={{
                                width: '100%',
                                background: '#FB641B',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.75rem',
                                fontSize: '0.95rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                textTransform: 'uppercase'
                              }}
                            >
                              {isSubmitting ? 'VERIFYING...' : `I HAVE PAID ₹${cartTotal} • PLACE ORDER`}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* OPTION 3: CREDIT / DEBIT CARDS */}
                    <div style={{
                      border: paymentMethod === 'card' ? '1.5px solid #2874F0' : '1px solid #E5E7EB',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      background: paymentMethod === 'card' ? '#F4F8FD' : '#FFFFFF'
                    }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="payment" 
                          checked={paymentMethod === 'card'} 
                          onChange={() => setPaymentMethod('card')} 
                        />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#212121' }}>
                            Credit / Debit / ATM Card
                          </span>
                          <div style={{ fontSize: '0.78rem', color: '#666', marginTop: '2px' }}>
                            Visa, MasterCard, RuPay, Maestro cards supported.
                          </div>
                        </div>
                      </label>

                      {paymentMethod === 'card' && (
                        <div style={{ padding: '0 1rem 1rem 2.5rem' }}>
                          <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '6px', border: '1px solid #D0D0D0', maxWidth: '360px' }}>
                            <input 
                              type="text" 
                              maxLength={19}
                              placeholder="Card Number (XXXX XXXX XXXX XXXX)"
                              style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid #999', fontSize: '0.85rem', marginBottom: '8px', boxSizing: 'border-box' }}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                              <input 
                                type="text" 
                                placeholder="MM / YY"
                                style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid #999', fontSize: '0.85rem', boxSizing: 'border-box' }}
                              />
                              <input 
                                type="password" 
                                maxLength={4}
                                placeholder="CVV"
                                style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid #999', fontSize: '0.85rem', boxSizing: 'border-box' }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handlePlaceOrder}
                              disabled={isSubmitting}
                              style={{
                                width: '100%',
                                background: '#FB641B',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.75rem',
                                fontSize: '0.95rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                textTransform: 'uppercase'
                              }}
                            >
                              {isSubmitting ? 'PROCESSING...' : `PAY ₹${cartTotal} SECURELY`}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Flipkart / Meesho "PRICE DETAILS" Sidebar */}
          <div style={{ position: 'sticky', top: '20px' }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '8px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '0.85rem 1.25rem',
                borderBottom: '1px solid #F0F0F0',
                fontWeight: 800,
                fontSize: '0.88rem',
                color: '#878787',
                textTransform: 'uppercase'
              }}>
                PRICE DETAILS (मूल्य विवरण)
              </div>

              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Price ({cart.reduce((a, c) => a + c.quantity, 0)} Items)</span>
                  <span>₹{totalMrp}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#388E3C' }}>
                  <span>Discount</span>
                  <span>- ₹{totalDiscount}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Delivery Charges</span>
                  <span>
                    <span style={{ textDecoration: 'line-through', color: '#878787', marginRight: '6px' }}>₹99</span>
                    <strong style={{ color: '#388E3C' }}>FREE</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#666' }}>
                  <span>Greeting Card & Wrapping</span>
                  <strong style={{ color: '#388E3C' }}>FREE</strong>
                </div>

                <div style={{
                  borderTop: '1px dashed #E0E0E0',
                  paddingTop: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  fontWeight: 800,
                  fontSize: '1.15rem'
                }}>
                  <span>Total Amount</span>
                  <span style={{ color: '#212121' }}>₹{cartTotal}</span>
                </div>

                {/* Flipkart Green Savings Banner */}
                <div style={{
                  background: '#E8F5E9',
                  border: '1px solid #A5D6A7',
                  borderRadius: '4px',
                  padding: '0.65rem 0.85rem',
                  color: '#2E7D32',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '0.25rem'
                }}>
                  <span>🎉 You will save ₹{totalDiscount} on this order</span>
                </div>
              </div>

              <div style={{ padding: '0.85rem 1.25rem', background: '#FAFAFA', borderTop: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#878787' }}>
                <Shield size={16} color="#878787" />
                <span>Safe and Secure Payments. 100% Authentic Fresh Blooms Guaranteed.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bottom Bar (Flipkart / Meesho Hallmark) */}
        <div className="mobile-only-checkout-bar" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#FFFFFF',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.15)',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1000
        }}>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#212121' }}>
              ₹{cartTotal}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#388E3C', fontWeight: 700 }}>
              Free Delivery
            </div>
          </div>

          <div>
            {activeStep === 1 && (
              <button
                type="button"
                onClick={handleProceedFromAddress}
                style={{
                  background: '#FB641B',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.75rem 1.75rem',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                DELIVER HERE ➔
              </button>
            )}

            {activeStep === 2 && (
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                style={{
                  background: '#FB641B',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.75rem 1.75rem',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                CONTINUE ➔
              </button>
            )}

            {activeStep === 3 && (
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                style={{
                  background: '#FB641B',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.75rem 1.75rem',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                {isSubmitting ? 'PLACING...' : 'PLACE ORDER ➔'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
