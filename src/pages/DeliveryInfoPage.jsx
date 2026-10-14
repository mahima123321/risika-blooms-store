import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Truck, Clock, ShieldCheck, CheckCircle2, MapPin, Sparkles } from 'lucide-react';

export default function DeliveryInfoPage() {
  const { checkDeliveryPincode } = useShop();
  const [pinInput, setPinInput] = useState('');
  const [pinResult, setPinResult] = useState(null);

  const handleCheck = (e) => {
    e.preventDefault();
    setPinResult(checkDeliveryPincode(pinInput));
  };

  return (
    <div className="delivery-info-page animate-fade-in" style={{ padding: '3rem 0 6rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="section-pretitle">Logistics & Care</span>
          <h1 className="font-serif-editorial" style={{ fontSize: '3.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Delivery Information & PIN Coverage
          </h1>
          <div className="floral-divider">
            <span className="floral-divider-line"></span>
            <span className="floral-divider-icon">🚚</span>
            <span className="floral-divider-line"></span>
          </div>
        </div>

        {/* PIN Code Verification Box */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3.5rem', textAlign: 'center', border: '2px solid var(--border-gold)' }}>
          <h3 className="font-serif-editorial" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Check Delivery Slots for Your Location
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Enter your 6-digit Indian PIN code to verify same-day & midnight slots.
          </p>

          <form onSubmit={handleCheck} style={{ display: 'flex', gap: '0.5rem', maxWidth: '420px', margin: '0 auto 1rem auto' }}>
            <input 
              type="text"
              maxLength={6}
              placeholder="e.g. 110070, 400050, 560001"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid var(--border-subtle)',
                background: 'var(--bg-alt)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <button type="submit" className="btn btn-gold">
              Verify PIN
            </button>
          </form>

          {pinResult && (
            <div style={{ padding: '1rem', background: 'var(--bg-alt)', borderRadius: 'var(--radius-md)', display: 'inline-block', textAlign: 'left', marginTop: '0.5rem' }}>
              {pinResult.valid ? (
                <div style={{ color: '#16A34A', fontSize: '0.9rem' }}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={16} /> PIN Code {pinResult.pincode} is in our Express Floral Zone!
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', marginTop: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    <li>Same-Day Delivery: Available (Order before 7:00 PM)</li>
                    <li>Midnight Surprise Delivery: Available (11:15 PM – 12:00 AM)</li>
                    <li>Complimentary Floral Food Sachet & Care Guide included</li>
                  </ul>
                </div>
              ) : (
                <div style={{ color: '#DC2626', fontSize: '0.88rem' }}>
                  {pinResult.message}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4 Delivery Slots */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '3.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>🌅</div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Morning Slot</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-gold)', fontWeight: 600 }}>8:00 AM – 11:00 AM</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Start their day with fresh fragrant morning dew</p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>☀️</div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Standard Slot</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-gold)', fontWeight: 600 }}>1:00 PM – 5:00 PM</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Ideal for office, home, and afternoon celebrations</p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>🌇</div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Evening Slot</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-gold)', fontWeight: 600 }}>6:00 PM – 9:00 PM</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Perfect for date nights and dinner parties</p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', border: '1.5px solid var(--border-gold)' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>🌙</div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Midnight Special</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-accent)', fontWeight: 700 }}>11:15 PM – 12:00 AM</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Be the very first wish on birthdays & anniversaries</p>
          </div>
        </div>

        {/* Packaging & Cold-Chain Details */}
        <div className="glass-panel" style={{ padding: '2.5rem', lineHeight: 1.8, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          <h3 className="font-serif-editorial" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Temperature-Controlled Transit & Packaging Guarantee
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            At ROSHIKA BLOOMS, we treat every flower stem like a piece of fine jewelry. Unlike standard couriers who throw parcels into hot cargo vans, our orders travel in climate-controlled floral transport equipped with hydration gel caps on every stem.
          </p>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Hydration Pack:</strong> Keeps flowers drinking water throughout transit.</li>
            <li><strong>Hard-Box Casing:</strong> Prevents petal crushing, creasing, and wind burn.</li>
            <li><strong>Real Photo Verification:</strong> Our florist shares a photo on WhatsApp before the dispatch rider sets off.</li>
            <li><strong>Contactless Handover:</strong> Discreet and courteous delivery to the recipient.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
