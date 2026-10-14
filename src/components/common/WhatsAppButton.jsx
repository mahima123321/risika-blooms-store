import React, { useState } from 'react';
import { MessageCircle, Sparkles, X } from 'lucide-react';
import { createWhatsAppUrl } from '../../config/whatsapp';

export default function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(true);

  const handleClick = () => {
    const url = createWhatsAppUrl("Hello RISIKA BLOOMS Concierge! I need assistance with selecting and ordering flowers.");
    window.open(url, '_blank');
  };

  return (
    <div className="floating-whatsapp-widget">
      {showTooltip && (
        <div className="floating-whatsapp-tooltip" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>💬 Chat with Florist Concierge</span>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
            style={{ color: 'var(--text-muted)', pointerEvents: 'auto', background: 'none' }}
          >
            <X size={12} />
          </button>
        </div>
      )}

      <button 
        className="floating-whatsapp-btn"
        onClick={handleClick}
        aria-label="Chat on WhatsApp"
        title="Chat with our Master Florist on WhatsApp"
      >
        <MessageCircle size={28} />
      </button>
    </div>
  );
}
