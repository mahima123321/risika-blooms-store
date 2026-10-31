const fs = require('fs');
const path = require('path');

console.log('--- BLOCKING GOOGLE SEARCH INDEXING UNTIL FINAL LAUNCH ---');

// 1. Update index.html with noindex, nofollow, noarchive
const indexHtmlPath = path.join(__dirname, '../index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// Replace robots meta tag with complete noindex
indexHtml = indexHtml.replace(
  /<meta name="robots" content="[^"]*"\s*\/>/,
  `<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />\n    <meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />`
);

// Also clean up title spelling from "Rishhika" to "Rishika"
indexHtml = indexHtml.replace(/Rishhika Bloom/g, 'Rishika Blooms');

fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
console.log('✓ Updated index.html with strict NOINDEX / NOFOLLOW meta tags and correct spelling');

// 2. Update public/robots.txt to block all crawlers
const robotsTxtPath = path.join(__dirname, '../public/robots.txt');
const strictRobotsTxt = `# Block all search engines from indexing this site until final launch
User-agent: *
Disallow: /

User-agent: Googlebot
Disallow: /

User-agent: Bingbot
Disallow: /
`;
fs.writeFileSync(robotsTxtPath, strictRobotsTxt, 'utf8');
console.log('✓ Updated public/robots.txt with Disallow: / for all crawlers');

console.log('--- GOOGLE DE-INDEXING CONFIGURATION READY ---');

