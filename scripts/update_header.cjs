const fs = require('fs');
const path = require('path');

const headerPath = path.join(__dirname, '../src/components/common/Header.jsx');
let content = fs.readFileSync(headerPath, 'utf8');

// 1. Add Crown import if missing
if (!content.includes('Crown,')) {
  content = content.replace('Truck \n} from \'lucide-react\';', 'Truck, Crown \n} from \'lucide-react\';');
  if (!content.includes('Crown')) {
    content = content.replace('Truck', 'Truck, Crown');
  }
}

// 2. Update owner crown trigger button
const oldCrownBtnRegex = /\{\/\* Store Owner Quick Portal Trigger - Mobile & Desktop \*\/\}\s*\{isOwnerAuthenticated && \([\s\S]*?<\/button>\s*\)\}/;

const newCrownBtn = `{/* Store Owner Quick Portal Trigger - Mobile & Desktop */}
            <button 
              type="button" 
              id="owner-active-btn"
              className={\`action-icon-btn owner-crown-btn \${isOwnerAuthenticated ? 'owner-active' : ''}\`}
              onClick={() => {
                if (isOwnerAuthenticated) {
                  openOwnerSettingsModal('numbers');
                } else {
                  openOwnerLogin();
                }
              }}
              title={isOwnerAuthenticated ? "👑 Store Owner Mode Active: Tap for Settings & Dispatch" : "👑 Store Owner Hub Login"}
              aria-label="Owner Studio"
              style={{
                border: isOwnerAuthenticated ? '1.5px solid #D4AF37' : '1px solid var(--border-subtle)',
                background: isOwnerAuthenticated ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                color: '#D4AF37',
                position: 'relative'
              }}
            >
              <Crown size={18} color="#D4AF37" />
              {isOwnerAuthenticated && <span className="owner-crown-pulse-dot" />}
            </button>`;

if (oldCrownBtnRegex.test(content)) {
  content = content.replace(oldCrownBtnRegex, newCrownBtn);
  console.log('Replaced old crown button with permanent accessible crown button!');
} else {
  console.log('Could not match old crown button regex, checking alternative');
}

// 3. Update mobile menu drawer owner section
const drawerOwnerRegex = /\{isOwnerAuthenticated \? \([\s\S]*?Exit Owner Mode<\/span>\s*<\/button>\s*<\/div>\s*<\/div>\s*\) : null\}/;

const newDrawerOwnerSection = `{isOwnerAuthenticated ? (
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(212, 175, 55, 0.08)',
                  border: '1.5px solid rgba(212, 175, 55, 0.3)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Crown size={16} color="#D4AF37" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Store Owner Hub
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>● Active</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.45rem' }}>
                    <button
                      type="button"
                      className="btn btn-gold btn-sm"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigateTo('my-orders', { mode: 'owner' });
                      }}
                      style={{ justifyContent: 'center', fontSize: '0.84rem', fontWeight: 800, background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)', color: '#000000' }}
                    >
                      <Truck size={15} style={{ marginRight: '6px' }} />
                      <span>🚚 Delivery Schedule & Orders</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openAddProductModal();
                      }}
                      style={{ justifyContent: 'center', fontSize: '0.82rem', background: 'var(--bg-surface)' }}
                    >
                      <span>+ Add New Bouquet</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openOwnerSettingsModal('categories');
                      }}
                      style={{ justifyContent: 'center', fontSize: '0.8rem', background: 'var(--bg-surface)' }}
                    >
                      <span>📁 Manage Categories</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openOwnerSettingsModal('catalog');
                      }}
                      style={{ justifyContent: 'center', fontSize: '0.8rem', background: 'var(--bg-surface)' }}
                    >
                      <span>💐 Bouquet Catalog ({products?.length || 0})</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openOwnerSettingsModal('payment');
                      }}
                      style={{ justifyContent: 'center', fontSize: '0.8rem', background: 'var(--bg-surface)' }}
                    >
                      <span>💳 Payment QR & Scanner Settings</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openOwnerSettingsModal('numbers');
                      }}
                      style={{ justifyContent: 'center', fontSize: '0.8rem', background: 'var(--bg-surface)' }}
                    >
                      <span>⚙️ Boutique & WhatsApp Settings</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logoutOwner();
                      }}
                      style={{ justifyContent: 'center', fontSize: '0.78rem', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                    >
                      <span>Exit Owner Mode</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(212, 175, 55, 0.08)',
                  border: '1.5px dashed rgba(212, 175, 55, 0.4)',
                  textAlign: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '0.35rem' }}>
                    <Crown size={16} color="#D4AF37" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Store Owner & Dispatch Hub
                    </span>
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.35 }}>
                    Are you the store owner? Enter your PIN to view delivery schedules, incoming orders & customer contacts on this phone.
                  </p>
                  <button
                    type="button"
                    className="btn btn-gold btn-sm"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openOwnerLogin();
                    }}
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 800 }}
                  >
                    👑 Store Owner Login (PIN: risika2026)
                  </button>
                </div>
              )}`;

if (drawerOwnerRegex.test(content)) {
  content = content.replace(drawerOwnerRegex, newDrawerOwnerSection);
  console.log('Replaced mobile drawer owner section!');
} else {
  console.log('Could not match drawerOwnerRegex');
}

fs.writeFileSync(headerPath, content, 'utf8');
console.log('Header.jsx updated successfully!');

