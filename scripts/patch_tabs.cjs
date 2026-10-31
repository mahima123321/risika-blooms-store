const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/owner/OwnerSettingsModal.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldBlock = `          <button
            type="button"
            className={\`owner-settings-tab \${activeTab === 'numbers' ? 'active' : ''}\`}
            onClick={() => setActiveTab('numbers')}
          >
            <MessageCircle size={15} />
            <span>Phone & WhatsApp</span>
          </button>`;

const newBlock = `          <button
            type="button"
            className={\`owner-settings-tab \${activeTab === 'numbers' ? 'active' : ''}\`}
            onClick={() => setActiveTab('numbers')}
          >
            <User size={15} color="#D4AF37" />
            <span>Owner Profile & Phone</span>
          </button>

          <button
            type="button"
            className={\`owner-settings-tab \${activeTab === 'payment' ? 'active' : ''}\`}
            onClick={() => setActiveTab('payment')}
          >
            <QrCode size={15} color="#2874F0" />
            <span>Payment Scanner & UPI</span>
          </button>`;

if (content.includes('<span>Phone & WhatsApp</span>')) {
  // normalize CRLF
  content = content.replace(/\r\n/g, '\n');
  content = content.replace(oldBlock.replace(/\r\n/g, '\n'), newBlock.replace(/\r\n/g, '\n'));
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Replaced Phone & WhatsApp tab with Owner Profile & Phone + Payment Scanner & UPI tabs');
} else {
  console.log('Already replaced or not found');
}

