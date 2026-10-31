const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '../src/components/common/Header.jsx');
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/openQrModal([\r\n\s]+)\} = useShop\(\);/, 'openQrModal,$1  openWriteReviewModal$1} = useShop();');

const targetStr = `📞 Contact Customer Concierge\r\n                </button>`;
const targetStrLF = `📞 Contact Customer Concierge\n                </button>`;

const additionCR = `\r\n                <button type="button" className="mobile-drawer-link-subtle" onClick={() => { setIsMobileMenuOpen(false); openWriteReviewModal(); }} style={{ color: "#D4AF37", fontWeight: 700 }}>\r\n                  📸 Write Feedback & Photo Review (Camera)\r\n                </button>`;
const additionLF = `\n                <button type="button" className="mobile-drawer-link-subtle" onClick={() => { setIsMobileMenuOpen(false); openWriteReviewModal(); }} style={{ color: "#D4AF37", fontWeight: 700 }}>\n                  📸 Write Feedback & Photo Review (Camera)\n                </button>`;

if (c.includes(targetStr)) {
  c = c.replace(targetStr, targetStr + additionCR);
} else if (c.includes(targetStrLF)) {
  c = c.replace(targetStrLF, targetStrLF + additionLF);
}

fs.writeFileSync(p, c, 'utf8');
console.log('Header drawer updated successfully! Present:', c.includes('Write Feedback & Photo Review'));
