import React from 'react';
import { useShop } from '../../context/ShopContext';
import { CATEGORIES } from '../../data/categories';
import { Sparkles, Gift } from 'lucide-react';

export default function CategoryQuickStrip() {
  const { language, navigateTo, categories } = useShop();
  const allCategories = categories || CATEGORIES;

  // Curated list for the quick-scroll strip
  const quickItems = [
    {
      id: 'custom-builder',
      name: 'Custom',
      isBuilder: true,
      image: '/images/velvet_noir_lilies_tulips.jpg',
      badge: '✨ NEW'
    },
    ...allCategories.slice(0, 10).map(c => ({
      id: c.id || c.slug,
      name: (c.name || '').split(' ')[0], // short title: "Rose", "Mixed", "Korean", "Teddy"
      fullName: c.name,
      slug: c.slug,
      image: c.image || '/images/red_roses_luxury_bouquet.jpg'
    }))
  ];

  return (
    <div className="category-quick-strip-wrapper">
      <div className="container" style={{ padding: '0 0.5rem', overflow: 'hidden', maxWidth: '100%' }}>
        <div className="category-quick-strip">
          {quickItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="quick-strip-item"
              onClick={() => {
                if (item.isBuilder) {
                  navigateTo('build-bouquet');
                } else {
                  navigateTo('category', { categorySlug: item.slug });
                }
              }}
            >
              <div className={`quick-strip-circle ${item.isBuilder ? 'quick-strip-circle-gold' : ''}`}>
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="quick-strip-img" 
                  loading="lazy" 
                />
                {item.badge && (
                  <span className="quick-strip-badge">{item.badge}</span>
                )}
              </div>
              <span className="quick-strip-label">
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
