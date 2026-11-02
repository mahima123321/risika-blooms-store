import React from 'react';
import { useShop } from '../../context/ShopContext';
import { Home, Sparkles, ShoppingCart, Layers, Truck } from 'lucide-react';

export default function MobileBottomNav() {
  const { 
    currentView, 
    navigateTo, 
    cartCount,
    isOwnerAuthenticated,
    customerOrders,
    orders
  } = useShop();

  const activePage = currentView?.page || 'home';
  // Personal customer orders on this device
  const activeCustomerOrdersCount = (customerOrders || []).filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  // Fallback to active store orders if owner mode
  const activeOwnerOrdersCount = (orders || []).filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const badgeCount = activeCustomerOrdersCount > 0 ? activeCustomerOrdersCount : (isOwnerAuthenticated ? activeOwnerOrdersCount : 0);

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
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span className="mobile-nav-badge">{cartCount}</span>
          )}
        </div>
        <span>Cart</span>
      </button>

      <button 
        type="button"
        className={`mobile-nav-btn ${activePage === 'my-orders' || activePage === 'order-tracking' ? 'active' : ''}`}
        onClick={() => navigateTo('my-orders', { mode: 'customer' })}
      >
        <div className="mobile-nav-icon-wrapper">
          <Truck size={20} />
          {badgeCount > 0 && (
            <span className="mobile-nav-badge" style={{ backgroundColor: activeCustomerOrdersCount > 0 ? '#10B981' : '#D4AF37', color: activeCustomerOrdersCount > 0 ? '#FFFFFF' : '#000000', fontSize: '0.62rem', fontWeight: 900 }}>
              {badgeCount}
            </span>
          )}
        </div>
        <span>Orders</span>
      </button>
    </nav>
  );
}
