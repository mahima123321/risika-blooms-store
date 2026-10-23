import { INITIAL_PRODUCTS } from '../src/data/products.js';

console.log('Total Products:', INITIAL_PRODUCTS.length);
const byCategory = {};
for (const p of INITIAL_PRODUCTS) {
  if (!byCategory[p.category]) byCategory[p.category] = [];
  byCategory[p.category].push({
    id: p.id,
    name: p.name,
    image: p.image
  });
}

for (const [cat, prods] of Object.entries(byCategory)) {
  console.log(`\nCategory: ${cat} (${prods.length} products)`);
  for (const p of prods) {
    console.log(`  - [${p.id}] ${p.name.slice(0, 45)} => ${p.image}`);
  }
}
