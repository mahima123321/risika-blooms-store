async function verifyCatalog() {
  const { PRODUCTS } = await import("../src/data/products.js");
  const { CATEGORIES } = await import("../src/data/categories.js");
  const { FLORAL_STEMS } = await import("../src/data/builderData.js");

  console.log("=== CATALOG UNIQUENESS AUDIT ===");

  // 1. Check Product Main Images
  const productImages = PRODUCTS.map(p => p.image);
  const uniqueProductImages = new Set(productImages);
  console.log(`Total Products: ${PRODUCTS.length}`);
  console.log(`Unique Product Images: ${uniqueProductImages.size}`);

  if (productImages.length !== uniqueProductImages.size) {
    console.error("❌ ERROR: Duplicate product main images detected!");
    const counts = {};
    productImages.forEach(img => counts[img] = (counts[img] || 0) + 1);
    Object.entries(counts).filter(([_, c]) => c > 1).forEach(([img, c]) => {
      console.log(`  - Duplicate (${c}x): ${img}`);
    });
  } else {
    console.log("✅ ALL 25 PRODUCTS HAVE 100% UNIQUE DISTINCT IMAGES!");
  }

  // 2. Check Categories
  const categoryImages = CATEGORIES.flatMap(c => [c.image, c.bannerImage]);
  const uniqueCategoryImages = new Set(categoryImages);
  console.log(`\nTotal Category Images (Cards + Banners): ${categoryImages.length}`);
  console.log(`Unique Category Images: ${uniqueCategoryImages.size}`);

  // 3. Print all products with their distinct images
  console.log("\n--- Full Product List & Distinct Images ---");
  PRODUCTS.forEach((p, idx) => {
    console.log(`${idx + 1}. [${p.id}] ${p.name}`);
    console.log(`   📸 Image: ${p.image}`);
  });
}

verifyCatalog();
