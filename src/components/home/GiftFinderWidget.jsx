import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { PRODUCTS } from '../../data/products';
import ProductCard from '../common/ProductCard';
import { Sparkles, ArrowRight, RotateCcw, Heart, Gift, Award, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GiftFinderWidget() {
  const { navigateTo, products } = useShop();

  const [step, setStep] = useState(1);
  const [recipient, setRecipient] = useState('');
  const [occasion, setOccasion] = useState('');
  const [budget, setBudget] = useState('');
  const [matchedProducts, setMatchedProducts] = useState([]);

  const allProducts = products || PRODUCTS;

  const handleRecipientSelect = (val) => {
    setRecipient(val);
    setStep(2);
  };

  const handleOccasionSelect = (val) => {
    setOccasion(val);
    setStep(3);
  };

  const handleBudgetSelect = async (val) => {
    setBudget(val);
    const maxBudget = val === 'budget-low' ? 999 : val === 'budget-mid' ? 1999 : 5000;
    
    // Find matching products
    let matches = allProducts.filter((p) => {
      if (val === 'budget-low' && p.price > 999) return false;
      if (val === 'budget-mid' && (p.price < 999 || p.price > 1999)) return false;
      if (val === 'budget-high' && p.price < 1999) return false;
      return true;
    });

    try {
      const res = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, occasion, budget: maxBudget })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.recommendedProducts && data.recommendedProducts.length > 0) {
          matches = data.recommendedProducts;
        }
      }
    } catch (e) {}

    if (matches.length === 0) matches = allProducts.slice(0, 3);

    setMatchedProducts(matches.slice(0, 3));
    setStep(4);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  const resetQuiz = () => {
    setStep(1);
    setRecipient('');
    setOccasion('');
    setBudget('');
    setMatchedProducts([]);
  };

  return (
    <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-alt)' }}>
      <div className="container">
        <div className="glass-panel gift-finder-card" style={{
          maxWidth: '900px',
          margin: '0 auto',
          background: 'var(--bg-surface)',
          border: '2px solid var(--border-gold)',
          boxShadow: 'var(--shadow-gold)',
          borderRadius: 'var(--radius-xl)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="gold-badge" style={{ marginBottom: '0.5rem' }}>
              <Sparkles size={12} /> AI Floral Concierge
            </span>
            <h2 className="font-serif-editorial" style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Surprise Gift Finder
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Answer 3 simple questions and our master concierge will curate the perfect floral gift.
            </p>
          </div>

          {/* Step Progress Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginBottom: '2.5rem' }}>
            {[1, 2, 3].map((num) => (
              <div 
                key={num}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  background: step >= num ? 'var(--rb-gold-gradient)' : 'var(--bg-alt)',
                  color: step >= num ? '#1A0E05' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {num}
              </div>
            ))}
          </div>

          {/* STEP 1: Recipient */}
          {step === 1 && (
            <div className="animate-fade-in" style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                Step 1: Who is this special gift for?
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                {[
                  { label: "Wife / Girlfriend", icon: "❤️", val: "partner-female" },
                  { label: "Husband / Boyfriend", icon: "✨", val: "partner-male" },
                  { label: "Mother / Parents", icon: "👑", val: "mother" },
                  { label: "Best Friend", icon: "🌸", val: "friend" },
                  { label: "Colleague / Client", icon: "🤝", val: "corporate" }
                ].map((item) => (
                  <button
                    key={item.val}
                    className="btn btn-outline"
                    onClick={() => handleRecipientSelect(item.val)}
                    style={{ padding: '1.2rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', height: 'auto' }}
                  >
                    <span style={{ fontSize: '1.8rem' }}>{item.icon}</span>
                    <span style={{ fontWeight: 600 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Occasion */}
          {step === 2 && (
            <div className="animate-fade-in" style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                Step 2: What is the occasion?
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                {[
                  { label: "Birthday Milestone", icon: "🎂", val: "birthday" },
                  { label: "Anniversary / Love", icon: "💍", val: "anniversary" },
                  { label: "Romantic Date / Proposal", icon: "🌹", val: "romance" },
                  { label: "Congratulations & Joy", icon: "🎉", val: "congrats" },
                  { label: "Just to Say 'Thinking of You'", icon: "💌", val: "surprise" }
                ].map((item) => (
                  <button
                    key={item.val}
                    className="btn btn-outline"
                    onClick={() => handleOccasionSelect(item.val)}
                    style={{ padding: '1.2rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', height: 'auto' }}
                  >
                    <span style={{ fontSize: '1.8rem' }}>{item.icon}</span>
                    <span style={{ fontWeight: 600 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Budget */}
          {step === 3 && (
            <div className="animate-fade-in" style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                Step 3: What is your preferred budget range?
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                {[
                  { label: "Sweet & Petite (Under ₹999)", icon: "💐", val: "budget-low" },
                  { label: "Popular Classics (₹999 – ₹1,999)", icon: "✨", val: "budget-mid" },
                  { label: "Grand Luxury (₹2,000 – ₹4,500+)", icon: "👑", val: "budget-high" }
                ].map((item) => (
                  <button
                    key={item.val}
                    className="btn btn-gold"
                    onClick={() => handleBudgetSelect(item.val)}
                    style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', height: 'auto' }}
                  >
                    <span style={{ fontSize: '2rem' }}>{item.icon}</span>
                    <span style={{ fontWeight: 700 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Results */}
          {step === 4 && (
            <div className="animate-fade-in">
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <span className="rose-badge" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
                  🎯 98% Match Curated for Your Moment
                </span>
                <h3 className="font-serif-editorial" style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '0.75rem', color: 'var(--text-primary)' }}>
                  Recommended Floral Selections
                </h3>
              </div>

              <div className="products-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '2rem' }}>
                {matchedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button className="btn btn-outline" onClick={resetQuiz}>
                  <RotateCcw size={16} />
                  <span>Start Over</span>
                </button>

                <button className="btn btn-primary" onClick={() => navigateTo('shop')}>
                  <span>View Full Shop</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
