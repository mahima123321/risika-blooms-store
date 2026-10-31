const fs = require('fs');
const path = require('path');

console.log('--- ENHANCING OWNER PERSONAL DETAILS & PAYMENT SCANNER ---');

// 1. Update src/config/brand.js
const brandFile = path.join(__dirname, '../src/config/brand.js');
let brandSrc = fs.readFileSync(brandFile, 'utf8');

if (!brandSrc.includes('ownerName:')) {
  brandSrc = brandSrc.replace(
    /name:\s*"RISHIKA BLOOMS",/,
    'name: "RISHIKA BLOOMS",\n  ownerName: "Rishika / Mahima",\n  upiId: "9305371705@paytm",\n  upiQrImage: "",'
  );
  fs.writeFileSync(brandFile, brandSrc, 'utf8');
  console.log('✓ Updated src/config/brand.js with ownerName & upiQrImage');
}

// 2. Update src/components/common/QrScannerModal.jsx
const qrModalFile = path.join(__dirname, '../src/components/common/QrScannerModal.jsx');
let qrModalSrc = fs.readFileSync(qrModalFile, 'utf8');

if (!qrModalSrc.includes('brandConfig?.upiQrImage ||')) {
  qrModalSrc = qrModalSrc.replace(
    /const upiQrImgUrl = `https:\/\/api\.qrserver\.com\/v1\/create-qr-code\/\?size=320x320&margin=12&data=\${encodeURIComponent\(upiLink\)}`;/,
    'const upiQrImgUrl = brandConfig?.upiQrImage || `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${encodeURIComponent(upiLink)}`;'
  );
  fs.writeFileSync(qrModalFile, qrModalSrc, 'utf8');
  console.log('✓ Updated QrScannerModal.jsx with custom QR support');
}

// 3. Update src/pages/CartDrawer.jsx
const cartDrawerFile = path.join(__dirname, '../src/pages/CartDrawer.jsx');
let cartDrawerSrc = fs.readFileSync(cartDrawerFile, 'utf8');

if (!cartDrawerSrc.includes('brandConfig?.upiQrImage || `https://api.qrserver')) {
  cartDrawerSrc = cartDrawerSrc.replace(
    /src=\{`https:\/\/api\.qrserver\.com\/v1\/create-qr-code\/\?size=200x200&margin=8&data=\$\{encodeURIComponent\(\s*`upi:\/\/pay\?pa=\$\{brandConfig\?\.upiId \|\| 'roshikablooms@upi'\}&pn=Rishika%20Blooms&am=\$\{cartTotal\}&cu=INR`\s*\)\}`\}/,
    'src={brandConfig?.upiQrImage || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(`upi://pay?pa=${brandConfig?.upiId || "9305371705@paytm"}&pn=Rishika%20Blooms&am=${cartTotal}&cu=INR`)}`}'
  );
  fs.writeFileSync(cartDrawerFile, cartDrawerSrc, 'utf8');
  console.log('✓ Updated CartDrawer.jsx with custom payment scanner');
}

// 4. Update src/pages/CheckoutPage.jsx
const checkoutFile = path.join(__dirname, '../src/pages/CheckoutPage.jsx');
let checkoutSrc = fs.readFileSync(checkoutFile, 'utf8');

// Replace the QR image in CheckoutPage to prioritize custom uploaded QR scanner
const targetQrRegex = /<img\s+src=\{`https:\/\/api\.qrserver\.com\/v1\/create-qr-code\/\?size=150x150&data=\$\{encodeURIComponent\(`upi:\/\/pay\?pa=\$\{brandConfig\?\.upiId \|\| 'roshikablooms@upi'\}&pn=RisikaBlooms&am=\$\{cartTotal\}&cu=INR`\)\}`\}\s+alt="UPI QR"\s+style=\{\{\s*width:\s*'130px',\s*height:\s*'130px',\s*display:\s*'block'\s*\}\}\s*\/>/;

if (targetQrRegex.test(checkoutSrc)) {
  const replacementQr = `<img 
                                src={brandConfig?.upiQrImage || \`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=\${encodeURIComponent(\`upi://pay?pa=\${brandConfig?.upiId || '9305371705@paytm'}&pn=RisikaBlooms&am=\${cartTotal}&cu=INR\`)}\`} 
                                alt="UPI Payment Scanner" 
                                style={{ width: '150px', height: '150px', objectFit: 'contain', display: 'block', margin: '0 auto', borderRadius: '6px' }}
                              />`;
  checkoutSrc = checkoutSrc.replace(targetQrRegex, replacementQr);
  fs.writeFileSync(checkoutFile, checkoutSrc, 'utf8');
  console.log('✓ Updated CheckoutPage.jsx with custom payment scanner');
}

console.log('--- ALL FILES ENHANCED SUCCESSFULLY ---');

