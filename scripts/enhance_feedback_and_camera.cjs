const fs = require('fs');
const path = require('path');

console.log('=== APPLYING COMPREHENSIVE FEEDBACK & CAMERA SYSTEM FIXES ===');

// =========================================================================
// 1. UPDATE WRITEREVIEWMODAL.JSX - FULL CAMERA & COMPRESSION INTEGRATION
// =========================================================================
const writeReviewModalPath = path.join(__dirname, '../src/components/reviews/WriteReviewModal.jsx');

const newWriteReviewModalCode = `import React, { useState, useRef, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { 
  X, Star, Camera, Upload, Trash2, CheckCircle2, 
  Sparkles, Image as ImageIcon, AlertCircle, Video, VideoOff, RefreshCw, ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

const RATING_LABELS = {
  1: { label: '1★ Needs Improvement', color: '#EF4444' },
  2: { label: '2★ Fair Quality', color: '#F97316' },
  3: { label: '3★ Good & Satisfactory', color: '#EAB308' },
  4: { label: '4★ Very Good Presentation', color: '#10B981' },
  5: { label: '5★ Exceptional Quality (Recommended!)', color: '#059669' }
};

export default function WriteReviewModal({ isOpen, onClose, product }) {
  const { addProductReview, showToast, products } = useShop();

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const [activeProduct, setActiveProduct] = useState(product || products?.[0] || null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [author, setAuthor] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState('');

  // Keep active product in sync if prop changes
  useEffect(() => {
    if (product) {
      setActiveProduct(product);
    } else if (products && products.length > 0 && !activeProduct) {
      setActiveProduct(products[0]);
    }
  }, [product, products]);

  // Clean up any active webcam stream when modal closes
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  const stopWebcam = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsWebcamActive(false);
    setWebcamError('');
  };

  const startWebcam = async () => {
    setWebcamError('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setWebcamError('WebCam API is not supported on this browser. Please tap "Open Phone Camera" below.');
      return;
    }

    try {
      stopWebcam();
      // Try back camera on mobile or default camera on laptop
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      mediaStreamRef.current = stream;
      setIsWebcamActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => {
            console.warn('Video play error:', err);
          });
        }
      }, 100);
    } catch (err) {
      console.warn('Webcam permission error:', err);
      setWebcamError('Camera access was not granted or is busy. Tap "Open Phone Camera" to use your device native camera.');
      setIsWebcamActive(false);
    }
  };

  const captureWebcamFrame = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Compress to high quality JPEG
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      setImages((prev) => [...prev, dataUrl].slice(0, 4));
      showToast('📸 Photo captured successfully!', 'success');
      stopWebcam();
    } catch (err) {
      console.error('Frame capture failed:', err);
      setError('Could not capture frame from camera.');
    }
  };

  // High quality client-side canvas compression (~80KB per photo)
  const compressImageFile = (file) => {
    return new Promise((resolve) => {
      if (!file || !file.type.startsWith('image/')) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_DIM = 1080;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_DIM) {
                height = Math.round((height * MAX_DIM) / width);
                width = MAX_DIM;
              }
            } else {
              if (height > MAX_DIM) {
                width = Math.round((width * MAX_DIM) / height);
                height = MAX_DIM;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            resolve(compressed);
          } catch (err) {
            console.warn('Canvas compression fallback:', err);
            resolve(e.target.result);
          }
        };
        img.onerror = () => resolve(null);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > 4) {
      setError('You can attach up to 4 showcase photos.');
      return;
    }

    setIsCompressing(true);
    setError('');

    try {
      const promises = files.map((f) => compressImageFile(f));
      const compressedList = await Promise.all(promises);
      const valid = compressedList.filter(Boolean);
      setImages((prev) => [...prev, ...valid].slice(0, 4));
      showToast(\`📸 \${valid.length} photo(s) added successfully!\`, 'success');
    } catch (err) {
      console.error('File compression error:', err);
      setError('Failed to process image files.');
    } finally {
      setIsCompressing(false);
      // Reset input value so re-selecting same photo triggers onChange
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleClose = () => {
    stopWebcam();
    if (onClose) onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activeProduct) {
      setError('Please select a bouquet to review.');
      return;
    }
    if (!rating) {
      setError('Please select a star rating (1 to 5).');
      return;
    }
    if (!comment.trim()) {
      setError('Please share your thoughts and feedback message.');
      return;
    }

    addProductReview(activeProduct.id, {
      rating,
      title: title.trim() || (rating >= 4 ? 'Beautiful fresh flowers!' : 'Customer Feedback'),
      comment: comment.trim(),
      author: author.trim() || 'Verified Customer',
      location: location.trim() || 'Verified Buyer',
      images
    });

    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch {}

    // Reset state & close
    setTitle('');
    setComment('');
    setAuthor('');
    setLocation('');
    setImages([]);
    setError('');
    handleClose();
  };

  if (!isOpen) return null;

  const activeRatingInfo = RATING_LABELS[hoverRating || rating] || RATING_LABELS[5];

  return (
    <div className="drawer-backdrop open owner-modal-backdrop" onClick={handleClose} style={{ zIndex: 100030 }}>
      <div 
        className="glass-panel write-review-modal-card animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: '16px',
          padding: '1.75rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(212, 175, 55, 0.2)'
        }}
      >
        {/* Header */}
        <div className="review-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <img 
              src={activeProduct?.image || '/favicon.svg'} 
              alt={activeProduct?.name || 'Bouquet'} 
              style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', border: '1.5px solid var(--border-gold)' }}
            />
            <div>
              <span className="gold-badge" style={{ fontSize: '0.7rem', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={11} /> Verified Customer Feedback
              </span>
              <h3 className="font-serif-editorial" style={{ fontSize: '1.25rem', margin: '0.25rem 0 0 0', color: 'var(--text-primary)', fontWeight: 800 }}>
                Rate & Review: {activeProduct?.name || 'Bespoke Bouquet'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Share your authentic floral experience & upload live camera photos
              </p>
            </div>
          </div>

          <button 
            type="button" 
            className="drawer-close-btn" 
            onClick={handleClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Product Selector Dropdown if user wants to change bouquet */}
        {products && products.length > 1 && (
          <div style={{ marginBottom: '1.25rem', background: 'var(--bg-alt)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <label style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-gold)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              Selected Bouquet for Feedback:
            </label>
            <select
              value={activeProduct?.id || ''}
              onChange={(e) => {
                const found = products.find(p => p.id === e.target.value);
                if (found) setActiveProduct(found);
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (₹{p.price})
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <div className="owner-modal-error-banner" style={{ margin: '0 0 1rem 0', padding: '0.65rem 1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #EF4444', color: '#EF4444', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="review-form">
          {/* 1. Star Rating Selector */}
          <div style={{ background: 'var(--bg-alt)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem', textAlign: 'center' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
              1. Overall Star Rating *
            </label>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', margin: '0.4rem 0' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  aria-label={\`\${star} star\`}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  <Star
                    size={36}
                    fill={(hoverRating || rating) >= star ? '#F59E0B' : 'none'}
                    color={(hoverRating || rating) >= star ? '#F59E0B' : '#94A3B8'}
                  />
                </button>
              ))}
            </div>

            <div style={{ color: activeRatingInfo.color, fontSize: '0.88rem', fontWeight: 800, marginTop: '4px' }}>
              {activeRatingInfo.label}
            </div>
          </div>

          {/* 2. Photo Upload & Camera Action Hub */}
          <div style={{ background: 'var(--bg-alt)', padding: '1.1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Camera size={16} color="var(--text-gold)" />
                <span>2. Attach Bouquet Photos (Live Camera / Gallery)</span>
              </label>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-gold)', fontWeight: 700 }}>
                {images.length}/4 Photos
              </span>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', lineHeight: 1.45 }}>
              Click with your phone camera or select from your gallery. Photos appear in customer verified showcase.
            </p>

            {/* Hidden Native File Inputs */}
            {/* Native Mobile Camera (Direct Viewfinder) */}
            <input 
              type="file" 
              ref={cameraInputRef} 
              style={{ display: 'none' }} 
              accept="image/*"
              capture="environment"
              onChange={handleFilesSelected}
            />

            {/* Gallery / File Chooser */}
            <input 
              type="file" 
              ref={galleryInputRef} 
              style={{ display: 'none' }} 
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
            />

            {/* Live WebCam Stream Box if user launched in-app webcam */}
            {isWebcamActive && (
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#000000', marginBottom: '1rem', border: '2px solid var(--border-gold)' }}>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted
                  style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ position: 'absolute', bottom: '12px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '0.75rem', zIndex: 10 }}>
                  <button
                    type="button"
                    onClick={captureWebcamFrame}
                    className="btn btn-gold btn-sm"
                    style={{ fontWeight: 800, padding: '0.6rem 1.25rem', boxShadow: '0 4px 14px rgba(0,0,0,0.5)' }}
                  >
                    <Camera size={16} />
                    <span>Capture Snapshot</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopWebcam}
                    className="btn btn-outline btn-sm"
                    style={{ background: 'rgba(0,0,0,0.6)', color: '#FFFFFF', borderColor: '#FFFFFF' }}
                  >
                    <VideoOff size={14} />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            )}

            {webcamError && (
              <div style={{ fontSize: '0.76rem', color: '#EF4444', marginBottom: '0.75rem', background: 'rgba(239, 68, 68, 0.08)', padding: '6px 10px', borderRadius: '6px' }}>
                {webcamError}
              </div>
            )}

            {/* Direct Dual Action Buttons: Phone Camera vs Photo Gallery vs WebCam */}
            {images.length < 4 && !isWebcamActive && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="btn btn-sm"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    padding: '0.65rem 0.5rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
                  }}
                  title="Directly opens phone camera to snap flowers"
                >
                  <Camera size={15} />
                  <span>📸 Open Camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="btn btn-sm btn-outline"
                  style={{
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    padding: '0.65rem 0.5rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                  title="Select photos from device gallery"
                >
                  <Upload size={14} />
                  <span>🖼️ Choose Photos</span>
                </button>

                <button
                  type="button"
                  onClick={startWebcam}
                  className="btn btn-sm btn-outline"
                  style={{
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    padding: '0.65rem 0.5rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                  title="Live In-App WebCam"
                >
                  <Video size={14} color="var(--text-gold)" />
                  <span>📹 Live WebCam</span>
                </button>
              </div>
            )}

            {/* Compressing Indicator */}
            {isCompressing && (
              <div style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.8rem', color: 'var(--text-gold)', fontWeight: 600 }}>
                ⚡ Optimizing & compressing bouquet photo...
              </div>
            )}

            {/* Thumbnails Showcase */}
            {images.length > 0 && (
              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                {images.map((imgSrc, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '74px', height: '74px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--border-gold)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <img src={imgSrc} alt={\`Bouquet \${idx + 1}\`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        background: 'rgba(0,0,0,0.75)',
                        border: 'none',
                        color: '#FFFFFF',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      title="Remove Photo"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Review Headline & Detailed Message */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
              3. Review Headline
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Stunning freshness, beautiful velvet wrap!"
              className="owner-input-field"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.88rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
              4. Detailed Feedback / Experience *
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell other floral lovers about petal freshness, packaging, aroma, timely handover, and overall presentation..."
              className="owner-input-field"
              style={{ width: '100%', padding: '0.75rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.88rem', resize: 'vertical' }}
              required
            />
          </div>

          {/* 5. Author Name & City */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                Your Name / Alias
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Priya Sharma"
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.84rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                Your City / Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. South Delhi / Mumbai"
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.84rem' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-outline"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem', borderRadius: '8px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-gold"
              style={{
                padding: '0.65rem 1.5rem',
                fontSize: '0.88rem',
                fontWeight: 800,
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(212, 175, 55, 0.35)'
              }}
            >
              <CheckCircle2 size={16} />
              <span>Publish Verified Review</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(writeReviewModalPath, newWriteReviewModalCode, 'utf8');
console.log('✓ WriteReviewModal.jsx updated with Native Camera, WebCam, Photo Gallery, and Auto-Compression!');

// =========================================================================
// 2. UPDATE SHOPCONTEXT.JSX - EXPOSE GLOBAL REVIEW MODAL STATE & ACTIONS
// =========================================================================
const shopContextPath = path.join(__dirname, '../src/context/ShopContext.jsx');
let contextContent = fs.readFileSync(shopContextPath, 'utf8');

if (!contextContent.includes('isWriteReviewModalOpen')) {
  // Add state hooks
  const stateInsertTarget = `const [productReviews, setProductReviews] = useState(() => {`;
  const stateInsertCode = `const [isWriteReviewModalOpen, setIsWriteReviewModalOpen] = useState(false);
  const [writeReviewTargetProduct, setWriteReviewTargetProduct] = useState(null);

  const openWriteReviewModal = (targetProduct = null) => {
    const prod = targetProduct || (products && products[0]) || null;
    setWriteReviewTargetProduct(prod);
    setIsWriteReviewModalOpen(true);
  };

  const closeWriteReviewModal = () => {
    setIsWriteReviewModalOpen(false);
  };

  const [productReviews, setProductReviews] = useState(() => {`;

  contextContent = contextContent.replace(stateInsertTarget, stateInsertCode);

  // Add to returned context value
  const contextValueTarget = `productReviews,
        getProductReviews,
        addProductReview,`;

  const contextValueCode = `isWriteReviewModalOpen,
        writeReviewTargetProduct,
        openWriteReviewModal,
        closeWriteReviewModal,
        productReviews,
        getProductReviews,
        addProductReview,`;

  contextContent = contextContent.replace(contextValueTarget, contextValueCode);

  fs.writeFileSync(shopContextPath, contextContent, 'utf8');
  console.log('✓ ShopContext.jsx updated with openWriteReviewModal actions!');
} else {
  console.log('• ShopContext.jsx already had isWriteReviewModalOpen.');
}

// =========================================================================
// 3. UPDATE APP.JSX - MOUNT WRITEREVIEWMODAL GLOBALLY
// =========================================================================
const appPath = path.join(__dirname, '../src/App.jsx');
let appContent = fs.readFileSync(appPath, 'utf8');

if (!appContent.includes('import WriteReviewModal from')) {
  appContent = appContent.replace(
    `import WhatsAppButton from './components/common/WhatsAppButton';`,
    `import WhatsAppButton from './components/common/WhatsAppButton';\nimport WriteReviewModal from './components/reviews/WriteReviewModal';`
  );
}

if (!appContent.includes('const { currentView, isMobileFrame, isWriteReviewModalOpen, closeWriteReviewModal, writeReviewTargetProduct } = useShop();')) {
  appContent = appContent.replace(
    `const { currentView, isMobileFrame } = useShop();`,
    `const { currentView, isMobileFrame, isWriteReviewModalOpen, closeWriteReviewModal, writeReviewTargetProduct } = useShop();`
  );
}

if (!appContent.includes('<WriteReviewModal \n        isOpen={isWriteReviewModalOpen}')) {
  appContent = appContent.replace(
    `<Toast />`,
    `<WriteReviewModal 
        isOpen={isWriteReviewModalOpen} 
        onClose={closeWriteReviewModal} 
        product={writeReviewTargetProduct} 
      />\n      <Toast />`
  );
}

fs.writeFileSync(appPath, appContent, 'utf8');
console.log('✓ App.jsx updated: WriteReviewModal mounted globally!');

// =========================================================================
// 4. UPDATE PRODUCTDETAILPAGE.JSX - WIRE UP OPENWRITEREVIEWMODAL
// =========================================================================
const detailPagePath = path.join(__dirname, '../src/pages/ProductDetailPage.jsx');
let detailContent = fs.readFileSync(detailPagePath, 'utf8');

detailContent = detailContent.replace(
  `onClick={() => setIsWriteReviewModalOpen(true)}`,
  `onClick={() => openWriteReviewModal(product)}`
);

// Also update useShop import in ProductDetailPage if needed
if (!detailContent.includes('openWriteReviewModal,')) {
  detailContent = detailContent.replace(
    `const {\n    currentView,`,
    `const {\n    openWriteReviewModal,\n    currentView,`
  );
  if (!detailContent.includes('openWriteReviewModal,')) {
    detailContent = detailContent.replace(
      `const { currentView,`,
      `const { openWriteReviewModal, currentView,`
    );
  }
}

fs.writeFileSync(detailPagePath, detailContent, 'utf8');
console.log('✓ ProductDetailPage.jsx updated to trigger global review & camera modal!');

// =========================================================================
// 5. UPDATE MYORDERSPAGE.JSX - ADD "RATE & REVIEW WITH PHOTOS" ON ORDERS
// =========================================================================
const myOrdersPath = path.join(__dirname, '../src/pages/MyOrdersPage.jsx');
let myOrdersContent = fs.readFileSync(myOrdersPath, 'utf8');

if (!myOrdersContent.includes('openWriteReviewModal,')) {
  myOrdersContent = myOrdersContent.replace(
    `const { \n  orders,`,
    `const { \n  openWriteReviewModal, products, \n  orders,`
  );
  if (!myOrdersContent.includes('openWriteReviewModal,')) {
    myOrdersContent = myOrdersContent.replace(
      `const { orders,`,
      `const { openWriteReviewModal, products, orders,`
    );
  }
}

// Add Rate & Review button to customer tracking card
const reviewButtonCode = `
                      <button 
                        type="button" 
                        className="btn btn-gold btn-sm"
                        onClick={() => {
                          const item = activeCustomerOrder.items?.[0];
                          const prod = (products || []).find(p => p.id === (item?.productId || item?.id)) || (products || [])[0];
                          openWriteReviewModal(prod);
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          border: 'none',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <Camera size={14} />
                        <span>⭐ Rate & Review with Photos</span>
                      </button>
`;

if (!myOrdersContent.includes('⭐ Rate & Review with Photos')) {
  myOrdersContent = myOrdersContent.replace(
    `<button \n                        type="button" \n                        className="btn btn-outline btn-sm"\n                        onClick={() => navigateTo('contact')}\n                      >\n                        Contact Concierge\n                      </button>`,
    `<button \n                        type="button" \n                        className="btn btn-outline btn-sm"\n                        onClick={() => navigateTo('contact')}\n                      >\n                        Contact Concierge\n                      </button>\n${reviewButtonCode}`
  );
  fs.writeFileSync(myOrdersPath, myOrdersContent, 'utf8');
  console.log('✓ MyOrdersPage.jsx updated with customer photo review trigger!');
}

// =========================================================================
// 6. UPDATE TESTIMONIALSSECTION.JSX - ADD DIRECT FEEDBACK BUTTON
// =========================================================================
const testimonialsPath = path.join(__dirname, '../src/components/home/TestimonialsSection.jsx');
let testimonialsContent = fs.readFileSync(testimonialsPath, 'utf8');

if (!testimonialsContent.includes('openWriteReviewModal')) {
  testimonialsContent = `import React from 'react';
import { useShop } from '../../context/ShopContext';
import { Star, Quote, CheckCircle2, Camera } from 'lucide-react';

export default function TestimonialsSection() {
  const { openWriteReviewModal } = useShop();

  const testimonials = [
    {
      name: "Radhika Mehra",
      location: "South Delhi",
      occasion: "10th Wedding Anniversary",
      quote: "The Crimson Velvet bouquet arrived at exactly 12:00 AM on our anniversary night. The roses were velvety, huge and had an intoxicating fragrance. The packaging felt like Paris!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Vikramaditya Rao",
      location: "Bandra, Mumbai",
      occasion: "Birthday Surprise",
      quote: "I customized a Korean cloud hydrangea bouquet via WhatsApp. The florist concierge was extraordinarily courteous and shared real photos before dispatch. Flawless experience!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Dr. Ananya Sen",
      location: "Indiranagar, Bengaluru",
      occasion: "Sister's Baby Shower",
      quote: "The teddy combo and pastel blush flowers were so cute and meticulously crafted. You can immediately tell the difference between ordinary roadside florists and RISIKA BLOOMS.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    }
  ];

  return (
    <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-pretitle">Patron Stories</span>
          <h2 className="section-title">What Our Clients Say</h2>
          <div className="floral-divider">
            <span className="floral-divider-line"></span>
            <span className="floral-divider-icon">🌟</span>
            <span className="floral-divider-line"></span>
          </div>
          <p className="section-subtitle">
            Curated client experiences & verified feedback. Share your bouquet photos with our floral masters.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, idx) => (
            <div 
              key={idx}
              className="glass-panel"
              style={{
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <Quote 
                size={36} 
                style={{ position: 'absolute', top: '20px', right: '20px', opacity: 0.15, color: 'var(--text-gold)' }} 
              />

              <div>
                <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '1rem' }}>
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>

                <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  "{t.quote}"
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <img 
                  src={t.avatar} 
                  alt={t.name}
                  style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-full)', objectFit: 'cover', border: '2px solid var(--border-gold)' }}
                />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {t.name}
                    <CheckCircle2 size={13} color="#16A34A" />
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {t.location} • <span style={{ color: 'var(--text-accent)' }}>{t.occasion}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Direct Feedback with Camera CTA Button */}
        <div style={{ textAlign: 'center', marginTop: '2.75rem' }}>
          <button
            type="button"
            className="btn btn-gold btn-md"
            onClick={() => openWriteReviewModal()}
            style={{
              padding: '0.75rem 1.75rem',
              fontSize: '0.92rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '50px',
              boxShadow: '0 4px 18px rgba(212, 175, 55, 0.35)'
            }}
          >
            <Camera size={18} />
            <span>✍️ Write Feedback & Share Bouquet Photos</span>
          </button>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Open camera to snap live blooms or upload from gallery
          </div>
        </div>
      </div>
    </section>
  );
}
`;
  fs.writeFileSync(testimonialsPath, testimonialsContent, 'utf8');
  console.log('✓ TestimonialsSection.jsx updated with Write Feedback & Camera button!');
}

console.log('=== ALL COMPREHENSIVE FEEDBACK & CAMERA FIXES APPLIED ===');
