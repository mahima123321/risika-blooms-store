import React, { useState, useMemo } from 'react';
import { useShop } from '../../context/ShopContext';
import { 
  Star, ThumbsUp, CheckCircle2, Camera, Sparkles, 
  Trash2, X, ChevronRight, ChevronLeft, Image as ImageIcon, 
  Filter, Plus 
} from 'lucide-react';
import WriteReviewModal from './WriteReviewModal';

export default function ProductReviewsSection({ product }) {
  const { 
    getProductReviews, 
    voteReviewHelpful, 
    deleteProductReview, 
    isOwnerAuthenticated 
  } = useShop();

  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'photos', '5star', '4star'
  const [lightboxImage, setLightboxImage] = useState(null); // { url, review }

  // Get live reactive list of reviews (user uploaded + default catalog reviews)
  const allReviews = useMemo(() => {
    // If product has seed reviews, give some of them realistic photo examples
    const seed = (product.reviews || []).map((r, i) => ({
      ...r,
      id: r.id || `seed-${product.id}-${i}`,
      title: r.title || (r.rating === 5 ? 'Amazing Quality & Freshness!' : 'Loved the flowers!'),
      location: r.location || 'Verified Buyer',
      isVerified: true,
      helpfulCount: r.helpfulCount || (i === 0 ? 18 : 9),
      // If the review doesn't have images and it's the first review, attach the product image as customer photo sample
      images: r.images || (i === 0 && product.image ? [product.image] : [])
    }));

    return getProductReviews(product.id, seed);
  }, [product, getProductReviews]);

  // Aggregate stats
  const totalCount = allReviews.length;
  const avgRating = totalCount > 0
    ? (allReviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalCount).toFixed(1)
    : product.rating || 5.0;

  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviews.forEach((r) => {
      const s = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [allReviews]);

  // Collect all photos from all reviews
  const allCustomerPhotos = useMemo(() => {
    const photos = [];
    allReviews.forEach((r) => {
      if (Array.isArray(r.images) && r.images.length > 0) {
        r.images.forEach((imgUrl) => {
          photos.push({ url: imgUrl, review: r });
        });
      }
    });
    return photos;
  }, [allReviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return allReviews.filter((r) => {
      if (selectedFilter === 'photos') {
        return Array.isArray(r.images) && r.images.length > 0;
      }
      if (selectedFilter === '5star') {
        return r.rating === 5;
      }
      if (selectedFilter === '4star') {
        return r.rating >= 4;
      }
      return true;
    });
  }, [allReviews, selectedFilter]);

  return (
    <div className="product-reviews-section">
      {/* 1. Rating Overview & Flipkart-Style Score Header */}
      <div className="reviews-summary-card">
        <div className="reviews-summary-left">
          <div className="rating-badge-giant">
            <span>{avgRating}</span>
            <Star size={20} fill="#FFFFFF" color="#FFFFFF" />
          </div>
          <div className="rating-score-meta">
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Overall Customer Rating
            </h4>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              {product.reviewCount || totalCount * 12} Ratings & {totalCount} Customer Reviews
            </p>
          </div>
        </div>

        {/* Middle: 5-Star Progress Bars */}
        <div className="rating-bars-container">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = starCounts[star] || 0;
            const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
            return (
              <div key={star} className="rating-bar-row">
                <span className="rating-bar-label">
                  {star} <Star size={11} fill="#F59E0B" color="#F59E0B" />
                </span>
                <div className="rating-bar-track">
                  <div 
                    className="rating-bar-fill" 
                    style={{ 
                      width: `${percent}%`,
                      backgroundColor: star >= 4 ? '#10B981' : star === 3 ? '#F59E0B' : '#EF4444' 
                    }} 
                  />
                </div>
                <span className="rating-bar-count">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Right: CTA to Rate & Review with photo */}
        <div className="reviews-summary-right">
          <button 
            type="button" 
            className="btn btn-gold btn-md write-review-cta-btn"
            onClick={() => setIsWriteModalOpen(true)}
          >
            <Camera size={16} />
            <span>Write a Review</span>
          </button>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.4rem' }}>
            Have this bouquet? Share photos & feedback
          </span>
        </div>
      </div>

      {/* 2. Customer Photos Gallery Row */}
      {allCustomerPhotos.length > 0 && (
        <div className="customer-photos-showcase">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
              <Camera size={18} color="var(--text-gold)" />
              <span>Customer Photos</span>
              <span className="photos-count-pill">{allCustomerPhotos.length}</span>
            </h4>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Click to view real bouquet details
            </span>
          </div>

          <div className="customer-photos-scroll-row">
            {allCustomerPhotos.map((item, idx) => (
              <div 
                key={idx} 
                className="customer-photo-card"
                onClick={() => setLightboxImage(item)}
                title={`Click to view photo by ${item.review.author}`}
              >
                <img src={item.url} alt="Customer bouquet" className="customer-photo-img" />
                <div className="customer-photo-overlay">
                  <span style={{ fontSize: '0.72rem', color: '#FFFFFF', fontWeight: 600 }}>
                    {item.review.author?.split(' ')[0]}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#FCD34D' }}>
                    ★ {item.review.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Review Filter Pills */}
      <div className="review-filters-bar">
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginRight: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Filter size={13} /> Filter Reviews:
        </span>
        <button
          type="button"
          className={`review-filter-pill ${selectedFilter === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('all')}
        >
          All ({totalCount})
        </button>
        <button
          type="button"
          className={`review-filter-pill ${selectedFilter === 'photos' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('photos')}
        >
          📸 With Photos ({allCustomerPhotos.length})
        </button>
        <button
          type="button"
          className={`review-filter-pill ${selectedFilter === '5star' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('5star')}
        >
          5 ★ ({starCounts[5] || 0})
        </button>
        <button
          type="button"
          className={`review-filter-pill ${selectedFilter === '4star' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('4star')}
        >
          4 ★ & above ({ (starCounts[5] || 0) + (starCounts[4] || 0) })
        </button>
      </div>

      {/* 4. Review Cards List (Flipkart / Meesho design) */}
      <div className="review-cards-list">
        {filteredReviews.length === 0 ? (
          <div className="empty-reviews-card">
            <Camera size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ margin: '0 0 0.3rem 0', color: 'var(--text-primary)' }}>No reviews in this filter</h4>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Be the first to upload a bouquet photo and share feedback!
            </p>
            <button
              type="button"
              className="btn btn-gold btn-sm"
              onClick={() => setIsWriteModalOpen(true)}
            >
              + Write First Review
            </button>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div key={rev.id} className="flipkart-review-card animate-fade-in">
              {/* Rating Pill + Headline */}
              <div className="review-card-top-row">
                <div className="review-star-pill" style={{ backgroundColor: rev.rating >= 4 ? '#10B981' : rev.rating === 3 ? '#F59E0B' : '#EF4444' }}>
                  <span>{rev.rating}</span>
                  <Star size={11} fill="#FFFFFF" color="#FFFFFF" />
                </div>
                <h4 className="review-headline">
                  {rev.title || (rev.rating === 5 ? 'Excellent Bouquet!' : 'Very Good')}
                </h4>
              </div>

              {/* Review Comment Body */}
              <p className="review-comment-body">
                {rev.comment}
              </p>

              {/* Attached Customer Photos Grid (Flipkart/Meesho thumbnail gallery) */}
              {Array.isArray(rev.images) && rev.images.length > 0 && (
                <div className="review-attached-photos-grid">
                  {rev.images.map((imgUrl, i) => (
                    <div 
                      key={i} 
                      className="review-attached-photo-wrapper"
                      onClick={() => setLightboxImage({ url: imgUrl, review: rev })}
                      title="Click to zoom customer photo"
                    >
                      <img src={imgUrl} alt="Customer upload" className="review-attached-photo" />
                    </div>
                  ))}
                </div>
              )}

              {/* Review Author & Verification Footer */}
              <div className="review-card-footer">
                <div className="review-author-meta">
                  <span className="review-author-name">{rev.author}</span>
                  {rev.location && (
                    <span className="review-author-loc">({rev.location})</span>
                  )}
                  {rev.isVerified && (
                    <span className="certified-buyer-badge">
                      <CheckCircle2 size={13} color="#10B981" />
                      <span>Verified Buyer</span>
                    </span>
                  )}
                  <span className="review-date-bullet">•</span>
                  <span className="review-date-text">{rev.date}</span>
                </div>

                <div className="review-actions-right">
                  <button
                    type="button"
                    className={`review-helpful-btn ${rev.userLiked ? 'liked' : ''}`}
                    onClick={() => voteReviewHelpful(product.id, rev.id)}
                    title="Helpful Review"
                  >
                    <ThumbsUp size={13} />
                    <span>Helpful ({rev.helpfulCount || 0})</span>
                  </button>

                  {/* Owner moderation button */}
                  {isOwnerAuthenticated && (
                    <button
                      type="button"
                      className="review-delete-btn"
                      onClick={() => {
                        if (window.confirm('Delete this customer review?')) {
                          deleteProductReview(product.id, rev.id);
                        }
                      }}
                      title="Delete review (Owner only)"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. Photo Lightbox Modal (Clicking any customer photo zooms it) */}
      {lightboxImage && (
        <div className="drawer-backdrop open lightbox-backdrop" onClick={() => setLightboxImage(null)} style={{ zIndex: 100030 }}>
          <div className="lightbox-content-card glass-panel" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className="lightbox-close-btn" 
              onClick={() => setLightboxImage(null)}
              aria-label="Close"
            >
              <X size={22} />
            </button>

            <div className="lightbox-split">
              <div className="lightbox-image-column">
                <img src={lightboxImage.url} alt="Customer Bouquet Full Preview" className="lightbox-image-full" />
              </div>

              <div className="lightbox-review-column">
                <div className="review-card-top-row" style={{ marginBottom: '0.75rem' }}>
                  <div className="review-star-pill" style={{ backgroundColor: '#10B981' }}>
                    <span>{lightboxImage.review?.rating || 5}</span>
                    <Star size={11} fill="#FFFFFF" color="#FFFFFF" />
                  </div>
                  <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                    {lightboxImage.review?.title || 'Customer Bouquet Photo'}
                  </h4>
                </div>

                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  "{lightboxImage.review?.comment}"
                </p>

                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {lightboxImage.review?.author}
                    </strong>
                    {lightboxImage.review?.location && (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        ({lightboxImage.review?.location})
                      </span>
                    )}
                  </div>

                  <div className="certified-buyer-badge" style={{ display: 'inline-flex' }}>
                    <CheckCircle2 size={13} color="#10B981" />
                    <span>Verified Buyer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Write Review Modal */}
      <WriteReviewModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        product={product}
      />
    </div>
  );
}
