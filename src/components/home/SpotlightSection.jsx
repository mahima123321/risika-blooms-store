import React from 'react';
import { useShop } from '../../context/ShopContext';
import { Sparkles, ArrowRight, Heart, Star } from 'lucide-react';

export default function SpotlightSection() {
  const { navigateTo } = useShop();

  return (
    <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-pretitle">The Trendsetters</span>
          <h2 className="section-title">Handmade Velvet Lilies & Korean Aesthetics</h2>
          <div className="floral-divider">
            <span className="floral-divider-line"></span>
            <span className="floral-divider-icon">🎀</span>
            <span className="floral-divider-line"></span>
          </div>
          <p className="section-subtitle">
            Our most viral signatures: handcrafted plush velvet lilies with pearl beaded stamens, fluffy chenille lavender, and pleated organza tutu collars.
          </p>
        </div>

        <div className="spotlight-grid">
          {/* Spotlight 1: Korean Velvet Trio Bouquet */}
          <div className="glass-panel" style={{
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="rose-badge"><Sparkles size={12} /> Seoul Velvet Craft</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-gold)', fontWeight: 700 }}>Starting ₹1,399</span>
              </div>

              <h3 className="font-serif-editorial" style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Seoul Royal Velvet Lily & Lavender
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Sculpted wine, pink, and yellow velvet lilies with beaded stamens, paired with purple chenille lavender and a white pleated pearl-edge organza collar.
              </p>
            </div>

            <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '280px', marginBottom: '1.5rem' }}>
              <img 
                src="/images/velvet_trio_lavender.jpg" 
                alt="Korean Style Velvet Lily Bouquet" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <button 
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => navigateTo('product', { productSlug: 'seoul-royal-velvet-lily-lavender-symphony' })}
            >
              <span>View Velvet Lily Symphony</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Spotlight 2: Single Velvet Rouge Cone */}
          <div className="glass-panel" style={{
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="gold-badge"><Heart size={12} /> Minimalist Cone</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-gold)', fontWeight: 700 }}>Only ₹499</span>
              </div>

              <h3 className="font-serif-editorial" style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Velvet Rouge Lily Monogram Cone
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Single rich burgundy wine velvet lily wrapped in white structured paper with metallic gold foil borders, tied with a deep wine satin ribbon bow.
              </p>
            </div>

            <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '280px', marginBottom: '1.5rem' }}>
              <img 
                src="/images/velvet_single_lily.jpg" 
                alt="Single Velvet Lily Cone Bouquet" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <button 
              className="btn btn-gold"
              style={{ width: '100%' }}
              onClick={() => navigateTo('product', { productSlug: 'velvet-rouge-lily-monogram-cone' })}
            >
              <span>Order Velvet Single Cone (₹499)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
