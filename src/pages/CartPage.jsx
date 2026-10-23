import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft, 
  Tag, ShieldCheck, Truck, Sparkles, Gift, Check 
} from 'lucide-react';

export default function CartPage() {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    cartSubtotal, 
    deliveryFee, 
    discountAmount, 
    cartTotal, 
    appliedCoupon, 
    applyCoupon, 
    removeCoupon, 
    navigateTo, 
    showToast 
  } = useShop();

  const [inputCoupon, setInputCoupon] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    applyCoupon(inputCoupon);
    setInputCoupon('');
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page-empty animate-fade-in" style={{ padding: '4rem 1rem 8rem 1rem', textAlign: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div className="container" style={{ maxWidth: '520px' }}>
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'var(--bg-accent-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            color: 'var(--text-accent)'
          }}>
            <ShoppingBag size={40} />
          </div>
          <h2 className="font-serif-editorial" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--text-primary)' }}>
            Your Shopping Bag is Empty
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Discover our handcrafted fresh flower arrangements, velvet roses, and celebration gifts to begin your order.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="btn btn-primary btn-lg" 
              onClick={() => navigateTo('shop')}
            >
              <span>Explore Collections</span>
              <ArrowRight size={18} />
            </button>
            <button 
              type="button" 
              className="btn btn-gold btn-lg" 
              onClick={() => navigateTo('build-bouquet')}
            >
              <Sparkles size={18} />
              <span>Customize a Bouquet</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page animate-fade-in" style={{ padding: '2rem 0 6rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        {/* Breadcrumb Bar */}
        <div className="product-detail-breadcrumbs" style={{ marginBottom: '1.5rem', borderRadius: 'var(--radius-sm)' }}>
          <button 
            type="button" 
            className="breadcrumb-back-btn"
            onClick={() => navigateTo('shop')}
            title="Continue Shopping"
          >
            <ArrowLeft size={14} />
            <span>Continue Shopping</span>
          </button>
          <div className="breadcrumb-trail">
            <span className="breadcrumb-link" onClick={() => navigateTo('home')}>Home</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-active">Shopping Cart ({cart.reduce((a, c) => a + c.quantity, 0)} items)</span>
          </div>
        </div>

        <h1 className="font-serif-editorial" style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          Shopping Bag & Order Summary
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Left Column: Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cart.map((item) => (
              <div 
                key={item.cartItemId} 
                className="glass-panel" 
                style={{ 
                  padding: '1.25rem', 
                  borderRadius: 'var(--radius-md)', 
                  display: 'flex', 
                  gap: '1rem', 
                  alignItems: 'center',
                  border: '1px solid var(--border-subtle)' 
                }}
              >
                <img 
                  src={item.image} 
                  alt={item.name} 
                  style={{ 
                    width: '90px', 
                    height: '90px', 
                    borderRadius: 'var(--radius-sm)', 
                    objectFit: 'cover', 
                    flexShrink: 0,
                    border: '1px solid var(--border-light)'
                  }} 
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {item.name}
                  </h3>
                  
                  {/* Variant info */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {item.selectedColor && (
                      <span className="gold-badge" style={{ fontSize: '0.7rem', padding: '2px 7px' }}>
                        Color: {item.selectedColor}
                      </span>
                    )}
                    {item.selectedSize && (
                      <span className="rose-badge" style={{ fontSize: '0.7rem', padding: '2px 7px' }}>
                        Size: {item.selectedSize}
                      </span>
                    )}
                    {item.selectedWrap && (
                      <span style={{ background: 'var(--bg-alt)', padding: '2px 7px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                        Wrap: {item.selectedWrap}
                      </span>
                    )}
                  </div>

                  {/* Pricing & Quantity row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--text-accent)' }}>
                        ₹{item.price * item.quantity}
                      </strong>
                      {item.quantity > 1 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          (₹{item.price} each)
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        border: '1px solid var(--border-subtle)', 
                        borderRadius: 'var(--radius-sm)', 
                        background: 'var(--bg-alt)' 
                      }}>
                        <button 
                          type="button" 
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          style={{ padding: '4px 8px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span style={{ padding: '0 8px', fontSize: '0.88rem', fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          style={{ padding: '4px 8px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <button 
                        type="button" 
                        onClick={() => removeFromCart(item.cartItemId)}
                        style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-outline btn-sm"
                onClick={clearCart}
                style={{ color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              >
                Clear Entire Bag
              </button>
              <button 
                type="button" 
                className="btn btn-outline btn-sm"
                onClick={() => navigateTo('shop')}
              >
                + Add More Bouquets
              </button>
            </div>
          </div>

          {/* Right Column: Order Pricing & Coupon */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Promo Code Card */}
            <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tag size={16} color="var(--text-gold)" />
                <span>Apply Promo Coupon</span>
              </h4>

              {appliedCoupon ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  background: 'rgba(22, 163, 74, 0.08)',
                  border: '1px solid #16A34A',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: '#16A34A', fontWeight: 700 }}>
                    <Check size={16} />
                    <span>Coupon "{appliedCoupon.code}" Applied (-₹{discountAmount})</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={removeCoupon}
                    style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    placeholder="Enter code (e.g. BLOOM150)"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-alt)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      textTransform: 'uppercase'
                    }}
                  />
                  <button type="submit" className="btn btn-gold btn-sm">
                    Apply
                  </button>
                </form>
              )}

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                💡 Tip: Use <strong style={{ color: 'var(--text-gold)' }}>BLOOM150</strong> on orders above ₹999 for instant ₹150 off.
              </div>
            </div>

            {/* Price Breakdown Card */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-gold)' }}>
              <h3 className="font-serif-editorial" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                Price Details
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Price ({cart.reduce((a, c) => a + c.quantity, 0)} Items)</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₹{cartSubtotal}</span>
                </div>

                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A' }}>
                    <span>Coupon Discount</span>
                    <span style={{ fontWeight: 700 }}>-₹{discountAmount}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Delivery Charges</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span style={{ color: '#16A34A', fontWeight: 700 }}>FREE</span>
                    ) : (
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₹{deliveryFee}</span>
                    )}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <span>Handcrafted Floral Packaging</span>
                  <span style={{ color: '#16A34A', fontWeight: 600 }}>FREE (Complimentary)</span>
                </div>
              </div>

              {/* Total Payable */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Total Amount</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-accent)' }}>₹{cartTotal}</span>
              </div>

              {/* Checkout Button */}
              <button 
                type="button" 
                className="btn btn-primary btn-lg" 
                onClick={() => navigateTo('checkout')}
                style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '0.85rem' }}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.85rem' }}>
                <ShieldCheck size={14} color="#16A34A" />
                <span>100% Safe & Secure Checkout • Cash on Delivery / UPI Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
