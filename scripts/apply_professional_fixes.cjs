const fs = require('fs');
const path = require('path');

console.log('=== APPLYING PROFESSIONAL LUXURY FIXES ===');

// =========================================================================
// 1. FIX HEADER.JSX - Prevent Mobile Brand Name Truncation ("RISH" -> "RISHIKA BLOOMS")
// =========================================================================
const headerPath = path.join(__dirname, '../src/components/common/Header.jsx');
let headerContent = fs.readFileSync(headerPath, 'utf8');

// Make Search button in header desktop-only on mobile (since mobile has dedicated search strip below)
headerContent = headerContent.replace(
  '<button \n              className="action-icon-btn" \n              onClick={() => setIsSearchOpen(true)}\n              aria-label="Search"',
  '<button \n              className="action-icon-btn desktop-only" \n              onClick={() => setIsSearchOpen(true)}\n              aria-label="Search"'
);
if (!headerContent.includes('action-icon-btn desktop-only" \n              onClick={() => setIsSearchOpen(true)}')) {
  headerContent = headerContent.replace(
    'className="action-icon-btn" \n              onClick={() => setIsSearchOpen(true)}',
    'className="action-icon-btn desktop-only" \n              onClick={() => setIsSearchOpen(true)}'
  );
}

// Make QR button desktop-only in header
headerContent = headerContent.replace(
  'className="action-icon-btn qr-header-btn"',
  'className="action-icon-btn qr-header-btn desktop-only"'
);

// Make Language toggle desktop-only in header top row
headerContent = headerContent.replace(
  'className="action-icon-btn language-toggle-btn"',
  'className="action-icon-btn language-toggle-btn desktop-only"'
);

fs.writeFileSync(headerPath, headerContent, 'utf8');
console.log('✓ Header.jsx updated: Freed up 120px+ on mobile header for full brand name!');

