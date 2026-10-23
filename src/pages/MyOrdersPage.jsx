import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  Package, Search, Clock, CheckCircle2, Truck, 
  MapPin, Printer, ArrowRight, ShieldCheck, AlertCircle, XCircle 
} from 'lucide-react';

export default function MyOrdersPage() {
  const { orders, currentView, navigateTo, showToast } = useShop();

  const initialSearch = currentView?.params?.orderId || currentView?.params?.phone || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const cleanQuery = searchQuery.trim().toLowerCase();

  const filteredOrders = (orders || []).filter((o) => {
    if (!cleanQuery) return true;
    const matchId = String(o.orderId || '').toLowerCase().includes(cleanQuery);
    const matchPhone = String(o.customerPhone || '').includes(cleanQuery);
    const matchName = String(o.customerName || '').toLowerCase().includes(cleanQuery);
    return matchId || matchPhone || matchName;
  });

  const activeOrder = selectedOrder || filteredOrders[0];

  const handleCancelOrder = (orderId) => {
    if (window.confirm(`Are you sure you wish to request cancellation for Order #${orderId}?`)) {
      showToast(`Cancellation requested for Order #${orderId}. Our concierge will review immediately.`, 'info');
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Delivered':
        return { background: 'rgba(22, 163, 74, 0.1)', color: '#16A34A', border: '1px solid #16A34A' };
      case 'Out for Delivery':
      case 'Shipped':
        return { background: 'rgba(59, 130, 246, 0.1)', color: '#2563EB', border: '1px solid #3B82F6' };
      case 'Packed':
      case 'Confirmed':
        return { background: 'rgba(217, 119, 6, 0.1)', color: '#D97706', border: '1px solid #D97706' };
      case 'Cancelled':
        return { background: 'rgba(239, 68, 68, 0.1)', color: '#DC2626', border: '1px solid #EF4444' };
      default:
        return { background: 'var(--bg-accent-soft)', color: 'var(--text-gold)', border: '1px solid var(--border-gold)' };
    }
  };

  return (
    <div className="my-orders-page animate-fade-in" style={{ padding: '2rem 0 6rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <span className="section-pretitle">Customer Portal</span>
          <h1 className="font-serif-editorial" style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            My Orders & Live Floral Tracking
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Track order status, view delivery OTP, courier dispatch, and print tax invoices.
          </p>
        </div>

        {/* Lookup Box */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px', display: 'flex', alignItems: 'center', background: 'var(--bg-alt)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0 12px' }}>
              <Search size={16} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Enter 10-digit Mobile Number or Order ID (e.g. RB-2026-XXXXXX)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: 'none', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>
            {searchQuery && (
              <button 
                type="button" 
                className="btn btn-outline btn-sm"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </button>
            )}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="glass-panel" style={{ padding: '4rem 1rem', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
            <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              No Orders Found Matching "{searchQuery}"
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Verify your mobile number or order reference, or explore our fresh bouquet collections.
            </p>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => navigateTo('shop')}
            >
              Start Shopping Now
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
            
            {/* Orders List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Your Orders ({filteredOrders.length})
              </h3>

              {filteredOrders.map((ord) => {
                const isSelected = activeOrder?.orderId === ord.orderId;
                return (
                  <div 
                    key={ord.orderId}
                    className="glass-panel"
                    onClick={() => setSelectedOrder(ord)}
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid var(--text-gold)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'var(--bg-accent-soft)' : 'var(--bg-surface)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                          #{ord.orderId}
                        </strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>

                      <span style={{
                        ...getStatusBadgeStyle(ord.status),
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        ● {ord.status || 'Order Placed'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                      {(ord.items || []).map(i => `${i.name} (${i.quantity}x)`).join(', ')}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Delivery Slot: <strong>{ord.deliverySlot?.split('(')[0] || 'Standard'}</strong>
                      </span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--text-accent)' }}>
                        ₹{ord.total}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Order Detailed View */}
            {activeOrder && (
              <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-gold)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Live Order Details
                    </span>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace', margin: '2px 0 0 0' }}>
                      {activeOrder.orderId}
                    </h2>
                  </div>

                  <span style={{
                    ...getStatusBadgeStyle(activeOrder.status),
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}>
                    ● {activeOrder.status || 'Order Placed'}
                  </span>
                </div>

                {/* Secret Delivery OTP Box */}
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1.5px dashed #10B981',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                      Secret Delivery Handover OTP
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#047857', fontFamily: 'monospace', letterSpacing: '3px' }}>
                      {activeOrder.deliveryOtp || '4892'}
                    </div>
                  </div>
                  <div style={{ maxWidth: '220px', fontSize: '0.74rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                    Share this with the rider at your door only after receiving your bouquet.
                  </div>
                </div>

                {/* Visual Progress Timeline */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                    Fulfillment Timeline
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.2rem', textAlign: 'center' }}>
                    {[
                      { title: 'Placed', done: true },
                      { title: 'Confirmed', done: activeOrder.status !== 'Order Placed' },
                      { title: 'Packed', done: ['Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(activeOrder.status) },
                      { title: 'Shipped', done: ['Shipped', 'Out for Delivery', 'Delivered'].includes(activeOrder.status) },
                      { title: 'Delivered', done: activeOrder.status === 'Delivered' }
                    ].map((st, i) => (
                      <div key={st.title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: st.done ? '#10B981' : 'var(--bg-alt)',
                          color: st.done ? '#FFF' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          marginBottom: '4px',
                          border: '1px solid var(--border-subtle)'
                        }}>
                          {st.done ? '✓' : i + 1}
                        </div>
                        <span style={{ fontSize: '0.68rem', fontWeight: st.done ? 700 : 500, color: st.done ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {st.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Courier / Shipping Tracking */}
                <div style={{ background: 'var(--bg-alt)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    <Truck size={15} color="var(--text-gold)" />
                    <span>Courier & Dispatch Details</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div><strong>Courier Partner:</strong> {activeOrder.courier?.provider || 'Risika Blooms Dedicated Express Rider'}</div>
                    <div><strong>Tracking Ref:</strong> {activeOrder.courier?.trackingNumber || `TRK-${activeOrder.orderId.replace('RB-', '')}`}</div>
                    <div><strong>Delivery Slot:</strong> {activeOrder.deliverySlot || 'Standard Delivery'}</div>
                  </div>
                </div>

                {/* Destination & Recipient */}
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                    Destination:
                  </div>
                  <div>Recipient: <strong>{activeOrder.recipientName || activeOrder.customerName}</strong></div>
                  <div>Address: {activeOrder.deliveryAddress}</div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button 
                    type="button" 
                    className="btn btn-gold btn-sm"
                    onClick={() => window.print()}
                  >
                    <Printer size={14} />
                    <span>Print Invoice</span>
                  </button>

                  {['Order Placed', 'Confirmed'].includes(activeOrder.status) && (
                    <button 
                      type="button" 
                      className="btn btn-outline btn-sm"
                      onClick={() => handleCancelOrder(activeOrder.orderId)}
                      style={{ color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                    >
                      <XCircle size={14} />
                      <span>Request Cancellation</span>
                    </button>
                  )}

                  <button 
                    type="button" 
                    className="btn btn-outline btn-sm"
                    onClick={() => navigateTo('contact')}
                  >
                    Contact Concierge
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
