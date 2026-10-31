const fs = require('fs');
const path = require('path');

// 1. OrderConfirmationPage.jsx
const confirmPagePath = path.join(__dirname, '../src/pages/OrderConfirmationPage.jsx');
let confirmContent = fs.readFileSync(confirmPagePath, 'utf8');

const oldButtonRegex = /<button[\s\S]*?onClick=\{\(\) => \{[\s\S]*?createWhatsAppUrl\(otpMsg[\s\S]*?Receive OTP on WhatsApp<\/span>[\s\S]*?<\/button>/;

const newCopyButton = `<button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(order.deliveryOtp || '4892');
                  if (showToast) showToast('📋 Delivery Handover OTP copied to clipboard!', 'success');
                }}
                className="btn btn-sm"
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#059669',
                  border: '1px solid #10B981',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  padding: '5px 12px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer'
                }}
              >
                <span>📋 Copy Handover OTP</span>
              </button>`;

if (oldButtonRegex.test(confirmContent)) {
  confirmContent = confirmContent.replace(oldButtonRegex, newCopyButton);
  fs.writeFileSync(confirmPagePath, confirmContent, 'utf8');
  console.log('OrderConfirmationPage.jsx updated with clean Copy Handover OTP button!');
} else {
  console.log('Could not match oldButtonRegex in OrderConfirmationPage.jsx');
}

// 2. DeliveryOrdersModal.jsx
const modalPath = path.join(__dirname, '../src/components/owner/DeliveryOrdersModal.jsx');
let modalContent = fs.readFileSync(modalPath, 'utf8');

// In handleVerifyOtp: Remove WhatsApp redirect
const waAutoDispatchRegex = /\/\/ Automatically dispatch WhatsApp celebration[\s\S]*?window\.open\(waUrl, '_blank'\);\s*\}\s*\}\s*\}/;

if (waAutoDispatchRegex.test(modalContent)) {
  modalContent = modalContent.replace(
    waAutoDispatchRegex,
    `// Delivery verified 100% in-app (Flipkart/Meesho style)\n        showToast('🎉 Delivery verified! Order marked Delivered & Paid.', 'success');`
  );
  console.log('Removed WhatsApp opening from DeliveryOrdersModal handleVerifyOtp!');
}

// In handleSendOtpToCustomer: Remove WhatsApp redirect
const modalSendOtpRegex = /const handleSendOtpToCustomer = \(order\) => \{[\s\S]*?window\.open\(waUrl, '_blank'\);[\s\S]*?\};/;

const newSendOtpFunc = `const handleSendOtpToCustomer = (order) => {
    // 1. Mark Out for Delivery (100% In-App)
    updateOrderStatus(order.orderId || order.id, 'Out for Delivery');
    showToast(\`🚚 Order #\${order.orderId || order.id} marked Out for Delivery! Handover OTP: \${order.deliveryOtp || '4892'}\`, 'success');
  };`;

if (modalSendOtpRegex.test(modalContent)) {
  modalContent = modalContent.replace(modalSendOtpRegex, newSendOtpFunc);
  console.log('Removed WhatsApp opening from DeliveryOrdersModal handleSendOtpToCustomer!');
}

// In handleSendWhatsAppWishes: Replace window.open with toast
const handleWishesRegex = /const handleSendWhatsAppWishes = \(order\) => \{[\s\S]*?window\.open\(waUrl, '_blank'\);\s*\};/;

const newWishesFunc = `const handleSendWhatsAppWishes = (order) => {
    showToast(\`💐 Delivery handover complete for Order #\${order.orderId || order.id}! Verified via OTP.\`, 'success');
  };`;

if (handleWishesRegex.test(modalContent)) {
  modalContent = modalContent.replace(handleWishesRegex, newWishesFunc);
  console.log('Removed WhatsApp opening from handleSendWhatsAppWishes!');
}

fs.writeFileSync(modalPath, modalContent, 'utf8');
console.log('DeliveryOrdersModal.jsx updated successfully!');
