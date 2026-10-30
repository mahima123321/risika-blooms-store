import React, { useState, useEffect } from 'react';
import { MessageCircle, X, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

const WA_CHANNEL_URL = 'https://whatsapp.com/channel/0029VbE37yqDTkJzYHDgZV1h';

export default function WhatsAppButton() {
  const [showBanner, setShowBanner] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  useEffect(() => {
    // Check if user has already auto-opened or dismissed the channel prompt
    const alreadyOpened = localStorage.getItem('rb_wa_channel_auto_opened');
    const alreadyDismissed = sessionStorage.getItem('rb_wa_channel_dismissed');

    if (!alreadyOpened && !alreadyDismissed) {
      // 1. Show the prominent floating invite banner after a brief 1-second delay
      const bannerTimer = setTimeout(() => {
        setShowBanner(true);
      }, 1200);

      // 2. Automatically open WhatsApp Channel on the first user click/touch anywhere
      const triggerAutoOpenOnFirstInteraction = (e) => {
        if (!localStorage.getItem('rb_wa_channel_auto_opened')) {
          localStorage.setItem('rb_wa_channel_auto_opened', 'true');
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

      // 3. Also try a direct timed attempt (some mobile browsers allow it if trusted)
      const autoTimer = setTimeout(() => {
        if (!localStorage.getItem('rb_wa_channel_auto_opened')) {
          try {
            const win = window.open(WA_CHANNEL_URL, '_blank', 'noopener,noreferrer');
            if (win) {
              localStorage.setItem('rb_wa_channel_auto_opened', 'true');
              setHasAutoOpened(true);
            }
          } catch (e) {
            // Popup blocker may intercept until user taps
          }
        }
      }, 2500);

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
    localStorage.setItem('rb_wa_channel_auto_opened', 'true');
    setShowBanner(false);
    window.open(WA_CHANNEL_URL, '_blank', 'noopener,noreferrer');
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    sessionStorage.setItem('rb_wa_channel_dismissed', 'true');
    setShowBanner(false);
  };

  return (
    <>
      {/* 1. AUTO PROMPT / JOIN BANNER (Appears on First Visit) */}
      {showBanner && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '92%',
          maxWidth: '440px',
          background: 'linear-gradient(135deg, #075E54 0%, #128C7E 100%)',
          color: '#ffffff',
          borderRadius: '14px',
          padding: '1rem 1.1rem',
          boxShadow: '0 12px 35px rgba(18, 140, 126, 0.45), 0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 9999,
          animation: 'slideUpWaBanner 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          border: '1.5px solid rgba(255, 255, 255, 0.25)'
        }}>
          {/* Close button */}
          <button
            type="button"
            onClick={handleDismiss}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(0,0,0,0.2)',
              border: 'none',
              color: '#ffffff',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Dismiss"
          >
            <X size={14} />
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#25D366',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 3px 10px rgba(37, 211, 102, 0.4)'
            }}>
              <MessageCircle size={24} color="#ffffff" />
            </div>

            <div style={{ flex: 1, paddingRight: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.98rem', letterSpacing: '-0.2px' }}>
                  Join WhatsApp Channel
                </span>
                <span style={{ background: '#25D366', color: '#ffffff', fontSize: '0.62rem', fontWeight: 900, padding: '1px 5px', borderRadius: '4px' }}>
                  OFFICIAL
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.92)', lineHeight: '1.3' }}>
                Join for daily flower discounts, fresh bouquet drops & real-time delivery updates!
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleJoinClick}
              style={{
                flex: 1,
                background: '#25D366',
                color: '#ffffff',
                border: 'none',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
              }}
            >
              <span>Join Channel Now</span>
              <ExternalLink size={15} />
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
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
          bottom: '24px',
          right: '24px',
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          color: '#ffffff',
          borderRadius: '50px',
          padding: '0.65rem 1rem 0.65rem 0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 6px 24px rgba(37, 211, 102, 0.45)',
          zIndex: 900,
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: '0.84rem',
          border: '2px solid rgba(255, 255, 255, 0.4)',
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
        <span className="hide-on-very-small-screens">Join WhatsApp Channel</span>
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
        @media (max-width: 480px) {
          .hide-on-very-small-screens {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
