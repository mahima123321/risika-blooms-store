const fs = require('fs');
const path = require('path');

console.log('--- ENHANCING OTP DELIVERY VERIFICATION & AUTOMATED CONGRATULATIONS WISHES ---');

// 1. Update src/config/whatsapp.js with rich congratulatory wishes
const waFile = path.join(__dirname, '../src/config/whatsapp.js');
let waSrc = fs.readFileSync(waFile, 'utf8');

const oldWaFunc = /export function buildDeliveryConfirmationWhatsAppMessage\(\{ order \}\) \{[\s\S]*?\}/;
const newWaFunc = `export function buildDeliveryConfirmationWhatsAppMessage({ order }) {
  const id = order.orderId || order.id || 'ORDER';
  const name = order.recipientName || order.customerName || 'Valued Customer';
  const bouquet = Array.isArray(order.items) && order.items.length > 0
    ? order.items.map(i => \`\${i.name} (x\${i.quantity || 1})\`).join(', ')
    : (order.bouquetName || 'Luxury Handcrafted Floral Bouquet');

  let msg = \`🌸 *RISHIKA BLOOMS — DELIVERY COMPLETED* 🌸\\n\\n\`;
  msg += \`🎉 *CONGRATULATIONS \${name.toUpperCase()}!* 🎉\\n\\n\`;
  msg += \`✨ Your luxury bouquet (*\${bouquet}*) under Order #\${id} has been *successfully hand-delivered*! 💐\\n\\n\`;
  msg += \`💖 *Congratulations & Warmest Wishes from Rishika Blooms!* We hope these fresh blossoms fill your celebration with pure elegance, beauty, and unforgettable moments.\\n\\n\`;
  msg += \`🌿 *Quick Floral Care Tip:*\\n\`;
  msg += \`• Keep flowers away from direct afternoon sun.\\n\`;
  msg += \`• Add fresh cold water to the vase / stems daily.\\n\\n\`;
  msg += \`⭐ *Love your flowers?*\\n\`;
  msg += \`Share your review & photo with us: https://rishikablooms.vercel.app\\n\\n\`;
  msg += \`_Thank you for choosing Rishika Blooms Atelier!_ 🌸✨\`;

  return msg;
}`;

waSrc = waSrc.replace(oldWaFunc, newWaFunc);
fs.writeFileSync(waFile, waSrc, 'utf8');
console.log('✓ Updated src/config/whatsapp.js with rich congratulatory message');

// 2. Update src/components/owner/DeliveryOrdersModal.jsx to make handleVerifyOtp async/await
const modalFile = path.join(__dirname, '../src/components/owner/DeliveryOrdersModal.jsx');
let modalSrc = fs.readFileSync(modalFile, 'utf8');

// Fix handleVerifyOtp to be async and await verifyDeliveryOtp
const oldVerifyPattern = /const handleVerifyOtp = \(orderId, overrideEntered\) => \{[\s\S]*?const result = verifyDeliveryOtp\(orderId, entered\);[\s\S]*?setVerifyingOrderId\(null\);\s*\};/;

