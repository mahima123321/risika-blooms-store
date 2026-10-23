import React from 'react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS } from '../data/products';
import ProductCard from '../components/common/ProductCard';
import { Heart, ShoppingBag, ArrowRight, Trash2, X } from 'lucide-react';

export default function WishlistPage() {
  const { 
    currentView,
    isWishlistOpen, setIsWishlistOpen, 
    wishlist, toggleWishlist, addToCart, 
    navigateTo, t, products 
  } = useShop();

  const isFullPageView = currentView?.page === 'wishlist';

  // If not open as drawer and not the active route, render nothing
  if (!isWishlistOpen && !isFullPageView) {
    return null;
  }

  const allProducts = products || PRODUCTS;
  const savedProducts = allProducts.filter((p) => wishlist.includes(p.id));

  // If used as drawer
  if (isWishlistOpen) {
    return (
      <div className="drawer-backdrop open" onClick={() => setIsWishlistOpen(false)}>
        <div className="drawer-container" onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Heart size={20} color="var(--rb-rose-600)" fill="currentColor" />
              <h3 className="drawer-title">{t('wishlistTitle')}</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                ({wishlist.length})
              </span>
            </div>
            <button className="drawer-close-btn" onClick={() => setIsWishlistOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="drawer-body">
            {savedProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💖</div>
                <h4 className="font-serif-editorial" style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {t('emptyWishlist')}
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Save your favourite bouquets and hampers to revisit them anytime.
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => { setIsWishlistOpen(false); navigateTo('shop'); }}
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              <div>
                {savedProducts.map((product) => (
                  <div key={product.id} className="cart-item-row">
                    <img src={product.image} alt={product.name} className="cart-item-thumb" />

                    <div>
                      <h4 className="cart-item-title">{product.name}</h4>
                      <div className="cart-item-price">₹{product.price}</div>
                      <button 
                        className="btn btn-primary btn-sm"
                        style={{ marginTop: '0.5rem', padding: '0.35rem 0.8rem', fontSize: '0.78rem' }}
                        onClick={() => {
                          addToCart(product);
                          toggleWishlist(product.id);
                        }}
                      >
                        <ShoppingBag size={12} />
                        <span>Move to Bag</span>
                      </button>
                    </div>

                    <button 
                      onClick={() => toggleWishlist(product.id)}
                      style={{ color: 'var(--text-muted)', padding: '0.5rem', background: 'none' }}
                      title="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full Page View
  return (
    <div className="wishlist-page animate-fade-in" style={{ padding: '3rem 0 6rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="section-pretitle">Your Saved Treasures</span>
          <h1 className="font-serif-editorial" style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            My Floral Wishlist
          </h1>
          <div className="floral-divider">
            <span className="floral-divider-line"></span>
            <span className="floral-divider-icon">💖</span>
            <span className="floral-divider-line"></span>
          </div>
        </div>

        {savedProducts.length === 0 ? (
          <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🌸</div>
            <h3 className="font-serif-editorial" style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>
              Your Wishlist is Empty
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Explore our boutique and click the heart icon on any floral arrangement to save it here.
            </p>
            <button className="btn btn-primary" onClick={() => navigateTo('shop')}>
              <span>Start Exploring</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {savedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
