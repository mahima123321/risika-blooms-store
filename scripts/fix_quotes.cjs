const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/pages/MyOrdersPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  ": 'Enter customer's 4-digit code. Order will be marked Delivered & Paid automatically:'",
  ': "Enter customer\'s 4-digit code. Order will be marked Delivered & Paid automatically:"'
);

content = content.replace(
  "Send OTP to Customer's Phone",
  'Send OTP to Customer Phone'
);

content = content.replace(
  ": 'Enter customer's code.",
  ': "Enter customer\'s code."'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed quotes in MyOrdersPage.jsx');
