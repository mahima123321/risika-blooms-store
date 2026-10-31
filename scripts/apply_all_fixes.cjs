const fs = require('fs');
const path = require('path');

console.log('🌸 Starting complete fixes script...');

// ==========================================
// 1. UPDATE ShopContext.jsx
// ==========================================
const shopContextPath = path.join(__dirname, '../src/context/ShopContext.jsx');
let shopContextContent = fs.readFileSync(shopContextPath, 'utf8');

// A. Replace categories useState with auto-healing logic
const oldCatStateRegex = /\/\/ Live reactive categories catalog \(synced with localStorage\)[\s\S]*?const \[categories, setCategories\] = useState\(\(\) => \{[\s\S]*?return \[\.\.\.INITIAL_CATEGORIES\];\s*\}\);/;

const newCatState = `// Live reactive categories catalog (synced with localStorage)
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('rb_custom_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Auto-heal parsed categories with full details from INITIAL_CATEGORIES
          const healed = parsed.map((pCat) => {
            const defaultMatch = INITIAL_CATEGORIES.find((c) => c.id === pCat.id || c.slug === pCat.slug || c.name === pCat.name);
            return {
              ...(defaultMatch || {}),
              ...pCat,
              name: pCat.name || defaultMatch?.name || 'Luxury Floral Collection',
              nameHindi: pCat.nameHindi || defaultMatch?.nameHindi || '',
              slug: pCat.slug || defaultMatch?.slug || pCat.id || 'floral-collection',
              id: pCat.id || defaultMatch?.id || pCat.slug || 'floral-collection',
              image: pCat.image || defaultMatch?.image || '/images/red_roses_luxury_bouquet.jpg',
              bannerImage: pCat.bannerImage || defaultMatch?.bannerImage || pCat.image || '/images/red_roses_luxury_bouquet.jpg',
              description: pCat.description || defaultMatch?.description || 'Curated luxury collection of handcrafted blooms.'
            };
          });
          const customSlugs = new Set(healed.map((c) => c.slug || c.id));
          const initialMissing = INITIAL_CATEGORIES.filter((c) => !customSlugs.has(c.slug || c.id));
          return [...healed, ...initialMissing];
        }
      }
    } catch (e) {
      console.warn('Error reading stored categories:', e);
    }
    return [...INITIAL_CATEGORIES];
  });`;

if (oldCatStateRegex.test(shopContextContent)) {
  shopContextContent = shopContextContent.replace(oldCatStateRegex, newCatState);
  console.log('✅ ShopContext categories useState healed.');
} else {
  console.warn('⚠️ Could not match old categories useState via regex, trying string match.');
}

// B. Add resetCategoriesToDefault function if not present
if (!shopContextContent.includes('resetCategoriesToDefault')) {
  const insertTarget = 'const deleteOwnerCategory = (categoryId) => {';
  const resetFnCode = `  const resetCategoriesToDefault = () => {
    setCategories([...INITIAL_CATEGORIES]);
    try {
      localStorage.removeItem('rb_custom_categories');
      localStorage.setItem('rb_custom_categories', JSON.stringify(INITIAL_CATEGORIES));
    } catch (e) {
      console.warn('Error resetting categories:', e);
    }
    showToast('✨ Restored all 14 official category collections!');
  };

  `;
  shopContextContent = shopContextContent.replace(insertTarget, resetFnCode + insertTarget);
  console.log('✅ Added resetCategoriesToDefault function to ShopContext.');
}

// C. Expose resetCategoriesToDefault in context provider
if (!shopContextContent.includes('resetCategoriesToDefault,')) {
  shopContextContent = shopContextContent.replace(
    'deleteOwnerCategory,',
    'deleteOwnerCategory,\n        resetCategoriesToDefault,'
  );
  console.log('✅ Exposed resetCategoriesToDefault in ShopContext Provider.');
}

fs.writeFileSync(shopContextPath, shopContextContent, 'utf8');


// ==========================================
// 2. UPDATE OwnerSettingsModal.jsx
// ==========================================
const ownerSettingsPath = path.join(__dirname, '../src/components/owner/OwnerSettingsModal.jsx');
let ownerSettingsContent = fs.readFileSync(ownerSettingsPath, 'utf8');

// Ensure resetCategoriesToDefault is destructured from useShop()
if (!ownerSettingsContent.includes('resetCategoriesToDefault')) {
  ownerSettingsContent = ownerSettingsContent.replace(
    'deleteOwnerCategory,',
    'deleteOwnerCategory,\n    resetCategoriesToDefault,'
  );
  console.log('✅ Destructured resetCategoriesToDefault in OwnerSettingsModal.');
}

