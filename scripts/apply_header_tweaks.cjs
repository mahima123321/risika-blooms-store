const fs = require('fs');
const path = require('path');

console.log('--- Applying Precise Header & CSS Tweaks ---');

// 1. Fix Header.jsx Search Button on mobile
const headerPath = path.join(__dirname, '../src/components/common/Header.jsx');
let headerContent = fs.readFileSync(headerPath, 'utf8');

// Match search button regardless of \r\n or \n
headerContent = headerContent.replace(
  /className="action-icon-btn"(\s+)onClick=\{\(\) => setIsSearchOpen\(true\)\}/g,
  'className="action-icon-btn desktop-only"$1onClick={() => setIsSearchOpen(true)}'
);

fs.writeFileSync(headerPath, headerContent, 'utf8');
console.log('✓ Header.jsx: search button made desktop-only! Search in Header desktop-only verified:', headerContent.includes('className="action-icon-btn desktop-only"\r\n              onClick={() => setIsSearchOpen(true)}') || headerContent.includes('className="action-icon-btn desktop-only"\n              onClick={() => setIsSearchOpen(true)}'));

// 2. Fix App.css Mobile Rules to ensure RISHIKA BLOOMS is completely visible and never truncated
const cssPath = path.join(__dirname, '../src/App.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

// Remove any lingering text-overflow: ellipsis or overflow: hidden on .brand-logo-link or .brand-name on mobile
cssContent = cssContent.replace(
  /\.brand-name\s*\{\s*font-size:\s*0\.95rem\s*!important;\s*letter-spacing:\s*0\.03em\s*!important;\s*white-space:\s*nowrap\s*!important;\s*overflow:\s*hidden\s*!important;\s*text-overflow:\s*ellipsis\s*!important;\s*\}/g,
  `.brand-name {
    font-size: 1.05rem !important;
    font-weight: 800 !important;
    letter-spacing: 0.04em !important;
    white-space: nowrap !important;
    overflow: visible !important;
    text-overflow: clip !important;
    display: block !important;
  }`
);

// Append the definitive master mobile header styling at the end of App.css
const masterMobileHeaderStyle = `
/* =========================================================================
   DEFINITIVE MOBILE HEADER BRAND TITLE & SPACING GUARANTEE
   ========================================================================= */
@media (max-width: 768px) {
  .header-main .container,
  .header-main {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }
  .brand-logo-link {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    max-width: none !important;
    overflow: visible !important;
    display: flex !important;
    align-items: center !important;
    gap: 0.45rem !important;
  }
  .luxury-crest-wrapper {
    width: 34px !important;
    height: 34px !important;
    flex-shrink: 0 !important;
  }
  .brand-logo-text {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    overflow: visible !important;
  }
  .brand-name,
  .luxury-brand-title {
    font-size: 1.1rem !important;
    font-weight: 800 !important;
    letter-spacing: 0.04em !important;
    white-space: nowrap !important;
    overflow: visible !important;
    text-overflow: clip !important;
    display: block !important;
    color: var(--text-primary) !important;
    line-height: 1.15 !important;
  }
  .brand-tagline,
  .luxury-brand-sub {
    font-size: 0.52rem !important;
    letter-spacing: 0.12em !important;
    white-space: nowrap !important;
    display: block !important;
    opacity: 0.85 !important;
  }
  .header-actions {
    display: flex !important;
    align-items: center !important;
    gap: 0.35rem !important;
    flex-shrink: 0 !important;
  }
  .desktop-only {
    display: none !important;
  }
}
`;

if (!cssContent.includes('DEFINITIVE MOBILE HEADER BRAND TITLE & SPACING GUARANTEE')) {
  cssContent += masterMobileHeaderStyle;
}
fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log('✓ App.css: Definitive mobile header branding styles added!');
