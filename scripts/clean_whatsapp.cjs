const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/config/whatsapp.js');
let content = fs.readFileSync(filePath, 'utf8');

const badSuffix = `Delivered!*\\nYour bouquet has been handed over successfully. Thank you for choosing Rishika Blooms! 🌸✨\`;\n}`;
content = content.replace(badSuffix, '');
content = content.replace(/Delivered!\*\\n[\s\S]*?\}/g, '');
// Ensure file ends with `return msg;\n}`
const idx = content.lastIndexOf('return msg;');
if (idx !== -1) {
  content = content.slice(0, idx) + 'return msg;\n}\n';
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ whatsapp.js cleaned perfectly!');

