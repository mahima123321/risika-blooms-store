const fs = require("fs");
const path = require("path");

function checkImages() {
  const files = [
    "src/data/products.js",
    "src/data/categories.js",
    "src/data/builderData.js"
  ];
  const urlRegex = /(https:\/\/[^"'\`\s,]+|\/images\/[^"'\`\s,]+)/g;
  const counts = {};
  const locations = {};

  files.forEach(f => {
    const fullPath = path.resolve(f);
    if (fs.existsSync(fullPath)) {
      const lines = fs.readFileSync(fullPath, "utf8").split("\n");
      lines.forEach((line, idx) => {
        const matches = line.match(urlRegex) || [];
        matches.forEach(m => {
          const clean = m.replace(/['",`]$/, "");
          counts[clean] = (counts[clean] || 0) + 1;
          if (!locations[clean]) locations[clean] = [];
          locations[clean].push(`${f}:${idx + 1}`);
        });
      });
    }
  });

  console.log("Total unique URLs found:", Object.keys(counts).length);
  const duplicates = Object.entries(counts).filter(([url, count]) => count > 1);
  console.log("Duplicate URLs count:", duplicates.length);
  duplicates.forEach(([url, count]) => {
    console.log(`\nDuplicate (${count}x): ${url}`);
    locations[url].forEach(loc => console.log("  - " + loc));
  });
}

checkImages();
