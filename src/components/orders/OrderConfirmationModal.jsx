import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { 
  X, CheckCircle2, ShieldCheck, MapPin, ExternalLink, 
  Copy, Check, MessageCircle, ShoppingBag, Clock, Sparkles,
  Smartphone, PackageCheck, Calendar, ArrowRight
} from 'lucide-react';
import { 
  createWhatsAppUrl, 
  buildCartWhatsAppMessage
} from '../../config/whatsapp';

export default function OrderConfirmationModal() {
  const { 
    activeOrderConfirmation, 
    closeOrderConfirmationModal, 
    showToast, 
    navigateTo,
    brandConfig
  } = useShop();

  const [copiedOtp, setCopiedOtp] = useState(false);

  if (!activeOrderConfirmation) return null;

  const order = activeOrderConfirmation;

  const rawPhone = String(order.recipientPhone || order.customerPhone || '').replace(/\D/g, '');
  const clean10 = rawPhone.slice(-10);
  const formattedPhone = clean10 ? `+91 ${clean10}` : (order.recipientPhone || order.customerPhone || 'Your Mobile');

  const handleCopyOtp = () => {
    if (order.deliveryOtp) {
      navigator.clipboard.writeText(order.deliveryOtp);
      setCopiedOtp(true);
      showToast(`✓ Delivery OTP ${order.deliveryOtp} copied to clipboard!`, 'success');
      setTimeout(() => setCopiedOtp(false), 2500);
    }
  };

  const handleOpenWhatsApp = () => {
    const msg = buildCartWhatsAppMessage({
      orderId: order.orderId,
      deliveryOtp: order.deliveryOtp,
      cartItems: order.items || [],
      subtotal: order.subtotal || order.total,
      deliveryFee: order.deliveryFee || 0,
      total: order.total,
      customerName: order.customerName,
      recipientName: order.recipientName,
      recipientPhone: order.recipientPhone,
      deliveryAddress: order.deliveryAddress,
      pincode: order.pincode,
      locationUrl: order.locationUrl,
      deliveryDate: order.deliveryDate,
      deliverySlot: order.deliverySlot,
      giftMessage: order.giftMessage
    });

    const url = createWhatsAppUrl(msg, brandConfig?.whatsappNumber);
    window.open(url, '_blank');
  };

  return (
    <div className="drawer-backdrop open" style={{ zIndex: 100025 }} onClick={closeOrderConfirmationModal}>
      <div 
        className="glass-panel animate-scale-up" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '490px',
          width: 'calc(100% - 24px)',
          maxHeight: '92dvh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          margin: 'auto',
          padding: '1.75rem 1.4rem',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border-gold)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          boxSizing: 'border-box'
        }}
      >
        {/* Close Button */}
        <button 
          type="button"
          onClick={closeOrderConfirmationModal}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'var(--bg-alt)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-muted)'
          }}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* 1. Header: Professional Order Placed Successfully */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '2px solid #10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem auto',
            color: '#10B981',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)'
          }}>
            <CheckCircle2 size={32} />
          </div>

          <span style={{ 
            fontSize: '0.72rem', 
            textTransform: 'uppercase', 
            letterSpacing: '1.5px', 
            color: '#10B981', 
            fontWeight: 800,
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '2px 10px',
            borderRadius: '12px',
            display: 'inline-block',
            marginBottom: '0.35rem'
          }}>
            ✓ Order Placed Successfully
          </span>

          <h2 className="font-serif-editorial" style={{ fontSize: '1.65rem', margin: '0.15rem 0 0.35rem 0', color: 'var(--text-primary)' }}>
            Thank You for Your Order!
          </h2>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
            Order ID: <strong style={{ color: 'var(--text-gold)', fontFamily: 'monospace', fontSize: '0.95rem' }}>#{order.orderId}</strong>
          </p>
        </div>

        {/* 2. 🔐 Luxury Doorstep Handover Pass */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(20, 18, 14, 0.95) 100%)',
          border: '1.5px solid var(--border-gold)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.15rem 1rem',
          textAlign: 'center',
          marginBottom: '1.25rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-gold)', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.35rem' }}>
            <ShieldCheck size={15} />
            <span>Doorstep Delivery Verification Code</span>
          </div>

          {/* 4 Large Clean OTP Boxes */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', margin: '0.65rem 0' }}>
            {(String(order.deliveryOtp || '4892')).split('').map((digit, idx) => (
              <div 
                key={idx}
                style={{
                  width: '46px',
                  height: '50px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  border: '1.5px solid var(--border-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  color: 'var(--text-gold)',
                  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.12)'
                }}
              >
                {digit}
              </div>
            ))}

            <button
              type="button"
              onClick={handleCopyOtp}
              className="btn btn-outline btn-sm"
              style={{
                height: '48px',
                padding: '0 0.65rem',
                fontSize: '0.75rem',
                borderColor: 'var(--border-gold)',
                color: 'var(--text-gold)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Copy OTP"
            >
              {copiedOtp ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
              <span>{copiedOtp ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '380px', margin: '0 auto 0.5rem auto', lineHeight: 1.4 }}>
            Please share this <strong>4-digit code</strong> with our delivery concierge at your doorstep upon receiving your bouquet.
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.73rem',
            color: '#10B981',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '2px 8px',
            borderRadius: '10px',
            fontWeight: 600
          }}>
            <Smartphone size={12} />
            <span>Sent to {formattedPhone} via SMS</span>
          </div>
        </div>

        {/* 3. Clean Order & Delivery Details Card */}
        <div style={{
          background: 'var(--bg-alt)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.95rem 1rem',
          marginBottom: '1.25rem',
          fontSize: '0.83rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem', paddingBottom: '0.45rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Recipient:</span>
            <strong style={{ color: 'var(--text-primary)' }}>{order.recipientName || order.customerName}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem', paddingBottom: '0.45rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Mobile Number:</span>
            <strong style={{ color: 'var(--text-primary)' }}>{formattedPhone}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem', paddingBottom: '0.45rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} color="var(--text-gold)" /> Delivery Slot:
            </span>
            <span style={{ color: 'var(--text-gold)', fontWeight: 700 }}>
              {order.deliverySlot}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.55rem', paddingBottom: '0.45rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', flexShrink: 0, marginRight: '8px' }}>Delivery Address:</span>
            <span style={{ color: 'var(--text-primary)', textAlign: 'right', wordBreak: 'break-word', lineHeight: 1.35 }}>
              {order.deliveryAddress} {order.pincode ? `(${order.pincode})` : ''}
            </span>
          </div>

          {order.locationUrl && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.45rem 0.65rem',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '0.55rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10B981', fontWeight: 600, fontSize: '0.76rem' }}>
                <MapPin size={13} />
                <span>Exact GPS Location Pin Attached</span>
              </div>
              <a 
                href={order.locationUrl} 
                target="_blank" 
                rel="noreferrer"
                style={{ color: 'var(--text-gold)', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 700, textDecoration: 'underline' }}
              >
                <span>View Pin</span>
                <ExternalLink size={11} />
              </a>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem', paddingBottom: '0.45rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{order.paymentMethod || 'Online Payment'}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.2rem' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Total Paid / Payable:</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-gold)' }}>₹{order.total}</span>
          </div>
        </div>

        {/* 4. Clean Master Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              closeOrderConfirmationModal();
              navigateTo('home');
            }}
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              background: 'linear-gradient(135deg, #D4AF37 0%, #B8972E 100%)',
              color: '#000000',
              fontWeight: 800,
              fontSize: '0.94rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 6px 20px rgba(212, 175, 55, 0.3)'
            }}
          >
            <ShoppingBag size={18} />
            <span>Continue Shopping</span>
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleOpenWhatsApp}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderColor: '#25D366',
              color: '#25D366',
              background: 'rgba(37, 211, 102, 0.06)',
              fontWeight: 700,
              fontSize: '0.88rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <MessageCircle size={18} />
            <span>Chat with Concierge on WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
