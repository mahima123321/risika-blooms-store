import React from 'react';
import { BRAND_CONFIG } from '../config/brand';

export function PrivacyPolicyPage() {
  return (
    <div className="policy-page animate-fade-in" style={{ padding: '3rem 0 6rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="section-pretitle">Legal & Security</span>
          <h1 className="font-serif-editorial" style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Privacy Policy
          </h1>
          <div className="floral-divider">
            <span className="floral-divider-line"></span>
            <span className="floral-divider-icon">🔒</span>
            <span className="floral-divider-line"></span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Last updated: October 2026</p>
        </div>

        <div className="glass-panel" style={{ padding: '2.5rem', lineHeight: 1.8, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>1. Commitment to Privacy</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            At <strong>{BRAND_CONFIG.name}</strong>, we respect your confidentiality. We only collect details necessary to process your floral order, coordinate delivery, and provide customer support. We do not sell or rent your personal information to any third parties.
          </p>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>2. Information We Collect</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            When you place an order through our website, we collect: your name, recipient's name, delivery address, contact phone number, and personalized gift message. Payment card data is processed directly via licensed, RBI-compliant Indian payment gateways (such as Razorpay/UPI) and is never stored on our servers.
          </p>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>3. Order Notifications</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            We send transactional SMS, email notifications, and delivery handover OTP codes solely to ensure your bouquet arrives securely at your doorstep.
          </p>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>4. Contact for Privacy Inquiries</h3>
          <p>
            If you have questions regarding our privacy practices, please contact our concierge desk at <a href={`mailto:${BRAND_CONFIG.email}`} style={{ color: 'var(--text-accent)' }}>{BRAND_CONFIG.email}</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="policy-page animate-fade-in" style={{ padding: '3rem 0 6rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="section-pretitle">Guidelines</span>
          <h1 className="font-serif-editorial" style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Terms & Conditions
          </h1>
          <div className="floral-divider">
            <span className="floral-divider-line"></span>
            <span className="floral-divider-icon">📜</span>
            <span className="floral-divider-line"></span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Last updated: October 2026</p>
        </div>

        <div className="glass-panel" style={{ padding: '2.5rem', lineHeight: 1.8, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>1. Fresh Flowers & Substitution Policy</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Since flowers are seasonal perishable biological items, slight natural variations in petal shade or bloom size may occur. If a specific filler blossom is out of stock due to harvest conditions, our master florists will substitute it with an equal or higher-value fresh flower while preserving the overall design aesthetic.
          </p>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>2. Delivery Timings & Access</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            For same-day and midnight deliveries, accurate recipient contact details and PIN codes are vital. If the recipient is unavailable or gate security restricts delivery entry, our delivery executive will attempt to coordinate with the sender.
          </p>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>3. Order Cancellations & Store Credit</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Due to the perishable and customized nature of fresh flower bouquets, orders already assembled by the florist cannot be cancelled once dispatched. Cancellations requested while the order is in 'Order Placed' or 'Confirmed' status are eligible for full refund.
          </p>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>4. Delivery Handover OTP Requirement</h3>
          <p>
            Every order is protected by a 4-digit secret delivery handover OTP. Customers must verify the flowers upon arrival and provide this code to the rider to confirm successful handover.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ShippingPolicyPage() {
  return (
    <div className="policy-page animate-fade-in" style={{ padding: '3rem 0 6rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="section-pretitle">Logistics & Express Slots</span>
          <h1 className="font-serif-editorial" style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Shipping & Delivery Policy
          </h1>
          <div className="floral-divider">
            <span className="floral-divider-line"></span>
            <span className="floral-divider-icon">🚚</span>
            <span className="floral-divider-line"></span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pan-India Floral Logistics Guidelines</p>
        </div>

        <div className="glass-panel" style={{ padding: '2.5rem', lineHeight: 1.8, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>1. Delivery Coverage & PIN Codes</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            We provide same-day, morning, evening, and midnight surprise delivery across Delhi NCR, Mumbai, Bengaluru, Hyderabad, Kolkata, Chennai, Pune, and over 400+ cities in India. Customers can enter their 6-digit PIN code at checkout to verify immediate serviceability.
          </p>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>2. Delivery Slots & Timings</h3>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li><strong>Morning Dew Slot:</strong> 8:00 AM – 11:00 AM (Orders must be placed by 8:00 PM the previous evening)</li>
            <li><strong>Standard Afternoon Slot:</strong> 1:00 PM – 5:00 PM (Orders placed by 12:00 PM same day)</li>
            <li><strong>Evening Sunset Slot:</strong> 6:00 PM – 9:00 PM (Orders placed by 5:00 PM same day)</li>
            <li><strong>Midnight Surprise Slot:</strong> 11:15 PM – 12:00 AM sharp (Orders placed by 7:00 PM same day)</li>
          </ul>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>3. Cold-Chain Packaging Protection</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Every floral bouquet travels in a specialized hard-box chassis with hydration gel caps encasing stem ends. This ensures flowers drink water continuously during transit, preventing wilting, bruised petals, and temperature shock.
          </p>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>4. Shipping Charges & Free Delivery</h3>
          <p>
            Standard express courier fee is ₹99. Orders above ₹1,499 qualify for <strong>FREE Express Delivery</strong> across major serviceable metro zones.
          </p>
        </div>
      </div>
    </div>
  );
}

export function RefundPolicyPage() {
  return (
    <div className="policy-page animate-fade-in" style={{ padding: '3rem 0 6rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="section-pretitle">Satisfaction Guarantee</span>
          <h1 className="font-serif-editorial" style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Return, Cancellation & Refund Policy
          </h1>
          <div className="floral-divider">
            <span className="floral-divider-line"></span>
            <span className="floral-divider-icon">🛡️</span>
            <span className="floral-divider-line"></span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>100% Customer Delight Assurance</p>
        </div>

        <div className="glass-panel" style={{ padding: '2.5rem', lineHeight: 1.8, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>1. 100% Freshness Guarantee</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            We stand behind every stem we arrange. If your flowers arrive wilted, damaged in transit, or incorrect in variety, report it within 12 hours of delivery with a photograph to our concierge desk, and we will issue an <strong>instant free replacement bouquet</strong> or full refund.
          </p>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>2. Order Cancellation Window</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            You may cancel your order free of charge at any time while the order status is <em>'Order Placed'</em> or <em>'Order Confirmed'</em>. Once flowers have been hand-cut, styled, and packed in cold-chain boxes, cancellations cannot be accepted.
          </p>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>3. Refund Processing Timeline</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Approved refunds are credited back to the original payment source (UPI, Debit/Credit Card, NetBanking) within <strong>3 to 5 business days</strong> in compliance with RBI merchant regulations. For Cash on Delivery orders, refunds are credited directly to your preferred UPI ID or bank account.
          </p>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>4. Non-Perishable Gifts & Keepsakes</h3>
          <p>
            Handcrafted velvet bouquets, plush teddy bears, greeting cards, and gift hampers in unopened condition can be returned or exchanged within 48 hours of delivery.
          </p>
        </div>
      </div>
    </div>
  );
}
