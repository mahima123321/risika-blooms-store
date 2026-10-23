import { db, seedInitialData } from '../db.js';
import * as authService from '../services/authService.js';
import * as orderService from '../services/orderService.js';
import * as shippingService from '../services/shippingService.js';
import * as paymentService from '../services/paymentService.js';
import * as aiService from '../services/aiService.js';
import { CATEGORIES } from '../../src/data/categories.js';
import { INITIAL_PRODUCTS } from '../../src/data/products.js';
import { BRAND_CONFIG } from '../../src/config/brand.js';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ [FAIL] ${testName}`);
  }
}

async function runComprehensiveTests() {
  console.log('====================================================');
  console.log('🌸 RISIKA BLOOMS — 20-POINT COMPREHENSIVE TEST SUITE');
  console.log('====================================================\n');

  // Ensure full seed is synchronized
  await seedInitialData(CATEGORIES, INITIAL_PRODUCTS, BRAND_CONFIG);

  // Test 1: Database Initialization & Tables
  console.log('Test Group 1: Database Schemas & Relational Integrity');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
  assert(tables.includes('users'), 'Table "users" exists');
  assert(tables.includes('products'), 'Table "products" exists');
  assert(tables.includes('categories'), 'Table "categories" exists');
  assert(tables.includes('orders'), 'Table "orders" exists');
  assert(tables.includes('order_items'), 'Table "order_items" exists');
  assert(tables.includes('order_status_history'), 'Table "order_status_history" exists');
  assert(tables.includes('inventory_logs'), 'Table "inventory_logs" exists');
  assert(tables.includes('coupons'), 'Table "coupons" exists');

  // Test 2: Product Catalog & Stock
  console.log('\nTest Group 2: Products Catalog & Seed Integrity');
  const prods = db.prepare('SELECT * FROM products').all();
  assert(prods.length >= 40, `Products table populated with ${prods.length} luxury items (>= 40)`);
  const firstProd = prods[0];
  assert(firstProd.sku && firstProd.price > 0 && firstProd.stock > 0, `Product #${firstProd.id} has SKU (${firstProd.sku}), price (₹${firstProd.price}), and stock (${firstProd.stock})`);

  // Test 3: Categories Catalog
  console.log('\nTest Group 3: Categories & Visual Assets');
  const cats = db.prepare('SELECT * FROM categories').all();
  assert(cats.length >= 10, `Categories populated with ${cats.length} collections (>= 10)`);
  const roseCat = cats.find(c => c.slug === 'rose-bouquets');
  assert(roseCat && (roseCat.name_hindi || roseCat.nameHindi), 'Rose category contains authentic Hindi name');

  // Test 4: Pricing & Cart Server-Side Validation
  console.log('\nTest Group 4: Server-Side Cart & Pricing Validation');
  const testCart = [
    { id: firstProd.id, quantity: 2, selectedColor: 'Royal Azure' }
  ];
  const validatedCart = orderService.validateCartItems(testCart, 'BLOOM10');
  assert(validatedCart.subtotal === firstProd.price * 2, `Authoritative subtotal matches product price (₹${validatedCart.subtotal})`);
  assert(validatedCart.discountAmount > 0, `Coupon BLOOM10 discount applied (₹${validatedCart.discountAmount} off)`);
  assert(validatedCart.total === validatedCart.subtotal + validatedCart.deliveryFee - validatedCart.discountAmount, `Final total computed correctly (₹${validatedCart.total})`);

  // Test 5: Stock Validation Error Handling
  console.log('\nTest Group 5: Insufficient Stock Protection');
  let stockErrorCaught = false;
  try {
    orderService.validateCartItems([{ id: firstProd.id, quantity: 999999 }]);
  } catch (e) {
    stockErrorCaught = true;
  }
  assert(stockErrorCaught, 'Attempting to checkout more stock than available throws error');

  // Test 6: Order Creation with Unique Order ID & 4-digit OTP
  console.log('\nTest Group 6: Atomic Order Creation & Concurrency');
  const initialStock = db.prepare('SELECT stock FROM products WHERE id = ?').get(firstProd.id).stock;
  const createdOrder = orderService.createOrder({
    items: testCart,
    couponCode: 'BLOOM10',
    customerName: 'Priya Sharma',
    customerPhone: '9876543210',
    customerEmail: 'priya@example.com',
    recipientName: 'Sneha Verma',
    recipientPhone: '9876543210',
    houseNo: 'Villa 14',
    streetAddress: 'Palm Avenue, Sector 54',
    landmark: 'Opposite Golf Course',
    city: 'Gurugram',
    state: 'Delhi NCR',
    pincode: '122002',
    deliveryDate: '2026-10-25',
    deliverySlot: 'Standard Delivery (1 PM - 5 PM)',
    giftMessage: 'Happy Birthday Sneha! Wishing you endless blooms.',
    paymentMethod: 'COD'
  });

  assert(createdOrder.order_id && createdOrder.order_id.startsWith('RB-2026-'), `Unique human-readable Order ID generated: ${createdOrder.order_id}`);
  assert(/^\d{4}$/.test(createdOrder.delivery_otp), `Secure 4-digit Delivery Handover OTP generated: ${createdOrder.delivery_otp}`);
  assert(createdOrder.status === 'Order Placed', `Initial order status is "Order Placed"`);

  // Test 7: Inventory Deduction & Audit Logging
  console.log('\nTest Group 7: Inventory Deduction & Stock Audit Logs');
  const postStock = db.prepare('SELECT stock FROM products WHERE id = ?').get(firstProd.id).stock;
  assert(postStock === initialStock - 2, `Stock deducted by exactly 2 items (${initialStock} -> ${postStock})`);
  const invLog = db.prepare('SELECT * FROM inventory_logs WHERE product_id = ? ORDER BY id DESC LIMIT 1').get(firstProd.id);
  assert(invLog && invLog.change_type === 'order_placed', 'Inventory change logged with type "order_placed"');

  // Test 8: Order Persistence in SQLite
  console.log('\nTest Group 8: Order Persistence & Re-query');
  const fetchedOrder = orderService.getOrderDetails(createdOrder.order_id);
  assert(fetchedOrder !== null, 'Order retrievable from database');
  assert(fetchedOrder.items.length === 1, `Order has ${fetchedOrder.items.length} line items saved with snapshots`);
  assert(fetchedOrder.statusHistory.length >= 1, `Status history trail initialized`);

  // Test 9: Customer Order Tracking (Secure Phone Verification)
  console.log('\nTest Group 9: Secure Customer Order Tracking');
  const trackedOrder = orderService.customerTrackOrder(createdOrder.order_id, '9876543210');
  assert(trackedOrder && trackedOrder.order_id === createdOrder.order_id, 'Customer successfully tracked own order with matching phone');
  
  let unauthorizedPhoneCaught = false;
  try {
    orderService.customerTrackOrder(createdOrder.order_id, '9111111111');
  } catch (e) {
    unauthorizedPhoneCaught = true;
  }
  assert(unauthorizedPhoneCaught, 'Order tracking prevents unauthorized access with wrong phone number');

  // Test 10: Admin Authentication
  console.log('\nTest Group 10: Admin PIN Security & JWT Issuance');
  const adminLogin = authService.loginAdminWithPin('risika2026');
  assert(adminLogin.token && adminLogin.admin.role === 'admin', 'Store Admin authenticates with valid PIN and receives JWT token');
  
  let wrongPinCaught = false;
  try {
    authService.loginAdminWithPin('wrongpin');
  } catch {
    wrongPinCaught = true;
  }
  assert(wrongPinCaught, 'Admin authentication rejects incorrect PIN');

  // Test 11: Meesho / Flipkart Seller Dashboard Metrics
  console.log('\nTest Group 11: Seller Hub Dashboard Analytics');
  const stats = orderService.getDashboardStats();
  assert(stats.totalOrders >= 1, `Dashboard reports total orders: ${stats.totalOrders}`);
  assert(stats.totalRevenue > 0, `Dashboard reports verified gross revenue: ₹${stats.totalRevenue}`);
  assert(stats.newOrders >= 1, `Dashboard reports new/placed orders: ${stats.newOrders}`);

  // Test 12: Order Status Lifecycle Transitions
  console.log('\nTest Group 12: Order Status Transitions (Packed -> Shipped)');
  const packedOrder = orderService.updateOrderStatus({
    orderId: createdOrder.order_id,
    newStatus: 'Packed',
    note: 'Bouquet hand-tied and placed in cold-chain box.',
    updatedBy: 'Floral Studio Manager'
  });
  assert(packedOrder.status === 'Packed', 'Order successfully transitioned to "Packed"');

  const shippedOrder = orderService.updateOrderStatus({
    orderId: createdOrder.order_id,
    newStatus: 'Shipped',
    note: 'Dispatched via dedicated cold-chain courier.',
    updatedBy: 'Dispatch Hub',
    courierProvider: 'Risika Express Logistics',
    trackingNumber: `TRK-${createdOrder.order_id.replace('RB-2026-', '')}`,
    trackingUrl: `#/order-tracking?orderId=${createdOrder.order_id}`
  });
  assert(shippedOrder.status === 'Shipped', 'Order transitioned to "Shipped"');
  assert(shippedOrder.tracking_number.startsWith('TRK-'), `Tracking number assigned: ${shippedOrder.tracking_number}`);

  // Test 13: Doorstep Handover Delivery OTP Verification
  console.log('\nTest Group 13: Delivery OTP Handover Verification');
  let invalidOtpCaught = false;
  try {
    orderService.verifyDeliveryOtp(createdOrder.order_id, '0000');
  } catch {
    invalidOtpCaught = true;
  }
  assert(invalidOtpCaught, 'Verification rejects incorrect OTP (0000)');

  const deliveredOrder = orderService.verifyDeliveryOtp(createdOrder.order_id, createdOrder.delivery_otp);
  assert(deliveredOrder.status === 'Delivered', `Order successfully marked "Delivered" with valid OTP (${createdOrder.delivery_otp})`);
  assert(deliveredOrder.payment_status === 'Paid', 'COD payment automatically confirmed as Paid upon delivery');

  // Test 14: Customer Registration & Login
  console.log('\nTest Group 14: Customer Authentication & Saved Addresses');
  const testEmail = `patron_${Date.now()}@example.com`;
  const regResult = authService.registerCustomer({
    name: 'Kavita Patel',
    email: testEmail,
    phone: '9822334455',
    password: 'SecurePassword2026!'
  });
  assert(regResult.user && regResult.token, 'Customer registered and token generated');

  const loginResult = authService.loginCustomer({
    email: testEmail,
    password: 'SecurePassword2026!'
  });
  assert(loginResult.user.email === testEmail, 'Customer logged in with hashed password verification');

  const savedAddr = authService.addAddress(regResult.user.id, {
    recipient_name: 'Kavita Patel',
    phone: '9822334455',
    house_no: 'B-204',
    street: 'Skyline Heights',
    landmark: 'Near City Mall',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    is_default: true
  });
  assert(savedAddr.city === 'Mumbai', 'Customer delivery address saved to database');

  // Test 15: Pincode Serviceability
  console.log('\nTest Group 15: PIN Code Serviceability & Tier Calculation');
  const ncrPin = shippingService.checkPincodeServiceability('110070');
  assert(ncrPin.serviceable && ncrPin.sameDayAvailable, 'Delhi NCR PIN 110070 verified for Same-Day delivery');
  const metroPin = shippingService.checkPincodeServiceability('400001');
  assert(metroPin.serviceable && metroPin.tier.includes('Air-Express'), 'Mumbai Metro PIN 400001 verified for Air-Express');

  // Test 16: Payment Gateway Configuration & Verification
  console.log('\nTest Group 16: Payment Gateway Sandbox & Signature');
  const payConfig = paymentService.getPaymentConfig();
  assert(payConfig.gateway === 'Razorpay', 'Payment gateway configured');
  const payOrder = await paymentService.createPaymentOrder({ orderId: createdOrder.order_id, amount: 1299 });
  assert(payOrder.success && payOrder.gatewayOrderId, `Payment order created: ${payOrder.gatewayOrderId}`);

  // Test 17: AI Recommendations & Natural Language Search
  console.log('\nTest Group 17: AI Recommendations & Natural Language Search');
  const aiRecs = aiService.getFloralRecommendations({ occasion: 'birthday', budget: 1500 });
  assert(aiRecs.recommendedProducts.length > 0, `AI recommendation engine returned ${aiRecs.recommendedProducts.length} tailored bouquets`);
  
  const searchResults = aiService.searchProductsNaturalLanguage('velvet roses under 1500');
  assert(searchResults.length > 0, `Natural language search for "velvet roses under 1500" returned ${searchResults.length} matches`);

  const faqAns = aiService.answerCustomerFaq('What is the delivery OTP?');
  assert(faqAns.answer.includes('OTP'), 'FAQ assistant accurately explains doorstep delivery OTP');

  // Test 18: CSV Export
  console.log('\nTest Group 18: Orders CSV Reporting');
  const csv = orderService.exportOrdersCsv();
  assert(csv.includes('Order ID') && csv.includes(createdOrder.order_id), 'Orders exported to valid CSV format containing order details');

  // Test 19: Manual Inventory Adjustment
  console.log('\nTest Group 19: Manual Inventory Adjustment & Audit');
  const adjResult = orderService.adjustProductInventory({
    productId: firstProd.id,
    changeAmount: 15,
    reason: 'Fresh greenhouse shipment received',
    adminName: 'Store Owner'
  });
  assert(adjResult.newStock === adjResult.previousStock + 15, `Stock restocked by 15 items (${adjResult.previousStock} -> ${adjResult.newStock})`);

  // Summary
  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runComprehensiveTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
