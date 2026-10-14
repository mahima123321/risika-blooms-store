import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { createWhatsAppUrl, buildProductWhatsAppMessage } from '../../config/whatsapp';
import { Heart, ShoppingBag, MessageCircle, Star, Sparkles, Eye, Edit3, Trash2 } from 'lucide-react';

export default function ProductCard({ product }) {
  const { 
    language, t, 
    addToCart, 
    isInWishlist, toggleWishlist, 
    navigateTo, 
    setQuickViewProduct,
    isOwnerAuthenticated,
    openEditProductModal,
    deleteOwnerProduct
  } = useShop();

  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  const activeColor = product.colorOptions?.[selectedColorIndex] || null;
  const displayImage = activeColor?.image || product.image;

  const handleWhatsAppOrder = (e) => {
    e.stopPropagation();
    const msg = buildProductWhatsAppMessage({
      product,
      selectedColor: activeColor?.name,
      selectedSize: product.sizeOptions?.[0]?.name,
      unitPrice: product.price,
      quantity: 1
    });
    const url = createWhatsAppUrl(msg);
    window.open(url, '_blank');
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, {
      selectedColor: activeColor?.name,
      selectedSize: product.sizeOptions?.[0]?.name,
      unitPrice: product.price,
      image: displayImage,
      quantity: 1
    });
  };

  const handleCardClick = () => {
    navigateTo('product', { productSlug: product.slug });
  };

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <div className="product-card" onClick={handleCardClick}>
      {/* Product Image & Floating Controls */}
      <div className="product-card-media">
        <img 
          src={displayImage} 
          alt={product.name} 
          className="product-card-image" 
          loading="lazy"
        />

        {/* Badge Tag */}
        {product.badge && (
          <div className="product-badge-tag">
            <span className={product.isPremium ? 'gold-badge' : 'rose-badge'}>
              <Sparkles size={11} /> {product.badge}
            </span>
          </div>
        )}

        {/* Wishlist Heart */}
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

        {/* Owner-Only Quick Actions (Only visible to verified store owner) */}
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
                if (window.confirm(`क्या आप सचमुच "${product.name}" बुके को स्टोर से डिलीट करना चाहते हैं?\n(Are you sure you want to delete this bouquet?)`)) {
                  deleteOwnerProduct(product.id);
                }
              }}
              title="Delete Bouquet (ओनर डिलीट करें)"
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="product-card-content">
        <span className="product-card-category">{product.categoryName}</span>
        
        <h3 className="product-card-title">
          {language === 'hi' ? (product.nameHindi || product.name) : product.name}
        </h3>

        {/* Star Rating */}
        <div className="product-card-rating">
          <Star size={13} fill="#F59E0B" color="#F59E0B" />
          <span>{product.rating} ({product.reviewCount})</span>
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
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
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
            <span className="product-price-save">{discountPercent}% OFF</span>
          )}
        </div>

        {/* Dual Actions: WhatsApp Direct Buy + Add to Cart */}
        <div className="product-card-actions">
          <button 
            className="btn btn-whatsapp btn-sm"
            onClick={handleWhatsAppOrder}
            title="Instant Order via WhatsApp"
          >
            <MessageCircle size={15} />
            <span>WhatsApp</span>
          </button>
          
          <button 
            className="btn btn-primary btn-sm"
            onClick={handleAddToCart}
            title="Add to Shopping Bag"
          >
            <ShoppingBag size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
