import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { FLORAL_STEMS, WRAPPING_PAPERS, SATIN_RIBBONS } from '../data/builderData';
import { LUXURY_ADDONS } from '../data/products';
import { createWhatsAppUrl, buildCustomBouquetWhatsAppMessage } from '../config/whatsapp';
import { 
  Sparkles, Plus, Minus, ShoppingBag, MessageCircle, 
  CheckCircle2, RefreshCw, Heart, Send, ArrowLeft, ChevronRight, X 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BuildBouquetPage() {
  const { addToCart, showToast, navigateTo, brandConfig } = useShop();

  // Mobile Stepper State (Flipkart / Meesho App Experience)
  const [activeStep, setActiveStep] = useState(1);
  const [showPriceSheet, setShowPriceSheet] = useState(false);

  // Stem Quantities: { 'stem-red-rose': 6, 'stem-pink-rose': 4, ... }
  const [stemCounts, setStemCounts] = useState({
    'stem-red-rose': 6,
    'stem-pink-rose': 4,
    'stem-gypsophila': 2,
    'stem-eucalyptus': 2
  });

  const [selectedWrap, setSelectedWrap] = useState(WRAPPING_PAPERS[0]);
  const [selectedRibbon, setSelectedRibbon] = useState(SATIN_RIBBONS[0]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [deliveryPincode, setDeliveryPincode] = useState('');

  // Calculations
  const updateStemCount = (stemId, delta) => {
    const current = stemCounts[stemId] || 0;
    const next = Math.max(0, current + delta);
    setStemCounts({ ...stemCounts, [stemId]: next });
  };

  const totalStemsCount = Object.values(stemCounts).reduce((a, b) => a + b, 0);

  const stemsSubtotal = FLORAL_STEMS.reduce((acc, stem) => {
    const count = stemCounts[stem.id] || 0;
    return acc + (count * stem.pricePerStem);
  }, 0);

  const wrappingPrice = selectedWrap ? selectedWrap.price : 0;
  const ribbonPrice = selectedRibbon ? selectedRibbon.price : 0;
  const extrasPrice = selectedExtras.reduce((acc, curr) => acc + curr.price, 0);
  const studioCraftFee = 199; // Master artisan labor & hydration pack

  const grandCustomTotal = stemsSubtotal + wrappingPrice + ribbonPrice + extrasPrice + studioCraftFee;

  const toggleExtra = (extra) => {
    if (selectedExtras.some((e) => e.id === extra.id)) {
      setSelectedExtras(selectedExtras.filter((e) => e.id !== extra.id));
    } else {
      setSelectedExtras([...selectedExtras, extra]);
      showToast(`Added ${extra.name}!`);
    }
  };

  const getStemsSummary = () => {
    return FLORAL_STEMS.filter((s) => (stemCounts[s.id] || 0) > 0).map((s) => ({
      name: s.name,
      color: s.color,
      count: stemCounts[s.id],
      price: s.pricePerStem
    }));
  };

  const handleOrderWhatsApp = () => {
    if (totalStemsCount === 0) {
      showToast('Please add at least 1 flower stem to your bouquet!', 'warning');
      return;
    }

    const msg = buildCustomBouquetWhatsAppMessage({
      stemsSummary: getStemsSummary(),
      wrapping: selectedWrap,
      ribbon: selectedRibbon,
      extras: selectedExtras,
      giftMessage,
      totalPrice: grandCustomTotal,
      customerName,
      pincode: deliveryPincode
    });

    const url = createWhatsAppUrl(msg, brandConfig?.whatsappNumber);
    window.open(url, '_blank');
  };

  const handleAddToCart = () => {
    if (totalStemsCount === 0) {
      showToast('Please add flower stems first!', 'warning');
      return;
    }

    const customProduct = {
      id: `custom-bouquet-${Date.now()}`,
      name: `Bespoke Floral Creation (${totalStemsCount} Stems)`,
      category: 'customized-bouquets',
      price: grandCustomTotal,
      image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=80"
    };

    const summaryText = getStemsSummary().map((s) => `${s.count}x ${s.name}`).join(', ');

    addToCart(customProduct, {
      selectedWrap: selectedWrap.name,
      selectedRibbon: selectedRibbon.name,
      customDetails: `Floral mix: ${summaryText} | Wrap: ${selectedWrap.name} | Ribbon: ${selectedRibbon.name} ${giftMessage ? `| Card: "${giftMessage}"` : ''}`,
      unitPrice: grandCustomTotal,
      quantity: 1,
      addOns: selectedExtras
    });

    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    } catch {}
  };

  return (
    <div className="build-bouquet-page animate-fade-in" style={{ padding: '2rem 0 6rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Breadcrumb Back Bar */}
        <div className="product-detail-breadcrumbs" style={{ marginBottom: '1.25rem', borderRadius: 'var(--radius-sm)' }}>
          <button 
            type="button" 
            className="breadcrumb-back-btn"
            onClick={() => navigateTo('shop')}
            title="Back to Shop"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
          <div className="breadcrumb-trail">
            <span className="breadcrumb-link" onClick={() => navigateTo('home')}>Home</span>
            <ChevronRight size={12} className="breadcrumb-sep" />
            <span className="breadcrumb-link" onClick={() => navigateTo('shop')}>Shop</span>
            <ChevronRight size={12} className="breadcrumb-sep" />
            <span className="breadcrumb-active">Build Your Own Bouquet</span>
          </div>
        </div>

        {/* Studio Title Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <span className="gold-badge" style={{ marginBottom: '0.5rem' }}>
            <Sparkles size={12} /> Interactive Floral Studio
          </span>
          <h1 className="font-serif-editorial" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            Build Your Own Bouquet
          </h1>
          <div className="floral-divider">
            <span className="floral-divider-line"></span>
            <span className="floral-divider-icon">🎨</span>
            <span className="floral-divider-line"></span>
          </div>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', fontSize: '0.95rem' }}>
            Curate your own bespoke flower masterpiece stem-by-stem. Choose your favorite blossoms, wrapping paper, silk ribbon, and personalized card.
          </p>
        </div>

        {/* Meesho / Flipkart Stepper Tabs Bar */}
        <div className="builder-step-tabs-bar">
          <button 
            type="button" 
            className={`builder-step-tab ${activeStep === 1 ? 'active' : ''}`}
            onClick={() => setActiveStep(1)}
          >
            <span className="step-tab-num">1</span>
            <span>🌸 Flowers ({totalStemsCount})</span>
          </button>
          <button 
            type="button" 
            className={`builder-step-tab ${activeStep === 2 ? 'active' : ''}`}
            onClick={() => setActiveStep(2)}
          >
            <span className="step-tab-num">2</span>
            <span>🎀 Wrap</span>
          </button>
          <button 
            type="button" 
            className={`builder-step-tab ${activeStep === 3 ? 'active' : ''}`}
            onClick={() => setActiveStep(3)}
          >
            <span className="step-tab-num">3</span>
            <span>🎗️ Ribbon</span>
          </button>
          <button 
            type="button" 
            className={`builder-step-tab ${activeStep === 4 ? 'active' : ''}`}
            onClick={() => setActiveStep(4)}
          >
            <span className="step-tab-num">4</span>
            <span>✨ Extras & Card</span>
          </button>
          <button 
            type="button" 
            className={`builder-step-tab ${activeStep === 'all' ? 'active' : ''}`}
            onClick={() => setActiveStep('all')}
          >
            <span>📋 All Steps</span>
          </button>
        </div>

        {/* Studio Workspace Layout */}
        <div className="floral-studio-container">
          {/* LEFT: Customizer Steps */}
          <div>
            {/* Step 1: Flower Stems */}
            <div className={`studio-panel ${activeStep !== 1 && activeStep !== 'all' ? 'step-hidden-mobile' : ''}`} style={{ marginBottom: '2rem' }}>
              <div className="studio-step-header">
                <span className="studio-step-num">1</span>
                <div>
                  <h3 className="studio-step-title">Select Fresh Flower Stems</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Add roses, lilies, hydrangeas and fragrant greens ({totalStemsCount} stems chosen)
                  </p>
                </div>
              </div>

              <div className="stems-selection-grid">
                {FLORAL_STEMS.map((stem) => {
                  const count = stemCounts[stem.id] || 0;
                  return (
                    <div 
                      key={stem.id} 
                      className={`stem-card ${count > 0 ? 'selected' : ''}`}
                    >
                      <img src={stem.image} alt={stem.name} className="stem-img" />
                      <h4 className="stem-name">{stem.name}</h4>
                      <span className="stem-price">₹{stem.pricePerStem} / stem</span>

                      <div className="stem-stepper">
                        <button 
                          className="stepper-btn"
                          onClick={() => updateStemCount(stem.id, -1)}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="stepper-count">{count}</span>
                        <button 
                          className="stepper-btn"
                          onClick={() => updateStemCount(stem.id, 1)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Step 1 Next Button (Mobile) */}
              <div className="mobile-only" style={{ marginTop: '1.25rem', width: '100%' }}>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setActiveStep(2)}
                >
                  <span>Next: Choose Wrapping Paper (Step 2) →</span>
                </button>
              </div>
            </div>

            {/* Step 2: Wrapping Paper */}
            <div className={`studio-panel ${activeStep !== 2 && activeStep !== 'all' ? 'step-hidden-mobile' : ''}`} style={{ marginBottom: '2rem' }}>
              <div className="studio-step-header">
                <span className="studio-step-num">2</span>
                <div>
                  <h3 className="studio-step-title">Choose Artisanal Wrapping Paper</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Selected: <strong>{selectedWrap.name}</strong> (+₹{selectedWrap.price})
                  </p>
                </div>
              </div>

              <div className="builder-options-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem' }}>
                {WRAPPING_PAPERS.map((wrap) => (
                  <div
                    key={wrap.id}
                    onClick={() => setSelectedWrap(wrap)}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: selectedWrap.id === wrap.id ? '2px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                      background: selectedWrap.id === wrap.id ? 'var(--bg-accent-soft)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                      <span style={{ width: '18px', height: '18px', borderRadius: 'var(--radius-xs)', backgroundColor: wrap.hex, border: '1px solid rgba(0,0,0,0.1)' }} />
                      <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{wrap.name}</strong>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{wrap.preview}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-gold)', fontWeight: 700, marginTop: '0.3rem' }}>+₹{wrap.price}</div>
                  </div>
                ))}
              </div>

              {/* Step 2 Navigation Buttons (Mobile) */}
              <div className="mobile-only" style={{ marginTop: '1.25rem', display: 'flex', gap: '0.65rem', width: '100%' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setActiveStep(1)}
                >
                  <span>← Back</span>
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ flex: 1.5, justifyContent: 'center' }}
                  onClick={() => setActiveStep(3)}
                >
                  <span>Next: Satin Ribbon (Step 3) →</span>
                </button>
              </div>
            </div>

            {/* Step 3: Satin Ribbon & Bow */}
            <div className={`studio-panel ${activeStep !== 3 && activeStep !== 'all' ? 'step-hidden-mobile' : ''}`} style={{ marginBottom: '2rem' }}>
              <div className="studio-step-header">
                <span className="studio-step-num">3</span>
                <div>
                  <h3 className="studio-step-title">Select Satin Ribbon & Bow</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Selected: <strong>{selectedRibbon.name}</strong> (+₹{selectedRibbon.price})
                  </p>
                </div>
              </div>

              <div className="builder-options-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem' }}>
                {SATIN_RIBBONS.map((ribbon) => (
                  <div
                    key={ribbon.id}
                    onClick={() => setSelectedRibbon(ribbon)}
                    style={{
                      padding: '0.8rem',
                      borderRadius: 'var(--radius-md)',
                      border: selectedRibbon.id === ribbon.id ? '2px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                      background: selectedRibbon.id === ribbon.id ? 'var(--bg-accent-soft)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem'
                    }}
                  >
                    <span style={{ width: '16px', height: '16px', borderRadius: 'var(--radius-full)', backgroundColor: ribbon.hex, border: '1px solid rgba(0,0,0,0.2)' }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{ribbon.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-gold)', fontWeight: 700 }}>+₹{ribbon.price}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Step 3 Navigation Buttons (Mobile) */}
              <div className="mobile-only" style={{ marginTop: '1.25rem', display: 'flex', gap: '0.65rem', width: '100%' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setActiveStep(2)}
                >
                  <span>← Back</span>
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ flex: 1.5, justifyContent: 'center' }}
                  onClick={() => setActiveStep(4)}
                >
                  <span>Next: Add-ons & Card (Step 4) →</span>
                </button>
              </div>
            </div>

            {/* Step 4: Luxury Extras & Personalization */}
            <div className={`studio-panel ${activeStep !== 4 && activeStep !== 'all' ? 'step-hidden-mobile' : ''}`}>
              <div className="studio-step-header">
                <span className="studio-step-num">4</span>
                <div>
                  <h3 className="studio-step-title">Luxury Add-ons & Printed Card</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Chocolates, Teddy bears, & greeting card</p>
                </div>
              </div>

              {/* Addons Grid */}
              <div className="builder-addons-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.8rem', marginBottom: '1.5rem' }}>
                {LUXURY_ADDONS.map((addon) => {
                  const isChecked = selectedExtras.some((e) => e.id === addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleExtra(addon)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: isChecked ? '2px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                        background: isChecked ? 'var(--bg-accent-soft)' : 'var(--bg-surface)',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <img src={addon.image} alt={addon.name} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', objectFit: 'cover', margin: '0 auto 0.3rem auto' }} />
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{addon.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-accent)', fontWeight: 700 }}>+₹{addon.price}</div>
                    </div>
                  );
                })}
              </div>

              {/* Personal Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <input 
                  type="text"
                  placeholder="Your Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-alt)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                <input 
                  type="text"
                  placeholder="Delivery PIN Code"
                  value={deliveryPincode}
                  onChange={(e) => setDeliveryPincode(e.target.value)}
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-alt)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>

              <textarea 
                rows={2}
                placeholder="Printed Card Message: e.g. Happy Birthday sweetheart!"
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

              {/* Step 4 Navigation Buttons (Mobile) */}
              <div className="mobile-only" style={{ marginTop: '1.25rem', display: 'flex', gap: '0.65rem', width: '100%' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setActiveStep(3)}
                >
                  <span>← Back</span>
                </button>
                <button 
                  type="button" 
                  className="btn btn-gold" 
                  style={{ flex: 1.5, justifyContent: 'center' }}
                  onClick={() => setShowPriceSheet(true)}
                >
                  <span>View Bill & Total 📋</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Visual Composition Preview & Price Calculator */}
          <div className="studio-canvas-card">
            <h3 className="font-serif-editorial" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', textAlign: 'center' }}>
              Live Floral Preview & Recipe
            </h3>

            {/* Visual Render Box */}
            <div className="canvas-preview-box">
              <div className="canvas-flowers-render">
                {totalStemsCount === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Select stems on the left to watch your bouquet bloom!
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px', maxWidth: '280px' }}>
                    {FLORAL_STEMS.map((s) => {
                      const count = stemCounts[s.id] || 0;
                      if (count === 0) return null;
                      return [...Array(Math.min(count, 8))].map((_, i) => (
                        <span 
                          key={`${s.id}-${i}`}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: s.hex,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                            display: 'inline-block',
                            border: '1.5px solid #FFFFFF'
                          }}
                          title={`${s.name} (${s.color})`}
                        />
                      ));
                    })}
                  </div>
                )}
              </div>

              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                {totalStemsCount} Stems Selected
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Wrapped in {selectedWrap.name} with {selectedRibbon.name}
              </div>
            </div>

            {/* Recipe Breakdown Table */}
            <div style={{ fontSize: '0.85rem', marginBottom: '1.5rem', maxHeight: '160px', overflowY: 'auto' }}>
              {getStemsSummary().map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  <span>{item.count}x {item.name}</span>
                  <span style={{ fontWeight: 600 }}>₹{item.price * item.count}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <span>Wrapping: {selectedWrap.name}</span>
                <span>₹{selectedWrap.price}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <span>Ribbon: {selectedRibbon.name}</span>
                <span>₹{selectedRibbon.price}</span>
              </div>
              {selectedExtras.map((extra) => (
                <div key={extra.id} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-accent)', fontSize: '0.8rem' }}>
                  <span>Extra: {extra.name}</span>
                  <span>+₹{extra.price}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-gold)', fontSize: '0.8rem' }}>
                <span>Artisan Crafting & Hydration Box</span>
                <span>₹{studioCraftFee}</span>
              </div>
            </div>

            {/* Grand Total Price */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderTop: '2px dashed var(--border-gold)', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Total Price:</span>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ₹{grandCustomTotal}
              </span>
            </div>

            {/* Studio Design Status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.85rem', background: 'var(--bg-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-gold)', fontWeight: 600 }}>
                ✨ Custom Floral Arrangement Configured
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
