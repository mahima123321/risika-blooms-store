const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../src/App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

content = content.replace(
  /case 'wishlist':\s*return <CartDrawer \/>\s*<WishlistPage \/>;/,
  "case 'wishlist':\n        return <WishlistPage />;"
);

fs.writeFileSync(appPath, content, 'utf8');
console.log('✓ Fixed wishlist route in App.jsx');

