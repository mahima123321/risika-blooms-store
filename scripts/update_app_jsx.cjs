const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../src/App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

if (!content.includes('DeliveryOrdersModal')) {
  content = content.replace(
    "import OwnerSettingsModal from './components/owner/OwnerSettingsModal';",
    "import OwnerSettingsModal from './components/owner/OwnerSettingsModal';\nimport DeliveryOrdersModal from './components/owner/DeliveryOrdersModal';"
  );

  content = content.replace(
    "<OwnerSettingsModal />",
    "<OwnerSettingsModal />\n      <DeliveryOrdersModal />"
  );

  fs.writeFileSync(appPath, content, 'utf8');
  console.log('App.jsx updated with DeliveryOrdersModal!');
} else {
  console.log('DeliveryOrdersModal already present in App.jsx');
}
