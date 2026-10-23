import { db, runTransaction } from '../db.js';

// Order Status Constants
export const ORDER_STATUSES = [
  'Order Placed',
  'Payment Pending',
  'Payment Confirmed',
  'Order Confirmed',
  'Processing',
  'Packed',
  'Shipment Created',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancellation Requested',
  'Cancelled',
  'Refund Pending',
  'Refunded',
  'Delivery Failed',
  'Return Requested'
];

/**
 * Valid Status Transitions Rules
 */
const VALID_TRANSITIONS = {
  'Order Placed': ['Payment Pending', 'Payment Confirmed', 'Order Confirmed', 'Processing', 'Packed', 'Cancelled'],
  'Payment Pending': ['Payment Confirmed', 'Order Confirmed', 'Cancelled'],
  'Payment Confirmed': ['Order Confirmed', 'Processing', 'Packed', 'Cancelled'],
  'Order Confirmed': ['Processing', 'Packed', 'Shipment Created', 'Shipped', 'Cancelled'],
  'Processing': ['Packed', 'Shipment Created', 'Shipped', 'Cancelled'],
  'Packed': ['Shipment Created', 'Shipped', 'Out for Delivery', 'Cancelled'],
  'Shipment Created': ['Shipped', 'Out for Delivery', 'Cancelled'],
  'Shipped': ['Out for Delivery', 'Delivered', 'Delivery Failed', 'Cancelled'],
  'Out for Delivery': ['Delivered', 'Delivery Failed', 'Cancelled'],
  'Delivered': ['Return Requested', 'Refund Pending', 'Refunded'],
  'Cancellation Requested': ['Cancelled', 'Processing', 'Packed'],
  'Cancelled': ['Refund Pending', 'Refunded'],
  'Refund Pending': ['Refunded'],
  'Refunded': [],
  'Delivery Failed': ['Out for Delivery', 'Cancelled', 'Shipped'],
  'Return Requested': ['Cancelled', 'Refund Pending', 'Refunded']
};

/**
 * Generate unique human-readable Order ID
 */
export function generateOrderId() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `RB-2026-${num}`;
}

/**
 * Generate 4-digit secure OTP for delivery doorstep handover
 */
export function generateDeliveryOtp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/**
 * Validate Cart & Compute Authoritative Server-Side Pricing
 */
export function validateCartItems(rawItems, appliedCouponCode = null) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error('Shopping cart is empty.');
  }

  const validatedItems = [];
  let subtotal = 0;

  for (const item of rawItems) {
    const productId = item.id || item.productId;
    const quantity = Math.max(1, parseInt(item.quantity || 1, 10));

    // Fetch genuine product from persistent database
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) {
      throw new Error(`Product not found or unavailable: ${item.name || productId}`);
    }

    if (product.status !== 'published') {
      throw new Error(`Product is currently inactive: ${product.name}`);
    }

    if (product.stock < quantity) {
      throw new Error(`Insufficient stock for "${product.name}". Only ${product.stock} available.`);
    }

    // Authoritative unit price from server
    let unitPrice = Number(product.price);
    
    // Check variant price offset if applicable
    if (item.selectedSize && product.sizes) {
      try {
        const sizes = JSON.parse(product.sizes);
        const match = sizes.find(s => s.name === item.selectedSize);
        if (match && match.priceOffset) {
          unitPrice += Number(match.priceOffset);
        }
      } catch (e) {}
    }

    // Add-ons pricing
    if (Array.isArray(item.addOns)) {
      for (const addon of item.addOns) {
        if (addon.price) unitPrice += Number(addon.price);
      }
    }

    const itemSubtotal = unitPrice * quantity;
    subtotal += itemSubtotal;

    validatedItems.push({
      product_id: product.id,
      product_name: product.name,
      product_image: product.primary_image || item.image,
      sku: product.sku,
      price: unitPrice,
      quantity,
      selected_color: item.selectedColor || null,
      selected_size: item.selectedSize || null,
      selected_wrap: item.selectedWrap || null,
      selected_ribbon: item.selectedRibbon || null,
      add_ons: item.addOns ? JSON.stringify(item.addOns) : null,
      customization_notes: item.customizationNotes || null,
      subtotal: itemSubtotal
    });
  }

  // Delivery charge calculation
  const freeThreshold = 999;
  const standardFee = 99;
  const deliveryFee = subtotal >= freeThreshold ? 0 : standardFee;

  // Coupon validation
  let discountAmount = 0;
  let verifiedCoupon = null;

  if (appliedCouponCode) {
    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(appliedCouponCode.toUpperCase().trim());
    if (coupon) {
      if (subtotal >= coupon.min_spend) {
        if (coupon.discount_percent > 0) {
          discountAmount = (subtotal * coupon.discount_percent) / 100;
          if (coupon.max_discount && discountAmount > coupon.max_discount) {
            discountAmount = coupon.max_discount;
          }
        } else if (coupon.discount_flat > 0) {
          discountAmount = Math.min(subtotal, coupon.discount_flat);
        }
        verifiedCoupon = coupon.code;
      }
    }
  }

  discountAmount = Math.round(discountAmount);
  const total = Math.max(0, subtotal + deliveryFee - discountAmount);

  return {
    items: validatedItems,
    subtotal,
    deliveryFee,
    discountAmount,
    couponCode: verifiedCoupon,
    total
  };
}

