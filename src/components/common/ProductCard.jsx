import React, { useState } from 'react';
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
          className={`product-wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
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
                if (window.confirm(`Are you sure you want to delete "${product.name}" from the store catalog?`)) {
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
                className={`color-swatch-dot ${selectedColorIndex === idx ? 'active' : ''}`}
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
