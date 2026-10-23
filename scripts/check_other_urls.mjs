import fs from 'fs';

for (const file of ['src/data/categories.js', 'src/data/builderData.js']) {
  const content = fs.readFileSync(file, 'utf8');
  const urls = content.match(/https:\/\/[^'"]+/g) || [];
  console.log(`${file}: ${urls.length} URLs`);
  if (urls.length > 0) console.log(urls.slice(0, 3));
}
