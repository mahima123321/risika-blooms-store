import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { PRODUCTS } from '../../data/products';
import ProductCard from '../common/ProductCard';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CuratedTabs() {
  const { t, navigateTo, products, language } = useShop();
  const [activeTab, setActiveTab] = useState('trending');

  const allProducts = products || PRODUCTS;
  const filteredProducts = allProducts.filter((p) => {
    if (activeTab === 'trending') return p.isTrending;
    if (activeTab === 'bestsellers') return p.isBestSeller;
    if (activeTab === 'premium') return p.isPremium;
    if (activeTab === 'new') return p.price > 1200;
    return true;
  });

  return (
    <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-alt)' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-pretitle">
            Handpicked Masterpieces
          </span>
          <h2 className="section-title">
            Curated Floral Wonders
          </h2>
          <div className="floral-divider">
            <span className="floral-divider-line"></span>
            <span className="floral-divider-icon">✨</span>
            <span className="floral-divider-line"></span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="filter-tabs">
          <button 
            className={`filter-tab-btn ${activeTab === 'trending' ? 'active' : ''}`}
            onClick={() => setActiveTab('trending')}
          >
            🔥 {t('trendingNow')}
          </button>

          <button 
            className={`filter-tab-btn ${activeTab === 'bestsellers' ? 'active' : ''}`}
            onClick={() => setActiveTab('bestsellers')}
          >
            👑 {t('bestSellers')}
          </button>

          <button 
            className={`filter-tab-btn ${activeTab === 'premium' ? 'active' : ''}`}
            onClick={() => setActiveTab('premium')}
          >
            💎 {t('premiumCollection')}
          </button>

          <button 
            className={`filter-tab-btn ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => setActiveTab('new')}
          >
            🌿 {t('newArrivals')}
          </button>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {filteredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All CTA */}
        <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
          <button 
            className="btn btn-outline btn-lg"
            onClick={() => navigateTo('shop')}
          >
            <span>Explore All 200+ Floral Creations</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
