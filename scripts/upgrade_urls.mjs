import fs from 'fs';

function upgradeFile(filePath, width = 1600, quality = 95) {
  let content = fs.readFileSync(filePath, 'utf8');
  let count = 0;
  
  // Replace w=800, w=400, w=300 and q=80 with high definition retina params
  const updated = content.replace(/https:\/\/images\.unsplash\.com\/([^'"\s]+)/g, (match, p1) => {
    count++;
    // Strip existing w and q params and replace with ultra-clear params
    const base = match.split('?')[0];
    return `${base}?auto=format&fit=crop&w=${width}&q=${quality}`;
  });

  if (content !== updated) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`Updated ${count} URLs in ${filePath}`);
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

upgradeFile('src/data/products.js', 1600, 95);
upgradeFile('src/data/categories.js', 1600, 95);
upgradeFile('src/data/builderData.js', 1200, 95);