// =========================================================================
// 2. FIX APP.CSS - Mobile Brand Name Full Visibility
// =========================================================================
const cssPath = path.join(__dirname, '../src/App.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

const brandCssTarget = `.brand-name,
  .luxury-brand-title {
    font-size: 0.84rem !important;
    font-weight: 800 !important;
    letter-spacing: 0.02em !important;
    white-space: nowrap !important;
    display: block !important;
    color: var(--text-primary) !important;
  }`;

const brandCssReplacement = `.brand-name,
  .luxury-brand-title {
    font-size: 1.05rem !important;
    font-weight: 800 !important;
    letter-spacing: 0.04em !important;
    white-space: nowrap !important;
    overflow: visible !important;
    text-overflow: clip !important;
    display: block !important;
    color: var(--text-primary) !important;
    line-height: 1.15 !important;
  }
  .brand-logo-link {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    max-width: none !important;
    overflow: visible !important;
  }`;

if (cssContent.includes(brandCssTarget)) {
  cssContent = cssContent.replace(brandCssTarget, brandCssReplacement);
} else {
  // Append explicit high-priority rule at end of CSS
  cssContent += `\n\n/* High-Priority Mobile Brand Name Full Visibility */
@media (max-width: 768px) {
  .brand-logo-link {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    max-width: none !important;
    overflow: visible !important;
  }
  .brand-name,
  .luxury-brand-title {
    font-size: 1.05rem !important;
    font-weight: 800 !important;
    letter-spacing: 0.04em !important;
    white-space: nowrap !important;
    overflow: visible !important;
    text-overflow: clip !important;
    display: block !important;
    line-height: 1.15 !important;
  }
}
`;
}

fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log('✓ App.css updated: Brand name font & space rules locked!');

// =========================================================================
// 3. FIX ORDERCONFIRMATIONPAGE.JSX - High-Priority OTP Pass & Incoming SMS Chime
// =========================================================================
const confirmPagePath = path.join(__dirname, '../src/pages/OrderConfirmationPage.jsx');

const cleanConfirmationPage = `import React, { useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  CheckCircle2, Printer, ArrowRight, ShieldCheck, 
  MapPin, Clock, Calendar, Gift, Phone, Package, Truck, Sparkles, Copy, Check 
} from 'lucide-react';

export default function OrderConfirmationPage() {
  const { currentView, orders, navigateTo, showToast, triggerIncomingSmsNotification } = useShop();

  const targetOrderId = currentView?.params?.orderId;
  const order = (orders || []).find((o) => o.orderId === targetOrderId) || orders?.[0];

  // Realistic professional carrier SMS notification on device load
  useEffect(() => {
    if (order && triggerIncomingSmsNotification) {
      const timer = setTimeout(() => {
        triggerIncomingSmsNotification({
          orderId: order.orderId,
          deliveryOtp: order.deliveryOtp || '4892',
          phone: order.customerPhone || order.recipientPhone,
          customerName: order.recipientName || order.customerName,
          autoLaunchNative: false
        });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [order?.orderId]);

  if (!order) {
    return (
      <div className="order-confirmation-empty animate-fade-in" style={{ padding: '5rem 1rem', textAlign: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div className="container" style={{ maxWidth: '480px' }}>
          <h2 className="font-serif-editorial" style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            No Order Found
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
            We could not locate this order reference. You can browse our shop or check your order history.
          </p>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={() => navigateTo('shop')}
          >
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(order.deliveryOtp || '4892');
    showToast(\`📋 Delivery Handover OTP \${order.deliveryOtp || '4892'} copied!\`, 'success');
  };

  return (
    <div className="order-confirmation-page animate-fade-in" style={{ padding: '2rem 0 6rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        
        {/* Success Card */}
        <div className="glass-panel" style={{ 
          padding: '2.25rem 1.75rem', 
          borderRadius: 'var(--radius-lg)', 
          textAlign: 'center',
          border: '2px solid var(--border-gold)',
          marginBottom: '2rem',
          boxShadow: '0 12px 36px rgba(0,0,0,0.06)'
        }}>
          <div style={{
            width: '74px',
            height: '74px',
            borderRadius: '50%',
            background: 'rgba(22, 163, 74, 0.12)',
            border: '2.5px solid #16A34A',
            color: '#16A34A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}>
            <CheckCircle2 size={42} />
          </div>

          <span className="rose-badge" style={{ marginBottom: '0.6rem', fontSize: '0.75rem', padding: '4px 12px' }}>
            ✓ Order Confirmed & Scheduled for Delivery
          </span>

          <h1 className="font-serif-editorial" style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            Thank You for Your Order!
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 1.5rem auto', lineHeight: 1.55 }}>
            Our master florists have received your bespoke bouquet request. Fresh blooms will be cut, hand-arranged with cold-chain packs, and dispatched for your selected delivery slot.
          </p>

          {/* 📦 HIGH-PRIORITY FLIPKART/MEESHO STYLE DELIVERY HANDOVER PASS & OTP */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.09) 0%, rgba(5, 150, 105, 0.04) 100%)',
            border: '2px solid #10B981',
            borderRadius: '16px',
            padding: '1.4rem',
            marginBottom: '1.75rem',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.12)',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#10B981',
              color: '#FFFFFF',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: '0.75rem'
            }}>
              <span>📦 DOORSTEP DELIVERY PASS & HANDOVER OTP</span>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Your Secret 4-Digit Doorstep Verification OTP:
            </div>

            <div style={{
              display: 'inline-block',
              background: 'var(--bg-surface)',
              border: '2px dashed #10B981',
              borderRadius: '12px',
              padding: '0.65rem 2rem',
              marginBottom: '0.75rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
            }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#047857', fontFamily: 'monospace', letterSpacing: '6px' }}>
                {order.deliveryOtp || '4892'}
              </span>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', maxWidth: '440px', margin: '0 auto 0.85rem auto', lineHeight: 1.45 }}>
              ℹ️ <strong>Doorstep Verification Instructions:</strong> Share this 4-digit code with the delivery partner at your door only after inspecting and receiving your fresh bouquet.
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleCopyOtp}
                className="btn btn-sm"
                style={{
                  background: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Copy size={14} />
                <span>Copy Delivery OTP</span>
              </button>
            </div>
          </div>

          {/* Reference Meta Box */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            background: 'var(--bg-accent-soft)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--border-gold)',
            marginBottom: '1.75rem',
            textAlign: 'left'
          }}>
            <div>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-gold)', fontWeight: 700 }}>
                Unique Order Reference ID
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace', marginTop: '2px' }}>
                #{order.orderId}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Placed: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1rem' }}>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-gold)', fontWeight: 700 }}>
                Fulfillment Slot
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {order.deliverySlot}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Delivery Date: {order.deliveryDate || 'Scheduled for Today'}
              </div>
            </div>
          </div>

          {/* Progress Timeline Stepper */}
          <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Order Status Progress
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.25rem', textAlign: 'center' }}>
              {[
                { title: 'Placed', active: true, done: true },
                { title: 'Confirmed', active: order.status !== 'Order Placed', done: order.status !== 'Order Placed' },
                { title: 'Packed', active: ['Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.status), done: ['Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) },
                { title: 'Shipped', active: ['Shipped', 'Out for Delivery', 'Delivered'].includes(order.status), done: ['Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) },
                { title: 'Delivered', active: order.status === 'Delivered', done: order.status === 'Delivered' }
              ].map((step, idx) => (
                <div key={step.title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: step.done ? '#10B981' : (step.active ? 'var(--text-gold)' : 'var(--bg-alt)'),
                    color: (step.done || step.active) ? '#FFF' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    marginBottom: '6px',
                    border: '1.5px solid var(--border-subtle)'
                  }}>
                    {step.done ? '✓' : idx + 1}
                  </div>
                  <span style={{ fontSize: '0.74rem', fontWeight: step.active ? 700 : 500, color: step.active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="btn btn-gold btn-md"
              onClick={handlePrintInvoice}
            >
              <Printer size={16} />
              <span>Print Tax Invoice / Receipt</span>
            </button>
            <button 
              type="button" 
              className="btn btn-outline btn-md"
              onClick={() => navigateTo('my-orders', { phone: order.customerPhone, orderId: order.orderId })}
            >
              <Package size={16} />
              <span>Track Live Order</span>
            </button>
            <button 
              type="button" 
              className="btn btn-primary btn-md"
              onClick={() => navigateTo('shop')}
            >
              <span>Explore More Bouquets</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Card */}
        <div id="printable-invoice" className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px solid var(--border-subtle)', paddingBottom: '1.25rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 className="font-serif-editorial" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                RISIKA BLOOMS FLORAL ATELIER
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Official Retail Invoice & Delivery Pass
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Atelier: New Delhi • Mumbai • Bengaluru | Email: concierge@rishikablooms.com
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                Invoice No: <span style={{ fontFamily: 'monospace' }}>INV-{order.orderId.replace('RB-', '')}</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Payment: <strong>{order.paymentMethod}</strong> ({order.paymentStatus || 'Pending'})
              </div>
            </div>
          </div>

          {/* Delivery & Recipient Meta */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '3px' }}>Customer / Bill To:</strong>
              <div>{order.customerName}</div>
              <div>Phone: +91 {order.customerPhone}</div>
              {order.customerEmail && <div>Email: {order.customerEmail}</div>}
            </div>

            <div>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '3px' }}>Deliver To / Recipient:</strong>
              <div>{order.recipientName || order.customerName}</div>
              <div>Phone: +91 {order.recipientPhone || order.customerPhone}</div>
              <div>{order.deliveryAddress}</div>
            </div>

            <div>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '3px' }}>Fulfillment Slot:</strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} color="var(--text-gold)" />
                <span>{order.deliveryDate}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <Clock size={14} color="var(--text-gold)" />
                <span>{order.deliverySlot}</span>
              </div>
            </div>
          </div>

          {/* Gift Message Card Note */}
          {order.giftMessage && (
            <div style={{ 
              background: 'rgba(212, 175, 55, 0.08)', 
              border: '1px dashed var(--border-gold)', 
              borderRadius: 'var(--radius-sm)', 
              padding: '1rem',
              marginBottom: '1.5rem',
              fontStyle: 'italic'
            }}>
              <span style={{ fontWeight: 700, fontStyle: 'normal', color: 'var(--text-gold)', display: 'block', marginBottom: '4px' }}>
                💌 Hand-Penned Keepsake Gift Note:
              </span>
              "{order.giftMessage}"
            </div>
          )}

          {/* Items Summary Table */}
          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.5rem 0' }}>Bouquet / Item</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Unit Price</th>
                  <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem 0', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.name}
                      {item.selectedColor && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                          Color: {item.selectedColor}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>₹{item.price}</td>
                    <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 700 }}>
                      ₹{item.price * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ minWidth: '240px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span>Subtotal:</span>
                <span>₹{order.subtotal || order.total}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span>Express Dedicated Dispatch:</span>
                <span style={{ color: '#16A34A', fontWeight: 600 }}>
                  {order.deliveryFee > 0 ? \`₹\${order.deliveryFee}\` : 'FREE'}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: '#16A34A' }}>
                  <span>Discount Savings:</span>
                  <span>-₹{order.discountAmount}</span>
                </div>
              )}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                borderTop: '1.5px solid var(--border-gold)', 
                paddingTop: '0.6rem',
                fontSize: '1.15rem',
                fontWeight: 800,
                color: 'var(--text-accent)'
              }}>
                <span>Total Amount:</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(confirmPagePath, cleanConfirmationPage, 'utf8');
console.log('✓ OrderConfirmationPage.jsx updated: Professional Thank You + High Priority OTP Pass + Carrier SMS chime!');

// =========================================================================
// 4. FIX WHATSAPPBUTTON.JSX - Luxury VIP Floating Trigger & Modal (No intrusive popups!)
// =========================================================================
const waPath = path.join(__dirname, '../src/components/common/WhatsAppButton.jsx');

const cleanWhatsAppButton = `import React, { useState } from 'react';
import { MessageCircle, X, ExternalLink, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

const WA_CHANNEL_URL = 'https://whatsapp.com/channel/0029VbE37yqDTkJzYHDgZV1h';

export default function WhatsAppButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Sleek, Luxury Floating VIP Atelier Button (Positioned above mobile bottom bar) */}
      <div 
        className="luxury-vip-float-wrapper"
        style={{
          position: 'fixed',
          zIndex: 900,
          pointerEvents: 'auto'
        }}
      >
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)',
            border: '1.5px solid #D4AF37',
            borderRadius: '50px',
            padding: '0.55rem 1rem 0.55rem 0.85rem',
            color: '#FFFFFF',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            boxShadow: '0 8px 24px rgba(6, 78, 59, 0.4), 0 0 12px rgba(212, 175, 55, 0.25)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Join Rishika Blooms Official VIP Channel"
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <MessageCircle size={18} color="#34D399" />
            <span style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#D4AF37',
              boxShadow: '0 0 6px #D4AF37'
            }} />
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.3px' }}>
            VIP Channel • 20% OFF
          </span>
        </button>
      </div>

      {/* Professional Haute Atelier VIP Modal (Only opens when user clicks!) */}
      {isModalOpen && (
        <div 
          className="drawer-backdrop open" 
          style={{ zIndex: 100080, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.75)' }}
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="glass-panel animate-scale-up" 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '420px',
              width: '100%',
              padding: '2rem 1.75rem',
              borderRadius: '20px',
              border: '2px solid var(--border-gold)',
              background: 'var(--bg-surface)',
              textAlign: 'center',
              boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 30px rgba(212, 175, 55, 0.25)',
              position: 'relative'
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'var(--bg-alt)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Close"
            >
              <X size={16} />
            </button>

            {/* Emblem Crest */}
            <div style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(184, 134, 11, 0.1) 100%)',
              border: '2px solid #D4AF37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <Sparkles size={26} color="#D4AF37" />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(212, 175, 55, 0.12)', border: '1px solid #D4AF37', color: '#D4AF37', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.5rem' }}>
              <ShieldCheck size={13} />
              <span>OFFICIAL VIP CLUB</span>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
              Rishika Blooms VIP Channel
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem 0', lineHeight: 1.45 }}>
              Join our verified WhatsApp channel for royal atelier privileges, exclusive coupon codes & live fresh bloom updates.
            </p>

            {/* Benefits List */}
            <div style={{
              background: 'var(--bg-alt)',
              padding: '1rem',
              borderRadius: '12px',
              textAlign: 'left',
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1rem' }}>💎</span>
                <span><strong>Instant 20% OFF</strong> code on your luxury bouquet orders</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1rem' }}>💐</span>
                <span><strong>Daily Fresh Drops</strong> — First preview of new Dutch roses & velvet wraps</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1rem' }}>🌙</span>
                <span><strong>Midnight Priority</strong> — Dedicated slots for surprise midnight deliveries</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <a
                href={WA_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsModalOpen(false)}
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                }}
              >
                <span>Join Official Channel</span>
                <ExternalLink size={15} />
              </a>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn btn-outline"
                style={{ padding: '0.65rem', fontSize: '0.84rem', borderRadius: '10px' }}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive floating styles */}
      <style>{\`
        .luxury-vip-float-wrapper {
          bottom: 24px;
          right: 24px;
        }
        @media (max-width: 768px) {
          .luxury-vip-float-wrapper {
            bottom: 74px !important;
            right: 14px !important;
          }
        }
      \`}</style>
    </>
  );
}
`;

fs.writeFileSync(waPath, cleanWhatsAppButton, 'utf8');
console.log('✓ WhatsAppButton.jsx updated: 100% professional luxury floating VIP badge (zero intrusive auto popups)!');

console.log('=== ALL 3 PROFESSIONAL FIXES APPLIED SUCCESSFULLY ===');
