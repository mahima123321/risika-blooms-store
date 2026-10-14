import React from 'react';
import { useShop } from '../../context/ShopContext';
import { Home, Sparkles, ShoppingBag, Heart, Layers } from 'lucide-react';

export default function MobileBottomNav() {
  const { 
    currentView, 
    navigateTo, 
    cartCount, 
    wishlist, 
    setIsCartOpen, 
    setIsWishlistOpen 
  } = useShop();

  const activePage = currentView?.page || 'home';

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      <button 
        type="button"
        className={`mobile-nav-btn ${activePage === 'home' ? 'active' : ''}`}
        onClick={() => navigateTo('home')}
      >
        <div className="mobile-nav-icon-wrapper">
          <Home size={20} />
        </div>
        <span>Home</span>
      </button>

      <button 
        type="button"
        className={`mobile-nav-btn ${activePage === 'shop' || activePage === 'category' ? 'active' : ''}`}
        onClick={() => navigateTo('shop')}
      >
        <div className="mobile-nav-icon-wrapper">
          <Layers size={20} />
        </div>
        <span>Catalog</span>
      </button>

      <button 
        type="button"
        className={`mobile-nav-btn mobile-nav-btn-highlight ${activePage === 'build-bouquet' ? 'active' : ''}`}
        onClick={() => navigateTo('build-bouquet')}
      >
        <div className="mobile-nav-icon-wrapper highlight-glow">
          <Sparkles size={20} />
        </div>
        <span>Builder</span>
      </button>

      <button 
        type="button"
        className={`mobile-nav-btn ${activePage === 'wishlist' ? 'active' : ''}`}
        onClick={() => setIsWishlistOpen(true)}
      >
        <div className="mobile-nav-icon-wrapper">
          <Heart size={20} />
          {wishlist.length > 0 && (
            <span className="mobile-nav-badge">{wishlist.length}</span>
          )}
        </div>
        <span>Wishlist</span>
      </button>

      <button 
        type="button"
        className="mobile-nav-btn"
        onClick={() => setIsCartOpen(true)}
      >
        <div className="mobile-nav-icon-wrapper">
          <ShoppingBag size={20} />
          {cartCount > 0 && (
            <span className="mobile-nav-badge mobile-nav-badge-gold">{cartCount}</span>
          )}
        </div>
        <span>Bag</span>
      </button>
    </nav>
  );
}
