import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useShop } from '../context/ShopContext';
import { PRODUCTS, LUXURY_ADDONS } from '../data/products';
import ProductCard from '../components/common/ProductCard';
import ProductReviewsSection from '../components/reviews/ProductReviewsSection';
import WriteReviewModal from '../components/reviews/WriteReviewModal';
import { 
  Heart, Star, Sparkles, 
  Truck, Clock, ShieldCheck, CheckCircle2, ChevronRight, ChevronLeft,
  ArrowLeft, Plus, Minus, Send, Share2, Edit3, Trash2,
  Maximize2, X, ZoomIn, ZoomOut, RotateCcw, Camera, QrCode, ShoppingBag, Zap 
} from 'lucide-react';

export default function ProductDetailPage() {
  const { 
    currentView, language, t, 
    isInWishlist, toggleWishlist, 
    navigateTo, addRecentlyViewed, showToast, 
    products, isOwnerAuthenticated, openEditProductModal,
    deleteOwnerProduct, openQrModal,
    brandConfig, addToCart, setIsCartOpen
  } = useShop();

  const slug = currentView.params?.productSlug;
  const allProducts = products || PRODUCTS;
  const product = allProducts.find((p) => p.slug === slug) || allProducts[0];

  // Track product in recently viewed
  useEffect(() => {
    if (product) addRecentlyViewed(product);
  }, [product]);

  // Selected Customization Options
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [selectedWrap, setSelectedWrap] = useState(product.wrapOptions?.[0] || 'Korean Frosted');
  const [selectedRibbon, setSelectedRibbon] = useState(product.ribbonOptions?.[0] || 'Gold Satin');
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [giftMessage, setGiftMessage] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('Standard Delivery (1 PM - 5 PM)');

  // PIN code checker state
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);

  // Active Tab (Flipkart style: Specs & Highlights first)
  const [activeTab, setActiveTab] = useState('specs');
  const [isWriteReviewModalOpen, setIsWriteReviewModalOpen] = useState(false);

  // Lightbox & High-Definition Zoom Studio State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [showZoomHint, setShowZoomHint] = useState(true);

  // Desktop In-Page Hover Magnifier Zoom
  const [isDesktopHoverZoom, setIsDesktopHoverZoom] = useState(false);
  const [hoverZoomCoords, setHoverZoomCoords] = useState({ x: 50, y: 50 });

  // Lightbox Gesture Refs
  const stageRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const lastTapRef = useRef(0);
  const pinchStartDistRef = useRef(0);
  const pinchStartScaleRef = useRef(1);

  // Main Gallery Touch Refs (reliable tap vs swipe differentiation)
  const mainTouchStartRef = useRef({ x: 0, y: 0, time: 0 });

  // Flipkart / Myntra Unique Image Gallery Collection
  const galleryImages = [
    ...(product.images && product.images.length > 0 ? product.images : [product.image]),
    ...(product.colorOptions ? product.colorOptions.map(c => c.image).filter(Boolean) : [])
  ].filter((v, i, a) => a.indexOf(v) === i);

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Reset zoom & states when product changes
  useEffect(() => {
    setActiveImgIndex(0);
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
  }, [product?.id]);

  // Zoom control helpers
  const handleZoomIn = useCallback((e) => {
    e?.stopPropagation();
    setZoomScale(prev => Math.min(4, Number((prev + 0.6).toFixed(2))));
    setShowZoomHint(false);
  }, []);

  const handleZoomOut = useCallback((e) => {
    e?.stopPropagation();
    setZoomScale(prev => {
      const next = Math.max(1, Number((prev - 0.6).toFixed(2)));
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
    setShowZoomHint(false);
  }, []);

  const handleResetZoom = useCallback((e) => {
    e?.stopPropagation();
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
    setShowZoomHint(false);
  }, []);

  const toggleZoomAtPoint = useCallback((clientX, clientY, containerRect) => {
    if (zoomScale > 1.2) {
      setZoomScale(1);
      setPanPosition({ x: 0, y: 0 });
    } else {
      const targetScale = 2.5;
      if (containerRect) {
        const originX = clientX - containerRect.left - containerRect.width / 2;
        const originY = clientY - containerRect.top - containerRect.height / 2;
        setPanPosition({
          x: Math.max(-160, Math.min(160, -originX * 0.9)),
          y: Math.max(-160, Math.min(160, -originY * 0.9))
        });
      }
      setZoomScale(targetScale);
      setShowZoomHint(false);
    }
  }, [zoomScale]);

  const handleNextImage = useCallback(() => {
    if (activeImgIndex < galleryImages.length - 1) {
      setActiveImgIndex(prev => prev + 1);
      setZoomScale(1);
      setPanPosition({ x: 0, y: 0 });
    }
  }, [activeImgIndex, galleryImages.length]);

  const handlePrevImage = useCallback(() => {
    if (activeImgIndex > 0) {
      setActiveImgIndex(prev => prev - 1);
      setZoomScale(1);
      setPanPosition({ x: 0, y: 0 });
    }
  }, [activeImgIndex]);

  // Lock body scroll, prevent overscroll, and bind keyboard shortcuts when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.classList.add('modal-locked');
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setIsLightboxOpen(false);
          setZoomScale(1);
          setPanPosition({ x: 0, y: 0 });
        } else if (e.key === 'ArrowRight') {
          handleNextImage();
        } else if (e.key === 'ArrowLeft') {
          handlePrevImage();
        } else if (e.key === '+' || e.key === '=') {
          handleZoomIn();
        } else if (e.key === '-') {
          handleZoomOut();
        } else if (e.key === '0' || e.key === 'r' || e.key === 'R') {
          handleResetZoom();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.classList.remove('modal-locked');
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.classList.remove('modal-locked');
      document.body.style.overflow = '';
    }
  }, [isLightboxOpen, handleNextImage, handlePrevImage, handleZoomIn, handleZoomOut, handleResetZoom]);

  // Non-passive wheel zoom listener on Lightbox Canvas for smooth desktop scroll zooming
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !isLightboxOpen) return;

    const onWheel = (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        setZoomScale(prev => Math.min(4, Number((prev + 0.35).toFixed(2))));
      } else {
        setZoomScale(prev => {
          const next = Math.max(1, Number((prev - 0.35).toFixed(2)));
          if (next === 1) setPanPosition({ x: 0, y: 0 });
          return next;
        });
      }
      setShowZoomHint(false);
    };

    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [isLightboxOpen]);

  // Desktop In-Page Hover Magnifier Zoom Handlers
  const handleMainImgMouseMove = (e) => {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      setHoverZoomCoords({ x, y });
      setIsDesktopHoverZoom(true);
    }
  };

  const handleMainImgMouseLeave = () => {
    setIsDesktopHoverZoom(false);
  };

  // Main Gallery Touch Handlers (Strictly differentiates tap from swipe)
  const handleMainTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    mainTouchStartRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now()
    };
  };

  const handleMainTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleMainTouchEnd = (e) => {
    const start = mainTouchStartRef.current;
    const endX = e.changedTouches?.[0]?.clientX || touchEnd;
    const endY = e.changedTouches?.[0]?.clientY || 0;
    const duration = Date.now() - start.time;

    if (start.x && endX) {
      const distanceX = start.x - endX;
      const distanceY = Math.abs((start.y || 0) - endY);

      // Clean tap on photo -> Open Fullscreen Zoom Studio
      if (Math.abs(distanceX) < 14 && distanceY < 14 && duration < 320) {
        setIsLightboxOpen(true);
        return;
      }

      // Horizontal swipe gesture -> Next / Previous photo
      if (distanceX > 40 && activeImgIndex < galleryImages.length - 1) {
        setActiveImgIndex(prev => prev + 1);
      } else if (distanceX < -40 && activeImgIndex > 0) {
        setActiveImgIndex(prev => prev - 1);
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Lightbox Touch Gestures (Pinch to zoom, Double tap, Pan when zoomed, Swipe when 1x)
  const handleLightboxTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartDistRef.current = dist;
      pinchStartScaleRef.current = zoomScale;
      setIsPinching(true);
      setShowZoomHint(false);
    } else if (e.touches.length === 1) {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;

      if (timeSinceLastTap < 320) {
        // Double tap -> Zoom toggle at point!
        const rect = e.currentTarget.getBoundingClientRect();
        toggleZoomAtPoint(e.touches[0].clientX, e.touches[0].clientY, rect);
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      panStartRef.current = { ...panPosition };
      setIsDraggingImage(true);
    }
  };

  const handleLightboxTouchMove = (e) => {
    if (e.touches.length === 2 && pinchStartDistRef.current > 0) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / pinchStartDistRef.current;
      const newScale = Math.min(4, Math.max(1, Number((pinchStartScaleRef.current * ratio).toFixed(2))));
      setZoomScale(newScale);
      if (newScale === 1) {
        setPanPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && isDraggingImage) {
      const deltaX = e.touches[0].clientX - dragStartRef.current.x;
      const deltaY = e.touches[0].clientY - dragStartRef.current.y;

      if (zoomScale > 1) {
        const maxPanX = Math.max(60, (window.innerWidth * (zoomScale - 1)) / 1.5);
        const maxPanY = Math.max(60, (window.innerHeight * (zoomScale - 1)) / 1.5);
        const newX = Math.max(-maxPanX, Math.min(maxPanX, panStartRef.current.x + deltaX));
        const newY = Math.max(-maxPanY, Math.min(maxPanY, panStartRef.current.y + deltaY));
        setPanPosition({ x: newX, y: newY });
      }
    }
  };

  const handleLightboxTouchEnd = (e) => {
    if (pinchStartDistRef.current > 0) {
      pinchStartDistRef.current = 0;
      setIsPinching(false);
      if (zoomScale < 1.05) {
        setZoomScale(1);
        setPanPosition({ x: 0, y: 0 });
      }
    }

    if (zoomScale <= 1.05 && isDraggingImage && e.changedTouches && e.changedTouches[0]) {
      const deltaX = e.changedTouches[0].clientX - dragStartRef.current.x;
      const deltaY = Math.abs(e.changedTouches[0].clientY - dragStartRef.current.y);
      if (Math.abs(deltaX) > 45 && deltaY < 80) {
        if (deltaX < 0) {
          handleNextImage();
        } else {
          handlePrevImage();
        }
      }
    }

    setIsDraggingImage(false);
  };

  // Desktop Mouse Drag in Lightbox
  const handleLightboxMouseDown = (e) => {
    if (e.button !== 0) return;
    if (zoomScale > 1) {
      setIsDraggingImage(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      panStartRef.current = { ...panPosition };
    }
  };

  const handleLightboxMouseMove = (e) => {
    if (isDraggingImage && zoomScale > 1) {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      const maxPanX = Math.max(80, (window.innerWidth * (zoomScale - 1)) / 1.5);
      const maxPanY = Math.max(80, (window.innerHeight * (zoomScale - 1)) / 1.5);
      setPanPosition({
        x: Math.max(-maxPanX, Math.min(maxPanX, panStartRef.current.x + deltaX)),
        y: Math.max(-maxPanY, Math.min(maxPanY, panStartRef.current.y + deltaY))
      });
    }
  };

  const handleLightboxMouseUp = () => {
    setIsDraggingImage(false);
  };

  const handleColorSelect = (idx) => {
    setSelectedColorIdx(idx);
    const colorImg = product.colorOptions?.[idx]?.image;
    if (colorImg) {
      const foundIdx = galleryImages.indexOf(colorImg);
      if (foundIdx !== -1) {
        setActiveImgIndex(foundIdx);
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on Rishika Blooms!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!');
    }
  };

  // Dynamic Image & Price calculations
  const activeColor = product.colorOptions?.[selectedColorIdx] || null;
  const currentDisplayImage = galleryImages[activeImgIndex] || activeColor?.image || product.image;
  const activeImage = currentDisplayImage;

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  const sizeOffset = product.sizeOptions?.[selectedSizeIdx]?.priceOffset || 0;
  const baseUnitPrice = product.price + sizeOffset;
  const addonsTotal = selectedAddons.reduce((acc, curr) => acc + curr.price, 0);
  const finalUnitPrice = baseUnitPrice;
  const grandTotalPrice = (finalUnitPrice * quantity) + addonsTotal;

  const handleAddToCart = () => {
    addToCart(product, {
      quantity,
      selectedColor: product.colorOptions?.[selectedColorIdx]?.name,
      selectedSize: product.sizeOptions?.[selectedSizeIdx]?.name,
      selectedWrap,
      selectedRibbon,
      image: activeImage
    });
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    addToCart(product, {
      quantity,
      selectedColor: product.colorOptions?.[selectedColorIdx]?.name,
      selectedSize: product.sizeOptions?.[selectedSizeIdx]?.name,
      selectedWrap,
      selectedRibbon,
      image: activeImage
    });
    navigateTo('checkout');
  };

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    const res = checkDeliveryPincode(pincodeInput);
    setPincodeResult(res);
  };

  const toggleAddon = (addon) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
      showToast(`Added ${addon.name} to custom bouquet!`);
    }
  };

  // Related products from same category
  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="product-detail-page animate-fade-in">
      <div className="container">
        {/* Responsive Mobile-Friendly Breadcrumbs Bar */}
        <div className="product-detail-breadcrumbs">
          <button 
            type="button" 
            className="breadcrumb-back-btn"
            onClick={() => product.category ? navigateTo('category', { categorySlug: product.category }) : navigateTo('shop')}
            title="Back to Collection"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
          <div className="breadcrumb-trail">
            <span className="breadcrumb-link" onClick={() => navigateTo('home')}>Home</span>
            <ChevronRight size={12} className="breadcrumb-sep" />
            <span className="breadcrumb-link" onClick={() => navigateTo('shop')}>Shop</span>
            <ChevronRight size={12} className="breadcrumb-sep" />
            <span className="breadcrumb-link" onClick={() => navigateTo('category', { categorySlug: product.category })}>{product.categoryName}</span>
            <ChevronRight size={12} className="breadcrumb-sep" />
            <span className="breadcrumb-active" title={product.name}>{product.name}</span>
          </div>
        </div>

        {/* Main Product Display: Left Gallery + Right Customization Options */}
        <div className="product-detail-layout">
          {/* LEFT: Photo Gallery & Zoom Preview */}
          {/* LEFT: Photo Gallery (Flipkart / Myntra Mobile & Desktop Experience) */}
          <div className="product-detail-gallery-col">
            <div 
              className="flipkart-gallery-container"
              onTouchStart={handleMainTouchStart}
              onTouchMove={handleMainTouchMove}
              onTouchEnd={handleMainTouchEnd}
              onClick={() => setIsLightboxOpen(true)}
              title="Click to view full screen HD zoom"
            >
              {/* Main Image Viewport with Desktop Hover Magnifier */}
              {/* Main Image Viewport (Stable Image - Zoom on click/tap only) */}
              <div className="flipkart-slider-viewport">
                <img
                  src={currentDisplayImage}
                  alt={product.name}
                  decoding="async"
                  className="flipkart-main-img"
                  style={{ transform: "none" }}
                />
                <div className="flipkart-hover-zoom-hint" style={{ opacity: 0.9 }}>
                  <ZoomIn size={13} />
                  <span>Tap to Zoom</span>
                </div>
              </div>

              {/* Flipkart Top Floating Badges & Icons */}
              <div className="flipkart-gallery-top-bar">
                {discountPercent > 0 ? (
                  <span className="flipkart-badge-discount">
                    <Sparkles size={11} /> {discountPercent}% OFF • SPECIAL PRICE
                  </span>
                ) : product.badge ? (
                  <span className="flipkart-badge-discount">
                    <Sparkles size={11} /> {product.badge}
                  </span>
                ) : <div />}

                <div className="flipkart-top-actions">
                  <button 
                    type="button" 
                    className="flipkart-icon-circle-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openQrModal({
                        title: product.name,
                        url: window.location.href,
                        amount: finalUnitPrice
                      });
                    }}
                    title="Scan QR Code to open on phone or Pay"
                    aria-label="QR Code & Scanner"
                  >
                    <QrCode size={16} />
                  </button>

                  <button 
                    type="button" 
                    className="flipkart-icon-circle-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare();
                    }}
                    title="Share bouquet"
                    aria-label="Share"
                  >
                    <Share2 size={16} />
                  </button>

                  <button 
                    type="button" 
                    className={`flipkart-icon-circle-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    title="Save to Wishlist"
                    aria-label="Wishlist"
                  >
                    <Heart size={18} fill={isInWishlist(product.id) ? '#E11D48' : 'none'} color={isInWishlist(product.id) ? '#E11D48' : 'currentColor'} />
                  </button>
                </div>
              </div>

              {/* Navigation Arrows for Desktop */}
              {galleryImages.length > 1 && (
                <>
                  <button 
                    type="button" 
                    className="flipkart-nav-arrow prev"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImgIndex(prev => Math.max(0, prev - 1));
                    }}
                    disabled={activeImgIndex === 0}
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    type="button" 
                    className="flipkart-nav-arrow next"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImgIndex(prev => Math.min(galleryImages.length - 1, prev + 1));
                    }}
                    disabled={activeImgIndex === galleryImages.length - 1}
                    aria-label="Next photo"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Flipkart Bottom Controls: Tap to Zoom + Slide Counter */}
              <div className="flipkart-gallery-bottom-bar">
                <button 
                  type="button"
                  className="flipkart-zoom-pill"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                  title="Tap to Zoom & Full Screen"
                >
                  <Maximize2 size={13} />
                  <span>🔍 Tap to Zoom & Full Screen</span>
                </button>

                {galleryImages.length > 1 && (
                  <div className="flipkart-counter-pill">
                    <span>📷 {activeImgIndex + 1} / {galleryImages.length}</span>
                  </div>
                )}
              </div>

              {/* Flipkart Dots Indicator */}
              {galleryImages.length > 1 && (
                <div className="flipkart-dots-strip" onClick={(e) => e.stopPropagation()}>
                  {galleryImages.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`flipkart-dot ${activeImgIndex === i ? 'active' : ''}`}
                      onClick={() => setActiveImgIndex(i)}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Gallery Thumbnails Strip (Desktop & Tablet) */}
            {galleryImages.length > 1 && (
              <div className="product-detail-thumbs-strip">
                {galleryImages.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt={`Thumbnail ${idx + 1}`} 
                    className={`product-detail-thumb ${activeImgIndex === idx ? 'active' : ''}`}
                    onClick={() => setActiveImgIndex(idx)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Customization & Ordering Engine */}
          <div className="product-detail-info-col">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span className="product-card-category" style={{ letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 800, fontSize: '0.72rem', color: 'var(--text-accent)' }}>
                {product.categoryName} • Official Studio
              </span>
              {product.isBestSeller && (
                <span className="badge badge-gold" style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px' }}>
                  🔥 #1 Bestseller
                </span>
              )}
            </div>

            <h1 className="product-detail-title" style={{ fontSize: '1.45rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '0.55rem' }}>
              {product.name}
            </h1>

            {/* Owner-Only Quick Actions */}
            {isOwnerAuthenticated && (
              <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-gold btn-sm"
                  onClick={() => openEditProductModal(product)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  title="Owner Studio: Change image or price"
                >
                  <Edit3 size={14} />
                  <span>Edit Bouquet Details</span>
                </button>
                <button
                  className="btn btn-outline btn-sm owner-delete-btn"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to permanently delete "${product.name}" from the store catalog?`)) {
                      deleteOwnerProduct(product.id);
                      navigateTo('shop');
                    }
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderColor: '#E53E3E', color: '#E53E3E' }}
                  title="Delete this bouquet from live catalog"
                >
                  <Trash2 size={14} />
                  <span>Delete Bouquet</span>
                </button>
              </div>
            )}

            {/* Meesho / Flipkart Rating Row */}
            <div className="product-card-rating-row" style={{ alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
              <span className="meesho-rating-pill" style={{ padding: '3px 7px', fontSize: '0.75rem', fontWeight: 800, borderRadius: '4px', background: '#16A34A' }}>
                {product.rating} ★
              </span>
              <span className="meesho-review-count" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                {product.reviewCount || 184} Ratings & 86 Reviews
              </span>
              <span className="meesho-assured-badge" style={{ fontSize: '0.68rem', padding: '2px 6px', fontWeight: 800 }}>
                ⚡ Assured
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('reviews');
                  const el = document.getElementById('reviews-section-anchor');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-gold)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  marginLeft: 'auto',
                  textDecoration: 'underline'
                }}
              >
                📸 86 Photos
              </button>
              <button
                type="button"
                onClick={() => openWriteReviewModal(product)}
                style={{
                  background: 'rgba(212, 175, 55, 0.12)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  color: 'var(--text-gold)',
                  borderRadius: 'var(--radius-full)',
                  padding: '3px 10px',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Rate Product & Give Feedback with Photo"
              >
                <Camera size={12} />
                <span>✍️ Write Review & Feedback</span>
              </button>
            </div>

            {/* Meesho / Flipkart Pricing Section */}
            <div style={{ marginBottom: '0.45rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                Special Price
              </div>
              <div className="product-detail-price-box" style={{ alignItems: 'baseline', gap: '0.65rem', marginBottom: '0.2rem', borderBottom: 'none', paddingBottom: 0 }}>
                <span className="product-detail-price-current" style={{ fontSize: '1.85rem', fontWeight: 900 }}>
                  ₹{grandTotalPrice.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && (
                  <span className="product-detail-price-original" style={{ fontSize: '1.05rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    ₹{(product.originalPrice + sizeOffset).toLocaleString('en-IN')}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#16A34A' }}>
                    {discountPercent}% off
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Inclusive of all taxes</div>
            </div>

            {/* Meesho / Flipkart Free Delivery & Stock Guarantee Tag */}
            <div className="meesho-delivery-tag" style={{ marginBottom: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <span style={{ color: '#16A34A', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Truck size={13} /> Free Delivery
              </span>
              <span>•</span>
              <span className="meesho-dispatch-time">Dispatched in 2 Hours • Same Day Delivery</span>
            </div>

            {/* Immediate Quick Action Row: Add to Bag + WhatsApp (Visible right above the fold) */}
            <div className="product-quick-cta-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1.15rem' }}>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleBuyNow}
                style={{ padding: '0.75rem 0.5rem', fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', borderRadius: 'var(--radius-md)' }}
                title="Instant Buy Now"
              >
                <Zap size={18} />
                <span>Buy Now</span>
              </button>
              <button 
                type="button" 
                className="btn btn-gold"
                onClick={handleAddToCart}
                style={{ padding: '0.75rem 0.5rem', fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', borderRadius: 'var(--radius-md)' }}
                title="Add to Shopping Bag"
              >
                <ShoppingBag size={18} />
                <span>Add to Bag</span>
              </button>
            </div>

            {/* Flipkart Bank Offers / Coupons Card */}
            <div style={{ 
              background: 'rgba(22, 163, 74, 0.05)', 
              border: '1px dashed rgba(22, 163, 74, 0.35)', 
              borderRadius: 'var(--radius-md)', 
              padding: '0.75rem 0.9rem', 
              marginBottom: '1.15rem', 
              fontSize: '0.8rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, color: '#16A34A', marginBottom: '0.35rem' }}>
                <Sparkles size={14} />
                <span>Available Offers & Coupons (4 Offers)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.76rem', lineHeight: 1.4 }}>
                <div>• <strong style={{ color: 'var(--text-primary)' }}>Bank Offer:</strong> 5% Instant Cashback on UPI & Cards</div>
                <div>• <strong style={{ color: 'var(--text-primary)' }}>Special Coupon:</strong> Flat ₹150 OFF on first order with code <span style={{ background: '#FEF3C7', color: '#92400E', padding: '1px 5px', borderRadius: '3px', fontWeight: 800, border: '1px solid rgba(217, 119, 6, 0.3)' }}>BLOOM150</span></div>
                <div>• <strong style={{ color: 'var(--text-primary)' }}>Complimentary Gift:</strong> Luxury Gold-Foil Printed Card & Chrysal Flower Food Sachet included free</div>
                <div>• <strong style={{ color: 'var(--text-primary)' }}>Freshness Guarantee:</strong> 100% Morning Harvest or Instant Replacement</div>
              </div>
            </div>

            {/* Flipkart & Meesho 4-Pillar Trust Guarantee */}
            <div className="flipkart-trust-grid">
              <div className="flipkart-trust-card">
                <CheckCircle2 size={16} className="flipkart-trust-icon" />
                <div>
                  <div className="flipkart-trust-title">100% Farm Fresh</div>
                  <div className="flipkart-trust-desc">Dawn harvested from Nilgiri cold farms</div>
                </div>
              </div>
              <div className="flipkart-trust-card">
                <Sparkles size={16} className="flipkart-trust-icon" />
                <div>
                  <div className="flipkart-trust-title">Studio Quality</div>
                  <div className="flipkart-trust-desc">Inspected prior to dispatch</div>
                </div>
              </div>
              <div className="flipkart-trust-card">
                <Truck size={16} className="flipkart-trust-icon" />
                <div>
                  <div className="flipkart-trust-title">Chilled Transit</div>
                  <div className="flipkart-trust-desc">Temperature-locked fresh delivery</div>
                </div>
              </div>
              <div className="flipkart-trust-card">
                <ShieldCheck size={16} className="flipkart-trust-icon" />
                <div>
                  <div className="flipkart-trust-title">Handcrafted Care</div>
                  <div className="flipkart-trust-desc">Luxury packaging & secure protection</div>
                </div>
              </div>
            </div>

            {/* 1. Bloom Color Selection (Flipkart / Myntra Style Visual Thumbnail Cards!) */}
            {product.colorOptions && product.colorOptions.length > 0 && (
              <div className="flipkart-color-selector-section" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0 }}>
                    1. {t('selectColor')}: <span style={{ color: 'var(--text-accent)' }}>{activeColor?.name}</span>
                  </label>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    ({product.colorOptions.length} options)
                  </span>
                </div>

                <div className="flipkart-color-cards-grid">
                  {product.colorOptions.map((opt, idx) => (
                    <button
                      key={opt.name}
                      type="button"
                      className={`flipkart-color-card ${selectedColorIdx === idx ? 'selected' : ''}`}
                      onClick={() => handleColorSelect(idx)}
                    >
                      <div className="flipkart-color-thumb-box">
                        <img 
                          src={opt.image || product.image} 
                          alt={opt.name} 
                          className="flipkart-color-thumb-img" 
                        />
                        {selectedColorIdx === idx && (
                          <span className="flipkart-color-check">✓</span>
                        )}
                      </div>
                      <div className="flipkart-color-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: opt.hex, flexShrink: 0 }} />
                          <span className="flipkart-color-name">{opt.name}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Bouquet Size Selection */}
            {product.sizeOptions && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                  2. {t('selectSize')}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.65rem' }}>
                  {product.sizeOptions.map((sz, idx) => (
                    <button
                      key={sz.name}
                      onClick={() => setSelectedSizeIdx(idx)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: selectedSizeIdx === idx ? '2px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                        background: selectedSizeIdx === idx ? 'var(--bg-accent-soft)' : 'var(--bg-surface)',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{sz.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-gold)', fontWeight: 600 }}>
                        {sz.priceOffset === 0 ? 'Standard' : `+₹${sz.priceOffset}`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Wrapping & Ribbon Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  {t('selectWrap')}
                </label>
                <select
                  value={selectedWrap}
                  onChange={(e) => setSelectedWrap(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-alt)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                >
                  {product.wrapOptions?.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  {t('selectRibbon')}
                </label>
                <select
                  value={selectedRibbon}
                  onChange={(e) => setSelectedRibbon(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-alt)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                >
                  {product.ribbonOptions?.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quantity & Ordering Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>Quantity:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-alt)' }}>
                  <button 
                    type="button" 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ padding: '6px 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ padding: '0 10px', fontWeight: 800, fontSize: '0.95rem', minWidth: '28px', textAlign: 'center' }}>
                    {quantity}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setQuantity(quantity + 1)}
                    style={{ padding: '6px 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Main E-Commerce Action Buttons: Add to Bag & Buy Now */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button 
                  type="button"
                  className="btn btn-outline btn-lg"
                  onClick={() => {
                    addToCart(product, {
                      quantity,
                      selectedColor: product.colorOptions?.[selectedColorIdx]?.name,
                      selectedSize: product.sizeOptions?.[selectedSizeIdx]?.name,
                      selectedWrap,
                      selectedRibbon,
                      image: activeImage
                    });
                    setIsCartOpen(true);
                  }}
                  style={{ justifyContent: 'center', fontWeight: 700, gap: '8px', borderColor: 'var(--border-gold)' }}
                >
                  <ShoppingBag size={18} />
                  <span>Add to Bag</span>
                </button>

                <button 
                  type="button" 
                  className="btn btn-primary btn-lg"
                  onClick={handleBuyNow}
                  style={{ justifyContent: 'center', fontWeight: 700, gap: '8px' }}
                >
                  <Zap size={18} />
                  <span>Buy Now</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => toggleWishlist(product.id)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Heart size={15} fill={isInWishlist(product.id) ? '#E11D48' : 'none'} color={isInWishlist(product.id) ? '#E11D48' : 'currentColor'} />
                  <span>{isInWishlist(product.id) ? 'Saved' : 'Wishlist'}</span>
                </button>

                <button 
                  type="button"
                  className="btn btn-gold btn-sm"
                  onClick={() => setIsLightboxOpen(true)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <ZoomIn size={15} />
                  <span>HD Zoom</span>
                </button>
              </div>

              <div style={{ padding: '0.75rem', background: 'var(--bg-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                ✨ 100% Morning Harvested Stems • Delivered with Complimentary Gift Card
              </div>
            </div>
          </div>
        </div>

        {/* Accordion Tabs (Care instructions, Details, Reviews) */}
        <div className="glass-panel product-detail-accordion-panel" style={{ padding: '1.15rem 0.85rem', marginBottom: '3.5rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem', marginBottom: '1.25rem', overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
            <button 
              className={`filter-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              📋 Highlights & Specs
            </button>
            <button 
              className={`filter-tab-btn ${activeTab === 'care' ? 'active' : ''}`}
              onClick={() => setActiveTab('care')}
            >
              🌿 Flower Care Guide
            </button>
            <button 
              className={`filter-tab-btn ${activeTab === 'delivery' ? 'active' : ''}`}
              onClick={() => setActiveTab('delivery')}
            >
              🚚 Delivery & Freshness Policy
            </button>
            <button 
              className={`filter-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              ⭐ Customer Reviews ({product.reviewCount || 184})
            </button>
          </div>

          {activeTab === 'specs' && (
            <div className="animate-fade-in" style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              {/* Key Highlights */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.65rem', fontWeight: 800, fontSize: '0.98rem' }}>
                  Product Highlights
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: '#16A34A', fontWeight: 800 }}>✓</span>
                    <span><strong>100% Morning Harvested:</strong> Selected Grade-A Dutch velvet roses with full, velvety petal count.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: '#16A34A', fontWeight: 800 }}>✓</span>
                    <span><strong>Hydration Gel Pod:</strong> Pre-hydrated stems locked in cold bio-gel to prevent transit wilting.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: '#16A34A', fontWeight: 800 }}>✓</span>
                    <span><strong>Imported Korean Wrap:</strong> Multi-layered waterproof matte wrap with gilded gold edges & silk satin bow.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: '#16A34A', fontWeight: 800 }}>✓</span>
                    <span><strong>Free Keepsake Gift Card:</strong> Personalized message handwritten on embossed gold foil card.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: '#16A34A', fontWeight: 800 }}>✓</span>
                    <span><strong>Flower Food Included:</strong> Professional Chrysal sachet preserves freshness for 5–7 days.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: '#16A34A', fontWeight: 800 }}>✓</span>
                    <span><strong>Photo on WhatsApp:</strong> Real photograph sent to your WhatsApp prior to rider dispatch.</span>
                  </div>
                </div>
              </div>

              {/* Flipkart Detailed Specifications Table */}
              <div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.65rem', fontWeight: 800, fontSize: '0.98rem' }}>
                  Specifications
                </h4>
                <div className="flipkart-specs-table">
                  <div className="flipkart-spec-row">
                    <div className="flipkart-spec-label">In The Box</div>
                    <div className="flipkart-spec-value">1 Hand-tied Luxury Bouquet, 1 Embossed Greeting Card, 1 Chrysal Food Sachet, 1 Care Manual</div>
                  </div>
                  <div className="flipkart-spec-row">
                    <div className="flipkart-spec-label">Brand</div>
                    <div className="flipkart-spec-value">Rishika Blooms Luxury Floral Studio</div>
                  </div>
                  <div className="flipkart-spec-row">
                    <div className="flipkart-spec-label">Model Name</div>
                    <div className="flipkart-spec-value">{product.name}</div>
                  </div>
                  <div className="flipkart-spec-row">
                    <div className="flipkart-spec-label">Flower Variety</div>
                    <div className="flipkart-spec-value">{product.flowerTypes?.join(', ') || 'Dutch Velvet Roses, Gypsophila Baby\'s Breath, Italian Ruscus'}</div>
                  </div>
                  <div className="flipkart-spec-row">
                    <div className="flipkart-spec-label">Stem Count</div>
                    <div className="flipkart-spec-value">{product.sizeOptions?.[selectedSizeIdx]?.stems || 24} Premium Stems + Green Foliage</div>
                  </div>
                  <div className="flipkart-spec-row">
                    <div className="flipkart-spec-label">Arrangement Style</div>
                    <div className="flipkart-spec-value">Hand-tied Spiral Korean Cone Wrap</div>
                  </div>
                  <div className="flipkart-spec-row">
                    <div className="flipkart-spec-label">Color / Shade</div>
                    <div className="flipkart-spec-value">{activeColor?.name || 'Imperial Crimson Red'}</div>
                  </div>
                  <div className="flipkart-spec-row">
                    <div className="flipkart-spec-label">Dimensions</div>
                    <div className="flipkart-spec-value">{product.dimensions || 'Height: 50 cm | Width: 38 cm'}</div>
                  </div>
                  <div className="flipkart-spec-row">
                    <div className="flipkart-spec-label">Wrapping</div>
                    <div className="flipkart-spec-value">{selectedWrap}</div>
                  </div>
                  <div className="flipkart-spec-row">
                    <div className="flipkart-spec-label">Ribbon Bow</div>
                    <div className="flipkart-spec-value">{selectedRibbon}</div>
                  </div>
                  <div className="flipkart-spec-row">
                    <div className="flipkart-spec-label">Vase Life</div>
                    <div className="flipkart-spec-value">5 to 7 Days (with fresh water & included flower food)</div>
                  </div>
                  <div className="flipkart-spec-row">
                    <div className="flipkart-spec-label">Ideal For</div>
                    <div className="flipkart-spec-value">Birthday, Anniversary, Romance, Valentine's, Congratulations, Proposals</div>
                  </div>
                  <div className="flipkart-spec-row">
                    <div className="flipkart-spec-label">Country of Origin</div>
                    <div className="flipkart-spec-value">India (Harvested from Nilgiri & Bangalore Cold Farms)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="animate-fade-in" style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>Our Delivery Commitments:</h4>
              <p>• <strong>Same-Day Delivery:</strong> Available across Delhi NCR, Mumbai, Bengaluru, Hyderabad, and major metros on orders placed before 7:00 PM.</p>
              <p>• <strong>Midnight Surprise Delivery:</strong> Dispatched between 11:15 PM and 12:00 AM in pristine chilled delivery vans.</p>
              <p>• <strong>Hydration Lock:</strong> Every stem is nestled in a biodegradable water gel reservoir preventing dehydration during transit.</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="animate-fade-in" id="reviews-section-anchor">
              <ProductReviewsSection product={product} />
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h3 className="font-serif-editorial" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
              You May Also Adore
            </h3>
            <div className="products-grid">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>


      {/* FULLSCREEN BOUQUET ZOOM & LIGHTBOX STUDIO (E-Commerce Ultra-HD Zoom) */}
      {isLightboxOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="bouquet-lightbox-overlay" 
          onClick={() => {
            setIsLightboxOpen(false);
            setZoomScale(1);
            setPanPosition({ x: 0, y: 0 });
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bouquet-lightbox-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
            {/* Lightbox Header with Interactive Zoom Controls */}
            <div className="bouquet-lightbox-header">
              <div className="bouquet-lightbox-title-box">
                <span className="bouquet-lightbox-category">{product.categoryName}</span>
                <h3 className="bouquet-lightbox-title">
                  {product.name}
                </h3>
              </div>

              {/* Modern Glassmorphism Zoom Bar */}
              <div className="bouquet-lightbox-zoom-bar">
                <button
                  type="button"
                  className="zoom-tool-btn"
                  onClick={handleZoomOut}
                  disabled={zoomScale <= 1}
                  title="Zoom Out (-)"
                  aria-label="Zoom Out"
                >
                  <Minus size={16} />
                </button>

                <button
                  type="button"
                  className="zoom-tool-level-btn"
                  onClick={() => {
                    if (zoomScale > 1.2) {
                      handleResetZoom();
                    } else {
                      setZoomScale(2.5);
                    }
                  }}
                  title="Toggle Zoom (100% / 250%)"
                >
                  <span>{Math.round(zoomScale * 100)}%</span>
                </button>

                <button
                  type="button"
                  className="zoom-tool-btn"
                  onClick={handleZoomIn}
                  disabled={zoomScale >= 4}
                  title="Zoom In (+)"
                  aria-label="Zoom In"
                >
                  <Plus size={16} />
                </button>

                {zoomScale > 1 && (
                  <button
                    type="button"
                    className="zoom-tool-btn reset"
                    onClick={handleResetZoom}
                    title="Reset Zoom (1:1)"
                    aria-label="Reset Zoom"
                  >
                    <RotateCcw size={15} />
                  </button>
                )}

                <div className="zoom-tool-divider" />

                <button 
                  type="button" 
                  className="bouquet-lightbox-close-btn"
                  onClick={() => {
                    setIsLightboxOpen(false);
                    setZoomScale(1);
                    setPanPosition({ x: 0, y: 0 });
                  }}
                  title="Close (Esc)"
                  aria-label="Close Fullscreen View"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Interactive Zoom Stage & Image Canvas */}
            <div 
              ref={stageRef}
              className={`bouquet-lightbox-body ${zoomScale > 1 ? 'is-zoomed' : ''}`}
              onMouseDown={handleLightboxMouseDown}
              onMouseMove={handleLightboxMouseMove}
              onMouseUp={handleLightboxMouseUp}
              onMouseLeave={handleLightboxMouseUp}
              onTouchStart={handleLightboxTouchStart}
              onTouchMove={handleLightboxTouchMove}
              onTouchEnd={handleLightboxTouchEnd}
              onDoubleClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                toggleZoomAtPoint(e.clientX, e.clientY, rect);
              }}
            >
              <img 
                src={currentDisplayImage} 
                alt={product.name} 
                className={`bouquet-lightbox-img ${isDraggingImage ? 'is-dragging' : ''}`}
                style={{
                  transform: `translate3d(${panPosition.x}px, ${panPosition.y}px, 0) scale(${zoomScale})`,
                  transition: isDraggingImage || isPinching ? 'none' : 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: zoomScale > 1 ? (isDraggingImage ? 'grabbing' : 'grab') : 'zoom-in'
                }}
                draggable={false}
              />

              {/* Floating Gesture Guide Toast */}
              {showZoomHint && (
                <div className="lightbox-zoom-hint-pill animate-fade-in">
                  <ZoomIn size={14} />
                  <span>Double tap or pinch to zoom • Drag to explore</span>
                  <button 
                    type="button" 
                    className="lightbox-hint-dismiss" 
                    onClick={() => setShowZoomHint(false)}
                    aria-label="Dismiss guide"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Prev / Next Chevrons on Canvas */}
              {galleryImages.length > 1 && (
                <>
                  <button 
                    type="button" 
                    className="lightbox-nav-arrow prev"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    disabled={activeImgIndex === 0}
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    type="button" 
                    className="lightbox-nav-arrow next"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    disabled={activeImgIndex === galleryImages.length - 1}
                    aria-label="Next photo"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Tray: Thumbnails + Colors + Quick CTA */}
            <div className="bouquet-lightbox-footer">
              {/* Bottom Thumbnail Strip */}
              {galleryImages.length > 1 && (
                <div className="lightbox-thumbs-carousel">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`lightbox-thumb-btn ${activeImgIndex === idx ? 'active' : ''}`}
                      onClick={() => {
                        setActiveImgIndex(idx);
                        handleResetZoom();
                      }}
                      aria-label={`View photo ${idx + 1}`}
                    >
                      <img src={img} alt={`Thumb ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}

              {/* Color variant dots (if any) */}
              {product.colorOptions && product.colorOptions.length > 1 && (
                <div className="bouquet-lightbox-colors">
                  <span className="bouquet-lightbox-label">
                    Color:
                  </span>
                  <div className="bouquet-lightbox-color-list">
                    {product.colorOptions.map((c, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`bouquet-lightbox-color-dot ${selectedColorIdx === idx ? 'active' : ''}`}
                        style={{ backgroundColor: c.hex }}
                        onClick={() => {
                          handleColorSelect(idx);
                          handleResetZoom();
                        }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="bouquet-lightbox-actions">
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm"
                  onClick={() => setIsLightboxOpen(false)}
                >
                  <X size={15} />
                  <span>Close Preview</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Flipkart / Meesho Mobile Sticky Action Bar */}
      <div className="product-mobile-sticky-bar mobile-only">
        <div className="sticky-bar-info">
          <span className="sticky-bar-price">₹{product.price * quantity}</span>
          {discountPercent > 0 && (
            <span className="sticky-bar-save">{discountPercent}% OFF</span>
          )}
        </div>
        <div className="sticky-bar-buttons">
          <button 
            type="button" 
            className="btn btn-outline btn-sm sticky-btn-bag"
            onClick={() => {
              addToCart(product, {
                quantity,
                selectedColor: product.colorOptions?.[selectedColorIdx]?.name,
                selectedSize: product.sizeOptions?.[selectedSizeIdx]?.name,
                selectedWrap,
                selectedRibbon,
                image: activeImage
              });
              setIsCartOpen(true);
            }}
          >
            <ShoppingBag size={15} />
            <span>Add to Bag</span>
          </button>
          <button 
            type="button" 
            className="btn btn-primary btn-sm sticky-btn-buy"
            onClick={handleBuyNow}
          >
            <Zap size={15} />
            <span>Buy Now</span>
          </button>
        </div>
      </div>

      {/* Customer Write Review & Feedback Modal */}
      <WriteReviewModal 
        isOpen={isWriteReviewModalOpen} 
        onClose={() => setIsWriteReviewModalOpen(false)} 
        product={product} 
      />
    </div>
  );
}
