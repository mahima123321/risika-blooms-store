import React from 'react';
import { useShop } from '../context/ShopContext';
import { BRAND_CONFIG } from '../config/brand';
import { Sparkles, Heart, Award, ShieldCheck, Truck, ArrowRight, ArrowLeft, ChevronRight, Mail } from 'lucide-react';

export default function AboutPage() {
  const { language, navigateTo, brandConfig } = useShop();

  return (
    <div className="about-page animate-fade-in" style={{ padding: '2rem 0 6rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Breadcrumb Back Bar */}
        <div className="product-detail-breadcrumbs" style={{ marginBottom: '1.25rem', borderRadius: 'var(--radius-sm)' }}>
          <button 
            type="button" 
            className="breadcrumb-back-btn"
            onClick={() => navigateTo('home')}
            title="Back to Home"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
          <div className="breadcrumb-trail">
            <span className="breadcrumb-link" onClick={() => navigateTo('home')}>Home</span>
            <ChevronRight size={12} className="breadcrumb-sep" />
            <span className="breadcrumb-active">About Atelier</span>
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="section-pretitle">The Atelier Story</span>
          <h1 className="font-serif-editorial" style={{ fontSize: '2.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            About {brandConfig?.name || BRAND_CONFIG.name}
          </h1>
          <p className="font-script" style={{ fontSize: '1.8rem', color: 'var(--text-accent)' }}>
            "{brandConfig?.tagline || BRAND_CONFIG.tagline}"
          </p>
          <div className="floral-divider">
            <span className="floral-divider-line"></span>
            <span className="floral-divider-icon">🌸</span>
            <span className="floral-divider-line"></span>
          </div>
        </div>

        {/* Narrative Split 1 */}
        <div className="about-split-grid" style={{ alignItems: 'center', marginBottom: '4rem' }}>
          <div>
            <span className="gold-badge" style={{ marginBottom: '1rem' }}>Our Heritage</span>
            <h2 className="font-serif-editorial" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              Where Emotion Meets Botanical Haute Couture
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem', fontSize: '1rem' }}>
              Founded with the conviction that flowers are nature's most eloquent poetry, <strong>RISHIKA BLOOMS</strong> (also celebrated as <strong>Rishhika Bloom</strong>) was born to elevate gifting into an art form. We rejected mass-produced, tired roadside bouquets wrapped in flimsy plastic in favour of bespoke luxury aesthetics.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1rem' }}>
              Every rose petal, lily blossom, and hydrangea cloud is hand-selected from sustainable, ethical greenhouses in the Netherlands, Ecuador, and the misty hills of the Nilgiris.
            </p>
          </div>

          <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '2px solid var(--border-light)' }}>
            <img 
              src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80" 
              alt="Floral Atelier" 
              style={{ width: '100%', height: '420px', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Three Core Pillars */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          marginBottom: '5rem'
        }}>
          <div className="glass-panel" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-full)', background: 'var(--bg-accent-soft)', color: 'var(--text-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <Sparkles size={26} />
            </div>
            <h3 className="font-serif-editorial" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              100% Farm-To-Door
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Our cold-chain logistics ensure your blooms arrive with stems fully hydrated and petals crisp, guaranteeing up to 7 days of vase life.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-full)', background: 'var(--bg-accent-soft)', color: 'var(--text-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <Award size={26} />
            </div>
            <h3 className="font-serif-editorial" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Korean & European Guild
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Our certified master florists study international avant-garde folding, layered frosted paper sculpting, and ribbon calligraphy.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-full)', background: 'var(--bg-accent-soft)', color: 'var(--text-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <ShieldCheck size={26} />
            </div>
            <h3 className="font-serif-editorial" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Concierge Touch
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              We share real high-definition photographs of your arrangement prior to dispatch and confirm midnight arrivals personally.
            </p>
          </div>
        </div>

        {/* Founder Quote & CTA */}
        <div className="glass-panel" style={{
          padding: '3.5rem',
          textAlign: 'center',
          maxWidth: '850px',
          margin: '0 auto',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-accent-soft) 100%)',
          border: '2px solid var(--border-gold)'
        }}>
          <p className="font-serif-editorial" style={{ fontSize: '1.5rem', fontStyle: 'italic', lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            "When words fall short, the language of freshly unfurled petals speaks with timeless grace. Every bouquet we wrap carries someone's heartfelt devotion, apology, or joy."
          </p>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-gold)', letterSpacing: '0.05em' }}>
            ROSHIKA BLOOMS FLORAL ATELIER
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            New Delhi • Mumbai • Bengaluru
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigateTo('shop')}>
              <span>Explore The Collection</span>
              <ArrowRight size={16} />
            </button>
            <button className="btn btn-outline" onClick={() => navigateTo('contact')}>
              <Mail size={16} />
              <span>Contact Atelier</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
