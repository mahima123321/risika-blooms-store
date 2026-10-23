import React from 'react';
import { useShop } from '../../context/ShopContext';
import { BRAND_CONFIG } from '../../config/brand';

/**
 * Ultra-Luxury Brand Logo Component for RISHIKA BLOOMS
 * Features royal embossed gold & velvet crest emblem with refined haute atelier typography.
 * Supports multiple size variants for desktop header, mobile header, footer, modals, and invoices.
 */
// Global tracking across all logo instances & re-renders
let globalLogoTapCount = 0;
let globalLogoLastTapTime = 0;
let globalLongPressTimer = null;

export default function BrandLogo({ 
  variant = 'header', // 'header' | 'mobile' | 'footer' | 'drawer' | 'modal' | 'seal-only'
  size = 'md',        // 'sm' | 'md' | 'lg' | 'xl'
  showTagline = true,
  onClick = null,
  className = ''
}) {
  const { brandConfig, language, navigateTo, openOwnerLogin, showToast } = useShop();
  const brandName = brandConfig?.name || BRAND_CONFIG.name;
  const tagline = brandConfig?.tagline || BRAND_CONFIG.tagline;

  const triggerOwnerModal = (e) => {
    if (e) {
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
    }
    if (globalLongPressTimer) {
      clearTimeout(globalLongPressTimer);
      globalLongPressTimer = null;
    }
    globalLogoTapCount = 0;
    openOwnerLogin();
    showToast('👑 Owner Studio: Enter Security PIN (risika2026)', 'info');
  };

  const startLongPress = (e) => {
    if (globalLongPressTimer) clearTimeout(globalLongPressTimer);
    globalLongPressTimer = setTimeout(() => {
      triggerOwnerModal(e);
    }, 1000);
  };

  const cancelLongPress = () => {
    if (globalLongPressTimer) {
      clearTimeout(globalLongPressTimer);
      globalLongPressTimer = null;
    }
  };

  const handleLogoTap = (e) => {
    cancelLongPress();
    const now = Date.now();
    if (now - globalLogoLastTapTime < 1800) {
      globalLogoTapCount += 1;
    } else {
      globalLogoTapCount = 1;
    }
    globalLogoLastTapTime = now;

    // Trigger on 3 or more taps (easy to do on mobile)
    if (globalLogoTapCount >= 3) {
      triggerOwnerModal(e);
      return;
    }

    // Single normal click / tap
    if (globalLogoTapCount === 1) {
      if (onClick) {
        onClick(e);
      } else {
        if (e && e.preventDefault) e.preventDefault();
        navigateTo('home');
      }
    } else {
      if (e && e.preventDefault) e.preventDefault();
    }
  };

  // Dimensions based on size prop
  const crestSizeMap = {
    sm: 32, // mobile navbar
    md: 44, // desktop header
    lg: 56, // footer & drawer
    xl: 72  // modals & about page
  };
  const crestPx = crestSizeMap[size] || 44;

  if (variant === 'seal-only') {
    return (
      <div 
        className={`luxury-brand-seal size-${size} ${className}`}
        style={{ width: `${crestPx}px`, height: `${crestPx}px` }}
        title={brandName}
        onClick={handleLogoTap}
        onMouseDown={startLongPress}
        onMouseUp={cancelLongPress}
        onMouseLeave={cancelLongPress}
        onTouchStart={startLongPress}
        onTouchEnd={cancelLongPress}
        onTouchCancel={cancelLongPress}
      >
        <img 
          src="/images/rishika_blooms_emblem.jpg" 
          alt={brandName}
          className="luxury-crest-img"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/favicon.svg';
          }}
        />
        <div className="luxury-crest-sheen" />
      </div>
    );
  }

  return (
    <a 
      href="#" 
      onClick={handleLogoTap} 
      className={`brand-logo-link luxury-brand-logo variant-${variant} size-${size} ${className}`}
      aria-label={`${brandName} - Home`}
      style={{ touchAction: 'manipulation', userSelect: 'none', WebkitUserSelect: 'none' }}
      onMouseDown={startLongPress}
      onMouseUp={cancelLongPress}
      onMouseLeave={cancelLongPress}
      onTouchStart={startLongPress}
      onTouchEnd={cancelLongPress}
      onTouchCancel={cancelLongPress}
    >
      {/* Royal 3D Embossed Medallion / Crest with Owner Secret Long-Press / Multi-Tap Trigger */}
      <div 
        className="luxury-crest-wrapper"
        style={{ width: `${crestPx}px`, height: `${crestPx}px` }}
      >
        <img 
          src="/images/rishika_blooms_emblem.jpg" 
          alt={`${brandName} Royal Insignia`}
          className="luxury-crest-img"
          loading="eager"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/favicon.svg';
          }}
        />
        <div className="luxury-crest-sheen" />
      </div>

      {/* Brand Typography */}
      <div className="brand-logo-text">
        <span className="brand-name luxury-brand-title">
          {brandName}
        </span>
        {showTagline && (
          <span className="brand-tagline luxury-brand-sub">
            {variant === 'footer' ? (
              <>
                <span className="sub-accent">HAUTE FLORAL ATELIER</span>
                <span className="sub-dot">•</span>
                <span>EST. 2024</span>
              </>
            ) : (
              tagline
            )}
          </span>
        )}
      </div>
    </a>
  );
}
