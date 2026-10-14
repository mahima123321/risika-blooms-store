async function list() {
  const { PRODUCTS } = await import("../src/data/products.js");
  console.log("Total Products:", PRODUCTS.length);
  PRODUCTS.forEach((p, idx) => {
    console.log(`${idx + 1}. [${p.id}] [${p.category}] ${p.name}`);
    console.log(`   Image: ${p.image}`);
    console.log(`   Images: ${(p.images || []).join(" | ")}`);
    console.log(`   Colors: ${(p.colorOptions || []).map(c => `${c.name}: ${c.image}`).join(" | ")}`);
  });
}
list();
