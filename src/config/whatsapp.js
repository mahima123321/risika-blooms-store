import { BRAND_CONFIG } from './brand';

/**
 * Returns the active WhatsApp number dynamically (stored by owner or default)
 */
export function getActiveWhatsAppNumber() {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('rb_brand_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.whatsappNumber) {
          return String(parsed.whatsappNumber).trim();
        }
      }
    } catch (e) {
      console.warn('Error reading stored WhatsApp number:', e);
    }
  }
  return BRAND_CONFIG.whatsappNumber;
}

/**
 * Builds an official WhatsApp click-to-chat URL with pre-filled, cleanly formatted text.
 * International number without '+' as required by WhatsApp wa.me format.
 */
export function createWhatsAppUrl(messageText, overrideNumber = null) {
  const targetNumber = overrideNumber || getActiveWhatsAppNumber();
  const cleanNumber = String(targetNumber).replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent((messageText || '').trim());
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}

/**
 * Generates an inquiry message for direct product order.
 */
export function buildProductWhatsAppMessage({
  product,
  selectedColor,
  selectedSize,
  selectedWrap,
  selectedRibbon,
  quantity = 1,
  unitPrice,
  customerName = "",
  recipientName = "",
  recipientPhone = "",
  deliveryAddress = "",
  pincode = "",
  deliveryDate = "",
  deliverySlot = "Standard Delivery (1 PM - 5 PM)",
  giftMessage = "",
  addOns = []
}) {
  const totalPrice = unitPrice * quantity + (addOns.reduce((acc, curr) => acc + curr.price, 0));

  let msg = `🌸 *NEW ORDER INQUIRY — ROSHIKA BLOOMS* 🌸\n`;
  msg += `─────────────────────────\n`;
  msg += `🌹 *Product:* ${product.name}\n`;
  if (selectedColor) msg += `🎨 *Selected Color:* ${selectedColor}\n`;
  if (selectedSize) msg += `📏 *Bouquet Size:* ${selectedSize}\n`;
  if (selectedWrap) msg += `📜 *Wrapping Paper:* ${selectedWrap}\n`;
  if (selectedRibbon) msg += `🎀 *Ribbon Style:* ${selectedRibbon}\n`;
  msg += `🔢 *Quantity:* ${quantity}\n`;
  msg += `💰 *Item Price:* ₹${unitPrice} (Subtotal: ₹${unitPrice * quantity})\n`;

  if (addOns && addOns.length > 0) {
    msg += `✨ *Add-ons:* ${addOns.map(a => `${a.name} (+₹${a.price})`).join(', ')}\n`;
  }

  msg += `💵 *Total Estimated Amount:* ₹${totalPrice}\n`;
  msg += `─────────────────────────\n`;
  msg += `👤 *Customer Name:* ${customerName || "Customer"}\n`;
  if (recipientName) msg += `🎁 *Recipient Name:* ${recipientName}\n`;
  if (recipientPhone) msg += `📞 *Recipient Phone:* ${recipientPhone}\n`;
  if (deliveryAddress) msg += `📍 *Delivery Address:* ${deliveryAddress}\n`;
  if (pincode) msg += `📮 *PIN Code:* ${pincode}\n`;
  if (deliveryDate) msg += `📅 *Preferred Date:* ${deliveryDate}\n`;
  if (deliverySlot) msg += `⏰ *Time Slot:* ${deliverySlot}\n`;

  if (giftMessage && giftMessage.trim()) {
    msg += `💌 *Personal Gift Message:*\n"${giftMessage.trim()}"\n`;
  }

  msg += `─────────────────────────\n`;
  msg += `✨ *Tagline:* "Every Bloom Tells a Story."\n`;
  msg += `_Note: Please confirm flower availability, delivery slot, and final payment details._`;

  return msg;
}

/**
 * Generates an inquiry message for full cart checkout.
 */
