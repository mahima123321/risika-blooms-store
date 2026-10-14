import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { COMBO_ITEMS } from '../data/builderData';
import { createWhatsAppUrl } from '../config/whatsapp';
import { Sparkles, ShoppingBag, MessageCircle, Heart, Gift, Check, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GiftComboPage() {
  const { addToCart, showToast } = useShop();

  const [selectedBase, setSelectedBase] = useState(COMBO_ITEMS.bases[0]);
  const [selectedTeddy, setSelectedTeddy] = useState(COMBO_ITEMS.teddies[0]);
  const [selectedChoc, setSelectedChoc] = useState(COMBO_ITEMS.chocolates[0]);
  const [selectedCard, setSelectedCard] = useState(COMBO_ITEMS.cards[0]);

  const rawTotal = selectedBase.price + selectedTeddy.price + selectedChoc.price + (selectedCard.freeWithCode ? 0 : selectedCard.price);
  const bundleDiscount = Math.round(rawTotal * 0.12); // 12% Combo Savings
  const comboTotal = rawTotal - bundleDiscount;

  const handleAddToCart = () => {
    const comboProduct = {
      id: `custom-combo-${Date.now()}`,
      name: `Luxury Gift Combo: ${selectedBase.name} + ${selectedTeddy.name}`,
      category: 'flower-teddy-combos',
      price: comboTotal,
      image: selectedBase.image
    };

    addToCart(comboProduct, {
      customDetails: `Combo Includes: [1] ${selectedBase.name}, [2] ${selectedTeddy.name}, [3] ${selectedChoc.name}, [4] ${selectedCard.name}`,
      unitPrice: comboTotal,
      quantity: 1
    });

    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch {}
  };

  const handleWhatsAppOrder = () => {
    let msg = `🌸 *CUSTOM LUXURY GIFT COMBO ORDER — RISIKA BLOOMS* 🌸\n`;
    msg += `─────────────────────────\n`;
    msg += `💐 *Flower Base:* ${selectedBase.name} (₹${selectedBase.price})\n`;
    msg += `🧸 *Teddy Bear:* ${selectedTeddy.name} (₹${selectedTeddy.price})\n`;
    msg += `🍫 *Chocolates:* ${selectedChoc.name} (₹${selectedChoc.price})\n`;
    msg += `💌 *Greeting Card:* ${selectedCard.name}\n`;
    msg += `─────────────────────────\n`;
    msg += `🏷️ *Standard Price:* ₹${rawTotal}\n`;
    msg += `🎉 *12% Combo Savings:* -₹${bundleDiscount}\n`;
    msg += `💰 *Final Combo Total:* ₹${comboTotal}\n`;
    msg += `─────────────────────────\n`;
    msg += `_Please confirm this custom gift hamper order._`;

    const url = createWhatsAppUrl(msg);
    window.open(url, '_blank');
  };

  return (
    <div className="gift-combo-page animate-fade-in" style={{ padding: '3rem 0 6rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="gold-badge" style={{ marginBottom: '0.5rem' }}>
            <Sparkles size={12} /> Curate & Save 12%
          </span>
          <h1 className="font-serif-editorial" style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Gift Combo Builder
          </h1>
          <div className="floral-divider">
            <span className="floral-divider-line"></span>
            <span className="floral-divider-icon">🎁</span>
            <span className="floral-divider-line"></span>
          </div>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', fontSize: '1.05rem' }}>
            Combine fresh blossoms, cuddly plush teddy bears, gourmet chocolates, and artisanal greeting cards with automatic bundle savings.
          </p>
        </div>

        {/* Combo Builder Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem', alignItems: 'start' }}>
          {/* LEFT: Selection Slots */}
          <div>
            {/* Slot 1: Flower Base */}
            <div className="studio-panel" style={{ marginBottom: '2rem' }}>
              <div className="studio-step-header">
                <span className="studio-step-num">1</span>
                <div>
                  <h3 className="studio-step-title">Choose Flower Bouquet Base</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Selected: {selectedBase.name}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {COMBO_ITEMS.bases.map((base) => (
                  <div
                    key={base.id}
                    onClick={() => setSelectedBase(base)}
                    style={{
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: selectedBase.id === base.id ? '2px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                      background: selectedBase.id === base.id ? 'var(--bg-accent-soft)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                      padding: '0.75rem',
                      textAlign: 'center'
                    }}
                  >
                    <img src={base.image} alt={base.name} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem' }} />
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{base.name}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-accent)', fontWeight: 700 }}>₹{base.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Slot 2: Teddy Bear */}
            <div className="studio-panel" style={{ marginBottom: '2rem' }}>
              <div className="studio-step-header">
                <span className="studio-step-num">2</span>
                <div>
                  <h3 className="studio-step-title">Choose Plush Teddy Bear</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Selected: {selectedTeddy.name}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {COMBO_ITEMS.teddies.map((ted) => (
                  <div
                    key={ted.id}
                    onClick={() => setSelectedTeddy(ted)}
                    style={{
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: selectedTeddy.id === ted.id ? '2px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                      background: selectedTeddy.id === ted.id ? 'var(--bg-accent-soft)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                      padding: '0.75rem',
                      textAlign: 'center'
                    }}
                  >
                    <img src={ted.image} alt={ted.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-full)', margin: '0 auto 0.5rem auto' }} />
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{ted.name}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-accent)', fontWeight: 700 }}>₹{ted.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Slot 3: Chocolates */}
            <div className="studio-panel" style={{ marginBottom: '2rem' }}>
              <div className="studio-step-header">
                <span className="studio-step-num">3</span>
                <div>
                  <h3 className="studio-step-title">Select Gourmet Chocolates</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Selected: {selectedChoc.name}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {COMBO_ITEMS.chocolates.map((choc) => (
                  <div
                    key={choc.id}
                    onClick={() => setSelectedChoc(choc)}
                    style={{
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: selectedChoc.id === choc.id ? '2px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                      background: selectedChoc.id === choc.id ? 'var(--bg-accent-soft)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                      padding: '0.75rem',
                      textAlign: 'center'
                    }}
                  >
                    <img src={choc.image} alt={choc.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-full)', margin: '0 auto 0.5rem auto' }} />
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{choc.name}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-accent)', fontWeight: 700 }}>₹{choc.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Live Bundle Card */}
          <div className="studio-canvas-card">
            <span className="rose-badge" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
              🎁 12% Instant Bundle Savings Applied
            </span>
            <h3 className="font-serif-editorial" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Your Custom Gift Hamper
            </h3>

            {/* Mini preview items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: 'var(--bg-alt)', borderRadius: 'var(--radius-md)' }}>
                <img src={selectedBase.image} alt={selectedBase.name} style={{ width: '45px', height: '45px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                <div style={{ flex: 1, fontSize: '0.85rem' }}>
                  <strong>{selectedBase.name}</strong>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>₹{selectedBase.price}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: 'var(--bg-alt)', borderRadius: 'var(--radius-md)' }}>
                <img src={selectedTeddy.image} alt={selectedTeddy.name} style={{ width: '45px', height: '45px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                <div style={{ flex: 1, fontSize: '0.85rem' }}>
                  <strong>{selectedTeddy.name}</strong>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>₹{selectedTeddy.price}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: 'var(--bg-alt)', borderRadius: 'var(--radius-md)' }}>
                <img src={selectedChoc.image} alt={selectedChoc.name} style={{ width: '45px', height: '45px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                <div style={{ flex: 1, fontSize: '0.85rem' }}>
                  <strong>{selectedChoc.name}</strong>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>₹{selectedChoc.price}</span>
              </div>
            </div>

            {/* Price Calculations */}
            <div style={{ padding: '1rem 0', borderTop: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                <span>Standard Value:</span>
                <span>₹{rawTotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#16A34A', fontWeight: 700, marginBottom: '0.6rem' }}>
                <span>Combo Savings (12%):</span>
                <span>-₹{bundleDiscount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', borderTop: '2px dashed var(--border-gold)', paddingTop: '0.75rem' }}>
                <span>Combo Price:</span>
                <span>₹{comboTotal}</span>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                className="btn btn-whatsapp btn-lg"
                onClick={handleWhatsAppOrder}
                style={{ width: '100%' }}
              >
                <MessageCircle size={18} />
                <span>Order Combo via WhatsApp</span>
              </button>

              <button 
                className="btn btn-primary btn-lg"
                onClick={handleAddToCart}
                style={{ width: '100%' }}
              >
                <ShoppingBag size={18} />
                <span>Add Combo to Shopping Bag</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
