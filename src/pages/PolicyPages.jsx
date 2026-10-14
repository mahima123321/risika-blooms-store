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
            When you place an order through our website or via WhatsApp, we collect: your name, recipient's name, delivery address, contact phone number, and personalized gift message. Payment card data is processed directly via licensed, RBI-compliant Indian payment gateways (such as Razorpay/UPI) and is never stored on our servers.
          </p>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>3. WhatsApp Communication</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            By opting to order via WhatsApp, you consent to receive direct order confirmations, preview photographs of your floral arrangement, and delivery notifications on your provided number.
          </p>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>4. Contact for Privacy Inquiries</h3>
          <p>
            If you have questions regarding our privacy practices, please contact our concierge at <a href={`mailto:${BRAND_CONFIG.email}`} style={{ color: 'var(--text-accent)' }}>{BRAND_CONFIG.email}</a>.
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

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>3. Order Cancellations & Refunds</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Due to the perishable and customized nature of fresh flower bouquets, orders already assembled by the florist cannot be cancelled once dispatched. Cancellations requested at least 4 hours prior to dispatch are eligible for store credit or full refund.
          </p>

          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>4. WhatsApp Ordering Terms</h3>
          <p>
            Orders initiated via WhatsApp are verified and confirmed individually by our concierge team before dispatch. A bouquet order is treated as active once payment confirmation is received.
          </p>
        </div>
      </div>
    </div>
  );
}
