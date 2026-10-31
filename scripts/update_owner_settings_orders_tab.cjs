const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/owner/OwnerSettingsModal.jsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('navigateTo,') && !content.includes('navigateTo }')) {
  content = content.replace('saveFirebaseConfig\n  } = useShop();', 'saveFirebaseConfig,\n    navigateTo,\n    orders\n  } = useShop();');
}

const targetTab = `<div className="owner-settings-tabs">`;
const replacementTab = `<div className="owner-settings-tabs">
          <button
            type="button"
            className="owner-settings-tab"
            onClick={() => {
              closeOwnerSettingsModal();
              if (navigateTo) navigateTo('my-orders', { mode: 'owner' });
            }}
            style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.22) 0%, rgba(184, 134, 11, 0.22) 100%)', border: '1.5px solid #D4AF37' }}
          >
            <Truck size={15} color="#D4AF37" />
            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>🚚 Delivery Schedule & Orders ({(orders || []).length})</span>
          </button>`;

if (!content.includes('Delivery Schedule & Orders') && content.includes(targetTab)) {
  content = content.replace(targetTab, replacementTab);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('OwnerSettingsModal.jsx updated with Delivery Schedule tab!');
} else {
  console.log('Tab already present or target not found');
}

