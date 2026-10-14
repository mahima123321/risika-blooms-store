import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { CATEGORIES } from '../../data/categories';
import { createWhatsAppUrl } from '../../config/whatsapp';
import { 
  X, Phone, MessageCircle, Mail, MapPin, Clock, 
  Sparkles, Shield, Lock, Eye, EyeOff, Save, RotateCcw, 
  DollarSign, Truck, AlertCircle, CheckCircle2, Search, 
  Edit3, Trash2, Plus, Bell, Store, CreditCard
} from 'lucide-react';

export default function OwnerSettingsModal() {
  const {
    isOwnerSettingsModalOpen,
    closeOwnerSettingsModal,
    ownerSettingsActiveTab,
    setOwnerSettingsActiveTab,
    brandConfig,
    updateBrandConfig,
    resetBrandConfig,
    products,
    openAddProductModal,
    openEditProductModal,
    deleteOwnerProduct,
    ownerPin,
    changeOwnerPin,
    resetOwnerPinToDefault,
    showToast
  } = useShop();

  const [activeTab, setActiveTab] = useState(ownerSettingsActiveTab || 'numbers');

  // Form states - Contact & WhatsApp
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [upiId, setUpiId] = useState('');

  // Form states - Store details
  const [storeName, setStoreName] = useState('');
  const [tagline, setTagline] = useState('');
  const [taglineHindi, setTaglineHindi] = useState('');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState('');

  // Form states - Announcements & Delivery
  const [announcementEn, setAnnouncementEn] = useState('');
  const [announcementHi, setAnnouncementHi] = useState('');
  const [freeThreshold, setFreeThreshold] = useState('999');
  const [standardFee, setStandardFee] = useState('99');
  const [midnightFee, setMidnightFee] = useState('199');

  // Form states - Security PIN
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [pinError, setPinError] = useState('');

  // Catalog search & filter in manager tab
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('all');

  // Populate from active brandConfig when opened
  useEffect(() => {
    if (brandConfig) {
      setWhatsappNumber(brandConfig.whatsappNumber || '919876543210');
      setPhone(brandConfig.phone || '+91 98765 43210');
      setEmail(brandConfig.email || 'care@risikablooms.com');
      setUpiId(brandConfig.upiId || 'risikablooms@upi');

      setStoreName(brandConfig.name || 'RISIKA BLOOMS');
      setTagline(brandConfig.tagline || 'Every Bloom Tells a Story.');
      setTaglineHindi(brandConfig.taglineHindi || 'हर फूल सुनाए एक अनूठी कहानी।');
      setAddress(brandConfig.address || '');
      setHours(brandConfig.hours || '');

      setAnnouncementEn(brandConfig.announcementEn || '✨ Free Luxury Greeting Card & Same-Day Delivery on orders above ₹999! Order before 7 PM.');
      setAnnouncementHi(brandConfig.announcementHi || '✨ ₹999 से अधिक के ऑर्डर पर मुफ्त लक्ज़री ग्रीटिंग कार्ड और उसी दिन डिलीवरी! शाम 7 बजे से पहले ऑर्डर करें।');

      setFreeThreshold(String(brandConfig.delivery?.freeThreshold ?? 999));
      setStandardFee(String(brandConfig.delivery?.standardFee ?? 99));
      setMidnightFee(String(brandConfig.delivery?.midnightFee ?? 199));
    }
  }, [brandConfig, isOwnerSettingsModalOpen]);

  useEffect(() => {
    if (ownerSettingsActiveTab) {
      setActiveTab(ownerSettingsActiveTab);
    }
  }, [ownerSettingsActiveTab]);

  if (!isOwnerSettingsModalOpen) return null;

  // Save Contact & WhatsApp
  const handleSaveContact = (e) => {
    e.preventDefault();
    const cleanWa = whatsappNumber.replace(/[^0-9]/g, '');
    if (!cleanWa || cleanWa.length < 10) {
      showToast('कृपया मान्य 10-12 अंकों का व्हाट्सएप नंबर डालें', 'error');
      return;
    }
    updateBrandConfig({
      whatsappNumber: cleanWa,
      phone: phone.trim(),
      email: email.trim(),
      upiId: upiId.trim()
    });
  };

  // Save Store Details
  const handleSaveStore = (e) => {
    e.preventDefault();
    updateBrandConfig({
      name: storeName.trim() || 'RISIKA BLOOMS',
      tagline: tagline.trim(),
      taglineHindi: taglineHindi.trim(),
      address: address.trim(),
      hours: hours.trim()
    });
  };

  // Save Announcements & Delivery
  const handleSaveAnnouncements = (e) => {
    e.preventDefault();
    updateBrandConfig({
      announcementEn: announcementEn.trim(),
      announcementHi: announcementHi.trim(),
      delivery: {
        freeThreshold: parseInt(freeThreshold, 10) || 999,
        standardFee: parseInt(standardFee, 10) || 99,
        midnightFee: parseInt(midnightFee, 10) || 199,
        sameDayCutoffHour: 19
      }
    });
  };

  // Change PIN
  const handlePinChangeSubmit = (e) => {
    e.preventDefault();
    setPinError('');

    if (newPin !== confirmPin) {
      setPinError('नया पिन और पुष्टि पिन मेल नहीं खाते (New PIN and confirmation do not match)');
      return;
    }
    if (newPin.length < 4) {
      setPinError('पिन कम से कम 4 अक्षरों का होना चाहिए (Minimum 4 digits/characters)');
      return;
    }

    const res = changeOwnerPin(currentPin, newPin);
    if (!res.success) {
      setPinError(res.error);
    } else {
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    }
  };

  // Test WhatsApp Link
  const handleTestWhatsApp = () => {
    const cleanWa = whatsappNumber.replace(/[^0-9]/g, '');
    const url = createWhatsAppUrl('Hello! This is a test message from RISIKA BLOOMS Owner Studio.', cleanWa);
    window.open(url, '_blank');
  };

  // Filter products for Catalog Manager
  const filteredCatalog = products.filter((p) => {
    if (catalogCategory !== 'all' && p.category !== catalogCategory) return false;
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchNameHi = (p.nameHindi || '').toLowerCase().includes(q);
      const matchCat = (p.categoryName || '').toLowerCase().includes(q);
      return matchName || matchNameHi || matchCat;
    }
    return true;
  });

  return (
    <div className="drawer-backdrop open owner-modal-backdrop" onClick={closeOwnerSettingsModal}>
      <div 
        className="glass-panel owner-settings-modal-card animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="owner-modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="gold-badge">
                <Shield size={11} /> 👑 Owner Control Center
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-gold)', fontWeight: 600 }}>
                • Authorized Store Administration
              </span>
            </div>
            <h2 className="font-serif-editorial" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
              Store Settings & Website Management (ओनर सेटिंग्स)
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              यहाँ आप व्हाट्सएप नंबर, फोन नंबर, दुकान का पता, बुके कैटलॉग, डिलीवरी फीस व पासवर्ड बदल सकते हैं।
            </p>
          </div>

          <button 
            type="button" 
            className="drawer-close-btn" 
            onClick={closeOwnerSettingsModal}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="owner-settings-tabs">
          <button
            type="button"
            className={`owner-settings-tab ${activeTab === 'numbers' ? 'active' : ''}`}
            onClick={() => setActiveTab('numbers')}
          >
            <MessageCircle size={15} />
            <span>फ़ोन व WhatsApp नंबर</span>
          </button>

          <button
            type="button"
            className={`owner-settings-tab ${activeTab === 'store' ? 'active' : ''}`}
            onClick={() => setActiveTab('store')}
          >
            <Store size={15} />
            <span>दुकान व पता</span>
          </button>

          <button
            type="button"
            className={`owner-settings-tab ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => setActiveTab('announcements')}
          >
            <Bell size={15} />
            <span>ऑफर व डिलीवरी फीस</span>
          </button>

          <button
            type="button"
            className={`owner-settings-tab ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            <Sparkles size={15} />
            <span>बुके कैटलॉग ({products.length})</span>
          </button>

          <button
            type="button"
            className={`owner-settings-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Lock size={15} />
            <span>सुरक्षा पिन / पासवर्ड</span>
          </button>
        </div>

        {/* Tab 1: Phone & WhatsApp Numbers */}
        {activeTab === 'numbers' && (
          <form onSubmit={handleSaveContact} className="owner-tab-content animate-fade-in">
            <div className="owner-section-intro">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                📞 WhatsApp व कॉलिंग नंबर बदलें (Change Contact & WhatsApp Numbers)
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                ग्राहक जब भी वेबसाइट पर "Order on WhatsApp", "Checkout via WhatsApp" या फ़्लोटिंग व्हाट्सएप बटन पर क्लिक करेंगे, वे सीधे इस नंबर पर चैट करेंगे।
              </p>
            </div>

            <div className="owner-form-grid-2">
              <div className="form-group">
                <label className="owner-field-label">
                  <MessageCircle size={15} color="#25D366" /> WhatsApp Business Number (ऑर्डर रिसीव करने का नंबर) *
                </label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="e.g. 919876543210 (Country code + 10 digit number)"
                  className="owner-input-field"
                  required
                />
                <span className="owner-field-hint">
                  सुझाव: बिना '+' के कंट्री कोड के साथ लिखें (जैसे: 919876543210)
                </span>
              </div>

              <div className="form-group">
                <label className="owner-field-label">
                  <Phone size={15} color="var(--text-gold)" /> Calling Phone Number (कॉलिंग फोन नंबर)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="owner-input-field"
                />
                <span className="owner-field-hint">
                  यह नंबर वेबसाइट के हैडर, फुटर व Contact Page पर दिखेगा
                </span>
              </div>

              <div className="form-group">
                <label className="owner-field-label">
                  <Mail size={15} color="var(--text-gold)" /> Customer Support Email (ईमेल)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="care@risikablooms.com"
                  className="owner-input-field"
                />
              </div>

              <div className="form-group">
                <label className="owner-field-label">
                  <CreditCard size={15} color="var(--text-gold)" /> UPI Payment ID (GooglePay / PhonePe / Paytm)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. 9876543210@paytm or risikablooms@upi"
                  className="owner-input-field"
                />
                <span className="owner-field-hint">
                  ग्राहक को ऑनलाइन बिलिंग में आपका UPI ID दिखाया जाएगा
                </span>
              </div>
            </div>

            {/* Live WhatsApp Test Box */}
            <div className="owner-preview-callout">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#25D366', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <CheckCircle2 size={16} /> Current Active WhatsApp Link:
                  </span>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                    https://wa.me/{whatsappNumber.replace(/[^0-9]/g, '') || '919876543210'}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-whatsapp btn-sm"
                  onClick={handleTestWhatsApp}
                  title="Click to verify WhatsApp opens on this number"
                >
                  <MessageCircle size={14} />
                  <span>Test WhatsApp Link (जाँचें)</span>
                </button>
              </div>
            </div>

            <div className="owner-modal-footer">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setWhatsappNumber('919876543210');
                  setPhone('+91 98765 43210');
                }}
              >
                Reset Default Number
              </button>
              <button type="submit" className="btn btn-gold btn-md">
                <Save size={15} /> Save Contact & Number (नंबर सेव करें)
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Store Details & Address */}
        {activeTab === 'store' && (
          <form onSubmit={handleSaveStore} className="owner-tab-content animate-fade-in">
            <div className="owner-section-intro">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                🏪 दुकान की जानकारी व पता (Boutique Name & Location)
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                अपनी दुकान का नाम, स्लोगन, पता और काम के घंटे यहाँ बदलें।
              </p>
            </div>

            <div className="owner-form-grid-2">
              <div className="form-group">
                <label className="owner-field-label">Store / Brand Name (दुकान का नाम) *</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="RISIKA BLOOMS"
                  className="owner-input-field"
                  required
                />
              </div>

              <div className="form-group">
                <label className="owner-field-label">Tagline (English)</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Every Bloom Tells a Story."
                  className="owner-input-field"
                />
              </div>

              <div className="form-group">
                <label className="owner-field-label">स्लोगन (हिन्दी)</label>
                <input
                  type="text"
                  value={taglineHindi}
                  onChange={(e) => setTaglineHindi(e.target.value)}
                  placeholder="हर फूल सुनाए एक अनूठी कहानी।"
                  className="owner-input-field"
                />
              </div>

              <div className="form-group">
                <label className="owner-field-label">Working Hours & Delivery Slots (समय)</label>
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="Mon - Sun: 7:00 AM - 11:30 PM (Midnight Delivery Available)"
                  className="owner-input-field"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="owner-field-label">
                <MapPin size={15} color="var(--text-gold)" /> Flagship Boutique / Atelier Address (दुकान का पूरा पता)
              </label>
              <textarea
                rows="2"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Plot 42, Lotus Boulevard, Vasant Kunj, New Delhi - 110070"
                className="owner-input-field"
              />
            </div>

            <div className="owner-modal-footer">
              <button type="button" className="btn btn-outline btn-sm" onClick={resetBrandConfig}>
                <RotateCcw size={14} /> Restore All Defaults
              </button>
              <button type="submit" className="btn btn-gold btn-md">
                <Save size={15} /> Save Store Details (दुकान जानकारी सेव करें)
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Announcements & Offers */}
        {activeTab === 'announcements' && (
          <form onSubmit={handleSaveAnnouncements} className="owner-tab-content animate-fade-in">
            <div className="owner-section-intro">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                📢 बैनर संदेश व डिलीवरी शुल्क (Announcements & Delivery Fees)
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                वेबसाइट के टॉप बैनर पर चलने वाला ऑफर संदेश और डिलीवरी चार्ज यहाँ नियंत्रित करें।
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="owner-field-label">Top Announcement Bar Text (English)</label>
              <input
                type="text"
                value={announcementEn}
                onChange={(e) => setAnnouncementEn(e.target.value)}
                placeholder="✨ Free Luxury Greeting Card & Same-Day Delivery on orders above ₹999!"
                className="owner-input-field"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="owner-field-label">टॉप बैनर संदेश (हिन्दी)</label>
              <input
                type="text"
                value={announcementHi}
                onChange={(e) => setAnnouncementHi(e.target.value)}
                placeholder="✨ ₹999 से अधिक के ऑर्डर पर मुफ्त लक्ज़री ग्रीटिंग कार्ड और उसी दिन डिलीवरी!"
                className="owner-input-field"
              />
            </div>

            <div className="owner-form-grid-3">
              <div className="form-group">
                <label className="owner-field-label">
                  <Truck size={14} color="var(--text-gold)" /> Free Delivery Above (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={freeThreshold}
                  onChange={(e) => setFreeThreshold(e.target.value)}
                  placeholder="999"
                  className="owner-input-field"
                />
                <span className="owner-field-hint">इस अमाउंट से ज्यादा पर डिलीवरी फ्री होगी</span>
              </div>

              <div className="form-group">
                <label className="owner-field-label">
                  <DollarSign size={14} color="var(--text-gold)" /> Standard Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={standardFee}
                  onChange={(e) => setStandardFee(e.target.value)}
                  placeholder="99"
                  className="owner-input-field"
                />
                <span className="owner-field-hint">सामान्य डिलीवरी चार्ज</span>
              </div>

              <div className="form-group">
                <label className="owner-field-label">
                  <Clock size={14} color="var(--text-gold)" /> Midnight Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={midnightFee}
                  onChange={(e) => setMidnightFee(e.target.value)}
                  placeholder="199"
                  className="owner-input-field"
                />
                <span className="owner-field-hint">मध्यरात्रि सरप्राइज़ शुल्क</span>
              </div>
            </div>

            <div className="owner-modal-footer">
              <button type="submit" className="btn btn-gold btn-md">
                <Save size={15} /> Save Offers & Fees (शुल्क सेव करें)
              </button>
            </div>
          </form>
        )}

        {/* Tab 4: All Bouquets Catalog Manager */}
        {activeTab === 'catalog' && (
          <div className="owner-tab-content animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                  💐 बुके कैटलॉग मैनेजर ({products.length} Bouquets Live)
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  यहाँ से आप किसी भी बुके की तस्वीर, कीमत एडिट या नया बुके जोड़ सकते हैं।
                </p>
              </div>

              <button
                type="button"
                className="btn btn-gold btn-sm"
                onClick={() => {
                  closeOwnerSettingsModal();
                  openAddProductModal();
                }}
              >
                <Plus size={15} />
                <span>Add New Bouquet (नया बुके डालें)</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Search bouquet by name..."
                  className="owner-input-field"
                  style={{ paddingLeft: '32px' }}
                />
              </div>

              <select
                value={catalogCategory}
                onChange={(e) => setCatalogCategory(e.target.value)}
                className="owner-input-field"
                style={{ width: 'auto', minWidth: '180px' }}
              >
                <option value="all">All Categories (सभी)</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Products Table/List */}
            <div className="owner-catalog-scroll-list">
              {filteredCatalog.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  कोई बुके नहीं मिला (No bouquets matched your search)
                </div>
              ) : (
                filteredCatalog.map((product) => (
                  <div key={product.id} className="owner-catalog-item-card">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="owner-catalog-thumb"
                      onError={(e) => { e.target.src = '/images/bday_royal_blue_tulip_lily_card.jpg'; }}
                    />

                    <div className="owner-catalog-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span className="owner-cat-badge">{product.categoryName}</span>
                        {product.badge && <span className="rose-badge" style={{ fontSize: '0.7rem', padding: '2px 7px' }}>{product.badge}</span>}
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {product.name}
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {product.nameHindi || ''}
                      </span>
                    </div>

                    <div className="owner-catalog-pricing">
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        ₹{product.price}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>

                    <div className="owner-catalog-actions">
                      <button
                        type="button"
                        className="btn btn-gold btn-sm"
                        onClick={() => {
                          closeOwnerSettingsModal();
                          openEditProductModal(product);
                        }}
                        title="Edit Photo, Price & Details"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline btn-sm owner-delete-icon-btn"
                        onClick={() => {
                          if (window.confirm(`Delete "${product.name}" from live catalog?`)) {
                            deleteOwnerProduct(product.id);
                          }
                        }}
                        title="Delete Bouquet"
                      >
                        <Trash2 size={13} color="#E53E3E" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Security PIN Settings */}
        {activeTab === 'security' && (
          <form onSubmit={handlePinChangeSubmit} className="owner-tab-content animate-fade-in">
            <div className="owner-section-intro">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                🔒 Owner Security PIN / पासवर्ड बदलें (Change Owner PIN)
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                अपनी वेबसाइट को सुरक्षित रखने के लिए डिफ़ॉल्ट पिन (<code>risika2026</code>) को बदलकर अपना गुप्त पासवर्ड या फोन नंबर रख सकते हैं।
              </p>
            </div>

            {pinError && (
              <div className="owner-modal-error-banner">
                <AlertCircle size={16} />
                <span>{pinError}</span>
              </div>
            )}

            <div style={{ maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="owner-field-label">Current Owner PIN (वर्तमान पिन) *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPins ? 'text' : 'password'}
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    placeholder="Enter current PIN"
                    className="owner-input-field"
                    required
                  />
                  <button
                    type="button"
                    className="owner-pin-toggle"
                    onClick={() => setShowPins(!showPins)}
                  >
                    {showPins ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="owner-field-label">New Secret PIN (नया गुप्त पिन) *</label>
                <input
                  type={showPins ? 'text' : 'password'}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Min. 4 characters (e.g. 9876 or myflower26)"
                  className="owner-input-field"
                  required
                />
              </div>

              <div className="form-group">
                <label className="owner-field-label">Confirm New PIN (नये पिन की पुष्टि करें) *</label>
                <input
                  type={showPins ? 'text' : 'password'}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Re-enter new PIN"
                  className="owner-input-field"
                  required
                />
              </div>

              <div className="owner-pin-hint-box">
                <Shield size={16} color="var(--text-gold)" style={{ flexShrink: 0 }} />
                <span>
                  Current Active PIN: <strong>{ownerPin === 'risika2026' ? 'risika2026 (Default)' : '•••••••• (Custom)'}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    if (window.confirm('Reset PIN back to default risika2026?')) {
                      resetOwnerPinToDefault();
                    }
                  }}
                >
                  Reset Default PIN
                </button>

                <button type="submit" className="btn btn-gold btn-md" style={{ flex: 1 }}>
                  <Lock size={15} /> Update Security PIN
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
