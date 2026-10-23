const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const netlifyDir = path.join(rootDir, 'FINAL_WEBSITE_FOR_NETLIFY');

console.log('Copying dist files to FINAL_WEBSITE_FOR_NETLIFY...');

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

// 1. Copy dist to FINAL_WEBSITE_FOR_NETLIFY
copyDirRecursive(distDir, netlifyDir);

// 2. Ensure _redirects and google verification file exist in FINAL_WEBSITE_FOR_NETLIFY
const redirectsFile = path.join(netlifyDir, '_redirects');
fs.writeFileSync(redirectsFile, '/*    /index.html   200\n', 'utf8');

const googleVerify = path.join(netlifyDir, 'google0a1d6ac80fdcdb11.html');
if (!fs.existsSync(googleVerify)) {
  fs.writeFileSync(googleVerify, 'google-site-verification: google0a1d6ac80fdcdb11.html', 'utf8');
}

console.log('Production folder synced successfully!');

// 3. Create zip packages using PowerShell Compress-Archive
console.log('Creating zip packages for deployment...');
try {
  const zip1 = path.join(rootDir, 'FINAL_WEBSITE_FOR_NETLIFY.zip');
  const zip2 = path.join(rootDir, 'RISHIKA_BLOOMS_LIVE_DEPLOY.zip');
  
  if (fs.existsSync(zip1)) fs.unlinkSync(zip1);
  if (fs.existsSync(zip2)) fs.unlinkSync(zip2);

  execSync(`powershell -Command "Compress-Archive -Path '${netlifyDir}\\*' -DestinationPath '${zip1}' -Force"`, { stdio: 'inherit' });
  execSync(`powershell -Command "Copy-Item -Path '${zip1}' -Destination '${zip2}' -Force"`, { stdio: 'inherit' });

  console.log('Zip packages created successfully:');
  console.log(' - ' + zip1);
  console.log(' - ' + zip2);
} catch (err) {
  console.error('Error creating zip packages:', err);
}
