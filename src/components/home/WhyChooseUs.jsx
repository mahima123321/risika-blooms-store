import React from 'react';
import { Truck, ShieldCheck, Sparkles, Clock, Heart, Award } from 'lucide-react';

export default function WhyChooseUs() {
  const features = [
    {
      icon: Sparkles,
      title: "100% Farm-Fresh Guarantee",
      desc: "Harvested at dawn from certified Dutch & Indian greenhouses. Kept in temperature-controlled chill chains to guarantee 5+ days vase life."
    },
    {
      icon: Award,
      title: "Master Florist Artistry",
      desc: "Each bouquet is hand-sculpted by certified floral designers following European and Korean high-couture folding techniques."
    },
    {
      icon: Clock,
      title: "Punctual Midnight Delivery",
      desc: "We deliver between 11:15 PM and 12:00 AM so your midnight birthday or anniversary surprise is timed to perfection."
    },
    {
      icon: ShieldCheck,
      title: "Luxury Safe Transit Boxes",
      desc: "Custom water-reservoir hydration stems and reinforced hard-box containers prevent any petal bruising or damage."
    }
  ];

  return (
    <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-pretitle">The Excellence Standard</span>
          <h2 className="section-title">The RISHIKA BLOOMS Promise</h2>
          <div className="floral-divider">
            <span className="floral-divider-line"></span>
            <span className="floral-divider-icon">👑</span>
            <span className="floral-divider-line"></span>
          </div>
        </div>

        <div className="why-choose-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem'
        }}>
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className="glass-panel"
                style={{
                  padding: '2.2rem 1.8rem',
                  textAlign: 'center',
                  transition: 'all var(--transition-normal)'
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
                <div 
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-accent-soft)',
                    color: 'var(--text-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem auto',
                    border: '1px solid var(--border-gold)'
                  }}
                >
                  <Icon size={26} />
                </div>
                <h3 className="font-serif-editorial" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
