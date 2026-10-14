import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS, OCCASIONS } from '../data/products';
import { CATEGORIES } from '../data/categories';
import ProductCard from '../components/common/ProductCard';
import { Search, Filter, SlidersHorizontal, Sparkles, X, ChevronDown, Plus } from 'lucide-react';

export default function ShopPage() {
  const { 
    currentView, searchQuery, setSearchQuery, language, t, 
    products, isOwnerAuthenticated, openAddProductModal 
  } = useShop();

  const allProducts = products || PRODUCTS;

  // Active Filter states initialized from route params if any
  const [selectedCategory, setSelectedCategory] = useState(
    currentView.params?.categorySlug || 'all'
  );
  const [selectedOccasion, setSelectedOccasion] = useState(
    currentView.params?.occasion || 'all'
  );
  const [selectedBudget, setSelectedBudget] = useState(
    currentView.params?.budgetBracket || 'all'
  );
  const [sortBy, setSortBy] = useState('featured');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchCat = product.categoryName.toLowerCase().includes(q);
        const matchDesc = product.description.toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchDesc) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // 3. Occasion Filter
      if (selectedOccasion !== 'all' && !(product.occasions || []).includes(selectedOccasion)) {
        return false;
      }

      // 4. Budget Filter
      if (selectedBudget !== 'all') {
        if (selectedBudget === 'under-499' && product.price > 499) return false;
        if (selectedBudget === 'under-999' && product.price > 999) return false;
        if (selectedBudget === 'under-1499' && product.price > 1499) return false;
        if (selectedBudget === 'luxury-2499' && product.price < 1500) return false;
      }

      // 5. Max Price Slider
      if (product.price > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      return 0; // 'featured'
    });
  }, [allProducts, searchQuery, selectedCategory, selectedOccasion, selectedBudget, maxPrice, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedOccasion('all');
    setSelectedBudget('all');
    setMaxPrice(5000);
    setSearchQuery('');
    setSortBy('featured');
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedOccasion !== 'all' || selectedBudget !== 'all' || maxPrice < 5000 || searchQuery.trim() !== '';

  return (
    <div className="shop-page animate-fade-in" style={{ padding: '3rem 0 6rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Page Banner Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="section-pretitle">The Complete Floral Catalog</span>
          <h1 className="font-serif-editorial" style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            All Flower Bouquets & Gifts
          </h1>
          <div className="floral-divider">
            <span className="floral-divider-line"></span>
            <span className="floral-divider-icon">🌸</span>
            <span className="floral-divider-line"></span>
          </div>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Handcrafted freshly upon every order. Select your preferred color, wrapping, size, and custom greeting card.
          </p>
        </div>

        {/* Top Control Bar: Search, Mobile Filter Toggle, Sort */}
        <div className="glass-panel" style={{
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '2.5rem'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search flowers, teddy, chocolate, color..."
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.4rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-alt)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '0.75rem', color: 'var(--text-gold)' }} />
          </div>

          {/* Results Count & Owner Add */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isOwnerAuthenticated && (
              <button 
                className="btn btn-gold btn-sm"
                onClick={() => openAddProductModal()}
                title="Add a new bouquet (Owner Only)"
              >
                <Plus size={14} />
                <span>Add Bouquet (नया बुके जोड़ें)</span>
              </button>
            )}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Showing <strong>{filteredProducts.length}</strong> creations
            </span>
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="featured">✨ Featured Collection</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>

        {/* Main Shop Layout: Sidebar Filters + Products Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '2.5rem',
          alignItems: 'start'
        }}>
          {/* Sidebar Filter Panel */}
          <aside className="glass-panel" style={{ padding: '1.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 className="font-serif-editorial" style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={16} color="var(--text-gold)" /> Filters
              </h3>
              {hasActiveFilters && (
                <button 
                  onClick={resetFilters}
                  style={{ fontSize: '0.78rem', color: 'var(--text-accent)', fontWeight: 600, background: 'none' }}
                >
                  Reset All
                </button>
              )}
            </div>

            {/* 1. Category Filter */}
            <div style={{ marginBottom: '1.8rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                Category
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '240px', overflowY: 'auto' }}>
                <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="category" 
                    checked={selectedCategory === 'all'} 
                    onChange={() => setSelectedCategory('all')} 
                  />
                  <span>All Categories ({PRODUCTS.length})</span>
                </label>
                {CATEGORIES.map((cat) => (
                  <label key={cat.id} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="category" 
                      checked={selectedCategory === cat.slug} 
                      onChange={() => setSelectedCategory(cat.slug)} 
                    />
                    <span>{language === 'hi' ? cat.nameHindi : cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Price Range Slider */}
            <div style={{ marginBottom: '1.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                <span>Max Price</span>
                <span style={{ color: 'var(--text-accent)' }}>₹{maxPrice}</span>
              </div>
              <input 
                type="range"
                min="499"
                max="5000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--rb-rose-600)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>₹499</span>
                <span>₹5,000</span>
              </div>
            </div>

            {/* 3. Budget Bracket Chips */}
            <div style={{ marginBottom: '1.8rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                Quick Budget
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {[
                  { id: 'all', label: 'Any Budget' },
                  { id: 'under-499', label: 'Under ₹499' },
                  { id: 'under-999', label: 'Under ₹999' },
                  { id: 'under-1499', label: 'Under ₹1,499' },
                  { id: 'luxury-2499', label: 'Luxury ₹2,499+' }
                ].map((b) => (
                  <label key={b.id} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="budget" 
                      checked={selectedBudget === b.id} 
                      onChange={() => setSelectedBudget(b.id)} 
                    />
                    <span>{b.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Occasions Filter */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                Occasion
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="occasion" 
                    checked={selectedOccasion === 'all'} 
                    onChange={() => setSelectedOccasion('all')} 
                  />
                  <span>All Occasions</span>
                </label>
                {OCCASIONS.map((occ) => (
                  <label key={occ.id} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="occasion" 
                      checked={selectedOccasion === occ.id} 
                      onChange={() => setSelectedOccasion(occ.id)} 
                    />
                    <span>{language === 'hi' ? occ.nameHindi : occ.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid Content */}
          <main>
            {filteredProducts.length === 0 ? (
              <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🥀</div>
                <h3 className="font-serif-editorial" style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>
                  No Floral Creations Found
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Try adjusting your filters, price range, or search terms.
                </p>
                <button className="btn btn-gold" onClick={resetFilters}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
