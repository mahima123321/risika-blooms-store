const fs = require('fs');
const path = require('path');

// Fix DeliveryOrdersModal.jsx
const modalPath = path.join(__dirname, '../src/components/owner/DeliveryOrdersModal.jsx');
let modalContent = fs.readFileSync(modalPath, 'utf8');

modalContent = modalContent.replace(
  "showToast('🎉 Delivery verified! Order marked Delivered & Paid.', 'success'); else {",
  "showToast('🎉 Delivery verified! Order marked Delivered & Paid.', 'success');\n      } else {"
);

fs.writeFileSync(modalPath, modalContent, 'utf8');
console.log('Fixed DeliveryOrdersModal.jsx syntax error!');

