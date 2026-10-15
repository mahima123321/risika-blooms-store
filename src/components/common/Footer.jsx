import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { CATEGORIES } from '../../data/categories';
import { BRAND_CONFIG } from '../../config/brand';
import { createWhatsAppUrl } from '../../config/whatsapp';
import { 
  Heart, Sparkles, MessageCircle, Mail, MapPin, 
  Phone, Clock, ShieldCheck, Truck, Award, CheckCircle2 
} from 'lucide-react';

export default function Footer() {
  const { 
    language, t, navigateTo, showToast,
    isOwnerAuthenticated, openOwnerLogin, openAddProductModal,
    openOwnerSettingsModal, brandConfig
  } = useShop();
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    setSubscribed(true);
    showToast('🎉 Welcome to the Bloom Concierge Club! Use coupon "BLOOM10" for 10% off.');
    setEmailInput('');
  };

  const handleWhatsAppChat = () => {
    const url = createWhatsAppUrl("Hello RISHIKA BLOOMS concierge! I have a question regarding floral gifting.");
    window.open(url, '_blank');
  };

  return (
    <footer className="site-footer">
      <div className="container">
        {/* Top Trust Banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          paddingBottom: '3.5rem',
          marginBottom: '3.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="hero-guarantee-icon" style={{ width: '46px', height: '46px', background: 'rgba(212, 175, 55, 0.15)', color: '#F9E79F' }}>
              <Truck size={22} />
            </div>
            <div>
              <h4 style={{ color: '#FDF6E2', fontSize: '0.95rem', fontWeight: 700 }}>Express Delivery</h4>
              <p style={{ color: '#C2AEB4', fontSize: '0.8rem' }}>Same-day & Midnight slots</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="hero-guarantee-icon" style={{ width: '46px', height: '46px', background: 'rgba(212, 175, 55, 0.15)', color: '#F9E79F' }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h4 style={{ color: '#FDF6E2', fontSize: '0.95rem', fontWeight: 700 }}>100% Farm-Fresh</h4>
              <p style={{ color: '#C2AEB4', fontSize: '0.8rem' }}>Hand-picked daily blooms</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="hero-guarantee-icon" style={{ width: '46px', height: '46px', background: 'rgba(212, 175, 55, 0.15)', color: '#F9E79F' }}>
              <Award size={22} />
            </div>
            <div>
              <h4 style={{ color: '#FDF6E2', fontSize: '0.95rem', fontWeight: 700 }}>Artisan Florists</h4>
              <p style={{ color: '#C2AEB4', fontSize: '0.8rem' }}>Hand-wrapped luxury aesthetics</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="hero-guarantee-icon" style={{ width: '46px', height: '46px', background: 'rgba(212, 175, 55, 0.15)', color: '#F9E79F' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 style={{ color: '#FDF6E2', fontSize: '0.95rem', fontWeight: 700 }}>Order Assurance</h4>
              <p style={{ color: '#C2AEB4', fontSize: '0.8rem' }}>100% Satisfaction guarantee</p>
            </div>
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="footer-grid">
          {/* Col 1: Brand Story & Concierge */}
          <div>
            <h3 className="footer-brand-title">{brandConfig?.name || BRAND_CONFIG.name}</h3>
            <p className="footer-tagline">
              "{language === 'hi' ? (brandConfig?.taglineHindi || BRAND_CONFIG.taglineHindi) : (brandConfig?.tagline || BRAND_CONFIG.tagline)}"
            </p>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: '#C2AEB4', marginBottom: '1.5rem' }}>
              India's premier luxury floral atelier, curating fresh exotic blossoms, Korean-style wraps, bespoke teddy bouquets, and artisanal hampers for life's most unforgettable celebrations.
            </p>

            <button 
              className="btn btn-whatsapp btn-sm"
              onClick={handleWhatsAppChat}
              style={{ display: 'inline-flex', marginBottom: '1rem' }}
            >
              <MessageCircle size={16} />
              <span>WhatsApp Concierge (24/7)</span>
            </button>
          </div>

          {/* Col 2: Luxury Collections */}
          <div>
            <h4 className="footer-col-title">Floral Collections</h4>
            <ul className="footer-links-list">
              {CATEGORIES.slice(0, 7).map((cat) => (
                <li 
                  key={cat.id} 
                  className="footer-link"
                  onClick={() => navigateTo('category', { categorySlug: cat.slug })}
                >
                  {language === 'hi' ? cat.nameHindi : cat.name}
                </li>
              ))}
              <li 
                className="footer-link" 
                style={{ color: '#F9E79F', fontWeight: 600 }}
                onClick={() => navigateTo('shop')}
              >
                View All Collections &rarr;
              </li>
            </ul>
          </div>

          {/* Col 3: Bespoke Services */}
          <div>
            <h4 className="footer-col-title">Bespoke Studio</h4>
            <ul className="footer-links-list">
              <li className="footer-link" onClick={() => navigateTo('build-bouquet')}>
                ✨ Build Your Own Bouquet
              </li>
              <li className="footer-link" onClick={() => navigateTo('gift-combos')}>
                🎁 Gift Combo Builder
              </li>
              <li className="footer-link" onClick={() => navigateTo('surprise-finder')}>
                🔍 Surprise Gift Finder
              </li>
              <li className="footer-link" onClick={() => navigateTo('delivery-info')}>
                🚚 Delivery & PIN Coverage
              </li>
              <li className="footer-link" onClick={() => navigateTo('about')}>
                🌸 Our Heritage & Masters
              </li>
              <li className="footer-link" onClick={() => navigateTo('contact')}>
                📍 Atelier Location & FAQ
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter & Club */}
          <div>
            <h4 className="footer-col-title">{t('newsletterTitle')}</h4>
            <p style={{ fontSize: '0.85rem', color: '#C2AEB4', marginBottom: '1.2rem', lineHeight: 1.5 }}>
              {t('newsletterSub')}
            </p>

            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
              <input 
                type="email"
                placeholder="Enter your email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <button type="submit" className="btn btn-gold btn-sm">
                Join
              </button>
            </form>

            <div style={{ fontSize: '0.82rem', color: '#C2AEB4', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={14} color="#F9E79F" />
                <span>Delhi NCR, Mumbai, Bengaluru & Pan-India Express</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={14} color="#F9E79F" />
                <span>Midnight Delivery: 11:15 PM – 12:00 AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Copyright */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {brandConfig?.name || BRAND_CONFIG.name}. All rights reserved. Handcrafted with passion in India.</p>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <span className="footer-link" onClick={() => navigateTo('delivery-info')}>{t('deliveryInfo')}</span>
            <span className="footer-link" onClick={() => navigateTo('privacy')}>{t('privacyPolicy')}</span>
            <span className="footer-link" onClick={() => navigateTo('terms')}>{t('terms')}</span>
            <span 
              className="footer-link owner-footer-link" 
              onClick={() => isOwnerAuthenticated ? openOwnerSettingsModal('numbers') : openOwnerLogin()}
              style={{ color: '#F9E79F', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
            >
              👑 Owner Portal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
