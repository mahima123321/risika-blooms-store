import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Heart, Eye, Sparkles, X, ShoppingBag } from 'lucide-react';

const InstagramIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function InstagramFeed() {
  const { navigateTo } = useShop();
  const [selectedPost, setSelectedPost] = useState(null);

  const posts = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80",
      caption: "50 Velvet Red Dutch Roses with Gold Edge Wrapping ✨ #RoshikaBlooms #LuxuryFlowers",
      likes: 1240,
      linkCategory: "rose-bouquets"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1599732497645-0d32f281ce1d?auto=format&fit=crop&w=600&q=80",
      caption: "Cloud Hydrangea dream wrapped in Seoul frosted mesh ☁️ #KoreanBouquet",
      likes: 2180,
      linkCategory: "korean-style-bouquets"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=600&q=80",
      caption: "The cuddliest gift combo ever! Fresh roses + honey teddy bear 🧸 #TeddyBouquet",
      likes: 1890,
      linkCategory: "teddy-bear-bouquets"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80",
      caption: "Golden Ferrero Rocher confections nestled in scarlet roses 🍫 #ChocolateBouquet",
      likes: 950,
      linkCategory: "chocolate-bouquets"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
      caption: "Royal Rajwada wedding varmala handcrafted with Thai orchids and pearls 👑 #IndianWedding",
      likes: 3100,
      linkCategory: "wedding-engagement-flowers"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
      caption: "Unboxing the Imperial Rose & Botanical Velvet Hamper 🎁 #LuxuryGifting",
      likes: 1420,
      linkCategory: "luxury-gift-hampers"
    }
  ];

  return (
    <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-alt)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-pretitle">@roshikablooms on Instagram</span>
          <h2 className="section-title">Follow Our Floral Odyssey</h2>
          <div className="floral-divider">
            <span className="floral-divider-line"></span>
            <span className="floral-divider-icon"><InstagramIcon size={18} /></span>
            <span className="floral-divider-line"></span>
          </div>
          <p className="section-subtitle">
            Tag #RoshikaBlooms to be featured in our curated floral gallery.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem'
        }}>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                aspectRatio: '1/1',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedPost(post)}
            >
              <img 
                src={post.image} 
                alt="Instagram Post" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(18, 8, 11, 0.65)',
                  opacity: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1rem',
                  color: '#FFFFFF',
                  transition: 'opacity 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                  <Heart size={16} fill="#FF4B4B" color="#FF4B4B" />
                  <span>{post.likes}</span>
                </div>
                <Eye size={18} />
              </div>
            </div>
          ))}
        </div>

        {/* Modal for Instagram Post */}
        {selectedPost && (
          <div className="drawer-backdrop open" onClick={() => setSelectedPost(null)}>
            <div 
              className="glass-panel" 
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '600px',
                width: '90%',
                margin: '80px auto',
                padding: '2rem',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--bg-surface)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className="rose-badge">
                  <InstagramIcon size={13} /> @roshikablooms
                </span>
                <button className="drawer-close-btn" onClick={() => setSelectedPost(null)}>
                  <X size={18} />
                </button>
              </div>

              <img 
                src={selectedPost.image} 
                alt="Post Preview" 
                style={{ width: '100%', borderRadius: 'var(--radius-lg)', height: '320px', objectFit: 'cover', marginBottom: '1.25rem' }} 
              />

              <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                {selectedPost.caption}
              </p>

              <button 
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => {
                  setSelectedPost(null);
                  navigateTo('category', { categorySlug: selectedPost.linkCategory });
                }}
              >
                <ShoppingBag size={16} />
                <span>Shop Similar Floral Designs</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
