import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data folder exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'risika_ecommerce.db');
const db = new DatabaseSync(dbPath);

// Enable Foreign Key support and WAL mode for high concurrency
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

/**
 * Initialize all database schemas with constraints and indexes
 */
export function initDatabase() {
  db.exec(`
    -- 1. Users (Customers & Admins)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer', -- 'customer' | 'admin' | 'staff'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Customer Saved Delivery Addresses
    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      recipient_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      house_no TEXT NOT NULL,
      street TEXT NOT NULL,
      landmark TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 3. Product Categories
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      name_hindi TEXT,
      tagline TEXT,
      description TEXT,
      image TEXT,
      banner_image TEXT,
      item_count TEXT,
      icon TEXT,
      featured INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. Products Catalog
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY, -- SKU or slug ID (e.g. velvet-bday-royal-blue-tulip-lily-card)
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      name_hindi TEXT,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      category_slug TEXT NOT NULL,
      price REAL NOT NULL,
      sale_price REAL,
      stock INTEGER NOT NULL DEFAULT 50,
      low_stock_threshold INTEGER DEFAULT 10,
      flower_type TEXT,
      colors TEXT, -- JSON array of color options
      sizes TEXT, -- JSON array of size options
      wrapping_styles TEXT, -- JSON array of wrapping options
      ribbon_options TEXT, -- JSON array of ribbon options
      images TEXT, -- JSON array of image URLs
      primary_image TEXT NOT NULL,
      badge TEXT,
      tags TEXT, -- JSON array of tags / occasions
      occasions TEXT, -- JSON array of occasions
      rating REAL DEFAULT 4.9,
      review_count INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      is_bestseller INTEGER DEFAULT 0,
      is_trending INTEGER DEFAULT 0,
      is_premium INTEGER DEFAULT 0,
      status TEXT DEFAULT 'published', -- 'published' | 'draft' | 'archived'
      delivery_prep_hours INTEGER DEFAULT 4,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 5. Inventory Adjustment & Audit Logs
    CREATE TABLE IF NOT EXISTS inventory_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL,
      change_type TEXT NOT NULL, -- 'order_placed' | 'order_cancelled' | 'restock' | 'manual_adjustment'
      change_amount INTEGER NOT NULL,
      previous_stock INTEGER NOT NULL,
      new_stock INTEGER NOT NULL,
      reason TEXT,
      created_by TEXT DEFAULT 'System',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- 6. Discount Coupons
    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discount_percent REAL DEFAULT 0,
      discount_flat REAL DEFAULT 0,
      min_spend REAL DEFAULT 0,
      max_discount REAL,
      description TEXT,
      valid_until DATETIME,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 7. Orders (Meesho / Flipkart Architecture)
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT UNIQUE NOT NULL, -- e.g. RB-2026-874291
      user_id INTEGER, -- Nullable for guest checkout
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      recipient_name TEXT NOT NULL,
      recipient_phone TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      house_no TEXT,
      street TEXT,
      landmark TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      delivery_date TEXT NOT NULL,
      delivery_slot TEXT NOT NULL,
      gift_message TEXT,
      subtotal REAL NOT NULL,
      delivery_fee REAL NOT NULL DEFAULT 0,
      discount_amount REAL NOT NULL DEFAULT 0,
      coupon_code TEXT,
      tax_amount REAL DEFAULT 0,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL, -- 'COD' | 'Razorpay' | 'UPI_QR'
      payment_status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending' | 'Paid' | 'Failed' | 'Refunded'
      payment_id TEXT, -- Gateway transaction / UTR reference
      status TEXT NOT NULL DEFAULT 'Order Placed',
      delivery_otp TEXT NOT NULL, -- 4-digit handover code
      courier_provider TEXT DEFAULT 'Risika Express Logistics',
      tracking_number TEXT,
      tracking_url TEXT,
      shipping_mode TEXT DEFAULT 'manual', -- 'manual' | 'shiprocket'
      customer_notes TEXT,
      admin_notes TEXT,
      cancellation_reason TEXT,
      cancellation_requested_at DATETIME,
      cancelled_at DATETIME,
      refund_status TEXT DEFAULT 'None', -- 'None' | 'Pending' | 'Refunded'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- 8. Order Line Items (Product & Variant Snapshot)
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      product_image TEXT,
      sku TEXT,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      selected_color TEXT,
      selected_size TEXT,
      selected_wrap TEXT,
      selected_ribbon TEXT,
      add_ons TEXT, -- JSON array of add-ons
      customization_notes TEXT,
      subtotal REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
    );

    -- 9. Order Status History (Audit Trail)
    CREATE TABLE IF NOT EXISTS order_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      status TEXT NOT NULL,
      previous_status TEXT,
      note TEXT,
      updated_by TEXT NOT NULL DEFAULT 'System',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
    );

    -- 10. Shipments (Courier Integration & Manual Shipping)
    CREATE TABLE IF NOT EXISTS shipments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      provider TEXT NOT NULL DEFAULT 'Risika Express Logistics',
      tracking_number TEXT NOT NULL,
      tracking_url TEXT,
      status TEXT DEFAULT 'Shipment Created',
      courier_id TEXT,
      label_url TEXT,
      manifest_id TEXT,
      estimated_delivery_date TEXT,
      pickup_scheduled_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
    );

    -- 11. Payments & Gateway Transactions
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      gateway TEXT NOT NULL, -- 'Razorpay' | 'UPI' | 'COD'
      transaction_id TEXT,
      gateway_order_id TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'INR',
      status TEXT NOT NULL, -- 'Pending' | 'Success' | 'Failed' | 'Refunded'
      payment_method_details TEXT, -- card, upi, netbanking
      raw_payload TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
    );

    -- 12. Refunds
    CREATE TABLE IF NOT EXISTS refunds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      payment_id INTEGER,
      amount REAL NOT NULL,
      reason TEXT,
      status TEXT DEFAULT 'Pending', -- 'Pending' | 'Processed' | 'Failed'
      gateway_refund_id TEXT,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
    );

    -- 13. Customer Product Reviews
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL,
      photos TEXT, -- JSON array of image URLs
      is_verified_purchase INTEGER DEFAULT 1,
      is_approved INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- 14. Website & Brand Settings
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 15. System Audit Logs
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT,
      actor_id TEXT,
      actor_role TEXT,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexes for high-speed queries
    CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
    CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_order_history_order_id ON order_status_history(order_id);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_slug);
    CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
    CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
  `);

  console.log('✅ SQLite persistent database schema verified at:', dbPath);
}

