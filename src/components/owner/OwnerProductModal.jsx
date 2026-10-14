import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../../context/ShopContext';
import { CATEGORIES } from '../../data/categories';
import { 
  Upload, Image as ImageIcon, Sparkles, X, Check, 
  Trash2, DollarSign, Tag, FileText, AlertCircle 
} from 'lucide-react';

export default function OwnerProductModal() {
  const { 
    isOwnerProductModalOpen, 
    closeOwnerProductModal, 
    editingProduct, 
    ownerModalDefaultCategory,
    saveOwnerProduct, 
    deleteOwnerProduct 
  } = useShop();

  const fileInputRef = useRef(null);

  // Form State
  const [name, setName] = useState('');
  const [nameHindi, setNameHindi] = useState('');
  const [category, setCategory] = useState(ownerModalDefaultCategory || 'birthday-anniversary-bouquets');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [image, setImage] = useState('');
  const [badge, setBadge] = useState('Owner Special');
  const [description, setDescription] = useState('');
  const [flowerTypesStr, setFlowerTypesStr] = useState('');
  const [dimensions, setDimensions] = useState('Height: 46cm | Width: 32cm');
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
  const [error, setError] = useState('');

  // Populate when editing
  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || '');
      setNameHindi(editingProduct.nameHindi || '');
      setCategory(editingProduct.category || 'birthday-anniversary-bouquets');
      setPrice(editingProduct.price ? String(editingProduct.price) : '');
      setOriginalPrice(editingProduct.originalPrice ? String(editingProduct.originalPrice) : '');
      setImage(editingProduct.image || '');
      setBadge(editingProduct.badge || '');
      setDescription(editingProduct.description || '');
      setFlowerTypesStr(Array.isArray(editingProduct.flowerTypes) ? editingProduct.flowerTypes.join(', ') : '');
      setDimensions(editingProduct.dimensions || 'Height: 46cm | Width: 32cm');
    } else {
      setName('');
      setNameHindi('');
      setCategory(ownerModalDefaultCategory || 'birthday-anniversary-bouquets');
      setPrice('1299');
      setOriginalPrice('1699');
      setImage('');
      setBadge('Owner Special');
      setDescription('Exquisite handcrafted velvet bouquet arranged with luxury wrapping and satin ribbon bow.');
      setFlowerTypesStr('Handcrafted Velvet Blooms, Foliage Sprigs, Satin Bow');
      setDimensions('Height: 46cm | Width: 32cm');
    }
    setError('');
  }, [editingProduct, ownerModalDefaultCategory, isOwnerProductModalOpen]);

  if (!isOwnerProductModalOpen) return null;

  // Handle local file upload (converts to Base64 data URL)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('कृपया केवल इमेज फ़ाइल (JPG, PNG, WebP) चुनें');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
      setError('');
    };
    reader.onerror = () => {
      setError('फ़ाइल पढ़ने में त्रुटि हुई। कृपया दोबारा प्रयास करें।');
    };
    reader.readAsDataURL(file);
  };

  // Pricing calculations
  const parsedPrice = parseInt(price, 10) || 0;
  const parsedOriginalPrice = parseInt(originalPrice, 10) || 0;
  const discountPercent = parsedOriginalPrice > parsedPrice && parsedPrice > 0
    ? Math.round(((parsedOriginalPrice - parsedPrice) / parsedOriginalPrice) * 100)
    : 0;

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('कृपया बुके का नाम दर्ज करें (Please enter Bouquet Name)');
      return;
    }
    if (!price || parsedPrice <= 0) {
      setError('कृपया मान्य सेलिंग प्राइस दर्ज करें (Please enter a valid Price)');
      return;
    }
    if (!image.trim()) {
      setError('कृपया बुके की तस्वीर अपलोड करें या URL डालें (Please provide Bouquet Image)');
      return;
    }

    const selectedCategoryObj = CATEGORIES.find((c) => c.slug === category);
    const categoryName = selectedCategoryObj ? selectedCategoryObj.name : 'Floral Bouquets';

    const flowerTypes = flowerTypesStr
      ? flowerTypesStr.split(',').map((s) => s.trim()).filter(Boolean)
      : ['Handcrafted Velvet Blooms'];

    const productPayload = {
      ...(editingProduct || {}),
      id: editingProduct?.id || `velvet-custom-${Date.now()}`,
      slug: editingProduct?.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      name: name.trim(),
      nameHindi: nameHindi.trim() || name.trim(),
      category,
      categoryName,
      price: parsedPrice,
      originalPrice: parsedOriginalPrice || (parsedPrice + 400),
      image,
      images: [image],
      badge: badge.trim() || 'Artisan Special',
      description: description.trim(),
      flowerTypes,
      dimensions: dimensions.trim(),
      isTrending: true,
      budgetBracket: parsedPrice < 500 ? 'under-499' : parsedPrice < 1000 ? 'under-999' : parsedPrice < 1500 ? 'under-1499' : 'under-2499'
    };

    saveOwnerProduct(productPayload);
  };

  const handleDelete = () => {
    if (editingProduct && window.confirm(`क्या आप सचमुच "${editingProduct.name}" बुके को हटाना चाहते हैं? (Delete this bouquet?)`)) {
      deleteOwnerProduct(editingProduct.id);
    }
  };

  return (
    <div className="drawer-backdrop open owner-modal-backdrop" onClick={closeOwnerProductModal}>
      <div 
        className="glass-panel owner-product-modal-card animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="owner-modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="gold-badge">
                <Sparkles size={11} /> Store Owner Studio
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-gold)', fontWeight: 600 }}>
                {editingProduct ? '• Editing Existing Bouquet' : '• Adding New Bouquet'}
              </span>
            </div>
            <h2 className="font-serif-editorial" style={{ fontSize: '1.6rem' }}>
              {editingProduct ? 'Edit Bouquet Image & Price' : 'Add New Bouquet & Set Price'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              यहाँ आप बुके की फोटो अपलोड कर सकते हैं और सेलिंग प्राइस बदल सकते हैं।
            </p>
          </div>

          <button 
            type="button"
            className="drawer-close-btn" 
            onClick={closeOwnerProductModal}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="owner-modal-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="owner-product-form">
          <div className="owner-form-grid">
            {/* Left Column: Image Upload & Live Preview */}
            <div className="owner-image-column">
              <label className="owner-field-label">
                <ImageIcon size={15} /> Bouquet Photo / बुके की तस्वीर *
              </label>

              {/* Upload Mode Switcher */}
              <div className="owner-tab-switch">
                <button
                  type="button"
                  className={`owner-tab-btn ${uploadMode === 'file' ? 'active' : ''}`}
                  onClick={() => setUploadMode('file')}
                >
                  <Upload size={13} /> Upload from Device (फ़ोन/लैपटॉप)
                </button>
                <button
                  type="button"
                  className={`owner-tab-btn ${uploadMode === 'url' ? 'active' : ''}`}
                  onClick={() => setUploadMode('url')}
                >
                  <Tag size={13} /> Or Image URL
                </button>
              </div>

              {uploadMode === 'file' ? (
                <div 
                  className="owner-file-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <div className="dropzone-content">
                    <Upload size={28} color="var(--text-gold)" style={{ marginBottom: '0.5rem' }} />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      Click to Browse & Upload Photo
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      PNG, JPG, WebP supported
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: '1rem' }}>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://... or /images/my_bouquet.jpg"
                    className="owner-input-field"
                  />
                </div>
              )}

              {/* Live Preview Card */}
              <div className="owner-live-preview-box">
                <span className="preview-label">Live Customer Card Preview:</span>
                <div className="preview-card-mockup">
                  {image ? (
                    <img src={image} alt="Bouquet Preview" className="preview-mockup-img" />
                  ) : (
                    <div className="preview-mockup-placeholder">
                      <ImageIcon size={32} color="var(--text-muted)" />
                      <span>No image selected yet</span>
                    </div>
                  )}

                  <div className="preview-mockup-details">
                    <span className="preview-cat-tag">
                      {CATEGORIES.find((c) => c.slug === category)?.name || 'Category'}
                    </span>
                    <h4 className="preview-title">{name || 'Bouquet Title Here'}</h4>
                    <div className="preview-price-row">
                      <span className="preview-price">₹{parsedPrice || 0}</span>
                      {parsedOriginalPrice > parsedPrice && (
                        <>
                          <span className="preview-old-price">₹{parsedOriginalPrice}</span>
                          <span className="preview-discount-badge">{discountPercent}% OFF</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Pricing & Product Details */}
            <div className="owner-details-column">
              {/* Pricing Section (Highlighted) */}
              <div className="owner-pricing-group-card">
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-gold)', fontSize: '0.95rem', marginBottom: '0.85rem' }}>
                  <DollarSign size={16} /> Price Settings / कीमत सेट करें *
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="owner-field-label">
                      Selling Price (₹) / बिक्री मूल्य *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span className="price-rupee-symbol">₹</span>
                      <input
                        type="number"
                        min="1"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="1399"
                        className="owner-input-field price-input"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="owner-field-label">
                      MRP / Original Price (₹)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span className="price-rupee-symbol">₹</span>
                      <input
                        type="number"
                        min="1"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        placeholder="1799"
                        className="owner-input-field price-input"
                      />
                    </div>
                  </div>
                </div>

                {discountPercent > 0 && (
                  <div style={{ marginTop: '0.65rem', fontSize: '0.82rem', color: '#16A34A', fontWeight: 600 }}>
                    ✨ Customer will see: <strong>{discountPercent}% OFF</strong> (Save ₹{parsedOriginalPrice - parsedPrice})
                  </div>
                )}
              </div>

              {/* Title & Language */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label className="owner-field-label">Bouquet Name (English) *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Royal Blue Velvet Rose Bouquet"
                    className="owner-input-field"
                    required
                  />
                </div>
                <div>
                  <label className="owner-field-label">नाम (हिन्दी)</label>
                  <input
                    type="text"
                    value={nameHindi}
                    onChange={(e) => setNameHindi(e.target.value)}
                    placeholder="e.g. रॉयल ब्लू वेलवेट रोज़ बुके"
                    className="owner-input-field"
                  />
                </div>
              </div>

              {/* Category & Badge */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label className="owner-field-label">Category / श्रेणी *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="owner-input-field"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="owner-field-label">Badge Tag (बैज)</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Bestseller, Handcrafted Velvet"
                    className="owner-input-field"
                  />
                </div>
              </div>

              {/* Description */}
              <div style={{ marginTop: '1rem' }}>
                <label className="owner-field-label">Description / विवरण</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe flowers, velvet plush texture, wrapping, ribbon..."
                  className="owner-input-field"
                />
              </div>

              {/* Flower types */}
              <div style={{ marginTop: '1rem' }}>
                <label className="owner-field-label">Included Flowers (Comma-separated)</label>
                <input
                  type="text"
                  value={flowerTypesStr}
                  onChange={(e) => setFlowerTypesStr(e.target.value)}
                  placeholder="e.g. Velvet Lilies, Red Tulips, Satin Bow"
                  className="owner-input-field"
                />
              </div>
            </div>
          </div>

          {/* Modal Actions Footer */}
          <div className="owner-modal-footer">
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {editingProduct && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm owner-delete-btn"
                  onClick={handleDelete}
                  title="Remove this bouquet from catalog"
                >
                  <Trash2 size={15} /> Delete Bouquet
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-outline btn-md"
                onClick={closeOwnerProductModal}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-gold btn-md"
              >
                <Check size={16} /> {editingProduct ? 'Save Changes / सेव करें' : 'Publish Bouquet / पब्लिश करें'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
