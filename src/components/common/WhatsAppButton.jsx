import React, { useState } from 'react';
import { MessageCircle, X, ExternalLink, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

const WA_CHANNEL_URL = 'https://whatsapp.com/channel/0029VbE37yqDTkJzYHDgZV1h';

export default function WhatsAppButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Sleek, Luxury Floating VIP Atelier Button (Positioned above mobile bottom bar) */}
      <div 
        className="luxury-vip-float-wrapper"
        style={{
          position: 'fixed',
          zIndex: 900,
          pointerEvents: 'auto'
        }}
      >
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)',
            border: '1.5px solid #D4AF37',
            borderRadius: '50px',
            padding: '0.55rem 1rem 0.55rem 0.85rem',
            color: '#FFFFFF',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            boxShadow: '0 8px 24px rgba(6, 78, 59, 0.4), 0 0 12px rgba(212, 175, 55, 0.25)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Join Rishika Blooms Official VIP Channel"
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <MessageCircle size={18} color="#34D399" />
            <span style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#D4AF37',
              boxShadow: '0 0 6px #D4AF37'
            }} />
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.3px' }}>
            VIP Channel • 20% OFF
          </span>
        </button>
      </div>

      {/* Professional Haute Atelier VIP Modal (Only opens when user clicks!) */}
      {isModalOpen && (
        <div 
          className="drawer-backdrop open" 
          style={{ zIndex: 100080, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.75)' }}
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="glass-panel animate-scale-up" 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '420px',
              width: '100%',
              padding: '2rem 1.75rem',
              borderRadius: '20px',
              border: '2px solid var(--border-gold)',
              background: 'var(--bg-surface)',
              textAlign: 'center',
              boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 30px rgba(212, 175, 55, 0.25)',
              position: 'relative'
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'var(--bg-alt)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Close"
            >
              <X size={16} />
            </button>

            {/* Emblem Crest */}
            <div style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(184, 134, 11, 0.1) 100%)',
              border: '2px solid #D4AF37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <Sparkles size={26} color="#D4AF37" />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(212, 175, 55, 0.12)', border: '1px solid #D4AF37', color: '#D4AF37', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.5rem' }}>
              <ShieldCheck size={13} />
              <span>OFFICIAL VIP CLUB</span>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
              Rishika Blooms VIP Channel
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem 0', lineHeight: 1.45 }}>
              Join our verified WhatsApp channel for royal atelier privileges, exclusive coupon codes & live fresh bloom updates.
            </p>

            {/* Benefits List */}
            <div style={{
              background: 'var(--bg-alt)',
              padding: '1rem',
              borderRadius: '12px',
              textAlign: 'left',
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1rem' }}>💎</span>
                <span><strong>Instant 20% OFF</strong> code on your luxury bouquet orders</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1rem' }}>💐</span>
                <span><strong>Daily Fresh Drops</strong> — First preview of new Dutch roses & velvet wraps</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1rem' }}>🌙</span>
                <span><strong>Midnight Priority</strong> — Dedicated slots for surprise midnight deliveries</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <a
                href={WA_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsModalOpen(false)}
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                }}
              >
                <span>Join Official Channel</span>
                <ExternalLink size={15} />
              </a>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn btn-outline"
                style={{ padding: '0.65rem', fontSize: '0.84rem', borderRadius: '10px' }}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive floating styles */}
      <style>{`
        .luxury-vip-float-wrapper {
          bottom: 24px;
          right: 24px;
        }
        @media (max-width: 768px) {
          .luxury-vip-float-wrapper {
            bottom: 74px !important;
            right: 14px !important;
          }
        }
      `}</style>
    </>
  );
}
