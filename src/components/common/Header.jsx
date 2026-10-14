import React, { useState, useEffect, useMemo } from 'react';
import { useShop } from '../../context/ShopContext';
import { CATEGORIES } from '../../data/categories';
import { BRAND_CONFIG } from '../../config/brand';
import { 
  Search, Heart, ShoppingBag, Moon, Sun, Globe, Menu, X, 
  Sparkles, ChevronDown, Clock, ShieldCheck, PhoneCall, Shield,
  MessageCircle, Star, ArrowRight 
} from 'lucide-react';

export default function Header() {
  const { 
    theme, toggleTheme, 
    language, toggleLanguage, t, 
    currentView, navigateTo, 
    cartCount, wishlist, 
    setIsCartOpen, setIsWishlistOpen,
    searchQuery, setSearchQuery, isSearchOpen, setIsSearchOpen,
    isOwnerAuthenticated, openOwnerLogin, openAddProductModal,
    openOwnerSettingsModal, brandConfig, products
  } = useShop();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

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
      {/* 1. Announcement Bar */}
      <div className="announcement-bar">
        <div className="container announcement-content">
          <span>{t('announcement')}</span>
          <span className="announcement-timer">
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

          {/* Brand Logo & Crest */}
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); handleNavClick('home'); }} 
            className="brand-logo-link"
          >
            <svg className="brand-logo-crest" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="crestGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F9D423" />
                  <stop offset="50%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#AA771C" />
                </linearGradient>
                <linearGradient id="crestRose" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF9A9E" />
                  <stop offset="50%" stopColor="#E892A2" />
                  <stop offset="100%" stopColor="#8B263E" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="46" fill="#1A0A10" stroke="url(#crestGold)" strokeWidth="2.5" />
              <path d="M50 20 C58 35 62 42 50 60 C38 42 42 35 50 20 Z" fill="url(#crestRose)" opacity="0.9" />
              <path d="M50 20 C65 28 72 38 50 60 C38 42 42 35 50 20 Z" fill="url(#crestRose)" opacity="0.75" transform="rotate(60 50 50)" />
              <path d="M50 20 C65 28 72 38 50 60 C38 42 42 35 50 20 Z" fill="url(#crestRose)" opacity="0.75" transform="rotate(120 50 50)" />
              <path d="M50 20 C65 28 72 38 50 60 C38 42 42 35 50 20 Z" fill="url(#crestRose)" opacity="0.75" transform="rotate(180 50 50)" />
              <path d="M50 20 C65 28 72 38 50 60 C38 42 42 35 50 20 Z" fill="url(#crestRose)" opacity="0.75" transform="rotate(240 50 50)" />
              <path d="M50 20 C65 28 72 38 50 60 C38 42 42 35 50 20 Z" fill="url(#crestRose)" opacity="0.75" transform="rotate(300 50 50)" />
              <circle cx="50" cy="50" r="14" fill="#1A0A10" stroke="url(#crestGold)" strokeWidth="1.5" />
              <text x="50" y="55" fontFamily="'Cinzel', serif" fontSize="13" fontWeight="bold" fill="url(#crestGold)" textAnchor="middle" letterSpacing="1">RB</text>
            </svg>
            <div className="brand-logo-text">
              <span className="brand-name">{brandConfig?.name || BRAND_CONFIG.name}</span>
              <span className="brand-tagline">
                {language === 'hi' ? (brandConfig?.taglineHindi || BRAND_CONFIG.taglineHindi) : (brandConfig?.tagline || BRAND_CONFIG.tagline)}
              </span>
            </div>
          </a>

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
                {CATEGORIES.map((cat) => (
                  <div 
                    key={cat.id} 
                    className="mega-menu-item"
                    onClick={() => handleNavClick('category', { categorySlug: cat.slug })}
                  >
                    <img src={cat.image} alt={cat.name} className="mega-menu-thumb" />
                    <div className="mega-menu-info">
                      <h4>{language === 'hi' ? cat.nameHindi : cat.name}</h4>
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

          {/* Header Action Buttons */}
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

            {/* Language Switcher */}
            <button 
              className="lang-theme-pill"
              onClick={toggleLanguage}
              title="Change Language"
            >
              <Globe size={14} />
              <span>{language === 'en' ? 'हिन्दी' : 'ENG'}</span>
            </button>

            {/* Theme Switcher */}
            <button 
              className="action-icon-btn"
              onClick={toggleTheme}
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
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

            {/* Cart Trigger */}
            <button 
              className="action-icon-btn"
              onClick={() => setIsCartOpen(true)}
              title="Shopping Bag"
              aria-label="Cart"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="action-badge">{cartCount}</span>
              )}
            </button>

            {/* Store Owner Quick Portal Trigger */}
            {isOwnerAuthenticated ? (
              <button 
                type="button"
                id="owner-active-btn"
                className="action-icon-btn owner-crown-btn"
                onClick={() => openOwnerSettingsModal('numbers')}
                title="👑 Owner Mode Active: Click to Change WhatsApp Number, Prices & Settings"
                aria-label="Owner Studio"
              >
                <Shield size={18} color="#D4AF37" />
                <span className="owner-crown-pulse-dot" />
              </button>
            ) : (
              <button 
                type="button"
                id="owner-login-btn"
                className="action-icon-btn discreet-owner-login-btn"
                onClick={openOwnerLogin}
                title="Store Owner Login (केवल ओनर के लिए)"
                aria-label="Owner Login"
              >
                <Shield size={17} style={{ opacity: 0.6 }} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3. Search Modal */}
      {isSearchOpen && (
        <div className="drawer-backdrop open" onClick={() => setIsSearchOpen(false)}>
          <div 
            className="search-modal-box glass-panel" 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '650px',
              width: '90%',
              margin: '100px auto 0 auto',
              padding: '2rem',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--bg-surface)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 className="font-serif-editorial" style={{ fontSize: '1.4rem' }}>
                Search ROSHIKA BLOOMS
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
                              {language === 'hi' ? (item.nameHindi || item.name) : item.name}
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
        <div className="drawer-backdrop open mobile-drawer-backdrop" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-nav-drawer glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div className="brand-logo-text">
                <span className="brand-name">{brandConfig?.name || BRAND_CONFIG.name}</span>
                <span className="brand-tagline">Floral Atelier & Studio</span>
              </div>
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
                  🌸 Home (होम)
                </button>
                <button 
                  type="button" 
                  className={`mobile-drawer-link ${currentView.page === 'shop' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('shop')}
                >
                  💐 All Bouquets & Gifts (सभी बुके)
                </button>
                <button 
                  type="button" 
                  className={`mobile-drawer-link mobile-drawer-link-highlight ${currentView.page === 'build-bouquet' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('build-bouquet')}
                >
                  ✨ Build Your Own Bouquet (कस्टम बुके बनाएं)
                </button>
                <button 
                  type="button" 
                  className={`mobile-drawer-link ${currentView.page === 'gift-combos' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('gift-combos')}
                >
                  🎁 Luxury Gift Combos (टेडी व गिफ्ट कॉम्बो)
                </button>
                <button 
                  type="button" 
                  className={`mobile-drawer-link ${currentView.page === 'surprise-finder' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('surprise-finder')}
                >
                  🎯 Surprise Gift Finder (गिफ्ट फाइंडर)
                </button>
              </div>

              {/* Categories Grid */}
              <div className="mobile-nav-categories">
                <span className="mobile-nav-section-title">Shop by Category / कैटेगरीज</span>
                <div className="mobile-category-chips">
                  {CATEGORIES.map((cat) => (
                    <button 
                      key={cat.id} 
                      type="button"
                      className="mobile-cat-chip"
                      onClick={() => handleNavClick('category', { categorySlug: cat.slug })}
                    >
                      <img src={cat.image} alt={cat.name} className="mobile-cat-chip-img" />
                      <span>{language === 'hi' ? cat.nameHindi : cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Support & Policies */}
              <div className="mobile-nav-group">
                <span className="mobile-nav-section-title">Help & Delivery</span>
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

              {/* WhatsApp Quick Order */}
              <a 
                href={`https://wa.me/${brandConfig?.whatsappNumber || '919876543210'}?text=${encodeURIComponent('Hello RISIKA BLOOMS! I would like to order a handcrafted luxury bouquet.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-md mobile-drawer-wa"
              >
                <MessageCircle size={16} />
                <span>WhatsApp Concierge ({brandConfig?.whatsappNumber || '+91 98765 43210'})</span>
              </a>

              {/* Language & Theme Controls inside Drawer */}
              <div className="mobile-drawer-toggles">
                <button type="button" className="btn btn-outline btn-sm" onClick={toggleLanguage} style={{ flex: 1 }}>
                  <Globe size={14} />
                  <span>{language === 'en' ? 'हिन्दी में देखें' : 'English View'}</span>
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={toggleTheme} style={{ flex: 1 }}>
                  {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                  <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
              </div>

              {/* Store Owner Studio Link */}
              <div className="mobile-drawer-owner">
                <button 
                  type="button" 
                  className="owner-mobile-link"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (isOwnerAuthenticated) {
                      openOwnerSettingsModal('numbers');
                    } else {
                      openOwnerLogin();
                    }
                  }}
                >
                  <Shield size={14} color="#D4AF37" />
                  <span>{isOwnerAuthenticated ? '👑 Store Owner Studio (ओनर सेटिंग्स)' : 'Store Owner Login (केवल ओनर के लिए)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
