import React from 'react';
import { useShop } from '../../context/ShopContext';
import { Home, Sparkles, ShoppingBag, Layers, Truck } from 'lucide-react';

export default function MobileBottomNav() {
  const { 
    currentView, 
    navigateTo, 
    cartCount 
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
        className={`mobile-nav-btn ${activePage === 'cart' ? 'active' : ''}`}
        onClick={() => navigateTo('cart')}
      >
        <div className="mobile-nav-icon-wrapper">
          <ShoppingBag size={20} />
          {cartCount > 0 && (
            <span className="mobile-nav-badge">{cartCount}</span>
          )}
        </div>
        <span>Bag</span>
      </button>

      <button 
        type="button"
        className={`mobile-nav-btn ${activePage === 'my-orders' || activePage === 'order-tracking' ? 'active' : ''}`}
        onClick={() => navigateTo('my-orders')}
      >
        <div className="mobile-nav-icon-wrapper">
          <Truck size={20} />
        </div>
        <span>Orders</span>
      </button>
    </nav>
  );
}
