const fs = require('fs');
const path = require('path');

console.log('=== UPDATING "ADD TO BAG" TO PROFESSIONAL "ADD TO CART" ===');

// 1. UPDATE PRODUCTDETAILPAGE.JSX
const pdpPath = path.join(__dirname, '../src/pages/ProductDetailPage.jsx');
let pdp = fs.readFileSync(pdpPath, 'utf8');

// Add ShoppingCart import
pdp = pdp.replace(
  'ShoppingBag, Zap',
  'ShoppingCart, ShoppingBag, Zap'
);

// Replace Add to Bag with Add to Cart + ShoppingCart icon
pdp = pdp.replace(
  `<ShoppingBag size={18} />\r\n                <span>Add to Bag</span>`,
  `<ShoppingCart size={18} />\r\n                <span>Add to Cart</span>`
);
pdp = pdp.replace(
  `<ShoppingBag size={18} />\n                <span>Add to Bag</span>`,
  `<ShoppingCart size={18} />\n                <span>Add to Cart</span>`
);

pdp = pdp.replace(
  `<ShoppingBag size={18} />\r\n                  <span>Add to Bag</span>`,
  `<ShoppingCart size={18} />\r\n                  <span>Add to Cart</span>`
);
pdp = pdp.replace(
  `<ShoppingBag size={18} />\n                  <span>Add to Bag</span>`,
  `<ShoppingCart size={18} />\n                  <span>Add to Cart</span>`
);

// Mobile sticky bar
pdp = pdp.replace(
  `<ShoppingBag size={15} />\r\n            <span>Add to Bag</span>`,
  `<ShoppingCart size={15} />\r\n            <span>Add to Cart</span>`
);
pdp = pdp.replace(
  `<ShoppingBag size={15} />\n            <span>Add to Bag</span>`,
  `<ShoppingCart size={15} />\n            <span>Add to Cart</span>`
);

// Any remaining "Add to Bag"
pdp = pdp.replace(/<span>Add to Bag<\/span>/g, '<span>Add to Cart</span>');
pdp = pdp.replace(/title="Add to Shopping Bag"/g, 'title="Add to Shopping Cart"');

fs.writeFileSync(pdpPath, pdp, 'utf8');
console.log('✓ ProductDetailPage.jsx updated to "Add to Cart"!');

// 2. UPDATE MOBILEBOTTOMNAV.JSX
const navPath = path.join(__dirname, '../src/components/common/MobileBottomNav.jsx');
let nav = fs.readFileSync(navPath, 'utf8');

nav = nav.replace('ShoppingBag,', 'ShoppingCart,');
nav = nav.replace('<ShoppingBag size={20} />', '<ShoppingCart size={20} />');
nav = nav.replace('<span>Bag</span>', '<span>Cart</span>');

fs.writeFileSync(navPath, nav, 'utf8');
console.log('✓ MobileBottomNav.jsx updated to "Cart" with ShoppingCart icon!');

// 3. UPDATE HEADER.JSX
const headerPath = path.join(__dirname, '../src/components/common/Header.jsx');
let header = fs.readFileSync(headerPath, 'utf8');

header = header.replace('ShoppingBag,', 'ShoppingCart, ShoppingBag,');
header = header.replace(/<ShoppingBag size=\{18\} \/>/g, '<ShoppingCart size={18} />');
header = header.replace(/title="Shopping Bag"/g, 'title="Shopping Cart"');
header = header.replace(/aria-label="Shopping Bag"/g, 'aria-label="Shopping Cart"');

fs.writeFileSync(headerPath, header, 'utf8');
console.log('✓ Header.jsx updated to ShoppingCart icon and Cart label!');

// 4. UPDATE WISHLISTPAGE.JSX
const wishlistPath = path.join(__dirname, '../src/pages/WishlistPage.jsx');
if (fs.existsSync(wishlistPath)) {
  let wl = fs.readFileSync(wishlistPath, 'utf8');
  wl = wl.replace('ShoppingBag,', 'ShoppingCart, ShoppingBag,');
  wl = wl.replace(/<span>Move to Bag<\/span>/g, '<span>Move to Cart</span>');
  wl = wl.replace(/<ShoppingBag size=\{14\} \/>/g, '<ShoppingCart size={14} />');
  fs.writeFileSync(wishlistPath, wl, 'utf8');
  console.log('✓ WishlistPage.jsx updated to "Move to Cart"!');
}

// 5. UPDATE CARTPAGE.JSX & BRAND.JS
const cartPagePath = path.join(__dirname, '../src/pages/CartPage.jsx');
if (fs.existsSync(cartPagePath)) {
  let cp = fs.readFileSync(cartPagePath, 'utf8');
  cp = cp.replace(/Your Shopping Bag is Empty/g, 'Your Shopping Cart is Empty');
  cp = cp.replace(/Shopping Bag & Order Summary/g, 'Shopping Cart & Order Summary');
  fs.writeFileSync(cartPagePath, cp, 'utf8');
  console.log('✓ CartPage.jsx updated to "Shopping Cart"!');
}

const brandPath = path.join(__dirname, '../src/config/brand.js');
if (fs.existsSync(brandPath)) {
  let b = fs.readFileSync(brandPath, 'utf8');
  b = b.replace('cartTitle: "Your Shopping Bag"', 'cartTitle: "Your Shopping Cart"');
  fs.writeFileSync(brandPath, b, 'utf8');
  console.log('✓ brand.js updated!');
}

console.log('=== ALL BUTTONS SUCCESSFULLY UPDATED TO FLIPKART & AMAZON STYLE "ADD TO CART" ===');
