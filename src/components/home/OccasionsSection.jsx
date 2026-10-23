import React from 'react';
import { useShop } from '../../context/ShopContext';
import { OCCASIONS } from '../../data/products';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function OccasionsSection() {
  const { language, navigateTo } = useShop();

  return (
    <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-pretitle">Celebrate Life</span>
          <h2 className="section-title">Shop by Occasion</h2>
          <div className="floral-divider">
            <span className="floral-divider-line"></span>
            <span className="floral-divider-icon">🎁</span>
            <span className="floral-divider-line"></span>
          </div>
          <p className="section-subtitle">
            Curated floral stylings and surprise boxes specifically orchestrated for milestone moments.
          </p>
        </div>

        <div className="occasions-grid">
          {OCCASIONS.map((occ) => (
            <div
              key={occ.id}
              className="glass-panel"
              onClick={() => navigateTo('shop', { occasion: occ.id })}
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all var(--transition-smooth)',
                position: 'relative',
                border: '1px solid var(--border-light)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = 'var(--border-gold)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-light)';
              }}
            >
              <div style={{ height: '150px', overflow: 'hidden' }}>
                <img 
                  src={occ.image} 
                  alt={occ.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  loading="lazy"
                />
              </div>
              <div style={{ padding: '1rem 0.75rem' }}>
                <h4 className="font-serif-editorial" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {language === 'hi' ? occ.nameHindi : occ.name}
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-accent)', fontWeight: 600 }}>
                  View Gifts &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
