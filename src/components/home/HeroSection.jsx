import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { Sparkles, ShoppingBag, ArrowRight, MessageCircle, Clock, Truck, ShieldCheck, Star, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { createWhatsAppUrl } from '../../config/whatsapp';

const FEATURED_HERO_SLIDES = [
  {
    id: "velvet-bday-royal-blue-tulip-lily-card",
    title: "Royal Azure Velvet Tulip & Lily Card Bouquet",
    subtitle: "Handcrafted with Pearl Lace & 'Happy Birthday' Calligraphy",
    price: 1399,
    originalPrice: 1799,
    tag: "Viral Bestseller",
    image: "/images/bday_royal_blue_tulip_lily_card.jpg",
    slug: "royal-azure-happy-birthday-velvet-tulip-lily-card-bouquet"
  },
  {
    id: "velvet-trio-lavender",
    title: "Lavender Dream Sculpted Velvet Keepsake",
    subtitle: "Soft Pastel Lilac Tulips with Frosted Mesh Korean Wrap",
    price: 1299,
    originalPrice: 1699,
    tag: "Trending Luxury",
    image: "/images/velvet_trio_lavender.jpg",
    slug: "lavender-dream-velvet-keepsake-bouquet"
  },
  {
    id: "velvet-bday-silent-confession-midnight-blue",
    title: "'Silent Confession' Midnight Blue Birthday Velvet",
    subtitle: "Deep Cobalt Velvet Stems with Premium Greeting Calligraphy",
    price: 1349,
    originalPrice: 1749,
    tag: "Midnight Exclusive",
    image: "/images/bday_silent_confession_midnight_blue.jpg",
    slug: "silent-confession-midnight-blue-birthday-velvet-bouquet"
  },
  {
    id: "velvet-bday-daisy-pink-lily-wrap",
    title: "Enchanted Garden Velvet Lily & Daisy Bouquet",
    subtitle: "Pearl Beaded Trim, Pink Velvet Lily & Lemon Daisy",
    price: 1299,
    originalPrice: 1699,
    tag: "Artisan Choice",
    image: "/images/bday_daisy_pink_lily_wrap.jpg",
    slug: "enchanted-garden-velvet-lily-daisy-bouquet"
  }
];

export default function HeroSection() {
  const { language, t, navigateTo } = useShop();
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % FEATURED_HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = FEATURED_HERO_SLIDES[activeSlide];

  const handleWhatsAppInquiry = () => {
    const url = createWhatsAppUrl("Hello ROSHIKA BLOOMS! I'd like to consult with a master florist for a luxury handcrafted bouquet delivery.");
    window.open(url, '_blank');
  };

  return (
    <section className="hero-section">
      <div className="container hero-grid">
        {/* Left Column: Hero Editorial Copy */}
        <div>
          <div className="hero-subtitle-pill">
            <Sparkles size={14} />
            <span>Luxury Handcrafted Floral Atelier • Never Wilts</span>
          </div>

          <h1 className="hero-title">
            Make Every Moment <em>Bloom</em> with Splendour.
          </h1>

          <p className="hero-description">
            {language === 'hi'
              ? "डच गुलाब, वायरल हैंडक्राफ्टेड वेलवेट बुके, कोरियन फ्रॉस्टेड रैप्स, टेडी कॉम्बो और मनमोहक गिफ्ट हैंपर्स। उसी दिन व मध्यरात्रि एक्सप्रेस डिलीवरी।"
              : "Discover viral handcrafted velvet floral keepsakes, Seoul-inspired frosted mesh wraps, Ecuadorian roses, and bespoke gift hampers crafted to create timeless memories."
            }
          </p>

          {/* Social Proof Counter */}
          <div className="hero-rating-strip" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.75rem', background: 'var(--bg-accent-soft)', padding: '0.45rem 1rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-gold)' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
              ))}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              4.9 / 5.0 Rating
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              (2,850+ Verified Gifting Celebrations)
            </span>
          </div>

          <div className="hero-cta-group">
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => navigateTo('shop')}
            >
              <ShoppingBag size={18} />
              <span>{t('exploreCollection')}</span>
              <ArrowRight size={16} />
            </button>

            <button 
              className="btn btn-gold btn-lg"
              onClick={() => navigateTo('build-bouquet')}
            >
              <Sparkles size={18} />
              <span>{t('buildBouquet')}</span>
            </button>

            <button 
              className="btn btn-whatsapp btn-lg"
              onClick={handleWhatsAppInquiry}
            >
              <MessageCircle size={18} />
              <span>{t('orderWhatsApp')}</span>
            </button>
          </div>

          {/* Value Pillars */}
          <div className="hero-guarantees">
            <div className="hero-guarantee-item">
              <div className="hero-guarantee-icon">
                <Truck size={16} />
              </div>
              <div>
                <strong>Same-Day Dispatch</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Order by 7:00 PM</p>
              </div>
            </div>

            <div className="hero-guarantee-item">
              <div className="hero-guarantee-icon">
                <Clock size={16} />
              </div>
              <div>
                <strong>Midnight Surprise</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>11:15 PM – 12:00 AM</p>
              </div>
            </div>

            <div className="hero-guarantee-item">
              <div className="hero-guarantee-icon">
                <ShieldCheck size={16} />
              </div>
              <div>
                <strong>Forever Keepsake</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Never Wilts Guarantee</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Showcase Visual Carousel */}
        <div className="hero-visual-container">
          <div 
            className="hero-main-image-card"
            onClick={() => navigateTo('product', { productSlug: currentSlide.slug })}
            style={{ cursor: 'pointer' }}
          >
            <img 
              src={currentSlide.image} 
              alt={currentSlide.title}
              className="hero-main-image animate-fade-in"
              key={currentSlide.id}
            />

            {/* Slider Navigation Arrows */}
            <button 
              type="button"
              className="hero-slider-arrow hero-slider-prev"
              onClick={(e) => {
                e.stopPropagation();
                setActiveSlide((prev) => (prev - 1 + FEATURED_HERO_SLIDES.length) % FEATURED_HERO_SLIDES.length);
              }}
              title="Previous creation"
              aria-label="Previous creation"
            >
              <ChevronLeft size={18} />
            </button>

            <button 
              type="button"
              className="hero-slider-arrow hero-slider-next"
              onClick={(e) => {
                e.stopPropagation();
                setActiveSlide((prev) => (prev + 1) % FEATURED_HERO_SLIDES.length);
              }}
              title="Next creation"
              aria-label="Next creation"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Floating Badge Top */}
          <div className="hero-badge-top">
            <Sparkles size={15} />
            <span>✨ {currentSlide.tag}</span>
          </div>

          {/* Floating Badge Bottom with Price & Quick View */}
          <div 
            className="hero-floating-badge"
            onClick={() => navigateTo('product', { productSlug: currentSlide.slug })}
            style={{ cursor: 'pointer' }}
          >
            <div className="hero-floating-badge-icon">🌸</div>
            <div className="hero-floating-badge-text">
              <h5 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {currentSlide.title}
              </h5>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-accent)' }}>
                  ₹{currentSlide.price}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  ₹{currentSlide.originalPrice}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-gold)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <Eye size={11} /> View Details
                </span>
              </div>
            </div>
          </div>

          {/* Slide Indicator Dots */}
          <div className="hero-dots-indicator">
            {FEATURED_HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                className={`hero-dot ${idx === activeSlide ? 'active' : ''}`}
                onClick={() => setActiveSlide(idx)}
                title={slide.title}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
