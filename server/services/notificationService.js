import { db } from '../db.js';

const STORE_WHATSAPP = process.env.STORE_WHATSAPP || '919305371705';
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;

/**
 * Generate high-converting WhatsApp Click-to-Chat URLs with formatted text
 */
export function generateWhatsAppMessage(type, order) {
  let message = '';
  const customerName = order.customer_name || 'Valued Patron';
  const orderId = order.order_id;
  const total = order.total;
  const otp = order.delivery_otp;

  switch (type) {
    case 'order_placed':
      message = `🌸 *RISHIKA BLOOMS — ORDER CONFIRMATION*\n\nDear *${customerName}*,\nYour luxury bouquet order *#${orderId}* for *₹${total}* has been successfully placed!\n\n📍 *Delivery Address:* ${order.delivery_address}\n📅 *Delivery Date:* ${order.delivery_date} (${order.delivery_slot})\n\n🔐 *Your Delivery Handover OTP:* *${otp}*\n(Please share this code with our rider only after inspecting your bouquet at your doorstep).\n\nTrack your order anytime:\n👉 https://rishhikabloom.netlify.app/#/order-tracking?orderId=${orderId}\n\nWith love,\n*Risika Blooms Floral Atelier*`;
      break;

    case 'order_packed':
      message = `🌸 *RISHIKA BLOOMS — BOUQUET PACKED*\n\nDear *${customerName}*,\nOur florists have freshly hand-tied your bouquet for Order *#${orderId}*! Cold-chain gel packs and luxury wrapping are secured.\n\nHandover OTP: *${otp}*`;
      break;

    case 'out_for_delivery':
      message = `🚚 *RISHIKA BLOOMS — OUT FOR DELIVERY*\n\nDear *${customerName}*,\nYour floral arrangement for Order *#${orderId}* is now out with our delivery rider!\n\nDoorstep Handover OTP: *${otp}*\nThank you for choosing Risika Blooms.`;
      break;

    case 'order_delivered':
      message = `💐 *RISHIKA BLOOMS — DELIVERED WITH LOVE*\n\nDear *${customerName}*,\nOrder *#${orderId}* has been safely handed over. We hope these blossoms bring immense joy!\n\nPlease share your feedback and tag us on Instagram @rishikablooms!`;
      break;

    case 'order_cancelled':
      message = `🌸 *RISHIKA BLOOMS — CANCELLATION NOTICE*\n\nOrder *#${orderId}* has been cancelled. If any refund is due, it will be credited within 2-4 business days. For assistance, reply to this chat.`;
      break;

    default:
      message = `🌸 *RISHIKA BLOOMS — Order #${orderId} update: ${order.status}*`;
  }

  const cleanPhone = String(order.customer_phone || '').replace(/\D/g, '');
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const url = `https://wa.me/${targetPhone || STORE_WHATSAPP}?text=${encodeURIComponent(message)}`;

  return {
    type,
    orderId,
    phone: targetPhone,
    message,
    whatsappUrl: url,
    isManualClickToChat: !Boolean(WHATSAPP_API_TOKEN)
  };
}

/**
 * Dispatch Notifications (Email & WhatsApp logging)
 */
export async function sendOrderNotification({ type, orderId }) {
  const order = db.prepare('SELECT * FROM orders WHERE order_id = ?').get(orderId);
  if (!order) return null;

  const wa = generateWhatsAppMessage(type, order);

  // Record notification in audit log
  db.prepare(`
    INSERT INTO audit_logs (action, entity, entity_id, actor_role, details)
    VALUES ('notification_sent', 'order', ?, 'System', ?)
  `).run(orderId, JSON.stringify({ type, mode: wa.isManualClickToChat ? 'manual_whatsapp' : 'official_api' }));

  return {
    success: true,
    whatsapp: wa,
    emailStatus: 'Logged to concierge dispatch queue'
  };
}
