import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { BRAND_CONFIG } from '../config/brand';
import { 
  ArrowLeft, CheckCircle2, ShieldCheck, Truck, Clock, 
  Calendar, MapPin, User, Gift, Phone, Mail, CreditCard, 
  Smartphone, QrCode, AlertCircle, Sparkles, Lock, Check 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sendOrderVerificationNotification, DEFAULT_VERIFICATION_EMAIL } from '../services/emailService';

const INDIAN_STATES = [
  "Delhi NCR", "Maharashtra", "Karnataka", "Tamil Nadu", "Uttar Pradesh",
  "Gujarat", "West Bengal", "Telangana", "Rajasthan", "Madhya Pradesh",
  "Haryana", "Punjab", "Bihar", "Odisha", "Kerala", "Assam", "Goa"
];

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
    checkDeliveryPincode 
  } = useShop();

  // Step 1: Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Step 2: Delivery address
  const [recipientName, setRecipientName] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('New Delhi');
  const [state, setState] = useState('Delhi NCR');
  const [pincode, setPincode] = useState('');
  const [pinStatus, setPinStatus] = useState(null);

  // Step 3: Delivery schedule
  const todayStr = new Date().toISOString().split('T')[0];
  const [deliveryDate, setDeliveryDate] = useState(todayStr);
  const [deliverySlot, setDeliverySlot] = useState('Standard Delivery (1 PM - 5 PM)');

  // Step 4: Gift message
  const [giftMessage, setGiftMessage] = useState('');
  const [senderSign, setSenderSign] = useState('');

  // Step 5: Payment method
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'upi_qr' | 'razorpay'
  const [utrNumber, setUtrNumber] = useState('');

  // Submitting state (prevents duplicate orders)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Empty cart guard
  if (!cart || cart.length === 0) {
    return (
      <div className="checkout-empty animate-fade-in" style={{ padding: '5rem 1rem', textAlign: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div className="container" style={{ maxWidth: '480px' }}>
          <h2 className="font-serif-editorial" style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            No Items in Checkout
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
            Your bag is empty. Please add flowers or gifts before proceeding to checkout.
          </p>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={() => navigateTo('shop')}
          >
            Explore Bouquet Collections
          </button>
        </div>
      </div>
    );
  }

  // Handle PIN validation
  const handlePincodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(val);
    if (val.length === 6) {
      if (checkDeliveryPincode) {
        const res = checkDeliveryPincode(val);
        setPinStatus(res);
      } else {
        setPinStatus({ valid: true, message: 'Eligible for express delivery!' });
      }
    } else {
      setPinStatus(null);
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Validation
    const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      showToast('📱 Please enter a valid 10-digit mobile number for delivery tracking!', 'error');
      return;
    }

    if (!customerName.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }

    if (!houseNo.trim() || !streetAddress.trim()) {
      showToast('Please provide your complete house/flat and street address', 'error');
      return;
    }

    if (!pincode || pincode.length !== 6) {
      showToast('Please enter a valid 6-digit Indian PIN code', 'error');
      return;
    }

    if (paymentMethod === 'upi_qr' && !utrNumber.trim()) {
      showToast('Please enter your 12-digit UPI Transaction / UTR Ref number after scanning the QR code', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderNumber = Math.floor(100000 + Math.random() * 900000);
      const orderId = `RB-2026-${orderNumber}`;
      const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));
      const fullDeliveryAddress = `${houseNo.trim()}, ${streetAddress.trim()}${landmark ? ', Near ' + landmark.trim() : ''}, ${city}, ${state} - ${pincode}`;

      let paymentLabel = 'Cash on Delivery (OTP Handover)';
      let paymentStatus = 'Pending';
      if (paymentMethod === 'upi_qr') {
        paymentLabel = `Direct UPI QR Payment (UTR: ${utrNumber.trim()})`;
        paymentStatus = 'Paid';
      } else if (paymentMethod === 'razorpay') {
        paymentLabel = 'Razorpay Online Gateway (Test Verified)';
        paymentStatus = 'Paid';
      }

      const orderData = {
        orderId,
        deliveryOtp,
        createdAt: new Date().toISOString(),
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerEmail: customerEmail.trim() || 'customer@rishikablooms.com',
        recipientName: (recipientName.trim() || customerName.trim()),
        recipientPhone: cleanPhone,
        deliveryAddress: fullDeliveryAddress,
        houseNo: houseNo.trim(),
        streetAddress: streetAddress.trim(),
        landmark: landmark.trim(),
        city,
        state,
        pincode,
        deliveryDate: deliveryDate || todayStr,
        deliverySlot,
        giftMessage: giftMessage.trim() ? `${giftMessage.trim()}${senderSign ? ' — With love, ' + senderSign.trim() : ''}` : '',
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
            note: 'Order successfully created by customer and logged to database.',
            updatedBy: 'Customer (Online Checkout)'
          }
        ],
        courier: {
          provider: 'Risika Blooms Express Logistics',
          trackingNumber: `TRK-${orderNumber}`,
          trackingUrl: `#/order-tracking?orderId=${orderId}`
        }
      };

      // Save order to persistent store & cloud
      const created = await createOrder(orderData);

      // Email dispatch if service configured
      try {
        sendOrderVerificationNotification({
          orderId,
          customerName: orderData.customerName,
          recipientName: orderData.recipientName,
          recipientPhone: cleanPhone,
          deliveryAddress: fullDeliveryAddress,
          pincode,
          deliveryDate: orderData.deliveryDate,
          deliverySlot,
          giftMessage: orderData.giftMessage,
          cartItems: cart,
          total: cartTotal,
          paymentMethod: paymentLabel,
          targetEmail: brandConfig?.email || DEFAULT_VERIFICATION_EMAIL
        });
      } catch (err) {
        console.warn('Email dispatch notice:', err);
      }

      // Celebrate with confetti
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Clear cart
      clearCart();

      // Open confirmation modal or navigate to confirmation view
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
    <div className="checkout-page animate-fade-in" style={{ padding: '2rem 0 6rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        {/* Breadcrumb Bar */}
        <div className="product-detail-breadcrumbs" style={{ marginBottom: '1.5rem', borderRadius: 'var(--radius-sm)' }}>
          <button 
            type="button" 
            className="breadcrumb-back-btn"
            onClick={() => navigateTo('cart')}
            title="Back to Bag"
          >
            <ArrowLeft size={14} />
            <span>Back to Bag</span>
          </button>
          <div className="breadcrumb-trail">
            <span className="breadcrumb-link" onClick={() => navigateTo('home')}>Home</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-link" onClick={() => navigateTo('cart')}>Cart</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-active">Secure Checkout</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h1 className="font-serif-editorial" style={{ fontSize: '2.2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Checkout & Delivery Details
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#16A34A', background: 'rgba(22, 163, 74, 0.08)', padding: '5px 12px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(22, 163, 74, 0.3)' }}>
            <Lock size={13} />
            <span>256-Bit SSL Encrypted & Verified</span>
          </div>
        </div>

        <form onSubmit={handleSubmitOrder}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
            {/* Left Column: Form Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Card 1: Customer Contact */}
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={18} color="var(--text-gold)" />
                  <span>1. Customer Contact Details</span>
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Your Full Name *
                    </label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Rohini Malhotra"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-alt)', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Mobile Number (For Delivery OTP) *
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-alt)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ padding: '0 10px', fontSize: '0.85rem', color: 'var(--text-muted)', borderRight: '1px solid var(--border-subtle)' }}>+91</span>
                      <input 
                        type="tel" 
                        required 
                        maxLength={10}
                        placeholder="10-digit number"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                        style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: 'none', fontSize: '0.88rem', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Email Address (Optional)
                    </label>
                    <input 
                      type="email" 
                      placeholder="For invoice & receipt"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-alt)', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Delivery Address */}
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={18} color="var(--text-gold)" />
                  <span>2. Delivery Address (Where should flowers arrive?)</span>
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Recipient Name (Whom is this surprise for?)
                    </label>
                    <input 
                      type="text" 
                      placeholder="Leave blank if delivering to yourself"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-alt)', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      House / Flat / Tower No. *
                    </label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Flat 402, Lotus Tower"
                      value={houseNo}
                      onChange={(e) => setHouseNo(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-alt)', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Street / Colony / Society *
                    </label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Sector 128, Green Avenue"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-alt)', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Landmark (Optional)
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Near City Mall"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-alt)', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      6-Digit PIN Code *
                    </label>
                    <input 
                      type="text" 
                      required 
                      maxLength={6}
                      placeholder="e.g. 110070"
                      value={pincode}
                      onChange={handlePincodeChange}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-alt)', fontSize: '0.88rem', outline: 'none' }}
                    />
                    {pinStatus && (
                      <div style={{ fontSize: '0.75rem', marginTop: '4px', color: pinStatus.valid ? '#16A34A' : '#EF4444' }}>
                        {pinStatus.valid ? '✓ Serviceable for Express Floral Delivery' : pinStatus.message}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      City *
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-alt)', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      State *
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-alt)', fontSize: '0.88rem', outline: 'none' }}
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Card 3: Delivery Date & Slot */}
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} color="var(--text-gold)" />
                  <span>3. Scheduled Delivery Slot</span>
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Delivery Date *
                    </label>
                    <input 
                      type="date" 
                      min={todayStr}
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-alt)', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Delivery Slot Time *
                    </label>
                    <select 
                      value={deliverySlot}
                      onChange={(e) => setDeliverySlot(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-alt)', fontSize: '0.88rem', outline: 'none' }}
                    >
                      <option value="Morning Dew (8 AM - 11 AM)">🌅 Morning Dew (8:00 AM – 11:00 AM)</option>
                      <option value="Standard Delivery (1 PM - 5 PM)">☀️ Standard Afternoon (1:00 PM – 5:00 PM)</option>
                      <option value="Evening Sunset (6 PM - 9 PM)">🌇 Evening Sunset (6:00 PM – 9:00 PM)</option>
                      <option value="Midnight Surprise (11:15 PM - 12:00 AM)">🌙 Midnight Special (11:15 PM – 12:00 AM)</option>
                    </select>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Truck size={14} color="#16A34A" />
                  <span>Delivered via climate-controlled vehicles with fresh hydration gel stem packs.</span>
                </div>
              </div>

              {/* Card 4: Complimentary Gift Message */}
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Gift size={18} color="var(--text-gold)" />
                  <span>4. Complimentary Personalized Greeting Card</span>
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  We will print your message on a luxury gold-foil embossed card and nestle it inside the bouquet envelope for free.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Your Heartfelt Message
                    </label>
                    <textarea 
                      rows={3}
                      placeholder="e.g. Happy Birthday to the most special person in my life! Wishing you blooming joy and love."
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-alt)', fontSize: '0.88rem', outline: 'none', resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Sender Signature (Printed at the bottom)
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Rohini & Rahul"
                      value={senderSign}
                      onChange={(e) => setSenderSign(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-alt)', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 5: Payment Method */}
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-gold)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={18} color="var(--text-gold)" />
                  <span>5. Payment Method</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {/* Option 1: Cash on Delivery */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: paymentMethod === 'cod' ? '2px solid var(--text-gold)' : '1px solid var(--border-subtle)',
                    background: paymentMethod === 'cod' ? 'var(--bg-accent-soft)' : 'var(--bg-alt)',
                    cursor: 'pointer'
                  }}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      checked={paymentMethod === 'cod'} 
                      onChange={() => setPaymentMethod('cod')} 
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Cash on Delivery (OTP Verified)</span>
                        <span className="gold-badge" style={{ fontSize: '0.68rem' }}>Most Popular</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Pay cash or UPI to rider upon receiving your fresh flowers. Secret 4-digit Delivery Handover OTP protects your package.
                      </div>
                    </div>
                  </label>

                  {/* Option 2: Direct UPI QR Code */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: paymentMethod === 'upi_qr' ? '2px solid var(--text-gold)' : '1px solid var(--border-subtle)',
                    background: paymentMethod === 'upi_qr' ? 'var(--bg-accent-soft)' : 'var(--bg-alt)',
                    cursor: 'pointer'
                  }}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      checked={paymentMethod === 'upi_qr'} 
                      onChange={() => setPaymentMethod('upi_qr')} 
                      style={{ marginTop: '3px' }}
                    />
                    <div style={{ width: '100%' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Instant UPI QR Code (GPay / PhonePe / Paytm)</span>
                        <span className="rose-badge" style={{ fontSize: '0.68rem' }}>Instant Receipt</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Scan & pay directly to store UPI ID. Zero gateway convenience fees.
                      </div>

                      {paymentMethod === 'upi_qr' && (
                        <div className="animate-fade-in" style={{
                          marginTop: '0.85rem',
                          padding: '1rem',
                          background: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px dashed var(--border-gold)',
                          textAlign: 'center'
                        }}>
                          <div style={{ display: 'inline-block', padding: '8px', background: '#FFFFFF', borderRadius: '8px', marginBottom: '0.5rem' }}>
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=${brandConfig?.upiId || 'roshikablooms@upi'}&pn=RisikaBlooms&am=${cartTotal}&cu=INR`)}`} 
                              alt="Store UPI QR Code" 
                              style={{ width: '130px', height: '130px', display: 'block' }}
                            />
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            UPI ID: <span style={{ color: 'var(--text-gold)' }}>{brandConfig?.upiId || 'roshikablooms@upi'}</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                            Amount to Pay: <strong>₹{cartTotal}</strong>
                          </div>

                          <div style={{ textAlign: 'left', maxWidth: '320px', margin: '0 auto' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '3px' }}>
                              Enter 12-Digit UPI Ref / UTR No. *
                            </label>
                            <input 
                              type="text" 
                              required={paymentMethod === 'upi_qr'}
                              placeholder="e.g. 428190827102"
                              value={utrNumber}
                              onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                              style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem', outline: 'none' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Option 3: Online Gateway (Test Mode) */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: paymentMethod === 'razorpay' ? '2px solid var(--text-gold)' : '1px solid var(--border-subtle)',
                    background: paymentMethod === 'razorpay' ? 'var(--bg-accent-soft)' : 'var(--bg-alt)',
                    cursor: 'pointer'
                  }}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      checked={paymentMethod === 'razorpay'} 
                      onChange={() => setPaymentMethod('razorpay')} 
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                        Razorpay Gateway (NetBanking, Cards & Wallets)
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Supports all major credit/debit cards, NetBanking, and digital wallets. Test simulation mode active.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Items & Place Order Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-gold)' }}>
                <h3 className="font-serif-editorial" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  Order Summary ({cart.reduce((a, c) => a + c.quantity, 0)} Items)
                </h3>

                {/* Items List Mini */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px', marginBottom: '1rem' }}>
                  {cart.map((item) => (
                    <div key={item.cartItemId} style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.84rem' }}>
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                        </div>
                      </div>
                      <strong style={{ color: 'var(--text-primary)' }}>
                        ₹{item.price * item.quantity}
                      </strong>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Bag Subtotal</span>
                    <span>₹{cartSubtotal}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A' }}>
                      <span>Coupon Discount ({appliedCoupon?.code})</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Express Delivery</span>
                    <span>{deliveryFee === 0 ? <strong style={{ color: '#16A34A' }}>FREE</strong> : `₹${deliveryFee}`}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span>Greeting Card & Food Sachet</span>
                    <span style={{ color: '#16A34A' }}>FREE</span>
                  </div>
                </div>

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>Final Payable</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-accent)' }}>₹{cartTotal}</span>
                </div>

                {/* Place Order CTA */}
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '1.05rem', padding: '0.9rem' }}
                >
                  {isSubmitting ? (
                    <span>Securing Your Order...</span>
                  ) : (
                    <>
                      <span>Confirm & Place Order</span>
                      <CheckCircle2 size={18} />
                    </>
                  )}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.85rem' }}>
                  <ShieldCheck size={14} color="#16A34A" />
                  <span>Handcrafted fresh flowers • 100% On-Time Delivery Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
