import { BRAND_CONFIG } from './brand';

/**
 * Returns the active WhatsApp number dynamically (stored by owner or default)
 */
export function getActiveWhatsAppNumber() {
  if (typeof window !== 'undefined') {
    // 1. Check runtime global override
    if (window.__rb_active_whatsapp) {
      const clean = String(window.__rb_active_whatsapp).replace(/[^0-9]/g, '');
      if (clean) return clean.length === 10 ? `91${clean}` : clean;
    }
    // 2. Check local storage saved brand config
    try {
      const saved = localStorage.getItem('rb_brand_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        const raw = parsed.whatsappNumber || parsed.phone;
        if (raw) {
          const clean = String(raw).replace(/[^0-9]/g, '');
          if (clean) return clean.length === 10 ? `91${clean}` : clean;
        }
      }
    } catch (e) {
      console.warn('Error reading stored WhatsApp number:', e);
    }
  }
  const defaultRaw = String(BRAND_CONFIG.whatsappNumber || '919305371705').replace(/[^0-9]/g, '');
  return defaultRaw.length === 10 ? `91${defaultRaw}` : defaultRaw;
}

/**
 * Builds an official WhatsApp click-to-chat URL with pre-filled, cleanly formatted text.
 * International number without '+' as required by WhatsApp wa.me format.
 */
export function createWhatsAppUrl(messageText, overrideNumber = null) {
  let targetNumber = overrideNumber || getActiveWhatsAppNumber();
  let cleanNumber = String(targetNumber).replace(/[^0-9]/g, '');
  if (cleanNumber.length === 10) {
    cleanNumber = `91${cleanNumber}`;
  }
  const encodedText = encodeURIComponent((messageText || '').trim());
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}

/**
 * Generates a concise, clean order message for direct product order.
 */
export function buildProductWhatsAppMessage({
  orderId = "",
  product,
  selectedColor,
  quantity = 1,
  unitPrice,
  customerName = "",
  recipientName = "",
  recipientPhone = "",
  deliveryAddress = "",
  pincode = "",
  deliverySlot = "",
  addOns = []
}) {
  const totalPrice = unitPrice * quantity + (addOns?.reduce((acc, curr) => acc + curr.price, 0) || 0);
  const client = recipientName || customerName || "Customer";
  const id = orderId || `RB-${Math.floor(100000 + Math.random() * 900000)}`;

  let msg = `🌸 *New Order #${id}*\n`;
  msg += `💐 *Bouquet:* ${product.name} (Qty: ${quantity}${selectedColor ? `, ${selectedColor}` : ''})\n`;
  msg += `💰 *Total Amount:* ₹${totalPrice}\n`;
  msg += `👤 *Customer:* ${client}${recipientPhone ? ` (${recipientPhone})` : ''}\n`;
  if (deliveryAddress || pincode) msg += `📍 *Address:* ${deliveryAddress || ''}${pincode ? ` (${pincode})` : ''}\n`;
  if (deliverySlot) msg += `⏰ *Slot:* ${deliverySlot}\n`;
  msg += `_Please confirm my order!_`;

  return msg;
}

/**
 * Generates a concise, clean message for full cart checkout.
 */
export function buildCartWhatsAppMessage({
  orderId = "",
  cartItems = [],
  total,
  customerName = "",
  recipientName = "",
  recipientPhone = "",
  deliveryAddress = "",
  pincode = "",
  deliverySlot = ""
}) {
  const client = recipientName || customerName || "Customer";
  const id = orderId || `RB-${Math.floor(100000 + Math.random() * 900000)}`;
  const itemsText = cartItems.map((item) => `${item.name} (x${item.quantity})`).join(', ');

  let msg = `🌸 *New Order #${id}*\n`;
  msg += `🛍️ *Items:* ${itemsText}\n`;
  msg += `💰 *Total Amount:* ₹${total}\n`;
  msg += `👤 *Customer:* ${client}${recipientPhone ? ` (${recipientPhone})` : ''}\n`;
  if (deliveryAddress || pincode) msg += `📍 *Address:* ${deliveryAddress || ''}${pincode ? ` (${pincode})` : ''}\n`;
  if (deliverySlot) msg += `⏰ *Slot:* ${deliverySlot}\n`;
  msg += `_Please confirm my order!_`;

  return msg;
}

