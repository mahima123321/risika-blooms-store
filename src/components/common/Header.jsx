import React, { useState, useEffect, useMemo } from 'react';
import { useShop } from '../../context/ShopContext';
import { CATEGORIES } from '../../data/categories';
import BrandLogo from './BrandLogo';
import { 
  Search, Heart, ShoppingBag, Moon, Sun, Globe, Menu, X, 
  Sparkles, ChevronDown, Clock, Shield,
  MessageCircle, Star, ArrowRight, Maximize, Minimize, MapPin,
  Smartphone, Monitor, QrCode, Truck, Crown 
} from 'lucide-react';

export default function Header() {
  const { 
    theme, toggleTheme, 
    language, toggleLanguage, t, 
    currentView, navigateTo, 
    cartCount, wishlist, 
    setIsCartOpen, setIsWishlistOpen,
    searchQuery, setSearchQuery, isSearchOpen, setIsSearchOpen,
    isOwnerAuthenticated,
    openOwnerLogin,
    openOwnerSettingsModal, brandConfig, products, categories,
    openAddProductModal, logoutOwner,
    isMobileFrame, toggleMobileFrame,
    openQrModal
  } = useShop();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mobile Menu Drawer Class Management
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('drawer-open');
    } else {
      document.body.classList.remove('drawer-open');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.body.classList.remove('drawer-open');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Monitor fullscreen state
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        const el = document.documentElement;
        if (el.requestFullscreen) {
          el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          el.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  // Countdown timer to 7:00 PM same day delivery cutoff
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(19, 0, 0, 0); // 7:00 PM

      if (now > cutoff) {
        cutoff.setDate(cutoff.getDate() + 1);
      }

      const diff = cutoff - now;
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Real-time Live Search Autocomplete Results
  const liveResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return (products || []).filter((p) => {
      const matchName = p.name?.toLowerCase().includes(q) || (p.nameHindi && p.nameHindi.includes(q));
      const matchCategory = p.categoryName?.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchFlower = (p.flowerTypes || []).some((f) => f.toLowerCase().includes(q));
      return matchName || matchCategory || matchDesc || matchFlower;
    }).slice(0, 5);
  }, [searchQuery, products]);

  const handleNavClick = (page, params = {}) => {
    navigateTo(page, params);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* 1. Announcement Bar (Desktop Only - Mobile starts cleanly with Logo Header) */}
      <div className="announcement-bar desktop-only">
        <div className="container announcement-content">
          <span>{t('announcement')}</span>
          <span className="announcement-timer desktop-only">
            <Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />
            Same-Day Dispatch Cutoff: {timeLeft}
          </span>
        </div>
      </div>

      {/* 2. Main Site Header */}
      <header className="site-header">
        <div className="container header-container">
          {/* Mobile Menu Trigger */}
          <button 
            className="action-icon-btn mobile-only" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            title="Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Brand Logo & Royal Crest */}
          <BrandLogo 
            variant="header" 
            size="md" 
            onClick={(e) => { e.preventDefault(); handleNavClick('home'); }} 
          />


          {/* Desktop Navigation */}
          <nav className="nav-menu">
            <div className="nav-item">
              <span 
                className={`nav-link ${currentView.page === 'home' ? 'active' : ''}`}
                onClick={() => handleNavClick('home')}
              >
                {t('home')}
              </span>
            </div>

            <div className="nav-item">
              <span 
                className={`nav-link ${currentView.page === 'shop' ? 'active' : ''}`}
                onClick={() => handleNavClick('shop')}
              >
                {t('shop')}
              </span>
            </div>

            {/* Categories Dropdown */}
            <div className="nav-item">
              <span className={`nav-link ${currentView.page === 'category' ? 'active' : ''}`}>
                {t('allCategories')} <ChevronDown size={14} />
              </span>
              <div className="mega-menu-dropdown">
                {(categories || CATEGORIES).map((cat) => (
                  <div 
                    key={cat.id} 
                    className="mega-menu-item"
                    onClick={() => handleNavClick('category', { categorySlug: cat.slug })}
                  >
                    <img src={cat.image} alt={cat.name} className="mega-menu-thumb" />
                    <div className="mega-menu-info">
                      <h4>{cat.name}</h4>
                      <span>{cat.itemCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="nav-item">
              <span 
                className={`nav-link ${currentView.page === 'build-bouquet' ? 'active' : ''}`}
                onClick={() => handleNavClick('build-bouquet')}
              >
                <Sparkles size={14} style={{ color: 'var(--text-gold)' }} />
                {t('buildBouquet')}
              </span>
            </div>

            <div className="nav-item">
              <span 
                className={`nav-link ${currentView.page === 'gift-combos' ? 'active' : ''}`}
                onClick={() => handleNavClick('gift-combos')}
              >
                {t('giftCombos')}
              </span>
            </div>

            <div className="nav-item">
              <span 
                className={`nav-link ${currentView.page === 'surprise-finder' ? 'active' : ''}`}
                onClick={() => handleNavClick('surprise-finder')}
              >
                {t('surpriseFinder')}
              </span>
            </div>

            <div className="nav-item">
              <span 
                className={`nav-link ${currentView.page === 'about' ? 'active' : ''}`}
                onClick={() => handleNavClick('about')}
              >
                {t('about')}
              </span>
            </div>
          </nav>

          {/* Header Action Buttons (Ultra-Clean on Mobile: only Search & Cart) */}
          <div className="header-actions">
            {/* Search Trigger */}
            <button 
              className="action-icon-btn" 
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
              title="Search flowers & gifts"
            >
              <Search size={18} />
            </button>

            {/* Fullscreen Mobile App Mode Trigger - Desktop Only */}
            <button 
              className="action-icon-btn fullscreen-toggle-btn desktop-only" 
              onClick={toggleFullscreen}
              aria-label="Toggle Fullscreen App View"
              title={isFullscreen ? 'Exit Fullscreen' : 'Full Screen App Mode'}
            >
              {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
            </button>

            {/* Mobile App Phone Frame Width Switcher - Desktop Only */}
            <button 
              className="action-icon-btn mobile-frame-toggle-btn desktop-only" 
              onClick={toggleMobileFrame}
              aria-label="Toggle Mobile Frame View"
              title={isMobileFrame ? 'Expand to Full Desktop' : 'Switch to Mobile App View'}
              style={{ position: 'relative' }}
            >
              {isMobileFrame ? (
                <Smartphone size={17} style={{ color: 'var(--color-gold)' }} />
              ) : (
                <Monitor size={17} />
              )}
            </button>

            {/* QR Code & Scanner Hub Trigger */}
            <button 
              className="action-icon-btn qr-header-btn"
              onClick={() => openQrModal()}
              title="QR Code & Scanner Hub (Store Link & UPI Pay)"
              aria-label="QR Code & Scanner"
            >
              <QrCode size={18} />
            </button>

            {/* Language Switcher */}
            <button 
              className="action-icon-btn language-toggle-btn"
              onClick={toggleLanguage}
              title={`Language: ${language === 'hi' ? 'हिंदी' : 'English'}. Click to switch.`}
              aria-label="Toggle Language"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700, padding: '0 6px' }}
            >
              <Globe size={16} />
              <span>{language === 'hi' ? 'हिन्दी' : 'EN'}</span>
            </button>

            {/* Theme Switcher - Desktop Only */}
            <button 
              className="action-icon-btn desktop-only"
              onClick={toggleTheme}
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Track Orders Trigger */}
            <button 
              className="action-icon-btn desktop-only"
              onClick={() => handleNavClick('my-orders')}
              title="My Orders & Tracking"
              aria-label="Track My Orders"
            >
              <Truck size={18} />
            </button>

            {/* Wishlist Trigger */}
            <button 
              className="action-icon-btn"
              onClick={() => setIsWishlistOpen(true)}
              title="My Wishlist"
              aria-label="Wishlist"
            >
              <Heart size={18} />
              {wishlist.length > 0 && (
                <span className="action-badge">{wishlist.length}</span>
              )}
            </button>

            {/* Shopping Cart Trigger */}
            <button 
              className="action-icon-btn cart-header-btn"
              onClick={() => handleNavClick('cart')}
              title="Shopping Bag"
              aria-label="Shopping Bag"
              style={{ position: 'relative' }}
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="action-badge" style={{ backgroundColor: 'var(--color-rose-crimson, #E11D48)', color: '#FFFFFF' }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Store Owner Quick Portal Trigger - Mobile & Desktop */}
            <button 
              type="button" 
              id="owner-active-btn"
              className={`action-icon-btn owner-crown-btn ${isOwnerAuthenticated ? 'owner-active' : ''}`}
              onClick={() => {
                if (isOwnerAuthenticated) {
                  openOwnerSettingsModal('numbers');
                } else {
                  openOwnerLogin();
                }
              }}
              title={isOwnerAuthenticated ? "👑 Store Owner Mode Active: Tap for Settings & Dispatch" : "👑 Store Owner Hub Login"}
              aria-label="Owner Studio"
              style={{
                border: isOwnerAuthenticated ? '1.5px solid #D4AF37' : '1px solid var(--border-subtle)',
                background: isOwnerAuthenticated ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                color: '#D4AF37',
                position: 'relative'
              }}
            >
              <Crown size={18} color="#D4AF37" />
              {isOwnerAuthenticated && <span className="owner-crown-pulse-dot" />}
            </button>
          </div>
        </div>

        {/* Meesho / Flipkart Signature Mobile Search & Location Strip (Hidden on product detail page for maximum visible screen) */}
        {currentView.page !== 'product' && (
          <>
            <div className="mobile-app-search-row mobile-only">
              <div 
                className="mobile-search-pill" 
                onClick={() => setIsSearchOpen(true)}
                role="button"
                tabIndex={0}
              >
                <Search size={15} className="search-pill-icon" />
                <span className="search-pill-text">
                  Search for 'Velvet bouquets, roses, gifts'...
                </span>
                <div className="search-pill-sparkle">
                  <Sparkles size={13} color="var(--color-gold)" />
                </div>
              </div>
            </div>

            {/* Flipkart / Meesho Express Delivery Location Bar */}
            <div className="mobile-delivery-address-strip mobile-only" onClick={() => navigateTo('delivery-info')}>
              <div className="delivery-strip-left">
                <MapPin size={13} className="delivery-pin-icon" />
                <span className="delivery-strip-text">
                  Deliver to <strong>Delhi NCR 110070</strong>
                </span>
              </div>
              <span className="delivery-strip-badge">⚡ 2hr Express</span>
            </div>
          </>
        )}
      </header>

      {/* 3. Search Modal */}
      {isSearchOpen && (
        <div className="drawer-backdrop open" onClick={() => setIsSearchOpen(false)}>
          <div 
            className="search-modal-box glass-panel" 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 className="font-serif-editorial" style={{ fontSize: '1.4rem' }}>
                Search {brandConfig?.name || 'RISHIKA BLOOMS'}
              </h3>
              <button 
                className="drawer-close-btn" 
                onClick={() => setIsSearchOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                autoFocus
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem 1rem 3rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid var(--border-gold)',
                  background: 'var(--bg-alt)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    setIsSearchOpen(false);
                    navigateTo('shop');
                  }
                }}
              />
              <Search size={20} style={{ position: 'absolute', left: '1.2rem', top: '1.1rem', color: 'var(--text-gold)' }} />
            </div>

            {/* Live Real-time Search Results */}
            {searchQuery.trim().length > 0 && (
              <div className="search-live-results" style={{ marginBottom: '1.5rem', maxHeight: '320px', overflowY: 'auto' }}>
                {liveResults.length > 0 ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-gold)' }}>
                        Found {liveResults.length} matching creations:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSearchOpen(false);
                          navigateTo('shop');
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-accent)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        View all in Shop <ArrowRight size={13} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {liveResults.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setIsSearchOpen(false);
                            navigateTo('product', { productSlug: item.slug });
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '0.65rem 0.85rem',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-alt)',
                            cursor: 'pointer',
                            border: '1px solid var(--border-light)',
                            transition: 'all var(--transition-fast)'
                          }}
                          className="search-live-row"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-gold)', fontWeight: 600, textTransform: 'uppercase' }}>
                              {item.categoryName}
                            </span>
                            <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.name}
                            </h4>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
                              ₹{item.price}
                            </span>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '0.75rem', color: '#F59E0B' }}>
                              <Star size={11} fill="#F59E0B" /> {item.rating}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    No exact match found for "<strong>{searchQuery}</strong>". Try popular collections below:
                  </div>
                )}
              </div>
            )}

            {/* Popular Search Suggestions */}
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-gold)', marginRight: '0.5rem' }}>Popular Searches:</span>
              {['Velvet Tulip', 'Birthday', 'Red Roses', 'Korean Wrap', 'Lavender', 'Teddy Combo', 'Midnight Delivery'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setSearchQuery(term);
                    setIsSearchOpen(false);
                    navigateTo('shop');
                  }}
                  style={{
                    background: 'var(--bg-accent-soft)',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    margin: '0.2rem',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Mobile Slide-Out Navigation Drawer */}
      {isMobileMenuOpen && (
        <div 
          className="drawer-backdrop open mobile-drawer-backdrop" 
          onClick={() => setIsMobileMenuOpen(false)}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) {
              e.preventDefault();
            }
          }}
        >
          <div 
            className="mobile-nav-drawer glass-panel" 
            onClick={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="mobile-drawer-header">
              <BrandLogo 
                variant="drawer" 
                size="sm" 
                onClick={(e) => { e.preventDefault(); handleNavClick('home'); }} 
              />
              <button 
                type="button" 
                className="drawer-close-btn" 
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mobile-drawer-content">
              {/* Main Navigation Links */}
              <div className="mobile-nav-group">
                <button 
                  type="button" 
                  className={`mobile-drawer-link ${currentView.page === 'home' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('home')}
                >
                  🌸 Home
                </button>
                <button 
                  type="button" 
                  className={`mobile-drawer-link ${currentView.page === 'shop' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('shop')}
                >
                  💐 All Bouquets & Gifts
                </button>
                <button 
                  type="button" 
                  className={`mobile-drawer-link mobile-drawer-link-highlight ${currentView.page === 'build-bouquet' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('build-bouquet')}
                >
                  ✨ Build Your Own Bouquet
                </button>
                <button 
                  type="button" 
                  className={`mobile-drawer-link ${currentView.page === 'gift-combos' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('gift-combos')}
                >
                  🎁 Luxury Gift Combos
                </button>
                <button 
                  type="button" 
                  className={`mobile-drawer-link ${currentView.page === 'surprise-finder' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('surprise-finder')}
                >
                  🎯 Surprise Gift Finder
                </button>
              </div>

              {/* Categories Grid */}
              <div className="mobile-nav-categories">
                <span className="mobile-nav-section-title">
                  Shop by Category
                </span>
                <div className="mobile-category-chips">
                  {(categories || CATEGORIES).map((cat) => (
                    <button 
                      key={cat.id} 
                      type="button"
                      className="mobile-cat-chip"
                      onClick={() => handleNavClick('category', { categorySlug: cat.slug })}
                    >
                      <img src={cat.image} alt={cat.name} className="mobile-cat-chip-img" />
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Support & Policies */}
              <div className="mobile-nav-group">
                <span className="mobile-nav-section-title">
                  Help & Delivery
                </span>
                <button type="button" className="mobile-drawer-link-subtle" onClick={() => handleNavClick('delivery-info')}>
                  🚚 Same-Day & Midnight Delivery Info
                </button>
                <button type="button" className="mobile-drawer-link-subtle" onClick={() => handleNavClick('about')}>
                  📖 Our Story & Craftsmanship
                </button>
                <button type="button" className="mobile-drawer-link-subtle" onClick={() => handleNavClick('contact')}>
                  📞 Contact Customer Concierge
                </button>
              </div>

              

              {/* Quick Utility Controls inside Drawer */}
              <div className="mobile-drawer-toggles">
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm" 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openQrModal();
                  }} 
                  style={{ flex: 1 }}
                >
                  <QrCode size={14} />
                  <span>QR Code & Scanner</span>
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={toggleTheme} style={{ flex: 1 }}>
                  {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                  <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
              </div>

              {/* Store Owner Studio Panel - When Authenticated on Mobile */}
              {isOwnerAuthenticated ? (
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(212, 175, 55, 0.08)',
                  border: '1.5px solid rgba(212, 175, 55, 0.3)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Crown size={16} color="#D4AF37" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Store Owner Hub
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>● Active</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.45rem' }}>
                    <button
                      type="button"
                      className="btn btn-gold btn-sm"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigateTo('my-orders', { mode: 'owner' });
                      }}
                      style={{ justifyContent: 'center', fontSize: '0.84rem', fontWeight: 800, background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)', color: '#000000' }}
                    >
                      <Truck size={15} style={{ marginRight: '6px' }} />
                      <span>🚚 Delivery Schedule & Orders</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openAddProductModal();
                      }}
                      style={{ justifyContent: 'center', fontSize: '0.82rem', background: 'var(--bg-surface)' }}
                    >
                      <span>+ Add New Bouquet</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openOwnerSettingsModal('categories');
                      }}
                      style={{ justifyContent: 'center', fontSize: '0.8rem', background: 'var(--bg-surface)' }}
                    >
                      <span>📁 Manage Categories</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openOwnerSettingsModal('catalog');
                      }}
                      style={{ justifyContent: 'center', fontSize: '0.8rem', background: 'var(--bg-surface)' }}
                    >
                      <span>💐 Bouquet Catalog ({products?.length || 0})</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openOwnerSettingsModal('payment');
                      }}
                      style={{ justifyContent: 'center', fontSize: '0.8rem', background: 'var(--bg-surface)' }}
                    >
                      <span>💳 Payment QR & Scanner Settings</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openOwnerSettingsModal('numbers');
                      }}
                      style={{ justifyContent: 'center', fontSize: '0.8rem', background: 'var(--bg-surface)' }}
                    >
                      <span>⚙️ Boutique & WhatsApp Settings</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logoutOwner();
                      }}
                      style={{ justifyContent: 'center', fontSize: '0.78rem', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                    >
                      <span>Exit Owner Mode</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(212, 175, 55, 0.08)',
                  border: '1.5px dashed rgba(212, 175, 55, 0.4)',
                  textAlign: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '0.35rem' }}>
                    <Crown size={16} color="#D4AF37" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Store Owner & Dispatch Hub
                    </span>
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.35 }}>
                    Are you the store owner? Enter your PIN to view delivery schedules, incoming orders & customer contacts on this phone.
                  </p>
                  <button
                    type="button"
                    className="btn btn-gold btn-sm"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openOwnerLogin();
                    }}
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 800 }}
                  >
                    👑 Store Owner Login (PIN: risika2026)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
