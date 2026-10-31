const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/owner/OwnerSettingsModal.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Ensure User & QrCode are imported from 'lucide-react'
if (!content.includes('QrCode,') || !content.includes('User,')) {
  content = content.replace(
    /import\s*\{([^}]+)\}\s*from\s*'lucide-react';/,
    (match, p1) => {
      let imports = p1.trim();
      if (!imports.includes('QrCode')) imports += ', QrCode';
      if (!imports.includes('User')) imports += ', User';
      return `import {\n  ${imports}\n} from 'lucide-react';`;
    }
  );
  console.log('✓ Added QrCode & User imports');
}

// 2. Add ownerName, upiQrImage, upiPayeeName state and refs
if (!content.includes('const [ownerName, setOwnerName]')) {
  content = content.replace(
    /const \[upiId, setUpiId\] = useState\(''\);/,
    `const [upiId, setUpiId] = useState('');\n  const [ownerName, setOwnerName] = useState('');\n  const [upiQrImage, setUpiQrImage] = useState('');\n  const [upiPayeeName, setUpiPayeeName] = useState('');\n  const upiQrFileInputRef = useRef(null);`
  );
  console.log('✓ Added ownerName & upiQrImage states');
}

// 3. Update useEffect to populate ownerName & upiQrImage from brandConfig
if (!content.includes('setOwnerName(brandConfig.ownerName')) {
  content = content.replace(
    /setUpiId\(brandConfig\.upiId \|\| 'roshikablooms@upi'\);/,
    `setUpiId(brandConfig.upiId || '9305371705@paytm');\n      setOwnerName(brandConfig.ownerName || 'Rishika / Mahima');\n      setUpiQrImage(brandConfig.upiQrImage || '');\n      setUpiPayeeName(brandConfig.upiPayeeName || 'Rishika Blooms');`
  );
  console.log('✓ Populated ownerName & upiQrImage from brandConfig in useEffect');
}

