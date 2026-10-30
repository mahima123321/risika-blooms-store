import React, { useState, useEffect } from 'react';
import { MessageCircle, X, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

const WA_CHANNEL_URL = 'https://whatsapp.com/channel/0029VbE37yqDTkJzYHDgZV1h';

export default function WhatsAppButton() {
  const [showBanner, setShowBanner] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  useEffect(() => {
    // Check if user has already auto-opened or dismissed the channel prompt in this session
    const alreadyOpenedInSession = sessionStorage.getItem('rb_wa_channel_session_opened');

    if (!alreadyOpenedInSession) {
      // 1. Show the prominent floating invite banner after a brief 1.2-second delay
      const bannerTimer = setTimeout(() => {
        setShowBanner(true);
      }, 1200);

      // 2. Automatically open WhatsApp Channel on the first user click/touch anywhere on the website
      const triggerAutoOpenOnFirstInteraction = (e) => {
        // Only trigger once per session so browsing remains smooth
        if (!sessionStorage.getItem('rb_wa_channel_session_opened')) {
          sessionStorage.setItem('rb_wa_channel_session_opened', 'true');
          setHasAutoOpened(true);
          try {
            window.open(WA_CHANNEL_URL, '_blank', 'noopener,noreferrer');
          } catch (err) {
            console.warn('Auto open blocked by browser popup protection:', err);
          }
        }
        window.removeEventListener('click', triggerAutoOpenOnFirstInteraction);
        window.removeEventListener('touchend', triggerAutoOpenOnFirstInteraction);
      };

      // Listen for the very first interaction (click or tap)
      window.addEventListener('click', triggerAutoOpenOnFirstInteraction, { once: true });
      window.addEventListener('touchend', triggerAutoOpenOnFirstInteraction, { once: true });

      // 3. Timed attempt on page load (allowed on modern Android/Chrome if trusted)
      const autoTimer = setTimeout(() => {
        if (!sessionStorage.getItem('rb_wa_channel_session_opened')) {
          try {
            const win = window.open(WA_CHANNEL_URL, '_blank', 'noopener,noreferrer');
            if (win) {
              sessionStorage.setItem('rb_wa_channel_session_opened', 'true');
              setHasAutoOpened(true);
            }
          } catch (e) {
            // Browser popup blocker intercepts; first tap will handle it
          }
        }
      }, 2000);

      return () => {
        clearTimeout(bannerTimer);
        clearTimeout(autoTimer);
        window.removeEventListener('click', triggerAutoOpenOnFirstInteraction);
        window.removeEventListener('touchend', triggerAutoOpenOnFirstInteraction);
      };
    }
  }, []);

  const handleJoinClick = (e) => {
    e.stopPropagation();
    sessionStorage.setItem('rb_wa_channel_session_opened', 'true');
    setShowBanner(false);
    window.open(WA_CHANNEL_URL, '_blank', 'noopener,noreferrer');
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    sessionStorage.setItem('rb_wa_channel_session_opened', 'true');
    setShowBanner(false);
  };

  return (
    <>
      {/* 1. AUTO PROMPT / JOIN BANNER (Appears on First Visit) */}
      {showBanner && (
        <div style={{
          position: 'fixed',
          bottom: '82px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '92%',
          maxWidth: '420px',
          background: 'linear-gradient(135deg, #075E54 0%, #128C7E 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '1.1rem 1.15rem',
          boxShadow: '0 16px 40px rgba(7, 94, 84, 0.55), 0 4px 14px rgba(0,0,0,0.25)',
          zIndex: 9999,
          animation: 'slideUpWaBanner 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          border: '2px solid rgba(255, 255, 255, 0.35)',
          boxSizing: 'border-box'
        }}>
          {/* Close button */}
          <button
            type="button"
            onClick={handleDismiss}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(0,0,0,0.25)',
              border: 'none',
              color: '#ffffff',
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Dismiss"
          >
            <X size={15} />
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', marginBottom: '0.85rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: '#25D366',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(37, 211, 102, 0.5)'
            }}>
              <MessageCircle size={26} color="#ffffff" />
            </div>

            <div style={{ flex: 1, paddingRight: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.02rem', letterSpacing: '-0.2px' }}>
                  Join WhatsApp Channel
                </span>
                <span style={{ background: '#25D366', color: '#ffffff', fontSize: '0.62rem', fontWeight: 900, padding: '2px 6px', borderRadius: '4px' }}>
                  VERIFIED
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.95)', lineHeight: '1.35' }}>
                हमारे ऑफिशियल व्हाट्सएप चैनल से जुड़ें और पाएं <strong>20% की छूट</strong> व नए बुके का डेली अपडेट!
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={handleJoinClick}
              style={{
                flex: 1.5,
                background: '#25D366',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)'
              }}
            >
              <span>चैनल से जुड़ें (Join Now)</span>
              <ExternalLink size={16} />
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              style={{
                flex: 0.6,
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '0.75rem 0.5rem',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Later
            </button>
          </div>
        </div>
      )}

      {/* 2. FLOATING WHATSAPP CHANNEL CORNER PILL (Always accessible) */}
      <a
        href={WA_CHANNEL_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '22px',
          right: '18px',
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          color: '#ffffff',
          borderRadius: '50px',
          padding: '0.65rem 1.1rem 0.65rem 0.95rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 6px 24px rgba(37, 211, 102, 0.45)',
          zIndex: 900,
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: '0.85rem',
          border: '2px solid rgba(255, 255, 255, 0.45)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        title="Join our official WhatsApp Channel"
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <MessageCircle size={22} color="#ffffff" />
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '9px',
            height: '9px',
            background: '#ffeb3b',
            borderRadius: '50%',
            boxShadow: '0 0 0 2px #128C7E'
          }} />
        </div>
        <span>Join Channel</span>
      </a>

      {/* Keyframe animation styling */}
      <style>{`
        @keyframes slideUpWaBanner {
          from {
            opacity: 0;
            transform: translate(-50%, 25px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </>
  );
}
