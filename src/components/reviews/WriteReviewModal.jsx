import React, { useState, useRef } from 'react';
import { useShop } from '../../context/ShopContext';
import { 
  X, Star, Camera, Upload, Trash2, CheckCircle2, 
  Sparkles, Image as ImageIcon, AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';

const RATING_LABELS = {
  1: { label: 'Poor', color: '#EF4444' },
  2: { label: 'Fair', color: '#F97316' },
  3: { label: 'Good', color: '#EAB308' },
  4: { label: 'Very Good', color: '#10B981' },
  5: { label: 'Exceptional Quality', color: '#059669' }
};

export default function WriteReviewModal({ isOpen, onClose, product }) {
  const { addProductReview, showToast } = useShop();
  const fileInputRef = useRef(null);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [author, setAuthor] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');

  if (!isOpen || !product) return null;

  // Handle local image file uploads (converts each file to Base64 data URL)
  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > 4) {
      setError('You can upload up to 4 showcase photos.');
      return;
    }

    const readers = files.map((file) => {
      return new Promise((resolve) => {
        if (!file.type.startsWith('image/')) {
          resolve(null);
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((newImages) => {
      const validImages = newImages.filter(Boolean);
      setImages((prev) => [...prev, ...validImages].slice(0, 4));
      setError('');
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) {
      setError('Please select an overall star rating.');
      return;
    }
    if (!comment.trim()) {
      setError('Please share your thoughts and feedback.');
      return;
    }

    addProductReview(product.id, {
      rating,
      title: title.trim(),
      comment: comment.trim(),
      author: author.trim() || 'Verified Customer',
      location: location.trim() || 'Verified Buyer',
      images
    });

    try {
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    } catch {}

    // Reset state & close
    setTitle('');
    setComment('');
    setAuthor('');
    setLocation('');
    setImages([]);
    setError('');
    onClose();
    showToast('✨ Thank you! Your review has been published.', 'success');
  };

  const activeRatingInfo = RATING_LABELS[hoverRating || rating] || RATING_LABELS[5];

  return (
    <div className="drawer-backdrop open owner-modal-backdrop" onClick={onClose} style={{ zIndex: 100020 }}>
      <div 
        className="glass-panel write-review-modal-card animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="review-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <img 
              src={product.image} 
              alt={product.name} 
              className="review-product-thumb"
            />
            <div>
              <span className="gold-badge" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                <Sparkles size={11} /> Verified Customer Feedback
              </span>
              <h3 className="font-serif-editorial" style={{ fontSize: '1.25rem', margin: '0.2rem 0', color: 'var(--text-primary)' }}>
                Rate & Review: {product.name}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Share your personal experience, floral presentation, and authentic photos
              </p>
            </div>
          </div>

          <button 
            type="button" 
            className="drawer-close-btn" 
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="owner-modal-error-banner" style={{ margin: '1rem 0 0.5rem 0' }}>
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="review-form">
          {/* 1. Star Rating Selector */}
          <div className="review-rating-box">
            <label className="review-field-label">
              1. Overall Bouquet Rating *
            </label>

            <div className="review-stars-interactive">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className="interactive-star-btn"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  aria-label={`${star} star`}
                >
                  <Star
                    size={32}
                    fill={(hoverRating || rating) >= star ? '#F59E0B' : 'none'}
                    color={(hoverRating || rating) >= star ? '#F59E0B' : '#D1D5DB'}
                  />
                </button>
              ))}

              <div className="rating-feedback-text" style={{ color: activeRatingInfo.color }}>
                <strong>{activeRatingInfo.label}</strong>
              </div>
            </div>
          </div>

          {/* 2. Photo Upload Box */}
          <div className="review-photos-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label className="review-field-label" style={{ margin: 0 }}>
                2. Add Photos of Bouquet (Optional)
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {images.length}/4 Photos added
              </span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Showcase authentic photos of your delivered bouquet to feature in our customer gallery.
            </p>

            {/* Hidden file input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
            />

            {/* Thumbnails + Add Button */}
            <div className="review-photo-thumbnails-grid">
              {images.map((imgSrc, idx) => (
                <div key={idx} className="review-photo-thumb-wrapper">
                  <img src={imgSrc} alt={`Review photo ${idx + 1}`} className="review-photo-thumb" />
                  <button
                    type="button"
                    className="review-photo-remove-btn"
                    onClick={() => handleRemoveImage(idx)}
                    title="Remove Photo"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {images.length < 4 && (
                <button
                  type="button"
                  className="review-photo-add-card"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload Photos from device or camera"
                >
                  <Camera size={24} color="var(--text-gold)" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, marginTop: '4px' }}>
                    + Upload Photo
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    (Camera / Gallery)
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* 3. Review Title & Detailed Feedback */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="review-field-label">Review Headline</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Breathtaking flower freshness & stunning presentation!"
              className="owner-input-field"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="review-field-label">Detailed Review *</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe flower freshness, petal quality, wrapping artistry, and on-time delivery experience..."
              className="owner-input-field"
              required
            />
          </div>

          {/* 4. Reviewer Name & City */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="review-field-label">Your Name</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="owner-input-field"
              />
            </div>
            <div>
              <label className="review-field-label">City / Region</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. South Delhi, NCR"
                className="owner-input-field"
              />
            </div>
          </div>

          {/* Certified Buyer Note */}
          <div className="certified-buyer-badge-note">
            <CheckCircle2 size={16} color="#10B981" />
            <span>
              <strong>Verified Buyer Review</strong> — Authenticated patron badge will be displayed alongside your review.
            </span>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline btn-md" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-gold btn-md" style={{ minWidth: '180px' }}>
              <CheckCircle2 size={16} /> Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
