import { Router } from 'express';
import { db } from '../db.js';
import * as authService from '../services/authService.js';
import * as orderService from '../services/orderService.js';
import * as shippingService from '../services/shippingService.js';
import * as paymentService from '../services/paymentService.js';
import * as notificationService from '../services/notificationService.js';
import * as aiService from '../services/aiService.js';

const router = Router();

/**
 * Middleware: Verify Admin Token or Owner Header
 */
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  const pinHeader = req.headers['x-owner-pin'];
  const expectedPin = process.env.ADMIN_PIN || 'risika2026';

  if (pinHeader && pinHeader.trim() === expectedPin) {
    return next();
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyToken(token);
    if (decoded && decoded.role === 'admin') {
      req.admin = decoded;
      return next();
    }
  }

  return res.status(403).json({ error: 'Unauthorized: Admin privileges required.' });
}

/**
 * Middleware: Optional Customer Authentication
 */
function optionalCustomerAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyToken(token);
    if (decoded) req.user = decoded;
  }
  next();
}

// ==========================================
// 1. SYSTEM HEALTH
// ==========================================
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    store: 'Risika Blooms Floral Atelier',
    version: '2.0.0',
    database: 'SQLite Relational Persistent (WAL mode)',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 2. PRODUCTS & CATEGORIES
