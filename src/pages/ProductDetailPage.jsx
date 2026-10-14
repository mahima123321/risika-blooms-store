import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS, LUXURY_ADDONS } from '../data/products';
import ProductCard from '../components/common/ProductCard';
import ProductReviewsSection from '../components/reviews/ProductReviewsSection';
import { createWhatsAppUrl, buildProductWhatsAppMessage } from '../config/whatsapp';
import { 
  Heart, ShoppingBag, MessageCircle, Star, Sparkles, 
  Truck, Clock, ShieldCheck, CheckCircle2, ChevronRight, 
  ArrowLeft, Plus, Minus, Send, Share2, Edit3, Trash2 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProductDetailPage() {
  const { 
    currentView, language, t, 
    addToCart, isInWishlist, toggleWishlist, 
    navigateTo, addRecentlyViewed, showToast, 
    checkDeliveryPincode,
    products, isOwnerAuthenticated, openEditProductModal,
    deleteOwnerProduct
  } = useShop();

  const slug = currentView.params?.productSlug;
  const allProducts = products || PRODUCTS;
  const product = allProducts.find((p) => p.slug === slug) || allProducts[0];

  // Track product in recently viewed
  useEffect(() => {
    if (product) addRecentlyViewed(product);
  }, [product]);

  // Selected Customization Options
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [selectedWrap, setSelectedWrap] = useState(product.wrapOptions?.[0] || 'Korean Frosted');
  const [selectedRibbon, setSelectedRibbon] = useState(product.ribbonOptions?.[0] || 'Gold Satin');
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [giftMessage, setGiftMessage] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('Standard Delivery (1 PM - 5 PM)');

  // PIN code checker state
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState('care');

  // Dynamic Image & Price calculations
  const activeColor = product.colorOptions?.[selectedColorIdx] || null;
  const activeImage = activeColor?.image || product.image;

  const sizeOffset = product.sizeOptions?.[selectedSizeIdx]?.priceOffset || 0;
  const baseUnitPrice = product.price + sizeOffset;
  const addonsTotal = selectedAddons.reduce((acc, curr) => acc + curr.price, 0);
  const finalUnitPrice = baseUnitPrice;
  const grandTotalPrice = (finalUnitPrice * quantity) + addonsTotal;

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    const res = checkDeliveryPincode(pincodeInput);
    setPincodeResult(res);
  };

  const toggleAddon = (addon) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
      showToast(`Added ${addon.name} to custom bouquet!`);
    }
  };

  const handleWhatsAppOrder = () => {
    const msg = buildProductWhatsAppMessage({
      product,
      selectedColor: activeColor?.name,
      selectedSize: product.sizeOptions?.[selectedSizeIdx]?.name,
      selectedWrap,
      selectedRibbon,
      quantity,
      unitPrice: finalUnitPrice,
      recipientName,
      recipientPhone,
      pincode: pincodeResult?.pincode || pincodeInput,
      deliveryDate,
      deliverySlot,
      giftMessage,
      addOns: selectedAddons
    });

    const url = createWhatsAppUrl(msg);
    window.open(url, '_blank');
  };

  const handleAddToCart = () => {
    addToCart(product, {
      selectedColor: activeColor?.name,
      selectedSize: product.sizeOptions?.[selectedSizeIdx]?.name,
      selectedWrap,
      selectedRibbon,
      unitPrice: finalUnitPrice,
      quantity,
      image: activeImage,
      addOns: selectedAddons,
      customDetails: `Wrap: ${selectedWrap} | Ribbon: ${selectedRibbon} ${giftMessage ? `| Card: "${giftMessage}"` : ''}`
    });

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}
  };

  // Related products from same category
  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="product-detail-page animate-fade-in" style={{ padding: '2rem 0 6rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigateTo('home')}>Home</span>
          <ChevronRight size={14} />
          <span style={{ cursor: 'pointer' }} onClick={() => navigateTo('shop')}>Shop</span>
          <ChevronRight size={14} />
          <span style={{ cursor: 'pointer' }} onClick={() => navigateTo('category', { categorySlug: product.category })}>{product.categoryName}</span>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--text-accent)', fontWeight: 600 }}>{product.name}</span>
        </div>

        {/* Main Product Display: Left Gallery + Right Customization Options */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.05fr 1fr',
          gap: '3.5rem',
          alignItems: 'start',
          marginBottom: '4.5rem'
        }}>
          {/* LEFT: Photo Gallery & Zoom Preview */}
          <div>
            <div style={{
              position: 'relative',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              border: '2px solid var(--border-light)',
              marginBottom: '1rem',
              background: 'var(--bg-alt)'
            }}>
              <img 
                src={activeImage} 
                alt={product.name} 
                style={{ width: '100%', height: '520px', objectFit: 'cover' }}
              />

              {product.badge && (
                <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                  <span className={product.isPremium ? 'gold-badge' : 'rose-badge'}>
                    <Sparkles size={12} /> {product.badge}
                  </span>
                </div>
              )}

              <button 
                className={`product-wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                style={{ position: 'absolute', top: '16px', right: '16px', width: '42px', height: '42px' }}
                onClick={() => toggleWishlist(product.id)}
              >
                <Heart size={20} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Gallery Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {product.images.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt="Thumbnail" 
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: 'var(--radius-md)',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: activeImage === img ? '2px solid var(--border-gold)' : '1px solid var(--border-light)'
                    }}
                    onClick={() => {}}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Customization & Ordering Engine */}
          <div>
            <span className="product-card-category" style={{ fontSize: '0.85rem' }}>{product.categoryName}</span>
            <h1 className="font-serif-editorial" style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.2 }}>
              {language === 'hi' ? (product.nameHindi || product.name) : product.name}
            </h1>

            {/* Owner-Only Quick Actions */}
            {isOwnerAuthenticated && (
              <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-gold btn-sm"
                  onClick={() => openEditProductModal(product)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  title="Owner Studio: Change image or price"
                >
                  <Edit3 size={14} />
                  <span>Edit Bouquet Photo & Price (फोटो व कीमत बदलें)</span>
                </button>
                <button
                  className="btn btn-outline btn-sm owner-delete-btn"
                  onClick={() => {
                    if (window.confirm(`क्या आप सचमुच "${product.name}" बुके को स्टोर से हमेशा के लिए हटाना चाहते हैं?\n(Delete "${product.name}" from store catalog?)`)) {
                      deleteOwnerProduct(product.id);
                      navigateTo('shop');
                    }
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderColor: '#E53E3E', color: '#E53E3E' }}
                  title="Delete this bouquet from live catalog"
                >
                  <Trash2 size={14} />
                  <span>Delete Bouquet (बुके हटाएं)</span>
                </button>
              </div>
            )}

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {product.rating} / 5.0
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                ({product.reviewCount || 180} verified reviews)
              </span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('reviews');
                  const el = document.getElementById('reviews-section-anchor');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-gold)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                📸 Rate & Review (फोटो डालें)
              </button>
            </div>

            {/* Pricing Section */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ₹{grandTotalPrice}
              </span>
              {product.originalPrice && (
                <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  ₹{product.originalPrice + sizeOffset}
                </span>
              )}
              <span className="rose-badge">
                Free Delivery Above ₹999
              </span>
            </div>

            {/* 1. Bloom Color Selection (Changes Photo!) */}
            {product.colorOptions && product.colorOptions.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                  1. {t('selectColor')}: <span style={{ color: 'var(--text-accent)' }}>{activeColor?.name}</span>
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {product.colorOptions.map((opt, idx) => (
                    <button
                      key={opt.name}
                      onClick={() => setSelectedColorIdx(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.45rem 0.9rem',
                        borderRadius: 'var(--radius-full)',
                        border: selectedColorIdx === idx ? '2px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                        background: selectedColorIdx === idx ? 'var(--bg-accent-soft)' : 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      <span style={{ width: '14px', height: '14px', borderRadius: 'var(--radius-full)', backgroundColor: opt.hex, border: '1px solid rgba(0,0,0,0.1)' }} />
                      <span>{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Bouquet Size Selection */}
            {product.sizeOptions && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                  2. {t('selectSize')}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.65rem' }}>
                  {product.sizeOptions.map((sz, idx) => (
                    <button
                      key={sz.name}
                      onClick={() => setSelectedSizeIdx(idx)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: selectedSizeIdx === idx ? '2px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                        background: selectedSizeIdx === idx ? 'var(--bg-accent-soft)' : 'var(--bg-surface)',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{sz.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-gold)', fontWeight: 600 }}>
                        {sz.priceOffset === 0 ? 'Standard' : `+₹${sz.priceOffset}`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Wrapping & Ribbon Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  {t('selectWrap')}
                </label>
                <select
                  value={selectedWrap}
                  onChange={(e) => setSelectedWrap(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-alt)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                >
                  {product.wrapOptions?.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  {t('selectRibbon')}
                </label>
                <select
                  value={selectedRibbon}
                  onChange={(e) => setSelectedRibbon(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-alt)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                >
                  {product.ribbonOptions?.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. PIN Code Delivery Checker */}
            <div className="glass-panel" style={{ padding: '1.2rem', marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                📍 Check Delivery & Midnight Availability
              </label>
              <form onSubmit={handlePincodeCheck} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input 
                  type="text"
                  placeholder="Enter 6-digit PIN code (e.g. 110070)"
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value)}
                  maxLength={6}
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-alt)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                <button type="submit" className="btn btn-outline btn-sm">
                  {t('checkPincode')}
                </button>
              </form>

              {pincodeResult && (
                <div style={{ fontSize: '0.82rem', marginTop: '0.5rem' }}>
                  {pincodeResult.valid ? (
                    <div style={{ color: '#16A34A', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700 }}>
                        <CheckCircle2 size={14} /> Available in {pincodeResult.city} ({pincodeResult.pincode})
                      </div>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        🚀 Estimated Delivery: <strong>{pincodeResult.deliveryEstimate}</strong> (Morning, Standard, Midnight available)
                      </span>
                    </div>
                  ) : (
                    <span style={{ color: '#DC2626' }}>{pincodeResult.message}</span>
                  )}
                </div>
              )}
            </div>

            {/* 5. Personalized Greeting Card Writer */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                💌 Complimentary Printed Gift Card Message
              </label>
              <textarea 
                rows={2}
                placeholder="Write your heartfelt message here (e.g. Happy Birthday to the love of my life!)..."
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-alt)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>

            {/* 6. Luxury Add-ons Carousel */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                ✨ Enhance Your Gift with Add-ons
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {LUXURY_ADDONS.map((addon) => {
                  const isSelected = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon)}
                      style={{
                        flexShrink: 0,
                        width: '140px',
                        padding: '0.6rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                        background: isSelected ? 'var(--bg-accent-soft)' : 'var(--bg-surface)',
                        textAlign: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <img src={addon.image} alt={addon.name} style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-full)', objectFit: 'cover', margin: '0 auto 0.4rem auto' }} />
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '0.2rem' }}>
                        {addon.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-accent)', fontWeight: 700 }}>
                        {isSelected ? '✓ Added' : `+₹${addon.price}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper & Order CTAs */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-alt)', borderRadius: 'var(--radius-full)', padding: '0.25rem 0.6rem', border: '1px solid var(--border-subtle)' }}>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Minus size={14} />
                </button>
                <span style={{ fontWeight: 700, padding: '0 0.8rem', fontSize: '0.95rem' }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add to Cart */}
              <button 
                className="btn btn-primary btn-lg"
                onClick={handleAddToCart}
                style={{ flex: 1 }}
              >
                <ShoppingBag size={18} />
                <span>{t('addToCart')} (₹{grandTotalPrice})</span>
              </button>
            </div>

            {/* DIRECT MANDATORY WHATSAPP ORDER BUTTON */}
            <button 
              className="btn btn-whatsapp btn-lg"
              onClick={handleWhatsAppOrder}
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              <MessageCircle size={20} />
              <span>Direct Order via WhatsApp (Fast Track)</span>
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Instant concierge verification • Real photos shared before delivery • Secure payment link
            </p>
          </div>
        </div>

        {/* Accordion Tabs (Care instructions, Details, Reviews) */}
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <button 
              className={`filter-tab-btn ${activeTab === 'care' ? 'active' : ''}`}
              onClick={() => setActiveTab('care')}
            >
              🌿 Flower Care Guide
            </button>
            <button 
              className={`filter-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              📐 Floral Recipe & Dimensions
            </button>
            <button 
              className={`filter-tab-btn ${activeTab === 'delivery' ? 'active' : ''}`}
              onClick={() => setActiveTab('delivery')}
            >
              🚚 Delivery & Freshness Policy
            </button>
            <button 
              className={`filter-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              ⭐ Customer Reviews & Photos (रिव्यू व तस्वीरें)
            </button>
          </div>

          {activeTab === 'care' && (
            <div className="animate-fade-in" style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>How to keep your blooms fresh for 5 to 7 days:</h4>
              <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>{product.careTips}</li>
                <li>Trim 1-2 cm off stems at a 45° diagonal angle before putting in a clean vase.</li>
                <li>Change water with cool tap water every 2 days and add the included flower food sachet.</li>
                <li>Keep away from direct sunlight, air conditioner vents, and ripening fruit bowls.</li>
              </ul>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="animate-fade-in" style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
              <p style={{ marginBottom: '1rem' }}><strong>Description:</strong> {product.description}</p>
              <p><strong>Floral Ingredients:</strong> {product.flowerTypes?.join(', ')}</p>
              <p><strong>Arrangement Dimensions:</strong> {product.dimensions}</p>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="animate-fade-in" style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>Our Delivery Commitments:</h4>
              <p>• <strong>Same-Day Delivery:</strong> Available across Delhi NCR, Mumbai, Bengaluru, Hyderabad, and major metros on orders placed before 7:00 PM.</p>
              <p>• <strong>Midnight Surprise Delivery:</strong> Dispatched between 11:15 PM and 12:00 AM in pristine chilled delivery vans.</p>
              <p>• <strong>Hydration Lock:</strong> Every stem is nestled in a biodegradable water gel reservoir preventing dehydration during transit.</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="animate-fade-in" id="reviews-section-anchor">
              <ProductReviewsSection product={product} />
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h3 className="font-serif-editorial" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
              You May Also Adore
            </h3>
            <div className="products-grid">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Mobile Sticky Quick Buy Bar */}
        <div className="product-mobile-sticky-bar">
          <div className="product-mobile-sticky-info">
            <span className="product-mobile-sticky-price">₹{grandTotalPrice}</span>
            <span className="product-mobile-sticky-title">{language === 'hi' ? (product.nameHindi || product.name) : product.name}</span>
          </div>
          <div className="product-mobile-sticky-actions">
            <button 
              type="button" 
              className="btn btn-whatsapp btn-sm"
              onClick={handleWhatsAppOrder}
            >
              <MessageCircle size={15} /> WhatsApp
            </button>
            <button 
              type="button" 
              className="btn btn-gold btn-sm"
              onClick={handleAddToCart}
            >
              <ShoppingBag size={15} /> Add to Bag
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