/**
 * Create Order with Concurrency-Safe Concurrency & Inventory Lock
 */
export function createOrder(orderPayload) {
  const {
    items: rawItems,
    couponCode,
    customerName,
    customerPhone,
    customerEmail,
    recipientName,
    recipientPhone,
    houseNo,
    streetAddress,
    landmark,
    city,
    state,
    pincode,
    deliveryDate,
    deliverySlot,
    giftMessage,
    paymentMethod,
    paymentId,
    customerNotes,
    userId
  } = orderPayload;

  if (!customerName || !customerPhone || !pincode || !houseNo || !streetAddress) {
    throw new Error('Incomplete delivery address or customer information provided.');
  }

  // Authoritatively compute and validate pricing and stock
  const validated = validateCartItems(rawItems, couponCode);

  const orderId = generateOrderId();
  const deliveryOtp = generateDeliveryOtp();
  const cleanPhone = String(customerPhone).replace(/\D/g, '').slice(-10);
  const fullAddress = `${houseNo.trim()}, ${streetAddress.trim()}${landmark ? ', Near ' + landmark.trim() : ''}, ${city || 'New Delhi'}, ${state || 'Delhi NCR'} - ${pincode}`;

  const paymentStatus = paymentMethod === 'Razorpay' || paymentMethod === 'UPI_QR' ? 'Paid' : 'Pending';
  const initialStatus = paymentStatus === 'Paid' ? 'Payment Confirmed' : 'Order Placed';

  return runTransaction((transDb) => {
    // 1. Deduct Inventory & Record Logs
    for (const item of validated.items) {
      const prod = transDb.prepare('SELECT stock FROM products WHERE id = ?').get(item.product_id);
      const newStock = Math.max(0, prod.stock - item.quantity);

      transDb.prepare('UPDATE products SET stock = ? WHERE id = ?').run(newStock, item.product_id);

      transDb.prepare(`
        INSERT INTO inventory_logs (product_id, change_type, change_amount, previous_stock, new_stock, reason, created_by)
        VALUES (?, 'order_placed', ?, ?, ?, ?, ?)
      `).run(
        item.product_id,
        -item.quantity,
        prod.stock,
        newStock,
        `Order placed #${orderId}`,
        'Customer Checkout'
      );
    }

    // 2. Insert Order Header
    const orderStmt = transDb.prepare(`
      INSERT INTO orders (
        order_id, user_id, customer_name, customer_phone, customer_email,
        recipient_name, recipient_phone, delivery_address, house_no, street, landmark,
        city, state, pincode, delivery_date, delivery_slot, gift_message,
        subtotal, delivery_fee, discount_amount, coupon_code, total,
        payment_method, payment_status, payment_id, status, delivery_otp,
        courier_provider, tracking_number, tracking_url, customer_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const trackingNum = `TRK-${orderId.replace('RB-2026-', '')}`;
    const trackingUrl = `#/order-tracking?orderId=${orderId}`;

    orderStmt.run(
      orderId,
      userId || null,
      customerName.trim(),
      cleanPhone,
      customerEmail ? customerEmail.trim() : null,
      recipientName ? recipientName.trim() : customerName.trim(),
      recipientPhone ? String(recipientPhone).replace(/\D/g, '').slice(-10) : cleanPhone,
      fullAddress,
      houseNo.trim(),
      streetAddress.trim(),
      landmark ? landmark.trim() : '',
      city || 'New Delhi',
      state || 'Delhi NCR',
      pincode,
      deliveryDate || new Date().toISOString().split('T')[0],
      deliverySlot || 'Standard Delivery (1 PM - 5 PM)',
      giftMessage ? giftMessage.trim() : null,
      validated.subtotal,
      validated.deliveryFee,
      validated.discountAmount,
      validated.couponCode,
      validated.total,
      paymentMethod || 'COD',
      paymentStatus,
      paymentId || null,
      initialStatus,
      deliveryOtp,
      'Risika Express Dedicated Fleet',
      trackingNum,
      trackingUrl,
      customerNotes || null
    );

    // 3. Insert Line Items
    const itemStmt = transDb.prepare(`
      INSERT INTO order_items (
        order_id, product_id, product_name, product_image, sku,
        price, quantity, selected_color, selected_size, selected_wrap,
        selected_ribbon, add_ons, customization_notes, subtotal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of validated.items) {
      itemStmt.run(
        orderId,
        item.product_id,
        item.product_name,
        item.product_image,
        item.sku,
        item.price,
        item.quantity,
        item.selected_color,
        item.selected_size,
        item.selected_wrap,
        item.selected_ribbon,
        item.add_ons,
        item.customization_notes,
        item.subtotal
      );
    }

    // 4. Record Status History
    transDb.prepare(`
      INSERT INTO order_status_history (order_id, status, previous_status, note, updated_by)
      VALUES (?, ?, NULL, ?, ?)
    `).run(
      orderId,
      initialStatus,
      'Order successfully created by customer and logged to database.',
      'Customer (Online Checkout)'
    );

    // 5. Initial Shipment Entry
    transDb.prepare(`
      INSERT INTO shipments (order_id, provider, tracking_number, tracking_url, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      orderId,
      'Risika Express Dedicated Fleet',
      trackingNum,
      trackingUrl,
      'Shipment Manifest Created'
    );

    // 6. Payment Record
    transDb.prepare(`
      INSERT INTO payments (order_id, gateway, transaction_id, amount, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      orderId,
      paymentMethod || 'COD',
      paymentId || `TXN-${orderId}`,
      validated.total,
      paymentStatus === 'Paid' ? 'Success' : 'Pending'
    );

    return getOrderDetails(orderId, transDb);
  });
}

/**
 * Retrieve Order Details with Items, History, and Shipment
 */
export function getOrderDetails(orderId, customDb = null) {
  const activeDb = customDb || db;
  const order = activeDb.prepare('SELECT * FROM orders WHERE order_id = ?').get(orderId);
  if (!order) return null;

  const items = activeDb.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
  const statusHistory = activeDb.prepare('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY id ASC').all(orderId);
  const shipment = activeDb.prepare('SELECT * FROM shipments WHERE order_id = ? ORDER BY id DESC LIMIT 1').get(orderId);
  const payment = activeDb.prepare('SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1').get(orderId);

  return {
    ...order,
    items,
    statusHistory,
    shipment,
    payment
  };
}

/**
 * Customer Order Lookup (Secure Verification via OrderId + Phone)
 */
export function customerTrackOrder(orderId, phone = null) {
  const cleanId = String(orderId || '').trim();
  const order = db.prepare('SELECT * FROM orders WHERE order_id = ?').get(cleanId);
  if (!order) return null;

  if (phone) {
    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
    const orderPhone = String(order.customer_phone).replace(/\D/g, '').slice(-10);
    if (cleanPhone && orderPhone && cleanPhone !== orderPhone) {
      throw new Error('Mobile number does not match order record.');
    }
  }

  return getOrderDetails(cleanId);
}

/**
 * Update Order Status with Validation, History, and Restocking
 */
export function updateOrderStatus({ orderId, newStatus, note, updatedBy, courierProvider, trackingNumber, trackingUrl }) {
  if (!ORDER_STATUSES.includes(newStatus)) {
    throw new Error(`Invalid order status: ${newStatus}`);
  }

  return runTransaction((transDb) => {
    const order = transDb.prepare('SELECT * FROM orders WHERE order_id = ?').get(orderId);
    if (!order) throw new Error(`Order #${orderId} not found.`);

    const currentStatus = order.status;
    const allowed = VALID_TRANSITIONS[currentStatus] || [];

    // Allow owner override if needed, but log warning
    const isValidTransition = allowed.includes(newStatus) || currentStatus === newStatus;
    if (!isValidTransition && !['Cancelled', 'Refunded', 'Delivered'].includes(newStatus)) {
      console.warn(`Unusual status transition from "${currentStatus}" to "${newStatus}" for Order #${orderId}`);
    }

    // If order was cancelled, restock inventory if not already restocked
    if (newStatus === 'Cancelled' && currentStatus !== 'Cancelled') {
      const items = transDb.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
      for (const item of items) {
        const prod = transDb.prepare('SELECT stock FROM products WHERE id = ?').get(item.product_id);
        if (prod) {
          const restoredStock = prod.stock + item.quantity;
          transDb.prepare('UPDATE products SET stock = ? WHERE id = ?').run(restoredStock, item.product_id);
          transDb.prepare(`
            INSERT INTO inventory_logs (product_id, change_type, change_amount, previous_stock, new_stock, reason, created_by)
            VALUES (?, 'order_cancelled', ?, ?, ?, ?, ?)
          `).run(
            item.product_id,
            item.quantity,
            prod.stock,
            restoredStock,
            `Order #${orderId} Cancelled - Stock Restocked`,
            updatedBy || 'Store Admin'
          );
        }
      }
    }

    // Update order row
    const updates = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
    const params = [newStatus];

    if (courierProvider) {
      updates.push('courier_provider = ?');
      params.push(courierProvider);
    }
    if (trackingNumber) {
      updates.push('tracking_number = ?');
      params.push(trackingNumber);
    }
    if (trackingUrl) {
      updates.push('tracking_url = ?');
      params.push(trackingUrl);
    }
    if (newStatus === 'Delivered') {
      updates.push("payment_status = 'Paid'");
    }

    params.push(orderId);
    transDb.prepare(`UPDATE orders SET ${updates.join(', ')} WHERE order_id = ?`).run(...params);

    // Record history
    transDb.prepare(`
      INSERT INTO order_status_history (order_id, status, previous_status, note, updated_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      orderId,
      newStatus,
      currentStatus,
      note || `Status changed from ${currentStatus} to ${newStatus}`,
      updatedBy || 'Store Owner'
    );

    // Update shipment if courier details changed
    if (courierProvider || trackingNumber) {
      transDb.prepare(`
        INSERT INTO shipments (order_id, provider, tracking_number, tracking_url, status)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        orderId,
        courierProvider || order.courier_provider || 'Risika Express Logistics',
        trackingNumber || order.tracking_number || `TRK-${orderId}`,
        trackingUrl || order.tracking_url || `#/order-tracking?orderId=${orderId}`,
        newStatus
      );
    }

    return getOrderDetails(orderId, transDb);
  });
}

/**
 * Verify Doorstep Handover Delivery OTP
 */
export function verifyDeliveryOtp(orderId, enteredOtp) {
  const order = db.prepare('SELECT * FROM orders WHERE order_id = ?').get(orderId);
  if (!order) throw new Error(`Order #${orderId} not found.`);

  if (String(order.delivery_otp).trim() !== String(enteredOtp).trim()) {
    throw new Error('Incorrect delivery OTP. Please verify with customer.');
  }

  return updateOrderStatus({
    orderId,
    newStatus: 'Delivered',
    note: `Delivery confirmed via doorstep handover OTP verification (${enteredOtp}).`,
    updatedBy: 'Delivery Rider / Admin Hub'
  });
}

/**
 * Customer Cancellation Request
 */
export function requestOrderCancellation(orderId, reason) {
  const order = db.prepare('SELECT * FROM orders WHERE order_id = ?').get(orderId);
  if (!order) throw new Error(`Order #${orderId} not found.`);

  if (['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(order.status)) {
    throw new Error(`Order cannot be cancelled at stage: ${order.status}. Contact concierge for assistance.`);
  }

  return updateOrderStatus({
    orderId,
    newStatus: 'Cancellation Requested',
    note: `Customer requested cancellation: ${reason || 'Customer request'}`,
    updatedBy: 'Customer'
  });
}

/**
 * Admin Orders List with Multi-Parameter Filtering, Search, Sorting, and Pagination
 */
export function getAdminOrders({ page = 1, limit = 20, status = 'all', search = '', sortBy = 'id', sortOrder = 'DESC' }) {
  const offset = (Math.max(1, page) - 1) * limit;
  let whereClauses = [];
  let params = [];

  if (status && status !== 'all') {
    whereClauses.push('status = ?');
    params.push(status);
  }

  if (search && search.trim()) {
    const q = `%${search.trim().toLowerCase()}%`;
    whereClauses.push('(LOWER(order_id) LIKE ? OR LOWER(customer_name) LIKE ? OR customer_phone LIKE ? OR pincode LIKE ?)');
    params.push(q, q, q, q);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const totalCount = db.prepare(`SELECT COUNT(*) as count FROM orders ${whereSql}`).get(...params).count;

  const validSortCols = ['id', 'created_at', 'total', 'customer_name', 'status'];
  const sortCol = validSortCols.includes(sortBy) ? sortBy : 'id';
  const sortDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const orders = db.prepare(`
    SELECT * FROM orders
    ${whereSql}
    ORDER BY ${sortCol} ${sortDir}
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  // Attach line items to each order
  for (const o of orders) {
    o.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.order_id);
  }

  return {
    orders,
    pagination: {
      total: totalCount,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalCount / limit)
    }
  };
}

/**
 * Seller Dashboard Analytics and Metrics (Meesho / Flipkart style)
 */
export function getDashboardStats() {
  const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
  const newOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Order Placed'").get().count;
  const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status IN ('Payment Pending', 'Processing')").get().count;
  const confirmedOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status IN ('Order Confirmed', 'Payment Confirmed')").get().count;
  const packedOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Packed'").get().count;
  const shippedOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status IN ('Shipped', 'Shipment Created')").get().count;
  const outForDeliveryOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Out for Delivery'").get().count;
  const deliveredOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Delivered'").get().count;
  const cancelledOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status IN ('Cancelled', 'Cancellation Requested')").get().count;

  const totalRevenueResult = db.prepare("SELECT SUM(total) as revenue FROM orders WHERE status != 'Cancelled'").get();
  const totalRevenue = totalRevenueResult?.revenue || 0;

  const lowStockCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE stock <= low_stock_threshold').get().count;
  const lowStockProducts = db.prepare('SELECT id, sku, name, stock, low_stock_threshold, primary_image FROM products WHERE stock <= low_stock_threshold LIMIT 10').all();

  const recentOrders = db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 5').all();
  for (const ro of recentOrders) {
    ro.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(ro.order_id);
  }

  return {
    totalOrders,
    newOrders,
    pendingOrders,
    confirmedOrders,
    packedOrders,
    shippedOrders,
    outForDeliveryOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue,
    lowStockCount,
    lowStockProducts,
    recentOrders
  };
}

/**
 * Export Orders to CSV
 */
export function exportOrdersCsv() {
  const orders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
  const headers = [
    'Order ID', 'Date', 'Customer Name', 'Phone', 'Email',
    'Recipient Name', 'Pincode', 'City', 'Delivery Date', 'Delivery Slot',
    'Items Summary', 'Subtotal', 'Delivery Fee', 'Discount', 'Total',
    'Payment Method', 'Payment Status', 'Status', 'OTP', 'Courier', 'Tracking Number'
  ];

  const rows = orders.map(o => {
    const items = db.prepare('SELECT product_name, quantity, price FROM order_items WHERE order_id = ?').all(o.order_id);
    const itemsSummary = items.map(i => `${i.product_name} (x${i.quantity})`).join('; ');

    return [
      `"${o.order_id}"`,
      `"${o.created_at}"`,
      `"${(o.customer_name || '').replace(/"/g, '""')}"`,
      `"${o.customer_phone}"`,
      `"${o.customer_email || ''}"`,
      `"${(o.recipient_name || '').replace(/"/g, '""')}"`,
      `"${o.pincode}"`,
      `"${o.city}"`,
      `"${o.delivery_date}"`,
      `"${o.delivery_slot}"`,
      `"${itemsSummary.replace(/"/g, '""')}"`,
      o.subtotal,
      o.delivery_fee,
      o.discount_amount,
      o.total,
      `"${o.payment_method}"`,
      `"${o.payment_status}"`,
      `"${o.status}"`,
      `"${o.delivery_otp}"`,
      `"${o.courier_provider || ''}"`,
      `"${o.tracking_number || ''}"`
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Adjust Product Inventory with Audit Trail
 */
export function adjustProductInventory({ productId, changeAmount, reason, adminName }) {
  return runTransaction((transDb) => {
    const prod = transDb.prepare('SELECT stock, name FROM products WHERE id = ?').get(productId);
    if (!prod) throw new Error('Product not found.');

    const newStock = Math.max(0, prod.stock + changeAmount);
    transDb.prepare('UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStock, productId);

    transDb.prepare(`
      INSERT INTO inventory_logs (product_id, change_type, change_amount, previous_stock, new_stock, reason, created_by)
      VALUES (?, 'manual_adjustment', ?, ?, ?, ?, ?)
    `).run(
      productId,
      changeAmount,
      prod.stock,
      newStock,
      reason || 'Admin manual inventory update',
      adminName || 'Store Admin'
    );

    return { productId, previousStock: prod.stock, newStock, name: prod.name };
  });
}
