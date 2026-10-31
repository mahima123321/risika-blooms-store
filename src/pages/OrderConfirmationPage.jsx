import React from 'react';
import { buildCustomerDeliveryOtpWhatsAppMessage, createWhatsAppUrl } from '../config/whatsapp';
import { useShop } from '../context/ShopContext';
import { 
  CheckCircle2, Printer, ArrowRight, ShieldCheck, 
  MapPin, Clock, Calendar, Gift, Phone, Package, Truck, Sparkles, MessageSquare, Send 
} from 'lucide-react';

export default function OrderConfirmationPage() {
  const { currentView, orders, navigateTo, triggerIncomingSmsNotification, showToast } = useShop();

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
                  if (triggerIncomingSmsNotification) {
                    triggerIncomingSmsNotification({
                      orderId: order.orderId,
                      deliveryOtp: order.deliveryOtp,
                      phone: order.customerPhone || order.recipientPhone,
                      customerName: order.customerName,
                      autoLaunchNative: false
                    });
                  }
                  const otpMsg = buildCustomerDeliveryOtpWhatsAppMessage({ order });
                  const targetPhone = order.customerPhone || order.recipientPhone;
                  const clean = String(targetPhone || '').replace(/\D/g, '');
                  const finalPh = clean.length === 10 ? `91${clean}` : clean;
                  if (finalPh) {
                    window.open(createWhatsAppUrl(otpMsg, finalPh), '_blank');
                  }
                  if (showToast) showToast('📲 Handover OTP sent to your phone & WhatsApp!', 'success');
                }}
                className="btn btn-sm"
                style={{
                  background: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
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
                <MessageSquare size={13} />
                <span>Receive OTP on WhatsApp</span>
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
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '3px' }}>Ship & Deliver To:</strong>
              <div>Recipient: {order.recipientName || order.customerName}</div>
              <div>{order.deliveryAddress}</div>
            </div>

            <div>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '3px' }}>Delivery Schedule:</strong>
              <div>Date: {order.deliveryDate}</div>
              <div>Slot: {order.deliverySlot}</div>
            </div>
          </div>

          {order.giftMessage && (
            <div style={{ background: 'var(--bg-accent-soft)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-gold)', marginBottom: '1.5rem', fontSize: '0.84rem' }}>
              <strong style={{ color: 'var(--text-gold)', display: 'block', marginBottom: '2px' }}>Personalized Card Inscription:</strong>
              <div style={{ fontStyle: 'italic', color: 'var(--text-primary)' }}>"{order.giftMessage}"</div>
            </div>
          )}

          {/* Itemized Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px' }}>Item Description</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Unit Price</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {item.selectedColor ? `Color: ${item.selectedColor}` : ''} {item.selectedSize ? `• Size: ${item.selectedSize}` : ''}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹{item.price}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>₹{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>Subtotal:</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>₹{order.subtotal || order.total}</td>
              </tr>
              {order.discountAmount > 0 && (
                <tr style={{ color: '#16A34A' }}>
                  <td colSpan={3} style={{ padding: '4px 12px', textAlign: 'right' }}>Discount ({order.couponCode || 'Promo'}):</td>
                  <td style={{ padding: '4px 12px', textAlign: 'right' }}>-₹{order.discountAmount}</td>
                </tr>
              )}
              <tr>
                <td colSpan={3} style={{ padding: '4px 12px', textAlign: 'right' }}>Express Delivery:</td>
                <td style={{ padding: '4px 12px', textAlign: 'right' }}>
                  {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee || 0}`}
                </td>
              </tr>
              <tr style={{ borderTop: '2px solid var(--border-subtle)', fontSize: '1.05rem', fontWeight: 800 }}>
                <td colSpan={3} style={{ padding: '10px 12px', textAlign: 'right' }}>Total Paid / Payable:</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-accent)' }}>₹{order.total}</td>
              </tr>
            </tfoot>
          </table>

          <div style={{ textAlign: 'center', fontSize: '0.76rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-subtle)', paddingTop: '1rem' }}>
            This is a computer-generated tax invoice for customer reference. Thank you for choosing Risika Blooms!
          </div>
        </div>
      </div>
    </div>
  );
}