/**
 * Builds a short, clean WhatsApp message for Custom "Build Your Own Bouquet".
 */
export function buildCustomBouquetWhatsAppMessage({
  orderId = "",
  stemsSummary = [],
  totalPrice,
  customerName = "",
  pincode = ""
}) {
  const id = orderId || `RB-${Math.floor(100000 + Math.random() * 900000)}`;
  const stemsText = stemsSummary.map(s => `${s.count}x ${s.name}`).join(', ');

  let msg = `🌸 *Custom Bouquet #${id}*\n`;
  msg += `💐 *Flowers:* ${stemsText}\n`;
  msg += `💰 *Total:* ₹${totalPrice}\n`;
  if (customerName) msg += `👤 *Customer:* ${customerName}\n`;
  if (pincode) msg += `📮 *PIN:* ${pincode}\n`;
  msg += `_Please confirm my order!_`;

  return msg;
}

/**
 * Builds rich, clear 4-digit OTP dispatch message for customer WhatsApp and SMS.
 */
export function buildCustomerDeliveryOtpWhatsAppMessage({ order }) {
  const id = order.orderId || order.id || 'ORDER';
  const pin = order.deliveryOtp || '4892';
  const name = order.recipientName || order.customerName || 'Valued Customer';
  const bouquet = Array.isArray(order.items) && order.items.length > 0
    ? order.items.map(i => `${i.name} (x${i.quantity || 1})`).join(', ')
    : (order.bouquetName || 'Luxury Handcrafted Floral Bouquet');
  const address = order.deliveryAddress || 'Your delivery address';

  let msg = `🌸 *RISHIKA BLOOMS — BOUQUET OUT FOR DELIVERY!* 🌸\n\n`;
  msg += `Hello *${name}*,\n\n`;
  msg += `Your fresh luxury bouquet (*${bouquet}*) under Order *#${id}* is on its way with our delivery partner! 🚚💐\n\n`;
  msg += `🔑 *YOUR SECRET DELIVERY HANDOVER OTP:*\n`;
  msg += `👉 *[ ${pin} ]* 👈\n\n`;
  msg += `📍 *Delivery Address:* ${address}\n\n`;
  msg += `⚠️ *Important Instructions:*\n`;
  msg += `• Please share this 4-digit OTP with our delivery rider only after collecting your fresh bouquet at your doorstep.\n`;
  msg += `• Do not share this OTP with anyone beforehand.\n\n`;
  msg += `_Thank you for choosing Rishika Blooms Atelier!_ 🌹✨`;
  return msg;
}

/**
 * Builds post-handover celebration message with heartfelt congratulations wishes.
 */
export function buildDeliveryConfirmationWhatsAppMessage({ order }) {
  const id = order.orderId || order.id || 'ORDER';
  const name = order.recipientName || order.customerName || 'Valued Customer';
  const bouquet = Array.isArray(order.items) && order.items.length > 0
    ? order.items.map(i => `${i.name} (x${i.quantity || 1})`).join(', ')
    : (order.bouquetName || 'Luxury Handcrafted Floral Bouquet');

  let msg = `🌸 *RISHIKA BLOOMS — DELIVERY COMPLETED* 🌸\n\n`;
  msg += `🎉 *CONGRATULATIONS ${name.toUpperCase()}!* 🎉\n\n`;
  msg += `✨ Your luxury floral bouquet (*${bouquet}*) under Order *#${id}* has been *successfully hand-delivered*! 💐\n\n`;
  msg += `💖 *Heartfelt Congratulations & Warmest Wishes from Rishika Blooms!* We hope these fresh blossoms fill your celebration with pure elegance, beauty, and cherished moments.\n\n`;
  msg += `🌹 *Delivery Status:* Handed Over & Verified via OTP\n`;
  msg += `💰 *Payment Status:* Paid in Full\n\n`;
  msg += `🌿 *Floral Care Tip:*\n`;
  msg += `• Keep blooms away from direct scorching sunlight.\n`;
  msg += `• Spritz cold water on petals and stems daily to preserve freshness.\n\n`;
  msg += `_Thank you for choosing Rishika Blooms Atelier!_ 🌸✨`;

  return msg;
}