const newVerifyCode = `const handleVerifyOtp = async (orderId, overrideEntered) => {
    const entered = overrideEntered || otpInputs[orderId] || '';
    if (!entered || entered.length < 4) {
      setErrorMessages(prev => ({ ...prev, [orderId]: 'Please enter the complete 4-digit OTP provided by customer.' }));
      return;
    }

    setVerifyingOrderId(orderId);
    try {
      const result = await verifyDeliveryOtp(orderId, entered);

      if (result && result.success) {
        // 🔔 Celebratory audio alert & voice announcement on owner device
        try {
          playDeliverySuccessChime('Congratulations! Bouquet successfully received. Thank you for choosing Rishika Blooms!');
        } catch (e) {}

        showToast(\`🎉 Order #\${orderId} verified and marked as Delivered!\`, 'success');
        try {
          confetti({ particleCount: 120, spread: 85, origin: { y: 0.6 } });
        } catch (e) {}

        // Automatically dispatch WhatsApp celebration & congratulation wishes to customer
        const targetOrder = result.order || orders.find(o => String(o.orderId || o.order_id) === String(orderId));
        if (targetOrder) {
          const confirmMsg = buildDeliveryConfirmationWhatsAppMessage({ order: targetOrder });
          const customerPhone = targetOrder.recipientPhone || targetOrder.customerPhone || targetOrder.phone;
          if (customerPhone) {
            const cleanPhone = String(customerPhone).replace(/\\D/g, '');
            const finalPhone = cleanPhone.length === 10 ? \`91\${cleanPhone}\` : cleanPhone;
            const waUrl = createWhatsAppUrl(confirmMsg, finalPhone);
            window.open(waUrl, '_blank');
          }
        }
      } else {
        setErrorMessages(prev => ({ ...prev, [orderId]: result?.message || 'Incorrect OTP code.' }));
        showToast('❌ OTP Verification Failed. Please re-check code with customer.', 'error');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      showToast('❌ Error verifying OTP.', 'error');
    } finally {
      setVerifyingOrderId(null);
    }
  };`;

if (oldVerifyPattern.test(modalSrc)) {
  modalSrc = modalSrc.replace(oldVerifyPattern, newVerifyCode);
  fs.writeFileSync(modalFile, modalSrc, 'utf8');
  console.log('✓ Fixed DeliveryOrdersModal.jsx with async/await OTP verification and auto-wishes');
} else {
  console.log('Note: handleVerifyOtp pattern not matched directly in DeliveryOrdersModal, will inspect lines.');
}

// 3. Update src/pages/AdminDashboardPage.jsx
const adminFile = path.join(__dirname, '../src/pages/AdminDashboardPage.jsx');
let adminSrc = fs.readFileSync(adminFile, 'utf8');

if (!adminSrc.includes('buildDeliveryConfirmationWhatsAppMessage')) {
  adminSrc = adminSrc.replace(
    /import \{ createWhatsAppUrl \} from '\.\.\/config\/whatsapp';/,
    `import { createWhatsAppUrl, buildDeliveryConfirmationWhatsAppMessage } from '../config/whatsapp';\nimport confetti from 'canvas-confetti';`
  );
}

// Enhance handleVerifyOtp in AdminDashboardPage
const oldAdminVerify = /const handleVerifyOtp = \(order\) => \{[\s\S]*?showToast\(`✓ OTP Verified! Order #\${order\.orderId} marked Delivered!`, 'success'\);[\s\S]*?\};/;

const newAdminVerify = `const handleVerifyOtp = (order) => {
    if (otpVerifyInput.trim() === String(order.deliveryOtp)) {
      if (updateOrderStatus) {
        updateOrderStatus(order.orderId, {
          status: 'Delivered',
          deliveredAt: new Date().toISOString(),
          paymentStatus: 'Paid',
          otpVerified: true
        });
      }
      setOtpVerifyInput('');
      showToast(\`🎉 Doorstep OTP Verified! Order #\${order.orderId} marked Delivered!\`, 'success');
      
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}

      // Automatically trigger Congratulations & Celebration wishes to customer
      const customerPhone = order.customerPhone || order.recipientPhone || order.phone;
      if (customerPhone) {
        const confirmMsg = buildDeliveryConfirmationWhatsAppMessage({ order });
        const cleanPhone = String(customerPhone).replace(/\\D/g, '');
        const finalPhone = cleanPhone.length === 10 ? \`91\${cleanPhone}\` : cleanPhone;
        const waUrl = createWhatsAppUrl(confirmMsg, finalPhone);
        window.open(waUrl, '_blank');
      }
    } else {
      showToast('❌ Incorrect Delivery OTP entered. Please check code with customer.', 'error');
    }
  };`;

if (oldAdminVerify.test(adminSrc)) {
  adminSrc = adminSrc.replace(oldAdminVerify, newAdminVerify);
  fs.writeFileSync(adminFile, adminSrc, 'utf8');
  console.log('✓ Updated AdminDashboardPage.jsx with confetti and auto-congratulations wishes');
}

console.log('--- ENHANCEMENT COMPLETE ---');

