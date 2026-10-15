import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { BRAND_CONFIG } from '../config/brand';
import { createWhatsAppUrl, buildCartWhatsAppMessage } from '../config/whatsapp';
import { 
  X, Plus, Minus, Trash2, ShoppingBag, MessageCircle, 
  CreditCard, Sparkles, Tag, CheckCircle2, ChevronRight, 
  Clock, Truck, Calendar, MapPin, User, Gift, ShieldCheck 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sendOrderVerificationNotification, DEFAULT_VERIFICATION_EMAIL } from '../services/emailService';

export default function CartDrawer() {
  const { 
    isCartOpen, setIsCartOpen, 
    cart, updateQuantity, removeFromCart, clearCart, 
    cartSubtotal, deliveryFee, discountAmount, cartTotal, 
    couponCode, appliedCoupon, applyCoupon, removeCoupon, 
    t, navigateTo, showToast, brandConfig
  } = useShop();

  const [inputCoupon, setInputCoupon] = useState('');
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  // Recipient & Delivery form state
  const [customerName, setCustomerName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('Standard Delivery (1 PM - 5 PM)');
  const [giftMessage, setGiftMessage] = useState('');

  // Demo Payment Gateway Modal
  const [showDemoGateway, setShowDemoGateway] = useState(false);
  const [isProcessingDemo, setIsProcessingDemo] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    applyCoupon(inputCoupon);
  };

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;

    const orderId = `RB-${Math.floor(100000 + Math.random() * 900000)}`;
    const targetEmail = brandConfig?.email || DEFAULT_VERIFICATION_EMAIL;

    // Dispatch verified order notification to mahimakk18@gmail.com
    sendOrderVerificationNotification({
      orderId,
      customerName,
      recipientName,
      recipientPhone,
      deliveryAddress,
      pincode,
      deliveryDate,
      deliverySlot,
      giftMessage,
      cartItems: cart,
      total: cartTotal,
      paymentMethod: "WhatsApp Instant Checkout",
      targetEmail
    });

    const msg = buildCartWhatsAppMessage({
      cartItems: cart,
      subtotal: cartSubtotal,
      discount: discountAmount,
      deliveryFee,
      total: cartTotal,
      couponCode: appliedCoupon?.code,
      customerName,
      recipientName,
      recipientPhone,
      deliveryAddress,
      pincode,
      deliveryDate,
      deliverySlot,
      giftMessage
    });

    showToast(`🌸 Order #${orderId} verified and forwarded to ${targetEmail}!`, 'success');
    const url = createWhatsAppUrl(msg);
    window.open(url, '_blank');
    setIsCartOpen(false);
  };

  const handleDemoPayment = () => {
    setIsProcessingDemo(true);
    const orderId = `RB-${Math.floor(100000 + Math.random() * 900000)}`;
    const targetEmail = brandConfig?.email || DEFAULT_VERIFICATION_EMAIL;

    // Dispatch verified order notification to mahimakk18@gmail.com
    sendOrderVerificationNotification({
      orderId,
      customerName,
      recipientName,
      recipientPhone,
      deliveryAddress,
      pincode,
      deliveryDate,
      deliverySlot,
      giftMessage,
      cartItems: cart,
      total: cartTotal,
      paymentMethod: "Demo Online Gateway (Simulated UPI/Card)",
      targetEmail
    });

    setTimeout(() => {
      setIsProcessingDemo(false);
      setDemoSuccess(true);
      clearCart();
      showToast(`🎉 Order #${orderId} confirmed & dispatched to ${targetEmail}!`, 'success');
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      } catch {}
    }, 1500);
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

              {/* Optional Recipient & Delivery Information Toggle */}
              <div style={{ marginTop: '1.5rem' }}>
                <button 
                  onClick={() => setShowCheckoutForm(!showCheckoutForm)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-light)',
                    background: 'var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} color="var(--text-gold)" />
                    Recipient & Delivery Details (Optional)
                  </span>
                  <ChevronRight size={16} style={{ transform: showCheckoutForm ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {showCheckoutForm && (
                  <div className="animate-fade-in" style={{ padding: '1rem', background: 'var(--bg-alt)', borderRadius: 'var(--radius-md)', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <input 
                      type="text"
                      placeholder="Your Name (Sender)"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={{ padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', fontSize: '0.82rem' }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <input 
                        type="text"
                        placeholder="Recipient's Name"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        style={{ padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', fontSize: '0.82rem' }}
                      />
                      <input 
                        type="tel"
                        placeholder="Recipient's Phone"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        style={{ padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', fontSize: '0.82rem' }}
                      />
                    </div>
                    <input 
                      type="text"
                      placeholder="Delivery Full Address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      style={{ padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', fontSize: '0.82rem' }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <input 
                        type="text"
                        placeholder="PIN Code"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        style={{ padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', fontSize: '0.82rem' }}
                      />
                      <input 
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        style={{ padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', fontSize: '0.82rem' }}
                      />
                    </div>
                    <select
                      value={deliverySlot}
                      onChange={(e) => setDeliverySlot(e.target.value)}
                      style={{ padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', fontSize: '0.82rem' }}
                    >
                      <option value="Morning (8 AM - 11 AM)">🌅 Morning Delivery (8 AM - 11 AM)</option>
                      <option value="Standard Delivery (1 PM - 5 PM)">☀️ Standard Delivery (1 PM - 5 PM)</option>
                      <option value="Evening (6 PM - 9 PM)">🌇 Evening Delivery (6 PM - 9 PM)</option>
                      <option value="Midnight Surprise (11:15 PM - 12:00 AM)">🌙 Midnight Surprise (11:15 PM - 12:00 AM)</option>
                    </select>
                    <textarea 
                      rows={2}
                      placeholder="Printed Greeting Card Message (Complimentary)..."
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      style={{ padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', fontSize: '0.82rem', resize: 'none' }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer: Billing & Dual Checkout */}
        {cart.length > 0 && (
          <div className="drawer-footer">
            <div className="bill-row">
              <span>{t('subtotal')}:</span>
              <span>₹{cartSubtotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className="bill-row" style={{ color: '#16A34A', fontWeight: 700 }}>
                <span>{t('discount')}:</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}
            <div className="bill-row">
              <span>{t('deliveryFee')}:</span>
              <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
            </div>
            <div className="bill-total-row">
              <span>{t('total')}:</span>
              <span>₹{cartTotal}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {/* 1. Official WhatsApp Order CTA (Mandatory) */}
              <button 
                className="btn btn-whatsapp btn-lg"
                onClick={handleWhatsAppCheckout}
                style={{ width: '100%' }}
              >
                <MessageCircle size={20} />
                <span>{t('checkoutWhatsApp')}</span>
              </button>

              {/* 2. Demo Online Payment Gateway */}
              <button 
                className="btn btn-outline"
                onClick={() => setShowDemoGateway(true)}
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                <CreditCard size={16} />
                <span>{t('demoCheckout')}</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                <ShieldCheck size={13} color="var(--text-gold)" />
                <span>Verified Atelier Dispatch: {brandConfig?.email || DEFAULT_VERIFICATION_EMAIL}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Demo Online Payment Gateway Modal */}
      {showDemoGateway && (
        <div className="drawer-backdrop open" onClick={() => setShowDemoGateway(false)} style={{ zIndex: 150 }}>
          <div 
            className="glass-panel" 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '460px',
              width: '90%',
              margin: '120px auto',
              padding: '2.5rem 2rem',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--bg-surface)',
              textAlign: 'center'
            }}
          >
            {demoSuccess ? (
              <div className="animate-fade-in">
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
                <h3 className="font-serif-editorial" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Demo Order Placed!
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Thank you! In this demonstration mode, order #{Math.floor(100000 + Math.random() * 900000)} is simulated successfully. You can also place direct orders on WhatsApp anytime.
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setShowDemoGateway(false);
                    setDemoSuccess(false);
                    setIsCartOpen(false);
                    navigateTo('home');
                  }}
                >
                  Return to Boutique
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <span className="rose-badge">🔒 Demo Payment Gateway</span>
                  <button className="drawer-close-btn" onClick={() => setShowDemoGateway(false)}>
                    <X size={16} />
                  </button>
                </div>

                <h3 className="font-serif-editorial" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  ROSHIKA BLOOMS Pay
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Amount payable: <strong style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>₹{cartTotal}</strong>
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                  <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-gold)', background: 'var(--bg-accent-soft)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>⚡</span>
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>UPI / QR Instant Pay (Demo)</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {brandConfig?.upiId ? `Store UPI ID: ${brandConfig.upiId} • Google Pay, PhonePe, Paytm` : 'Google Pay, PhonePe, Paytm'}
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CreditCard size={18} color="var(--text-gold)" />
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Credit / Debit Cards (Demo)</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Visa, MasterCard, RuPay</div>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
                  * This is an interactive demo checkout. No actual money will be charged.
                </p>

                <button 
                  className="btn btn-primary"
                  onClick={handleDemoPayment}
                  disabled={isProcessingDemo}
                  style={{ width: '100%' }}
                >
                  {isProcessingDemo ? 'Processing Demo Transaction...' : `Simulate Pay ₹${cartTotal}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
