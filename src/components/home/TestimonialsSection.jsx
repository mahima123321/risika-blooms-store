import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Radhika Mehra",
      location: "South Delhi",
      occasion: "10th Wedding Anniversary",
      quote: "The Crimson Velvet bouquet arrived at exactly 12:00 AM on our anniversary night. The roses were velvety, huge and had an intoxicating fragrance. The packaging felt like Paris!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Vikramaditya Rao",
      location: "Bandra, Mumbai",
      occasion: "Birthday Surprise",
      quote: "I customized a Korean cloud hydrangea bouquet via WhatsApp. The florist concierge was extraordinarily courteous and shared real photos before dispatch. Flawless experience!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Dr. Ananya Sen",
      location: "Indiranagar, Bengaluru",
      occasion: "Sister's Baby Shower",
      quote: "The teddy combo and pastel blush flowers were so cute and meticulously crafted. You can immediately tell the difference between ordinary roadside florists and RISIKA BLOOMS.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    }
  ];

  return (
    <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-pretitle">Patron Stories</span>
          <h2 className="section-title">What Our Clients Say</h2>
          <div className="floral-divider">
            <span className="floral-divider-line"></span>
            <span className="floral-divider-icon">🌟</span>
            <span className="floral-divider-line"></span>
          </div>
          <p className="section-subtitle">
            Curated client experiences & feedback. (Customer demo reviews — live photo reviews appear on product details).
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, idx) => (
            <div 
              key={idx}
              className="glass-panel"
              style={{
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <Quote 
                size={36} 
                style={{ position: 'absolute', top: '20px', right: '20px', opacity: 0.15, color: 'var(--text-gold)' }} 
              />

              <div>
                <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '1rem' }}>
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>

                <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  "{t.quote}"
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <img 
                  src={t.avatar} 
                  alt={t.name}
                  style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-full)', objectFit: 'cover', border: '2px solid var(--border-gold)' }}
                />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {t.name}
                    <CheckCircle2 size={13} color="#16A34A" />
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {t.location} • <span style={{ color: 'var(--text-accent)' }}>{t.occasion}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
