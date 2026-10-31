const fs = require('fs');
const path = require('path');

console.log('=== APPLYING FLIPKART, MEESHO & MYNTRA STYLE PRODUCT CARD FIXES ===');

// =========================================================================
// 1. UPDATE PRODUCTCARD.JSX
// =========================================================================
const cardPath = path.join(__dirname, '../src/components/common/ProductCard.jsx');

const cleanProductCard = `import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Heart, Star, Sparkles, Edit3, Trash2, ShoppingBag } from 'lucide-react';

export default function ProductCard({ product }) {
  const { 
    isInWishlist, toggleWishlist, 
    navigateTo, 
    addToCart,
    isOwnerAuthenticated,
    openEditProductModal,
    deleteOwnerProduct
  } = useShop();

  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  const activeColor = product.colorOptions?.[selectedColorIndex] || null;
  const displayImage = activeColor?.image || product.image;

  const handleCardClick = () => {
    navigateTo('product', { productSlug: product.slug });
  };

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <div className="product-card" onClick={handleCardClick} role="button" tabIndex={0}>
      {/* Product Image & Floating Controls */}
      <div className="product-card-media">
        <img 
          src={displayImage} 
          alt={product.name} 
          className="product-card-image" 
          loading="lazy"
          decoding="async"
        />

        {/* Badge Tag (Flipkart / Myntra bottom-left position: never collides with owner edit controls) */}
        {product.badge && (
          <div className="product-badge-tag">
            <span className={product.isPremium ? 'gold-badge' : 'rose-badge'}>
              <Sparkles size={10} /> {product.badge}
            </span>
          </div>
        )}

        {/* Wishlist Heart (Top-Right) */}
        <button 
          className={\`product-wishlist-btn \${isInWishlist(product.id) ? 'active' : ''}\`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label="Add to Wishlist"
          title="Save to Wishlist"
        >
          <Heart size={16} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
        </button>

        {/* Owner-Only Quick Actions (Top-Left, separated from badge) */}
        {isOwnerAuthenticated && (
          <div className="owner-card-actions-wrapper" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="owner-card-edit-btn"
              onClick={(e) => {
                e.stopPropagation();
                openEditProductModal(product);
              }}
              title="Edit Photo, Price & Details (Owner Only)"
            >
              <Edit3 size={11} />
              <span>Edit</span>
            </button>
            <button
              type="button"
              className="owner-card-delete-quick-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(\`Are you sure you want to delete "\${product.name}" from the store catalog?\`)) {
                  deleteOwnerProduct(product.id);
                }
              }}
              title="Delete Bouquet"
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="product-card-content">
        <span className="product-card-category">
          {product.categoryName || 'Luxury Bouquet'}
        </span>
        
        <h3 className="product-card-title" title={product.name}>
          {product.name}
        </h3>

        {/* Rating Row (Flipkart / Meesho Style) */}
        <div className="product-card-rating-row">
          <div className="meesho-rating-pill">
            <span>{product.rating || '4.9'}</span>
            <Star size={9} fill="#FFFFFF" color="#FFFFFF" />
          </div>
          <span className="meesho-review-count">({product.reviewCount || 120})</span>
          <span className="meesho-assured-badge">⚡ Handcrafted</span>
        </div>

        {/* Color Swatch Dots */}
        {product.colorOptions && product.colorOptions.length > 1 && (
          <div className="product-color-swatches" onClick={(e) => e.stopPropagation()}>
            {product.colorOptions.map((opt, idx) => (
              <span
                key={opt.name}
                className={\`color-swatch-dot \${selectedColorIndex === idx ? 'active' : ''}\`}
                style={{ backgroundColor: opt.hex }}
                title={opt.name}
                onClick={() => setSelectedColorIndex(idx)}
              />
            ))}
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
              {activeColor?.name}
            </span>
          </div>
        )}

        {/* Pricing Row */}
        <div className="product-card-price-row">
          <span className="product-price-current">₹{product.price}</span>
          {product.originalPrice && (
            <span className="product-price-original">₹{product.originalPrice}</span>
          )}
          {discountPercent > 0 && (
            <span className="product-price-save">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Flipkart / Meesho / Myntra Full-Width Action Button (Never Truncates!) */}
        <div className="product-card-actions" onClick={(e) => e.stopPropagation()}>
          <button 
            type="button"
            className="btn btn-gold btn-sm product-card-btn-full"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, { selectedColor: activeColor?.name });
            }}
          >
            <ShoppingBag size={14} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(cardPath, cleanProductCard, 'utf8');
console.log('✓ ProductCard.jsx updated with clean Flipkart / Meesho / Myntra single full-width button & bottom badge!');

// =========================================================================
// 2. UPDATE OWNER TOP BAR DOCK (Fix "Setting..." truncation on mobile)
// =========================================================================
const topBarPath = path.join(__dirname, '../src/components/owner/OwnerTopBar.jsx');
let topBarContent = fs.readFileSync(topBarPath, 'utf8');

topBarContent = topBarContent.replace(
  `            <Plus size={16} />\r\n            <span>Add Bouquet</span>`,
  `            <Plus size={14} />\r\n            <span>Add Bouquet</span>`
);
topBarContent = topBarContent.replace(
  `            <Plus size={16} />\n            <span>Add Bouquet</span>`,
  `            <Plus size={14} />\n            <span>Add Bouquet</span>`
);

fs.writeFileSync(topBarPath, topBarContent, 'utf8');
console.log('✓ OwnerTopBar.jsx updated!');

// =========================================================================
// 3. UPDATE APP.CSS - FLIPKART / MEESHO / MYNTRA PROFILE STYLES
// =========================================================================
const cssPath = path.join(__dirname, '../src/App.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

const flipkartProfileCss = `
/* =========================================================================
   FLIPKART, MEESHO & MYNTRA PRODUCT CARD PROFILE (NO TRUNCATION, NO COLLISION)
   ========================================================================= */
