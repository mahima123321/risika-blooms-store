import React from 'react';
import { useShop } from '../../context/ShopContext';
import { CATEGORIES } from '../../data/categories';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CategoryGrid() {
  const { language, t, navigateTo, categories } = useShop();
  const allCategories = categories || CATEGORIES;

  return (
    <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-pretitle">
            The Botanical Collections
          </span>
          <h2 className="section-title">
            Shop by Category
          </h2>
          <div className="floral-divider">
            <span className="floral-divider-line"></span>
            <span className="floral-divider-icon">🌸</span>
            <span className="floral-divider-line"></span>
          </div>
          <p className="section-subtitle">
            From classic velvety red roses and playful teddy bouquets to opulent money fans and auspicious jhalars.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="category-grid">
          {allCategories.map((cat) => (
            <div 
              key={cat.id} 
              className="category-card"
              onClick={() => navigateTo('category', { categorySlug: cat.slug })}
            >
              <img 
                src={cat.image} 
                alt={cat.name} 
                className="category-card-img" 
                loading="lazy"
              />
              <div className="category-card-overlay">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {cat.itemCount}
                </span>
                <h3 className="category-card-name">
                  {cat.name}
                </h3>
                <div className="category-card-meta">
                  <span>{cat.tagline}</span>
                  <ArrowRight size={14} color="var(--rb-gold-400)" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
