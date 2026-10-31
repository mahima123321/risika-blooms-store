const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/pages/OrderConfirmationPage.jsx');

const content = `import React from 'react';
import { useShop } from '../context/ShopContext';
import { 
  CheckCircle2, Printer, ArrowRight, ShieldCheck, 
  MapPin, Clock, Calendar, Gift, Phone, Package, Truck, Sparkles 
} from 'lucide-react';

export default function OrderConfirmationPage() {
  const { currentView, orders, navigateTo, showToast } = useShop();

  const targetOrderId = currentView?.params?.orderId;
  const order = (orders || []).find((o) => o.orderId === targetOrderId) || orders?.[0];

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

  return (
    <div className="order-confirmation-page animate-fade-in" style={{ padding: '2.5rem 0 6rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        
        {/* Success Card */}
        <div className="glass-panel" style={{ 
          padding: '2.5rem', 
          borderRadius: 'var(--radius-lg)', 
          textAlign: 'center',
          border: '2px solid var(--border-gold)',
          marginBottom: '2rem'
        }}>
          <div style={{
            width: '74px',
            height: '74px',
            borderRadius: '50%',
            background: 'rgba(22, 163, 74, 0.12)',
            border: '2px solid #16A34A',
            color: '#16A34A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}>
            <CheckCircle2 size={42} />
          </div>

          <span className="rose-badge" style={{ marginBottom: '0.6rem' }}>
            ✓ Order Successfully Logged & Verified
          </span>

          <h1 className="font-serif-editorial" style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            Thank You for Your Order!
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 1.5rem auto', lineHeight: 1.6 }}>
            Our master florists have received your bouquet request. Flowers will be freshly cut, hand-arranged with cold-chain packs, and dispatched for your scheduled slot.
          </p>

          {/* Reference & OTP Highlight Box */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            background: 'var(--bg-accent-soft)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1.5px dashed var(--border-gold)',
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-gold)', fontWeight: 700 }}>
                Unique Order Reference ID
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace', marginTop: '2px' }}>
                {order.orderId}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Placed: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1rem' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#10B981', fontWeight: 700 }}>
                Secret Delivery Handover OTP
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#059669', fontFamily: 'monospace', letterSpacing: '3px', marginTop: '2px' }}>
                {order.deliveryOtp || '4892'}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Share with rider at doorstep only after inspecting blooms
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(order.deliveryOtp || '4892');
                  if (showToast) showToast('📋 Delivery Handover OTP copied to clipboard!', 'success');
                }}
                className="btn btn-sm"
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#059669',
                  border: '1px solid #10B981',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  padding: '5px 12px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer'
                }}
              >
                <span>📋 Copy Handover OTP</span>
              </button>
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

fs.writeFileSync(pagePath, content, 'utf8');
console.log('OrderConfirmationPage.jsx rewritten cleanly with no errors!');

