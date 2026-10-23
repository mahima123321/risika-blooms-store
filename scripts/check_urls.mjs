import fs from 'fs';

const content = fs.readFileSync('src/data/products.js', 'utf8');
const unsplash = content.match(/https:\/\/[^'"]+/g) || [];
console.log('Found URLs count:', unsplash.length);
console.log('Sample URLs:', unsplash.slice(0, 5));