.product-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.product-card-media {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: var(--bg-alt);
}

.product-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

/* Badge Tag at bottom-left of image - NEVER overlaps with owner buttons at top-left */
.product-badge-tag {
  position: absolute !important;
  bottom: 8px !important;
  left: 8px !important;
  top: auto !important;
  z-index: 8 !important;
}

.product-badge-tag span {
  font-size: 0.65rem !important;
  padding: 3px 7px !important;
  font-weight: 800 !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important;
}

/* Wishlist Heart at top-right */
.product-wishlist-btn {
  position: absolute !important;
  top: 8px !important;
  right: 8px !important;
  z-index: 10 !important;
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(6px) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
  color: #64748B !important;
}

.product-wishlist-btn.active {
  color: #E11D48 !important;
}

/* Owner controls at top-left of image */
.owner-card-actions-wrapper {
  position: absolute !important;
  top: 8px !important;
  left: 8px !important;
  z-index: 15 !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 5px !important;
}

.owner-card-edit-btn {
  background: rgba(22, 7, 12, 0.92) !important;
  color: #F9E79F !important;
  border: 1px solid #D4AF37 !important;
  border-radius: 9999px !important;
  padding: 3px 8px !important;
  font-size: 0.7rem !important;
  font-weight: 700 !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important;
}

.owner-card-delete-quick-btn {
  background: rgba(239, 68, 68, 0.9) !important;
  color: #FFFFFF !important;
  border: none !important;
  border-radius: 50% !important;
  width: 24px !important;
  height: 24px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important;
}

/* Modern Flipkart / Myntra / Meesho Typography */
.product-card-content {
  padding: 0.75rem 0.65rem 0.65rem 0.65rem !important;
  display: flex !important;
  flex-direction: column !important;
  flex: 1 1 auto !important;
}

