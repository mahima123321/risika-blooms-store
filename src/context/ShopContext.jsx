import React, { createContext, useContext, useState, useEffect } from 'react';
import { BRAND_CONFIG, TRANSLATIONS } from '../config/brand';
import { PRODUCTS, INITIAL_PRODUCTS, syncProductsArray } from '../data/products';
import { CATEGORIES as INITIAL_CATEGORIES } from '../data/categories';
import {
  initFirebase,
  isFirebaseLive,
  subscribeToCloudProducts,
  subscribeToCloudCategories,
  subscribeToCloudBrand,
  cloudSaveProduct,
  cloudDeleteProduct,
  cloudSaveCategory,
  cloudDeleteCategory,
  cloudSaveBrand,
  cloudBulkUploadCatalog,
  subscribeToCloudOrders,
  cloudSaveOrder,
  cloudUpdateOrderStatus
} from '../services/firebase';
import { getFirebaseConfig, saveFirebaseConfig } from '../config/firebaseConfig';
import { createWhatsAppUrl } from '../config/whatsapp';
import { playIncomingMessageTone } from '../utils/audioAlerts';

const ShopContext = createContext();

export function ShopProvider({ children }) {
  // Live reactive products catalog (synced with localStorage & memory array)
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('rb_custom_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading stored products:', e);
    }
    return [...PRODUCTS];
  });

  // Live reactive categories catalog (synced with localStorage)
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('rb_custom_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If valid, contains all categories and all have valid names
        if (Array.isArray(parsed) && parsed.length >= 10 && parsed.every((c) => c && c.name && String(c.name).trim().length > 0)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading stored categories:', e);
    }
    // Auto-heal incomplete or corrupted category cache with official 14 collections
    try {
      localStorage.setItem('rb_custom_categories', JSON.stringify(INITIAL_CATEGORIES));
    } catch (e) {}
    return [...INITIAL_CATEGORIES];
  });

  // Live reactive Brand & Store Details (WhatsApp number, phone, address, announcements)
  const [brandConfig, setBrandConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('rb_brand_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = { ...BRAND_CONFIG, ...parsed };
        if (typeof window !== 'undefined' && merged.whatsappNumber) {
          window.__rb_active_whatsapp = merged.whatsappNumber;
        }
        return merged;
      }
    } catch (e) {
      console.warn('Error reading stored brand config:', e);
    }
    if (typeof window !== 'undefined') {
      window.__rb_active_whatsapp = BRAND_CONFIG.whatsappNumber;
    }
    return { ...BRAND_CONFIG };
  });

  // Owner Portal & Security State (PIN protected, default: risika2026)
  const [ownerPin, setOwnerPin] = useState(() => {
    return localStorage.getItem('rb_owner_pin') || 'risika2026';
  });

  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(() => {
    return localStorage.getItem('rb_owner_auth') === 'true';
  });
  const [isOwnerLoginModalOpen, setIsOwnerLoginModalOpen] = useState(false);
  const [isOwnerProductModalOpen, setIsOwnerProductModalOpen] = useState(false);
  const [isOwnerSettingsModalOpen, setIsOwnerSettingsModalOpen] = useState(false);
  const [ownerSettingsActiveTab, setOwnerSettingsActiveTab] = useState('numbers');
  const [editingProduct, setEditingProduct] = useState(null);
  const [ownerModalDefaultCategory, setOwnerModalDefaultCategory] = useState(null);

  // Theme state (light / dark)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('rb_theme') || 'light';
  });

  // Language state (Permanently English only as requested)
  const [language, setLanguage] = useState('en');

  // QR Code & Scanner Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrModalData, setQrModalData] = useState({
    title: 'Rishika Blooms Luxury Floral Atelier',
    url: typeof window !== 'undefined' ? window.location.href : 'https://rishhikabloom.netlify.app',
    amount: null,
    upiId: 'rishikablooms@upi'
  });

  const openQrModal = (customData = {}) => {
    setQrModalData({
      title: customData.title || 'Rishika Blooms Luxury Floral Atelier',
      url: customData.url || (typeof window !== 'undefined' ? window.location.href : 'https://rishhikabloom.netlify.app'),
      amount: customData.amount || null,
      upiId: customData.upiId || brandConfig?.upiId || 'rishikablooms@upi'
    });
    setIsQrModalOpen(true);
  };

  const closeQrModal = () => setIsQrModalOpen(false);

  // Mobile Phone App Frame Mode (Defaults to true: exact Meesho/Flipkart mobile width)
  const [isMobileFrame, setIsMobileFrame] = useState(() => {
    const saved = localStorage.getItem('rb_mobile_frame');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleMobileFrame = () => {
    setIsMobileFrame(prev => {
      const next = !prev;
      localStorage.setItem('rb_mobile_frame', String(next));
      return next;
    });
  };

  // Navigation / Page state
  const [currentView, setCurrentView] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash.startsWith('/category/')) {
      return { page: 'category', params: { categorySlug: hash.replace('/category/', '') } };
    }
    if (hash.startsWith('/product/')) {
      return { page: 'product', params: { productSlug: hash.replace('/product/', '') } };
    }
    if (['shop', 'build-bouquet', 'gift-combos', 'surprise-finder', 'about', 'contact', 'wishlist', 'cart', 'delivery-info', 'privacy', 'terms'].includes(hash)) {
      return { page: hash, params: {} };
    }
    return { page: 'home', params: {} };
  });

  // Cart state persisted in localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('rb_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist state persisted in localStorage
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('rb_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Recently viewed products
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const saved = localStorage.getItem('rb_recent');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Customer photo reviews state persisted in localStorage
  const [productReviews, setProductReviews] = useState(() => {
    try {
      const saved = localStorage.getItem('rb_product_reviews');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Applied Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Search and UI Drawers
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  // Cloud Database (Firebase Firestore) Connection State
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  // Reconnect and initialize cloud database
  const reconnectCloud = () => {
    initFirebase();
    const live = isFirebaseLive();
    setIsCloudConnected(live);
    return live;
  };

  // Realtime Cloud Synchronization across all devices globally
  useEffect(() => {
    initFirebase();
    const live = isFirebaseLive();
    setIsCloudConnected(live);

    if (!live) return;

    // Realtime Cloud Products Listener
    const unsubProducts = subscribeToCloudProducts(
      (cloudProducts) => {
        if (cloudProducts && cloudProducts.length > 0) {
          const activeProducts = cloudProducts.filter((p) => !p.isDeleted);
          const deletedIds = new Set(cloudProducts.filter((p) => p.isDeleted).map((p) => String(p.id)));
          const cloudIds = new Set(activeProducts.map((p) => String(p.id)));
          const defaultRemaining = INITIAL_PRODUCTS.filter(
            (p) => !cloudIds.has(String(p.id)) && !deletedIds.has(String(p.id))
          );
          const merged = [...activeProducts, ...defaultRemaining];
          setProducts(merged);
          syncProductsArray(merged);
          try {
            localStorage.setItem('rb_custom_products', JSON.stringify(merged));
          } catch (e) {}
        }
      },
      (err) => console.warn('Cloud products sync note:', err)
    );

    // Realtime Cloud Categories Listener
    const unsubCategories = subscribeToCloudCategories(
      (cloudCats) => {
        if (cloudCats && cloudCats.length > 0) {
          const activeCats = cloudCats.filter((c) => !c.isDeleted);
          const deletedCatIds = new Set(cloudCats.filter((c) => c.isDeleted).map((c) => String(c.id || c.slug)));
          const cloudSlugs = new Set(activeCats.map((c) => String(c.id || c.slug)));
          const defaultRemaining = INITIAL_CATEGORIES.filter(
            (c) => !cloudSlugs.has(String(c.id || c.slug)) && !deletedCatIds.has(String(c.id || c.slug))
          );
          setCategories([...activeCats, ...defaultRemaining]);
        }
      },
      (err) => console.warn('Cloud categories sync note:', err)
    );

    // Realtime Cloud Brand Config & PIN Listener
    const unsubBrand = subscribeToCloudBrand(
      (cloudBrand) => {
        if (cloudBrand && Object.keys(cloudBrand).length > 0) {
          setBrandConfig((prev) => {
            const updated = { ...prev, ...cloudBrand };
            try {
              localStorage.setItem('rb_brand_config', JSON.stringify(updated));
              if (updated.whatsappNumber && typeof window !== 'undefined') {
                window.__rb_active_whatsapp = updated.whatsappNumber;
              }
            } catch (e) {}
            return updated;
          });
          if (cloudBrand.ownerPin) {
            setOwnerPin(cloudBrand.ownerPin);
            localStorage.setItem('rb_owner_pin', cloudBrand.ownerPin);
          }
        }
      },
      (err) => console.warn('Cloud brand sync note:', err)
    );

    // Realtime Cloud Orders Listener
    const unsubOrders = subscribeToCloudOrders(
      (cloudOrders) => {
        if (cloudOrders && cloudOrders.length > 0) {
          setOrders(cloudOrders);
          try {
            localStorage.setItem('rb_orders', JSON.stringify(cloudOrders));
          } catch (e) {}
        }
      },
      (err) => console.warn('Cloud orders sync note:', err)
    );

    return () => {
      unsubProducts();
      unsubCategories();
      unsubBrand();
      if (unsubOrders) unsubOrders();
    };
  }, []);

  // Fetch verified products and persistent orders from backend SQLite REST API
  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
          syncProductsArray(data.products);
        }
      })
      .catch((err) => console.log('Backend products fetch notice:', err.message));

    fetch('/api/orders/my-orders')
      .then((r) => r.json())
      .then((serverOrders) => {
        if (Array.isArray(serverOrders) && serverOrders.length > 0) {
          setOrders(serverOrders);
          try {
            localStorage.setItem('rb_orders', JSON.stringify(serverOrders));
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  // Live orders & OTP delivery management
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('rb_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored orders:', e);
    }
    return [
      {
        orderId: 'RB-784291',
        deliveryOtp: '4892',
        status: 'Out for Delivery',
        createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        customerName: 'Aarav Sharma',
        customerPhone: '919876543210',
        recipientName: 'Sneha Patel',
        recipientPhone: '919876543210',
        deliveryAddress: 'Flat 402, Magnolia Tower, Lotus Boulevard, Sector 128',
        pincode: '110070',
        locationCoords: { lat: 28.5355, lng: 77.2655 },
        locationUrl: 'https://www.google.com/maps?q=28.5355,77.2655',
        deliveryDate: new Date().toISOString().split('T')[0],
        deliverySlot: 'Standard Delivery (1 PM - 5 PM)',
        giftMessage: 'Happy Birthday to my dearest Sneha! Wishing you endless blooms and joy.',
        items: [
          {
            id: 'silent-confession-midnight-blue',
            name: "'Silent Confession' Midnight Blue Birthday Velvet Bouquet",
            price: 1399,
            quantity: 1,
            selectedColor: 'Midnight Blue'
          }
        ],
        total: 1399,
        paymentMethod: 'WhatsApp Instant Checkout'
      }
    ];
  });

  // Modal states for Customer Order Receipt & Rider OTP verification
  const [activeOrderConfirmation, setActiveOrderConfirmation] = useState(null);
  const [isDeliveryOrdersModalOpen, setIsDeliveryOrdersModalOpen] = useState(false);
  const [incomingSmsBanner, setIncomingSmsBanner] = useState(null);

  const openOrderConfirmationModal = (order) => setActiveOrderConfirmation(order);
  const closeOrderConfirmationModal = () => setActiveOrderConfirmation(null);

  const openDeliveryOrdersModal = () => setIsDeliveryOrdersModalOpen(true);
  const closeDeliveryOrdersModal = () => setIsDeliveryOrdersModalOpen(false);

  const triggerIncomingSmsNotification = ({
    orderId,
    deliveryOtp,
    phone,
    customerName,
    autoLaunchNative = true
  }) => {
    const rawDigits = String(phone || '').replace(/\D/g, '');
    const phone10 = rawDigits.slice(-10);
    const id = orderId || `RB-${Math.floor(100000 + Math.random() * 900000)}`;
    const otp = String(deliveryOtp || '4892');
    const formattedPhone = phone10.length === 10
      ? `+91 ${phone10.slice(0, 5)} ${phone10.slice(5)}`
      : (phone || 'Your Mobile');

    const smsText = `🌸 Rishika Blooms: Your Secret Delivery Handover OTP for Order #${id} is: ${otp}. Please share this code with our rider only after collecting your bouquet at your doorstep.`;
    const smsUrl = phone10 ? `sms:${phone10}?body=${encodeURIComponent(smsText)}` : `sms:?body=${encodeURIComponent(smsText)}`;
    const waUrl = createWhatsAppUrl(
      `🌸 *RISHIKA BLOOMS*\nOrder #${id} Handover OTP:\n👉 *${otp}* 👈\n\nPlease share this 4-digit code with our delivery rider at your doorstep.`,
      phone10
    );

    const bannerData = {
      orderId: id,
      deliveryOtp: otp,
      phone: phone10,
      formattedPhone,
      customerName: customerName || 'Valued Patron',
      smsText,
      smsUrl,
      waUrl,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setIncomingSmsBanner(bannerData);

    // Play crisp incoming message tone & trigger mobile vibration
    playIncomingMessageTone();

    // Auto-launch SMS app on real mobile device if requested
    if (autoLaunchNative && phone10 && typeof window !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      setTimeout(() => {
        try {
          window.location.href = smsUrl;
        } catch (e) {
          console.warn('Native SMS redirect note:', e);
        }
      }, 350);
    }
  };

  const dismissIncomingSmsBanner = () => setIncomingSmsBanner(null);

  const createOrder = async (orderData) => {
    const orderId = orderData.orderId || `RB-${Math.floor(100000 + Math.random() * 900000)}`;
    const deliveryOtp = orderData.deliveryOtp || String(Math.floor(1000 + Math.random() * 9000));
    
    // Default initial status is 'Order Placed' (or 'Payment Confirmed' if paid)
    const initialStatus = orderData.paymentStatus === 'Paid' ? 'Payment Confirmed' : (orderData.status || 'Order Placed');

    const formattedOrder = {
      orderId,
      order_id: orderId,
      deliveryOtp,
      delivery_otp: deliveryOtp,
      status: initialStatus,
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
      customerName: orderData.customerName || 'Valued Patron',
      customer_name: orderData.customerName || 'Valued Patron',
      customerPhone: orderData.customerPhone || '',
      customer_phone: orderData.customerPhone || '',
      customerEmail: orderData.customerEmail || 'concierge@rishikablooms.com',
      customer_email: orderData.customerEmail || 'concierge@rishikablooms.com',
      recipientName: orderData.recipientName || orderData.customerName || 'Recipient',
      recipient_name: orderData.recipientName || orderData.customerName || 'Recipient',
      recipientPhone: orderData.recipientPhone || orderData.customerPhone || '',
      recipient_phone: orderData.recipientPhone || orderData.customerPhone || '',
      deliveryAddress: orderData.deliveryAddress || `${orderData.houseNo || ''}, ${orderData.streetAddress || ''}, ${orderData.city || 'Delhi'}`,
      delivery_address: orderData.deliveryAddress || `${orderData.houseNo || ''}, ${orderData.streetAddress || ''}, ${orderData.city || 'Delhi'}`,
      houseNo: orderData.houseNo || '',
      streetAddress: orderData.streetAddress || '',
      landmark: orderData.landmark || '',
      city: orderData.city || 'New Delhi',
      state: orderData.state || 'Delhi NCR',
      pincode: orderData.pincode || '',
      deliveryDate: orderData.deliveryDate || new Date().toISOString().split('T')[0],
      delivery_date: orderData.deliveryDate || new Date().toISOString().split('T')[0],
      deliverySlot: orderData.deliverySlot || 'Standard Delivery (1 PM - 5 PM)',
      delivery_slot: orderData.deliverySlot || 'Standard Delivery (1 PM - 5 PM)',
      giftMessage: orderData.giftMessage || '',
      gift_message: orderData.giftMessage || '',
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      deliveryFee: orderData.deliveryFee || 0,
      delivery_fee: orderData.deliveryFee || 0,
      discountAmount: orderData.discountAmount || 0,
      discount_amount: orderData.discountAmount || 0,
      total: orderData.total || 0,
      paymentMethod: orderData.paymentMethod || 'Cash on Delivery (OTP Handover)',
      payment_method: orderData.paymentMethod || 'Cash on Delivery (OTP Handover)',
      paymentStatus: orderData.paymentStatus || 'Pending',
      payment_status: orderData.paymentStatus || 'Pending',
      courier_provider: 'Risika Express Dedicated Fleet',
      tracking_number: `TRK-${orderId.replace(/[^0-9]/g, '').slice(-6)}`,
      tracking_url: `#/order-tracking?orderId=${orderId}`,
      statusHistory: [
        {
          status: initialStatus,
          timestamp: new Date().toISOString(),
          note: 'Order successfully logged to persistent database registry.',
          updatedBy: 'Customer (Online Checkout)'
        }
      ]
    };

    // 1. Persist to Backend SQLite Database
    try {
      const resp = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedOrder)
      });
      if (resp.ok) {
        const saved = await resp.json();
        const merged = { ...formattedOrder, ...saved, orderId: saved.order_id || saved.orderId };
        setOrders(prev => [merged, ...prev.filter(o => (o.orderId || o.order_id) !== merged.orderId)]);
        try {
          localStorage.setItem('rb_orders', JSON.stringify([merged, ...orders]));
        } catch (e) {}
        return merged;
      }
    } catch (err) {
      console.warn('Backend SQLite order dispatch note:', err.message);
    }

    // 2. Synchronize to local state & cloud fallback
    setOrders((prev) => {
      const updated = [formattedOrder, ...prev];
      try {
        localStorage.setItem('rb_orders', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isCloudConnected) {
      cloudSaveOrder(formattedOrder);
    }

    return formattedOrder;
  };

  const verifyDeliveryOtp = async (orderId, enteredOtp) => {
    // 1. Try Backend verification
    try {
      const resp = await fetch(`/api/admin/orders/${orderId}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-owner-pin': ownerPin || 'risika2026'
        },
        body: JSON.stringify({ otp: enteredOtp })
      });
      if (resp.ok) {
        const resData = await resp.json();
        setOrders(prev => prev.map(o => (o.orderId === orderId || o.order_id === orderId) ? { ...o, status: 'Delivered', payment_status: 'Paid', paymentStatus: 'Paid' } : o));
        showToast('🎉 Doorstep Handover Verified! Order Delivered.', 'success');
        return { success: true, order: resData.order };
      } else {
        const errJson = await resp.json();
        showToast(errJson.error || 'Invalid OTP', 'error');
        return { success: false, message: errJson.error };
      }
    } catch (e) {
      console.warn('Backend OTP verification note:', e);
    }

    // Local fallback verification
    const targetOrder = orders.find(o => String(o.orderId || o.order_id) === String(orderId));
    if (!targetOrder) {
      return { success: false, message: 'Order reference not found in registry.' };
    }

    if (String(enteredOtp).trim() !== String(targetOrder.deliveryOtp || targetOrder.delivery_otp).trim()) {
      return { success: false, message: 'Invalid 4-digit Delivery OTP. Please verify with customer.' };
    }

    const deliveredAt = new Date().toISOString();
    const updatedOrder = {
      ...targetOrder,
      status: 'Delivered',
      paymentStatus: 'Paid',
      payment_status: 'Paid',
      deliveredAt
    };

    setOrders(prev => {
      const updated = prev.map(o => String(o.orderId || o.order_id) === String(orderId) ? updatedOrder : o);
      try {
        localStorage.setItem('rb_orders', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isCloudConnected) {
      cloudUpdateOrderStatus(orderId, { status: 'Delivered', deliveredAt });
    }

    return { success: true, order: updatedOrder };
  };

  const updateOrderStatus = async (orderId, newStatusOrObject, maybeNote = '') => {
    const targetStatus = typeof newStatusOrObject === 'object' ? (newStatusOrObject.status || 'Order Confirmed') : newStatusOrObject;
    const courierProvider = typeof newStatusOrObject === 'object' && newStatusOrObject.courier ? newStatusOrObject.courier.provider : null;
    const trackingNumber = typeof newStatusOrObject === 'object' && newStatusOrObject.courier ? newStatusOrObject.courier.trackingNumber : null;
    const trackingUrl = typeof newStatusOrObject === 'object' && newStatusOrObject.courier ? newStatusOrObject.courier.trackingUrl : null;
    const note = maybeNote || (typeof newStatusOrObject === 'object' ? newStatusOrObject.note : '');

    // 1. Update on Backend SQLite
    try {
      const resp = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-owner-pin': ownerPin || 'risika2026'
        },
        body: JSON.stringify({ 
          newStatus: targetStatus, 
          note,
          courierProvider,
          trackingNumber,
          trackingUrl
        })
      });
      if (resp.ok) {
        showToast(`Order #${orderId} status updated to: ${targetStatus}`, 'success');
      }
    } catch (err) {
      console.warn('Backend status update note:', err.message);
    }

    // 2. Synchronize local state
    setOrders(prev => {
      const updated = prev.map(o => {
        if (String(o.orderId || o.order_id) === String(orderId)) {
          return {
            ...o,
            status: targetStatus,
            ...(courierProvider ? { courier_provider: courierProvider, tracking_number: trackingNumber, tracking_url: trackingUrl } : {})
          };
        }
        return o;
      });
      try {
        localStorage.setItem('rb_orders', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isCloudConnected) {
      cloudUpdateOrderStatus(orderId, { status: targetStatus });
    }
  };

  // Sync theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rb_theme', theme);
  }, [theme]);

  // Sync language
  useEffect(() => {
    localStorage.setItem('rb_language', language);
  }, [language]);

  // Sync cart
  useEffect(() => {
    localStorage.setItem('rb_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync wishlist
  useEffect(() => {
    localStorage.setItem('rb_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Sync recently viewed
  useEffect(() => {
    localStorage.setItem('rb_recent', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  // Secret Owner URL Hash Support (#owner, #admin, #studio, #login)
  useEffect(() => {
    const handleSecretHash = () => {
      try {
        const h = (window.location.hash || '').toLowerCase();
        if (h === '#owner' || h === '#admin' || h === '#studio' || h === '#login') {
          setIsOwnerLoginModalOpen(true);
          // Cleanly remove the hash from URL bar without refreshing
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } catch (e) {}
    };
    handleSecretHash();
    window.addEventListener('hashchange', handleSecretHash);
    return () => window.removeEventListener('hashchange', handleSecretHash);
  }, []);

  // Manage active drawer and modal class to hide floating docks cleanly
  useEffect(() => {
    const isModalActive = isCartOpen || isWishlistOpen || isSearchOpen || 
      isOwnerLoginModalOpen || isOwnerProductModalOpen || isOwnerSettingsModalOpen || 
      isDeliveryOrdersModalOpen || Boolean(activeOrderConfirmation) || isQrModalOpen ||
      Boolean(quickViewProduct);

    if (isModalActive) {
      document.body.classList.add('drawer-open', 'app-modal-active');
    } else {
      document.body.classList.remove('drawer-open', 'app-modal-active', 'modal-locked');
      document.documentElement.classList.remove('drawer-open', 'app-modal-active', 'modal-locked');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.body.classList.remove('drawer-open', 'app-modal-active', 'modal-locked');
      document.documentElement.classList.remove('drawer-open', 'app-modal-active', 'modal-locked');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [
    isCartOpen, isWishlistOpen, isSearchOpen, 
    isOwnerLoginModalOpen, isOwnerProductModalOpen, isOwnerSettingsModalOpen, 
    isDeliveryOrdersModalOpen, activeOrderConfirmation, isQrModalOpen,
    quickViewProduct
  ]);

  // Handle hash changes for browser back/forward and secret leader entry
  useEffect(() => {
    const handleHashCheck = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase().trim();
      if (['logout', '/logout', 'exit', '/exit'].includes(hash)) {
        setIsOwnerAuthenticated(false);
        localStorage.removeItem('rb_owner_auth');
        sessionStorage.removeItem('rb_owner_auth');
        setIsOwnerProductModalOpen(false);
        setIsOwnerSettingsModalOpen(false);
        showToast('🔒 Owner Mode Deactivated. Returned to Customer View.', 'info');
        try {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        } catch {
          window.location.hash = '';
        }
        return;
      }
      if (['leader', '/leader', 'owner', '/owner', 'admin', '/admin', 'studio', '/studio'].includes(hash)) {
        setIsOwnerLoginModalOpen(true);
        try {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        } catch {
          window.location.hash = '';
        }
        return;
      }
      if (hash.startsWith('/category/')) {
        setCurrentView({ page: 'category', params: { categorySlug: hash.replace('/category/', '') } });
      } else if (hash.startsWith('/product/')) {
        setCurrentView({ page: 'product', params: { productSlug: hash.replace('/product/', '') } });
      } else if (hash) {
        setCurrentView({ page: hash, params: {} });
      } else {
        setCurrentView({ page: 'home', params: {} });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Check on initial mount in case URL contains #leader or #owner
    handleHashCheck();

    window.addEventListener('hashchange', handleHashCheck);

    // Secret desktop keyboard shortcut for owner/leader (Ctrl+Shift+L or Ctrl+Shift+O)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'O' || e.key === 'L' || e.key === 'o' || e.key === 'l')) {
        e.preventDefault();
        setIsOwnerLoginModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleHashCheck);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navigateTo = (page, params = {}) => {
    setCurrentView({ page, params });
    if (page === 'home') {
      window.location.hash = '';
    } else if (page === 'category') {
      window.location.hash = `/category/${params.categorySlug}`;
    } else if (page === 'product') {
      window.location.hash = `/product/${params.productSlug}`;
    } else {
      window.location.hash = page;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    showToast(theme === 'light' ? '🌙 Switched to Velvet Noir Dark Mode' : '☀️ Switched to Rose Ivory Light Mode', 'info');
  };

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === 'en' ? 'hi' : 'en';
      localStorage.setItem('rb_language', next);
      showToast(next === 'hi' ? 'भाषा: हिंदी (Hindi Mode Active)' : 'Language: English', 'info');
      return next;
    });
  };

  const t = (key) => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en || {};
    if (key === 'tagline') {
      return language === 'hi' && (brandConfig.taglineHindi || BRAND_CONFIG.taglineHindi)
        ? (brandConfig.taglineHindi || BRAND_CONFIG.taglineHindi)
        : (brandConfig.tagline || BRAND_CONFIG.tagline);
    }
    if (key === 'announcement') {
      return langDict['announcement'] || BRAND_CONFIG.announcement;
    }
    return langDict[key] || key;
  };

  // Cart operations
  const addToCart = (product, customConfig = {}) => {
    const cartItemId = `${product.id}-${customConfig.selectedColor || 'def'}-${customConfig.selectedSize || 'def'}-${customConfig.selectedWrap || 'def'}-${customConfig.selectedRibbon || 'def'}`;

    const existingIndex = cart.findIndex((item) => item.cartItemId === cartItemId);

    const price = customConfig.unitPrice || product.price;

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += customConfig.quantity || 1;
      setCart(updated);
    } else {
      const newItem = {
        cartItemId,
        id: product.id,
        name: product.name,
        nameHindi: product.nameHindi,
        slug: product.slug,
        image: customConfig.image || product.image,
        price,
        originalPrice: product.originalPrice,
        quantity: customConfig.quantity || 1,
        selectedColor: customConfig.selectedColor || (product.colorOptions?.[0]?.name || null),
        selectedSize: customConfig.selectedSize || (product.sizeOptions?.[0]?.name || null),
        selectedWrap: customConfig.selectedWrap || null,
        selectedRibbon: customConfig.selectedRibbon || null,
        customDetails: customConfig.customDetails || null,
        addOns: customConfig.addOns || []
      };
      setCart([...cart, newItem]);
    }

    showToast(`🌸 Added "${product.name}" to your shopping bag!`);
  };

  const removeFromCart = (cartItemId) => {
    setCart(cart.filter((item) => item.cartItemId !== cartItemId));
    showToast('Item removed from shopping bag', 'info');
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(
      cart.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Cart calculations
  const cartSubtotal = cart.reduce((acc, item) => {
    const addOnsTotal = (item.addOns || []).reduce((a, c) => a + c.price, 0);
    return acc + (item.price + addOnsTotal) * item.quantity;
  }, 0);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const freeDeliveryThreshold = brandConfig.delivery?.freeThreshold ?? BRAND_CONFIG.delivery.freeThreshold;
  const standardDeliveryFee = brandConfig.delivery?.standardFee ?? BRAND_CONFIG.delivery.standardFee;
  const deliveryFee = cartSubtotal >= freeDeliveryThreshold || cartSubtotal === 0 ? 0 : standardDeliveryFee;

  // Coupon handling
  const applyCoupon = (code) => {
    const found = BRAND_CONFIG.coupons.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase()
    );
    if (!found) {
      showToast('❌ Invalid promo code. Try "BLOOM10" or "FIRSTGIFT"', 'error');
      return false;
    }
    if (cartSubtotal < found.minSpend) {
      showToast(`⚠️ Minimum cart value of ₹${found.minSpend} required for coupon ${found.code}`, 'warning');
      return false;
    }
    setAppliedCoupon(found);
    setCouponCode(found.code);
    showToast(`🎉 Coupon "${found.code}" applied successfully!`, 'success');
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    showToast('Coupon removed', 'info');
  };

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercent) {
      discountAmount = Math.round((cartSubtotal * appliedCoupon.discountPercent) / 100);
    } else if (appliedCoupon.discountFlat) {
      discountAmount = appliedCoupon.discountFlat;
    }
  }

  const cartTotal = Math.max(0, cartSubtotal - discountAmount + deliveryFee);

  // Wishlist operations
  const toggleWishlist = (productId) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter((id) => id !== productId));
      showToast('Removed from your wishlist', 'info');
    } else {
      setWishlist([...wishlist, productId]);
      showToast('💖 Saved to your floral wishlist!');
    }
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  // Recently viewed
  const addRecentlyViewed = (product) => {
    if (!product) return;
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, 8);
    });
  };

  // Customer Review Operations (Flipkart/Meesho style with user photo uploads)
  const getProductReviews = (productId, initialReviews = []) => {
    const userList = productReviews[productId] || [];
    return [...userList, ...initialReviews];
  };

  const addProductReview = (productId, reviewData) => {
    const newReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      author: reviewData.author?.trim() || 'Verified Customer',
      location: reviewData.location ? reviewData.location.trim() : 'Verified Buyer',
      rating: Number(reviewData.rating) || 5,
      title: reviewData.title ? reviewData.title.trim() : '',
      comment: reviewData.comment?.trim() || '',
      images: reviewData.images || [],
      date: 'Just now',
      isVerified: true,
      helpfulCount: 0,
      createdAt: Date.now()
    };

    const currentList = productReviews[productId] || [];
    const updatedMap = {
      ...productReviews,
      [productId]: [newReview, ...currentList]
    };

    setProductReviews(updatedMap);
    try {
      localStorage.setItem('rb_product_reviews', JSON.stringify(updatedMap));
    } catch (e) {
      console.warn('Storage quota for reviews warning:', e);
    }
    showToast('🎉 Review & photos published successfully! Thank you for your feedback.', 'success');
    return newReview;
  };

  const voteReviewHelpful = (productId, reviewId) => {
    const currentList = productReviews[productId] || [];
    const updated = currentList.map((r) => {
      if (r.id === reviewId) {
        return { ...r, helpfulCount: (r.helpfulCount || 0) + 1, userLiked: true };
      }
      return r;
    });
    const updatedMap = { ...productReviews, [productId]: updated };
    setProductReviews(updatedMap);
    try {
      localStorage.setItem('rb_product_reviews', JSON.stringify(updatedMap));
    } catch (e) {}
    showToast('👍 Marked as helpful!', 'info');
  };

  const deleteProductReview = (productId, reviewId) => {
    if (!isOwnerAuthenticated) {
      showToast('❌ Unauthorized: Only the verified store owner can delete reviews.', 'error');
      return;
    }
    const currentList = productReviews[productId] || [];
    const updated = currentList.filter((r) => r.id !== reviewId);
    const updatedMap = { ...productReviews, [productId]: updated };
    setProductReviews(updatedMap);
    try {
      localStorage.setItem('rb_product_reviews', JSON.stringify(updatedMap));
    } catch (e) {}
    showToast('🗑️ Review removed.', 'info');
  };

  // Pincode validation helper (Supports all standard Indian 6-digit PIN codes)
  const checkDeliveryPincode = (pincode) => {
    const clean = (pincode || '').toString().trim();
    if (!/^\d{6}$/.test(clean)) {
      return { valid: false, message: 'Please enter a valid 6-digit Indian PIN code' };
    }

    // Metro check
    const isMetro = ['11', '12', '20', '40', '56', '50', '60', '70'].some((prefix) =>
      clean.startsWith(prefix)
    );

    return {
      valid: true,
      pincode: clean,
      sameDay: true,
      midnight: true,
      city: isMetro ? 'Metro Express Zone' : 'Standard Delivery Region',
      deliveryEstimate: isMetro ? 'Today (Order before 7 PM)' : 'Within 24-48 Hours',
      slots: ['Morning (8 AM - 11 AM)', 'Standard (1 PM - 5 PM)', 'Evening (6 PM - 9 PM)', 'Midnight Surprise (11:15 PM - 12:00 AM)']
    };
  };

  // =========================================================================
  // OWNER PORTAL OPERATIONS (Authorized Owner Only)
  // =========================================================================
  const loginAsOwner = (pin) => {
    const cleanPin = (pin || '').trim();
    if (!cleanPin) {
      return { success: false, error: 'Please enter Security PIN' };
    }
    // Strict authentication against configured owner PIN only - no bypass backdoors
    if (cleanPin === ownerPin) {
      setIsOwnerAuthenticated(true);
      localStorage.setItem('rb_owner_auth', 'true');
      setIsOwnerLoginModalOpen(false);
      showToast('👑 Welcome Store Owner! Studio Mode Activated.', 'success');
      return { success: true };
    } else {
      showToast('❌ Incorrect Owner PIN. Access Denied.', 'error');
      return { success: false, error: 'Incorrect Security PIN. Access is restricted to authorized store administrators.' };
    }
  };

  const logoutOwner = () => {
    setIsOwnerAuthenticated(false);
    localStorage.removeItem('rb_owner_auth');
    setIsOwnerProductModalOpen(false);
    setIsOwnerSettingsModalOpen(false);
    showToast('🔒 Owner Mode Deactivated. Returned to Customer View.', 'info');
  };

  const openOwnerLogin = () => {
    setIsOwnerLoginModalOpen(true);
  };

  const closeOwnerLogin = () => {
    setIsOwnerLoginModalOpen(false);
  };

  const openOwnerSettingsModal = (tab = 'numbers') => {
    if (!isOwnerAuthenticated) {
      setIsOwnerLoginModalOpen(true);
      showToast('🔒 Please enter Owner PIN to open store settings.', 'info');
      return;
    }
    setOwnerSettingsActiveTab(tab);
    setIsOwnerSettingsModalOpen(true);
  };

  const closeOwnerSettingsModal = () => {
    setIsOwnerSettingsModalOpen(false);
  };

  const changeOwnerPin = (currentPin, newPin) => {
    if (!isOwnerAuthenticated) {
      showToast('❌ Only authorized store owners can change PIN.', 'error');
      return { success: false, error: 'Unauthorized.' };
    }
    const cleanCurrent = (currentPin || '').trim();
    const cleanNew = (newPin || '').trim();

    if (cleanCurrent !== ownerPin) {
      showToast('❌ Current PIN is incorrect', 'error');
      return { success: false, error: 'Current PIN is incorrect.' };
    }
    if (!cleanNew || cleanNew.length < 4) {
      showToast('⚠️ New PIN must be at least 4 characters', 'error');
      return { success: false, error: 'New PIN must be at least 4 characters.' };
    }

    setOwnerPin(cleanNew);
    localStorage.setItem('rb_owner_pin', cleanNew);
    if (isFirebaseLive()) {
      cloudSaveBrand({ ownerPin: cleanNew });
    }
    showToast('🔑 Owner Security PIN updated successfully across devices!', 'success');
    return { success: true };
  };

  const resetOwnerPinToDefault = () => {
    if (!isOwnerAuthenticated) {
      showToast('❌ Unauthorized', 'error');
      return { success: false };
    }
    setOwnerPin('risika2026');
    localStorage.removeItem('rb_owner_pin');
    if (isFirebaseLive()) {
      cloudSaveBrand({ ownerPin: 'risika2026' });
    }
    showToast('🔄 Owner PIN reset back to default: risika2026', 'info');
    return { success: true };
  };

  const updateBrandConfig = (newSettings) => {
    if (!isOwnerAuthenticated) {
      showToast('❌ Only store owner can modify settings.', 'error');
      setIsOwnerLoginModalOpen(true);
      return null;
    }
    const updated = {
      ...brandConfig,
      ...newSettings,
      delivery: {
        ...brandConfig.delivery,
        ...(newSettings.delivery || {})
      },
      socials: {
        ...brandConfig.socials,
        ...(newSettings.socials || {})
      }
    };
    setBrandConfig(updated);
    try {
      localStorage.setItem('rb_brand_config', JSON.stringify(updated));
      if (updated.whatsappNumber && typeof window !== 'undefined') {
        window.__rb_active_whatsapp = updated.whatsappNumber;
      }
    } catch (e) {
      console.error('Storage quota error updating brand config:', e);
    }
    if (isFirebaseLive()) {
      cloudSaveBrand(updated);
    }
    showToast('✅ Store details & contact numbers updated live!', 'success');
    return updated;
  };

  const resetBrandConfig = () => {
    if (!isOwnerAuthenticated) {
      showToast('❌ Unauthorized', 'error');
      return;
    }
    setBrandConfig({ ...BRAND_CONFIG });
    localStorage.removeItem('rb_brand_config');
    if (typeof window !== 'undefined') {
      window.__rb_active_whatsapp = BRAND_CONFIG.whatsappNumber;
    }
    if (isFirebaseLive()) {
      cloudSaveBrand(BRAND_CONFIG);
    }
    showToast('🔄 Store settings restored to original defaults.', 'info');
  };

  const openAddProductModal = (categorySlug = null) => {
    if (!isOwnerAuthenticated) {
      setIsOwnerLoginModalOpen(true);
      showToast('🔒 Please log in as owner to add bouquets.', 'info');
      return;
    }
    setEditingProduct(null);
    setOwnerModalDefaultCategory(categorySlug);
    setIsOwnerProductModalOpen(true);
  };

  const openEditProductModal = (product) => {
    if (!isOwnerAuthenticated) {
      setIsOwnerLoginModalOpen(true);
      showToast('🔒 Please log in as owner to modify bouquets.', 'info');
      return;
    }
    setEditingProduct(product);
    setOwnerModalDefaultCategory(product.category);
    setIsOwnerProductModalOpen(true);
  };

  const closeOwnerProductModal = () => {
    setIsOwnerProductModalOpen(false);
    setEditingProduct(null);
    setOwnerModalDefaultCategory(null);
  };

  const saveOwnerProduct = (productData) => {
    if (!isOwnerAuthenticated) {
      showToast('❌ Unauthorized: Only the verified store owner can save bouquets.', 'error');
      setIsOwnerLoginModalOpen(true);
      return false;
    }
    let updatedList;
    let savedItem;
    const isEditing = Boolean(productData.id && products.some((p) => p.id === productData.id));

    if (isEditing) {
      savedItem = productData;
      updatedList = products.map((p) => (p.id === productData.id ? { ...p, ...productData } : p));
      showToast(`🌸 Bouquet "${productData.name}" updated successfully!`, 'success');
    } else {
      const newId = productData.id || `custom-bouquet-${Date.now()}`;
      savedItem = {
        ...productData,
        id: newId,
        slug: productData.slug || newId,
        reviewCount: productData.reviewCount || 1,
        rating: productData.rating || 5.0
      };
      updatedList = [savedItem, ...products];
      showToast(`🎉 New bouquet "${productData.name}" published to store!`, 'success');
    }

    setProducts(updatedList);
    syncProductsArray(updatedList);

    try {
      localStorage.setItem('rb_custom_products', JSON.stringify(updatedList));
    } catch (err) {
      console.warn('Storage quota warning when persisting custom bouquet:', err);
      showToast('⚠️ Storage note: Image is live for this session. (Local quota reached)', 'warning');
    }

    // Live Global Cloud Sync across all devices
    if (isFirebaseLive()) {
      cloudSaveProduct(savedItem).then((ok) => {
        if (ok) {
          showToast('☁️ Live Cloud Synced! Sabhi phones par live update ho gaya.', 'success');
        } else {
          showToast('⚠️ Cloud note: Changes phone me save hain, cloud retry ho raha hai.', 'warning');
        }
      });
    }

    closeOwnerProductModal();
    return true;
  };

  const deleteOwnerProduct = (productId) => {
    if (!isOwnerAuthenticated) {
      showToast('❌ Unauthorized: Only the verified store owner can delete bouquets.', 'error');
      setIsOwnerLoginModalOpen(true);
      return false;
    }
    const updatedList = products.filter((p) => p.id !== productId);
    setProducts(updatedList);
    syncProductsArray(updatedList);
    try {
      localStorage.setItem('rb_custom_products', JSON.stringify(updatedList));
    } catch (err) {
      console.error(err);
    }

    // Live Global Cloud Sync across all devices
    if (isFirebaseLive()) {
      cloudDeleteProduct(productId).then((ok) => {
        if (ok) {
          showToast('☁️ Cloud Synced! Doosre sabhi phones se bhi delete ho gaya.', 'info');
        }
      });
    }

    closeOwnerProductModal();
    showToast('🗑️ Bouquet removed from store catalog.', 'info');
  };

  const resetProductsToDefault = () => {
    if (!isOwnerAuthenticated) {
      showToast('❌ Unauthorized', 'error');
      return;
    }
    setProducts([...INITIAL_PRODUCTS]);
    syncProductsArray([...INITIAL_PRODUCTS]);
    localStorage.removeItem('rb_custom_products');
    showToast('🔄 Restored default catalogue.', 'info');
  };

  // Owner Category Management (Create, Edit, Delete Headings like Birthday, Marriage, etc.)
  const saveOwnerCategory = (categoryData) => {
    if (!isOwnerAuthenticated) {
      showToast('❌ Unauthorized: Only the verified store owner can modify categories.', 'error');
      setIsOwnerLoginModalOpen(true);
      return false;
    }
    const isEditing = Boolean(categoryData.id && categories.some((c) => c.id === categoryData.id));
    let updatedList;
    let savedCat;
    if (isEditing) {
      savedCat = categoryData;
      updatedList = categories.map((c) => (c.id === categoryData.id ? { ...c, ...categoryData } : c));
      showToast(`Heading "${categoryData.name}" updated!`);
    } else {
      const slug = categoryData.slug || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      savedCat = {
        id: categoryData.id || `custom-cat-${Date.now()}`,
        slug,
        itemCount: '0 Styles',
        icon: 'Sparkles',
        featured: true,
        isCustomAddedByOwner: true,
        image: categoryData.image || '/images/red_roses_luxury_bouquet.jpg',
        bannerImage: categoryData.bannerImage || categoryData.image || '/images/red_roses_luxury_bouquet.jpg',
        description: categoryData.description || 'Exclusive curated collection of handcrafted luxury floral creations.',
        ...categoryData
      };
      updatedList = [savedCat, ...categories];
      showToast(`🎉 New heading "${categoryData.name}" created!`);
    }
    setCategories(updatedList);
    try {
      localStorage.setItem('rb_custom_categories', JSON.stringify(updatedList));
    } catch (e) {
      console.warn('Error saving categories:', e);
    }

    // Live Global Cloud Sync across all devices
    if (isFirebaseLive()) {
      cloudSaveCategory(savedCat);
    }
  };

    const resetCategoriesToDefault = () => {
    setCategories([...INITIAL_CATEGORIES]);
    try {
      localStorage.removeItem('rb_custom_categories');
      localStorage.setItem('rb_custom_categories', JSON.stringify(INITIAL_CATEGORIES));
    } catch (e) {
      console.warn('Error resetting categories:', e);
    }
    showToast('✨ Restored all 14 official category collections!');
  };

  const deleteOwnerCategory = (categoryId) => {
    if (!isOwnerAuthenticated) {
      showToast('❌ Unauthorized: Only the verified store owner can delete categories.', 'error');
      setIsOwnerLoginModalOpen(true);
      return false;
    }
    const updatedList = categories.filter((c) => c.id !== categoryId && c.slug !== categoryId);
    setCategories(updatedList);
    try {
      localStorage.setItem('rb_custom_categories', JSON.stringify(updatedList));
    } catch (e) {
      console.warn('Error saving categories:', e);
    }

    // Live Global Cloud Sync across all devices
    if (isFirebaseLive()) {
      cloudDeleteCategory(categoryId);
    }

    showToast('Heading removed.', 'info');
  };

  return (
    <ShopContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        toggleLanguage,
        t,
        currentView,
        navigateTo,
        products,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartSubtotal,
        cartCount,
        deliveryFee,
        discountAmount,
        cartTotal,
        couponCode,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        wishlist,
        toggleWishlist,
        isInWishlist,
        recentlyViewed,
        addRecentlyViewed,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        quickViewProduct,
        setQuickViewProduct,
        toasts,
        showToast,
        checkDeliveryPincode,
        // Owner Portal & Studio State
        isOwnerAuthenticated,
        isOwnerLoginModalOpen,
        isOwnerProductModalOpen,
        isOwnerSettingsModalOpen,
        ownerSettingsActiveTab,
        setOwnerSettingsActiveTab,
        editingProduct,
        ownerModalDefaultCategory,
        // Owner Operations
        loginAsOwner,
        logoutOwner,
        openOwnerLogin,
        closeOwnerLogin,
        openAddProductModal,
        openEditProductModal,
        closeOwnerProductModal,
        openOwnerSettingsModal,
        closeOwnerSettingsModal,
        saveOwnerProduct,
        deleteOwnerProduct,
        resetProductsToDefault,
        // Categories & Headings (Birthday, Marriage, etc.)
        categories,
        saveOwnerCategory,
        deleteOwnerCategory,
        resetCategoriesToDefault,
        // Brand & Store Configurations (WhatsApp Number, Phone, Address, Announcements)
        brandConfig,
        updateBrandConfig,
        resetBrandConfig,
        ownerPin,
        changeOwnerPin,
        resetOwnerPinToDefault,
        // Customer Photo Reviews & Feedback (Flipkart/Meesho style)
        productReviews,
        getProductReviews,
        addProductReview,
        voteReviewHelpful,
        deleteProductReview,
        // QR Code & Scanner Modal
        isQrModalOpen,
        qrModalData,
        openQrModal,
        closeQrModal,
        // Mobile App Shell Frame Mode (Meesho / Flipkart Viewport)
        isMobileFrame,
        toggleMobileFrame,
        // Live Orders & OTP Delivery Verification
        orders,
        createOrder,
        verifyDeliveryOtp,
        updateOrderStatus,
        activeOrderConfirmation,
        openOrderConfirmationModal,
        closeOrderConfirmationModal,
        isDeliveryOrdersModalOpen,
        openDeliveryOrdersModal,
        closeDeliveryOrdersModal,
        // Realtime SMS / WhatsApp OTP Notification System
        incomingSmsBanner,
        triggerIncomingSmsNotification,
        dismissIncomingSmsBanner,
        // Realtime Global Cloud Database Sync (Google Firebase Firestore)
        isCloudConnected,
        reconnectCloud,
        cloudBulkUploadCatalog,
        getFirebaseConfig,
        saveFirebaseConfig
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
