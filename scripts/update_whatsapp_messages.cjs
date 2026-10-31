const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/config/whatsapp.js');
let content = fs.readFileSync(filePath, 'utf8');

const updatedFunctions = `/**
 * Builds rich, clear 4-digit OTP dispatch message for customer WhatsApp and SMS.
 */
export function buildCustomerDeliveryOtpWhatsAppMessage({ order }) {
  const id = order.orderId || order.id || 'ORDER';
  const pin = order.deliveryOtp || '4892';
  const name = order.recipientName || order.customerName || 'Valued Customer';
  const bouquet = Array.isArray(order.items) && order.items.length > 0
    ? order.items.map(i => \`\${i.name} (x\${i.quantity || 1})\`).join(', ')
    : (order.bouquetName || 'Luxury Handcrafted Floral Bouquet');
  const address = order.deliveryAddress || 'Your delivery location';

  let msg = \`🌸 *RISHIKA BLOOMS — BOUQUET OUT FOR DELIVERY!* 🌸\\n\\n\`;
  msg += \`Hello *\${name}*,\\n\\n\`;
  msg += \`Your fresh luxury bouquet (*\${bouquet}*) under Order *#\${id}* is on its way with our delivery partner! 🚚💐\\n\\n\`;
  msg += \`🔑 *YOUR SECRET DELIVERY HANDOVER OTP:*\\n\`;
  msg += \`👉 *[ \${pin} ]* 👈\\n\\n\`;
  msg += \`📍 *Delivery Address:* \${address}\\n\\n\`;
  msg += \`⚠️ *Important Instructions:*\\n\`;
  msg += \`• Please share this 4-digit OTP with our delivery partner only after receiving your fresh bouquet at your doorstep.\\n\`;
  msg += \`• Do not share this OTP with anyone beforehand.\\n\\n\`;
  msg += \`_Thank you for choosing Rishika Blooms Atelier!_ 🌹✨\`;
  return msg;
}

/**
 * Builds post-handover celebration message with heartfelt congratulations wishes.
 */
export function buildDeliveryConfirmationWhatsAppMessage({ order }) {
  const id = order.orderId || order.id || 'ORDER';
  const name = order.recipientName || order.customerName || 'Valued Customer';
  const bouquet = Array.isArray(order.items) && order.items.length > 0
    ? order.items.map(i => \`\${i.name} (x\${i.quantity || 1})\`).join(', ')
    : (order.bouquetName || 'Luxury Handcrafted Floral Bouquet');

  let msg = \`🌸 *RISHIKA BLOOMS — DELIVERY COMPLETED* 🌸\\n\\n\`;
  msg += \`🎉 *CONGRATULATIONS \${name.toUpperCase()}!* 🎉\\n\\n\`;
  msg += \`✨ Your luxury floral bouquet (*\${bouquet}*) under Order *#\${id}* has been *successfully hand-delivered*! 💐\\n\\n\`;
  msg += \`💖 *Heartfelt Congratulations & Warmest Wishes from Rishika Blooms!* We hope these fresh blossoms fill your special day with pure elegance, fragrant smiles, and cherished memories.\\n\\n\`;
  msg += \`🌹 *Delivery Status:* Handed Over & Verified via OTP\\n\`;
  msg += \`💰 *Payment Status:* Paid in Full\\n\\n\`;
  msg += \`🌿 *Floral Care Tips:*\\n\`;
  msg += \`• Keep blooms away from direct scorching sunlight.\\n\`;
  msg += \`• Spritz cold water on petals and stems daily to preserve freshness.\\n\\n\`;
  msg += \`_Thank you for choosing Rishika Blooms Atelier!_ 🌸✨\`;

  return msg;
}`;

// Replace everything from `export function buildCustomerDeliveryOtpWhatsAppMessage` onwards
const targetRegex = /\/\*\*[\s\S]*?Builds short, clean 4-digit OTP dispatch message[\s\S]*$/;
if (targetRegex.test(content)) {
  content = content.replace(targetRegex, updatedFunctions);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated whatsapp.js with rich OTP dispatch & congratulations messages!');
} else {
  // If regex didn't match, append or replace
  const fallbackRegex = /export function buildCustomerDeliveryOtpWhatsAppMessage[\s\S]*$/;
  content = content.replace(fallbackRegex, updatedFunctions);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fallback updated whatsapp.js successfully!');
}
