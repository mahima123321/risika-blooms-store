const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('--- PREPARING FINAL UPLOAD FOLDERS ON DESKTOP & ATTACHMENT2 ---');

const srcDist = path.join(__dirname, '../dist');
if (!fs.existsSync(srcDist)) {
  console.error('Error: dist folder not found.');
  process.exit(1);
}

const targetLocations = [
  'C:\\Users\\hp\\Desktop\\RISHIKA_BLOOMS_FINAL_WEBSITE_UPLOAD_FOLDER',
  'C:\\Users\\hp\\OneDrive\\attachment2\\RISHIKA_BLOOMS_FINAL_WEBSITE_UPLOAD_FOLDER'
];

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
  fs.writeFileSync(path.join(targetDir, '_redirects'), '/*    /index.html   200\n', 'utf8');
  fs.writeFileSync(path.join(targetDir, 'google0a1d6ac80fdcdb11.html'), 'google-site-verification: google0a1d6ac80fdcdb11.html', 'utf8');

  const htaccess = `RewriteEngine On
RewriteBase /
RewriteRule ^index\\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
`;
  fs.writeFileSync(path.join(targetDir, '.htaccess'), htaccess, 'utf8');

  const vercelJson = JSON.stringify({
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }, null, 2);
  fs.writeFileSync(path.join(targetDir, 'vercel.json'), vercelJson, 'utf8');

  const readmeText = `=====================================================
RISHIKA BLOOMS — FINAL WEBSITE READY TO UPLOAD
=====================================================

इस फ़ोल्डर में आपकी वेबसाइट की सभी फ़ाइलें पूरी तरह तैयार हैं:
- index.html (मुख्य पेज)
- assets/ (डिज़ाइन और कोड)
- images/ (सभी HD बुके फोटोज़)
- .htaccess (सर्वर रूटिंग ताकि 404 एरर न आए)
- _redirects (Netlify / Cloudflare के लिए)
- UPLOAD_THIS_ZIP_FILE.zip (अगर ज़िप फ़ाइल मांगता है तो इसे अपलोड करें)

-----------------------------------------------------
वेबसाइट को ऑनलाइन कैसे डालें (How to Upload):
-----------------------------------------------------

विकल्प A: Netlify पर (सिर्फ 30 सेकंड में):
1. अपने ब्राउज़र में खोलें: https://app.netlify.com/drop
2. इस फ़ोल्डर को (या "UPLOAD_THIS_ZIP_FILE.zip" को) खींचकर (Drag & Drop) वहाँ छोड़ दें।
3. तुरंत आपको लाइव वेबसाइट लिंक मिल जाएगा!

विकल्प B: Hostinger / cPanel / GoDaddy पर:
1. अपनी होस्टिंग के File Manager में जाएँ।
2. "public_html" फ़ोल्डर खोलें।
3. वहाँ "UPLOAD_THIS_ZIP_FILE.zip" को Upload करके "Extract" कर दें।

विकल्प C: Vercel पर:
1. https://vercel.com/dashboard खोलें।
2. "Add New Project" में जाकर इस प्रोजेक्ट को डिप्लॉय कर दें।
=====================================================
`;
  fs.writeFileSync(path.join(targetDir, 'HOW_TO_UPLOAD_INSTRUCTIONS.txt'), readmeText, 'utf8');
}

for (const loc of targetLocations) {
  console.log(`Copying files to: ${loc}...`);
  copyDirRecursive(srcDist, loc);
  ensureSpecialFiles(loc);

  const existingZip = path.join(loc, 'UPLOAD_THIS_ZIP_FILE.zip');
  if (fs.existsSync(existingZip)) fs.unlinkSync(existingZip);

  // Copy master zip from parent dir or create it
  const masterZip = 'C:\\Users\\hp\\OneDrive\\attachment2\\WEBSITE_READY_TO_UPLOAD_ANYWHERE.zip';
  if (fs.existsSync(masterZip)) {
    fs.copyFileSync(masterZip, existingZip);
    console.log(`✓ Copied master zip to ${existingZip}`);
  } else {
    execSync(`powershell -Command "Compress-Archive -Path '${loc}\\*' -DestinationPath '${existingZip}' -Force"`, { stdio: 'inherit' });
    console.log(`✓ Generated zip in ${loc}`);
  }
}

console.log('--- ALL FINAL UPLOAD FOLDERS AND ZIPS READY ON DESKTOP & ATTACHMENT2 ---');
