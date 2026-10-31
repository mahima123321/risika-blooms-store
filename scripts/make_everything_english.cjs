const fs = require('fs');
const path = require('path');

console.log('--- CONVERTING ALL POPUPS, NOTIFICATIONS & TEXT TO 100% CLEAN ENGLISH ---');

// 1. Update src/components/common/WhatsAppButton.jsx
const waBtnPath = path.join(__dirname, '../src/components/common/WhatsAppButton.jsx');
let waBtn = fs.readFileSync(waBtnPath, 'utf8');

waBtn = waBtn.replace(
  /हमारे ऑफिशियल व्हाट्सएप चैनल से जुड़ें और पाएं <strong>20% की छूट<\/strong> व नए बुके का डेली अपडेट!/,
  'Join our Official WhatsApp Channel to get <strong>20% OFF</strong> and daily new luxury bouquet updates!'
);

waBtn = waBtn.replace(
  /हमारे ऑफिशियल व्हाट्सएप चैनल से जुड़ें और पाएं <strong>20% की छूट<\/strong> व नए बुके का डेली अपडेट!/,
  'Join our Official WhatsApp Channel to get <strong>20% OFF</strong> and daily new luxury bouquet updates!'
);

waBtn = waBtn.replace(
  /<span>चैनल से जुड़ें \(Join Now\)<\/span>/,
  '<span>Join Channel Now</span>'
);

waBtn = waBtn.replace(
  /<span>चैनल से जुड़ें \(Join Now\)<\/span>/,
  '<span>Join Channel Now</span>'
);

fs.writeFileSync(waBtnPath, waBtn, 'utf8');
console.log('✓ WhatsApp Channel popup converted to 100% English');

// 2. Update src/pages/CheckoutPage.jsx
const checkoutPath = path.join(__dirname, '../src/pages/CheckoutPage.jsx');
let checkout = fs.readFileSync(checkoutPath, 'utf8');

checkout = checkout.replace(
  /PRICE DETAILS\s*\([^)]*\)/,
  'PRICE DETAILS'
);

fs.writeFileSync(checkoutPath, checkout, 'utf8');
console.log('✓ CheckoutPage Price Details converted to 100% English');

// 3. Update src/context/ShopContext.jsx
const shopContextPath = path.join(__dirname, '../src/context/ShopContext.jsx');
let shopCtx = fs.readFileSync(shopContextPath, 'utf8');

shopCtx = shopCtx.replace(
  /showToast\('☁️ Live Cloud Synced! Sabhi phones par live update ho gaya\.', 'success'\);/,
  "showToast('☁️ Live Cloud Synced! Real-time catalog updated across all devices.', 'success');"
);

shopCtx = shopCtx.replace(
  /showToast\('⚠️ Cloud note: Changes phone me save hain, cloud retry ho raha hai\.', 'warning'\);/,
  "showToast('⚠️ Cloud note: Saved locally, retrying cloud sync in background.', 'warning');"
);

shopCtx = shopCtx.replace(
  /showToast\('☁️ Cloud Synced! Doosre sabhi phones se bhi delete ho gaya\.', 'info'\);/,
  "showToast('☁️ Cloud Synced! Removed across all customer devices.', 'info');"
);

fs.writeFileSync(shopContextPath, shopCtx, 'utf8');
console.log('✓ ShopContext toast alerts converted to 100% English');

console.log('--- ALL ENGLISH CONVERSIONS COMPLETE ---');