// 4. Add handleUpiQrFileChange and handleSavePayment functions
if (!content.includes('const handleUpiQrFileChange')) {
  const handlerCode = `
  // Payment Scanner Handler
  const handleUpiQrFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP).', 'error');
      return;
    }
    try {
      const compressed = await compressImageFile(file, 1200, 1200, 0.9);
      setUpiQrImage(compressed);
      showToast('📷 Payment QR scanner selected! Click "Save Payment Scanner" to activate.', 'success');
    } catch (err) {
      console.warn('QR compression fallback:', err);
      const reader = new FileReader();
      reader.onload = (ev) => setUpiQrImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSavePayment = (e) => {
    e.preventDefault();
    updateBrandConfig({
      upiId: upiId.trim() || '9305371705@paytm',
      upiQrImage: upiQrImage.trim(),
      upiPayeeName: upiPayeeName.trim() || storeName || 'RISHIKA BLOOMS'
    });
    showToast('💳 Store Payment Scanner & UPI details saved! Active on checkout.', 'success');
  };
`;
  content = content.replace(
    /const handleSaveContact = \(e\) => \{/,
    `${handlerCode}\n  const handleSaveContact = (e) => {`
  );
  console.log('✓ Added handleUpiQrFileChange & handleSavePayment');
}

// 5. Update handleSaveContact to include ownerName
content = content.replace(
  /updateBrandConfig\(\{\s*whatsappNumber:\s*cleanWa,\s*phone:\s*phone\.trim\(\),\s*email:\s*email\.trim\(\),\s*upiId:\s*upiId\.trim\(\)\s*\}\);/,
  `updateBrandConfig({\n      ownerName: ownerName.trim() || 'Rishika / Mahima',\n      whatsappNumber: cleanWa,\n      phone: phone.trim(),\n      email: email.trim(),\n      upiId: upiId.trim()\n    });`
);

// 6. Update Navigation tabs to show Owner Profile & Phone + Payment QR Scanner
if (!content.includes("Payment Scanner & UPI")) {
  content = content.replace(
    /<button\s+type="button"\s+className=\{`owner-settings-tab \$\{activeTab === 'numbers' \? 'active' : ''\}`\}\s+onClick=\{\(\) => setActiveTab\('numbers'\)\}\s*>\s*<MessageCircle size=\{15\} \/>\s*<span>Phone & WhatsApp<\/span>\s*<\/button>/,
    `<button
            type="button"
            className={\`owner-settings-tab \${activeTab === 'numbers' ? 'active' : ''}\`}
            onClick={() => setActiveTab('numbers')}
          >
            <User size={15} color="#D4AF37" />
            <span>Owner Profile & Phone</span>
          </button>

          <button
            type="button"
            className={\`owner-settings-tab \${activeTab === 'payment' ? 'active' : ''}\`}
            onClick={() => setActiveTab('payment')}
          >
            <QrCode size={15} color="#2874F0" />
            <span>Payment Scanner & UPI</span>
          </button>`
  );
  console.log('✓ Added Payment Scanner tab button in header');
}

// 7. Update Tab 1 (numbers) form fields to include Owner Full Name
if (!content.includes("Owner Full Name *")) {
  content = content.replace(
    /<div className="owner-form-grid-2">\s*<div className="form-group">\s*<label className="owner-field-label">\s*<MessageCircle size=\{15\} color="#25D366" \/> WhatsApp Business Number \*/,
    `<div className="owner-form-grid-2">
              <div className="form-group">
                <label className="owner-field-label">
                  <User size={15} color="var(--text-gold)" /> Owner Full Name *
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Rishika / Mahima"
                  className="owner-input-field"
                  required
                />
                <span className="owner-field-hint">Your personal store owner identity</span>
              </div>

              <div className="form-group">
                <label className="owner-field-label">
                  <Phone size={15} color="var(--text-gold)" /> Calling Phone Number *
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 93053 71705"
                  className="owner-input-field"
                  required
                />
                <span className="owner-field-hint">Displayed in header & call buttons</span>
              </div>

              <div className="form-group">
                <label className="owner-field-label">
                  <MessageCircle size={15} color="#25D366" /> WhatsApp Business Number *`
  );
  console.log('✓ Added Owner Full Name in Tab 1');
}

// 8. Add Tab for Payment Scanner & UPI (activeTab === 'payment')
if (!content.includes("Store Payment Scanner & UPI QR Code")) {
  const paymentTabContent = `
        {/* Tab: Store Payment Scanner & UPI QR */}
        {activeTab === 'payment' && (
          <form onSubmit={handleSavePayment} className="owner-tab-content animate-fade-in">
            <div className="owner-section-intro">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={18} color="#2874F0" />
                <span>Store Payment Scanner & UPI QR Code</span>
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Upload your boutique's Google Pay, PhonePe, Paytm, or BharatPe QR scanner photo. Customers will scan this exact QR code during checkout on mobile & web.
              </p>
            </div>

            {/* Scanner Photo Upload Box */}
            <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1.5px solid var(--border-gold)', background: 'var(--bg-alt)' }}>
              <label className="owner-field-label" style={{ marginBottom: '0.65rem' }}>
                <Camera size={15} color="var(--text-gold)" /> Upload Your Payment QR Scanner Photo (GPay / PhonePe / Paytm / QR Stand)
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: upiQrImage ? '1fr 180px' : '1fr', gap: '1.25rem', alignItems: 'center' }}>
                <div>
                  <div 
                    className="owner-file-dropzone"
                    onClick={() => upiQrFileInputRef.current?.click()}
                    style={{ padding: '1.5rem', textAlign: 'center', cursor: 'pointer', border: '2px dashed var(--border-gold)', borderRadius: '12px', background: 'var(--bg-surface)' }}
                  >
                    <input 
                      type="file" 
                      ref={upiQrFileInputRef} 
                      style={{ display: 'none' }} 
                      accept="image/*"
                      onChange={handleUpiQrFileChange}
                    />
                    <Upload size={28} color="var(--text-gold)" style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      Click to Choose Payment Scanner Photo from Phone / Gallery
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      Supports JPG, PNG, WebP — Auto sharpened for flawless phone camera scanning
                    </div>
                  </div>

                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {upiQrImage && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          if (window.confirm('Remove custom scanner photo and use auto-generated UPI QR code?')) {
                            setUpiQrImage('');
                          }
                        }}
                        style={{ color: '#E53E3E', borderColor: '#E53E3E' }}
                      >
                        <Trash2 size={13} />
                        <span>Remove Custom Photo</span>
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => upiQrFileInputRef.current?.click()}
                    >
                      <Camera size={13} />
                      <span>{upiQrImage ? 'Change Scanner Photo' : 'Upload Scanner Photo'}</span>
                    </button>
                  </div>
                </div>

                {/* Live Customer Preview */}
                {upiQrImage ? (
                  <div style={{ textAlign: 'center', padding: '0.75rem', background: '#FFFFFF', borderRadius: '12px', border: '1.5px solid #2874F0', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#2874F0', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                      ✓ Live Customer View
                    </span>
                    <img 
                      src={upiQrImage} 
                      alt="Store Payment Scanner" 
                      style={{ width: '140px', height: '140px', objectFit: 'contain', borderRadius: '8px', display: 'block', margin: '0 auto' }}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 700, display: 'block', marginTop: '4px' }}>
                      ● Ready for Scanning
                    </span>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '0.75rem', background: '#FFFFFF', borderRadius: '12px', border: '1px dashed #D0D0D0' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#666', display: 'block', marginBottom: '4px' }}>
                      Auto Generated UPI QR
                    </span>
                    <img 
                      src={\`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=\${encodeURIComponent(\`upi://pay?pa=\${upiId || '9305371705@paytm'}&pn=RisikaBlooms&cu=INR\`)}\`}
                      alt="Default QR" 
                      style={{ width: '110px', height: '110px', display: 'block', margin: '0 auto' }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* UPI ID & Details Grid */}
            <div className="owner-form-grid-2">
              <div className="form-group">
                <label className="owner-field-label">
                  <CreditCard size={15} color="var(--text-gold)" /> UPI Payment ID (GooglePay / PhonePe / Paytm / BHIM) *
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. 9305371705@paytm or roshikablooms@upi"
                  className="owner-input-field"
                  required
                />
                <span className="owner-field-hint">
                  Displayed to customers during checkout to pay with any UPI app
                </span>
              </div>

              <div className="form-group">
                <label className="owner-field-label">
                  <User size={15} color="var(--text-gold)" /> Payee / Beneficiary Name
                </label>
                <input
                  type="text"
                  value={upiPayeeName}
                  onChange={(e) => setUpiPayeeName(e.target.value)}
                  placeholder="e.g. Rishika Blooms / Mahima"
                  className="owner-input-field"
                />
                <span className="owner-field-hint">
                  Shown on GPay/PhonePe when customer initiates transfer
                </span>
              </div>
            </div>

            <div className="owner-modal-footer">
              <button type="submit" className="btn btn-gold btn-md">
                <Save size={15} /> Save Payment Scanner & UPI
              </button>
            </div>
          </form>
        )}
`;

  content = content.replace(
    /\{\/\* Tab 2: Store Details & Address \*\/\}/,
    `${paymentTabContent}\n        {/* Tab 2: Store Details & Address */}`
  );
  console.log('✓ Added activeTab === "payment" section');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ OwnerSettingsModal.jsx successfully updated with Owner Personal Profile and Payment Scanner!');

