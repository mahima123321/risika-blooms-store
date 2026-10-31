const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/config/whatsapp.js');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `/**
 * Builds short, clean 4-digit OTP dispatch message for customer WhatsApp.
 */
export function buildCustomerDeliveryOtpWhatsAppMessage({ order }) {
  const id = order.orderId || order.id;
  const pin = order.deliveryOtp || '4892';
  return \`🌸 *RISHIKA BLOOMS*\\nOrder #\${id} Handover OTP:\\n👉 *\${pin}* 👈\\n\\nPlease share this 4-digit code with our delivery rider at your doorstep.\`;
}

/**
 * Builds short post-handover celebration message.
 */
export function buildDeliveryConfirmationWhatsAppMessage({ order }) {
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

const replacementStr = `/**
 * Builds rich, clear 4-digit OTP dispatch message for customer WhatsApp and SMS.
 */
export function buildCustomerDeliveryOtpWhatsAppMessage({ order }) {
  const id = order.orderId || order.id || 'ORDER';
  const pin = order.deliveryOtp || '4892';
  const name = order.recipientName || order.customerName || 'Valued Customer';
  const bouquet = Array.isArray(order.items) && order.items.length > 0
    ? order.items.map(i => \`\${i.name} (x\${i.quantity || 1})\`).join(', ')
    : (order.bouquetName || 'Luxury Handcrafted Floral Bouquet');
  const address = order.deliveryAddress || 'Your delivery address';

  let msg = \`🌸 *RISHIKA BLOOMS — BOUQUET OUT FOR DELIVERY!* 🌸\\n\\n\`;
  msg += \`Hello *\${name}*,\\n\\n\`;
  msg += \`Your fresh luxury bouquet (*\${bouquet}*) under Order *#\${id}* is on its way with our delivery partner! 🚚💐\\n\\n\`;
  msg += \`🔑 *YOUR SECRET DELIVERY HANDOVER OTP:*\\n\`;
  msg += \`👉 *[ \${pin} ]* 👈\\n\\n\`;
  msg += \`📍 *Delivery Address:* \${address}\\n\\n\`;
  msg += \`⚠️ *Important Instructions:*\\n\`;
  msg += \`• Please share this 4-digit OTP with our delivery rider only after collecting your fresh bouquet at your doorstep.\\n\`;
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
  msg += \`💖 *Heartfelt Congratulations & Warmest Wishes from Rishika Blooms!* We hope these fresh blossoms fill your celebration with pure elegance, beauty, and cherished moments.\\n\\n\`;
  msg += \`🌹 *Delivery Status:* Handed Over & Verified via OTP\\n\`;
  msg += \`💰 *Payment Status:* Paid in Full\\n\\n\`;
  msg += \`🌿 *Floral Care Tip:*\\n\`;
  msg += \`• Keep blooms away from direct scorching sunlight.\\n\`;
  msg += \`• Spritz cold water on petals and stems daily to preserve freshness.\\n\\n\`;
  msg += \`_Thank you for choosing Rishika Blooms Atelier!_ 🌸✨\`;

  return msg;
}`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated whatsapp.js precisely!');
} else {
  console.log('Could not find exact targetStr in whatsapp.js, checking alternate line breaks');
  const normalizedContent = content.replace(/\r\n/g, '\n');
  const normalizedTarget = targetStr.replace(/\r\n/g, '\n');
  if (normalizedContent.includes(normalizedTarget)) {
    content = normalizedContent.replace(normalizedTarget, replacementStr);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Normalized match succeeded and updated!');
  } else {
    console.error('Failed to match target');
  }
}