// Fix Category tab header button row (add Reset button)
const oldCreateBtnRegex = /\{!isCategoryFormOpen \? \([\s\S]*?<button[\s\S]*?handleOpenNewCategory[\s\S]*?Create Collection[\s\S]*?<\/button>[\s\S]*?\) : \(/;
const newCreateBtnBlock = `{!isCategoryFormOpen ? (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      if (window.confirm('Restore all 14 official store collections (Birthday, Wedding, Velvet, etc.)?')) {
                        resetCategoriesToDefault();
                      }
                    }}
                    title="Restore all 14 official collections"
                  >
                    <RotateCcw size={13} />
                    <span>Reset 14 Collections</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-gold btn-sm"
                    onClick={handleOpenNewCategory}
                  >
                    <Plus size={14} />
                    <span>Create Collection</span>
                  </button>
                </div>
              ) : (`;

if (oldCreateBtnRegex.test(ownerSettingsContent)) {
  ownerSettingsContent = ownerSettingsContent.replace(oldCreateBtnRegex, newCreateBtnBlock);
  console.log('✅ Added Reset 14 Collections button to OwnerSettingsModal header.');
}

// Fix category listing loop with robust name and count calculation
const oldCatMapRegex = /filteredCategories\.map\(\(cat, idx\) => \{[\s\S]*?const bouquetCount = products\.filter[\s\S]*?return \([\s\S]*?<div key=\{cat\.id \|\| cat\.slug \|\| idx\} className="owner-category-item-card">[\s\S]*?<\/div>\s*\);\s*\}\)/;

const newCatMapBlock = `filteredCategories.map((cat, idx) => {
                  const bouquetCount = products.filter((p) => {
                    if (!p) return false;
                    const pCat = String(p.category || '').toLowerCase().trim();
                    const cSlug = String(cat.slug || '').toLowerCase().trim();
                    const cId = String(cat.id || '').toLowerCase().trim();
                    const cName = String(cat.name || '').toLowerCase().trim();
                    return (
                      (cSlug && (pCat === cSlug || pCat.includes(cSlug) || cSlug.includes(pCat))) ||
                      (cId && (pCat === cId || pCat.includes(cId) || cId.includes(pCat))) ||
                      (cName && (pCat === cName || pCat.includes(cName) || cName.includes(pCat)))
                    );
                  }).length;

                  const displayName = cat.name || cat.title || cat.heading || cat.categoryName || 'Exclusive Floral Collection';
                  const cleanEn = displayName.toLowerCase().replace(/[^a-z0-9]/g, '');
                  const cleanHi = (cat.nameHindi || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                  const isDuplicateSubtitle = !cat.nameHindi || (cleanHi && cleanEn && cleanHi === cleanEn);

                  return (
                    <div key={cat.id || cat.slug || idx} className="owner-category-item-card">
                      <div className="owner-category-top-row">
                        <img 
                          src={cat.image || cat.bannerImage || '/images/red_roses_luxury_bouquet.jpg'} 
                          alt={displayName} 
                          className="owner-category-thumb"
                          onError={(e) => { e.target.src = '/images/red_roses_luxury_bouquet.jpg'; }}
                        />

                        <div className="owner-category-details">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                            <span className="owner-live-count-badge">
                              🌸 {bouquetCount} {bouquetCount === 1 ? 'Bouquet' : 'Bouquets'} Live
                            </span>
                            <span className="owner-status-pill-active">
                              ● Live on Website
                            </span>
                          </div>

                          <h4 className="owner-category-title">
                            {displayName}
                          </h4>

                          {!isDuplicateSubtitle && cat.nameHindi && (
                            <div className="owner-category-subtitle">
                              {cat.nameHindi}
                            </div>
                          )}

                          {(cat.tagline || cat.description) && (
                            <p className="owner-category-desc">
                              {cat.tagline || cat.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="owner-category-bottom-row">
                        <button
                          type="button"
                          className="btn btn-gold btn-sm owner-add-bouquet-btn"
                          onClick={() => {
                            closeOwnerSettingsModal();
                            openAddProductModal(cat.slug || cat.id);
                          }}
                          title={\`Add new bouquet under \${displayName}\`}
                        >
                          <Plus size={13} />
                          <span>Add Bouquet</span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline btn-sm owner-edit-btn"
                          onClick={() => handleEditCategory(cat)}
                          title="Edit this collection"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline btn-sm owner-delete-btn"
                          onClick={() => {
                            if (window.confirm(\`Are you sure you want to delete the "\${displayName}" category collection?\`)) {
                              deleteOwnerCategory(cat.id || cat.slug);
                            }
                          }}
                          title="Delete Collection"
                        >
                          <Trash2 size={13} color="#EF4444" />
                        </button>
                      </div>
                    </div>
                  );
                })`;

if (oldCatMapRegex.test(ownerSettingsContent)) {
  ownerSettingsContent = ownerSettingsContent.replace(oldCatMapRegex, newCatMapBlock);
  console.log('✅ Replaced category listing loop in OwnerSettingsModal with robust calculation & styling.');
} else {
  console.warn('⚠️ Could not match oldCatMapRegex in OwnerSettingsModal.');
}

fs.writeFileSync(ownerSettingsPath, ownerSettingsContent, 'utf8');


// ==========================================
// 3. UPDATE App.css with Luxury Styling
// ==========================================
const appCssPath = path.join(__dirname, '../src/App.css');
let appCssContent = fs.readFileSync(appCssPath, 'utf8');

const luxuryCssRules = `
/* ==========================================================================
   ENHANCED OWNER STUDIO & MOBILE LUXURY CARD STYLES
   ========================================================================== */
.owner-category-item-card {
  display: flex !important;
  flex-direction: column !important;
  gap: 0.85rem !important;
  padding: 1.15rem 1.25rem !important;
  border-radius: var(--radius-lg, 18px) !important;
  background: var(--bg-surface, #ffffff) !important;
  border: 1.5px solid var(--border-subtle, rgba(212, 175, 55, 0.25)) !important;
  transition: all 0.25s ease !important;
  box-sizing: border-box !important;
  width: 100% !important;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05) !important;
}

.owner-category-item-card:hover {
  border-color: var(--border-gold, #D4AF37) !important;
  box-shadow: 0 8px 24px rgba(212, 175, 55, 0.16) !important;
  transform: translateY(-2px);
}

.owner-category-top-row {
  display: flex !important;
  align-items: flex-start !important;
  gap: 1rem !important;
  width: 100% !important;
}

.owner-category-thumb {
  width: 68px !important;
  height: 68px !important;
  border-radius: 14px !important;
  object-fit: cover !important;
  border: 1.5px solid var(--border-gold, #D4AF37) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  flex-shrink: 0 !important;
  background: #f8f5f0 !important;
}

.owner-category-details {
  flex: 1 !important;
  min-width: 0 !important;
}

.owner-category-title {
  font-family: var(--font-serif-editorial, "Playfair Display", serif) !important;
  font-size: 1.12rem !important;
  font-weight: 700 !important;
  color: var(--text-primary, #1A1A1A) !important;
  margin: 0.2rem 0 !important;
  line-height: 1.3 !important;
  word-break: break-word !important;
}

.owner-category-subtitle {
  font-size: 0.82rem !important;
  color: var(--text-gold, #B88E22) !important;
  font-weight: 600 !important;
  margin-bottom: 0.25rem !important;
}

.owner-category-desc {
  font-size: 0.78rem !important;
  color: var(--text-muted, #71717A) !important;
  margin: 0.2rem 0 0 0 !important;
  line-height: 1.45 !important;
}

.owner-category-bottom-row {
  display: flex !important;
  align-items: center !important;
  gap: 0.6rem !important;
  width: 100% !important;
  padding-top: 0.75rem !important;
  border-top: 1px dashed var(--border-subtle, rgba(0, 0, 0, 0.1)) !important;
  box-sizing: border-box !important;
}

/* Mobile Responsiveness for Owner Studio & Modals */
@media (max-width: 768px) {
  .owner-product-modal-card {
    padding: 1.25rem 1rem !important;
    width: 96% !important;
    max-height: 94dvh !important;
    border-radius: var(--radius-lg, 18px) !important;
  }
  .owner-form-grid {
    grid-template-columns: 1fr !important;
    gap: 1.25rem !important;
  }
  .owner-category-item-card {
    padding: 0.95rem 1rem !important;
  }
  .owner-category-thumb {
    width: 58px !important;
    height: 58px !important;
    border-radius: 10px !important;
  }
  .owner-category-title {
    font-size: 1rem !important;
  }
  .owner-input-field {
    font-size: 16px !important; /* Prevents auto-zoom on mobile Safari */
  }
}
`;

if (!appCssContent.includes('ENHANCED OWNER STUDIO & MOBILE LUXURY CARD STYLES')) {
  appCssContent += '\n' + luxuryCssRules;
  fs.writeFileSync(appCssPath, appCssContent, 'utf8');
  console.log('✅ Appended luxury styling and mobile responsiveness to App.css.');
}

console.log('🎉 All fixes applied successfully!');

