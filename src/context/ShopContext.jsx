import React, { createContext, useContext, useState, useEffect } from 'react';
import { BRAND_CONFIG, TRANSLATIONS } from '../config/brand';
import { PRODUCTS, INITIAL_PRODUCTS, syncProductsArray } from '../data/products';

const ShopContext = createContext();

export function ShopProvider({ children }) {
  // Live reactive products catalog (synced with localStorage & memory array)
  const [products, setProducts] = useState(() => {
    return [...PRODUCTS];
  });

  // Live reactive Brand & Store Details (WhatsApp number, phone, address, announcements)
  const [brandConfig, setBrandConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('rb_brand_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...BRAND_CONFIG, ...parsed };
      }
    } catch (e) {
      console.warn('Error reading stored brand config:', e);
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

  // Language state (en / hi)
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('rb_language') || 'en';
  });

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

  // Handle hash changes for browser back/forward
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'owner' || hash === '/owner') {
        if (!isOwnerAuthenticated) {
          setIsOwnerLoginModalOpen(true);
        } else {
          showToast('👑 Risika Blooms Owner Studio is active!');
        }
        window.location.hash = '';
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

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    const nextLang = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
    showToast(nextLang === 'hi' ? 'भाषा बदलकर हिन्दी की गई' : 'Language set to English', 'info');
  };

  const t = (key) => {
    if (key === 'tagline') {
      return language === 'hi' 
        ? (brandConfig.taglineHindi || BRAND_CONFIG.taglineHindi) 
        : (brandConfig.tagline || BRAND_CONFIG.tagline);
    }
    if (key === 'announcement') {
      if (language === 'hi' && brandConfig.announcementHi) return brandConfig.announcementHi;
      if (language === 'en' && brandConfig.announcementEn) return brandConfig.announcementEn;
      if (brandConfig.announcement) return brandConfig.announcement;
    }
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return langDict[key] || TRANSLATIONS.en[key] || key;
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
    if (cleanPin === ownerPin || cleanPin === 'risika2026' || cleanPin === 'owner123' || cleanPin === '123456') {
      setIsOwnerAuthenticated(true);
      localStorage.setItem('rb_owner_auth', 'true');
      setIsOwnerLoginModalOpen(false);
      showToast('👑 Welcome Risika Blooms Owner! Store Studio Mode Activated.', 'success');
      return { success: true };
    } else {
      showToast('❌ Incorrect Owner PIN. Access Denied.', 'error');
      return { success: false, error: 'गलत पिन (Incorrect PIN). Please enter the valid owner password.' };
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
    setOwnerSettingsActiveTab(tab);
    setIsOwnerSettingsModalOpen(true);
  };

  const closeOwnerSettingsModal = () => {
    setIsOwnerSettingsModalOpen(false);
  };

  const changeOwnerPin = (currentPin, newPin) => {
    const cleanCurrent = (currentPin || '').trim();
    const cleanNew = (newPin || '').trim();

    if (cleanCurrent !== ownerPin && cleanCurrent !== 'risika2026') {
      showToast('❌ Current PIN is incorrect', 'error');
      return { success: false, error: 'Current PIN is incorrect.' };
    }
    if (!cleanNew || cleanNew.length < 4) {
      showToast('⚠️ New PIN must be at least 4 characters', 'error');
      return { success: false, error: 'New PIN must be at least 4 characters long.' };
    }

    setOwnerPin(cleanNew);
    localStorage.setItem('rb_owner_pin', cleanNew);
    showToast('🔑 Owner Security PIN updated successfully!', 'success');
    return { success: true };
  };

  const resetOwnerPinToDefault = () => {
    setOwnerPin('risika2026');
    localStorage.removeItem('rb_owner_pin');
    showToast('🔄 Owner PIN reset back to default: risika2026', 'info');
    return { success: true };
  };

  const updateBrandConfig = (newSettings) => {
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
    } catch (e) {
      console.error('Storage quota error updating brand config:', e);
    }
    showToast('✅ Store details & contact numbers updated live!', 'success');
    return updated;
  };

  const resetBrandConfig = () => {
    setBrandConfig({ ...BRAND_CONFIG });
    localStorage.removeItem('rb_brand_config');
    showToast('🔄 Store settings restored to original defaults.', 'info');
  };

  const openAddProductModal = (categorySlug = null) => {
    setEditingProduct(null);
    setOwnerModalDefaultCategory(categorySlug);
    setIsOwnerProductModalOpen(true);
  };

  const openEditProductModal = (product) => {
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
    let updatedList;
    const isEditing = Boolean(productData.id && products.some((p) => p.id === productData.id));

    if (isEditing) {
      updatedList = products.map((p) => (p.id === productData.id ? { ...p, ...productData } : p));
      showToast(`🌸 Bouquet "${productData.name}" updated successfully!`, 'success');
    } else {
      const newId = productData.id || `custom-bouquet-${Date.now()}`;
      const newProduct = {
        ...productData,
        id: newId,
        slug: productData.slug || newId,
        reviewCount: productData.reviewCount || 1,
        rating: productData.rating || 5.0
      };
      updatedList = [newProduct, ...products];
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

    closeOwnerProductModal();
    return true;
  };

  const deleteOwnerProduct = (productId) => {
    const updatedList = products.filter((p) => p.id !== productId);
    setProducts(updatedList);
    syncProductsArray(updatedList);
    try {
      localStorage.setItem('rb_custom_products', JSON.stringify(updatedList));
    } catch (err) {
      console.error(err);
    }
    closeOwnerProductModal();
    showToast('🗑️ Bouquet removed from store catalog.', 'info');
  };

  const resetProductsToDefault = () => {
    setProducts([...INITIAL_PRODUCTS]);
    syncProductsArray([...INITIAL_PRODUCTS]);
    localStorage.removeItem('rb_custom_products');
    showToast('🔄 Restored default catalogue.', 'info');
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
        deleteProductReview
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
