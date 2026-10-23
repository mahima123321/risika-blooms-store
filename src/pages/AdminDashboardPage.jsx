import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  Shield, Lock, LogOut, Package, CheckCircle2, Truck, 
  DollarSign, Clock, AlertCircle, Search, Filter, Printer, 
  Download, Eye, Check, X, Plus, Edit3, Trash2, ArrowRight,
  TrendingUp, Layers, Settings, ChevronRight, Phone, MapPin, RefreshCw 
} from 'lucide-react';

const ORDER_STATUS_OPTIONS = [
  'Order Placed',
  'Payment Pending',
  'Order Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Refunded'
];

export default function AdminDashboardPage() {
  const { 
    isOwnerAuthenticated, 
    loginOwner, 
    logoutOwner, 
    ownerPin, 
    orders, 
    products, 
    updateOrderStatus, 
    deleteOwnerProduct, 
    openAddProductModal, 
    openEditProductModal,
    openOwnerSettingsModal,
    brandConfig, 
    showToast 
  } = useShop();

  // Authentication Pin Form State (when locked)
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Seller Dashboard Active Tab: 'orders' | 'products' | 'shipping' | 'payments' | 'reports'
  const [activeTab, setActiveTab] = useState('orders');

  // Orders Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Status Change Modal / Prompt
  const [statusChangeTarget, setStatusChangeTarget] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [courierProvider, setCourierProvider] = useState('Risika Express Dedicated Fleet');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Delivery OTP Verification State
  const [otpVerifyInput, setOtpVerifyInput] = useState('');

  // If Not Authenticated, show Security PIN Login
  if (!isOwnerAuthenticated) {
    const handlePinSubmit = (e) => {
      e.preventDefault();
      const currentExpected = ownerPin || 'risika2026';
      if (enteredPin === currentExpected) {
        loginOwner();
        setPinError('');
        setEnteredPin('');
        showToast('👑 Welcome back, Store Owner! Seller Command Hub Unlocked.', 'success');
      } else {
        setPinError('Incorrect Owner PIN. Default PIN is risika2026');
      }
    };

    return (
      <div className="admin-login-screen animate-fade-in" style={{ padding: '4rem 1rem 8rem 1rem', backgroundColor: 'var(--bg-primary)', display: 'flex', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '2px solid var(--border-gold)' }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'var(--bg-accent-soft)',
            border: '2px solid var(--border-gold)',
            color: 'var(--text-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}>
            <Shield size={36} />
          </div>

          <h2 className="font-serif-editorial" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            Store Owner & Seller Hub
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
            Enter your Owner Security PIN to access live order management, stock tracking, and store settings.
          </p>

          <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <input 
                type="password"
                required
                maxLength={20}
                placeholder="Enter PIN (Default: risika2026)"
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value);
                  setPinError('');
                }}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: pinError ? '1.5px solid #EF4444' : '1.5px solid var(--border-gold)',
                  background: 'var(--bg-alt)',
                  fontSize: '1.1rem',
                  textAlign: 'center',
                  letterSpacing: '4px',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              {pinError && (
                <div style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '6px' }}>
                  {pinError}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-gold btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Lock size={16} />
              <span>Unlock Seller Hub</span>
            </button>
          </form>

          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            🔒 Protected under Risika Blooms Merchant Security Protocol. Only authorized owners have access.
          </div>
        </div>
      </div>
    );
  }

  // Calculate Metrics from Live Orders
  const allOrders = orders || [];
  const totalOrdersCount = allOrders.length;
  const totalRevenue = allOrders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? (Number(o.total) || 0) : 0), 0);
  const newOrdersCount = allOrders.filter(o => o.status === 'Order Placed' || !o.status).length;
  const packedCount = allOrders.filter(o => o.status === 'Packed').length;
  const inTransitCount = allOrders.filter(o => ['Shipped', 'Out for Delivery'].includes(o.status)).length;
  const deliveredCount = allOrders.filter(o => o.status === 'Delivered').length;
  const cancelledCount = allOrders.filter(o => o.status === 'Cancelled').length;

  // Filtered Orders List
  const filteredOrders = allOrders.filter((ord) => {
    // Status Filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'new' && ord.status !== 'Order Placed') return false;
      if (statusFilter === 'shipped' && !['Shipped', 'Out for Delivery'].includes(ord.status)) return false;
      if (statusFilter !== 'new' && statusFilter !== 'shipped' && ord.status !== statusFilter) return false;
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = String(ord.orderId || '').toLowerCase().includes(q);
      const matchName = String(ord.customerName || '').toLowerCase().includes(q);
      const matchPhone = String(ord.customerPhone || '').includes(q);
      const matchPincode = String(ord.pincode || '').includes(q);
      return matchId || matchName || matchPhone || matchPincode;
    }

    return true;
  });

  // Export Orders to CSV
  const handleExportCSV = () => {
    if (allOrders.length === 0) {
      showToast('No orders available to export', 'info');
      return;
    }

    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Address', 'Pincode', 'Items', 'Total Amount', 'Payment Method', 'Payment Status', 'Order Status', 'Delivery OTP'];
    const rows = allOrders.map(o => [
      `"${o.orderId}"`,
      `"${new Date(o.createdAt).toLocaleDateString('en-IN')}"`,
      `"${o.customerName || ''}"`,
      `"${o.customerPhone || ''}"`,
      `"${(o.deliveryAddress || '').replace(/"/g, '""')}"`,
      `"${o.pincode || ''}"`,
      `"${(o.items || []).map(i => `${i.name} (x${i.quantity})`).join(', ').replace(/"/g, '""')}"`,
      `"${o.total || 0}"`,
      `"${o.paymentMethod || ''}"`,
      `"${o.paymentStatus || 'Pending'}"`,
      `"${o.status || 'Order Placed'}"`,
      `"${o.deliveryOtp || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Risika_Blooms_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📊 Orders exported to CSV successfully!', 'success');
  };

  // Status Change Handler
  const handleConfirmStatusChange = () => {
    if (!statusChangeTarget || !newStatus) return;

    const updates = {
      status: newStatus,
      statusHistory: [
        ...(statusChangeTarget.statusHistory || []),
        {
          status: newStatus,
          timestamp: new Date().toISOString(),
          note: statusNote || `Status updated to ${newStatus} by Store Owner`,
          updatedBy: 'Store Owner'
        }
      ]
    };

    if (newStatus === 'Shipped') {
      updates.courier = {
        provider: courierProvider || 'Risika Express Dedicated Fleet',
        trackingNumber: trackingNumber || `TRK-${statusChangeTarget.orderId.replace('RB-', '')}`,
        trackingUrl: `#/order-tracking?orderId=${statusChangeTarget.orderId}`
      };
    }

    if (newStatus === 'Delivered') {
      updates.deliveredAt = new Date().toISOString();
      updates.paymentStatus = 'Paid';
    }

    if (updateOrderStatus) {
      updateOrderStatus(statusChangeTarget.orderId, updates);
    }

    showToast(`Order #${statusChangeTarget.orderId} updated to "${newStatus}"!`, 'success');
    setStatusChangeTarget(null);
    setNewStatus('');
    setStatusNote('');
  };

  // Delivery OTP Verification
  const handleVerifyOtp = (order) => {
    if (otpVerifyInput.trim() === String(order.deliveryOtp)) {
      if (updateOrderStatus) {
        updateOrderStatus(order.orderId, {
          status: 'Delivered',
          deliveredAt: new Date().toISOString(),
          paymentStatus: 'Paid',
          otpVerified: true
        });
      }
      setOtpVerifyInput('');
      showToast(`✓ OTP Verified! Order #${order.orderId} marked Delivered!`, 'success');
    } else {
      showToast('❌ Incorrect Delivery OTP entered. Please check with customer.', 'error');
    }
  };

  return (
    <div className="admin-dashboard-page animate-fade-in" style={{ padding: '2rem 0 6rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: '1240px' }}>
        
        {/* Top Bar Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1.5rem',
          borderBottom: '1.5px solid var(--border-subtle)',
          marginBottom: '1.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'var(--rb-gold-gradient)', color: '#1A0E05', padding: '4px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '0.75rem' }}>
                👑 SELLER HUB
              </div>
              <h1 className="font-serif-editorial" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {brandConfig?.name || 'Risika Blooms'} Merchant Order Management
              </h1>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
              Meesho & Flipkart Style Unified E-Commerce Command Center
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="btn btn-outline btn-sm"
              onClick={handleExportCSV}
              title="Download Orders Excel CSV"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button 
              type="button" 
              className="btn btn-gold btn-sm"
              onClick={() => openAddProductModal()}
              title="Add a new bouquet with custom photo and price"
            >
              <Plus size={14} />
              <span>+ Add Bouquet</span>
            </button>

            <button 
              type="button" 
              className="btn btn-outline btn-sm"
              onClick={() => openOwnerSettingsModal('numbers')}
              title="Store Configuration & PIN"
            >
              <Settings size={14} />
              <span>Settings</span>
            </button>

            <button 
              type="button" 
              className="btn btn-outline btn-sm"
              onClick={() => {
                logoutOwner();
                showToast('🔒 Owner Studio locked. Returned to Customer Mode.', 'info');
              }}
              style={{ color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              title="Lock Seller Hub"
            >
              <LogOut size={14} />
              <span>Lock Studio</span>
            </button>
          </div>
        </div>

        {/* 6 Key Flipkart / Meesho Business Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Orders</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>{totalOrdersCount}</div>
            <div style={{ fontSize: '0.72rem', color: '#16A34A', marginTop: '2px' }}>Live in registry</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Gross Revenue</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-accent)', marginTop: '4px' }}>₹{totalRevenue}</div>
            <div style={{ fontSize: '0.72rem', color: '#16A34A', marginTop: '2px' }}>Verified orders</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #D97706' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>New / Placed</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>{newOrdersCount}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Awaiting packing</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #8B5CF6' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Packed in Box</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#8B5CF6', marginTop: '4px' }}>{packedCount}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Ready for courier</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #2563EB' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>In Transit / Rider</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>{inTransitCount}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>On the road</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #16A34A' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Delivered</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16A34A', marginTop: '4px' }}>{deliveredCount}</div>
            <div style={{ fontSize: '0.72rem', color: '#16A34A', marginTop: '2px' }}>Completed successfully</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.85rem',
          marginBottom: '1.5rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          {[
            { id: 'orders', label: `📦 Orders Management (${allOrders.length})` },
            { id: 'products', label: `💐 Bouquet Inventory (${products.length})` },
            { id: 'shipping', label: '🚚 Shipping & Serviceable PINs' },
            { id: 'payments', label: '💳 Payment Gateway & UPI' },
            { id: 'reports', label: '📊 Sales Reports' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`filter-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: ORDERS MANAGEMENT (Meesho / Flipkart Seller Order Workflow) */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in">
            {/* Status Tabs & Search Filter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'All Orders' },
                  { id: 'new', label: 'New / Placed' },
                  { id: 'Confirmed', label: 'Confirmed' },
                  { id: 'Packed', label: 'Packed' },
                  { id: 'shipped', label: 'Shipped' },
                  { id: 'Delivered', label: 'Delivered' },
                  { id: 'Cancelled', label: 'Cancelled' }
                ].map((st) => (
                  <button 
                    key={st.id}
                    type="button" 
                    className="btn btn-outline btn-sm"
                    onClick={() => setStatusFilter(st.id)}
                    style={{
                      background: statusFilter === st.id ? 'var(--text-gold)' : 'transparent',
                      color: statusFilter === st.id ? '#1A0E05' : 'var(--text-secondary)',
                      borderColor: statusFilter === st.id ? 'var(--text-gold)' : 'var(--border-subtle)',
                      fontWeight: 700
                    }}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-alt)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0 10px', minWidth: '260px' }}>
                <Search size={15} color="var(--text-muted)" />
                <input 
                  type="text" 
                  placeholder="Search by Order ID, Phone, Customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', background: 'transparent', border: 'none', fontSize: '0.84rem', outline: 'none' }}
                />
              </div>
            </div>

            {/* Orders Table */}
            {filteredOrders.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
                <Package size={42} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>No Orders Match Your Filter</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>All live orders placed by customers appear here automatically.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredOrders.map((order) => (
                  <div 
                    key={order.orderId}
                    className="glass-panel"
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem', marginBottom: '0.85rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                            #{order.orderId}
                          </strong>
                          <span style={{ fontSize: '0.75rem', background: 'var(--bg-alt)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Customer: <strong>{order.customerName}</strong> • Phone: <a href={`tel:${order.customerPhone}`} style={{ color: 'var(--text-gold)', textDecoration: 'none' }}>+91 {order.customerPhone}</a>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          background: order.status === 'Delivered' ? 'rgba(22, 163, 74, 0.1)' : (order.status === 'Cancelled' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-accent-soft)'),
                          color: order.status === 'Delivered' ? '#16A34A' : (order.status === 'Cancelled' ? '#DC2626' : 'var(--text-gold)'),
                          border: '1px solid currentColor'
                        }}>
                          ● {order.status || 'Order Placed'}
                        </span>

                        <strong style={{ fontSize: '1.25rem', color: 'var(--text-accent)' }}>
                          ₹{order.total}
                        </strong>
                      </div>
                    </div>

                    {/* Order Details Body */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      <div>
                        <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>Items ({order.items?.length || 0}):</strong>
                        {(order.items || []).map((itm, i) => (
                          <div key={i}>
                            • {itm.name} (x{itm.quantity}) {itm.selectedColor ? `[${itm.selectedColor}]` : ''} — ₹{itm.price * itm.quantity}
                          </div>
                        ))}
                      </div>

                      <div>
                        <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>Delivery Destination:</strong>
                        <div>{order.deliveryAddress}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Slot: <strong>{order.deliverySlot}</strong> ({order.deliveryDate})
                        </div>
                      </div>

                      <div style={{ background: 'var(--bg-alt)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                          Customer Delivery OTP
                        </div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#047857', fontFamily: 'monospace', letterSpacing: '2px' }}>
                          {order.deliveryOtp || '4892'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Method: {order.paymentMethod}
                        </div>
                      </div>
                    </div>

                    {/* Seller Action Bar */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.6rem',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '0.85rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {/* Status Transition Shortcut Buttons */}
                        {order.status === 'Order Placed' && (
                          <button 
                            type="button" 
                            className="btn btn-gold btn-sm"
                            onClick={() => {
                              setStatusChangeTarget(order);
                              setNewStatus('Order Confirmed');
                            }}
                          >
                            ✓ Confirm Order
                          </button>
                        )}

                        {['Order Placed', 'Order Confirmed'].includes(order.status) && (
                          <button 
                            type="button" 
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                              setStatusChangeTarget(order);
                              setNewStatus('Packed');
                            }}
                          >
                            📦 Mark as Packed
                          </button>
                        )}

                        {order.status === 'Packed' && (
                          <button 
                            type="button" 
                            className="btn btn-gold btn-sm"
                            onClick={() => {
                              setStatusChangeTarget(order);
                              setNewStatus('Shipped');
                            }}
                          >
                            🚚 Ship with Courier
                          </button>
                        )}

                        {['Shipped', 'Out for Delivery'].includes(order.status) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input 
                              type="text" 
                              maxLength={4} 
                              placeholder="Enter 4-Digit OTP" 
                              value={otpVerifyInput}
                              onChange={(e) => setOtpVerifyInput(e.target.value.replace(/\D/g, ''))}
                              style={{ width: '120px', padding: '4px 8px', fontSize: '0.78rem', borderRadius: '4px', border: '1px solid #10B981', background: 'var(--bg-alt)', textAlign: 'center' }}
                            />
                            <button 
                              type="button" 
                              className="btn btn-sm"
                              onClick={() => handleVerifyOtp(order)}
                              style={{ background: '#10B981', color: '#FFF', border: 'none', fontSize: '0.78rem' }}
                            >
                              Verify & Mark Delivered
                            </button>
                          </div>
                        )}

                        <button 
                          type="button" 
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            setStatusChangeTarget(order);
                            setNewStatus(order.status);
                          }}
                        >
                          Change Status...
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button 
                          type="button" 
                          className="btn btn-outline btn-sm"
                          onClick={() => window.print()}
                          title="Print Customer Invoice"
                        >
                          <Printer size={13} />
                          <span>Invoice</span>
                        </button>

                        {order.status !== 'Cancelled' && (
                          <button 
                            type="button" 
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                              if (window.confirm(`Cancel order #${order.orderId}?`)) {
                                if (updateOrderStatus) {
                                  updateOrderStatus(order.orderId, { status: 'Cancelled', cancellationReason: 'Cancelled by Merchant' });
                                }
                                showToast(`Order #${order.orderId} cancelled`, 'info');
                              }
                            }}
                            style={{ color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BOUQUET INVENTORY MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Catalog & Stock Levels ({products.length} Bouquets)
              </h3>
              <button 
                type="button" 
                className="btn btn-gold btn-sm"
                onClick={() => openAddProductModal()}
              >
                <Plus size={14} />
                <span>Add New Bouquet</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {products.map((prod) => (
                <div 
                  key={prod.id}
                  className="glass-panel"
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '0.75rem' }}>
                    <img 
                      src={prod.image} 
                      alt={prod.name} 
                      style={{ width: '64px', height: '64px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-gold)', fontWeight: 700 }}>
                        {prod.categoryName || 'Bouquet'}
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {prod.name}
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-accent)', marginTop: '2px' }}>
                        ₹{prod.price} {prod.originalPrice ? <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{prod.originalPrice}</span> : null}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
                    <span style={{ fontSize: '0.75rem', color: (prod.stock ?? 25) <= 5 ? '#EF4444' : '#16A34A', fontWeight: 700 }}>
                      Stock: {prod.stock ?? 25} available
                    </span>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button 
                        type="button" 
                        className="btn btn-outline btn-sm"
                        onClick={() => openEditProductModal(prod)}
                        style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                      >
                        <Edit3 size={12} />
                        <span>Edit</span>
                      </button>

                      <button 
                        type="button" 
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          if (window.confirm(`Delete "${prod.name}" from catalog?`)) {
                            deleteOwnerProduct(prod.id);
                          }
                        }}
                        style={{ padding: '3px 8px', fontSize: '0.74rem', color: '#EF4444' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SHIPPING & PIN CODES */}
        {activeTab === 'shipping' && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              🚚 Shipping, Couriers & Serviceable PIN Coverage
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Configure express shipping fees, Shiprocket courier integration, and Indian PIN codes coverage.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: 'var(--bg-alt)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>Courier Provider Mode</h4>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Choose whether shipments are booked via automatic Shiprocket API or dispatched through local concierge cold-chain riders.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input type="radio" name="courierMode" defaultChecked />
                    <span>Dedicated Local Floral Concierge Riders (Recommended for fresh flowers)</span>
                  </label>
                  <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input type="radio" name="courierMode" />
                    <span>Shiprocket API Pan-India Air Courier</span>
                  </label>
                </div>
              </div>

              <div style={{ background: 'var(--bg-alt)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>Delivery Pricing Rules</h4>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Standard Express Delivery: <strong>₹{brandConfig?.delivery?.standardFee || 99}</strong>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Free Delivery On Orders Above: <strong>₹{brandConfig?.delivery?.freeThreshold || 1499}</strong>
                </div>
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm"
                  onClick={() => openOwnerSettingsModal('store')}
                >
                  Edit Rates in Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PAYMENTS & RAZORPAY */}
        {activeTab === 'payments' && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              💳 Payment Gateways & Store Direct UPI
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Manage online payments via Razorpay test/production mode, direct QR code UPI, and Cash on Delivery.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: 'var(--bg-alt)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>Store Direct UPI ID</h4>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Customers can scan QR at checkout to send payments directly to your bank account without gateway commissions.
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-gold)', fontFamily: 'monospace', marginBottom: '1rem' }}>
                  {brandConfig?.upiId || 'roshikablooms@upi'}
                </div>
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm"
                  onClick={() => openOwnerSettingsModal('numbers')}
                >
                  Change Store UPI ID
                </button>
              </div>

              <div style={{ background: 'var(--bg-alt)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>Razorpay Payment Gateway</h4>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Status: <strong style={{ color: '#16A34A' }}>Test Mode Verified Active</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Accepts Visa, Mastercard, RuPay, UPI, NetBanking, and Wallets.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: REPORTS & SUMMARY */}
        {activeTab === 'reports' && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              📊 Business & Accounting Reports
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Summary of floral orders, net sales, and fulfillment performance.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-alt)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Gross Sales</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹{totalRevenue}</div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-alt)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Delivered Orders</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16A34A' }}>{deliveredCount}</div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-alt)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Average Order Value</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-gold)' }}>
                  ₹{totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0}
                </div>
              </div>
            </div>

            <button 
              type="button" 
              className="btn btn-gold btn-md"
              onClick={handleExportCSV}
            >
              <Download size={16} />
              <span>Download Detailed Excel CSV Report</span>
            </button>
          </div>
        )}

        {/* Modal: Status Change Dialog */}
        {statusChangeTarget && (
          <div className="drawer-backdrop open" style={{ zIndex: 100020 }} onClick={() => setStatusChangeTarget(null)}>
            <div 
              className="glass-panel" 
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '480px',
                width: '90%',
                margin: '10vh auto',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid var(--border-gold)',
                background: 'var(--bg-surface)'
              }}
            >
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Update Status for Order #{statusChangeTarget.orderId}
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Customer: <strong>{statusChangeTarget.customerName}</strong> ({statusChangeTarget.customerPhone})
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                    Select New Order Status
                  </label>
                  <select 
                    value={newStatus} 
                    onChange={(e) => setNewStatus(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-alt)', fontSize: '0.88rem' }}
                  >
                    {ORDER_STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {newStatus === 'Shipped' && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                        Courier Provider Name
                      </label>
                      <input 
                        type="text" 
                        value={courierProvider}
                        onChange={(e) => setCourierProvider(e.target.value)}
                        placeholder="e.g. Risika Express Rider / Shiprocket / Bluedart"
                        style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-alt)', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                        Tracking Number
                      </label>
                      <input 
                        type="text" 
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder={`e.g. TRK-${statusChangeTarget.orderId.replace('RB-', '')}`}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-alt)', fontSize: '0.88rem' }}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                    Internal Note / Reason (Optional)
                  </label>
                  <input 
                    type="text" 
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Flowers packed in cold box, rider assigned"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-alt)', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm"
                  onClick={() => setStatusChangeTarget(null)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-gold btn-sm"
                  onClick={handleConfirmStatusChange}
                >
                  Save Status Update
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