export function buildCartWhatsAppMessage({
  cartItems,
  subtotal,
  discount = 0,
  deliveryFee = 0,
  total,
  couponCode = "",
  customerName = "",
  recipientName = "",
  recipientPhone = "",
  deliveryAddress = "",
  pincode = "",
  deliveryDate = "",
  deliverySlot = "Standard Delivery (1 PM - 5 PM)",
  giftMessage = ""
}) {
  let msg = `🌸 *COMPLETE SHOPPING BAG ORDER — ROSHIKA BLOOMS* 🌸\n`;
  msg += `─────────────────────────\n`;
  msg += `🛍️ *Order Items (${cartItems.length}):*\n\n`;

  cartItems.forEach((item, idx) => {
    msg += `${idx + 1}. *${item.name}* (Qty: ${item.quantity})\n`;
    if (item.selectedColor) msg += `   • Color: ${item.selectedColor}\n`;
    if (item.selectedSize) msg += `   • Size: ${item.selectedSize}\n`;
    if (item.selectedWrap) msg += `   • Wrap: ${item.selectedWrap}\n`;
    if (item.selectedRibbon) msg += `   • Ribbon: ${item.selectedRibbon}\n`;
    if (item.customDetails) msg += `   • Custom: ${item.customDetails}\n`;
    msg += `   • Price: ₹${item.price} x ${item.quantity} = ₹${item.price * item.quantity}\n\n`;
  });

  msg += `─────────────────────────\n`;
  msg += `💳 *BILLING SUMMARY*\n`;
  msg += `• Subtotal: ₹${subtotal}\n`;
  if (discount > 0) {
    msg += `• Discount (${couponCode || "Coupon"}): -₹${discount}\n`;
  }
  msg += `• Delivery Fee: ₹${deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}\n`;
  msg += `• *Grand Total:* ₹${total}\n`;
  msg += `─────────────────────────\n`;
  msg += `📍 *DELIVERY & RECIPIENT DETAILS*\n`;
  msg += `• Customer: ${customerName || "Customer"}\n`;
  if (recipientName) msg += `• Recipient: ${recipientName}\n`;
  if (recipientPhone) msg += `• Phone: ${recipientPhone}\n`;
  if (deliveryAddress) msg += `• Address: ${deliveryAddress}\n`;
  if (pincode) msg += `• PIN Code: ${pincode}\n`;
  if (deliveryDate) msg += `• Delivery Date: ${deliveryDate}\n`;
  if (deliverySlot) msg += `• Slot: ${deliverySlot}\n`;

  if (giftMessage && giftMessage.trim()) {
    msg += `\n💌 *Gift Card Message:*\n"${giftMessage.trim()}"\n`;
  }

  msg += `─────────────────────────\n`;
  msg += `_I would like to place this order with ROSHIKA BLOOMS. Please verify availability and share payment link._`;

  return msg;
}

/**
 * Builds WhatsApp message for Custom "Build Your Own Bouquet".
 */
export function buildCustomBouquetWhatsAppMessage({
  stemsSummary,
  wrapping,
  ribbon,
  extras = [],
  giftMessage,
  totalPrice,
  customerName = "",
  pincode = "",
  deliveryDate = ""
}) {
  let msg = `🎨 *CUSTOM BESPOKE BOUQUET CREATION — ROSHIKA BLOOMS* 🎨\n`;
  msg += `─────────────────────────\n`;
  msg += `🌸 *Floral Composition:*\n`;
  stemsSummary.forEach(stem => {
    msg += ` • ${stem.name} (${stem.color}): ${stem.count} stems (₹${stem.price * stem.count})\n`;
  });
  msg += `📜 *Wrapping Paper:* ${wrapping.name}\n`;
  msg += `🎀 *Ribbon Style:* ${ribbon.name}\n`;

  if (extras.length > 0) {
    msg += `✨ *Luxury Add-ons:* ${extras.map(e => `${e.name} (+₹${e.price})`).join(', ')}\n`;
  }

  msg += `💰 *Calculated Price:* ₹${totalPrice}\n`;
  msg += `─────────────────────────\n`;
  if (customerName) msg += `👤 *Customer Name:* ${customerName}\n`;
  if (pincode) msg += `📮 *Delivery PIN:* ${pincode}\n`;
  if (deliveryDate) msg += `📅 *Target Date:* ${deliveryDate}\n`;
  if (giftMessage) msg += `💌 *Card Message:*\n"${giftMessage}"\n`;
  msg += `─────────────────────────\n`;
  msg += `_Please review my custom bouquet design and confirm master florist preparation._`;

  return msg;
}
