import React, { useEffect, useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { MessageSquare, Smartphone, Copy, X, Check } from 'lucide-react';

export default function IncomingSmsBanner() {
  const { incomingSmsBanner, dismissIncomingSmsBanner, showToast } = useShop();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!incomingSmsBanner) return;

    // Auto-dismiss after 16 seconds
    const timer = setTimeout(() => {
      dismissIncomingSmsBanner();
    }, 16000);

    return () => clearTimeout(timer);
  }, [incomingSmsBanner, dismissIncomingSmsBanner]);

  if (!incomingSmsBanner) return null;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(incomingSmsBanner.deliveryOtp);
    setCopied(true);
    showToast(`📋 Handover OTP ${incomingSmsBanner.deliveryOtp} copied to clipboard!`, 'success');
    setTimeout(() => setCopied(false), 2200);
  };

  const handleOpenSms = (e) => {
    e.stopPropagation();
    showToast('✉️ Opening SMS Messages app...', 'info');
    if (incomingSmsBanner.smsUrl) {
      window.location.href = incomingSmsBanner.smsUrl;
    }
  };

  const handleOpenWhatsApp = (e) => {
    e.stopPropagation();
    if (incomingSmsBanner.waUrl) {
      window.open(incomingSmsBanner.waUrl, '_blank');
      showToast('💬 Opening WhatsApp handover OTP chat...', 'info');
    }
  };

  return (
    <div 
      className="incoming-sms-banner-wrapper animate-slide-down"
      style={{
        position: 'fixed',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '92%',
        maxWidth: '480px',
        zIndex: 100050,
        pointerEvents: 'auto'
      }}
    >
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(26, 22, 16, 0.96) 0%, rgba(15, 13, 10, 0.98) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1.5px solid var(--border-gold)',
          borderRadius: '16px',
          padding: '0.85rem 1rem',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(212, 175, 55, 0.25)',
          color: '#FFFFFF'
        }}
      >
        {/* Top App Identity Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '7px',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.4)'
            }}>
              <MessageSquare size={14} />
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#34D399' }}>
              MESSAGES • Just Now
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.55)' }}>
              {incomingSmsBanner.time}
            </span>
            <button 
              type="button"
              onClick={dismissIncomingSmsBanner}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer'
              }}
              title="Dismiss message"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Sender & Body */}
        <div style={{ marginBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.2rem' }}>
            <strong style={{ fontSize: '0.86rem', color: '#F9E79F', fontWeight: 800 }}>
              Rishika Blooms Concierge
            </strong>
            <span style={{
              background: 'rgba(212, 175, 55, 0.2)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              color: '#F9E79F',
              fontSize: '0.65rem',
              padding: '1px 6px',
              borderRadius: '10px',
              fontWeight: 700
            }}>
              To: {incomingSmsBanner.formattedPhone}
            </span>
          </div>
          <p style={{
            margin: 0,
            fontSize: '0.82rem',
            lineHeight: 1.45,
            color: '#E5E7EB'
          }}>
            Your Secret Doorstep Handover OTP for Order <strong style={{ color: '#FFFFFF' }}>#{incomingSmsBanner.orderId}</strong> is:{' '}
            <span style={{
              display: 'inline-block',
              background: 'rgba(0, 0, 0, 0.65)',
              border: '1px solid #D4AF37',
              color: '#FDE047',
              padding: '2px 8px',
              borderRadius: '6px',
              fontWeight: 900,
              fontSize: '1rem',
              letterSpacing: '2px',
              margin: '0 2px'
            }}>
              {incomingSmsBanner.deliveryOtp}
            </span>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleOpenSms}
            style={{
              flex: '1 1 auto',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.45rem 0.75rem',
              color: '#FFFFFF',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Smartphone size={13} />
            <span>Open in SMS App</span>
          </button>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            style={{
              flex: '1 1 auto',
              background: '#25D366',
              border: 'none',
              borderRadius: '8px',
              padding: '0.45rem 0.75rem',
              color: '#FFFFFF',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              cursor: 'pointer'
            }}
          >
            <span>💬 WhatsApp OTP</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '0.45rem 0.65rem',
              color: '#FFFFFF',
              fontSize: '0.78rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
            title="Copy 4-digit OTP"
          >
            {copied ? <Check size={13} color="#34D399" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