.product-card-category {
  font-size: 0.68rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  color: var(--text-gold) !important;
  margin-bottom: 2px !important;
  display: block !important;
}

.product-card-title {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif !important;
  font-size: 0.88rem !important;
  font-weight: 600 !important;
  line-height: 1.35 !important;
  color: var(--text-primary) !important;
  display: -webkit-box !important;
  -webkit-line-clamp: 2 !important;
  -webkit-box-orient: vertical !important;
  overflow: hidden !important;
  min-height: 2.38rem !important;
  margin-bottom: 0.35rem !important;
}

.product-card-rating-row {
  display: flex !important;
  align-items: center !important;
  gap: 5px !important;
  margin-bottom: 0.35rem !important;
  flex-wrap: wrap !important;
}

.meesho-rating-pill {
  display: inline-flex !important;
  align-items: center !important;
  gap: 2px !important;
  background: #16A34A !important;
  color: #FFFFFF !important;
  font-size: 0.7rem !important;
  font-weight: 800 !important;
  padding: 2px 6px !important;
  border-radius: 4px !important;
}

.meesho-review-count {
  font-size: 0.7rem !important;
  color: var(--text-muted) !important;
}

.meesho-assured-badge {
  font-size: 0.65rem !important;
  font-weight: 800 !important;
  color: #B45309 !important;
  background: #FEF3C7 !important;
  border: 1px solid rgba(217, 119, 6, 0.3) !important;
  padding: 1px 5px !important;
  border-radius: 3px !important;
  margin-left: auto !important;
}

.product-card-price-row {
  display: flex !important;
  align-items: baseline !important;
  gap: 6px !important;
  margin-top: auto !important;
  margin-bottom: 0.45rem !important;
}

.product-price-current {
  font-size: 1.15rem !important;
  font-weight: 800 !important;
  color: var(--text-primary) !important;
}

.product-price-original {
  font-size: 0.78rem !important;
  color: var(--text-muted) !important;
  text-decoration: line-through !important;
}

.product-price-save {
  font-size: 0.78rem !important;
  font-weight: 800 !important;
  color: #16A34A !important;
}

/* Full Width Button (100% Flipkart / Meesho style: NEVER TRUNCATED!) */
.product-card-actions {
  width: 100% !important;
  margin-top: 0.35rem !important;
  display: block !important;
}

.product-card-btn-full {
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6px !important;
  padding: 0.55rem 0.65rem !important;
  font-size: 0.82rem !important;
  font-weight: 800 !important;
  letter-spacing: 0.02em !important;
  border-radius: 8px !important;
  background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%) !important;
  color: #1A0A10 !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3) !important;
  cursor: pointer !important;
  white-space: nowrap !important;
  overflow: visible !important;
}

.product-card-btn-full:active {
  transform: scale(0.97) !important;
}

/* Mobile Owner Dock Spacing Guarantee */
@media (max-width: 768px) {
  .owner-mobile-dock {
    gap: 4px !important;
    padding: 5px 8px !important;
    max-width: calc(100% - 16px) !important;
  }
  .owner-dock-btn {
    padding: 6px 9px !important;
    font-size: 0.72rem !important;
    white-space: nowrap !important;
  }
}
`;

if (!cssContent.includes('FLIPKART, MEESHO & MYNTRA PRODUCT CARD PROFILE')) {
  cssContent += flipkartProfileCss;
} else {
  const startIdx = cssContent.indexOf('/* =========================================================================\n   FLIPKART, MEESHO & MYNTRA PRODUCT CARD PROFILE');
  if (startIdx !== -1) {
    cssContent = cssContent.substring(0, startIdx) + flipkartProfileCss;
  }
}

fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log('✓ App.css updated with Flipkart / Meesho / Myntra profile styles!');

console.log('=== ALL FLIPKART & MEESHO PRODUCT PROFILE FIXES APPLIED SUCCESSFULLY ===');

