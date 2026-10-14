import React from 'react';
import { useShop } from '../../context/ShopContext';
import { ArrowRight, Tag, Gem, Gift, Sparkles } from 'lucide-react';

export default function BudgetBar() {
  const { navigateTo } = useShop();

  const budgetOptions = [
    { label: "Under ₹499", bracket: "under-499", desc: "Petite Bunches & Minis", icon: "🌱", color: "#E8F5E9" },
    { label: "Under ₹999", bracket: "under-999", desc: "Classic Roses & Daisies", icon: "💐", color: "#FFF3E0" },
    { label: "Under ₹1,499", bracket: "under-1499", desc: "Korean Wraps & Combos", icon: "✨", color: "#FCE4EC" },
    { label: "Luxury ₹2,499+", bracket: "luxury-2499", desc: "Grand Royale & 50 Roses", icon: "👑", color: "#F3E5F5" }
  ];

  const handleBudgetClick = (bracket) => {
    navigateTo('shop', { budgetBracket: bracket });
  };

  return (
    <section style={{ padding: '4rem 0', backgroundColor: 'var(--bg-alt)' }}>
      <div className="container">
        <div className="section-header" style={{ marginBottom: '2rem' }}>
          <span className="section-pretitle">Effortless Gifting</span>
          <h2 className="section-title">Shop by Budget</h2>
          <div className="floral-divider">
            <span className="floral-divider-line"></span>
            <span className="floral-divider-icon">💰</span>
            <span className="floral-divider-line"></span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem'
        }}>
          {budgetOptions.map((opt) => (
            <div
              key={opt.bracket}
              className="glass-panel"
              onClick={() => handleBudgetClick(opt.bracket)}
              style={{
                padding: '1.8rem',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all var(--transition-normal)',
                border: '1.5px solid var(--border-light)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-gold)';
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontSize: '2.4rem', marginBottom: '0.75rem' }}>
                {opt.icon}
              </div>
              <h3 className="font-serif-editorial" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                {opt.label}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {opt.desc}
              </p>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-accent)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                Explore Gifts <ArrowRight size={13} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
