import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Lock, Eye, EyeOff, X, Sparkles, ShieldCheck, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';

export default function OwnerLoginModal() {
  const { isOwnerLoginModalOpen, closeOwnerLogin, loginAsOwner } = useShop();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  if (!isOwnerLoginModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Please enter Security PIN');
      triggerShake();
      return;
    }
    const res = loginAsOwner(pin);
    if (!res.success) {
      setError(res.error || 'Incorrect Security PIN');
      triggerShake();
    } else {
      setPin('');
      setError('');
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleQuickFill = () => {
    setPin('risika2026');
    setError('');
  };

  return (
    <div className="drawer-backdrop open owner-native-backdrop" onClick={closeOwnerLogin}>
      <div 
        className={`owner-native-card ${isShaking ? 'shake-animation' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Sheet Handle */}
        <div className="owner-native-sheet-handle" />

        {/* Close Button */}
        <button 
          type="button" 
          className="owner-native-close-btn" 
          onClick={closeOwnerLogin} 
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header with Security Crest */}
        <div className="owner-native-header">
          <div className="owner-native-crest">
            <div className="owner-native-crest-inner">
              <KeyRound size={26} color="#D4AF37" />
            </div>
            <div className="owner-native-crest-glow" />
          </div>

          <div className="owner-native-badge">
            <Sparkles size={11} color="#D4AF37" />
            <span>RISHIKA BLOOMS • OWNER STUDIO</span>
          </div>

          <h2 className="owner-native-title">
            Store Owner Studio
          </h2>
          <p className="owner-native-subtitle">
            This administrative portal is exclusively for the store administrator. Enter your security PIN to manage bouquets, catalog headings, and store configurations.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="owner-native-form">
          <div className="owner-native-input-group">
            <label className="owner-native-input-label">
              <span>Security Passcode</span>
              <button 
                type="button" 
                className="owner-native-hint-btn" 
                onClick={handleQuickFill}
                title="Auto-fill default PIN"
              >
                (Auto-Fill: risika2026)
              </button>
            </label>

            <div className="owner-native-input-wrapper">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => { setPin(e.target.value); setError(''); }}
                placeholder="Enter PIN (e.g. risika2026)"
                autoFocus
                inputMode="text"
                autoComplete="current-password"
                className="owner-native-input"
              />
              <button
                type="button"
                className="owner-native-toggle-btn"
                onClick={() => setShowPin(!showPin)}
                title={showPin ? "Hide Passcode" : "Show Passcode"}
                aria-label="Toggle password visibility"
              >
                {showPin ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            {error && (
              <div className="owner-native-error">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Action Buttons: Full-width Phone First Stack */}
          <div className="owner-native-actions">
            <button type="submit" className="owner-native-submit-btn">
              <ShieldCheck size={18} />
              <span>Verify & Unlock Studio</span>
              <ArrowRight size={17} />
            </button>

            <button type="button" className="owner-native-cancel-btn" onClick={closeOwnerLogin}>
              Cancel & Return to Store
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
