import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../../context/ShopContext';
import { CATEGORIES } from '../../data/categories';
import { createWhatsAppUrl } from '../../config/whatsapp';
import { 
  X, Phone, MessageCircle, Mail, MapPin, Clock, 
  Sparkles, Shield, Lock, Eye, EyeOff, Save, RotateCcw, 
  DollarSign, Truck, AlertCircle, CheckCircle2, Search, 
  Edit3, Trash2, Plus, Bell, Store, CreditCard, Send, 
  RefreshCw, Inbox, FolderPlus, Upload, Camera, Image as ImageIcon,
  Cloud, Database, Wifi, WifiOff
} from 'lucide-react';
import { 
  sendTestVerificationEmail, 
  getStoredVerifiedMessages, 
  DEFAULT_VERIFICATION_EMAIL 
} from '../../services/emailService';
import { compressImageFile } from '../../utils/imageCompressor';

const CATEGORY_PRESETS = [
  {
    name: 'Royal Marriage & Wedding Specials',
    nameHindi: 'Royal Wedding & Bridal Special',
    tagline: 'Bridal bouquets, wedding stage florals & varmala collections',
    description: 'Bespoke grand floral arrangements handcrafted for fairytale weddings, bridal entries, and reception stage centerpieces.',
    image: '/images/red_roses_luxury_bouquet.jpg'
  },
  {
    name: 'Grand Birthday Celebrations',
    nameHindi: 'Grand Birthday Special',
    tagline: 'Vibrant Dutch blooms, balloon combos & celebration boxes',
    description: 'Spectacular handcrafted celebratory bouquets, greeting card messages, and joyful floral hampers to make birthdays magical.',
    image: '/images/bday_royal_blue_tulip_lily_card.jpg'
  },
  {
    name: 'Anniversary & Romantic Love',
    nameHindi: 'Anniversary & Romance Special',
    tagline: 'Velvet Dutch scarlet roses & luxury gold foil greeting cards',
    description: 'Pure romantic indulgence with velvety scarlet roses, heart-shaped arrangements, and gold-foiled luxury keepsake cards.',
    image: '/images/red_roses_macro_dew.jpg'
  },
  {
    name: 'Puja, Mandir & Auspicious Blooms',
    nameHindi: 'Festive & Celebration Special',
    tagline: 'Fresh fragrant marigold jhalars & temple flower offerings',
    description: 'Sacred fresh blossoms for home temples, festive pujas, Diwali, and auspicious Indian ceremonies.',
    image: '/images/golden_opulence_money_bouquet.jpg'
  }
];

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
    categories,
    saveOwnerCategory,
    deleteOwnerCategory,
    openAddProductModal,
    openEditProductModal,
    deleteOwnerProduct,
    ownerPin,
    changeOwnerPin,
    resetOwnerPinToDefault,
    showToast,
    isCloudConnected,
    reconnectCloud,
    cloudBulkUploadCatalog,
    getFirebaseConfig,
    saveFirebaseConfig
  } = useShop();

  const [activeTab, setActiveTab] = useState(ownerSettingsActiveTab || 'numbers');

  // Cloud Sync form state
  const [cloudApiKey, setCloudApiKey] = useState(() => (getFirebaseConfig ? getFirebaseConfig().apiKey : '') || '');
  const [cloudProjectId, setCloudProjectId] = useState(() => (getFirebaseConfig ? getFirebaseConfig().projectId : '') || '');
  const [cloudAuthDomain, setCloudAuthDomain] = useState(() => (getFirebaseConfig ? getFirebaseConfig().authDomain : '') || '');
  const [cloudStorageBucket, setCloudStorageBucket] = useState(() => (getFirebaseConfig ? getFirebaseConfig().storageBucket : '') || '');
  const [cloudAppId, setCloudAppId] = useState(() => (getFirebaseConfig ? getFirebaseConfig().appId : '') || '');
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);
  const [cloudSyncSuccess, setCloudSyncSuccess] = useState(false);
  const [showAdvancedCloud, setShowAdvancedCloud] = useState(false);

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

  // Category & Heading Management states (Birthday, Marriage, etc.)
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [catName, setCatName] = useState('');
  const [catNameHindi, setCatNameHindi] = useState('');
  const [catTagline, setCatTagline] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catUploadMode, setCatUploadMode] = useState('file'); // 'file' or 'url'
  const [catSearch, setCatSearch] = useState('');
  const [catError, setCatError] = useState('');
  const catFileInputRef = useRef(null);

  // Email & Message Verification states
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState(null);
  const [verifiedMessages, setVerifiedMessages] = useState(() => getStoredVerifiedMessages());

  // Populate from active brandConfig when opened
  useEffect(() => {
    if (brandConfig) {
      setWhatsappNumber(brandConfig.whatsappNumber || '919305371705');
      setPhone(brandConfig.phone || '+91 93053 71705');
      setEmail(brandConfig.email || DEFAULT_VERIFICATION_EMAIL);
      setUpiId(brandConfig.upiId || 'roshikablooms@upi');

      setStoreName(brandConfig.name || 'ROSHIKA BLOOMS');
      setTagline(brandConfig.tagline || 'Every Bloom Tells a Story.');
      setTaglineHindi(brandConfig.taglineHindi || 'Every bloom tells an exquisite story.');
      setAddress(brandConfig.address || '');
      setHours(brandConfig.hours || '');

      setAnnouncementEn(brandConfig.announcementEn || '✨ Free Luxury Greeting Card & Same-Day Delivery on orders above ₹999! Order before 7 PM.');
      setAnnouncementHi(brandConfig.announcementHi || '✨ Free Luxury Greeting Card & Same-Day Delivery on orders above ₹999! Order before 7 PM.');

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
      showToast('Please enter a valid 10-12 digit WhatsApp number.', 'error');
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
      name: storeName.trim() || 'ROSHIKA BLOOMS',
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
      setPinError('New PIN and confirmation PIN do not match.');
      return;
    }
    if (newPin.length < 4) {
      setPinError('PIN must be at least 4 digits/characters.');
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
    const url = createWhatsAppUrl('Hello! This is a test message from ROSHIKA BLOOMS Owner Studio.', cleanWa);
    window.open(url, '_blank');
  };

  // Refresh verified message inbox
  const refreshMessages = () => {
    setVerifiedMessages(getStoredVerifiedMessages());
  };

  // Test Email Verification Ping to mahimakk18@gmail.com
  const handleTestEmailVerification = async () => {
    const target = email.trim() || DEFAULT_VERIFICATION_EMAIL;
    setIsTestingEmail(true);
    setTestEmailResult(null);
    try {
      const res = await sendTestVerificationEmail(target);
      setTestEmailResult(res);
      showToast(`✅ Verification test message sent to ${target}!`, 'success');
      refreshMessages();
    } catch (err) {
      showToast(`❌ Verification error: ${err.message}`, 'error');
    } finally {
      setIsTestingEmail(false);
    }
  };

  // Save Cloud Firebase Configuration & Reconnect
  const handleSaveCloudConfig = (e) => {
    e.preventDefault();
    if (!cloudProjectId.trim() || !cloudApiKey.trim()) {
      showToast('Please enter both Firebase Project ID and API Key.', 'error');
      return;
    }
    const cleanProjectId = cloudProjectId.trim();
    const config = {
      apiKey: cloudApiKey.trim(),
      projectId: cleanProjectId,
      authDomain: cloudAuthDomain.trim() || `${cleanProjectId}.firebaseapp.com`,
      storageBucket: cloudStorageBucket.trim() || `${cleanProjectId}.appspot.com`,
      appId: cloudAppId.trim()
    };
    if (saveFirebaseConfig) {
      saveFirebaseConfig(config);
    }
    if (reconnectCloud) {
      const ok = reconnectCloud();
      if (ok) {
        showToast('🎉 Google Cloud Database successfully connected!', 'success');
      } else {
        showToast('✅ Configuration saved. Initializing connection...', 'info');
      }
    }
  };

  // Bulk Upload all 100+ Catalog items to Firestore Cloud
  const handleBulkUploadToCloud = async () => {
    if (!isCloudConnected) {
      showToast('⚠️ Please connect Google Firebase Database above first.', 'warning');
      return;
    }
    setIsBulkSyncing(true);
    setCloudSyncSuccess(false);
    try {
      if (cloudBulkUploadCatalog) {
        const ok = await cloudBulkUploadCatalog(products, categories, brandConfig);
        if (ok) {
          setCloudSyncSuccess(true);
          showToast('🚀 All bouquets and categories uploaded to the cloud! Real-time sync is now live for all clients.', 'success');
        } else {
          showToast('❌ Cloud sync error occurred. Please verify Firestore security rules.', 'error');
        }
      }
    } catch (err) {
      showToast(`❌ Error: ${err.message}`, 'error');
    } finally {
      setIsBulkSyncing(false);
    }
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

  // Category Handlers (Birthday, Marriage, etc.)
  const handleCatFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setCatError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    try {
      setCatError('');
      // Studio Ultra-Clear HD (1600px) with stepped downsampling and unsharp mask
      const compressed = await compressImageFile(file, 1600, 1600, 0.88);
      setCatImage(compressed);
    } catch (err) {
      console.warn('Category image compression fallback:', err);
      const reader = new FileReader();
      reader.onload = (event) => setCatImage(event.target.result);
      reader.onerror = () => setCatError('Error reading file. Please try again.');
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset) => {
    setCatName(preset.name);
    setCatNameHindi(preset.nameHindi);
    setCatTagline(preset.tagline);
    setCatDescription(preset.description);
    setCatImage(preset.image);
    setCatError('');
  };

  const handleOpenNewCategory = () => {
    setEditingCategoryId(null);
    setCatName('');
    setCatNameHindi('');
    setCatTagline('');
    setCatDescription('');
    setCatImage('/images/red_roses_luxury_bouquet.jpg');
    setCatError('');
    setIsCategoryFormOpen(true);
  };

  const handleEditCategory = (cat) => {
    setEditingCategoryId(cat.id || cat.slug);
    setCatName(cat.name || '');
    setCatNameHindi(cat.nameHindi || '');
    setCatTagline(cat.tagline || '');
    setCatDescription(cat.description || '');
    setCatImage(cat.image || cat.bannerImage || '/images/red_roses_luxury_bouquet.jpg');
    setCatError('');
    setIsCategoryFormOpen(true);
  };

  const handleSaveCategorySubmit = (e) => {
    e.preventDefault();
    if (!catName.trim()) {
      setCatError('Please enter a Category Collection name.');
      return;
    }

    const payload = {
      id: editingCategoryId || undefined,
      name: catName.trim(),
      nameHindi: catNameHindi.trim() || catName.trim(),
      tagline: catTagline.trim() || 'Exclusive handcrafted luxury floral collection',
      description: catDescription.trim() || 'Curated floral arrangements handcrafted for special celebrations.',
      image: catImage.trim() || '/images/red_roses_luxury_bouquet.jpg',
      bannerImage: catImage.trim() || '/images/red_roses_luxury_bouquet.jpg'
    };

    saveOwnerCategory(payload);
    setIsCategoryFormOpen(false);
    setEditingCategoryId(null);
  };

  const allAvailableCategories = categories || CATEGORIES;
  const filteredCategories = allAvailableCategories.filter((cat) => {
    if (!catSearch.trim()) return true;
    const q = catSearch.toLowerCase();
    return (
      (cat.name || '').toLowerCase().includes(q) ||
      (cat.nameHindi || '').toLowerCase().includes(q) ||
      (cat.tagline || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="drawer-backdrop open owner-modal-backdrop" onClick={closeOwnerSettingsModal}>
      <div 
        className="glass-panel owner-settings-modal-card animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="owner-modal-header">
          <div className="owner-modal-header-text">
            <div className="owner-modal-badge-row">
              <span className="gold-badge">
                <Shield size={11} /> 👑 Owner Control Center
              </span>
              <span style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: 700 }}>
                ● Store Administration
              </span>
            </div>
            <h2 className="owner-modal-title">
              Store & Catalog Management
            </h2>
          </div>

          <button 
            type="button" 
            className="drawer-close-btn" 
            onClick={closeOwnerSettingsModal}
            aria-label="Close"
          >
            <X size={18} />
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
            <span>Phone & WhatsApp</span>
          </button>

          <button
            type="button"
            className={`owner-settings-tab ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <FolderPlus size={15} color="#D4AF37" />
            <span>Categories & Headings ({allAvailableCategories.length})</span>
          </button>

          <button
            type="button"
            className={`owner-settings-tab ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            <Sparkles size={15} />
            <span>Bouquet Catalog ({products.length})</span>
          </button>

          <button
            type="button"
            className={`owner-settings-tab ${activeTab === 'store' ? 'active' : ''}`}
            onClick={() => setActiveTab('store')}
          >
            <Store size={15} />
            <span>Boutique & Atelier</span>
          </button>

          <button
            type="button"
            className={`owner-settings-tab ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => setActiveTab('announcements')}
          >
            <Bell size={15} />
            <span>Offers & Delivery Fees</span>
          </button>

          <button
            type="button"
            className={`owner-settings-tab ${activeTab === 'verification' ? 'active' : ''}`}
            onClick={() => { setActiveTab('verification'); refreshMessages(); }}
          >
            <Mail size={15} />
            <span>Email & Verification</span>
          </button>

          <button
            type="button"
            className={`owner-settings-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Lock size={15} />
            <span>Security PIN & Password</span>
          </button>

          <button
            type="button"
            className={`owner-settings-tab ${activeTab === 'cloud' ? 'active' : ''}`}
            onClick={() => setActiveTab('cloud')}
            style={isCloudConnected ? { borderColor: '#10B981', background: 'rgba(16, 185, 129, 0.08)' } : {}}
          >
            <Cloud size={15} color={isCloudConnected ? '#10B981' : '#38BDF8'} />
            <span>☁️ Cloud Sync {isCloudConnected ? '(Live 🟢)' : '(Offline ⚪)'}</span>
          </button>
        </div>

        {/* Tab 1: Phone & WhatsApp Numbers */}
        {activeTab === 'numbers' && (
          <form onSubmit={handleSaveContact} className="owner-tab-content animate-fade-in">
            <div className="owner-section-intro">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                📞 Contact Numbers & WhatsApp Direct
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Customers clicking "Order on WhatsApp", "Checkout via WhatsApp", or the concierge link will directly chat with this business number.
              </p>
            </div>

            <div className="owner-form-grid-2">
              <div className="form-group">
                <label className="owner-field-label">
                  <MessageCircle size={15} color="#25D366" /> WhatsApp Business Number *
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
                  Tip: Enter phone number with country code without '+' (e.g. 919876543210)
                </span>
              </div>

              <div className="form-group">
                <label className="owner-field-label">
                  <Phone size={15} color="var(--text-gold)" /> Calling Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="owner-input-field"
                />
                <span className="owner-field-hint">
                  Displayed in the website header, footer, and Contact Concierge page
                </span>
              </div>

              <div className="form-group">
                <label className="owner-field-label">
                  <Mail size={15} color="var(--text-gold)" /> Customer Support Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mahimakk18@gmail.com"
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
                  placeholder="e.g. 9876543210@paytm or roshikablooms@upi"
                  className="owner-input-field"
                />
                <span className="owner-field-hint">
                  Displayed to customers during checkout for direct UPI payments
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
                  <span>Test WhatsApp Link</span>
                </button>
              </div>
            </div>

            <div className="owner-modal-footer">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setWhatsappNumber('919305371705');
                  setPhone('+91 93053 71705');
                }}
              >
                Reset Default Number
              </button>
              <button type="submit" className="btn btn-gold btn-md">
                <Save size={15} /> Save Contact Details
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Store Details & Address */}
        {activeTab === 'store' && (
          <form onSubmit={handleSaveStore} className="owner-tab-content animate-fade-in">
            <div className="owner-section-intro">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                🏪 Boutique Profile & Atelier Address
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Update your luxury boutique name, slogan, physical atelier address, and opening hours.
              </p>
            </div>

            <div className="owner-form-grid-2">
              <div className="form-group">
                <label className="owner-field-label">Store / Brand Name *</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="ROSHIKA BLOOMS"
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
                <label className="owner-field-label">Brand Subtitle / Slogan</label>
                <input
                  type="text"
                  value={taglineHindi}
                  onChange={(e) => setTaglineHindi(e.target.value)}
                  placeholder="Every bloom tells an exquisite story."
                  className="owner-input-field"
                />
              </div>

              <div className="form-group">
                <label className="owner-field-label">Working Hours & Delivery Slots</label>
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
                <MapPin size={15} color="var(--text-gold)" /> Flagship Boutique / Atelier Address
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
                <Save size={15} /> Save Store Details
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Announcements & Offers */}
        {activeTab === 'announcements' && (
          <form onSubmit={handleSaveAnnouncements} className="owner-tab-content animate-fade-in">
            <div className="owner-section-intro">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                📢 Announcement Banner & Delivery Surcharges
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Control the luxury top announcement marquee and delivery fee thresholds here.
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
              <label className="owner-field-label">Top Banner Announcement</label>
              <input
                type="text"
                value={announcementHi}
                onChange={(e) => setAnnouncementHi(e.target.value)}
                placeholder="✨ Free Luxury Greeting Card & Same-Day Delivery on orders above ₹999!"
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
                <span className="owner-field-hint">Complimentary free delivery threshold</span>
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
                <span className="owner-field-hint">Standard daytime courier delivery charge</span>
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
                <span className="owner-field-hint">Midnight surprise delivery surcharge</span>
              </div>
            </div>

            <div className="owner-modal-footer">
              <button type="submit" className="btn btn-gold btn-md">
                <Save size={15} /> Save Offers & Fees
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
                  💐 Bouquet Catalog Manager ({products.length} Bouquets Live)
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Manage pricing, photos, tags, or add new floral arrangements to the live storefront.
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
                <Plus size={14} />
                <span>Add Bouquet</span>
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
                <option value="all">All Categories</option>
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
                  No bouquets matched your search
                </div>
              ) : (
                filteredCatalog.map((product) => (
                  <div key={product.id} className="owner-catalog-item-card">
                    <div className="owner-catalog-main-row">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="owner-catalog-thumb"
                        onError={(e) => { e.target.src = '/images/bday_royal_blue_tulip_lily_card.jpg'; }}
                      />

                      <div className="owner-catalog-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                          <span className="owner-cat-badge">{product.categoryName}</span>
                          {product.badge && <span className="rose-badge" style={{ fontSize: '0.7rem', padding: '2px 7px' }}>{product.badge}</span>}
                        </div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, wordBreak: 'break-word', lineHeight: 1.35 }}>
                          {product.name}
                        </h4>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {product.nameHindi || ''}
                        </span>
                      </div>
                    </div>

                    <div className="owner-catalog-footer-row">
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
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab: Headings & Categories Manager (Birthday, Marriage, Anniversary, etc.) */}
        {activeTab === 'categories' && (
          <div className="owner-tab-content animate-fade-in">
            <div className="owner-tab-header-row">
              <div>
                <h3 className="owner-tab-heading">
                  <FolderPlus size={18} color="var(--text-gold)" />
                  <span>Category Collections ({allAvailableCategories.length})</span>
                </h3>
                <p className="owner-tab-subheading">
                  Occasion collections live on boutique homepage & navigation.
                </p>
              </div>

              {!isCategoryFormOpen ? (
                <button
                  type="button"
                  className="btn btn-gold btn-sm"
                  onClick={handleOpenNewCategory}
                >
                  <Plus size={14} />
                  <span>Create Collection</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setIsCategoryFormOpen(false)}
                >
                  <X size={14} />
                  <span>Close Form</span>
                </button>
              )}
            </div>

            {/* Category Creation / Edit Form */}
            {isCategoryFormOpen && (
              <form onSubmit={handleSaveCategorySubmit} className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', background: 'var(--bg-alt)', border: '1.5px solid var(--border-gold)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={15} />
                    <span>{editingCategoryId ? 'Edit Category Collection' : 'Create New Category Collection'}</span>
                  </h4>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    This collection will be live on website navigation and homepage immediately.
                  </span>
                </div>

                {/* 1-Tap Quick Presets */}
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.4rem' }}>
                    ⚡ Quick Preset Suggestions (1-Tap):
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {CATEGORY_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.75rem', padding: '3px 10px', background: 'var(--bg-surface)' }}
                      >
                        {preset.nameHindi || preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {catError && (
                  <div className="owner-modal-error-banner" style={{ marginBottom: '1rem' }}>
                    <AlertCircle size={15} />
                    <span>{catError}</span>
                  </div>
                )}

                <div className="owner-form-grid-2" style={{ marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="owner-field-label">Heading Name (English) *</label>
                    <input
                      type="text"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      placeholder="e.g. Royal Marriage & Wedding Specials"
                      className="owner-input-field"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="owner-field-label">Collection Subtitle / Tagline</label>
                    <input
                      type="text"
                      value={catNameHindi}
                      onChange={(e) => setCatNameHindi(e.target.value)}
                      placeholder="e.g. Imperial Var-Mala, Bridal Bouquets & Scalloped Lilies"
                      className="owner-input-field"
                    />
                  </div>
                </div>

                <div className="owner-form-grid-2" style={{ marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="owner-field-label">Collection Subtitle / Tagline</label>
                    <input
                      type="text"
                      value={catTagline}
                      onChange={(e) => setCatTagline(e.target.value)}
                      placeholder="e.g. Bridal entry bouquets, stage florals & varmala"
                      className="owner-input-field"
                    />
                  </div>

                  <div className="form-group">
                    <label className="owner-field-label">Short Description</label>
                    <input
                      type="text"
                      value={catDescription}
                      onChange={(e) => setCatDescription(e.target.value)}
                      placeholder="e.g. Handcrafted fresh Dutch roses for fairytale weddings"
                      className="owner-input-field"
                    />
                  </div>
                </div>

                {/* Cover Image Upload / Selection */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="owner-field-label">
                    <Camera size={14} color="var(--text-gold)" /> Category Banner / Cover Photo *
                  </label>

                  <div className="owner-upload-tabs" style={{ marginBottom: '0.75rem' }}>
                    <button
                      type="button"
                      className={`owner-tab-btn ${catUploadMode === 'file' ? 'active' : ''}`}
                      onClick={() => setCatUploadMode('file')}
                    >
                      <Upload size={13} /> Mobile Photo Upload (Gallery / Camera)
                    </button>
                    <button
                      type="button"
                      className={`owner-tab-btn ${catUploadMode === 'url' ? 'active' : ''}`}
                      onClick={() => setCatUploadMode('url')}
                    >
                      <ImageIcon size={13} /> Image URL
                    </button>
                  </div>

                  {catUploadMode === 'file' ? (
                    <div 
                      className="owner-file-dropzone"
                      onClick={() => catFileInputRef.current?.click()}
                      style={{ padding: '1rem' }}
                    >
                      <input 
                        type="file" 
                        ref={catFileInputRef} 
                        style={{ display: 'none' }} 
                        accept="image/*"
                        onChange={handleCatFileChange}
                      />
                      <div className="dropzone-content">
                        <Upload size={22} color="var(--text-gold)" style={{ marginBottom: '0.25rem' }} />
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          Click to Choose Photo from Phone / Camera
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          JPG, PNG, WebP supported
                        </span>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={catImage}
                      onChange={(e) => setCatImage(e.target.value)}
                      placeholder="/images/red_roses_luxury_bouquet.jpg or https://..."
                      className="owner-input-field"
                    />
                  )}

                  {catImage && (
                    <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img 
                        src={catImage} 
                        alt="Preview" 
                        style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid var(--border-gold)' }}
                        onError={(e) => { e.target.src = '/images/red_roses_luxury_bouquet.jpg'; }}
                      />
                      <span style={{ fontSize: '0.78rem', color: '#16A34A', fontWeight: 600 }}>
                        ✓ Photo preview ready
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setIsCategoryFormOpen(false);
                      setEditingCategoryId(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-gold btn-md">
                    <Save size={15} />
                    <span>Save Category Collection</span>
                  </button>
                </div>
              </form>
            )}

            {/* Search Filter for Headings */}
            <div className="owner-search-bar-wrap">
              <Search size={15} className="owner-search-bar-icon" />
              <input
                type="text"
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                placeholder="Search collections (Birthday, Teddy, Roses...)"
                className="owner-search-bar-input"
              />
              {catSearch && (
                <button 
                  type="button" 
                  onClick={() => setCatSearch('')}
                  className="owner-search-bar-clear"
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* List of Headings */}
            <div className="owner-catalog-scroll-list">
              {filteredCategories.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No collections found matching "{catSearch}"
                </div>
              ) : (
                filteredCategories.map((cat, idx) => {
                  const bouquetCount = products.filter((p) => p.category === cat.slug || p.category === cat.id).length;
                  const cleanEn = (cat.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                  const cleanHi = (cat.nameHindi || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                  const isDuplicateSubtitle = !cat.nameHindi || (cleanHi && cleanEn && cleanHi === cleanEn);

                  return (
                    <div key={cat.id || cat.slug || idx} className="owner-category-item-card">
                      <div className="owner-category-top-row">
                        <img 
                          src={cat.image || cat.bannerImage || '/images/red_roses_luxury_bouquet.jpg'} 
                          alt={cat.name} 
                          className="owner-category-thumb"
                          onError={(e) => { e.target.src = '/images/red_roses_luxury_bouquet.jpg'; }}
                        />

                        <div className="owner-category-details">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                            <span className="owner-live-count-badge">
                              🌸 {bouquetCount} {bouquetCount === 1 ? 'Bouquet' : 'Bouquets'} Live
                            </span>
                            <span className="owner-status-pill-active">
                              ● Live on Website
                            </span>
                          </div>

                          <h4 className="owner-category-title">
                            {cat.name}
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
                          title={`Add new bouquet under ${cat.name}`}
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
                            if (window.confirm(`Are you sure you want to delete the "${cat.name}" category collection?`)) {
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
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Security PIN Settings */}
        {activeTab === 'security' && (
          <form onSubmit={handlePinChangeSubmit} className="owner-tab-content animate-fade-in">
            <div className="owner-section-intro">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                🔒 Change Owner Security PIN & Access Code
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                To safeguard your store dashboard, replace the default security PIN (<code>risika2026</code>) with your private secret passcode.
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
                <label className="owner-field-label">Current Owner PIN *</label>
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
                <label className="owner-field-label">New Secret PIN *</label>
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
                <label className="owner-field-label">Confirm New PIN *</label>
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
                  Current PIN Status: <strong>{ownerPin === 'risika2026' ? 'Default PIN Active (Recommended to change)' : '•••••••• (Custom Secret PIN Active)'}</strong>
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

        {/* Tab 6: Email & Message Verification (mahimakk18@gmail.com) */}
        {activeTab === 'verification' && (
          <div className="owner-tab-content animate-fade-in">
            <div className="owner-section-intro">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }} className="gold-badge">
                <CheckCircle2 size={13} color="#16A34A" /> Active Verification Endpoint: {email || DEFAULT_VERIFICATION_EMAIL}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                ✉️ {email || DEFAULT_VERIFICATION_EMAIL} Message Verification Center
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Customer inquiries, contact submissions, and bespoke orders are verified and forwarded directly to <strong>{email || DEFAULT_VERIFICATION_EMAIL}</strong>.
              </p>
            </div>

            {/* Test Email Verification Box */}
            <div className="owner-preview-callout" style={{ marginBottom: '1.5rem', background: 'var(--bg-accent-soft)', border: '1.5px solid var(--border-gold)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Send size={16} color="var(--text-gold)" /> Send Test Verification Ping
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Verify that customer notifications are successfully arriving at <strong>{email || DEFAULT_VERIFICATION_EMAIL}</strong>.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-gold btn-sm"
                  onClick={handleTestEmailVerification}
                  disabled={isTestingEmail}
                >
                  {isTestingEmail ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Sending Test Ping...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Send Test Verification to {email || DEFAULT_VERIFICATION_EMAIL}</span>
                    </>
                  )}
                </button>
              </div>

              {testEmailResult && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.82rem', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} />
                  <span>
                    ✓ Test verification #{testEmailResult.testCode} dispatched successfully to <strong>{email || DEFAULT_VERIFICATION_EMAIL}</strong> at {testEmailResult.timestamp}.
                  </span>
                </div>
              )}
            </div>

            {/* 1-Time Setup & Activation Guide */}
            <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="var(--text-gold)" /> One-Time Activation Guide
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <div style={{ padding: '0.75rem', background: 'var(--bg-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>1. Send Test Ping</strong>
                  Click the button above to dispatch a test verification email to your inbox.
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--bg-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>2. Open Gmail Inbox</strong>
                  Open the inbox or Spam/Junk folder for <strong>{email || DEFAULT_VERIFICATION_EMAIL}</strong>.
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--bg-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>3. Click 'Activate Form'</strong>
                  In the email from FormSubmit, click 'Activate Form'. After activation, all customer inquiries arrive instantly!
                </div>
              </div>
            </div>

            {/* Customer Verified Inquiries Inbox */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Inbox size={16} color="var(--text-gold)" /> Customer Inquiries & Concierge Inbox ({verifiedMessages.length})
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Live audit log of all inquiries received via the storefront contact forms.
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={refreshMessages}
                >
                  <RefreshCw size={13} />
                  <span>Refresh Inbox</span>
                </button>
              </div>

              {verifiedMessages.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-alt)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>No customer messages yet</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    Messages submitted by clients on the Contact page will appear here and dispatch to <strong>{email || DEFAULT_VERIFICATION_EMAIL}</strong>.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '360px', overflowY: 'auto', paddingRight: '4px' }}>
                  {verifiedMessages.map((msg, index) => (
                    <div 
                      key={msg.id || index}
                      style={{
                        padding: '1rem 1.25rem',
                        background: 'var(--bg-alt)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{msg.name}</strong>
                          <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontSize: '0.78rem' }}>({msg.email || 'No email'})</span>
                        </div>
                        <span className="rose-badge" style={{ fontSize: '0.7rem' }}>
                          ✓ #{msg.id}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        {msg.phone && (
                          <a 
                            href={`https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{ color: '#25D366', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                          >
                            <MessageCircle size={13} /> {msg.phone} (WhatsApp)
                          </a>
                        )}
                        <span><strong>Subject:</strong> {msg.subject}</span>
                        <span><strong>Time:</strong> {msg.timestamp}</span>
                      </div>

                      <p style={{ margin: 0, color: 'var(--text-primary)', background: 'var(--bg-surface)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem', whiteSpace: 'pre-wrap' }}>
                        {msg.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 7: Realtime Global Cloud Database Sync (Google Firebase Firestore) */}
        {activeTab === 'cloud' && (
          <div className="owner-tab-content animate-fade-in">
            <div className="owner-section-intro">
              <div 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  marginBottom: '0.5rem',
                  background: isCloudConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(148, 163, 184, 0.15)',
                  color: isCloudConnected ? '#10B981' : 'var(--text-secondary)',
                  border: isCloudConnected ? '1px solid #10B981' : '1px solid var(--border-subtle)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '100px',
                  fontSize: '0.78rem',
                  fontWeight: 600
                }}
              >
                {isCloudConnected ? (
                  <>
                    <Wifi size={13} color="#10B981" />
                    <span>🟢 Live Connected: Real-time cloud sync active across all customer devices</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={13} />
                    <span>⚪ Offline Local Mode: Changes saved locally on this browser</span>
                  </>
                )}
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                ☁️ Real-Time Cloud Database Sync (Google Firebase Firestore)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Connecting Google Firebase Firestore enables real-time synchronization. Any bouquets, categories, or prices you add or modify from your phone 
                will <strong>instantly update live on every customer's screen worldwide</strong> without delay!
              </p>
            </div>

            {/* Cloud Status Callout */}
            {isCloudConnected ? (
              <div 
                className="owner-preview-callout" 
                style={{ 
                  marginBottom: '1.5rem', 
                  background: 'rgba(16, 185, 129, 0.08)', 
                  border: '1.5px solid #10B981',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10B981', margin: '0 0 0.3rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={18} /> Google Cloud Database Active & Synced
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Connected Project: <strong>{cloudProjectId}</strong> • Realtime multi-device listeners active.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-gold btn-md"
                    onClick={handleBulkUploadToCloud}
                    disabled={isBulkSyncing}
                    style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#fff', border: 'none' }}
                  >
                    {isBulkSyncing ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Syncing Catalog to Cloud...</span>
                      </>
                    ) : (
                      <>
                        <Database size={14} />
                        <span>⚡ Sync All Current Bouquets to Cloud</span>
                      </>
                    )}
                  </button>
                </div>

                {cloudSyncSuccess && (
                  <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '0.82rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={15} />
                    <span>✓ All bouquets and categories uploaded to the cloud! Real-time sync is active for all customers.</span>
                  </div>
                )}
              </div>
            ) : null}

            {/* Cloud Setup Form */}
            <form onSubmit={handleSaveCloudConfig} style={{ marginBottom: '1.5rem' }}>
              <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Database size={16} color="var(--text-gold)" /> Enter Firebase Credentials (Connect Cloud Database)
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="owner-field-label">Firebase Project ID *</label>
                    <input
                      type="text"
                      value={cloudProjectId}
                      onChange={(e) => setCloudProjectId(e.target.value)}
                      placeholder="e.g. rishika-blooms-atelier"
                      className="owner-input-field"
                      required
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Project ID from your Google Firebase Console
                    </span>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="owner-field-label">Web API Key *</label>
                    <input
                      type="text"
                      value={cloudApiKey}
                      onChange={(e) => setCloudApiKey(e.target.value)}
                      placeholder="e.g. AIzaSyB..."
                      className="owner-input-field"
                      required
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      API Key from your Firebase Web App configuration
                    </span>
                  </div>
                </div>

                {/* Advanced Fields Toggle */}
                <div style={{ marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedCloud(!showAdvancedCloud)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-gold)', fontSize: '0.8rem', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                  >
                    {showAdvancedCloud ? '▲ Hide Advanced Cloud Fields' : '▼ Show Advanced Fields (Auth Domain, Storage Bucket, App ID)'}
                  </button>

                  {showAdvancedCloud && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="owner-field-label">Auth Domain (Optional)</label>
                        <input
                          type="text"
                          value={cloudAuthDomain}
                          onChange={(e) => setCloudAuthDomain(e.target.value)}
                          placeholder="project-id.firebaseapp.com"
                          className="owner-input-field"
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="owner-field-label">Storage Bucket (Optional)</label>
                        <input
                          type="text"
                          value={cloudStorageBucket}
                          onChange={(e) => setCloudStorageBucket(e.target.value)}
                          placeholder="project-id.appspot.com"
                          className="owner-input-field"
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="owner-field-label">App ID (Optional)</label>
                        <input
                          type="text"
                          value={cloudAppId}
                          onChange={(e) => setCloudAppId(e.target.value)}
                          placeholder="1:123456789:web:abcdef"
                          className="owner-input-field"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button type="submit" className="btn btn-gold btn-md" style={{ flex: 1, minWidth: '200px' }}>
                    <Save size={15} /> Save & Connect Google Cloud
                  </button>

                  {isCloudConnected && (
                    <button
                      type="button"
                      className="btn btn-outline btn-md"
                      onClick={() => {
                        if (window.confirm('Disconnect Cloud Database and revert to local storage?')) {
                          if (saveFirebaseConfig) {
                            saveFirebaseConfig({ apiKey: '', projectId: '' });
                          }
                          setCloudApiKey('');
                          setCloudProjectId('');
                          if (reconnectCloud) reconnectCloud();
                          showToast('Cloud Database disconnected.', 'info');
                        }
                      }}
                    >
                      Disconnect Cloud
                    </button>
                  )}
                </div>
              </div>
            </form>

            {/* 3-Step Firebase Free Setup Guide */}
            <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="var(--text-gold)" /> 100% Free Google Firebase Setup (3 Simple Steps)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <div style={{ padding: '0.75rem', background: 'var(--bg-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>1. Open Firebase Console</strong>
                  In your browser, visit <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" style={{ color: 'var(--text-gold)' }}>console.firebase.google.com</a>, click <strong>"Add project"</strong>, and name it <em>Rishika Blooms</em>.
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--bg-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>2. Create Firestore Database</strong>
                  In the left sidebar, click <strong>Build ➔ Firestore Database</strong>, click <strong>"Create Database"</strong>, and select <em>Start in test mode</em>.
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--bg-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>3. Copy Web App Config</strong>
                  Under Project Settings, add a <strong>Web App (&lt;/&gt;)</strong>. Copy the <code>apiKey</code> and <code>projectId</code> and paste them above!
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
