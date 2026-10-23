const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const currentDir = path.resolve(__dirname, '..');
const distDir = path.join(currentDir, 'dist');
const parentDir = path.resolve(currentDir, '..');

console.log('Source dist directory:', distDir);

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function ensureSpecialFiles(targetDir) {
  // 1. _redirects for Netlify / Cloudflare Pages SPA routing
  fs.writeFileSync(path.join(targetDir, '_redirects'), '/*    /index.html   200\n', 'utf8');
  
  // 2. Google verification
  const googleHtml = path.join(targetDir, 'google0a1d6ac80fdcdb11.html');
  fs.writeFileSync(googleHtml, 'google-site-verification: google0a1d6ac80fdcdb11.html', 'utf8');

  // 3. .htaccess for Apache / Hostinger / cPanel / Shared Hosting
  const htaccess = `RewriteEngine On
RewriteBase /
RewriteRule ^index\\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
`;
  fs.writeFileSync(path.join(targetDir, '.htaccess'), htaccess, 'utf8');

  // 4. vercel.json for Vercel deployment
  const vercelJson = JSON.stringify({
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }, null, 2);
  fs.writeFileSync(path.join(targetDir, 'vercel.json'), vercelJson, 'utf8');
}

// Target folders to sync
const targetFolders = [
  path.join(parentDir, 'WEBSITE_READY_TO_UPLOAD_ANYWHERE'),
  path.join(parentDir, 'public_html'),
  path.join(currentDir, 'WEBSITE_READY_TO_UPLOAD_ANYWHERE'),
  path.join(currentDir, 'public_html'),
  path.join(currentDir, 'PURI_WEBSITE_READY_TO_UPLOAD'),
  path.join(currentDir, 'ONLINE_WEBSITE_UPLOAD_PASTE_KARO'),
  path.join(parentDir, 'rishika-blooms-final-website'),
  path.join(parentDir, 'RISHIKA_WEBSITE_UPDATED'),
  path.join(currentDir, 'FINAL_WEBSITE_FOR_NETLIFY')
];

for (const folder of targetFolders) {
  console.log('Syncing to:', folder);
  try {
    copyDirRecursive(distDir, folder);
    ensureSpecialFiles(folder);
    console.log('  -> Success');
  } catch (err) {
    console.error('  -> Failed:', err.message);
  }
}

// Master Zip generation
console.log('Creating universal deployment zip archives...');

const primaryFolder = path.join(parentDir, 'WEBSITE_READY_TO_UPLOAD_ANYWHERE');
const mainZip = path.join(parentDir, 'WEBSITE_READY_TO_UPLOAD_ANYWHERE.zip');

if (fs.existsSync(mainZip)) fs.unlinkSync(mainZip);

execSync(`powershell -Command "Compress-Archive -Path '${primaryFolder}\\*' -DestinationPath '${mainZip}' -Force"`, { stdio: 'inherit' });
console.log('Master universal zip created:', mainZip);

const zipTargets = [
  path.join(currentDir, 'WEBSITE_READY_TO_UPLOAD_ANYWHERE.zip'),
  path.join(parentDir, 'public_html.zip'),
  path.join(currentDir, 'public_html.zip'),
  path.join(currentDir, 'FINAL_WEBSITE_FOR_NETLIFY.zip'),
  path.join(parentDir, 'RISHIKA_BLOOMS_FINAL_WEBSITE.zip')
];

for (let destZip of zipTargets) {
  try {
    fs.copyFileSync(mainZip, destZip);
    console.log('Copied zip to:', destZip);
  } catch (e) {
    console.error('Failed copying zip to:', destZip, e.message);
  }
}

console.log('ALL UNIVERSAL WEBSITE FOLDERS AND ZIPS SYNCHRONIZED SUCCESSFULLY!');
