import React, { useState, useMemo, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import confetti from 'canvas-confetti';
import { 
  Truck, Package, Clock, ShieldCheck, CheckCircle2, MapPin, Sparkles, 
  Search, Filter, ArrowRight, ChevronRight, Star, Heart, ShoppingBag, 
  Plus, Minus, Trash2, Edit3, AlertCircle, XCircle, RotateCcw, Check, 
  Copy, Printer, CreditCard, Smartphone, Banknote, QrCode, Calendar, 
  Phone, User, Tag, ChevronDown, Layers, Home, Share2, Navigation, Eye, 
  ExternalLink, Zap
} from 'lucide-react';

export default function DeliveryInfoPage() {
  const { 
    products = [], 
    categories = [], 
    cart = [], 
    cartCount = 0, 
    cartTotal = 0, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    wishlist = [], 
    toggleWishlist, 
    isInWishlist,
    orders = [], 
    createOrder, 
    updateOrderStatus,
    checkDeliveryPincode,
    showToast,
    navigateTo,
    brandConfig = {}
  } = useShop();

  // Active Tab: 'store' | 'cart' | 'checkout' | 'orders' | 'addresses' | 'wishlist' | 'pincode'
  const [activeTab, setActiveTab] = useState('store');

  // Search & Filter state for Product Listing
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'price-low' | 'price-high' | 'rating'
  const [expressOnly, setExpressOnly] = useState(false);
  const [priceRange, setPriceRange] = useState('all'); // 'all' | 'under-999' | '1000-1999' | '2000-plus'

  // Saved Addresses State (persisted in localStorage)
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const stored = localStorage.getItem('risika_delivery_addresses');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Address load error:', e);
    }
    return [
      {
        id: 'addr-1',
        name: 'Pragya Katiyar',
        phone: '9305371705',
        house: 'Flat 402, Royal Palms Residency',
        street: 'Vasant Kunj Sector C, Pocket 2',
        landmark: 'Near DLF Promenade Mall',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110070',
        type: 'Home',
        isDefault: true
      },
      {
        id: 'addr-2',
        name: 'Corporate Office Concierge',
        phone: '9876543210',
        house: 'Tower B, 7th Floor, Cyber City',
        street: 'DLF Phase 2, MG Road',
        landmark: 'Opposite Cyber Hub Metro Station',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122002',
        type: 'Work',
        isDefault: false
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('risika_delivery_addresses', JSON.stringify(savedAddresses));
    } catch (e) {
      console.warn('Address save error:', e);
    }
  }, [savedAddresses]);

  const defaultAddr = useMemo(() => {
    return savedAddresses.find(a => a.isDefault) || savedAddresses[0] || null;
  }, [savedAddresses]);

  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddr?.id || 'addr-1');

  // Address Modal (Add / Edit)
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    house: '',
    street: '',
    landmark: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110070',
    type: 'Home'
  });

  // Checkout Form State
  const [checkoutSlot, setCheckoutSlot] = useState('express'); // 'express' | 'standard' | 'midnight'
  const [paymentMode, setPaymentMode] = useState('cod'); // 'cod' | 'upi' | 'online'
  const [giftNote, setGiftNote] = useState('');
  const [customRecipientPhone, setCustomRecipientPhone] = useState('');
  const [customRecipientName, setCustomRecipientName] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [upiUtrNumber, setUpiUtrNumber] = useState('');

  // Orders Tab State: Tracking & Action Modals
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Found better price elsewhere');
  const [returningOrder, setReturningOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('Floral packaging was slightly creased');
  const [returnComment, setReturnComment] = useState('');

  // PIN Coverage Checker tab state
  const [pincodeQuery, setPincodeQuery] = useState('110070');
  const [pincodeResult, setPincodeResult] = useState(null);

  useEffect(() => {
    if (checkDeliveryPincode) {
      setPincodeResult(checkDeliveryPincode('110070'));
    }
  }, [checkDeliveryPincode]);

  // Set default selected address when addresses change
  useEffect(() => {
    if (defaultAddr && !savedAddresses.find(a => a.id === selectedAddressId)) {
      setSelectedAddressId(defaultAddr.id);
    }
  }, [defaultAddr, savedAddresses, selectedAddressId]);

  // Current active delivery address object
  const activeAddress = useMemo(() => {
    return savedAddresses.find(a => a.id === selectedAddressId) || defaultAddr || {
      name: 'Valued Patron',
      phone: '9305371705',
      house: 'Block 4, Vasant Kunj',
      street: 'Sector C',
      landmark: 'Near DLF Mall',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110070',
      type: 'Home'
    };
  }, [savedAddresses, selectedAddressId, defaultAddr]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return (products || []).filter(product => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (product.name || '').toLowerCase().includes(q);
        const matchesDesc = (product.description || '').toLowerCase().includes(q);
        const matchesCategory = (product.categoryName || product.category || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCategory) return false;
      }
      // Category filter
      if (selectedCategory !== 'all') {
        if (product.category !== selectedCategory && product.categoryName !== selectedCategory) {
          return false;
        }
      }
      // Express filter
      if (expressOnly) {
        if (!product.isTrending && !product.isBestSeller && product.price > 2500) {
          // treat non-bestsellers as standard
        }
      }
      // Price range filter
      if (priceRange === 'under-999') {
        if (product.price > 999) return false;
      } else if (priceRange === '1000-1999') {
        if (product.price < 1000 || product.price > 1999) return false;
      } else if (priceRange === '2000-plus') {
        if (product.price < 2000) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 4.5) - (a.rating || 4.5);
      return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
    });
  }, [products, searchQuery, selectedCategory, expressOnly, priceRange, sortBy]);

  // Wishlisted Products
  const wishlistedProducts = useMemo(() => {
    return (products || []).filter(p => isInWishlist(p.id));
  }, [products, wishlist, isInWishlist]);

  // Filtered Orders for My Orders tab
  const filteredOrders = useMemo(() => {
    const q = orderSearchQuery.toLowerCase().trim();
    if (!q) return orders || [];
    return (orders || []).filter(o => {
      const matchId = String(o.orderId || o.order_id || '').toLowerCase().includes(q);
      const matchPhone = String(o.customerPhone || o.customer_phone || '').includes(q);
      const matchName = String(o.customerName || o.customer_name || '').toLowerCase().includes(q);
      return matchId || matchPhone || matchName;
    });
  }, [orders, orderSearchQuery]);

  // Calculation of Cart MRP vs Selling Price
  const { totalMrp, totalSavings } = useMemo(() => {
    let mrp = 0;
    (cart || []).forEach(item => {
      const itemMrp = item.originalPrice || Math.round(item.price * 1.35);
      mrp += itemMrp * (item.quantity || 1);
    });
    const savings = Math.max(0, mrp - cartTotal);
    return { totalMrp: mrp || cartTotal, totalSavings: savings };
  }, [cart, cartTotal]);

  // Handle Add to Cart
  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    addToCart(product);
    showToast(`🛍️ ${product.name} added to Delivery Cart!`, 'success');
  };

  // Handle Buy Now (Instant Add & Navigate to Checkout)
  const handleBuyNow = (product, e) => {
    if (e) e.stopPropagation();
    addToCart(product);
    setActiveTab('checkout');
    showToast(`⚡ Proceeding to Express Checkout for ${product.name}`, 'info');
  };

  // Handle Move Wishlist Item to Cart
  const handleMoveWishlistToCart = (product) => {
    addToCart(product);
    toggleWishlist(product.id);
    showToast(`Moved ${product.name} to Cart!`, 'success');
  };

  // Handle Address Save (Add / Edit)
  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!addressForm.name || !addressForm.phone || !addressForm.house || !addressForm.pincode) {
      showToast('Please fill all mandatory address fields.', 'error');
      return;
    }
    if (addressForm.phone.replace(/\D/g, '').length !== 10) {
      showToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }
    if (addressForm.pincode.replace(/\D/g, '').length !== 6) {
      showToast('Please enter a valid 6-digit Indian PIN code.', 'error');
      return;
    }

    if (editingAddress) {
      setSavedAddresses(prev => prev.map(a => a.id === editingAddress.id ? { ...addressForm, id: a.id } : a));
      showToast('Delivery address updated successfully!', 'success');
    } else {
      const newAddr = {
        ...addressForm,
        id: `addr-${Date.now()}`,
        isDefault: savedAddresses.length === 0
      };
      setSavedAddresses(prev => [newAddr, ...prev]);
      setSelectedAddressId(newAddr.id);
      showToast('New delivery address added!', 'success');
    }

    setShowAddressModal(false);
    setEditingAddress(null);
  };

  // Delete Address
  const handleDeleteAddress = (id) => {
    if (savedAddresses.length <= 1) {
      showToast('You must maintain at least one delivery address.', 'error');
      return;
    }
    setSavedAddresses(prev => prev.filter(a => a.id !== id));
    showToast('Delivery address removed.', 'info');
  };

  // Set Address as Default
  const handleSetDefaultAddress = (id) => {
    setSavedAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    setSelectedAddressId(id);
    showToast('Default delivery address updated.', 'success');
  };

  // Place Order Handler
  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      showToast('Your delivery cart is empty! Add products first.', 'error');
      setActiveTab('store');
      return;
    }

    const recipientPhone = customRecipientPhone.trim() || activeAddress.phone;
    const cleanPhone = recipientPhone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      showToast('Please provide a valid 10-digit recipient phone number.', 'error');
      return;
    }

    setIsPlacingOrder(true);

    try {
      const orderId = `RB-${Math.floor(100000 + Math.random() * 900000)}`;
      const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));
      const formattedAddress = `${activeAddress.house}, ${activeAddress.street}, ${activeAddress.landmark ? activeAddress.landmark + ', ' : ''}${activeAddress.city}, ${activeAddress.state} - ${activeAddress.pincode}`;
      
      let paymentLabel = 'Cash on Delivery (OTP Handover)';
      if (paymentMode === 'upi') {
        paymentLabel = `Prepaid UPI [${brandConfig.upiId || 'roshikablooms@upi'}]${upiUtrNumber ? ' UTR: ' + upiUtrNumber : ''}`;
      } else if (paymentMode === 'online') {
        paymentLabel = 'Prepaid Online Card / NetBanking';
      }

      const newOrder = await createOrder({
        orderId,
        order_id: orderId,
        deliveryOtp,
        status: paymentMode === 'cod' ? 'Order Placed' : 'Payment Confirmed',
        customerName: activeAddress.name,
        customerPhone: cleanPhone,
        customerEmail: 'patron@rishikablooms.com',
        recipientName: customRecipientName.trim() || activeAddress.name,
        recipientPhone: cleanPhone,
        deliveryAddress: formattedAddress,
        pincode: activeAddress.pincode,
        deliverySlot: checkoutSlot === 'express' ? '⚡ 2-Hr Express Dispatch' : checkoutSlot === 'midnight' ? '🌙 Midnight Surprise (11:15 PM - 12:00 AM)' : '📦 Standard Same-Day (10 AM - 7 PM)',
        paymentMethod: paymentLabel,
        paymentStatus: paymentMode === 'cod' ? 'Pending COD' : 'Paid',
        total: cartTotal,
        cartItems: cart,
        specialInstructions: giftNote || 'Handle with extreme delicate floral care',
        courier: {
          provider: 'Risika Express Logistics (Flipkart/Meesho Fleet)',
          trackingNumber: `EXP-${Math.floor(10000000 + Math.random() * 90000000)}`,
          trackingUrl: `https://rishikablooms.vercel.app`
        }
      });

      // Trigger Confetti Celebration
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Safe fallback
      }

      clearCart();
      showToast(`🎉 Order #${orderId} Placed! OTP ${deliveryOtp} generated.`, 'success');
      setTrackingOrder(newOrder);
      setActiveTab('orders');
    } catch (err) {
      console.error('Order placement failed:', err);
      showToast('Failed to place order. Please try again.', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Cancel Order Handler
  const handleConfirmCancelOrder = async () => {
    if (!cancellingOrder) return;
    try {
      await updateOrderStatus(
        cancellingOrder.orderId || cancellingOrder.order_id, 
        'Cancelled', 
        `Cancelled by Customer: ${cancelReason}`
      );
      showToast(`Order #${cancellingOrder.orderId || cancellingOrder.order_id} has been cancelled.`, 'info');
      setCancellingOrder(null);
    } catch (e) {
      showToast('Could not cancel order. Please contact support.', 'error');
    }
  };

  // Return / Replacement Handler
  const handleConfirmReturnOrder = async () => {
    if (!returningOrder) return;
    try {
      await updateOrderStatus(
        returningOrder.orderId || returningOrder.order_id, 
        'Return Requested', 
        `Customer Return Request: ${returnReason}. Note: ${returnComment}`
      );
      showToast(`Return requested for Order #${returningOrder.orderId || returningOrder.order_id}. Agent will contact within 2 hours.`, 'success');
      setReturningOrder(null);
      setReturnComment('');
    } catch (e) {
      showToast('Could not submit return request.', 'error');
    }
  };

  // Realtime Status Stepper Calculation
  const getTrackingStepIndex = (status) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('cancel')) return -1;
    if (s.includes('delivered')) return 5;
    if (s.includes('out for delivery')) return 4;
    if (s.includes('shipped') || s.includes('transit')) return 3;
    if (s.includes('packed') || s.includes('processing')) return 2;
    if (s.includes('confirm')) return 1;
    return 0; // 'Order Placed'
  };

  const TRACKING_STEPS = [
    { title: 'Order Placed', desc: 'Received & Queued' },
    { title: 'Confirmed', desc: 'Artisan Assigned' },
    { title: 'Packed', desc: 'Moisture Sealed' },
    { title: 'Shipped', desc: 'Handed to Courier' },
    { title: 'Out for Delivery', desc: 'Agent on the way' },
    { title: 'Delivered', desc: 'OTP Verified Handover' }
  ];

  return (
    <div className="delivery-portal-page animate-fade-in" style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--bg-primary, #f1f3f6)', 
      color: 'var(--text-primary, #212121)',
      paddingBottom: '5rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      
      {/* 1. FLIPKART & MEESHO INSPIRED TOP DELIVERY APP BAR */}
      <div style={{
        background: 'linear-gradient(135deg, #2874f0 0%, #1754be 100%)',
        color: '#ffffff',
        padding: '0.9rem 1rem 1.1rem 1rem',
        boxShadow: '0 4px 18px rgba(40, 116, 240, 0.25)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          
          {/* Top Brand & Location Strip */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ 
                background: '#ffffff', 
                color: '#2874f0', 
                width: '36px', 
                height: '36px', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}>
                <Truck size={22} color="#2874f0" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.3px' }}>
                    Risika Delivery Portal
                  </span>
                  <span style={{ 
                    background: '#ffe500', 
                    color: '#2874f0', 
                    fontSize: '0.65rem', 
                    fontWeight: 900, 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}>
                    <Zap size={10} fill="#2874f0" /> Flipkart & Meesho Assured
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>⚡ 2-Hour Hyperlocal & Pan-India Dispatch</span>
                  <span>•</span>
                  <span>Zero Delivery Fee Active</span>
                </div>
              </div>
            </div>

            {/* Delivery Location Selector Pill */}
            <div 
              onClick={() => setActiveTab('addresses')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.16)',
                backdropFilter: 'blur(6px)',
                padding: '0.4rem 0.85rem',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                transition: 'all 0.2s ease'
              }}
              title="Click to manage or change delivery address"
            >
              <MapPin size={14} color="#ffe500" />
              <span>
                Deliver to: <strong>{activeAddress.city} - {activeAddress.pincode}</strong>
              </span>
              <span style={{ color: '#ffe500', fontWeight: 700, fontSize: '0.72rem', textDecoration: 'underline' }}>
                Change
              </span>
            </div>
          </div>

          {/* Search Bar & Auto-pills */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '720px', margin: '0 auto 0.5rem auto' }}>
            <Search size={18} color="#717478" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder="Search products by name, flowers, velvet bouquets, teddy, occasions..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'store') setActiveTab('store');
              }}
              style={{
                width: '100%',
                padding: '0.7rem 2.8rem 0.7rem 2.6rem',
                borderRadius: '6px',
                border: 'none',
                background: '#ffffff',
                color: '#212121',
                fontSize: '0.92rem',
                boxShadow: '0 3px 12px rgba(0,0,0,0.14)',
                outline: 'none'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#878787'
                }}
              >
                <XCircle size={18} />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 2. PORTAL NAVIGATION TABS (Flipkart / Meesho Category Strip) */}
      <div style={{
        background: 'var(--bg-surface, #ffffff)',
        borderBottom: '1px solid var(--border-subtle, #e0e0e0)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        position: 'sticky',
        top: '116px',
        zIndex: 40
      }}>
        <div style={{ 
          maxWidth: '1240px', 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none',
          padding: '0.3rem 0.75rem'
        }}>
          {[
            { key: 'store', label: 'Browse Products', icon: ShoppingBag, badge: filteredProducts.length },
            { key: 'cart', label: 'Delivery Cart', icon: ShoppingBag, badge: cartCount, color: '#fb641b' },
            { key: 'checkout', label: 'Express Checkout', icon: CreditCard },
            { key: 'orders', label: 'My Orders & Live Tracking', icon: Truck, badge: orders.length, color: '#16a34a' },
            { key: 'addresses', label: 'Delivery Addresses', icon: MapPin, badge: savedAddresses.length },
            { key: 'wishlist', label: 'Wishlist', icon: Heart, badge: wishlist.length },
            { key: 'pincode', label: 'PIN Coverage', icon: Compass }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.75rem 1.1rem',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '3px solid #2874f0' : '3px solid transparent',
                  color: isActive ? '#2874f0' : 'var(--text-secondary, #555555)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
              >
                <Icon size={16} color={isActive ? '#2874f0' : '#777777'} />
                <span>{tab.label}</span>
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span style={{
                    background: tab.color || '#2874f0',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '12px'
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN CONTENT CONTAINER */}
      <div style={{ maxWidth: '1240px', margin: '1.25rem auto', padding: '0 1rem' }}>

        {/* ============================================================== */}
        {/* TAB 1: PRODUCT LISTING & FAST DELIVERY CATALOG                 */}
        {/* ============================================================== */}
        {activeTab === 'store' && (
          <div className="animate-fade-in">
            
            {/* Filter Bar: Categories, Price, Sorting */}
            <div style={{
              background: 'var(--bg-surface, #ffffff)',
              padding: '0.9rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle, #e0e0e0)',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}>
              {/* Category Filter Pills (Meesho style) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#878787', textTransform: 'uppercase', flexShrink: 0 }}>
                  Category:
                </span>
                {[
                  { id: 'all', name: 'All Products' },
                  ...categories
                ].map(cat => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: '20px',
                        border: isSelected ? '1.5px solid #2874f0' : '1px solid #dcdcdc',
                        background: isSelected ? 'rgba(40, 116, 240, 0.08)' : 'transparent',
                        color: isSelected ? '#2874f0' : '#444444',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* Sorting & Express Delivery Toggles */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                flexWrap: 'wrap', 
                gap: '0.75rem',
                borderTop: '1px solid #f0f0f0',
                paddingTop: '0.65rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                  
                  {/* Express Delivery Checkbox */}
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.4rem', 
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: '#2874f0',
                    background: 'rgba(40, 116, 240, 0.06)',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(40, 116, 240, 0.2)'
                  }}>
                    <input 
                      type="checkbox" 
                      checked={expressOnly} 
                      onChange={(e) => setExpressOnly(e.target.checked)} 
                    />
                    <span>⚡ 2-Hour Express Dispatch</span>
                  </label>

                  {/* Price Bracket Quick Select */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#777777' }}>Budget:</span>
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #cccccc',
                        fontSize: '0.82rem',
                        background: '#ffffff',
                        color: '#333333'
                      }}
                    >
                      <option value="all">All Prices</option>
                      <option value="under-999">Under ₹999</option>
                      <option value="1000-1999">₹1,000 - ₹1,999</option>
                      <option value="2000-plus">₹2,000 & Above</option>
                    </select>
                  </div>
                </div>

                {/* Sort By Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#777777' }}>Sort By:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      padding: '0.3rem 0.65rem',
                      borderRadius: '4px',
                      border: '1px solid #cccccc',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      background: '#ffffff',
                      color: '#2874f0'
                    }}
                  >
                    <option value="popular">Popularity / Assured</option>
                    <option value="price-low">Price -- Low to High</option>
                    <option value="price-high">Price -- High to Low</option>
                    <option value="rating">Customer Rating</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Header Count */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '0 4px' }}>
              <div style={{ fontSize: '0.92rem', color: '#555555' }}>
                Showing <strong>{filteredProducts.length}</strong> Express Delivery Products
                {searchQuery && <span> matching "<em>{searchQuery}</em>"</span>}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#2874f0', fontWeight: 600 }}>
                ✓ 100% Quality Inspected Before Dispatch
              </div>
            </div>

            {/* PRODUCT GRID (Flipkart & Meesho 2/3/4 Column Responsive Layout) */}
            {filteredProducts.length === 0 ? (
              <div style={{
                background: '#ffffff',
                padding: '3.5rem 1rem',
                borderRadius: '8px',
                textAlign: 'center',
                border: '1px solid #e0e0e0'
              }}>
                <ShoppingBag size={48} color="#cccccc" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No products match your filter</h3>
                <p style={{ color: '#777777', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Try resetting the search keyword or selecting "All Products".
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setPriceRange('all');
                    setExpressOnly(false);
                  }}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '4px',
                    background: '#2874f0',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '1rem'
              }}>
                {filteredProducts.map(product => {
                  const mrp = product.originalPrice || Math.round(product.price * 1.35);
                  const discountPct = Math.round(((mrp - product.price) / mrp) * 100);
                  const isSaved = isInWishlist(product.id);

                  return (
                    <div
                      key={product.id}
                      style={{
                        background: 'var(--bg-surface, #ffffff)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle, #e0e0e0)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        position: 'relative'
                      }}
                    >
                      {/* Product Image & Wishlist Pill */}
                      <div style={{ position: 'relative', width: '100%', paddingTop: '100%', background: '#fafafa', overflow: 'hidden' }}>
                        <img 
                          src={product.image} 
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = '/images/bday_royal_blue_tulip_lily_card.jpg';
                          }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                          }}
                        />

                        {/* Badges */}
                        <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 2 }}>
                          {product.badge && (
                            <span style={{
                              background: '#ffe500',
                              color: '#2874f0',
                              fontSize: '0.65rem',
                              fontWeight: 900,
                              padding: '2px 6px',
                              borderRadius: '3px',
                              textTransform: 'uppercase',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                              {product.badge}
                            </span>
                          )}
                          <span style={{
                            background: '#16a34a',
                            color: '#ffffff',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}>
                            ⚡ 2-Hr Express
                          </span>
                        </div>

                        {/* Wishlist Button */}
                        <button
                          type="button"
                          onClick={() => toggleWishlist(product.id)}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#ffffff',
                            border: '1px solid #e0e0e0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 2,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                          }}
                          title={isSaved ? "Remove from Wishlist" : "Save to Wishlist"}
                        >
                          <Heart size={16} fill={isSaved ? "#f43397" : "none"} color={isSaved ? "#f43397" : "#777777"} />
                        </button>
                      </div>

                      {/* Content Details */}
                      <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        
                        {/* Rating & Review Count (Flipkart Green Pill) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                          <span style={{
                            background: '#388e3c',
                            color: '#ffffff',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: '3px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}>
                            {product.rating || 4.8} <Star size={10} fill="#ffffff" />
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#878787' }}>
                            ({product.reviewCount || 142} ratings)
                          </span>
                        </div>

                        {/* Title */}
                        <h4 style={{
                          fontSize: '0.92rem',
                          fontWeight: 600,
                          color: '#212121',
                          marginBottom: '0.35rem',
                          lineHeight: '1.25',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          height: '2.5rem'
                        }}>
                          {product.name}
                        </h4>

                        {/* Free Delivery Tag */}
                        <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700, marginBottom: '0.5rem' }}>
                          Free Delivery by Tomorrow, 11 AM
                        </div>

                        {/* Pricing Row */}
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem', marginBottom: '0.85rem' }}>
                          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#212121' }}>
                            ₹{product.price}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#878787', textDecoration: 'line-through' }}>
                            ₹{mrp}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#388e3c', fontWeight: 700 }}>
                            {discountPct}% off
                          </span>
                        </div>

                        {/* Two Functional Action Buttons (Flipkart style) */}
                        <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
                          <button
                            type="button"
                            onClick={(e) => handleAddToCart(product, e)}
                            style={{
                              padding: '0.55rem 0.2rem',
                              borderRadius: '4px',
                              background: '#ffffff',
                              border: '1.5px solid #2874f0',
                              color: '#2874f0',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <ShoppingBag size={13} />
                            <span>Add to Cart</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleBuyNow(product, e)}
                            style={{
                              padding: '0.55rem 0.2rem',
                              borderRadius: '4px',
                              background: '#fb641b',
                              border: 'none',
                              color: '#ffffff',
                              fontWeight: 800,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '3px',
                              boxShadow: '0 2px 6px rgba(251, 100, 27, 0.35)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Zap size={13} fill="#ffffff" />
                            <span>Buy Now</span>
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: SHOPPING CART WITH QUANTITY CONTROLS & CALCULATIONS     */}
        {/* ============================================================== */}
        {activeTab === 'cart' && (
          <div className="animate-fade-in">
            {cart.length === 0 ? (
              <div style={{
                background: '#ffffff',
                padding: '4rem 1.5rem',
                borderRadius: '8px',
                textAlign: 'center',
                border: '1px solid #e0e0e0'
              }}>
                <ShoppingBag size={64} color="#2874f0" style={{ margin: '0 auto 1rem auto', opacity: 0.6 }} />
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Your Delivery Cart is empty!</h3>
                <p style={{ color: '#777777', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                  Explore handcrafted velvet bouquets, fresh roses and surprise gifts with express doorstep delivery.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('store')}
                  style={{
                    padding: '0.75rem 1.75rem',
                    borderRadius: '4px',
                    background: '#2874f0',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(40, 116, 240, 0.3)'
                  }}
                >
                  Shop Fast Delivery Products
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(300px, 1fr)', gap: '1.25rem', alignItems: 'start' }}>
                
                {/* Cart Items List */}
                <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                  
                  {/* Cart Header */}
                  <div style={{ padding: '1rem', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                      Delivery Cart Items ({cartCount})
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#555555' }}>
                      <MapPin size={13} color="#2874f0" />
                      <span>Deliver to: <strong>{activeAddress.pincode}</strong></span>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ divideY: '1px solid #f0f0f0' }}>
                    {cart.map(item => {
                      const itemMrp = item.originalPrice || Math.round(item.price * 1.35);
                      const discountPct = Math.round(((itemMrp - item.price) / itemMrp) * 100);

                      return (
                        <div key={item.cartItemId} style={{ padding: '1.2rem', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          {/* Image */}
                          <div style={{ width: '84px', height: '84px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, border: '1px solid #f0f0f0' }}>
                            <img 
                              src={item.image} 
                              alt={item.name}
                              onError={(e) => { e.target.src = '/images/bday_royal_blue_tulip_lily_card.jpg'; }}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>

                          {/* Details */}
                          <div style={{ flex: 1, minWidth: '200px' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.96rem', color: '#212121', marginBottom: '0.25rem' }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#777777', marginBottom: '0.45rem' }}>
                              Seller: <strong>Risika Blooms Official Hub</strong> • ⚡ 2-Hr Delivery Assured
                            </div>

                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
                              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#212121' }}>
                                ₹{item.price * item.quantity}
                              </span>
                              <span style={{ fontSize: '0.82rem', color: '#878787', textDecoration: 'line-through' }}>
                                ₹{itemMrp * item.quantity}
                              </span>
                              <span style={{ fontSize: '0.8rem', color: '#388e3c', fontWeight: 700 }}>
                                {discountPct}% off
                              </span>
                            </div>

                            {/* Controls: Quantity +/- and Remove */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cccccc', borderRadius: '4px', overflow: 'hidden' }}>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                  style={{
                                    width: '32px',
                                    height: '30px',
                                    background: '#f9f9f9',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <Minus size={14} />
                                </button>
                                <span style={{ width: '36px', textAlign: 'center', fontSize: '0.88rem', fontWeight: 700 }}>
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                  style={{
                                    width: '32px',
                                    height: '30px',
                                    background: '#f9f9f9',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeFromCart(item.cartItemId)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#dc2626',
                                  fontSize: '0.84rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Trash2 size={14} />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Cart Footer Actions */}
                  <div style={{ padding: '1rem', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab('store')}
                      style={{
                        background: 'transparent',
                        border: '1px solid #cccccc',
                        padding: '0.6rem 1rem',
                        borderRadius: '4px',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      ← Add More Products
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('checkout')}
                      style={{
                        background: '#fb641b',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.75rem 1.75rem',
                        borderRadius: '4px',
                        fontSize: '0.92rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 3px 10px rgba(251, 100, 27, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>Proceed to Delivery Checkout</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Price Summary Card (Flipkart Style) */}
                <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#878787', textTransform: 'uppercase', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    Price Details
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                    <span style={{ color: '#555555' }}>Price ({cartCount} items)</span>
                    <span style={{ fontWeight: 600 }}>₹{totalMrp}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                    <span style={{ color: '#555555' }}>Discount</span>
                    <span style={{ color: '#388e3c', fontWeight: 700 }}>- ₹{totalSavings}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                    <span style={{ color: '#555555' }}>Delivery Charges</span>
                    <span style={{ color: '#388e3c', fontWeight: 700 }}>FREE</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                    <span style={{ color: '#555555' }}>Moisture Packing & Insurance</span>
                    <span style={{ color: '#388e3c', fontWeight: 700 }}>FREE</span>
                  </div>

                  <div style={{
                    borderTop: '1px dashed #dcdcdc',
                    paddingTop: '0.85rem',
                    marginTop: '0.85rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#212121'
                  }}>
                    <span>Total Amount</span>
                    <span>₹{cartTotal}</span>
                  </div>

                  <div style={{
                    marginTop: '1rem',
                    background: 'rgba(56, 142, 60, 0.1)',
                    color: '#388e3c',
                    padding: '0.65rem',
                    borderRadius: '4px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textAlign: 'center'
                  }}>
                    🎉 You will save ₹{totalSavings} on this order!
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('checkout')}
                    style={{
                      width: '100%',
                      marginTop: '1.25rem',
                      background: '#fb641b',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.85rem',
                      borderRadius: '4px',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(251, 100, 27, 0.35)'
                    }}
                  >
                    PLACE DELIVERY ORDER
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem', fontSize: '0.75rem', color: '#878787' }}>
                    <ShieldCheck size={14} color="#388e3c" />
                    <span>Safe and Secure Payments. 100% Authentic Products.</span>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: CHECKOUT PAGE (ADDRESS, DETAILS, SLOTS & PAYMENT)       */}
        {/* ============================================================== */}
        {activeTab === 'checkout' && (
          <div className="animate-fade-in" style={{ maxWidth: '980px', margin: '0 auto' }}>
            
            {cart.length === 0 ? (
              <div style={{ background: '#ffffff', padding: '3.5rem 1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
                <ShoppingBag size={48} color="#2874f0" style={{ margin: '0 auto 1rem auto' }} />
                <h3>Your cart is empty!</h3>
                <p style={{ color: '#777777', margin: '0.5rem 0 1.25rem 0' }}>Please select products to proceed with checkout.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('store')}
                  style={{ background: '#2874f0', color: '#ffffff', padding: '0.65rem 1.5rem', borderRadius: '4px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(280px, 1fr)', gap: '1.25rem' }}>
                
                {/* Left Column: Multi-Step Checkout Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Step 1: Delivery Address */}
                  <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                    <div style={{ background: '#2874f0', color: '#ffffff', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.92rem' }}>
                        <span style={{ background: '#ffffff', color: '#2874f0', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900 }}>1</span>
                        <span>DELIVERY ADDRESS</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAddress(null);
                          setAddressForm({
                            name: '',
                            phone: '',
                            house: '',
                            street: '',
                            landmark: '',
                            city: 'New Delhi',
                            state: 'Delhi',
                            pincode: '110070',
                            type: 'Home'
                          });
                          setShowAddressModal(true);
                        }}
                        style={{
                          background: 'rgba(255,255,255,0.2)',
                          border: 'none',
                          color: '#ffffff',
                          padding: '3px 10px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        + Add New
                      </button>
                    </div>

                    <div style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {savedAddresses.map(addr => {
                          const isSelected = selectedAddressId === addr.id;
                          return (
                            <div 
                              key={addr.id}
                              onClick={() => setSelectedAddressId(addr.id)}
                              style={{
                                border: isSelected ? '2px solid #2874f0' : '1px solid #e0e0e0',
                                borderRadius: '6px',
                                padding: '0.85rem',
                                background: isSelected ? 'rgba(40, 116, 240, 0.04)' : '#ffffff',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <input 
                                    type="radio" 
                                    name="selectedAddress" 
                                    checked={isSelected} 
                                    onChange={() => setSelectedAddressId(addr.id)} 
                                  />
                                  <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{addr.name}</span>
                                  <span style={{ background: '#f0f0f0', color: '#555555', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '3px' }}>
                                    {addr.type}
                                  </span>
                                </div>
                                <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#2874f0' }}>+91 {addr.phone}</span>
                              </div>
                              <div style={{ fontSize: '0.84rem', color: '#555555', paddingLeft: '1.5rem', lineHeight: '1.4' }}>
                                {addr.house}, {addr.street}, {addr.landmark ? addr.landmark + ', ' : ''}{addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Delivery Slot & Recipient Details */}
                  <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                    <div style={{ background: '#2874f0', color: '#ffffff', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.92rem' }}>
                      <span style={{ background: '#ffffff', color: '#2874f0', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900 }}>2</span>
                      <span>DELIVERY TIMELINE & RECIPIENT</span>
                    </div>

                    <div style={{ padding: '1.25rem' }}>
                      {/* Slot Selection */}
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.65rem' }}>
                        Select Delivery Speed & Slot:
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        {[
                          { key: 'express', label: '⚡ 2-Hour Express', desc: 'Guaranteed fastest rush courier dispatch', price: 'FREE' },
                          { key: 'standard', label: '📦 Same-Day Standard', desc: '10:00 AM - 7:00 PM slots', price: 'FREE' },
                          { key: 'midnight', label: '🌙 Midnight Surprise', desc: '11:15 PM - 12:00 AM handoff', price: 'FREE' }
                        ].map(slot => {
                          const isSelected = checkoutSlot === slot.key;
                          return (
                            <div
                              key={slot.key}
                              onClick={() => setCheckoutSlot(slot.key)}
                              style={{
                                border: isSelected ? '2px solid #2874f0' : '1px solid #e0e0e0',
                                borderRadius: '6px',
                                padding: '0.75rem',
                                background: isSelected ? 'rgba(40, 116, 240, 0.05)' : '#ffffff',
                                cursor: 'pointer'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: isSelected ? '#2874f0' : '#212121' }}>
                                  {slot.label}
                                </span>
                                <span style={{ color: '#388e3c', fontSize: '0.75rem', fontWeight: 800 }}>{slot.price}</span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#777777' }}>{slot.desc}</div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Recipient custom phone & note */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555555', display: 'block', marginBottom: '4px' }}>
                            Recipient Full Name (Optional)
                          </label>
                          <input 
                            type="text"
                            placeholder={activeAddress.name}
                            value={customRecipientName}
                            onChange={(e) => setCustomRecipientName(e.target.value)}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #cccccc', fontSize: '0.85rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555555', display: 'block', marginBottom: '4px' }}>
                            Recipient 10-Digit Phone *
                          </label>
                          <input 
                            type="text"
                            maxLength={10}
                            placeholder={activeAddress.phone}
                            value={customRecipientPhone}
                            onChange={(e) => setCustomRecipientPhone(e.target.value)}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #cccccc', fontSize: '0.85rem' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555555', display: 'block', marginBottom: '4px' }}>
                          Complimentary Gift Card Message & Gate Delivery Instructions:
                        </label>
                        <textarea 
                          rows={2}
                          placeholder="e.g. Happy Birthday Dearest! Call upon arrival at gate 4."
                          value={giftNote}
                          onChange={(e) => setGiftNote(e.target.value)}
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #cccccc', fontSize: '0.85rem', resize: 'none' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Payment Options (Flipkart/Meesho Radio List) */}
                  <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                    <div style={{ background: '#2874f0', color: '#ffffff', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.92rem' }}>
                      <span style={{ background: '#ffffff', color: '#2874f0', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900 }}>3</span>
                      <span>PAYMENT OPTIONS</span>
                    </div>

                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      
                      {/* Option 1: Cash on Delivery */}
                      <div 
                        onClick={() => setPaymentMode('cod')}
                        style={{
                          border: paymentMode === 'cod' ? '2px solid #2874f0' : '1px solid #e0e0e0',
                          borderRadius: '6px',
                          padding: '0.85rem',
                          background: paymentMode === 'cod' ? 'rgba(40, 116, 240, 0.05)' : '#ffffff',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <input type="radio" name="paymentMode" checked={paymentMode === 'cod'} onChange={() => setPaymentMode('cod')} />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Cash on Delivery (COD)</div>
                              <div style={{ fontSize: '0.75rem', color: '#666666' }}>Pay cash or scan courier QR on arrival. Verified with Delivery OTP.</div>
                            </div>
                          </div>
                          <Banknote size={20} color="#16a34a" />
                        </div>
                      </div>

                      {/* Option 2: UPI Payment */}
                      <div 
                        onClick={() => setPaymentMode('upi')}
                        style={{
                          border: paymentMode === 'upi' ? '2px solid #2874f0' : '1px solid #e0e0e0',
                          borderRadius: '6px',
                          padding: '0.85rem',
                          background: paymentMode === 'upi' ? 'rgba(40, 116, 240, 0.05)' : '#ffffff',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <input type="radio" name="paymentMode" checked={paymentMode === 'upi'} onChange={() => setPaymentMode('upi')} />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Direct UPI / QR Code (PhonePe, GPay, Paytm)</div>
                              <div style={{ fontSize: '0.75rem', color: '#666666' }}>Pay directly to store UPI ID: <strong>{brandConfig.upiId || 'roshikablooms@upi'}</strong></div>
                            </div>
                          </div>
                          <Smartphone size={20} color="#2874f0" />
                        </div>

                        {paymentMode === 'upi' && (
                          <div style={{ marginTop: '0.85rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.8rem', color: '#334155', marginBottom: '0.4rem' }}>
                              Enter optional 12-digit UPI Reference / UTR Number for priority verification:
                            </div>
                            <input 
                              type="text" 
                              maxLength={16}
                              placeholder="e.g. 4289XXXXXXXX"
                              value={upiUtrNumber}
                              onChange={(e) => setUpiUtrNumber(e.target.value)}
                              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Option 3: Online Payment */}
                      <div 
                        onClick={() => setPaymentMode('online')}
                        style={{
                          border: paymentMode === 'online' ? '2px solid #2874f0' : '1px solid #e0e0e0',
                          borderRadius: '6px',
                          padding: '0.85rem',
                          background: paymentMode === 'online' ? 'rgba(40, 116, 240, 0.05)' : '#ffffff',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <input type="radio" name="paymentMode" checked={paymentMode === 'online'} onChange={() => setPaymentMode('online')} />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Credit / Debit Card / Net Banking</div>
                              <div style={{ fontSize: '0.75rem', color: '#666666' }}>All Indian debit/credit cards supported with 256-bit encryption.</div>
                            </div>
                          </div>
                          <CreditCard size={20} color="#2874f0" />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Submit Order Button */}
                  <button
                    type="button"
                    disabled={isPlacingOrder}
                    onClick={handlePlaceOrder}
                    style={{
                      background: isPlacingOrder ? '#999999' : '#fb641b',
                      color: '#ffffff',
                      border: 'none',
                      padding: '1rem',
                      borderRadius: '6px',
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      cursor: isPlacingOrder ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 16px rgba(251, 100, 27, 0.4)',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {isPlacingOrder ? (
                      <span>Placing & Generating Delivery OTP...</span>
                    ) : (
                      <>
                        <Zap size={20} fill="#ffffff" />
                        <span>CONFIRM & PLACE DELIVERY ORDER (₹{cartTotal})</span>
                      </>
                    )}
                  </button>

                </div>

                {/* Right Column: Order Mini Summary */}
                <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '1.25rem', height: 'fit-content' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#878787', textTransform: 'uppercase', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.65rem', marginBottom: '0.85rem' }}>
                    Order Summary ({cartCount} Items)
                  </div>

                  <div style={{ maxHeight: '220px', overflowY: 'auto', marginBottom: '1rem' }}>
                    {cart.map(item => (
                      <div key={item.cartItemId} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.65rem' }}>
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          onError={(e) => { e.target.src = '/images/bday_royal_blue_tulip_lily_card.jpg'; }}
                          style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#777777' }}>Qty: {item.quantity} • ₹{item.price * item.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 800 }}>
                    <span>Payable Now:</span>
                    <span style={{ color: '#2874f0' }}>₹{cartTotal}</span>
                  </div>

                  <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '0.65rem', borderRadius: '4px', fontSize: '0.75rem', color: '#64748b' }}>
                    ✓ Instant SMS & WhatsApp notification sent on confirmation.<br />
                    ✓ Live driver location link enabled.
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: MY ORDERS & REAL-TIME TRACKING (FLIPKART STEPPER)       */}
        {/* ============================================================== */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in">
            
            {/* Orders Search & Quick Filter */}
            <div style={{
              background: '#ffffff',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
                <Search size={16} color="#878787" />
                <input 
                  type="text"
                  placeholder="Filter by Order ID (e.g. RB-123456) or phone number..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem', border: 'none', outline: 'none', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ fontSize: '0.84rem', color: '#777777' }}>
                Total <strong>{filteredOrders.length}</strong> Deliveries Logged
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div style={{ background: '#ffffff', padding: '4rem 1.5rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
                <Truck size={56} color="#2874f0" style={{ margin: '0 auto 1rem auto', opacity: 0.6 }} />
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.4rem' }}>No delivery orders found</h3>
                <p style={{ color: '#777777', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Orders placed through the Delivery Portal will appear here with live dispatch tracking and OTP.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('store')}
                  style={{ background: '#2874f0', color: '#ffffff', padding: '0.65rem 1.5rem', borderRadius: '4px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  Order Something Now
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {filteredOrders.map(order => {
                  const currentStepIdx = getTrackingStepIndex(order.status);
                  const isCancelled = String(order.status || '').toLowerCase().includes('cancel');
                  const isDelivered = String(order.status || '').toLowerCase().includes('delivered');
                  const isReturnRequested = String(order.status || '').toLowerCase().includes('return');
                  const orderItems = order.cartItems || order.items || [];

                  return (
                    <div 
                      key={order.orderId || order.order_id} 
                      style={{
                        background: '#ffffff',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                      }}
                    >
                      {/* Order Header Ribbon */}
                      <div style={{
                        background: '#f8fafc',
                        padding: '0.85rem 1.1rem',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.96rem', color: '#2874f0' }}>
                            Order #{order.orderId || order.order_id}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Placed on {new Date(order.createdAt || order.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            background: isCancelled ? '#fee2e2' : isDelivered ? '#dcfce7' : '#e0e7ff',
                            color: isCancelled ? '#dc2626' : isDelivered ? '#16a34a' : '#3730a3'
                          }}>
                            {order.status || 'Order Placed'}
                          </span>
                          <span style={{ fontWeight: 800, fontSize: '0.96rem' }}>
                            ₹{order.total || 0}
                          </span>
                        </div>
                      </div>

                      {/* Order Content */}
                      <div style={{ padding: '1.25rem' }}>
                        
                        {/* Delivery Handover OTP Box */}
                        {order.deliveryOtp && !isCancelled && !isDelivered && (
                          <div style={{
                            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                            border: '1.5px solid #f59e0b',
                            borderRadius: '6px',
                            padding: '0.75rem 1rem',
                            marginBottom: '1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '0.5rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <ShieldCheck size={20} color="#b45309" />
                              <div>
                                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#92400e' }}>
                                  Share with delivery partner at your doorstep:
                                </span>
                                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#78350f', letterSpacing: '2px' }}>
                                  OTP: {order.deliveryOtp}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(order.deliveryOtp);
                                showToast(`OTP ${order.deliveryOtp} copied!`, 'success');
                              }}
                              style={{
                                background: '#ffffff',
                                border: '1px solid #f59e0b',
                                color: '#b45309',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Copy size={13} />
                              <span>Copy OTP</span>
                            </button>
                          </div>
                        )}

                        {/* FLIPKART STYLE REAL-TIME STEPPER TRACKER */}
                        <div style={{ marginBottom: '1.5rem', background: '#fafafa', padding: '1.25rem', borderRadius: '6px', border: '1px solid #f0f0f0' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#555555', marginBottom: '1rem', textTransform: 'uppercase' }}>
                            Delivery Progression:
                          </div>

                          {isCancelled ? (
                            <div style={{ color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <XCircle size={18} />
                              <span>This delivery order was cancelled. (Refund initiated to original mode)</span>
                            </div>
                          ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${TRACKING_STEPS.length}, 1fr)`, gap: '0.5rem', position: 'relative' }}>
                              {TRACKING_STEPS.map((step, idx) => {
                                const isPassed = currentStepIdx >= idx;
                                const isCurrent = currentStepIdx === idx;
                                return (
                                  <div key={step.title} style={{ textAlign: 'center', position: 'relative' }}>
                                    {/* Circle Icon */}
                                    <div style={{
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '50%',
                                      margin: '0 auto 6px auto',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.75rem',
                                      fontWeight: 800,
                                      background: isPassed ? '#16a34a' : '#e2e8f0',
                                      color: isPassed ? '#ffffff' : '#64748b',
                                      boxShadow: isCurrent ? '0 0 0 4px rgba(22, 163, 74, 0.25)' : 'none',
                                      transition: 'all 0.3s ease'
                                    }}>
                                      {isPassed ? <Check size={14} /> : idx + 1}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', fontWeight: isCurrent ? 800 : 600, color: isPassed ? '#16a34a' : '#64748b' }}>
                                      {step.title}
                                    </div>
                                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                                      {step.desc}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Order Details & Address */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                          <div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
                              Delivery Destination:
                            </div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                              {order.recipientName || order.customerName}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                              {order.deliveryAddress}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
                              Phone: +91 {order.recipientPhone || order.customerPhone}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
                              Delivery Slot & Courier Fleet:
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                              {order.deliverySlot || '⚡ 2-Hour Express Dispatch'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                              Courier: {order.courier?.provider || 'Risika Dedicated Fleet'}
                            </div>
                            {order.courier?.trackingNumber && (
                              <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
                                AWB / Waybill: #{order.courier.trackingNumber}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Items Preview */}
                        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '0.75rem', marginBottom: '1rem' }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>
                            Items in this package:
                          </div>
                          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '4px' }}>
                            {orderItems.map((item, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: '#f8fafc', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                                {item.image && (
                                  <img 
                                    src={item.image} 
                                    alt="" 
                                    onError={(e) => { e.target.src = '/images/bday_royal_blue_tulip_lily_card.jpg'; }}
                                    style={{ width: '28px', height: '28px', borderRadius: '3px', objectFit: 'cover' }}
                                  />
                                )}
                                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                                  {item.name || 'Floral Bouquet'} (x{item.quantity || 1})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Action Buttons: Cancel, Return, Invoice */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.65rem', flexWrap: 'wrap' }}>
                          
                          {/* Invoice Print */}
                          <button
                            type="button"
                            onClick={() => window.print()}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              color: '#475569',
                              padding: '0.45rem 0.85rem',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Printer size={14} />
                            <span>Invoice</span>
                          </button>

                          {/* Cancellation Button (allowed if not delivered & not cancelled) */}
                          {!isDelivered && !isCancelled && (
                            <button
                              type="button"
                              onClick={() => setCancellingOrder(order)}
                              style={{
                                background: '#ffffff',
                                border: '1px solid #f87171',
                                color: '#dc2626',
                                padding: '0.45rem 0.85rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <XCircle size={14} />
                              <span>Cancel Order</span>
                            </button>
                          )}

                          {/* Return Button (allowed if delivered) */}
                          {isDelivered && !isReturnRequested && (
                            <button
                              type="button"
                              onClick={() => setReturningOrder(order)}
                              style={{
                                background: '#ffffff',
                                border: '1px solid #f59e0b',
                                color: '#b45309',
                                padding: '0.45rem 0.85rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <RotateCcw size={14} />
                              <span>Request Return / Replacement</span>
                            </button>
                          )}

                          {isReturnRequested && (
                            <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 700 }}>
                              ✓ Return inspection scheduled
                            </span>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: SAVED DELIVERY ADDRESS MANAGEMENT                       */}
        {/* ============================================================== */}
        {activeTab === 'addresses' && (
          <div className="animate-fade-in" style={{ maxWidth: '820px', margin: '0 auto' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Manage Delivery Addresses</h3>
                <p style={{ fontSize: '0.84rem', color: '#666666' }}>Add, edit or set default address for express doorstep deliveries.</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingAddress(null);
                  setAddressForm({
                    name: '',
                    phone: '',
                    house: '',
                    street: '',
                    landmark: '',
                    city: 'New Delhi',
                    state: 'Delhi',
                    pincode: '110070',
                    type: 'Home'
                  });
                  setShowAddressModal(true);
                }}
                style={{
                  background: '#2874f0',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.65rem 1.1rem',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 2px 8px rgba(40, 116, 240, 0.3)'
                }}
              >
                <Plus size={16} />
                <span>Add New Address</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {savedAddresses.map(addr => (
                <div 
                  key={addr.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '8px',
                    border: addr.isDefault ? '2px solid #2874f0' : '1px solid #e0e0e0',
                    padding: '1.2rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: '#212121' }}>{addr.name}</span>
                      <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                        {addr.type}
                      </span>
                      {addr.isDefault && (
                        <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                          Default Address
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAddress(addr);
                          setAddressForm({ ...addr });
                          setShowAddressModal(true);
                        }}
                        style={{ background: 'none', border: 'none', color: '#2874f0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        <Edit3 size={14} />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '0.45rem', lineHeight: '1.4' }}>
                    {addr.house}, {addr.street}, {addr.landmark ? addr.landmark + ', ' : ''}{addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      Mobile: <strong>+91 {addr.phone}</strong>
                    </span>

                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        style={{
                          background: 'none',
                          border: '1px solid #2874f0',
                          color: '#2874f0',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: WISHLIST SECTION                                        */}
        {/* ============================================================== */}
        {activeTab === 'wishlist' && (
          <div className="animate-fade-in">
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>My Saved Delivery Wishlist ({wishlistedProducts.length})</h3>
              <p style={{ fontSize: '0.85rem', color: '#666666' }}>Items you've bookmarked for upcoming celebrations and gift surprises.</p>
            </div>

            {wishlistedProducts.length === 0 ? (
              <div style={{ background: '#ffffff', padding: '3.5rem 1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
                <Heart size={52} color="#f43397" style={{ margin: '0 auto 1rem auto', opacity: 0.6 }} />
                <h3>Your wishlist is empty!</h3>
                <p style={{ color: '#777777', margin: '0.4rem 0 1.25rem 0' }}>Explore the catalog and click the heart icon on any product to save it.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('store')}
                  style={{ background: '#2874f0', color: '#ffffff', padding: '0.65rem 1.5rem', borderRadius: '4px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                {wishlistedProducts.map(p => (
                  <div key={p.id} style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'relative', width: '100%', paddingTop: '100%' }}>
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        onError={(e) => { e.target.src = '/images/bday_royal_blue_tulip_lily_card.jpg'; }}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        onClick={() => toggleWishlist(p.id)}
                        style={{ position: 'absolute', top: '8px', right: '8px', width: '30px', height: '30px', borderRadius: '50%', background: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} color="#dc2626" />
                      </button>
                    </div>

                    <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.35rem' }}>{p.name}</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#212121', marginBottom: '0.75rem' }}>₹{p.price}</div>
                      
                      <button
                        type="button"
                        onClick={() => handleMoveWishlistToCart(p)}
                        style={{
                          marginTop: 'auto',
                          background: '#fb641b',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.65rem',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <ShoppingBag size={14} />
                        <span>Move to Delivery Cart</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 7: PIN COVERAGE CHECKER (ORIGINAL FEATURE ENHANCED)       */}
        {/* ============================================================== */}
        {activeTab === 'pincode' && (
          <div className="animate-fade-in" style={{ maxWidth: '780px', margin: '0 auto' }}>
            <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '8px', border: '1px solid #e0e0e0', textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(40, 116, 240, 0.1)', color: '#2874f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
                <Compass size={24} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                Indian Postal PIN Code Coverage & Express Slots
              </h3>
              <p style={{ color: '#666666', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                Verify 2-Hour Hyperlocal, Same-Day and Midnight floral delivery availability across India.
              </p>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (checkDeliveryPincode) {
                    setPincodeResult(checkDeliveryPincode(pincodeQuery));
                  }
                }}
                style={{ display: 'flex', gap: '0.5rem', maxWidth: '420px', margin: '0 auto 1.25rem auto' }}
              >
                <input 
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit PIN (e.g. 110070, 400050, 560001)"
                  value={pincodeQuery}
                  onChange={(e) => setPincodeQuery(e.target.value.replace(/\D/g, ''))}
                  style={{ flex: 1, padding: '0.7rem 1rem', borderRadius: '4px', border: '1.5px solid #2874f0', fontSize: '0.92rem', outline: 'none' }}
                />
                <button
                  type="submit"
                  style={{ background: '#2874f0', color: '#ffffff', border: 'none', padding: '0.7rem 1.25rem', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Verify
                </button>
              </form>

              {pincodeResult && (
                <div style={{
                  padding: '1.25rem',
                  borderRadius: '6px',
                  background: pincodeResult.available ? '#f0fdf4' : '#fff1f2',
                  border: pincodeResult.available ? '1.5px solid #bbf7d0' : '1.5px solid #fecdd3',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {pincodeResult.available ? <CheckCircle2 size={20} color="#16a34a" /> : <AlertCircle size={20} color="#e11d48" />}
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: pincodeResult.available ? '#166534' : '#9f1239' }}>
                      {pincodeResult.message}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem', marginTop: '0.75rem', fontSize: '0.84rem' }}>
                    <div style={{ background: '#ffffff', padding: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                      <strong>Zone / Hub:</strong> {pincodeResult.hub || 'Delhi NCR Primary Logistics Center'}
                    </div>
                    <div style={{ background: '#ffffff', padding: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                      <strong>Transit Time:</strong> {pincodeResult.eta || '⚡ 2-Hour Express Guaranteed'}
                    </div>
                    <div style={{ background: '#ffffff', padding: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                      <strong>Midnight Surprise:</strong> Available (11:15 PM)
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ============================================================== */}
      {/* MODAL 1: ADD / EDIT DELIVERY ADDRESS MODAL                     */}
      {/* ============================================================== */}
      {showAddressModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            maxWidth: '520px',
            width: '100%',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)'
          }}>
            <div style={{ background: '#2874f0', color: '#ffffff', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                {editingAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}
              </div>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#444444' }}>Full Name *</label>
                  <input 
                    type="text" 
                    required
                    value={addressForm.name} 
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })} 
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.85rem' }} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#444444' }}>10-Digit Mobile *</label>
                  <input 
                    type="text" 
                    maxLength={10}
                    required
                    value={addressForm.phone} 
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} 
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.85rem' }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#444444' }}>Flat, House No., Building, Apartment *</label>
                <input 
                  type="text" 
                  required
                  value={addressForm.house} 
                  onChange={(e) => setAddressForm({ ...addressForm, house: e.target.value })} 
                  style={{ width: '100%', padding: '0.55rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.85rem' }} 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#444444' }}>Area, Street, Sector, Village</label>
                <input 
                  type="text" 
                  value={addressForm.street} 
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} 
                  style={{ width: '100%', padding: '0.55rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.85rem' }} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#444444' }}>Landmark</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Near Metro Station"
                    value={addressForm.landmark} 
                    onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })} 
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.85rem' }} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#444444' }}>PIN Code (6 digits) *</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    required
                    value={addressForm.pincode} 
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} 
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.85rem' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#444444' }}>City / District</label>
                  <input 
                    type="text" 
                    value={addressForm.city} 
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} 
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.85rem' }} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#444444' }}>Address Type</label>
                  <select 
                    value={addressForm.type}
                    onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.85rem', background: '#fff' }}
                  >
                    <option value="Home">Home (All-day delivery)</option>
                    <option value="Work">Work (10 AM - 6 PM delivery)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  style={{ background: '#f0f0f0', border: 'none', padding: '0.6rem 1rem', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#2874f0', color: '#ffffff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: ORDER CANCELLATION MODAL                              */}
      {/* ============================================================== */}
      {cancellingOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{ background: '#ffffff', maxWidth: '440px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ background: '#dc2626', color: '#ffffff', padding: '0.9rem 1rem', fontWeight: 800 }}>
              Cancel Order #{cancellingOrder.orderId || cancellingOrder.order_id}
            </div>
            <div style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.88rem', color: '#444444', marginBottom: '0.85rem' }}>
                Are you sure you wish to cancel this delivery order? Please select your reason:
              </p>

              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '1.25rem', fontSize: '0.85rem' }}
              >
                <option value="Found better price elsewhere">Found better price elsewhere</option>
                <option value="Ordered by mistake / Duplicate order">Ordered by mistake / Duplicate order</option>
                <option value="Recipient not available at destination">Recipient not available at destination</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Delivery time delay">Delivery time delay</option>
              </select>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  style={{ background: '#f0f0f0', border: 'none', padding: '0.55rem 1rem', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancelOrder}
                  style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '0.55rem 1rem', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: ORDER RETURN / REPLACEMENT REQUEST MODAL              */}
      {/* ============================================================== */}
      {returningOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{ background: '#ffffff', maxWidth: '460px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ background: '#b45309', color: '#ffffff', padding: '0.9rem 1rem', fontWeight: 800 }}>
              Request Return or Replacement
            </div>
            <div style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#444444', marginBottom: '0.85rem' }}>
                Please select the reason for your replacement / return claim for Order #{returningOrder.orderId || returningOrder.order_id}:
              </p>

              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '0.85rem', fontSize: '0.85rem' }}
              >
                <option value="Floral packaging was slightly creased">Floral packaging was slightly creased</option>
                <option value="Incorrect bouquet or missing greeting card">Incorrect bouquet or missing greeting card</option>
                <option value="Quality did not match customer expectation">Quality did not match customer expectation</option>
                <option value="Delivered past celebration event time">Delivered past celebration event time</option>
              </select>

              <textarea 
                rows={2}
                placeholder="Additional feedback for our courier & quality inspection team..."
                value={returnComment}
                onChange={(e) => setReturnComment(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '1.25rem', fontSize: '0.82rem', resize: 'none' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => setReturningOrder(null)}
                  style={{ background: '#f0f0f0', border: 'none', padding: '0.55rem 1rem', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReturnOrder}
                  style={{ background: '#b45309', color: '#ffffff', border: 'none', padding: '0.55rem 1rem', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Submit Return Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
