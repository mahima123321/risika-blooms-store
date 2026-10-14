import React from 'react';
import { useShop } from '../context/ShopContext';
import { CATEGORIES } from '../data/categories';
import { PRODUCTS } from '../data/products';
import ProductCard from '../components/common/ProductCard';
import { ChevronRight, Sparkles, ArrowLeft, Plus } from 'lucide-react';

export default function CategoryPage() {
  const { 
    currentView, language, navigateTo, 
    products, isOwnerAuthenticated, openAddProductModal 
  } = useShop();
  const slug = currentView.params?.categorySlug;

  const category = CATEGORIES.find((c) => c.slug === slug) || CATEGORIES[0];
  const allProducts = products || PRODUCTS;
  const categoryProducts = allProducts.filter((p) => p.category === category.slug);

  return (
    <div className="category-page animate-fade-in" style={{ paddingBottom: '6rem', backgroundColor: 'var(--bg-primary)' }}>
      {/* Category Banner Hero */}
      <div 
        style={{
          position: 'relative',
          height: '340px',
          backgroundImage: `linear-gradient(rgba(18, 8, 11, 0.55), rgba(18, 8, 11, 0.85)), url(${category.bannerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          textAlign: 'center',
          marginBottom: '3.5rem'
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1rem' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => navigateTo('home')}>Home</span>
            <ChevronRight size={14} />
            <span style={{ cursor: 'pointer' }} onClick={() => navigateTo('shop')}>Categories</span>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--text-gold)', fontWeight: 600 }}>{category.name}</span>
          </div>

          <span className="gold-badge" style={{ marginBottom: '0.75rem' }}>
            <Sparkles size={12} /> {category.itemCount}
          </span>

          <h1 className="font-serif-editorial" style={{ fontSize: '3.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            {language === 'hi' ? category.nameHindi : category.name}
          </h1>

          <p style={{ maxWidth: '650px', margin: '0 auto', fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
            {category.description}
          </p>
        </div>
      </div>

      {/* Products in Category */}
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => navigateTo('shop')}
          >
            <ArrowLeft size={14} />
            <span>Back to All Collections</span>
          </button>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {isOwnerAuthenticated && (
              <button 
                className="btn btn-gold btn-sm"
                onClick={() => openAddProductModal(category.slug)}
                title={`Add a new bouquet to ${category.name}`}
              >
                <Plus size={14} />
                <span>Add Bouquet Here (नया बुके जोड़ें)</span>
              </button>
            )}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {categoryProducts.length} Exclusive Styles
            </span>
          </div>
        </div>

        {categoryProducts.length === 0 ? (
          <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <p>New artisanal styles for this collection are arriving shortly.</p>
          </div>
        ) : (
          <div className="products-grid">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