// ==========================================
router.get('/products', (req, res) => {
  try {
    const { category, search, occasion, minPrice, maxPrice, sort, page = 1, limit = 50 } = req.query;
    let sql = "SELECT * FROM products WHERE status = 'published'";
    const params = [];

    if (category && category !== 'all') {
      sql += ' AND category_slug = ?';
      params.push(category);
    }

    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(tags) LIKE ?)';
      params.push(q, q, q);
    }

    if (occasion && occasion !== 'all') {
      const occPattern = `%${occasion.toLowerCase()}%`;
      sql += ' AND (LOWER(occasions) LIKE ? OR LOWER(tags) LIKE ?)';
      params.push(occPattern, occPattern);
    }

    if (minPrice) {
      sql += ' AND price >= ?';
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      sql += ' AND price <= ?';
      params.push(Number(maxPrice));
    }

    // Sorting
    switch (sort) {
      case 'price-asc':
        sql += ' ORDER BY price ASC';
        break;
      case 'price-desc':
        sql += ' ORDER BY price DESC';
        break;
      case 'rating':
        sql += ' ORDER BY rating DESC, review_count DESC';
        break;
      case 'newest':
        sql += ' ORDER BY id DESC';
        break;
      default:
        sql += ' ORDER BY is_bestseller DESC, is_trending DESC, rating DESC';
        break;
    }

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), offset);

    const products = db.prepare(sql).all(...params);

    // Parse JSON string fields for client consumption
    const parsed = products.map(p => ({
      ...p,
      colorOptions: p.colors ? JSON.parse(p.colors) : [],
      sizeOptions: p.sizes ? JSON.parse(p.sizes) : [],
      wrapOptions: p.wrapping_styles ? JSON.parse(p.wrapping_styles) : [],
      ribbonOptions: p.ribbon_options ? JSON.parse(p.ribbon_options) : [],
      images: p.images ? JSON.parse(p.images) : [p.primary_image],
      image: p.primary_image,
      tags: p.tags ? JSON.parse(p.tags) : [],
      occasions: p.occasions ? JSON.parse(p.occasions) : []
    }));

    res.json({ products: parsed, count: parsed.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/products/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ? OR slug = ?').get(req.params.id, req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    const reviews = db.prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY id DESC').all(product.id);
    const related = db.prepare('SELECT * FROM products WHERE category_slug = ? AND id != ? LIMIT 4').all(product.category_slug, product.id);

    const parsed = {
      ...product,
      colorOptions: product.colors ? JSON.parse(product.colors) : [],
      sizeOptions: product.sizes ? JSON.parse(product.sizes) : [],
      wrapOptions: product.wrapping_styles ? JSON.parse(product.wrapping_styles) : [],
      ribbonOptions: product.ribbon_options ? JSON.parse(product.ribbon_options) : [],
      images: product.images ? JSON.parse(product.images) : [product.primary_image],
      image: product.primary_image,
      tags: product.tags ? JSON.parse(product.tags) : [],
      occasions: product.occasions ? JSON.parse(product.occasions) : [],
      reviews,
      relatedProducts: related
    };

    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/products', requireAdmin, (req, res) => {
  try {
    const p = req.body;
    const id = p.id || `custom-${Date.now()}`;
    const sku = p.sku || `RB-${Math.floor(100000 + Math.random() * 900000)}`;

    db.prepare(`
      INSERT INTO products (
        id, sku, name, name_hindi, slug, description, category_slug,
        price, sale_price, stock, flower_type, colors, sizes,
        wrapping_styles, ribbon_options, images, primary_image,
        badge, tags, occasions, rating, review_count,
        is_featured, is_bestseller, is_trending, is_premium, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      sku,
      p.name,
      p.nameHindi || p.name,
      p.slug || id,
      p.description || '',
      p.category || p.category_slug || 'rose-bouquets',
      Number(p.price) || 999,
      p.originalPrice ? Number(p.originalPrice) : null,
      Number(p.stock) || 50,
      p.flowerType || 'Fresh Flowers',
      JSON.stringify(p.colorOptions || []),
      JSON.stringify(p.sizeOptions || []),
      JSON.stringify(p.wrapOptions || []),
      JSON.stringify(p.ribbonOptions || []),
      JSON.stringify(p.images || [p.image]),
      p.image || '/images/bday_royal_blue_tulip_lily_card.jpg',
      p.badge || null,
      JSON.stringify(p.tags || []),
      JSON.stringify(p.occasions || []),
      4.9,
      1,
      p.isFeatured ? 1 : 0,
      p.isBestSeller ? 1 : 0,
      p.isTrending ? 1 : 0,
      p.isPremium ? 1 : 0,
      'published'
    );

    res.status(201).json({ message: 'Product created successfully', id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/products/:id', requireAdmin, (req, res) => {
  try {
    const p = req.body;
    const prodId = req.params.id;

    db.prepare(`
      UPDATE products SET
        name = ?, price = ?, sale_price = ?, stock = ?, description = ?,
        category_slug = ?, primary_image = ?, is_bestseller = ?, is_trending = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      p.name,
      Number(p.price),
      p.originalPrice ? Number(p.originalPrice) : null,
      Number(p.stock),
      p.description || '',
      p.category || p.category_slug,
      p.image,
      p.isBestSeller ? 1 : 0,
      p.isTrending ? 1 : 0,
      prodId
    );

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/products/:id', requireAdmin, (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY display_order ASC, id ASC').all();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. CART & COUPON VALIDATION
// ==========================================
router.post('/cart/validate', (req, res) => {
  try {
    const { items, couponCode } = req.body;
    const validated = orderService.validateCartItems(items, couponCode);
    res.json(validated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/coupons/validate', (req, res) => {
  try {
    const { code, subtotal = 0 } = req.query;
    if (!code) return res.status(400).json({ error: 'Coupon code is required.' });

    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(code.toUpperCase().trim());
    if (!coupon) return res.status(404).json({ valid: false, message: 'Invalid or expired coupon code.' });

    const spend = Number(subtotal);
    if (spend < coupon.min_spend) {
      return res.status(400).json({
        valid: false,
        message: `This coupon requires a minimum cart value of ₹${coupon.min_spend}.`
      });
    }

    let discount = 0;
    if (coupon.discount_percent > 0) {
      discount = (spend * coupon.discount_percent) / 100;
      if (coupon.max_discount && discount > coupon.max_discount) discount = coupon.max_discount;
    } else if (coupon.discount_flat > 0) {
      discount = Math.min(spend, coupon.discount_flat);
    }

    res.json({
      valid: true,
      code: coupon.code,
      discount: Math.round(discount),
      description: coupon.description
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. ORDERS & CUSTOMER TRACKING
// ==========================================
router.post('/orders', optionalCustomerAuth, (req, res) => {
  try {
    const orderPayload = {
      ...req.body,
      userId: req.user ? req.user.id : null
    };

    const newOrder = orderService.createOrder(orderPayload);

    // Trigger asynchronous notification dispatch
    notificationService.sendOrderNotification({ type: 'order_placed', orderId: newOrder.order_id }).catch(err => {
      console.warn('Notification notice:', err.message);
    });

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/orders/track', (req, res) => {
  try {
    const { orderId, phone } = req.query;
    if (!orderId) return res.status(400).json({ error: 'Order ID is required.' });

    const order = orderService.customerTrackOrder(orderId, phone);
    if (!order) return res.status(404).json({ error: 'No order found with this reference.' });

    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/orders/my-orders', optionalCustomerAuth, (req, res) => {
  try {
    const { phone } = req.query;
    let orders = [];

    if (req.user) {
      orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC').all(req.user.id);
    } else if (phone) {
      const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
      orders = db.prepare('SELECT * FROM orders WHERE customer_phone LIKE ? ORDER BY id DESC').all(`%${cleanPhone}%`);
    } else {
      orders = db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 5').all();
    }

    for (const o of orders) {
      o.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.order_id);
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/orders/:orderId/cancel', (req, res) => {
  try {
    const { reason } = req.body;
    const updated = orderService.requestOrderCancellation(req.params.orderId, reason);
    res.json({ message: 'Cancellation requested successfully', order: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 5. CUSTOMER AUTHENTICATION
// ==========================================
router.post('/auth/register', (req, res) => {
  try {
    const result = authService.registerCustomer(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/auth/login', (req, res) => {
  try {
    const result = authService.loginCustomer(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/auth/profile', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const decoded = authService.verifyToken(authHeader.split(' ')[1]);
    if (!decoded) return res.status(401).json({ error: 'Invalid or expired token.' });

    const profile = authService.getUserProfile(decoded.id);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/address', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const decoded = authService.verifyToken(authHeader.split(' ')[1]);
    if (!decoded) return res.status(401).json({ error: 'Invalid token.' });

    const address = authService.addAddress(decoded.id, req.body);
    res.status(201).json(address);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 6. ADMIN & SELLER HUB (MEESHO / FLIPKART STYLE)
// ==========================================
router.post('/admin/login', (req, res) => {
  try {
    const { pin } = req.body;
    const result = authService.loginAdminWithPin(pin);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

router.get('/admin/dashboard/stats', requireAdmin, (req, res) => {
  try {
    const stats = orderService.getDashboardStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/orders', requireAdmin, (req, res) => {
  try {
    const result = orderService.getAdminOrders(req.query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/orders/:orderId', requireAdmin, (req, res) => {
  try {
    const order = orderService.getOrderDetails(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/orders/:orderId/status', requireAdmin, (req, res) => {
  try {
    const { newStatus, note, courierProvider, trackingNumber, trackingUrl } = req.body;
    const updated = orderService.updateOrderStatus({
      orderId: req.params.orderId,
      newStatus,
      note,
      updatedBy: 'Admin Store Manager',
      courierProvider,
      trackingNumber,
      trackingUrl
    });

    // Notify customer
    notificationService.sendOrderNotification({
      type: newStatus.toLowerCase().replace(/\s+/g, '_'),
      orderId: req.params.orderId
    }).catch(() => {});

    res.json({ message: 'Order status updated successfully', order: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/admin/orders/:orderId/verify-otp', requireAdmin, (req, res) => {
  try {
    const { otp } = req.body;
    const updated = orderService.verifyDeliveryOtp(req.params.orderId, otp);
    res.json({ message: 'Delivery OTP verified successfully! Order marked as Delivered.', order: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/admin/inventory/adjust', requireAdmin, (req, res) => {
  try {
    const { productId, changeAmount, reason } = req.body;
    const result = orderService.adjustProductInventory({
      productId,
      changeAmount: Number(changeAmount),
      reason,
      adminName: 'Store Admin'
    });
    res.json({ message: 'Inventory adjusted successfully', ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/admin/reports/csv', requireAdmin, (req, res) => {
  try {
    const csvData = orderService.exportOrdersCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="risika_orders_export.csv"');
    res.send(csvData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. SHIPPING & PINCODES
// ==========================================
router.post('/shipping/check-serviceability', (req, res) => {
  try {
    const { pincode } = req.body;
    const result = shippingService.checkPincodeServiceability(pincode);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/shipping/create-shipment', requireAdmin, async (req, res) => {
  try {
    const result = await shippingService.createShipment(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/shipping/track/:trackingNumber', (req, res) => {
  try {
    const result = shippingService.getTrackingStatus(req.params.trackingNumber);
    if (!result) return res.status(404).json({ error: 'Tracking number not found.' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. PAYMENT GATEWAY
// ==========================================
router.get('/payment/config', (req, res) => {
  res.json(paymentService.getPaymentConfig());
});

router.post('/payment/create-order', async (req, res) => {
  try {
    const { orderId, amount, currency } = req.body;
    const result = await paymentService.createPaymentOrder({ orderId, amount, currency });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/payment/verify', (req, res) => {
  try {
    const result = paymentService.verifyPaymentSignature(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/payment/webhook', (req, res) => {
  try {
    const rawBody = JSON.stringify(req.body);
    const signature = req.headers['x-razorpay-signature'];
    const result = paymentService.handlePaymentWebhook(rawBody, signature);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 9. AI FEATURES & FAQ ASSISTANT
// ==========================================
router.post('/ai/recommendations', (req, res) => {
  try {
    const result = aiService.getFloralRecommendations(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/ai/search', (req, res) => {
  try {
    const { query } = req.body;
    const results = aiService.searchProductsNaturalLanguage(query);
    res.json({ query, results });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/ai/faq', (req, res) => {
  try {
    const { question } = req.body;
    const result = aiService.answerCustomerFaq(question);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 10. SITE SETTINGS
// ==========================================
router.get('/settings', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM site_settings').all();
    const map = {};
    for (const s of settings) {
      try {
        map[s.key] = JSON.parse(s.value);
      } catch {
        map[s.key] = s.value;
      }
    }
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/settings', requireAdmin, (req, res) => {
  try {
    const updates = req.body;
    for (const [key, val] of Object.entries(updates)) {
      const stringVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
      db.prepare(`
        INSERT INTO site_settings (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
      `).run(key, stringVal);
    }
    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