/**
 * Seed Default Data: Admin, Categories, Products, Coupons, Settings
 */
export async function seedInitialData(initialCategories, initialProducts, brandConfig) {
  // Check if admin user exists
  const adminCheck = db.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('admin');
  if (!adminCheck) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('risika2026', salt);
    db.prepare(`
      INSERT INTO users (name, email, phone, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `).run('Risika Store Admin', 'admin@rishikablooms.com', '919305371705', passwordHash, 'admin');
    console.log('👑 Default Admin Account initialized (admin@rishikablooms.com / risika2026)');
  }

  // Seed Brand Settings
  const settingsCheck = db.prepare('SELECT key FROM site_settings WHERE key = ?').get('brand_config');
  if (!settingsCheck && brandConfig) {
    db.prepare(`
      INSERT OR REPLACE INTO site_settings (key, value)
      VALUES (?, ?)
    `).run('brand_config', JSON.stringify(brandConfig));
  }

  // Seed Coupons
  const couponCount = db.prepare('SELECT COUNT(*) as count FROM coupons').get();
  if (couponCount.count === 0 && brandConfig?.coupons) {
    const insertCoupon = db.prepare(`
      INSERT INTO coupons (code, discount_percent, discount_flat, min_spend, description)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const c of brandConfig.coupons) {
      insertCoupon.run(
        c.code,
        c.discountPercent || 0,
        c.discountFlat || 0,
        c.minSpend || 0,
        c.description || ''
      );
    }
    console.log(`🎟️ Seeded ${brandConfig.coupons.length} promotional coupons`);
  }

  // Seed Categories
  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (catCount.count === 0 && Array.isArray(initialCategories)) {
    const insertCat = db.prepare(`
      INSERT OR IGNORE INTO categories (slug, name, name_hindi, tagline, description, image, banner_image, item_count, icon, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const cat of initialCategories) {
      insertCat.run(
        cat.slug || cat.id,
        cat.name,
        cat.nameHindi || cat.name,
        cat.tagline || '',
        cat.description || '',
        cat.image || '',
        cat.bannerImage || cat.image || '',
        cat.itemCount || 'Available',
        cat.icon || 'Flower2',
        cat.featured ? 1 : 0
      );
    }
    console.log(`🌸 Seeded ${initialCategories.length} product categories`);
  }

  // Seed Products (Ensures all 43 luxury catalog products exist with unique SKUs)
  if (Array.isArray(initialProducts)) {
    const currentProdCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    if (currentProdCount < initialProducts.length) {
      // Re-seed cleanly so all 43 products have proper unique SKUs
      db.prepare('DELETE FROM products').run();
    }

    const insertProd = db.prepare(`
      INSERT OR IGNORE INTO products (
        id, sku, name, name_hindi, slug, description, category_slug,
        price, sale_price, stock, flower_type, colors, sizes,
        wrapping_styles, ribbon_options, images, primary_image,
        badge, tags, occasions, rating, review_count,
        is_featured, is_bestseller, is_trending, is_premium, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < initialProducts.length; i++) {
      const p = initialProducts[i];
      const cleanId = String(p.id).toUpperCase().replace(/[^A-Z0-9]/g, '');
      const sku = `RB-${cleanId.slice(0, 14)}-${(i + 1).toString().padStart(3, '0')}`;
      insertProd.run(
        p.id,
        sku,
        p.name,
        p.nameHindi || p.name,
        p.slug || p.id,
        p.description || '',
        p.category || 'rose-bouquets',
        p.price || 999,
        p.originalPrice || null,
        p.stock || 50,
        Array.isArray(p.flowerTypes) ? p.flowerTypes.join(', ') : (p.flowerType || 'Fresh Cut Flowers'),
        JSON.stringify(p.colorOptions || []),
        JSON.stringify(p.sizeOptions || []),
        JSON.stringify(p.wrapOptions || []),
        JSON.stringify(p.ribbonOptions || []),
        JSON.stringify(p.images || [p.image]),
        p.image || '/images/bday_royal_blue_tulip_lily_card.jpg',
        p.badge || (p.isBestSeller ? 'Bestseller' : null),
        JSON.stringify(p.tags || []),
        JSON.stringify(p.occasions || []),
        p.rating || 4.9,
        p.reviewCount || 10,
        p.isFeatured ? 1 : 0,
        p.isBestSeller ? 1 : 0,
        p.isTrending ? 1 : 0,
        p.isPremium ? 1 : 0,
        'published'
      );
    }
  }
}

/**
 * Execute within a Database Transaction
 */
export function runTransaction(fn) {
  db.exec('BEGIN TRANSACTION;');
  try {
    const result = fn(db);
    db.exec('COMMIT;');
    return result;
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

export { db };
export default db;
