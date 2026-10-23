import React from 'react';
import { useShop } from '../context/ShopContext';
import { CATEGORIES } from '../data/categories';
import { PRODUCTS } from '../data/products';
import ProductCard from '../components/common/ProductCard';
import { ChevronRight, Sparkles, ArrowLeft, Plus, Trash2 } from 'lucide-react';

export default function CategoryPage({ overrideCategory }) {
  const { 
    currentView, language, navigateTo, 
    products, categories, isOwnerAuthenticated, openAddProductModal,
    deleteOwnerCategory 
  } = useShop();
  const slug = overrideCategory || currentView.params?.categorySlug;

  const allCategories = categories || CATEGORIES;
  const category = allCategories.find((c) => c.slug === slug || c.id === slug) || allCategories[0];
  const allProducts = products || PRODUCTS;
  const categoryProducts = allProducts.filter((p) => p.category === category?.slug || p.category === category?.id);

  return (
    <div className="category-page animate-fade-in" style={{ paddingBottom: '6rem', backgroundColor: 'var(--bg-primary)' }}>
      {/* Category Banner Hero */}
      <div 
        className="category-banner-hero"
        style={{
          position: 'relative',
          backgroundImage: `linear-gradient(rgba(18, 8, 11, 0.55), rgba(18, 8, 11, 0.85)), url(${category.bannerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          textAlign: 'center'
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          {/* Breadcrumb */}
          <div className="category-breadcrumb-trail">
            <span style={{ cursor: 'pointer' }} onClick={() => navigateTo('home')}>Home</span>
            <ChevronRight size={14} />
            <span style={{ cursor: 'pointer' }} onClick={() => navigateTo('shop')}>Categories</span>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--text-gold)', fontWeight: 600 }}>{category.name}</span>
          </div>

          <span className="gold-badge" style={{ marginBottom: '0.75rem' }}>
            <Sparkles size={12} /> {category.itemCount}
          </span>

          <h1 className="font-serif-editorial category-banner-title">
            {category.name}
          </h1>

          <p className="category-banner-desc">
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
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {isOwnerAuthenticated && (
              <>
                <button 
                  className="btn btn-gold btn-sm"
                  onClick={() => openAddProductModal(category.slug)}
                  title={`Add a new bouquet with custom photo to ${category.name}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={14} />
                  <span>+ Add Bouquet Here</span>
                </button>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete category "${category.name}"?`)) {
                      deleteOwnerCategory(category.id || category.slug);
                      navigateTo('shop');
                    }
                  }}
                  title="Delete this heading"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#EF4444', borderColor: '#EF4444' }}
                >
                  <Trash2 size={13} />
                  <span>Delete Category</span>
                </button>
              </>
            )}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
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
