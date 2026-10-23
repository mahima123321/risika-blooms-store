const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/data/products.js'), 'utf8');
const regex = /image:\s*['"]([^'"]+)['"]/g;
let match;
const unique = new Set();
while ((match = regex.exec(content)) !== null) {
  unique.add(match[1]);
}

console.log('Unique images count:', unique.size);
for (const img of unique) {
  const fullPath = path.join(__dirname, '../public', img.replace(/^\//, ''));
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    console.log(`EXISTS: ${img} (${Math.round(stats.size / 1024)} KB)`);
  } else {
    console.log(`MISSING: ${img}`);
  }
}
