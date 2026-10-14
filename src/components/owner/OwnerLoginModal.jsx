import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Lock, Eye, EyeOff, ShieldCheck, X, Sparkles } from 'lucide-react';

export default function OwnerLoginModal() {
  const { isOwnerLoginModalOpen, closeOwnerLogin, loginAsOwner, ownerPin } = useShop();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');

  if (!isOwnerLoginModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('कृपया ओनर पिन दर्ज करें (Please enter PIN)');
      return;
    }
    const res = loginAsOwner(pin);
    if (!res.success) {
      setError(res.error || 'गलत पिन (Incorrect PIN)');
    } else {
      setPin('');
      setError('');
    }
  };

  const handleQuickFill = () => {
    setPin(ownerPin || 'risika2026');
    setError('');
  };

  return (
    <div className="drawer-backdrop open owner-modal-backdrop" onClick={closeOwnerLogin}>
      <div 
        className="glass-panel owner-login-card animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="drawer-close-btn owner-modal-close" onClick={closeOwnerLogin} aria-label="Close">
          <X size={20} />
        </button>

        <div className="owner-login-header">
          <div className="owner-crown-icon">
            <Lock size={26} />
          </div>
          <span className="gold-badge" style={{ marginBottom: '0.4rem' }}>
            <Sparkles size={11} /> Authorized Owner Access Only
          </span>
          <h2 className="font-serif-editorial" style={{ fontSize: '1.75rem', marginBottom: '0.3rem' }}>
            ROSHIKA BLOOMS Owner Portal
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            केवल ओनर ही बुके की नई तस्वीरें और कीमतें (Prices) जोड़ या बदल सकते हैं।
          </p>
        </div>

        <form onSubmit={handleSubmit} className="owner-login-form">
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Owner Security PIN / पासवर्ड
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => { setPin(e.target.value); setError(''); }}
                placeholder="Enter PIN (e.g. risika2026)"
                autoFocus
                className="owner-input-field"
              />
              <button
                type="button"
                className="owner-pin-toggle"
                onClick={() => setShowPin(!showPin)}
                title={showPin ? "Hide PIN" : "Show PIN"}
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && (
              <p style={{ color: '#E53E3E', fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 500 }}>
                {error}
              </p>
            )}
          </div>

          <div className="owner-pin-hint-box">
            <ShieldCheck size={16} color="var(--text-gold)" style={{ flexShrink: 0 }} />
            <div>
              {ownerPin === 'risika2026' ? (
                <>
                  <span>Default Owner PIN: <strong>risika2026</strong></span>
                  <button 
                    type="button" 
                    onClick={handleQuickFill}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-gold)',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      marginLeft: '0.5rem',
                      fontWeight: 600
                    }}
                  >
                    (Auto-Fill)
                  </button>
                </>
              ) : (
                <span>
                  🔒 <strong>Custom Owner PIN is active</strong> (Use your private password)
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline btn-md" style={{ flex: 1 }} onClick={closeOwnerLogin}>
              Cancel
            </button>
            <button type="submit" className="btn btn-gold btn-md" style={{ flex: 2 }}>
              <Lock size={15} /> Verify & Access
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
