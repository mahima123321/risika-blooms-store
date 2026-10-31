const fs = require('fs');
const path = require('path');

const navPath = path.join(__dirname, '../src/components/common/MobileBottomNav.jsx');

const newContent = `import React from 'react';
import { useShop } from '../../context/ShopContext';
import { Home, Sparkles, ShoppingBag, Layers, Truck } from 'lucide-react';

export default function MobileBottomNav() {
  const { 
    currentView, 
    navigateTo, 
    cartCount,
    isOwnerAuthenticated,
    orders
  } = useShop();

  const activePage = currentView?.page || 'home';
  const activeOrdersCount = (orders || []).filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      <button 
        type="button"
        className={\`mobile-nav-btn \${activePage === 'home' ? 'active' : ''}\`}
        onClick={() => navigateTo('home')}
      >
        <div className="mobile-nav-icon-wrapper">
          <Home size={20} />
        </div>
        <span>Home</span>
      </button>

      <button 
        type="button"
        className={\`mobile-nav-btn \${activePage === 'shop' || activePage === 'category' ? 'active' : ''}\`}
        onClick={() => navigateTo('shop')}
      >
        <div className="mobile-nav-icon-wrapper">
          <Layers size={20} />
        </div>
        <span>Catalog</span>
      </button>

      <button 
        type="button"
        className={\`mobile-nav-btn mobile-nav-btn-highlight \${activePage === 'build-bouquet' ? 'active' : ''}\`}
        onClick={() => navigateTo('build-bouquet')}
      >
        <div className="mobile-nav-icon-wrapper highlight-glow">
          <Sparkles size={20} />
        </div>
        <span>Builder</span>
      </button>

      <button 
        type="button"
        className={\`mobile-nav-btn \${activePage === 'cart' ? 'active' : ''}\`}
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
        className={\`mobile-nav-btn \${activePage === 'my-orders' || activePage === 'order-tracking' ? 'active' : ''}\`}
        onClick={() => navigateTo('my-orders', isOwnerAuthenticated ? { mode: 'owner' } : {})}
      >
        <div className="mobile-nav-icon-wrapper">
          <Truck size={20} color={isOwnerAuthenticated ? '#D4AF37' : 'currentColor'} />
          {isOwnerAuthenticated && activeOrdersCount > 0 && (
            <span className="mobile-nav-badge" style={{ backgroundColor: '#D4AF37', color: '#000000', fontSize: '0.62rem', fontWeight: 900 }}>
              {activeOrdersCount}
            </span>
          )}
        </div>
        <span style={{ color: isOwnerAuthenticated ? '#D4AF37' : 'inherit', fontWeight: isOwnerAuthenticated ? 700 : 500 }}>
          {isOwnerAuthenticated ? 'Dispatch' : 'Orders'}
        </span>
      </button>
    </nav>
  );
}
`;

fs.writeFileSync(navPath, newContent, 'utf8');
console.log('MobileBottomNav.jsx updated successfully!');
